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

T010: ampliar o conteúdo da run. Segunda região e sentinela já foram publicadas. O MVP rejeitou a prancha futurista, aprovou com entusiasmo a v0.2 em pixel art e pediu sua integração. A primeira entrega visual inclui abertura, seleção de Jão/Alice/Gui, sprites estáticos, cenário e HUD de aventura; conferir `docs/HANDOFF.md` para evidência da publicação. Os três compartilham kit provisório. Próximo: animações direcionais, kits próprios, balanceamento e refinamento de regiões. Não importar sprites ou poderes de outros projetos automaticamente. O MVP adiou testes de aparelho; registrar verificações possíveis em desktop/CI e manter validações físicas para o beta.
