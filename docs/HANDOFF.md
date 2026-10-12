# Handoff · 12/10/2026

## Estado real

- T001–T005: Phaser 3/TypeScript/Vite, CI e Pages ativo, combate base e seis salas conectadas por seed. Os testes do gerador cobrem 100 seeds, portas pareadas, spawn e acesso ao chefe.
- T006 revisado: ataque básico FAÍSCA e duas armas extras com cadência, padrão e custo de energia próprios; moedas de inimigos e cura por três moedas. Duas salas de recompensa revelam baús depois do combate. Cada baú contém uma arma extra determinada pela seed; o jogador decide equipar ou manter a atual. Não há escolha de arma fora de baús. Moedas no chão persistem ao revisitar salas.
- T007: sala do chefe no ponto mais distante do início, aviso visual antes dos ataques, barra de vida, vitória e derrota com seed, tempo, dano, salas e moedas.
- T008: CSS preenche a área visível em celular horizontal, aviso para girar no retrato, tentativa de tela cheia após toque, pausa ao girar/perder foco, controles de toque reposicionados e FPS opcional (`?debug=1`). Captura direta de teclado complementa o input do Phaser. Ao segurar tiro, a mira seleciona o inimigo visível mais próximo; o tiro gasta energia conforme a arma, 100 pontos no máximo, recarga de 12/s após 0,65s sem disparar. Sem alvo ou sem energia suficiente não há tiro. Tiro a curta distância acerta o inimigo sobreposto ao herói; inimigos dão um passo lateral persistente para sair da quina de obstáculos; `?seed=N` reproduz salas e baús. **MVP testou e aprovou seguir em 12/10/2026.** Aparelho, FPS e run completa não foram informados nesta sessão; anotar caso haja bugs no beta, sem reabrir o aceite como impedimento.
- T009 em execução: cenário de ruínas com pisos gravados, portas e obstáculos redesenhados, silhuetas próprias para herói e quatro inimigos, HUD e overlays revisados, efeitos Web Audio originais com mudo. `CREDITS.md` registra procedência; não há assets externos. Falta validar leitura e som no jogo publicado e fechar refinamento visual. T010–T015 pendentes. Save, PWA e APK não existem.

## Evidência e limites

- Commit `5fa85f8` publicou mira automática, energia e baús; [Actions 38250974864](https://github.com/JaoDaJunq/Junq_SoulKnight/actions/runs/38250974864) terminou com sucesso. O commit `9ec8d8b` corrigiu o tiro quando inimigo e herói estão sobrepostos; [Actions 38252230634](https://github.com/JaoDaJunq/Junq_SoulKnight/actions/runs/38252230634) terminou com sucesso. O commit `0963b65` publicou replay por seed; [Actions 38252896317](https://github.com/JaoDaJunq/Junq_SoulKnight/actions/runs/38252896317) terminou com sucesso. O commit `afdf483` corrigiu a navegação na quina; seu deploy foi cancelado por um commit documental posterior. O [Actions 38254810124](https://github.com/JaoDaJunq/Junq_SoulKnight/actions/runs/38254810124) verificou e publicou o mesmo código com sucesso. O Pages carregou `assets/index-DRgSYPGz.js`, correspondente ao build local com a correção.
- Local: `npm run typecheck`, `npm test` e `npm run build` passaram. Testes de regras cobrem 100 seeds, conteúdo reproduzível dos baús, custos/recarga de energia, seleção de alvo e simulação de 240 frames na quina, exigindo que o inimigo volte a ser visível; não simulam combate visual ou input físico.
- [Pages](https://jaodajunq.github.io/Junq_SoulKnight/) aberto no Chrome desktop: menu, HUD de energia e combate visíveis. A derrota foi observada com tempo, dano e seed; após reiniciar, a sala inicial foi limpa, duas moedas apareceram, a porta ficou verde e a travessia levou à sala 04. A tecla Escape acionada por locator abriu a pausa; o primeiro clique no canvas às vezes apenas foca a área. Na sala 04, o resistente ficou preso na quina e sem linha de tiro: isso motivou o ajuste de navegação. A automação de tecla segurada não comprovou deslocamento de forma confiável; a passagem pela porta ocorreu com tecla junto ao clique. A abertura de baú, chefe, run completa, correção de contato próximo e ajuste da IA ainda não foram verificados visualmente após o novo deploy. Não houve teste em Android real.
- Build gera aviso de chunk Phaser acima de 500 kB (~1,2 MB JS, ~327 kB gzip). Medir carregamento e FPS no celular antes de fechar T008.

## Próximo trabalho: concluir T009

1. Revisar no Pages em desktop e Android horizontal a leitura de cada silhueta, portas, tiros, HUD, overlay de baú e chefe. Ajustar o que atrapalhar o combate e registrar aparelho/FPS se houver.
2. Ouvir os efeitos em navegador com áudio desbloqueado, conferir mudo e pausas; corrigir volume ou fadiga. Não há trilha externa nesta passagem.
3. Fechar T009 após aceite visual/sonoro e avançar para T010 (personagens e segundo bioma). Run completa e Android físico continuam como observação de beta caso surjam relatos.

## Como rodar

Node 22.18+ ou 24; `npm ci`, `npm run dev`. Checagens: `npm run typecheck`, `npm test`, `npm run build`. Vite usa base `/Junq_SoulKnight/`. Gráficos e efeitos sonoros são gerados em código; não há assets de terceiros incorporados.
