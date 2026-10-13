# Junq SoulKnight

Planejamento de um jogo autoral 2D de ação, roguelite e tiro com visão superior, inspirado no **ritmo de salas, escolhas e combates** de Soul Knight. Nome de trabalho; título, mundo e arte finais serão próprios. Primeiro destino: navegador e GitHub Pages. Depois: aplicativo Android e, se fizer sentido, iOS.

> Estado em 13/10/2026: **vertical slice web aprovado pelo MVP para avançar** no [GitHub Pages](https://jaodajunq.github.io/Junq_SoulKnight/). Mira automática e energia permanecem; baús de armas deram lugar a altares de afinidade. A direção de pixel art inclui abertura, seleção, salas do Átrio/Forja, HUD e inimigos próprios. O Jão transforma roupa e sprites ao chegar a 5 pontos em Terra, Água, Fogo, Raio, Luz ou Sombra; cada forma tem habilidade própria. O modo ADM para validar formas e inimigos foi adicionado; falta playtest visual de cada habilidade. T010 continua em execução. Não há APK.

**Nova estrutura em validação:** masmorras de cinco fases com chefe em 5/5; dois baús de relíquias e dois altares de afinidade por mundo. Jão empunha espada e corta em arco de perto, Alice dispara flecha única com seu arco e Gui arremessa cartas ilustradas. O mundo 3 termina com opção de encerrar ou continuar. As seis formas puras do Jão incluem roupa, sprites e habilidades próprias; Plasma e Lodo continuam como as duas primeiras fusões jogáveis. Ver [regras da etapa](docs/08-MASMORRAS-E-RELIQUIAS.md) e [formas e assets do Jão](docs/09-JAO-SINTONIAS-E-ASSETS.md). As descrições antigas de seis salas e cinco altares abaixo são o histórico do vertical slice anterior, não o fluxo desta build.

**Arte dos heróis:** as [três pranchas aprovadas](docs/06-DIRECAO-VISUAL.md) orientam sprites novos de seleção, caminhada e ataque com as armas desenhadas junto ao corpo. A espada, o arco e as cartas não dependem mais de uma camada solta sobre o personagem. Os projéteis e a lógica de combate continuam os mesmos.

Alice e Gui foram reajustados à proporção compacta do Jão nas poses de seleção, movimento e ataque. As matrizes ficam em `art/sheets/`; `python scripts/build_approved_sprites.py` regenera os PNGs com Pillow.

## O jogo em uma frase

Escolha um herói Junq, atravesse salas conectadas, desvie de projéteis, use ataque e habilidade, escolha recompensas e derrote o chefe para concluir uma run curta. Ao morrer, a run termina e o jogador volta ao hub com apenas os desbloqueios permanentes previstos.

## Como se joga

1. Selecionar personagem no hub e iniciar uma run.
2. Entrar em uma sala. Salas de combate fecham as portas até os inimigos serem derrotados.
3. Mover, atirar no alvo indicado automaticamente, desviar, usar habilidade e administrar vida e energia.
4. Recolher moedas; após a sala 1/5 ou 3/5, escolher uma relíquia no baú; após 2/5 ou 4/5, escolher um fragmento no altar.
5. Derrotar o chefe em 5/5, atravessar para o próximo mundo e, depois do mundo 3, decidir encerrar ou continuar.
6. Voltar ao hub; a próxima tentativa muda a combinação de salas, inimigos e recompensas.

O diferencial planejado é um elenco Junq de estilos de combate distintos e escolhas entre salas com risco e recompensa. **Não é a migração automática do Junq Bullet:** aquele projeto trabalha com hordas em arena e tiro automático; aqui há salas exploráveis, mira automática acionada pelo botão de disparo, energia e decisões de rota.

## Primeira versão jogável

O primeiro recorte tinha um andar com seis salas. A expansão atual organiza a run em **cinco fases por mundo**, com chefe na quinta. O Átrio, a Forja de Âmbar e a Cripta das Velas formam os três primeiros mundos; mundos adicionais repetem provisoriamente as paletas. Há cinco criaturas, moedas, cura comprável, energia, desvio, resultados por seed, pausa e controles de teclado/mouse e toque. O jogo ocupa a área visível do celular na horizontal e tenta entrar em tela cheia ao começar. No retrato, pede para girar o aparelho. Não depende de conta, servidor ou banco de dados.

## Controles desta versão

| Plataforma | Movimento | Ataque e ações |
| --- | --- | --- |
| Desktop | WASD ou setas | Segurar clique para atirar automaticamente no inimigo visível mais próximo; Espaço desvia; E usa habilidade; H compra cura por 3 moedas após limpar sala; Esc pausa. |
| Celular horizontal | Joystick na parte inferior esquerda | Segurar ATIRAR para atacar com mira automática; botões de desvio e habilidade à direita; toque no baú ou altar após o combate e escolha uma recompensa. |

Cada ataque consome energia conforme o herói, de 5 a 8 pontos. A barra começa em 100 e volta após uma breve pausa nos ataques; relíquias podem ampliá-la. Sem energia suficiente ou sem inimigo visível, o personagem espera. O Jão corta em arco num alcance de 120 unidades e precisa se aproximar; Alice dispara uma flecha com ponta e penas; Gui arremessa cartas com borda e naipe. Recolha moedas encostando nelas. As portas abrem após limpar a sala; siga pela direita. O HUD mostra Fogo, Água, Raio, Vento, Terra, Sombra e Luz, todos iniciando em 0. Cinco pontos no mesmo elemento formam domínio puro; três em Fogo e três em Raio ativam Plasma, e três em Água e três em Terra ativam Lodo. A Cripta ainda reutiliza cenário recolorido; arte própria virá depois. Acrescente `?debug=1` à URL para ver FPS.

Para validar sem repetir a run, acrescente `?admin=1`: o botão **ADM** da arena ou **F2** abre um painel que seleciona a forma base ou uma das seis formas puras do Jão, invoca inimigos e restaura vida/energia. Guia: [Modo ADM](docs/10-MODO-ADM-VALIDACAO.md).

Os efeitos sonoros são sintetizados no navegador após o botão JOGAR. Use **SOM** no topo direito para silenciar ou reativar. A arte e os sons desta passagem são originais e estão registrados em [CREDITS.md](CREDITS.md).

Para reproduzir a geração de salas e ofertas de afinidade de uma tentativa, use `?seed=123456` na URL com a seed mostrada no resultado. A seed deve ser um inteiro de 0 a 4294967295; sem ela, cada tentativa gera uma nova. O tempo de ações e movimentos continua dependendo de como a run é jogada.

## Stack proposta

- **Phaser 3.90.0 + TypeScript 5.9.3 + Vite 8.3.4:** cliente web 2D com versões fixadas em `package-lock.json`.
- **Dados em módulos/JSON tipados:** personagens, armas, inimigos, salas e progressão separados da lógica.
- **GitHub Actions + Pages:** `npm ci`, checagens, build e deploy do diretório `dist/`. Pages está configurado para GitHub Actions; `base` do Vite é `/Junq_SoulKnight/`.
- **Save local versionado:** configurações e desbloqueios no navegador, com migração de esquema e opção de reset. Não prometer sincronização entre dispositivos.
- **App depois da versão web:** avaliar Capacitor com o mesmo jogo web, validar desempenho e controles em Android; iOS exige uma etapa própria de compilação e testes. PWA pode anteceder o APK.

**Páginas do planejamento:** [análise do jogo](docs/01-REFERENCIA.md) · [design da run](docs/02-GAME-DESIGN.md) · [arquitetura](docs/03-ARQUITETURA.md) · [roadmap executável](docs/04-ROADMAP.md) · [bases abertas e licenças](docs/05-PESQUISA-BASES.md) · [direção visual](docs/06-DIRECAO-VISUAL.md) · [afinidades e heróis](docs/07-AFINIDADES-E-PERSONAGENS.md) · [masmorras e relíquias](docs/08-MASMORRAS-E-RELIQUIAS.md) · [formas/assets do Jão](docs/09-JAO-SINTONIAS-E-ASSETS.md) · [modo ADM](docs/10-MODO-ADM-VALIDACAO.md) · [guia para continuar o projeto](AGENTS.md).

## Próximo passo

Validar as seis formas puras do Jão em runs e no Pages, incluindo a leitura dos sprites e efeitos de habilidade; depois completar a forma de Vento, detalhar as formas de Alice e Gui e testar fusões futuras. O MVP adiou a validação física; quando testar, conferir controles, projéteis, aviso da sentinela, áudio e HUD no celular horizontal. T010 continua aberto. Leia o [handoff atual](docs/HANDOFF.md). As bases abertas pesquisadas são fontes de estudo; não foram incorporadas.

## Fontes essenciais

- [Soul Knight na Google Play, descrição da ChillyRoom](https://play.google.com/store/apps/details?id=com.ChillyRoom.DungeonShooter)
- [Dungeon Crawler Now, código e licença MIT](https://github.com/JohnVonDrashek/dungeon-crawler-now)
- [Guia oficial do Vite para GitHub Pages](https://vite.dev/guide/static-deploy.html)
- [GitHub Pages com workflow próprio](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
