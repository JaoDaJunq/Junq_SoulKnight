# 02 · Documento de design jogável

**Visão:** roguelite de salas para browser e toque, com heróis autorais Junq. Nome e cenário definitivos pendentes de validação visual; usar placeholders durante a programação.

## Estados e fluxo

`BOOT → MENU/HUB → SELEÇÃO → MAPA/COMBATE ↔ RECOMPENSA → CHEFE → RESULTADO → HUB`.

Durante `MAPA/COMBATE`, `PAUSA` suspende simulação e áudio. Derrota vai a `RESULTADO`; sair voluntariamente mostra confirmação. Troca de tela não deve manter projéteis/inputs ativos.

## Conteúdo mínimo por marco

| Marco | Conteúdo | Critério de partida |
| --- | --- | --- |
| Protótipo P0 | Uma sala, herói provisório, tiro, inimigo perseguidor, dano, reinício. | Jogável no Pages em Android e desktop. |
| Vertical slice P1 | 5 a 7 salas, 3 inimigos (perseguidor, atirador, resistente), 3 armas (rápida, espalhada, alcance/ritmo diferente), habilidade, desvio, 5 altares, um chefe. | Terminar e perder uma run inteira sem bloqueio. |
| Beta P2 | 3 heróis de kits diferentes, 2 biomas, variedade de encontros, balanceamento, som, acessibilidade, onboarding, save local. | Jogadores novos entendem e completam uma run sem instrução externa. |
| Lançamento web P3 | Arte e áudio coerentes, opções, conteúdo revisado, correções de dispositivo, créditos. | Build e Pages verdes; sem bloqueador conhecido. |

As quantidades são metas iniciais, ajustáveis após teste. Não começar pela expansão de personagens antes de o primeiro kit ser divertido.

## Estrutura de uma run P1

- Um andar gerado de salas pré-montadas por seed: início, combates, 5 altares e 1 chefe; variar ordem e bifurcações quando possível.
- Cada sala tem ID, portas compatíveis, tipo, layout, pontos de spawn, obstáculos e tabela de encontro. Gerar grafo alcançável e depois associar layouts.
- Ao entrar na sala hostil, iniciar encontro; bloquear saídas; onda pequena e finita. Ao vencer, abrir portas e exibir recompensa quando prevista.
- Cada personagem começa com equipamento próprio, HP, energia e habilidade; afinidades vêm dos altares após limpar salas não chefe. Coleta moeda da run; recompensas não dependem de anúncio ou servidor.
- Chefe sinaliza fases/ataques; após derrotá-lo, concluir o andar e mostrar escolhas, duração, dano tomado e seed para reproduzir problemas.

## Regras para implementar e calibrar

| Sistema | Contrato inicial |
| --- | --- |
| Movimento | Vetor normalizado para diagonal não ser mais rápida; colisão com paredes e obstáculos. |
| Tiro | Comando segurado com cadência e custo de energia por arma; sem energia suficiente não dispara; origem/direção coerentes, colisão, alcance e limite de projéteis. Energia regenera após pausa curta no disparo. |
| Mira | Automática no inimigo visível mais próximo em desktop e mobile; sem alvo visível não dispara nem gasta energia. Validar priorização de alvo em playtest. |
| Desvio | Ação separada, deslocamento curto, recarga visível e janela de proteção a ajustar. |
| Habilidade | Identidade do herói, custo/recarga com feedback e sem disparo acidental na pausa. |
| Dano | Vida, invulnerabilidade curta após acerto, feedback visual/sonoro; mortes e cura verificáveis. |
| Inimigos | Estados de entrada, aproximação/mira/ataque, dano, morte; limites para evitar excesso de entidades. |
| Recompensa | Altar aparece após limpar cada sala não chefe; oferece três afinidades pela seed, com uma escolha que aumenta 1 ponto, até cinco escolhas na run. |
| Persistência | Som, controles, acessibilidade e desbloqueios em save versionado; resultado da run salvo apenas se fizer sentido. |

## Identidade Junq

Jão, Alice e Gui foram aprovados visualmente pelo MVP e têm equipamentos iniciais e habilidades distintas. A progressão elementar está em [`07-AFINIDADES-E-PERSONAGENS.md`](07-AFINIDADES-E-PERSONAGENS.md). Os efeitos exclusivos de cada elemento ainda exigem balanceamento, assim como mais frames de ataque e dano.

## Interface e controles

- Desktop: WASD/setas, clique/segurar para disparar com mira automática, Espaço para desvio, tecla de habilidade configurável, Esc para pausa.
- Mobile em horizontal: controle de movimento de área confortável, não colado ao canto; ataque, desvio e habilidade agrupados à direita com áreas de toque generosas, considerando safe areas.
- Suporte a teclado, toque e gamepad tratado como adaptadores de entrada; a simulação recebe as mesmas ações.
- Opções: tamanho/posição de controles, intensidade de shake, volume, contraste de projéteis e pausa automática ao perder foco.
- HUD: vida, recurso/recarga, arma, habilidade, minimapa simples, moeda e pausa. Evitar tapar o centro da arena.

## Critérios de experiência

- Toda ação importante tem resposta em menos de um frame lógico e sinal visível de sucesso ou recarga.
- Jogador entende o que o atingiu; padrões do chefe são antecipados.
- Primeiro minuto já contém combate e uma decisão simples, sem tutorial longo.
- FPS alvo de 60 em aparelho de teste, com adaptação para queda de desempenho; medir tempo de carregamento e memória antes de fixar números de aceitação.
