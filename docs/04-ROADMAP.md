# 04 · Etapas para concluir o jogo

**T010 · revisão em execução:** o facing agora usa o deslocamento permitido após colisões; poses laterais de ataque aparecem durante movimento; Alice e Gui fazem pose ao usar suas habilidades em área; o golpe básico do Jão sinaliza a faixa do corte. Typecheck, 17 testes e build passaram localmente. CI/deploy e inspeção visual da partida seguem pendentes.

Cada tarefa termina com commit/PR, teste no Pages quando houver interface, atualização deste documento e `docs/HANDOFF.md` contendo estado, decisões, evidência e próximo passo. Estimativas são de ordem e dependência, não promessa de datas. **T001–T008: aceitos para seguir pelo MVP. T009: implementação publicada; validação em aparelho adiada pelo MVP em 12/10/2026. T010: em execução.** T011–T015: pendentes.

| ID | Entrega | Dependência | Aceite observável |
| --- | --- | --- | --- |
| T001 | Projeto Phaser 3/TS/Vite, scripts, lockfile, CI, Pages e tela de boot | documentação | Build limpo; URL pública abre no desktop e Android; assets sob subcaminho carregam. |
| T002 | Uma sala, movimento e input teclado/toque | T001 | Colisões, câmera e joystick utilizáveis em aparelho real; perder foco pausa. |
| T003 | Tiro, um inimigo, vida, dano, derrota e reinício | T002 | Do menu à derrota e ao reinício sem recarregar a página. **Primeiro jogável.** |
| T004 | Desvio, habilidade provisória, dois novos inimigos e feedback de combate | T003 | Ataques legíveis, recargas visíveis, sem colisão duplicada. |
| T005 | Grafo de 5 a 7 salas, portas, layouts, spawns e minimapa | T003 | 100 seeds conectadas; nenhuma porta ou jogador bloqueado; limpar abre saídas. |
| T006 | Três famílias de ataques, drops, moeda e recompensas | T004, T005 | Disparo com mira automática e custo de energia distinto; run continua entre salas. O sistema anterior de armas extras em baús foi substituído por equipamento inicial de cada herói e altares elementais em T010. |
| T007 | Chefe com ataques sinalizados e encerramento da run | T006 | Vitória e derrota completas; relatório com seed e tempo. **Vertical slice P1.** |
| T008 | Playtest P1 e revisão de desempenho/controles | T007 | Testes no Android e desktop; bugs de bloqueio e mortes sem feedback corrigidos. **Aceite do MVP para seguir em 12/10/2026.** Não há registro de aparelho, FPS ou run completa, então esses casos permanecem em observação para o beta. |
| T009 | Direção de arte autoral, UI, áudio e créditos | T008 | Origem rastreável para cada asset; leitura do combate preservada. A v0.2 em pixel art foi aprovada e integrada em abertura, seleção, Átrio, Forja, personagens e HUD. Sons Web Audio originais com mudo. O novo altar e inimigos têm arte própria; faltam refinamento e escuta em aparelho. |
| T010 | Personagens Junq, masmorras e afinidades | T008, T009 | Jão/Alice/Gui com espada, arco e cartas; cinco fases por mundo, chefe na quinta, baús 1/5 e 3/5, altares 2/5 e 4/5. Três regiões visuais iniciais, cinco criaturas, relíquias de vida/escudo/energia, Plasma e Lodo. **Implementado:** seis formas puras do Jão (Terra, Água, Fogo, Raio, Luz e Sombra) com roupas/sprites e habilidades próprias; modo ADM por `?admin=1` para selecionar formas, invocar inimigos e restaurar vida/energia; escala das formas alinhada à altura visível do Jão base; ciclos lateral e vertical refinados; seis poses de ataque lateral autorais no mesmo canvas e baseline; forma Raio v2 sem espada, com descarga na mão. Seis spritesheets transparentes de quatro quadros continuam ligadas às habilidades puras; as regras de dano, alcance e deslocamento foram preservadas. Alice mantém a rajada de flechas e Gui o leque de cartas (commits anteriores `d910a72`, `d42fc7f`); typecheck, quatro arquivos de testes e build passam localmente. O Pages foi aberto após o deploy: seleção, arena e forma Raio via ADM foram observadas. **Correção anterior:** vazamento na borda da prancha da Terra removido de duas poses e caminhada alinhada à direção do movimento enquanto ataca (PR #5; deploy [Actions 38427617264](https://github.com/JaoDaJunq/Junq_SoulKnight/actions/runs/38427617264)); a inspeção visual posterior foi bloqueada pelo navegador desta sessão. **Correção publicada nesta revisão:** [PR #7](https://github.com/JaoDaJunq/Junq_SoulKnight/pull/7), commit [`bd89b0e`](https://github.com/JaoDaJunq/Junq_SoulKnight/commit/bd89b0e04cdbffa5e473aa45ee39f3e542895b11). A arte Terra v2 tem seis poses alinhadas, incluindo dois passos frontais alternados a 8 fps; durante movimento, o facing segue a direção percorrida mesmo quando ataca. `python3 scripts/build_jao_elemental_sprites.py`, `npm run typecheck`, `npm test` (4/4) e `npm run build` passaram localmente e no [deploy Actions 38431375793](https://github.com/JaoDaJunq/Junq_SoulKnight/actions/runs/38431375793), concluído com sucesso. Ainda falta inspecionar a animação visualmente no Pages e testar em celular horizontal. **Cripta publicada:** [PR #9](https://github.com/JaoDaJunq/Junq_SoulKnight/pull/9) adiciona arte própria ao mundo 3 e a cena carrega o fundo para o bioma `crypt`; [deploy Actions 38496776450](https://github.com/JaoDaJunq/Junq_SoulKnight/actions/runs/38496776450) concluiu com sucesso. A inspeção visual em partida ainda está pendente. **Em execução:** conferir as poses de ataque e o fundo da Cripta no Pages via ADM, percorrer a run, criar formas dos outros heróis e balancear em aparelho. Ver [formas/assets do Jão](09-JAO-SINTONIAS-E-ASSETS.md), [masmorras](08-MASMORAS-E-RELIQUIAS.md) e [modo ADM](10-MODO-ADM-VALIDACAO.md).
| T011 | Hub, desbloqueios, save com migração, opções e onboarding | T008 | Persistência após fechar/reabrir; reset e recuperação de save inválido. |
| T012 | Beta fechado e polimento | T009–T011 | Jogadores novos concluem tentativa; erros de console, input e save monitorados. |
| T013 | Lançamento web | T012 | CI e Pages verdes, créditos, instruções, changelog e teste final em dispositivos. |
| T014 | PWA e protótipo de app Android | T013 | Instalação e run completa com controles/áudio/save validados em APK de teste. |
| T015 | Distribuição Android e estudo de iOS | T014 | Assinatura, builds e testes documentados; iOS só após validação própria. |

## Ordem de execução detalhada

### Fase 0: chão firme, T001

Criar projeto vazio funcional, fixar dependências, uma tela com botão de iniciar, CI e deploy. Registrar versão Node, browser e aparelhos de teste. O deploy para Pages requer ativar a fonte GitHub Actions nas configurações do repositório. Não incorporar repositório externo antes de comparar código, licença e assets.

### Fase 1: sensação de jogo, T002–T004

Construir uma sala **manual** antes do gerador. Afinar movimento, tiro, dano e toque. O usuário pode jogar no link desde T003. Testar posição do joystick com polegar real, visibilidade dos botões e taxa de quadros.

### Fase 2: estrutura roguelite, T005–T007

Separar grafo de salas de layout visual; garantir sala inicial, recompensa e chefe. Criar portas/encounters, escolhas de armas/melhorias e uma run com começo e fim. Capturar seed no resultado para reproduzir bugs.

### Fase 3: identidade e conteúdo, T008–T011

Usar evidência do playtest para corrigir ritmo e dificuldade. Só então fechar estilo dos heróis e criar animações, áudio e conteúdo adicional. Inventariar material anterior antes de reaproveitar qualquer sprite. Persistência offline versionada.

### Fase 4: entrega, T012–T015

Beta, correções, web estável, PWA e app. O app deve reutilizar conteúdo e regras; adaptação de controles e desempenho pode exigir trabalho extra. Multiplayer fica em backlog separado após o jogo solo funcionar.

## Padrão de conclusão de cada tarefa

- Código e documentação coerentes; mudanças reversíveis em branch de trabalho e PR para `main` quando houver revisão.
- Typecheck, testes de regra pertinentes e build passam; não criar testes que só espelhem a implementação.
- Se visual/controle mudou, abrir no navegador real, preferencialmente Android, e registrar resultado, aparelho e eventuais falhas.
- `docs/HANDOFF.md` aponta versão, última tarefa, como rodar, riscos reais e próximo ID. Nunca marcar uma fase como concluída por ter apenas arquivos criados.

## Backlog pós-lançamento

Cooperativo, cloud save, novos modos, biomas adicionais, eventos e distribuição iOS. Cada item requer proposta, custo e critério próprios antes de entrar no roadmap ativo.
