# 10 · Modo ADM para validar a run

## Acesso

Abra o jogo com `?admin=1` na URL. Exemplo no Pages: `https://jaodajunq.github.io/Junq_SoulKnight/?admin=1`. Se quiser repetir uma seed, acrescente `&seed=123456`.

Inicie uma run normalmente. O botão **ADM** aparece no canto superior direito da arena; no desktop, **F2** abre e fecha o mesmo painel. O jogo pausa enquanto o painel está aberto. Toque em **VOLTAR À RUN · F2** ou pressione F2 para continuar.

## Ferramentas disponíveis

- **BASE**, para remover a forma e zerar afinidades do Jão.
- **TERRA, ÁGUA, FOGO, RAIO, LUZ e SOMBRA**, para aplicar imediatamente cinco pontos no elemento escolhido, trocar a aparência e liberar a habilidade correspondente. O teste troca o herói atual pelo Jão, que usa a espada.
- **DIABRETE, ATIRADOR, SENTINELA, BRUTO e CHEFE**, para invocar inimigos na sala atual. Cada inimigo procura uma posição livre e afastada dos outros. O limite é 30 inimigos ativos para proteger o desempenho no celular.
- **RESTAURAR HP + ENERGIA**, para recuperar vida, escudo, energia e recarga da habilidade entre tentativas.

## Roteiro curto de validação

1. Abra `?admin=1`, entre na run e selecione cada forma. Confira a roupa, a arma, o nome no botão e o efeito de ativação.
2. Invoque um Diabrete e um Atirador, depois use a habilidade da forma selecionada para observar o alcance, o dano e a resposta do inimigo.
3. Em Terra e Água, confira a lentidão; em Fogo, a explosão nos alvos próximos; em Raio, o avanço para trás do alvo; em Luz, o corte que atravessa; em Sombra, o eco do segundo golpe.
4. Use **RESTAURAR HP + ENERGIA** para repetir testes sem reiniciar a run.
5. Feche o painel e confira o comportamento normal da partida e os controles em paisagem no celular.

## Limites

O modo é uma ferramenta de teste do cliente, controlada pela query string; não altera afinidades de forma permanente nem cria save. O painel pausa a arena. O aparecimento e a renderização dos controles ainda precisam de inspeção visual no Pages e em celular horizontal; validar localmente typecheck/testes/build não substitui essa conferência.
