# Handoff · 12/10/2026

## Estado real

- T001: scaffold Phaser 3.90.0, TypeScript 5.9.3, Vite 8.3.4, CI e Pages ativo com fonte **GitHub Actions**. O [workflow 38194600820](https://github.com/JaoDaJunq/Junq_SoulKnight/actions/runs/38194600820) teve `verify` e `deploy` verdes. [Página jogável](https://jaodajunq.github.io/Junq_SoulKnight/) abriu no Chrome desktop, com bundle compilado. Android não verificado.
- T002–T004: uma sala manual, colisões, vida, tiro, três tipos de inimigos, dash, pulso, derrota, pausa e reinício. Sala inicial e pausa observadas no browser desktop. Controle de teclado, toque, combate completo e reinício ainda precisam de playtest; entrada do canvas recebeu foco explícito para teclado na versão T005.
- T005: seis salas em grade 3×2 com árvore de conexões gerada por seed, portas liberadas ao limpar cada sala, layout alternado, inimigos por sala, minimapa das salas visitadas e seed no resultado. **Publicado e sala inicial observada no Chrome desktop.** Transição por porta e run completa ainda pendentes de playtest. O mapa não inclui chefe nem sala de recompensa; são T006–T007.
- T006–T015: não iniciados. Não há armas alternativas, drops, chefe, save ou APK.

## Evidência

- Local: `npm run typecheck`, `npm test` e `npm run build` passaram. O teste percorre 100 seeds, valida acesso às seis salas, portas pareadas, spawn livre e repetibilidade.
- [GitHub Actions run 38195115760](https://github.com/JaoDaJunq/Junq_SoulKnight/actions/runs/38195115760): `verify` e `deploy` success para commit `4218800`. Browser público: menu, sala 01, contador `Salas 0/6`, minimapa, porta bloqueada, inimigos, projéteis e perda de vida apareceram no desktop. O primeiro clique no canvas por automação às vezes só focou a área; as teclas não produziram deslocamento nessa sessão automatizada mesmo após o foco explícito. Reavaliar em uso humano real. Pausa por clique foi verificada antes de T005.
- O bundle Phaser gera aviso de chunk acima de 500 kB (~1,2 MB JS, ~325 kB gzip). Não é falha de build, mas medir carregamento em celular antes do lançamento.

## Próximo trabalho

1. Testar teclado com foco, tiro, dash, pulso, morte/reinício, seis salas e portas em navegador humano. A automação observou renderização e tiro, mas não conseguiu validar a run completa.
2. Validar Android real em horizontal, incluindo dois dedos simultâneos, safe areas, escala e desempenho. Corrigir falhas observadas antes de aceitar T001–T005.
3. Iniciar T006: três famílias de armas, drops, moeda e escolhas de recompensa, preservando estado da run ao atravessar portas.

## Como rodar localmente

Node 22.18+ ou 24; `npm ci`, `npm run dev`. Checagens: `npm run typecheck`, `npm test`, `npm run build`. Vite usa base `/Junq_SoulKnight/` para Pages. Gráficos provisórios são formas criadas em código; não há material de terceiros incorporado.
