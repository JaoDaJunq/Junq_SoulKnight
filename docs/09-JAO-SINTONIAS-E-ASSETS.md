# 09 · Formas e habilidades de sintonia do Jão

## Escopo implementado

Quando o Jão chega a 5 pontos em um elemento, sua roupa, espada e animações de arena mudam para a forma correspondente. O botão de habilidade recebe o nome curto da forma. A regra vale apenas para Jão; fusões continuam com seus comportamentos existentes, e vento ainda não tem transformação própria.

Todas as habilidades miram automaticamente o inimigo visível mais próximo, mantêm recarga de 6 segundos e somam o bônus de dano dos fragmentos. O botão continua acionado pelo jogador. A espada segue corpo a corpo no ataque básico e consome energia normalmente.

| Afinidade | Forma | Habilidade | Comportamento |
| --- | --- | --- | --- |
| Terra 5 | Ronin Basáltico | Fenda Basáltica · **FENDA** | Abre uma fissura em linha entre Jão e o alvo; atinge inimigos no caminho e os desacelera por 1,6 s. |
| Água 5 | Ronin da Maré | Maré Ascendente · **MARÉ** | Lança uma onda sinuosa pela linha do alvo; atinge e desacelera inimigos próximos ao percurso por 2,4 s. |
| Fogo 5 | Ronin da Brasa | Corte da Brasa · **BRASA** | Um corte no alvo acende uma explosão de 74 px; inimigos próximos também recebem dano. |
| Raio 5 | Ronin da Tempestade | Passo Fulminante · **RAIO** | Corta até além do alvo e reposiciona Jão atrás dele se houver espaço livre; oferece breve invulnerabilidade. |
| Luz 5 | Ronin da Aurora | Corte da Aurora · **AURORA** | Dispara um corte radiante penetrante pela linha do alvo, atingindo inimigos alinhados. |
| Sombra 5 | Ronin do Véu | Corte do Véu · **VÉU** | Jão salta para a frente do alvo; o primeiro corte é seguido por um eco após 260 ms se o alvo continuar vivo. |

## Assets de jogo

| Entrega | Caminho e uso |
| --- | --- |
| Referência de roupa/arma/efeito | docs/visual/jao-elementos/v1/ contém as pranchas das cinco formas. |
| Matrizes originais com poses | art/sheets/jao-{terra,agua,fogo,raio,luz,sombra}-attunement.png, cada uma em grade transparente 2×2: frente, passo A, passo B e costas. |
| Sprites carregados pelo jogo | src/assets/jao-{element}-armed.png, jao-walk1-{element}-armed.png, jao-walk2-{element}-armed.png, jao-back-{element}-armed.png e jao-attack-{element}.png. |
| Efeitos de habilidade | Desenhados em tempo real com Phaser.Graphics e tweens: fissura, onda, brasa, arco elétrico, raio de luz e pós-imagem. Não há dependência de novas texturas de efeito. |
| Pipeline reproduzível | python scripts/build_jao_elemental_sprites.py recorta as matrizes, reduz com vizinho mais próximo e alinha os PNGs no canvas 224×160 usado pelos outros frames. Requer Pillow. |

As imagens de conceito e as matrizes foram geradas para este projeto. Os sprites na build são versões reduzidas e recortadas dessas matrizes; ainda não são animações finais redesenhadas manualmente em grade baixa. Artefatos de direção visual servem para validar o resultado em jogo, escala e legibilidade.

## Assets previstos para a etapa de acabamento

- Quatro vistas direcionais e dois passos por direção para cada forma, depois que a leitura das atuais for validada.
- Quadros exclusivos de ataque, dano, recuperação e esquiva quando as ações exigirem poses próprias.
- Folhas de sprites com grade e pontos de ancoragem documentados, mais variantes sem espada apenas se uma habilidade realmente a retirar da mão.
- Efeitos elementais em pequenos spritesheets editáveis se o desenho por código ficar visualmente inconsistente ou custoso.
- Ícone curto de cada habilidade e arte do altar para explicar o desbloqueio de forma dentro da run.

## Validação ainda pendente

Typecheck, testes de regras e build local passaram. O commit `f19dfa6` concluiu o workflow de verificação e deploy do GitHub Pages (`38343179306`). O site implantado e as habilidades ainda precisam de inspeção visual e partida; também faltam testes físicos no celular horizontal. As habilidades e valores são uma primeira versão para playtest e podem ser ajustados sem alterar as combinações híbridas.
