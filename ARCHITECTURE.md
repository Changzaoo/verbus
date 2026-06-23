# 🏗️ DevLingo — Arquitetura

Documento de decisões técnicas do DevLingo.

## Visão geral

Monorepo com três pacotes:

- **`frontend/`** — SPA React 18 + Vite + TypeScript, estilizada com Tailwind, estado com Zustand,
  dados de servidor com TanStack Query, animações com Framer Motion, ícones Lucide.
- **`backend/`** — API REST Fastify + `better-sqlite3` (síncrono, zero cloud), JWT próprio,
  validação Zod, rate limiting.
- **`shared/types.ts`** — contrato único de tipos e constantes de gamificação, importado pelos dois
  lados (via alias `@shared` no frontend e import relativo no backend). É a **fonte da verdade**.

```
Browser ──(/api proxy do Vite)──> Fastify :3333 ──> SQLite (WAL)
   │                                   │
React Query / Zustand            services + rotas
```

## Stack e justificativas

| Camada | Escolha | Porquê |
| --- | --- | --- |
| Banco | `better-sqlite3` | Síncrono, rápido, arquivo único, sem servidor. Prebuilds para Node 24. |
| API | Fastify 4 | Leve, plugins oficiais de JWT/CORS/rate-limit, ótimo TS. |
| Auth | `@fastify/jwt` + `bcryptjs` | Sem OAuth externo; token Bearer no `localStorage`. |
| Validação | Zod | Schemas reaproveitáveis, mensagens claras (helper `parseOr400`). |
| Front state | Zustand | 4 stores enxutas (auth, progress, settings, lesson). |
| Server state | TanStack Query | Cache, refetch e invalidação após mutações. |
| Estilo | Tailwind + tokens CSS | Temas claro/escuro/terminal via variáveis `rgb(var(--x))`. |
| Áudio | Web Audio API | Sons sintetizados em runtime — nenhum arquivo `.mp3`. |
| Voz | Web Speech API | TTS (escuta) e reconhecimento (fala) nativos do browser. |

## Backend

### Banco de dados
Schema em [backend/src/db/schema.sql](backend/src/db/schema.sql) (idempotente, `CREATE TABLE IF NOT
EXISTS`). Aplicado automaticamente ao importar [db/index.ts](backend/src/db/index.ts). Booleans são
armazenados como `INTEGER 0/1` e serializados para `boolean` na borda.

Tabelas principais: `users`, `user_profiles`, `languages`, `units`, `lessons`, `exercises`,
`user_lesson_progress`, `user_vocabulary` (SRS), `achievements`/`user_achievements`, `xp_history`,
`shop_items`/`user_purchases`, `daily_challenges`, `friendships`, ligas.

### Camadas
- **`lib/`** — utilidades puras: `dates` (UTC/semana ISO), `profile` (leitura com **recarga
  preguiçosa** de vidas e reset diário/semanal de XP), `serialize` (linhas → DTOs), `answer`.
- **`services/`** — regra de negócio: `xpService` (créditos + multiplicador de streak),
  `streakService` (consecutivo + _streak freeze_), `srsService` (**SM-2**), `leagueService`
  (rankings e ligas), `achievementService` (avaliação de condições + concessão).
- **`routes/`** — 15 plugins Fastify, um por recurso, registrados sob `/api/*` em
  [server.ts](backend/src/server.ts).
- **`middleware/`** — `authenticate` (preHandler JWT que popula `req.userId`) e `parseOr400` (Zod).

### Decisões de gamificação relevantes
- **XP autoritativo no servidor**: a lição recalcula o XP (base, bônus de perfeição, primeira vez,
  multiplicador de streak); replays valem XP reduzido para evitar farm.
- **Vidas**: regeneram 1 a cada 5h (calculado on-read em `refreshProfile`); erros descontam ao
  concluir a lição (respeitando "corações infinitos").
- **Reset diário/semanal**: feito on-read comparando `xp_today_date` / `xp_week_start`.
- **Ligas**: agrupadas por `profile.league`, ranqueadas por `league_xp_week` (zera toda semana).

## Frontend

### Stores (Zustand)
- `authStore` — usuário, token, login/registro/sessão.
- `progressStore` — `UserProfile` (XP, vidas, gems, streak, liga) — atualizado após cada mutação.
- `settingsStore` — tema/som/notificações, persistidos em `localStorage` e aplicados ao `<html>`.
- `lessonStore` — máquina de estado da lição: fila de exercícios com **re-enfileiramento** dos
  errados (refazer até acertar), progresso, erros, estrelas e tempo.

### Exercícios
Cada tipo é um componente isolado em `components/exercises/` que recebe
`{ exercise, checked, onChange }` e reporta `{ ready, correct }`. O `ExerciseRenderer` despacha pelo
`exercise.type`. O `LessonFlow` controla verificar → feedback → continuar e a tela de resultado.

### Roteamento
`/` (landing), `/login`, `/register` (públicas); `/app/*` (protegidas, com `AppLayout`);
`/lesson/:id` (player em tela cheia). Guarda de rota via `status` do `authStore`.

## Contrato de API
Ver a seção "CONTRATOS DE API" do prompt original e os tipos em `shared/types.ts`. Resumo dos
prefixos: `/api/auth`, `/languages`, `/courses`, `/units`, `/lessons`, `/exercises`, `/progress`,
`/xp`, `/vocabulary`, `/achievements`, `/leaderboard`, `/shop`, `/leagues`, `/daily`, `/settings`.

## Geração de conteúdo
A estrutura é fixa (`skeleton.ts`); os exercícios curados são shards JSON por unidade
(`content/data/<code>-u<n>.json`) carregados e mesclados por `content/index.ts`. Lições sem curadoria
usam o gerador determinístico de `content/fallback.ts`. Isso permitiu **gerar os 5 idiomas em
paralelo** (um agente por idioma+unidade) sem risco de integração: arquivos distintos + fallback.

## Build & dev
- Dev: `tsx watch` (backend) + `vite` (frontend), proxy `/api` → `:3333`.
- Tipos cross-package resolvidos via `moduleResolution: Bundler` (specifiers `.js` → `.ts`).
- Build de produção via `tsc` + `vite build`.

## Limitações conhecidas / próximos passos
- Promoção/rebaixamento de liga é exibido, mas o _cron_ semanal de fechamento não está agendado.
- Ranking de amigos depende de `friendships` (UI de adicionar amigos é "em breve").
- "Turbo de XP" e avatares comprados são registrados, mas o efeito visual é simplificado.
