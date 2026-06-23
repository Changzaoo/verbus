# Verbus — aprenda idiomas de verdade

Plataforma web para aprender **16 idiomas** a partir do português — do primeiro «olá» à
fluência. Conversas coerentes, **ligações** com o mascote, **histórias animadas**, **podcasts**
narrados, gamificação completa e revisão espaçada.

> Inglês · Espanhol · Francês · Italiano · Alemão · Holandês · Sueco · Polonês · Turco ·
> Russo · Árabe · Hindi · Mandarim · Japonês · Coreano · Grego

![stack](https://img.shields.io/badge/React_18-Vite-1CB0F6) ![stack](https://img.shields.io/badge/Fastify-SQLite-0F2A4A) ![stack](https://img.shields.io/badge/TypeScript-strict-2B70C9)

---

## ✨ Destaques

- **16 idiomas**, 12 unidades temáticas × 8 lições = **1.500+ lições**, currículo progressivo.
- **7 tipos de exercício**: múltipla escolha, tradução, completar lacunas, banco de palavras
  (arrastar), escuta (TTS), fala (reconhecimento de voz) e pares.
- **Modos interativos com roteiros coerentes** (não são frases soltas embaralhadas):
  - **Ligação** — atenda o Byte e responda na conversa (pergunta → resposta lógica).
  - **Histórias** — cenas animadas com Byte e Lia, que falam de verdade (lip-sync).
  - **Podcast / DuoRadio** — episódios narrados com transcrição e quiz.
- **Gamificação**: XP, ofensivas (streak), ranking real, conquistas, loja.
- **Revisão espaçada (SRS / SM-2)** para fixar o vocabulário.
- Escrita não-latina com **romanização** (pinyin, romaji, IAST, etc.).
- Voz via **Web Speech API** e sons via **Web Audio API** — zero assets externos.
- Tema claro / escuro / terminal, responsivo (mobile-first), PWA básico.
- Backend Node + **SQLite** local, autenticação **JWT** própria.

---

## 🚀 Começando

Requisitos: **Node 18+** (testado no Node 24) e npm.

```bash
npm run setup   # instala tudo (raiz + frontend + backend) e popula o banco
npm run dev     # sobe frontend + backend juntos
```

- Frontend: **http://localhost:5173** (cai para a próxima porta livre se ocupada).
- API: **http://localhost:3333/api**

> O banco é semeado automaticamente na primeira execução. Manual: `npm run seed`.
> Recriar do zero (apaga usuários): `npm --prefix backend run reset`.

---

## 📦 Scripts

| Comando | Ação |
| --- | --- |
| `npm run dev` | Sobe frontend + backend (concurrently) |
| `npm run build` | Build de produção (backend + frontend) |
| `npm run seed` | Popula o banco com o currículo |
| `npm --prefix backend run reset` | Recria o banco do zero |

---

## 🗂️ Estrutura

```
verbus/
├── frontend/   # React + Vite + TS + Tailwind + Zustand + React Query + Framer Motion
├── backend/    # Fastify + better-sqlite3 + JWT + Zod
├── shared/     # types.ts — contratos compartilhados
├── DEPLOY.md   # deploy (Vercel + servidor Linux + Cloudflare Tunnel)
├── ARCHITECTURE.md
└── CURRICULUM.md
```

Os diálogos coerentes ficam em `backend/src/content/dialoguesReference.ts` (roteiro PT, fonte
de verdade) + `backend/src/content/data/<código>.dialogue.json` (texto por idioma). O vocabulário
e as frases ficam em `<código>.bank.json`.

---

## 🌐 Deploy

Frontend na **Vercel**, backend no servidor **Linux** (Ubuntu) exposto por **Cloudflare Tunnel**,
dados em SQLite no servidor. Passo a passo completo em **[DEPLOY.md](DEPLOY.md)**.

A URL da API é configurável via `VITE_API_URL` no build do frontend.

---

## 🔒 Notas

- Senhas com `bcrypt`, sessões com JWT, validação com `zod`, rate limiting global.
- Backup automático do SQLite a cada 6h.
- Em produção, defina `JWT_SECRET` e `VERBUS_DB` no ambiente.

**Verbus** — aprenda idiomas de verdade.
