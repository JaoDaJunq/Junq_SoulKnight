# Junq SoulKnight

Planejamento de um jogo autoral 2D de ação, roguelite e tiro com visão superior, inspirado no **ritmo de salas, escolhas e combates** de Soul Knight. Nome de trabalho; título, mundo e arte finais serão próprios. Primeiro destino: navegador e GitHub Pages. Depois: aplicativo Android e, se fizer sentido, iOS.

> Estado em 12/10/2026: **vertical slice web aprovado pelo MVP para avançar** no [GitHub Pages](https://jaodajunq.github.io/Junq_SoulKnight/). Mira automática, energia e baús estão implementados. A arte e os sons originais de T009 foram publicados; o usuário fará os testes subjetivos depois. T010 começou com uma segunda região e novo encontro. A direção de pixel art foi aprovada e a primeira integração inclui abertura, seleção de Jão/Alice/Gui, salas próprias do Átrio e da Forja, HUD quente e inimigos em grade. Os três compartilham o kit provisório; animações e kits próprios seguem em T010. Não há APK.

## O jogo em uma frase

Escolha um herói Junq, atravesse salas conectadas, desvie de projéteis, use ataque e habilidade, escolha recompensas e derrote o chefe para concluir uma run curta. Ao morrer, a run termina e o jogador volta ao hub com apenas os desbloqueios permanentes previstos.

## Como se joga

1. Selecionar personagem no hub e iniciar uma run.
2. Entrar em uma sala. Salas de combate fecham as portas até os inimigos serem derrotados.
3. Mover, atirar no alvo indicado automaticamente, desviar, usar habilidade e administrar vida e energia.
4. Recolher moedas, abrir baús após limpar as salas de recompensa e decidir se equipa a arma encontrada.
5. Explorar o mapa, concluir o andar, enfrentar o chefe e avançar ou encerrar a run.
6. Voltar ao hub; a próxima tentativa muda a combinação de salas, inimigos e recompensas.

O diferencial planejado é um elenco Junq de estilos de combate distintos e escolhas entre salas com risco e recompensa. **Não é a migração automática do Junq Bullet:** aquele projeto trabalha com hordas em arena e tiro automático; aqui há salas exploráveis, mira automática acionada pelo botão de disparo, energia e decisões de rota.

## Primeira versão jogável

Uma run de um andar, 5 a 7 salas conectadas, um personagem provisório, ataque, desvio, habilidade, três famílias de inimigos, três famílias de equipamento, duas salas de recompensa, um chefe, tela de resultado e controles de teclado/mouse e toque. Arte provisória própria ou com licença verificada. Esse recorte é uma **proposta de produção**, não uma descrição do Soul Knight original.

O vertical slice tem **seis salas conectadas**, dois baús após combate, ataque básico e duas armas extras com padrões diferentes, moedas derrubadas pelos inimigos, cura comprável, chefe com ataque sinalizado, resultado com seed, dano e tempo, pausa e reinício. O jogo ocupa a área visível do celular na horizontal e tenta entrar em tela cheia ao começar. No retrato, pede para girar o aparelho. Em navegadores que não permitem tela cheia, continua jogável na área visível. Não depende de conta, servidor ou banco de dados.

Na primeira expansão de conteúdo, o caminho final da mesma run entra na **Forja de Âmbar**. A região muda pisos e obstáculos e substitui o atirador por uma sentinela fixa. Ela mostra uma linha e um círculo de aviso antes de lançar três projéteis alaranjados. Cada seed garante pelo menos uma sala da Forja antes do chefe e um baú nessa região. Ainda são seis salas ao todo; Jão, Alice e Gui são selecionáveis com kit compartilhado nesta primeira entrega visual.

## Controles desta versão

| Plataforma | Movimento | Ataque e ações |
| --- | --- | --- |
| Desktop | WASD ou setas | Segurar clique para atirar automaticamente no inimigo visível mais próximo; Espaço desvia; E usa pulso; H compra cura por 3 moedas após limpar sala; Esc pausa. |
| Celular horizontal | Joystick na parte inferior esquerda | Segurar ATIRAR para disparar com mira automática; botões de desvio e pulso à direita; toque no baú para abrir e decidir se equipa. |

Cada disparo consome energia conforme a arma, de 4 a 14 pontos. A barra tem 100 pontos e volta após uma breve pausa nos disparos. Sem energia suficiente, a arma espera recarga. Sem inimigo visível, segurar o botão não gasta energia. Recolha as moedas encostando nelas. As portas vermelhas abrem após limpar a sala; avance pela porta verde. Em duas salas, toque no baú revelado depois do combate para encontrar uma arma e escolher entre equipar ou manter a atual. O chefe fica na sala mais distante do início. Acrescente `?debug=1` à URL para ver o FPS durante um teste.

Os efeitos sonoros são sintetizados no navegador após o botão COMEÇAR. Use **SOM** no topo direito para silenciar ou reativar. A arte e os sons desta passagem são originais e estão registrados em [CREDITS.md](CREDITS.md).

Para reproduzir a geração de salas e baús de uma tentativa, use `?seed=123456` na URL com a seed mostrada no resultado. A seed deve ser um inteiro de 0 a 4294967295; sem ela, cada tentativa gera uma nova. O tempo de ações e movimentos continua dependendo de como a run é jogada.

## Stack proposta

- **Phaser 3.90.0 + TypeScript 5.9.3 + Vite 8.3.4:** cliente web 2D com versões fixadas em `package-lock.json`.
- **Dados em módulos/JSON tipados:** personagens, armas, inimigos, salas e progressão separados da lógica.
- **GitHub Actions + Pages:** `npm ci`, checagens, build e deploy do diretório `dist/`. Pages está configurado para GitHub Actions; `base` do Vite é `/Junq_SoulKnight/`.
- **Save local versionado:** configurações e desbloqueios no navegador, com migração de esquema e opção de reset. Não prometer sincronização entre dispositivos.
- **App depois da versão web:** avaliar Capacitor com o mesmo jogo web, validar desempenho e controles em Android; iOS exige uma etapa própria de compilação e testes. PWA pode anteceder o APK.

**Páginas do planejamento:** [análise do jogo](docs/01-REFERENCIA.md) · [design da run](docs/02-GAME-DESIGN.md) · [arquitetura](docs/03-ARQUITETURA.md) · [roadmap executável](docs/04-ROADMAP.md) · [bases abertas e licenças](docs/05-PESQUISA-BASES.md) · [direção visual proposta](docs/06-DIRECAO-VISUAL.md) · [guia para continuar o projeto](AGENTS.md).

## Próximo passo

Aprimorar os [assets de pixel art](docs/06-DIRECAO-VISUAL.md) aprovados pelo MVP com animações e kits distintos para o trio; balancear as duas regiões. O MVP adiou a validação no aparelho; quando testar, conferir leitura dos projéteis e do aviso da sentinela, conforto do HUD, áudio e mudo no celular horizontal. O aceite de avanço de T008 foi dado pelo MVP; aparelho, FPS e run completa não foram registrados nesta sessão e continuam como observação para o beta. Leia o [handoff atual](docs/HANDOFF.md). As bases abertas pesquisadas são fontes de estudo; não foram incorporadas.

## Fontes essenciais

- [Soul Knight na Google Play, descrição da ChillyRoom](https://play.google.com/store/apps/details?id=com.ChillyRoom.DungeonShooter)
- [Dungeon Crawler Now, código e licença MIT](https://github.com/JohnVonDrashek/dungeon-crawler-now)
- [Guia oficial do Vite para GitHub Pages](https://vite.dev/guide/static-deploy.html)
- [GitHub Pages com workflow próprio](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
