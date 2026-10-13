# 07 · Heróis e afinidades elementais

> **Atualização de escopo:** a estrutura de cinco altares em seis salas descrita abaixo registra a primeira entrega histórica. A versão seguinte usa mundos de cinco fases, dois altares e dois baús por mundo, com chefe em 5/5. Gui passou de martelo para cartas. Ver [08 · Masmorras e relíquias](08-MASMORRAS-E-RELIQUIAS.md) para as regras atuais e as duas primeiras sinergias.

## Fantasia da run

Jão, Alice e Gui entram com um equipamento próprio e **zero afinidade**. O equipamento não é trocado durante a run. Após vencer cada sala que não seja a do chefe, surge um **Altar de Fragmentos**. Tocar nele oferece três elementos gerados de modo reproduzível pela seed da run e pela sala. Uma escolha aumenta a afinidade correspondente em 1. São cinco altares antes do chefe numa run de seis salas; o jogador pode concentrar cinco pontos ou combiná-los.

O altar substitui o baú de armas no jogo atual. A pedra acesa no pedestal e os sete símbolos sob a vida dão o vocabulário visual da progressão. O altar permanece na sala até a escolha, inclusive após revisitar. Recompensas e afinidades zeram ao iniciar nova run; moeda ainda compra cura após combate. Não há save de run nesta etapa.

## Sete elementos

| Símbolo | Elemento | Cor | Direção de evolução para a próxima etapa |
| --- | --- | --- | --- |
| ♨ | Fogo | brasa coral | queimadura e explosão curta |
| ≈ | Água | azul de nascente | lentidão e proteção temporária |
| ϟ | Raio | ouro elétrico | saltos entre alvos e corte atravessado do Jão |
| ≋ | Vento | verde claro | velocidade, alcance e deslocamento |
| ◆ | Terra | ocre | impacto, proteção e interrupção |
| ☾ | Sombra | violeta | marca, retorno de energia e risco |
| ✦ | Luz | creme dourado | precisão, sustentação e clareza |

**Funcionamento na primeira entrega:** cada ponto tinge ataques com sua cor. Em uma mistura, os disparos alternam os elementos conforme a proporção de pontos, por exemplo 3 Fogo/2 Raio produz três ataques de Fogo e dois de Raio em cada ciclo de cinco. O dano recebe +1 a cada dois fragmentos totais. Os sete símbolos mostram níveis de 0 a 5. Não há efeitos de estado próprios para todos os elementos ainda; a tabela acima é a direção da próxima entrega, não uma promessa de comportamento presente.

## Afinidade pura e híbrida

- **Pura:** cinco pontos no mesmo elemento liberam uma maestria específica do herói. Raio 5 do Jão está na primeira entrega: a habilidade seleciona automaticamente um inimigo visível, traça um corte até além dele, causa dano maior e desloca Jão para trás do alvo se o destino não estiver bloqueado. Durante o golpe há breve invulnerabilidade. Se a posição atrás estiver obstruída, o corte e o dano ocorrem sem deslocamento.
- **Híbrida:** 3 Fogo/2 Raio soma o bônus de dano e alterna as cores dos ataques 3:2; **não** libera o corte de Raio 5. Misturas futuras podem gerar interações próprias após prototipagem e balanceamento. Nenhuma combinação dupla domina duas maestrias na run de cinco escolhas.
- Um elemento já escolhido fica entre as três opções seguintes, permitindo seguir uma build concentrada até 5. As outras opções continuam variando com a seed. Escolher o mesmo elemento cinco vezes é sempre possível se o jogador visitar os cinco altares.

As habilidades e a identidade visual das formas puras do Jão estão descritas em [09 · Sintonias e assets](09-JAO-SINTONIAS-E-ASSETS.md). As fusões não foram modificadas nesta entrega.

## Heróis nesta etapa

| Herói | Equipamento inicial | Ataque com energia | Habilidade de seis segundos |
| --- | --- | --- | --- |
| Jão | Espada de viagem | corte de energia lançado, tiro rápido | corte auto direcionado; Raio 5 atravessa o alvo |
| Alice | Arco de carvalho | três flechas em leque | foco circular amplo de dano leve |
| Gui | Martelo de pedra | impacto pesado e lento | impacto circular mais próximo e forte |

Todos têm cinco corações por enquanto, energia máxima 100 e barra de recarga. A mira automática, custo de energia, desvio e paredes continuam. Cadência, custo e dano inicial dos três equipamentos variam. Nomes e parâmetros podem mudar após partidas reais. A seleção mostra os três, e o sprite em combate tem poses de frente, costas e dois passos laterais; a direção esquerda espelha os passos para a direita. Subida usa pose de costas com movimento corporal. Animações de ataque/dano dedicadas e mais frames por direção são trabalho futuro.

## Inimigos com identidade própria

| Papel em jogo | Criatura | Leitura e comportamento |
| --- | --- | --- |
| Perseguidor | Diabrete de Brasa | chifres, corpo vermelho e corrida curta até o herói |
| Atirador | Acólito do Véu | capuz roxo, máscara clara e disparo à distância |
| Sentinela | Olho da Forja | metal e núcleo laranja; avisa e dispara três projéteis |
| Resistente | Guardião de Musgo | bloco de pedra e mãos pesadas, avança devagar |
| Chefe | Vigia do Sino | pedra, sino e tecido rubro; ataque radial sinalizado |

As artes são originais deste projeto. O comportamento atual foi preservado enquanto a silhueta mudou; padrões extras, biografia e animações de ataque exigem iterações próprias. Não importar conteúdo visual de Soul Knight.

## Próximos incrementos verificáveis

1. Jogar runs com builds pura e híbrida, ajustar energia, dano e frequência das três ofertas; testar polegares e legibilidade dos símbolos num Android horizontal.
2. Implementar efeitos de combate exclusivos para Fogo, Água, Vento, Terra, Sombra e Luz com regras testáveis e indicação visual breve. Definir maestrias por herói sem criar 21 habilidades antes de validar as primeiras.
3. Refinar frames de subida/descida, ataque, dano e inimigos; acrescentar feedback claro de afinidade no altar e no resultado da run.
4. Expandir salas/andar somente depois que cinco escolhas, chefe e retorno da run estiverem equilibrados.
