# 01 · O que aprendemos com Soul Knight

Pesquisa em 11/10/2026. A referência primária é a [descrição oficial da ChillyRoom na Google Play](https://play.google.com/store/apps/details?id=com.ChillyRoom.DungeonShooter); a versão comercial atual inclui muitos sistemas acumulados desde o lançamento. Este documento **extrai princípios**, sem presumir que todo modo, regra ou quantidade pertença à versão original.

## Loop observado

| Elemento divulgado pela ChillyRoom | O que significa para nosso planejamento |
| --- | --- |
| Shooter de ação com visão superior, elementos de RPG e roguelike | Controle imediato, partidas repetíveis e decisões durante a tentativa. |
| Heróis com habilidades próprias e arsenal variado | Silhueta e função de cada herói devem mudar a maneira de jogar; três armas com comportamentos distintos já provam o sistema. |
| Masmorras aleatórias, tesouros, NPCs e cenários diferentes | Usar grafo de salas conectadas, tipos de sala e recompensas, mantendo layout e combate legíveis. |
| Mira automática, desvio, tiro e habilidade com poucos toques | O botão dispara no inimigo visível mais próximo; movimento, tempo do disparo e gestão de energia ficam com o jogador. |
| Cooperativo e muitos modos na versão atual | Expansões possíveis; a primeira run será **solo** e sem servidor. |

O resumo de experiência é **entrar, lutar, escolher, avançar e tentar de novo**. Inspirar-se nesse ritmo não autoriza copiar personagens, nomes, mapas, sprites, interfaces, músicas ou a identidade Soul Knight.

## Tradução para o projeto Junq

| Princípio | Nossa proposta inicial | Como verificar |
| --- | --- | --- |
| Ação legível | Movimento em oito direções, projéteis contrastantes, telegráficos antes de ataques fortes. | Jogador reconhece origem e direção dos ataques em tela de celular. |
| Sala como encontro | Entrou em sala hostil: portas fecham; ao limpar, recompensa/saídas ficam acessíveis. | Não há travamento por inimigo fora da arena ou atrás de obstáculo. |
| Aleatoriedade controlada | Grafo com começo, combate, recompensa e chefe garantidos; layouts feitos à mão combinados por semente. | 100 sementes automáticas geram mapa navegável com chefe alcançável. |
| Escolha com consequência | Abrir baú após limpar uma sala e decidir se equipa a arma encontrada. | Outra arma muda custo de energia, alcance, risco ou cadência. |
| Partida curta | Meta inicial de 10 a 15 minutos para um andar, sujeita a playtest. | Medir partidas reais, não impor duração artificial. |
| Mobile primeiro | Área de jogo horizontal, joystick de movimento na metade inferior esquerda, botões confortáveis à direita; mira automática. | Jogar uma run no Android sem cliques perdidos ou mãos cobrindo projéteis. |

## Limites de escopo

- **Não começar** com centenas de armas, cooperativo, conta, passe, loja, monetização, ranking ou IA de conteúdo procedural sem validação da partida básica.
- Desbloqueios permanentes devem ampliar escolhas; evitar uma progressão que torne as runs iniciais injustas.
- Morte encerra a run. Configurações e desbloqueios podem persistir localmente. Decidir retomada de run interrompida após validar o fluxo principal.

## Questões para playtest

1. A mira automática escolhe o alvo esperado mesmo perto de paredes e obstáculos?
2. Desvio tem tempo de recarga e invulnerabilidade perceptíveis sem trivializar o chefe?
3. O mapa incentiva exploração ou a rota ótima fica óbvia?
4. As armas mudam decisões táticas e não apenas números?

Essas são hipóteses de design, não fatos atribuídos ao jogo de referência.
