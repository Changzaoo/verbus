import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { serializeLesson } from '../lib/serialize.js';
import type {
  CoursePath,
  Language,
  LessonNode,
  Unit,
  UnitWithProgress,
} from '../../../shared/types.js';

function findLanguage(langId: string): Language | undefined {
  return db.prepare('SELECT * FROM languages WHERE id = ? OR code = ?').get(langId, langId) as
    | Language
    | undefined;
}

const courseRoutes: FastifyPluginAsync = async (app) => {
  app.get('/:langId/path', { preHandler: authenticate }, async (req, reply) => {
    const { langId } = req.params as { langId: string };
    const language = findLanguage(langId);
    if (!language) return reply.code(404).send({ error: 'not_found', message: 'Idioma não encontrado', statusCode: 404 });

    const units = db
      .prepare('SELECT * FROM units WHERE language_id = ? ORDER BY order_index ASC')
      .all(language.id) as Unit[];

    const progressRows = db
      .prepare(
        `SELECT ulp.lesson_id, ulp.completed, ulp.stars, ulp.xp_earned
           FROM user_lesson_progress ulp
           JOIN lessons l ON l.id = ulp.lesson_id
           JOIN units u ON u.id = l.unit_id
          WHERE u.language_id = ? AND ulp.user_id = ?`,
      )
      .all(language.id, req.userId) as {
      lesson_id: number;
      completed: number;
      stars: number;
      xp_earned: number;
    }[];

    const progress = new Map(progressRows.map((p) => [p.lesson_id, p]));
    const xpInCourse = progressRows.reduce((s, p) => s + p.xp_earned, 0);

    let activeLessonId: number | null = null;
    let prevUnitCompleted = true;

    const unitsWithProgress: UnitWithProgress[] = units.map((unit) => {
      const lessonRows = db
        .prepare('SELECT * FROM lessons WHERE unit_id = ? ORDER BY order_index ASC')
        .all(unit.id);

      const unlocked = prevUnitCompleted;
      let prevLessonCompleted = true;
      let completedCount = 0;

      const lessons: LessonNode[] = lessonRows.map((raw) => {
        const lesson = serializeLesson(raw);
        const p = progress.get(lesson.id);
        const done = !!p?.completed;
        if (done) completedCount++;

        let status: LessonNode['status'];
        if (!unlocked) {
          status = 'locked';
        } else if (done) {
          status = 'completed';
        } else if (prevLessonCompleted) {
          status = 'available';
          if (activeLessonId == null) {
            status = 'active';
            activeLessonId = lesson.id;
          }
        } else {
          status = 'locked';
        }

        prevLessonCompleted = done;
        return { ...lesson, status, stars: p?.stars ?? 0 };
      });

      const unitCompleted = unlocked && completedCount === lessons.length && lessons.length > 0;
      prevUnitCompleted = unitCompleted;

      return { ...unit, lessons, unlocked, completed_lessons: completedCount };
    });

    const result: CoursePath = {
      language,
      units: unitsWithProgress,
      user_xp_in_course: xpInCourse,
      active_lesson_id: activeLessonId,
    };
    return result;
  });

  app.get('/:langId/stats', { preHandler: authenticate }, async (req, reply) => {
    const { langId } = req.params as { langId: string };
    const language = findLanguage(langId);
    if (!language) return reply.code(404).send({ error: 'not_found', message: 'Idioma não encontrado', statusCode: 404 });

    const row = db
      .prepare(
        `SELECT
           COUNT(*) AS completed_lessons,
           COALESCE(SUM(ulp.xp_earned),0) AS xp,
           COALESCE(SUM(ulp.stars),0) AS stars
         FROM user_lesson_progress ulp
         JOIN lessons l ON l.id = ulp.lesson_id
         JOIN units u ON u.id = l.unit_id
        WHERE u.language_id = ? AND ulp.user_id = ? AND ulp.completed = 1`,
      )
      .get(language.id, req.userId);

    return { language, ...(row as object), total_lessons: language.total_lessons };
  });
};

export default courseRoutes;
