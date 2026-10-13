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
| Efeitos de habilidade | `src/assets/vfx-jao-*.png`: seis spritesheets originais, uma por forma, quatro quadros por folha e canal alfa. Phaser reproduz a animação a 12 quadros por segundo e orienta o efeito na direção do alvo. |
| Pipeline reproduzível | python scripts/build_jao_elemental_sprites.py recorta as matrizes, reduz com vizinho mais próximo e alinha os PNGs no canvas 224×160 usado pelos outros frames. Requer Pillow. |

As imagens de conceito, matrizes e efeitos foram gerados para este projeto. Os sprites de personagem são versões recortadas e alinhadas das matrizes; os efeitos especiais agora são artes animadas em PNG com transparência. Artefatos de direção visual servem para validar resultado em jogo, escala e legibilidade.

### Correção de escala das formas

As capturas comparando o Jão base com Terra mostraram que a forma parecia menor. A causa estava na geração: as pranchas elementais têm personagens mais largos e baixos do que a prancha base, mas o script aplicava o mesmo limite de largura (`106 px`). Isso exportava corpos com aproximadamente `100 px` de altura útil, enquanto o base tem `134 px`. O Phaser já dimensionava o canvas inteiro pela mesma altura, então o espaço transparente não compensava a diferença.

O pipeline agora dimensiona cada pose pela altura visível equivalente do base — `134/130/130/134 px` — preserva a proporção original com vizinho mais próximo e mantém os pés em `y=150`. A regra vale para Terra, Água, Fogo, Raio, Luz e Sombra, incluindo os frames usados no corte de ataque. A largura pode variar com a armadura, a espada e efeitos desenhados na prancha; a altura e a linha dos pés ficam consistentes. O próprio script falha se uma matriz sair fora dessa escala ou alinhamento.

Prévia lado a lado: [Jão base e seis formas na escala corrigida](visual/jao-formas-escalas-corrigidas.png).

## Assets previstos para a etapa de acabamento

- Quatro vistas direcionais e dois passos por direção para cada forma, depois que a leitura das atuais for validada.
- Quadros exclusivos de ataque, dano, recuperação e esquiva quando as ações exigirem poses próprias.
- Folhas de sprites com grade e pontos de ancoragem documentados, mais variantes sem espada apenas se uma habilidade realmente a retirar da mão.
- Quadros direcionais adicionais para os efeitos elementais, caso o playtest mostre que a rotação da folha atual não lê bem em todas as direções.
- Ícone curto de cada habilidade e arte do altar para explicar o desbloqueio de forma dentro da run.

## Validação ainda pendente

Typecheck, testes de regras e build local passaram após a integração das seis spritesheets. A checagem visual das habilidades no Pages e o teste físico no celular horizontal continuam pendentes. As habilidades e valores são uma primeira versão para playtest e podem ser ajustados sem alterar as combinações híbridas.
