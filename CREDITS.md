# Créditos e procedência

## Código e conteúdo desta versão

| Item | Origem | Licença / condição |
| --- | --- | --- |
| Obstáculos, portas, altar, baú de relíquias e HUD | Desenhados em código neste repositório (`src/scenes/ArenaScene.ts`, `src/content/biomes.ts`) para Junq SoulKnight | Conteúdo original deste projeto. |
| Efeitos sonoros | Osciladores Web Audio com envelopes próprios (`src/audio/Soundscape.ts`); nenhum arquivo de áudio externo | Conteúdo original deste projeto. |
| Tipografia | Fontes do sistema do aparelho (`Georgia`, `system-ui`) | Nenhum arquivo de fonte distribuído. |
| Quatro imagens de conceito visual v0.2 em `docs/visual/` | Geradas para este projeto com ferramenta de imagem a partir de fotos fornecidas pelo MVP como referência de Jão, Alice e Gui; direção e seleção nesta documentação. Fotos originais não incluídas no repositório. | Conceitos aprovados como direção; os mockups não são carregados na build. Não incorporam imagens de Soul Knight. |
| Abertura, taverna, salas do Átrio e da Forja, sprites de Jão/Alice/Gui e poses de caminhada em `src/assets/` | Gerados para este projeto a partir da direção visual aprovada e das fotos fornecidas pelo MVP. Recortados e otimizados para uso na build; fotos originais não publicadas. | Assets originais deste projeto, sem imagem de Soul Knight incorporada. |
| Diabrete de Brasa, Acólito do Véu, Olho da Forja, Guardião de Musgo e Vigia do Sino em `src/assets/` | Criaturas geradas para este jogo, recortadas e otimizadas; comportamento implementado no código. | Assets originais deste projeto, sem imagem de Soul Knight incorporada. |
| Jão Fogo e Plasma, oito poses em `src/assets/` | Derivadas dos sprites aprovados do Jão por troca de paleta da roupa, ombreiras e insígnia com `scripts/make_jao_forms.py`. Nenhuma foto adicional foi publicada. | Derivação original deste projeto. |
| Flecha e três cartas de projétil em `src/assets/`; armas da iteração anterior arquivadas | Pixel art desenhada por primitivas no script reproduzível `scripts/make_weapon_art.py`. Os projéteis seguem na build; a espada, arco e leque separados não são mais carregados. | Conteúdo original deste projeto. |
| Três pranchas aprovadas em `docs/visual/*-arma-aprovada.webp`; seis matrizes transparentes em `art/sheets/`; PNGs `*-armed`, `*-attack` e `*-select` | Pranchas e poses geradas para este projeto com referências dos sprites autorais anteriores. `scripts/build_approved_sprites.py` recorta e alinha os frames e deriva as formas do Jão. As fotografias fornecidas pelo MVP não são distribuídas. | Conteúdo original deste projeto; nenhuma arte de Soul Knight incorporada. As antigas armas em camada separada ficam apenas como registro da iteração anterior. |
| Engine e build | Phaser 3, TypeScript e Vite | Dependências sob suas licenças próprias no lockfile e pacotes. |

Soul Knight é referência de ritmo e mecânicas. Não são usados seus personagens, sprites, músicas, logotipo ou mapas. Os repositórios e pacotes listados em `docs/05-PESQUISA-BASES.md` foram estudados, sem código ou assets copiados para este jogo.

Antes de adicionar um asset externo, registrar nesta tabela o autor, URL, versão do arquivo e licença específica; incluir o texto da licença quando exigido.
