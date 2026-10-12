# Guia de continuidade: Junq SoulKnight

Antes de qualquer alteração, ler `README.md` e `docs/01-REFERENCIA.md` a `docs/05-PESQUISA-BASES.md`; conferir o estado real do repositório e `docs/HANDOFF.md` se existir. O roadmap é intenção, não evidência de código implementado.

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

T006: três famílias de armas, drops, moeda e escolhas de recompensa. Antes, conferir o deploy da versão T005 e testar portas, teclado e toque no Android. Registrar qualquer limitação de dispositivo como pendência real.
