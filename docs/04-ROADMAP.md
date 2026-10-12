# 04 · Etapas para concluir o jogo

Cada tarefa termina com commit/PR, teste no Pages quando houver interface, atualização deste documento e `docs/HANDOFF.md` contendo estado, decisões, evidência e próximo passo. Estimativas são de ordem e dependência, não promessa de datas. **T001–T008: aceitos para seguir pelo MVP em 12/10/2026. T009: em execução.** O teste anterior em navegador desktop observou derrota, limpeza da sala inicial e passagem pela porta. O usuário confirmou que testou e aprovou a continuidade; aparelho e FPS não foram informados. T010–T015: pendentes.

| ID | Entrega | Dependência | Aceite observável |
| --- | --- | --- | --- |
| T001 | Projeto Phaser 3/TS/Vite, scripts, lockfile, CI, Pages e tela de boot | documentação | Build limpo; URL pública abre no desktop e Android; assets sob subcaminho carregam. |
| T002 | Uma sala, movimento e input teclado/toque | T001 | Colisões, câmera e joystick utilizáveis em aparelho real; perder foco pausa. |
| T003 | Tiro, um inimigo, vida, dano, derrota e reinício | T002 | Do menu à derrota e ao reinício sem recarregar a página. **Primeiro jogável.** |
| T004 | Desvio, habilidade provisória, dois novos inimigos e feedback de combate | T003 | Ataques legíveis, recargas visíveis, sem colisão duplicada. |
| T005 | Grafo de 5 a 7 salas, portas, layouts, spawns e minimapa | T003 | 100 seeds conectadas; nenhuma porta ou jogador bloqueado; limpar abre saídas. |
| T006 | Três famílias de armas, drops, moeda e recompensas | T004, T005 | Disparo básico e armas extras em baús, com custos de energia distintos; run continua entre salas. Ajuste de mira/energia/baús em 12/10/2026. |
| T007 | Chefe com ataques sinalizados e encerramento da run | T006 | Vitória e derrota completas; relatório com seed e tempo. **Vertical slice P1.** |
| T008 | Playtest P1 e revisão de desempenho/controles | T007 | Testes no Android e desktop; bugs de bloqueio e mortes sem feedback corrigidos. **Aceite do MVP para seguir em 12/10/2026.** Não há registro de aparelho, FPS ou run completa, então esses casos permanecem em observação para o beta. |
| T009 | Direção de arte autoral, UI final, áudio licenciado e créditos | T008 | Origem/licença rastreável para cada asset; leitura do combate preservada. **Em andamento:** cenário, silhuetas, HUD e recompensa redesenhados em código; sons Web Audio originais com mudo imediato e limite de repetição; créditos registrados. Desktop visual no Pages; falta ouvir em aparelho e conferir baú em partida. |
| T010 | Personagens Junq adicionais, segundo bioma e novos encontros | T008, T009 | Kits diferentes com balanceamento; conteúdo atravessa run completa. |
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
