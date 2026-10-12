# Handoff · 11/10/2026

## Estado real

- T001: scaffold Phaser 3.90.0, TypeScript 5.9.3, Vite 8.3.4, lockfile, CI e workflow de Pages implementados. Build local e `verify` no GitHub Actions passaram. O job `deploy` falhou em `actions/configure-pages@v5`: **Pages não habilitado no repositório**.
- T002: sala manual, colisões, movimento, teclado e joystick de toque implementados. Build passa. **Ainda não verificado em aparelho real**.
- T003: tiro manual no desktop, botão de tiro com assistência de alvo no toque, quatro inimigos, vida, dano, vitória/derrota, pausa e reinício implementados. Build passa. **Fluxo visual completo ainda não verificado em navegador real**.
- T004: dash com recarga e proteção breve, pulso de área com recarga, atirador com projétil e inimigo resistente implementados. Typecheck/teste/build passaram; **aceite visual pendente**.
- T005–T015: não iniciados. Não há mapa procedural, chefe, outros heróis ou APK.

## Evidência

- Local: `npm ci --ignore-scripts`, `npm run typecheck`, `npm test`, `npm run build` concluídos. Preview respondeu HTML com JS/CSS em `/Junq_SoulKnight/assets/`.
- [GitHub Actions run 38192659135](https://github.com/JaoDaJunq/Junq_SoulKnight/actions/runs/38192659135): `verify` success; `deploy` failure. Log: `Get Pages site failed. Please verify that the repository has Pages enabled and configured to build using GitHub Actions`.
- O usuário ativou Pages em 11/10/2026. A [publicação Jekyll run 38193653040](https://github.com/JaoDaJunq/Junq_SoulKnight/actions/runs/38193653040) teve sucesso, mas publicou `index.html` fonte, com `<script type="module" src="/src/main.ts">`. HTTP 200 **não significa jogo funcional**. É preciso selecionar GitHub Actions como fonte em Pages.
- Não foi possível instalar Chromium de teste neste ambiente; download retornou arquivo inválido. Não afirmar que o gameplay foi validado visualmente.

## Passo de habilitação

Em [Settings → Pages](https://github.com/JaoDaJunq/Junq_SoulKnight/settings/pages), selecionar **Build and deployment → Source: GitHub Actions**, em vez de `Deploy from a branch`. Depois fazer novo push em `main` ou rodar o workflow customizado `Verify and deploy game`. Confirmar `verify` e `deploy` verdes e abrir `https://jaodajunq.github.io/Junq_SoulKnight/` no desktop e no Android. Se o input de toque, escala ou layout falhar, corrigir antes de marcar T001–T004 como aceitos.

## Próximo trabalho

1. Habilitar Pages e verificar a URL publicada.
2. Jogar uma run completa no Android e desktop; testar mover enquanto atira, paredes/obstáculos, pausa por perda de foco e reinício.
3. Corrigir os bugs observados, atualizar evidências e status de T001–T004.
4. Iniciar T005: grafo de salas e portas, após validar a sala manual.

## Como rodar localmente

Node 22.18+ ou 24; `npm ci`, `npm run dev`. Checagens: `npm run typecheck`, `npm test`, `npm run build`. O Vite usa base `/Junq_SoulKnight/` para Pages. Não há material externo copiado; gráficos provisórios são formas criadas em código.
