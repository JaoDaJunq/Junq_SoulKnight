# Handoff · 12/10/2026

## Estado real

- T001–T005: Phaser 3/TypeScript/Vite, CI e Pages ativo, combate base e seis salas conectadas por seed. Os testes do gerador cobrem 100 seeds, portas pareadas, spawn e acesso ao chefe.
- T006: três armas com cadência e padrão de tiro próprios, moedas de inimigos, cura por três moedas e escolhas entre duas armas alternativas ou melhoria de dano em duas salas. Moedas no chão persistem ao revisitar salas.
- T007: sala do chefe no ponto mais distante do início, aviso visual antes dos ataques, barra de vida, vitória e derrota com seed, tempo, dano, salas e moedas.
- T008: CSS preenche a área visível em celular horizontal, aviso para girar no retrato, tentativa de tela cheia após toque, pausa ao girar/perder foco, controles de toque reposicionados e FPS opcional (`?debug=1`). Captura direta de teclado complementa o input do Phaser. **Código implementado, aceite pendente:** run completa e teste Android físico, incluindo multitoque, escala, safe areas e desempenho.
- T009–T015: pendentes. Arte e áudio finais, save, PWA e APK não existem.

## Evidência e limites

- Commit `1f7ed0a` publicou a correção de teclado após o vertical slice `050377c`; [Actions 38196895602](https://github.com/JaoDaJunq/Junq_SoulKnight/actions/runs/38196895602) terminou com sucesso. A documentação atual é um commit posterior.
- Local: `npm run typecheck`, `npm test` e `npm run build` passaram. Testes de regras cobrem 100 seeds e escolhas/padrões de armas; não simulam combate visual ou input físico.
- [Pages](https://jaodajunq.github.io/Junq_SoulKnight/) aberto no Chrome desktop: menu novo, sala inicial, HUD de arma/moedas, inimigos, minimapa e pausa por botão visíveis. A automação de teclado não comprovou deslocamento ou pausa; o primeiro clique no canvas às vezes apenas foca a área. Testar em navegador humano. Não se executou a run inteira nem teste em Android real.
- Build gera aviso de chunk Phaser acima de 500 kB (~1,2 MB JS, ~327 kB gzip). Medir carregamento e FPS no celular antes de fechar T008.

## Próximo trabalho: concluir T008

1. Jogar do menu à vitória e à derrota no desktop. Conferir WASD/setas, clique para tiro, dash, pulso, H para cura, Esc, portas, escolha de recompensas, moedas persistidas e reinício. Registrar seed e bug encontrado.
2. Repetir no Android real em horizontal: ocupação da tela, safe areas, dois dedos para mover/atirar, botões, rotação, retorno de foco, tela cheia permitida ou recusada e FPS com `?debug=1`. Registrar aparelho/navegador e corrigir os bloqueios observados.
3. Só após esse aceite iniciar T009: arte, áudio e créditos auditados. Não marcar T008 concluído pela existência do código.

## Como rodar

Node 22.18+ ou 24; `npm ci`, `npm run dev`. Checagens: `npm run typecheck`, `npm test`, `npm run build`. Vite usa base `/Junq_SoulKnight/`. Gráficos provisórios são formas criadas em código; não há assets de terceiros incorporados.
