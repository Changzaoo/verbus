import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { loadBank } from '../content/banks.js';
import { loadDialogues } from '../content/dialogues.js';
import { LANGUAGE_META, UNIT_SKELETON } from '../content/skeleton.js';
import type { Language } from '../../../shared/types.js';

/**
 * Material cru de um idioma (palavras + frases por tema) para alimentar os modos
 * interativos do frontend: jogos, podcast/DuoRadio, ligação (roleplay) e histórias.
 */
const contentRoutes: FastifyPluginAsync = async (app) => {
  app.get('/:langId/material', { preHandler: authenticate }, async (req, reply) => {
    const { langId } = req.params as { langId: string };
    const language = db
      .prepare('SELECT * FROM languages WHERE id = ? OR code = ?')
      .get(langId, langId) as Language | undefined;
    if (!language) {
      return reply.code(404).send({ error: 'not_found', message: 'Idioma não encontrado', statusCode: 404 });
    }

    const meta = LANGUAGE_META.find((m) => m.code === language.code);
    const bank = loadBank(language.code);

    const themes = UNIT_SKELETON.map((u) => ({
      theme: u.theme,
      title: u.title,
      icon: u.icon,
      color: u.color,
      words: bank?.words[u.theme] ?? [],
      sentences: bank?.sentences[u.theme] ?? [],
    })).filter((t) => t.words.length > 0 || t.sentences.length > 0);

    return {
      language: {
        id: language.id,
        code: language.code,
        name: language.name,
        native_name: language.native_name,
        color_primary: language.color_primary,
      },
      audio_lang: meta?.audio_lang ?? 'en-US',
      themes,
    };
  });

  /**
   * Diálogos coerentes (roteiros autorais) para Ligação, Histórias e Podcast.
   * Cada tema é uma conversa real entre Byte (A) e Lia (B) — pergunta → resposta lógica.
   */
  app.get('/:langId/dialogues', { preHandler: authenticate }, async (req, reply) => {
    const { langId } = req.params as { langId: string };
    const language = db
      .prepare('SELECT * FROM languages WHERE id = ? OR code = ?')
      .get(langId, langId) as Language | undefined;
    if (!language) {
      return reply.code(404).send({ error: 'not_found', message: 'Idioma não encontrado', statusCode: 404 });
    }

    const meta = LANGUAGE_META.find((m) => m.code === language.code);
    const dialogues = loadDialogues(language.code) ?? [];

    return {
      language: {
        id: language.id,
        code: language.code,
        name: language.name,
        native_name: language.native_name,
        color_primary: language.color_primary,
      },
      audio_lang: meta?.audio_lang ?? 'en-US',
      dialogues,
    };
  });
};

export default contentRoutes;
