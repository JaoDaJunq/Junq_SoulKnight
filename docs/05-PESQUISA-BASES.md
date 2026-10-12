# 05 · Bases abertas pesquisadas

Pesquisa pública em 11/10/2026. **Repositório público não é permissão suficiente para copiar.** Licença do código e de cada asset precisam ser verificadas no commit efetivamente utilizado. Nenhum código, arte ou áudio externo foi incorporado ao Junq SoulKnight nesta etapa.

| Projeto | O que existe | Licença indicada no repositório | Uso recomendado |
| --- | --- | --- | --- |
| [Dungeon Crawler Now](https://github.com/JohnVonDrashek/dungeon-crawler-now) | Phaser 3 + TS + Vite; geração de salas/corredores, portas que fecham, classes de inimigo, loot, chefes, minimapa, save e demo em Pages. | MIT no README e arquivo LICENSE. | **Principal referência de arquitetura e implementação de salas.** Fazer prova de conceito mobile; não assumir que seu layout/input serve para toque. |
| [Browser-Based Dungeon Shooter](https://github.com/stellar-flame/browser-game) | Phaser 3 + TS; salas procedurais, colisão, armas, inimigos e deploy no Pages. | MIT no README/LICENSE. | Comparar solução de encontro, porta e arma; alternativa caso a primeira base seja complexa demais. |
| [Abyss Engine](https://github.com/jorge-erdb/abyss-engine) | Canvas JS sem build; grafo de salas, chefe, melhorias, HUD, dois sticks móveis e jogo por browser. | MIT no README/LICENSE. | Referência direta para toque, legibilidade e loop; arquitetura global simples demais para copiar integralmente em um projeto crescente. |
| [Dungeon Dash](https://github.com/mipearson/dungeondash) | Phaser 3 + TS; experimento de dungeon com visão e gerador. | MIT **salvo indicação em contrário** no README. | Estudar algoritmo de dungeon e diagnóstico; checar licenças próprias dos tiles/fontes antes de qualquer uso. |
| [Top-Down Phaser Template](https://github.com/rachel-nocode/topdown-phaser-template) | Template Vite/TS/Phaser com demo de arena, documentação e build. | MIT no repositório; README pede substituir arte/tema da demo antes de produto comercial. | Alternativa para inicializar projeto, **não como design de salas**; evitar transformar este projeto em survivor. |

## Escolha recomendada

Começar com um **esqueleto próprio mínimo** em Phaser 3/TS/Vite, estudando `Dungeon Crawler Now` para contratos de salas e `Abyss Engine` para toque/fluxo. Isso preserva escopo controlado e evita carregar sistemas e assets de outra obra. Se a implementação exigir uma peça madura, isolar a importação e manter copyright/aviso da licença MIT do autor. A decisão de copiar código depende da auditoria detalhada em T001.

## Outras opções e restrições

- [Godot Web export](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html) permite navegador e export nativo; a documentação cita WebGL 2 e ressalvas no navegador mobile. Reavaliar se a versão web falhar ou se o app passar a ser prioridade absoluta.
- [Soul Knight clone em Pygame](https://github.com/i9kin/soul-knight) serve para estudo, mas Pygame não é base conveniente para nosso Pages. Não há licença verificada nesta pesquisa, então não copiar.
- [Kenney Top-down Shooter](https://kenney.nl/assets/top-down-shooter), [Roguelike Caves & Dungeons](https://kenney.nl/assets/roguelike-caves-dungeons) e [Roguelike Characters](https://kenney.nl/assets/roguelike-characters) são packs indicados como **CC0** nas páginas oficiais. Podem servir como placeholders; conferir pacote baixado e manter registro de procedência. Não misturar escalas incompatíveis sem avaliação visual.

## Checklist antes de importar

1. Registrar URL, autor, commit/tag, arquivo específico e licença de **código, arte, som e fontes separadamente**.
2. Conferir dependências e arquivos que vieram de terceiros; MIT do repositório não converte automaticamente assets externos em MIT.
3. Copiar avisos de copyright/licença quando exigidos e atribuir no `CREDITS.md`.
4. Testar o trecho em Pages sob `/Junq_SoulKnight/` e no Android, medir tamanho, FPS e comportamento de toque.
5. Adaptar a identidade e mecânicas para a proposta Junq, sem usar nome, logo, personagens, mapas ou áudio de Soul Knight.

## Fontes técnicas de publicação

- [Vite: guia de deploy estático no GitHub Pages](https://vite.dev/guide/static-deploy.html), inclusive `base: '/Junq_SoulKnight/'`.
- [GitHub: workflow customizado de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [Capacitor: app nativo a partir de projeto web](https://capacitorjs.com/docs).
- [ChillyRoom: descrição oficial de Soul Knight](https://play.google.com/store/apps/details?id=com.ChillyRoom.DungeonShooter).
