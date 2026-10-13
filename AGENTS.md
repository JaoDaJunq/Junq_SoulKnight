# Guia de continuidade: Junq SoulKnight

Antes de qualquer alteração, ler `README.md`, `docs/01-REFERENCIA.md` a `docs/06-DIRECAO-VISUAL.md` e `docs/HANDOFF.md`; conferir o estado real do repositório. O roadmap e a direção visual proposta são intenção, não evidência de código implementado nem aprovação do MVP.

## Regras de trabalho

1. Pegue o primeiro ID pendente cujas dependências estejam atendidas; escreva escopo curto e critérios antes de programar.
2. Entregue uma parte jogável por vez, no Pages sempre que possível. Valide desktop e celular quando controles ou interface mudarem.
3. Use caminhos de asset compatíveis com o subcaminho `/Junq_SoulKnight/` e um build reproduzível com lockfile.
4. Não importar código/arte de Soul Knight. Bases abertas só entram após conferência de licença individual e registro em créditos.
5. Distinguir este jogo de Junq Bullet (hordas, arena e tiro automático) e Junqverse RPG (outro repositório). Personagens e sprites existentes não são autorização de reutilização automática.
6. Não introduzir backend, multiplayer ou pagamentos sem decisão explícita de escopo. Preserve estado de run reproduzível por seed e save local versionado.
7. Rodar checagens pertinentes e registrar resultados reais. Nunca afirmar que Pages/APK funciona sem abrir ou observar a publicação.
8. Ao terminar, atualizar o status em `docs/04-ROADMAP.md` e `docs/HANDOFF.md` com: commit/PR, tarefa, o que funciona, URL verificada, testes/aparelho, riscos e próximo ID.

## Próxima tarefa

T010: ampliar e validar o conteúdo da run. O MVP aprovou mundos de cinco fases, chefe em 5/5, altares nas fases 2 e 4 e baús de relíquia nas fases 1 e 3. Jão usa espada, Alice arco e Gui cartas; mundo 3 permite encerrar ou continuar. As seis formas puras do Jão (Terra, Água, Fogo, Raio, Luz e Sombra), com sprites e habilidades próprias, foram implementadas; Plasma e Lodo continuam como fusões iniciais. Ver `docs/08-MASMORRAS-E-RELIQUIAS.md`, `docs/09-JAO-SINTONIAS-E-ASSETS.md` e `docs/HANDOFF.md`. Próximo: validar cada habilidade numa run e no Pages; depois criar arte própria da Cripta, formas dos outros heróis e balancear a run longa. Não importar sprites ou poderes de outros projetos automaticamente. O MVP adiou testes de aparelho; registrar verificações desktop/CI e manter validação física para o beta.
