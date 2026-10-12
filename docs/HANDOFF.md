# Handoff · 12/10/2026

## Estado real

- T001–T005: Phaser 3/TypeScript/Vite, CI e Pages ativo, combate base e seis salas conectadas por seed. Os testes do gerador cobrem 100 seeds, portas pareadas, spawn e acesso ao chefe.
- T006 revisado: ataque básico FAÍSCA e duas armas extras com cadência, padrão e custo de energia próprios; moedas de inimigos e cura por três moedas. Duas salas de recompensa revelam baús depois do combate. Cada baú contém uma arma extra determinada pela seed; o jogador decide equipar ou manter a atual. Não há escolha de arma fora de baús. Moedas no chão persistem ao revisitar salas.
- T007: sala do chefe no ponto mais distante do início, aviso visual antes dos ataques, barra de vida, vitória e derrota com seed, tempo, dano, salas e moedas.
- T008: CSS preenche a área visível em celular horizontal, aviso para girar no retrato, tentativa de tela cheia após toque, pausa ao girar/perder foco, controles de toque reposicionados e FPS opcional (`?debug=1`). Captura direta de teclado complementa o input do Phaser. Ao segurar tiro, a mira seleciona o inimigo visível mais próximo; o tiro gasta energia conforme a arma, 100 pontos no máximo, recarga de 12/s após 0,65s sem disparar. Sem alvo ou sem energia suficiente não há tiro. **Código implementado, aceite pendente:** run completa e teste Android físico, incluindo multitoque, seleção de alvo, escala, safe areas e desempenho.
- T009–T015: pendentes. Arte e áudio finais, save, PWA e APK não existem.

## Evidência e limites

- Commit `5fa85f8` publicou mira automática, energia e baús; [Actions 38250974864](https://github.com/JaoDaJunq/Junq_SoulKnight/actions/runs/38250974864) terminou com sucesso. A atualização desta evidência é um commit posterior.
- Local: `npm run typecheck`, `npm test` e `npm run build` passaram. Testes de regras cobrem 100 seeds, conteúdo reproduzível dos baús, custos/recarga de energia e seleção de alvo com obstáculo; não simulam combate visual ou input físico.
- [Pages](https://jaodajunq.github.io/Junq_SoulKnight/) aberto no Chrome desktop: menu novo, sala inicial, HUD de energia 100/100, inimigos e minimapa visíveis. Ao segurar clique, energia caiu para 96 e 88 e projéteis seguiram em direção a um inimigo. A automação de teclado não comprovou deslocamento ou pausa; o primeiro clique no canvas às vezes apenas foca a área. A abertura de baú foi coberta por regra, não verificada visualmente no Pages. Não se executou a run inteira nem teste em Android real.
- Build gera aviso de chunk Phaser acima de 500 kB (~1,2 MB JS, ~327 kB gzip). Medir carregamento e FPS no celular antes de fechar T008.

## Próximo trabalho: concluir T008

1. Jogar do menu à vitória e à derrota no desktop. Conferir WASD/setas, clique para tiro, alvo visível escolhido, energia, dash, pulso, H para cura, Esc, portas, abertura e escolha dos baús, moedas persistidas e reinício. Registrar seed e bug encontrado.
2. Repetir no Android real em horizontal: ocupação da tela, safe areas, dois dedos para mover/atirar, mira automática, energia, baús, botões, rotação, retorno de foco, tela cheia permitida ou recusada e FPS com `?debug=1`. Registrar aparelho/navegador e corrigir os bloqueios observados.
3. Só após esse aceite iniciar T009: arte, áudio e créditos auditados. Não marcar T008 concluído pela existência do código.

## Como rodar

Node 22.18+ ou 24; `npm ci`, `npm run dev`. Checagens: `npm run typecheck`, `npm test`, `npm run build`. Vite usa base `/Junq_SoulKnight/`. Gráficos provisórios são formas criadas em código; não há assets de terceiros incorporados.
