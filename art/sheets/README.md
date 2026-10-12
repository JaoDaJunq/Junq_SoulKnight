# Matrizes dos heróis armados

Estas folhas WebP com transparência são matrizes de trabalho geradas para o jogo a partir das três pranchas conceituais aprovadas pelo MVP em 12/10/2026. `jao.webp` e `jao-walk2.webp` continuam em uso. `alice-chibi.webp` e `gui-chibi.webp` substituem as matrizes altas: têm frente, dois passos para a direita, ataque para a direita e costas na proporção compacta do Jão. `alice.webp`, `gui.webp` e as respectivas `*-walk2.webp` preservam a iteração anterior como histórico, mas não são carregadas pelo script atual.

`python scripts/build_approved_sprites.py` extrai, alinha e reduz os personagens para os PNGs carregados em `src/assets/`. Cada frame de jogo usa canvas 224 × 160, corpo ancorado em x=80, pés em y=150; a seleção usa recorte 160 × 160. O jogo não carrega estas matrizes nem as pranchas de conceito. As variantes Fogo e Plasma do Jão são geradas a partir das mesmas poses, preservando espada e silhueta.

Se uma folha for substituída, revise os limites e centros em `SHEETS`/`ALTERNATE` no script, gere novamente e confira as poses na escala de jogo antes de publicar.
