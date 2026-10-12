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

T010: ampliar o conteúdo da run. Segunda região e sentinela já foram publicadas. Em 12/10/2026 o MVP **rejeitou** a primeira prancha futurista e pediu pixel art de aventura com Jão, Alice e Gui baseados em fotos. `docs/06-DIRECAO-VISUAL.md` v0.2 e quatro imagens de conceito são propostas abertas à revisão, não sprites aprovados ou assets integrados. Definir kits próprios para os personagens Junq e balancear após validação visual. Não importar sprites ou poderes de outros projetos automaticamente. O MVP adiou testes de aparelho; registrar verificações possíveis em desktop/CI e manter validações físicas para o beta.
