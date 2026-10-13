# 08 · Masmorras, relíquias e primeira sinergia

## Contrato da primeira versão jogável

A run começa em **mundo 1, fase 1/5**. Cada mundo tem cinco encontros em sequência. O chefe é sempre **5/5**. Vencê-lo abre a passagem para a próxima masmorra mantendo HP, escudo, energia, relíquias, moedas e afinidades. O mundo 1 mantém o Átrio; os mundos 2 a 6 ganham elencos de monstros e paletas próprios, aplicados sobre os cenários atuais. O terceiro mundo continua sendo a Cripta das Velas e o jogador ainda pode encerrar a expedição depois dele.

| Fase de cada mundo | Recompensa depois do combate |
| --- | --- |
| 1/5 | Baú: escolha uma relíquia entre três. |
| 2/5 | Altar: escolha um elemento entre três. |
| 3/5 | Baú: escolha uma relíquia entre três. |
| 4/5 | Altar: escolha um elemento entre três. |
| 5/5 | Chefe. Após os mundos 1 e 2, passagem; ao terminar o 3, encerrar ou continuar. |

O mapa das cinco etapas e os obstáculos variam por seed; o percurso dentro de cada mundo é linear nesta versão. No fim do mundo 3, o jogador decide encerrar a expedição com vitória ou seguir. Mundos 4 a 6 usam a mesma estrutura. Depois do mundo 6, o jogo percorre novamente os biomas dos mundos 2 a 6, com inimigos escalados pela dificuldade do mundo.

## Biomas e encontros

Cada prancha aprovada corresponde a um mundo e define quatro monstros comuns, dois elites e dois chefes. Em salas comuns, a seed escolhe monstros sem repetição dentro do grupo; a fase 4 também traz um elite. Na fase 5, um dos dois chefes daquele bioma é escolhido pela seed, com padrão de ataque próprio. Assim, uma mesma seed reproduz o encontro, enquanto runs diferentes variam o elenco.

| Mundo | Bioma | Monstros comuns | Elites | Chefes |
| --- | --- | --- | --- | --- |
| 1 | Átrio | Elenco atual | Elenco atual | Guardião atual |
| 2 | Mata de Esporos | Bolinha de Esporos, Raiz Espinhosa, Besouro Musgoso, Diabrete de Cipó | Cervo de Casca, Bruxa Micelial | Colosso de Raízes, Rainha Micelial |
| 3 | Cripta das Velas | Enxame de Crânios, Vulto de Mortalha, Cão de Ossos, Besouro-Caixão | Sentinela Tumular, Cantor das Covas | Rei Ossuário, Matriarca da Cripta |
| 4 | Ruínas Afogadas | Caranguejo de Recife, Afogado de Algas, Peixe-Lanterna, Rastejante de Concha | Guardião de Coral, Oráculo Salino | Raia Abissal, Titã das Marés |
| 5 | Cavernas de Cristal | Ácaro de Cristal, Mímico de Cascalho, Mariposa de Estilhaço, Larva Geódica | Sentinela Prismático, Fagulha Prismática | Escavador de Quartzo, Coração Geódico |
| 6 | Fenda do Eclipse | Sombrio Faminto, Máscara Rachada, Tentáculo do Vazio, Fagulha Faminta | Cavaleiro do Eclipse, Tecelão Gravitacional | Devorador de Estrelas, Fera do Eclipse |

Os encontros dos novos biomas reutilizam as cinco famílias de comportamento existentes (perseguidor, atirador, sentinela, resistente e chefe), com vida, velocidade, escala e cor definidas por criatura. Os dois chefes de cada mundo alternam entre padrões radiais, leques e rajadas direcionadas. A arte conceitual orienta os próximos sprites próprios; os retratos conceituais não são usados como textura de jogo.

## Baú de relíquias

Armas não são sorteadas. Jão inicia com espada, Alice com arco e Gui com cartas. As armas aparecem nas mãos durante o movimento. O ataque básico do Jão é um corte em arco de alcance 120, sem projétil; Alice dispara uma flecha por comando e Gui lança cartas de naipes alternados. Todos conservam mira automática e custo de energia. Uma escolha do baú vale até o fim da run. Ofertas dependem da seed e da sala; a mesma relíquia pode subir até nível 5.

| Relíquia | Efeito por nível |
| --- | --- |
| Anel Vital | +1 vida máxima e cura imediata de 1. |
| Armadura | +1 escudo; escudo absorve dano antes da vida e volta ao máximo após 8 segundos sem dano. |
| Pingente | +20 de energia máxima e restaura 20 ao escolher. |
| Runa de Fluxo | +20% na regeneração de energia. |

## Afinidade e evolução

São sete elementos, todos em zero no começo. Os altares das fases 2 e 4 oferecem seis fragmentos até o chefe do mundo 3. Dois elementos já investidos permanecem entre as três opções quando ainda podem crescer; a terceira varia. Isso permite perseguir 3 + 3 sem depender de sorte depois da decisão inicial.

- **Jão Fogo 5:** forma Ronin da Brasa com kimono carvão/rubro e espada incandescente; o corte detona uma explosão em torno do alvo. As cinco poses de arena recebem o novo traje, sem aura externa. As outras formas do Jão e seus golpes estão em [09 · Sintonias e assets](09-JAO-SINTONIAS-E-ASSETS.md).
- **Jão Raio 5:** mantém o corte que atravessa o alvo e termina atrás dele quando há espaço.
- **Plasma, Fogo 3 + Raio 3:** ataques rosados mais rápidos e fortes; habilidade ganha impacto aumentado. A forma do Jão muda para casaco violeta com detalhe luminoso. O efeito de cada herói usa sua arma original; a espada continua um corte corpo a corpo.
- **Lodo, Água 3 + Terra 3:** tiros esverdeados causam lentidão breve; a habilidade causa lentidão maior na área ou alvo atingido.

As outras misturas continuam com o bônus híbrido de dano e cor alternada. Elas **ainda não recebem nome, status ou habilidade exclusivos no código**. Se algum elemento chega a nível 5, o domínio puro tem prioridade sobre uma sinergia ativa. As árvores completas de cada herói, os pares restantes e os designs de outras formas são a próxima expansão, sujeitos a playtest.

![Comparação das primeiras formas do Jão](visual/jao-formas-v0.png)

## Aceite desta etapa

1. Começar com 0, ver 1/5 a 5/5, limpar uma sala, escolher relíquia e depois escolher afinidade.
2. O chefe em 5/5 abrir o mundo seguinte com a construção preservada. Mundo 3 oferecer encerrar ou continuar.
3. Seis altares até mundo 3, fase 4; Fogo 3 + Raio 3 ativar Plasma, Água 3 + Terra 3 ativar Lodo, e Fogo 5 manter seu domínio próprio.
4. Gui lançar cartas com naipe, Alice flecha reconhecível, Jão cortar de perto sem projétil; armas visíveis nas mãos e ataque com mira automática e custo de energia.
5. Seed repetir layout e ofertas. Verificar interface no Pages desktop; Android físico permanece validação do beta.

