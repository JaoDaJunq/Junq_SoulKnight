# 02 · Documento de design jogável

**Visão:** roguelite de salas para browser e toque, com heróis autorais Junq. Nome e cenário definitivos pendentes de validação visual; usar placeholders durante a programação.

## Estados e fluxo

`BOOT → MENU/HUB → SELEÇÃO → MAPA/COMBATE ↔ RECOMPENSA → CHEFE → RESULTADO → HUB`.

Durante `MAPA/COMBATE`, `PAUSA` suspende simulação e áudio. Derrota vai a `RESULTADO`; sair voluntariamente mostra confirmação. Troca de tela não deve manter projéteis/inputs ativos.

## Conteúdo mínimo por marco

| Marco | Conteúdo | Critério de partida |
| --- | --- | --- |
| Protótipo P0 | Uma sala, herói provisório, tiro, inimigo perseguidor, dano, reinício. | Jogável no Pages em Android e desktop. |
| Vertical slice P1 | 5 a 7 salas, 3 inimigos (perseguidor, atirador, resistente), 3 armas (rápida, espalhada, alcance/ritmo diferente), habilidade, desvio, 2 recompensas, um chefe. | Terminar e perder uma run inteira sem bloqueio. |
| Beta P2 | 3 heróis de kits diferentes, 2 biomas, variedade de encontros, balanceamento, som, acessibilidade, onboarding, save local. | Jogadores novos entendem e completam uma run sem instrução externa. |
| Lançamento web P3 | Arte e áudio coerentes, opções, conteúdo revisado, correções de dispositivo, créditos. | Build e Pages verdes; sem bloqueador conhecido. |

As quantidades são metas iniciais, ajustáveis após teste. Não começar pela expansão de personagens antes de o primeiro kit ser divertido.

## Estrutura de uma run P1

- Um andar gerado de salas pré-montadas por seed: início, 3 ou 4 combates, 1 loja/baú, 1 escolha de melhoria, 1 chefe; variar ordem e bifurcações quando possível.
- Cada sala tem ID, portas compatíveis, tipo, layout, pontos de spawn, obstáculos e tabela de encontro. Gerar grafo alcançável e depois associar layouts.
- Ao entrar na sala hostil, iniciar encontro; bloquear saídas; onda pequena e finita. Ao vencer, abrir portas e exibir recompensa quando prevista.
- Personagem começa com arma básica, HP e habilidade; coleta moeda da run; recompensas não podem depender de anúncio ou servidor.
- Chefe sinaliza fases/ataques; após derrotá-lo, concluir o andar e mostrar escolhas, duração, dano tomado e seed para reproduzir problemas.

## Regras para implementar e calibrar

| Sistema | Contrato inicial |
| --- | --- |
| Movimento | Vetor normalizado para diagonal não ser mais rápida; colisão com paredes e obstáculos. |
| Tiro | Comando segurado com cadência por arma; origem/direção coerentes; colisão e alcance; limite de projéteis. |
| Mira | Mouse no desktop; toque com arrasto opcional ou alvo assistido no mobile. A escolha é configurável e será validada em playtest. |
| Desvio | Ação separada, deslocamento curto, recarga visível e janela de proteção a ajustar. |
| Habilidade | Identidade do herói, custo/recarga com feedback e sem disparo acidental na pausa. |
| Dano | Vida, invulnerabilidade curta após acerto, feedback visual/sonoro; mortes e cura verificáveis. |
| Inimigos | Estados de entrada, aproximação/mira/ataque, dano, morte; limites para evitar excesso de entidades. |
| Recompensa | Escolha única entre três alternativas válidas; evitar oferecer opção sem efeito. |
| Persistência | Som, controles, acessibilidade e desbloqueios em save versionado; resultado da run salvo apenas se fizer sentido. |

## Identidade Junq

Jão, Alice e Gui são **candidatos** a kits após P1; seus poderes e imagens não devem ser importados automaticamente de outro jogo. Conceito a validar: Jão ataca à distância com energia saindo da mão, sem arma empunhada; Alice pode variar seu kit por forma de esmalte; Gui precisa de ficha específica deste jogo. Assets existentes só entram após inventário de origem, licença e aprovação visual. A fantasia e a arte do novo projeto serão documentadas em `docs/personagens/` quando a direção for definida.

## Interface e controles

- Desktop: WASD/setas, cursor para mirar, clique/segurar para disparar, Espaço para desvio, tecla de habilidade configurável, Esc para pausa.
- Mobile em horizontal: controle de movimento de área confortável, não colado ao canto; ataque, desvio e habilidade agrupados à direita com áreas de toque generosas, considerando safe areas.
- Suporte a teclado, toque e gamepad tratado como adaptadores de entrada; a simulação recebe as mesmas ações.
- Opções: tamanho/posição de controles, intensidade de shake, volume, contraste de projéteis e pausa automática ao perder foco.
- HUD: vida, recurso/recarga, arma, habilidade, minimapa simples, moeda e pausa. Evitar tapar o centro da arena.

## Critérios de experiência

- Toda ação importante tem resposta em menos de um frame lógico e sinal visível de sucesso ou recarga.
- Jogador entende o que o atingiu; padrões do chefe são antecipados.
- Primeiro minuto já contém combate e uma decisão simples, sem tutorial longo.
- FPS alvo de 60 em aparelho de teste, com adaptação para queda de desempenho; medir tempo de carregamento e memória antes de fixar números de aceitação.
