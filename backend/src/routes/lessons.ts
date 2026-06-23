import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { parseOr400 } from '../middleware/validate.js';
import { serializeExercise, serializeLesson, type ExerciseRow } from '../lib/serialize.js';
import { getProfile } from '../lib/profile.js';
import { addXp, streakMultiplier } from '../services/xpService.js';
import { registerStreakActivity } from '../services/streakService.js';
import { checkAchievements } from '../services/achievementService.js';
import { now } from '../lib/dates.js';
import { XP_SYSTEM } from '../../../shared/types.js';
import type { CompleteLessonResponse, Lesson } from '../../../shared/types.js';

const completeSchema = z.object({
  stars: z.number().int().min(0).max(3),
  xp_earned: z.number().int().min(0).optional(),
  mistakes: z.number().int().min(0),
  time_seconds: z.number().int().min(0),
  max_combo: z.number().int().min(0).optional(),
});

const lessonRoutes: FastifyPluginAsync = async (app) => {
  app.get('/:id', { preHandler: authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);
    if (!lesson) return reply.code(404).send({ error: 'not_found', message: 'Lição não encontrada', statusCode: 404 });
    const age =
      (db.prepare('SELECT age_group FROM user_profiles WHERE user_id = ?').get(req.userId) as
        | { age_group: string }
        | undefined)?.age_group ?? 'adult';
    const exercises = (
      db
        .prepare(`SELECT * FROM exercises WHERE lesson_id = ? AND age_group IN (?, 'all') ORDER BY order_index ASC`)
        .all(id, age) as ExerciseRow[]
    ).map(serializeExercise);
    return { ...serializeLesson(lesson), exercises };
  });

  app.post('/:id/start', { preHandler: authenticate }, async (req) => {
    return { started_at: now() };
  });

  app.post('/:id/complete', { preHandler: authenticate }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = parseOr400(completeSchema, req.body, reply);
    if (!body) return;

    const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id) as Lesson | undefined;
    if (!lesson) return reply.code(404).send({ error: 'not_found', message: 'Lição não encontrada', statusCode: 404 });

    const prev = db
      .prepare('SELECT * FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?')
      .get(req.userId, id) as { completed: number; xp_earned: number; stars: number } | undefined;
    const firstTime = !prev || !prev.completed;
    const perfect = body.mistakes === 0;

    // Streak primeiro (pode elevar o multiplicador).
    const streak = registerStreakActivity(req.userId);
    const multiplier = streakMultiplier(streak.streak_current);

    // XP autoritativo (servidor).
    let lessonXp: number;
    if (firstTime) {
      let raw = perfect ? XP_SYSTEM.perfect_lesson : lesson.xp_reward;
      if (lesson.xp_reward > XP_SYSTEM.base_lesson && perfect) raw = lesson.xp_reward * 2;
      raw += XP_SYSTEM.first_time_bonus;
      lessonXp = Math.round(raw * multiplier);
    } else {
      lessonXp = Math.round(XP_SYSTEM.base_lesson * 0.5 * multiplier); // replay: XP reduzido
    }

    // Persiste progresso (mantém o melhor resultado).
    const bestStars = Math.max(prev?.stars ?? 0, body.stars);
    const bestXp = Math.max(prev?.xp_earned ?? 0, firstTime ? lessonXp : prev?.xp_earned ?? 0);
    db.prepare(
      `INSERT INTO user_lesson_progress (user_id, lesson_id, completed, stars, xp_earned, mistakes_count, time_seconds, completed_at)
       VALUES (@uid, @lid, 1, @stars, @xp, @mistakes, @time, @ts)
       ON CONFLICT(user_id, lesson_id) DO UPDATE SET
         completed = 1, stars = @stars, xp_earned = @xp,
         mistakes_count = @mistakes, time_seconds = @time, completed_at = @ts`,
    ).run({
      uid: req.userId,
      lid: Number(id),
      stars: bestStars,
      xp: bestXp,
      mistakes: body.mistakes,
      time: body.time_seconds,
      ts: now(),
    });

    // Credita XP.
    const xpResult = addXp(req.userId, lessonXp, 'lesson', Number(id));
    let bonusXp = 0;
    if (xpResult.daily_goal_just_met) {
      const r = addXp(req.userId, XP_SYSTEM.daily_goal_bonus, 'streak_bonus', null);
      bonusXp = r.amount;
    }

    // Gems (somente primeira vez).
    let gemsGained = 0;
    if (firstTime) {
      gemsGained = lesson.gem_reward + (perfect ? 2 : 0);
      if (gemsGained > 0) {
        db.prepare('UPDATE user_profiles SET gems = gems + ? WHERE user_id = ?').run(gemsGained, req.userId);
      }
    }

    // Conquistas (com contexto de horário/velocidade).
    const hour = new Date().getHours();
    const achievements = checkAchievements(req.userId, {
      night_study: hour >= 0 && hour < 5,
      morning_study: hour < 7,
      fast_lesson: body.time_seconds > 0 && body.time_seconds < 120 && perfect,
      best_combo: body.max_combo ?? 0,
    });

    const profile = getProfile(req.userId);
    const response: CompleteLessonResponse = {
      profile,
      xp_gained: lessonXp,
      bonus_xp: bonusXp,
      gems_gained: gemsGained,
      leveled_streak: streak.increased,
      new_achievements: achievements,
      daily_goal_met: profile.daily_goal_met,
    };
    return response;
  });
};

export default lessonRoutes;
