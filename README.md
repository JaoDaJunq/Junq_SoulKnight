# Junq SoulKnight

Planejamento de um jogo autoral 2D de ação, roguelite e tiro com visão superior, inspirado no **ritmo de salas, escolhas e combates** de Soul Knight. Nome de trabalho; título, mundo e arte finais serão próprios. Primeiro destino: navegador e GitHub Pages. Depois: aplicativo Android e, se fizer sentido, iOS.

> Estado em 12/10/2026: **vertical slice web em validação** no [GitHub Pages](https://jaodajunq.github.io/Junq_SoulKnight/). T006 e T007 adicionam armas, moedas, recompensas e chefe. T008 inclui revisão de controles, tela horizontal preenchida e medidor de FPS opcional. Build e testes locais passaram; a run inteira e o Android real ainda exigem playtest. Não há APK.

## O jogo em uma frase

Escolha um herói Junq, atravesse salas conectadas, desvie de projéteis, use ataque e habilidade, escolha recompensas e derrote o chefe para concluir uma run curta. Ao morrer, a run termina e o jogador volta ao hub com apenas os desbloqueios permanentes previstos.

## Como se joga

1. Selecionar personagem no hub e iniciar uma run.
2. Entrar em uma sala. Salas de combate fecham as portas até os inimigos serem derrotados.
3. Mover, mirar/atirar, desviar, usar habilidade e administrar vida e recursos.
4. Recolher moedas e trocar equipamento ou escolher uma melhoria entre alternativas.
5. Explorar o mapa, concluir o andar, enfrentar o chefe e avançar ou encerrar a run.
6. Voltar ao hub; a próxima tentativa muda a combinação de salas, inimigos e recompensas.

O diferencial planejado é um elenco Junq de estilos de combate distintos e escolhas entre salas com risco e recompensa. **Não é a migração automática do Junq Bullet:** aquele projeto trabalha com hordas em arena e tiro automático; aqui a unidade básica é uma sala explorável e o combate é orientado por mirar, atacar e decidir por qual porta seguir.

## Primeira versão jogável

Uma run de um andar, 5 a 7 salas conectadas, um personagem provisório, ataque, desvio, habilidade, três famílias de inimigos, três famílias de equipamento, duas salas de recompensa, um chefe, tela de resultado e controles de teclado/mouse e toque. Arte provisória própria ou com licença verificada. Esse recorte é uma **proposta de produção**, não uma descrição do Soul Knight original.

O vertical slice tem **seis salas conectadas**, duas recompensas após combate, três armas com padrões diferentes, moedas derrubadas pelos inimigos, cura comprável, chefe com ataque sinalizado, resultado com seed, dano e tempo, pausa e reinício. O jogo ocupa a área visível do celular na horizontal e tenta entrar em tela cheia ao começar. No retrato, pede para girar o aparelho. Em navegadores que não permitem tela cheia, continua jogável na área visível. Não depende de conta, servidor ou banco de dados.

## Controles desta versão

| Plataforma | Movimento | Ataque e ações |
| --- | --- | --- |
| Desktop | WASD ou setas | Segurar clique para atirar; Espaço desvia; E usa pulso; H compra cura por 3 moedas após limpar sala; Esc pausa. |
| Celular horizontal | Joystick na parte inferior esquerda | Botões à direita para atirar, desviar e usar pulso; toque nos cartões de recompensa e na cura. |

Recolha as moedas encostando nelas. As portas vermelhas abrem após limpar a sala; avance pela porta verde. Duas salas oferecem uma escolha entre duas armas diferentes da equipada e mais dano. O chefe fica na sala mais distante do início. Acrescente `?debug=1` à URL para ver o FPS durante um teste.

## Stack proposta

- **Phaser 3.90.0 + TypeScript 5.9.3 + Vite 8.3.4:** cliente web 2D com versões fixadas em `package-lock.json`.
- **Dados em módulos/JSON tipados:** personagens, armas, inimigos, salas e progressão separados da lógica.
- **GitHub Actions + Pages:** `npm ci`, checagens, build e deploy do diretório `dist/`. Pages está configurado para GitHub Actions; `base` do Vite é `/Junq_SoulKnight/`.
- **Save local versionado:** configurações e desbloqueios no navegador, com migração de esquema e opção de reset. Não prometer sincronização entre dispositivos.
- **App depois da versão web:** avaliar Capacitor com o mesmo jogo web, validar desempenho e controles em Android; iOS exige uma etapa própria de compilação e testes. PWA pode anteceder o APK.

**Páginas do planejamento:** [análise do jogo](docs/01-REFERENCIA.md) · [design da run](docs/02-GAME-DESIGN.md) · [arquitetura](docs/03-ARQUITETURA.md) · [roadmap executável](docs/04-ROADMAP.md) · [bases abertas e licenças](docs/05-PESQUISA-BASES.md) · [guia para continuar o projeto](AGENTS.md).

## Próximo passo

Jogar uma run inteira no [Pages](https://jaodajunq.github.io/Junq_SoulKnight/) e testar em Android real, especialmente movimento e tiro simultâneos, escolha de recompensa, transição por portas, tela cheia, chefe e FPS. Corrigir os bloqueios encontrados antes de aceitar T008 e iniciar a arte/áudio de T009. Leia o [handoff atual](docs/HANDOFF.md). As bases abertas pesquisadas são fontes de estudo; não foram incorporadas.

## Fontes essenciais

- [Soul Knight na Google Play, descrição da ChillyRoom](https://play.google.com/store/apps/details?id=com.ChillyRoom.DungeonShooter)
- [Dungeon Crawler Now, código e licença MIT](https://github.com/JohnVonDrashek/dungeon-crawler-now)
- [Guia oficial do Vite para GitHub Pages](https://vite.dev/guide/static-deploy.html)
- [GitHub Pages com workflow próprio](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
