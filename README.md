# 🦾 DevLingo — Duolingo para Programadores

Plataforma web completa, estilo Duolingo, para devs aprenderem os idiomas humanos mais
importantes da carreira: **Inglês Técnico, Mandarim, Espanhol, Japonês e Alemão** — do zero à
fluência, com vocabulário técnico, gamificação completa e exercícios de **código bilíngue**.

![stack](https://img.shields.io/badge/React_18-Vite-1CB0F6) ![stack](https://img.shields.io/badge/Fastify-SQLite-58CC02) ![stack](https://img.shields.io/badge/TypeScript-strict-2B70C9)

---

## ✨ Destaques

- **5 idiomas** com 8 unidades × 8 lições cada = **320 lições** e **2.500+ exercícios**.
- **9 tipos de exercício**: múltipla escolha, tradução (ida/volta), completar lacunas,
  arrastar-e-soltar, escuta (TTS), fala (reconhecimento de voz), pares e **código bilíngue**.
- **Gamificação completa**: XP com multiplicadores de streak, ofensiva diária com _streak freeze_,
  5 vidas com regeneração, gems, 10 ligas semanais (Bronze → Diamante), 30+ conquistas, desafio diário.
- **Revisão espaçada (SRS / SM-2)** para fixar o vocabulário tech.
- **Mascote Byte** (SVG animado) que reage ao seu desempenho.
- **Sons via Web Audio API** e **voz via Web Speech API** — zero assets externos.
- **Tema claro / escuro / terminal**, 100% responsivo (mobile-first), PWA básico.
- **Zero dependência de nuvem**: backend Node + SQLite local, autenticação JWT própria.

---

## 🚀 Começando

Requisitos: **Node 18+** (testado no Node 24) e npm.

```bash
# 1. Instalar tudo (raiz + frontend + backend) e popular o banco
npm run setup

# 2. Subir frontend + backend juntos
npm run dev
```

- Frontend: **http://localhost:5173** (se a porta estiver ocupada, o Vite usa a próxima — veja o log).
- API: **http://localhost:3333/api**

> O banco é semeado automaticamente na primeira execução do backend. Para semear manualmente:
> `npm run seed`. Para recriar do zero (apaga usuários): `npm --prefix backend run reset`.

### Conta de demonstração
Há usuários-bot para o ranking. Use o botão **"Usar conta de demonstração"** na tela de login
(`ada@devlingo.dev` / `demo1234`) ou crie a sua conta.

---

## 🧭 Fluxo de uso

1. **Cadastro** → escolha meta diária de XP e o primeiro idioma.
2. **Trilha** → mapa vertical de unidades e lições estilo Duolingo.
3. **Lição** → exercícios variados, feedback animado, corações e XP em tempo real.
4. **Resultado** → estrelas, XP, gems, conquistas e bônus de ofensiva.
5. **Dashboard** → streak, meta diária, revisão SRS, desafio e liga.
6. **Loja, Ranking, Perfil, Ajustes**.

---

## 📦 Scripts

| Comando | Ação |
| --- | --- |
| `npm run dev` | Sobe frontend + backend (concurrently) |
| `npm run dev:frontend` / `dev:backend` | Sobe apenas um |
| `npm run build` | Build de produção (backend + frontend) |
| `npm run seed` | Popula o banco com o currículo |
| `npm --prefix backend run reset` | Recria o banco do zero |

---

## 🗂️ Estrutura

```
devlingo/
├── frontend/   # React + Vite + TS + Tailwind + Zustand + React Query + Framer Motion
├── backend/    # Fastify + better-sqlite3 + JWT + Zod
├── shared/     # types.ts — contratos compartilhados (fonte da verdade)
├── ARCHITECTURE.md
├── CURRICULUM.md
└── README.md
```

Veja [ARCHITECTURE.md](ARCHITECTURE.md) para decisões técnicas e [CURRICULUM.md](CURRICULUM.md)
para a metodologia pedagógica.

---

## 🧠 Como o conteúdo é gerado

A estrutura curricular (8 unidades × 8 lições por idioma) vive em
[backend/src/content/skeleton.ts](backend/src/content/skeleton.ts). Os exercícios curados ficam em
`backend/src/content/data/<código>-u<unidade>.json` (um shard por unidade). Qualquer lição sem
conteúdo curado cai automaticamente no gerador de fallback
([backend/src/content/fallback.ts](backend/src/content/fallback.ts)), garantindo que **toda lição
sempre tenha exercícios funcionais**.

---

## 🔒 Notas

- Senhas com `bcrypt`, sessões com JWT, validação de entrada com `zod`, rate limiting global.
- Backup automático do SQLite a cada 6h em `backend/data/backups/`.
- Em produção, defina `JWT_SECRET` no ambiente.

DevLingo v1.0 — feito para programadores. 🦊
