# Matrizes dos heróis armados

Estas seis folhas WebP com transparência são matrizes de trabalho geradas para o jogo a partir das três pranchas conceituais aprovadas pelo MVP em 12/10/2026. `jao.webp`, `alice.webp` e `gui.webp` têm frente, caminhada para a direita, ataque para a direita e costas. As folhas `*-walk2.webp` trazem o passo lateral alternado.

`python scripts/build_approved_sprites.py` extrai, alinha e reduz os personagens para os PNGs carregados em `src/assets/`. Cada frame de jogo usa canvas 224 × 160, corpo ancorado em x=80, pés em y=150; a seleção usa recorte 160 × 160. O jogo não carrega estas matrizes nem as pranchas de conceito. As variantes Fogo e Plasma do Jão são geradas a partir das mesmas poses, preservando espada e silhueta.

Se uma folha for substituída, revise os limites e centros em `SHEETS`/`ALTERNATE` no script, gere novamente e confira as poses na escala de jogo antes de publicar.
