# 📚 DevLingo — Currículo e Metodologia

Como o DevLingo ensina idiomas para programadores, do zero à fluência.

## Princípios pedagógicos

1. **Tech-first** — o vocabulário de programação (`deploy`, `commit`, `bug`, `função`…) é prioridade
   em todos os níveis, não um extra.
2. **Contexto dev** — frases e diálogos sempre em situações reais de trabalho: commits, issues,
   PRs, reuniões, deploys, documentação, code review.
3. **Prática espaçada** — o vocabulário visto nas lições alimenta um sistema de **revisão espaçada
   (SRS / SM-2)**, revisando cada palavra no momento ideal para a memória de longo prazo.
4. **Aprender errando** — exercícios errados voltam ao fim da lição para serem refeitos; o erro é
   parte do ciclo, não punição definitiva.
5. **Motivação gamificada** — XP, ofensiva (streak), vidas, gems, ligas e conquistas mantêm o hábito
   diário.

## Estrutura

Cada idioma tem **8 unidades × 8 lições = 64 lições**. Cinco idiomas = **320 lições**.

| Nível | Unidades | Foco |
| --- | --- | --- |
| **Iniciante** | 1–2 | Sobrevivência, comunicação inicial, primeiros termos tech |
| **Básico** | 3–4 | Vida profissional, tecnologia do dia a dia, Git no idioma |
| **Intermediário** | 5–6 | Comunicação em projetos, leitura/escrita técnica, Scrum/Agile |
| **Avançado** | 7 | Entrevistas, contratos, arquitetura, code review |
| **Fluente** | 8 | Debate, pitch, liderança técnica, nuances culturais |

### Mapa das unidades (igual para os 5 idiomas)

1. **Sobrevivência Básica** — saudações, números, cores, dias, perguntas/respostas, tech básico.
2. **Comunicação Inicial** — pessoas, lugares, verbos, presente, erros comuns, emails.
3. **Vida Profissional** — cargos, tarefas, tempo, passado, Git, documentação.
4. **Tecnologia do Dia a Dia** — hardware, software, redes, verbos tech, futuro, troubleshooting.
5. **Comunicação em Projetos** — reuniões, feedback, condicional, Scrum/Agile, código comentado.
6. **Leitura e Escrita Técnica** — docs, README, issues/PRs, modais, Stack Overflow.
7. **Comunicação Avançada** — negociação, entrevistas, arquitetura, voz passiva, code review.
8. **Maestria** — debate, pitch, conferências, cultura, artigo técnico, liderança.

## Tipos de exercício

| Tipo | Descrição |
| --- | --- |
| `multiple_choice` | Escolha a tradução/termo correto entre 4 opções. |
| `translation_to` | Traduzir do português para o idioma-alvo. |
| `translation_from` | Traduzir do idioma-alvo para o português. |
| `fill_blank` | Completar a lacuna escolhendo a palavra certa. |
| `drag_drop` | Montar a frase arrastando/tocando palavras (com distratores). |
| `match_pairs` | Conectar termos aos seus equivalentes. |
| `listen_type` | Ouvir (TTS) e escrever o que ouviu. |
| `speak` | Falar a frase (reconhecimento de voz). |
| `code_bilingual` | **Exclusivo**: escolher a versão do código com os comentários traduzidos. |

## Por que estes 5 idiomas

- 🇺🇸 **Inglês** — 90% da documentação, GitHub, Stack Overflow, papers e conferências.
- 🇨🇳 **Mandarim** — maior mercado tech em crescimento (Alibaba, ByteDance, Huawei, Tencent).
- 🇪🇸 **Espanhol** — 500M+ falantes, mercado LATAM em explosão; alto ROI para brasileiros.
- 🇯🇵 **Japonês** — jogos, robótica e eletrônica; muitos termos tech são katakana do inglês.
- 🇩🇪 **Alemão** — hub tech da Europa (SAP, Siemens, Bosch); visto facilitado.

## Sistema de XP e progressão

- XP base por lição cresce com o nível (Iniciante 10 → Fluente 30).
- **Lição perfeita** (zero erros) dobra o XP; **primeira vez** dá +5; **multiplicador de streak**
  (1.2× aos 7 dias, 1.5× aos 30, 2.0× aos 100).
- **Meta diária** configurável (10/20/30/50 XP) com bônus ao bater.
- **Estrelas** (1–3) por lição conforme o número de erros.
- Unidades desbloqueiam ao concluir a anterior; cada unidade exibe um `required_xp` de referência.

## Revisão espaçada (SRS)

Cada exercício respondido vira um item de vocabulário com o algoritmo **SM-2**: acertos aumentam o
intervalo de revisão (1 → 6 → ×fator de facilidade), erros reiniciam. A página **Praticar** mostra
exatamente o que está "vencido" para revisar hoje.

## Geração e curadoria de conteúdo

A estrutura é fixa; os exercícios são curados por idioma (com pinyin para o mandarim e romaji para o
japonês) e versionados em `backend/src/content/data/`. Lições ainda não curadas usam um gerador de
fallback determinístico baseado num banco de vocabulário técnico, garantindo que **toda lição sempre
seja jogável**.
