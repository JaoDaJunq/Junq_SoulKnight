# Junq SoulKnight

Planejamento de um jogo autoral 2D de ação, roguelite e tiro com visão superior, inspirado no **ritmo de salas, escolhas e combates** de Soul Knight. Nome de trabalho; título, mundo e arte finais serão próprios. Primeiro destino: navegador e GitHub Pages. Depois: aplicativo Android e, se fizer sentido, iOS.

> Estado em 11/10/2026: **protótipo P0 implementado**. O código de T001–T003 compila e o CI passou, mas o Pages ainda precisa ser ativado em `Settings → Pages → Build and deployment → Source: GitHub Actions`. A experiência visual e os controles em Android ainda não foram verificados; não há APK.

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

O primeiro marco já tem código: **uma sala manual** com jogador, movimento, tiros, quatro inimigos perseguidores, dano, vitória/derrota, pausa e reinício. O suporte a teclado/mouse e toque está implementado e aguarda teste em dispositivo. Nada depende de conta, servidor ou banco de dados.

## Stack proposta

- **Phaser 3.90.0 + TypeScript 5.9.3 + Vite 8.3.4:** cliente web 2D com versões fixadas em `package-lock.json`.
- **Dados em módulos/JSON tipados:** personagens, armas, inimigos, salas e progressão separados da lógica.
- **GitHub Actions + Pages:** `npm ci`, checagens, build e deploy do diretório `dist/` após configurar Pages para GitHub Actions. Para este repositório, o `base` do Vite será `/Junq_SoulKnight/`.
- **Save local versionado:** configurações e desbloqueios no navegador, com migração de esquema e opção de reset. Não prometer sincronização entre dispositivos.
- **App depois da versão web:** avaliar Capacitor com o mesmo jogo web, validar desempenho e controles em Android; iOS exige uma etapa própria de compilação e testes. PWA pode anteceder o APK.

**Páginas do planejamento:** [análise do jogo](docs/01-REFERENCIA.md) · [design da run](docs/02-GAME-DESIGN.md) · [arquitetura](docs/03-ARQUITETURA.md) · [roadmap executável](docs/04-ROADMAP.md) · [bases abertas e licenças](docs/05-PESQUISA-BASES.md) · [guia para continuar o projeto](AGENTS.md).

## Próximo passo

Ativar Pages na configuração do repositório, rodar novamente o workflow e testar no Android real. Depois de aceitar T001–T003, seguir para T004. Leia o [handoff atual](docs/HANDOFF.md) antes de trabalhar. O repositório de referência é **fonte de estudo**; não foi copiado nem incorporado.

## Fontes essenciais

- [Soul Knight na Google Play, descrição da ChillyRoom](https://play.google.com/store/apps/details?id=com.ChillyRoom.DungeonShooter)
- [Dungeon Crawler Now, código e licença MIT](https://github.com/JohnVonDrashek/dungeon-crawler-now)
- [Guia oficial do Vite para GitHub Pages](https://vite.dev/guide/static-deploy.html)
- [GitHub Pages com workflow próprio](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
