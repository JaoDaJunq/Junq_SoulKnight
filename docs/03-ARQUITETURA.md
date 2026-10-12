# 03 · Arquitetura e publicação

## Escolha proposta

**Phaser 3 + TypeScript + Vite**, por encaixar no destino GitHub Pages, ter casos abertos de dungeon shooter com salas e permitir reutilizar o build web ao avaliar Capacitor. Esta escolha é uma decisão de planejamento; T001 fixa versões e a comprova em Android real. Godot 4 também exporta para web e nativo, mas a documentação oficial aponta restrições de WebGL 2 e custo de desempenho no navegador mobile. Veja [fontes e alternativas](05-PESQUISA-BASES.md).

## Módulos previstos

```text
Junq_SoulKnight/
  index.html
  package.json
  package-lock.json
  vite.config.ts
  public/assets/           # somente assets auditados e créditos
  src/
    main.ts
    scenes/                # boot, menu, hub, run, resultado
    core/                  # estado, relógio, seed, eventos, simulação
    input/                 # teclado/mouse, toque, futuro gamepad
    world/                 # grafo, sala, portas, layouts e colisão
    combat/                # projéteis, dano, armas, habilidades, IA
    content/               # definições tipadas, loot e balanceamento
    ui/                    # HUD, diálogos e acessibilidade
    save/                  # esquema, migração, configuração, desbloqueios
  tests/                   # invariantes do gerador e regras críticas
  docs/                    # planejamento e decisões
  .github/workflows/       # checagem e deploy Pages
```

Separar **estado/regras** da renderização sempre que útil, sem montar infraestrutura de servidor que o jogo solo não precisa. Evitar uma cena única com toda a lógica. Dados dos personagens e armas são declarativos. Todas as fontes de aleatoriedade da run usam seed explícita, de modo que bugs sejam reproduzíveis.

## Contratos técnicos

- Atualização da simulação com delta limitado ou passo fixo; rendering separado; eventos idempotentes de limpar sala, vencer chefe e fechar run.
- Pools ou limites para projéteis, partículas e inimigos; reduzir efeitos antes de prejudicar leitura do combate.
- Colliders e grupo de dano explícitos para impedir dano duplicado por um mesmo impacto.
- Gerador com validação de conectividade, posição livre para spawn, porta pareada e acesso ao chefe; fallback para mapa seguro se uma seed falhar.
- Save local com `schemaVersion`, validação ao ler, migração e reset; não armazenar segredos, placar confiável ou progresso sincronizado em Pages.
- Assets com caminhos relativos ao `import.meta.env.BASE_URL`/pipeline do Vite, sem URLs absolutas de `/assets` que quebrem sob `/Junq_SoulKnight/`.

## CI e GitHub Pages

1. T001 adiciona projeto, lockfile, scripts `dev`, `typecheck`, `test`, `build` e arquivo de workflow.
2. Em push/PR: instalar com `npm ci`, typecheck, testes relevantes, build; bloquear regressões.
3. Em `main`: construir `dist/`, publicar com `configure-pages`, `upload-pages-artifact` e `deploy-pages`.
4. Configurar **Settings → Pages → Source: GitHub Actions**. O workflow não prova que essa configuração já está ativa.
5. `vite.config.ts` usa `base: '/Junq_SoulKnight/'`; validar URL final `https://jaodajunq.github.io/Junq_SoulKnight/` no browser, incluindo recarga, áudio, assets e Android.

Pages foi configurado para GitHub Actions em 12/10/2026. O deploy do vertical slice T006–T008 passou pelo workflow `38196895602`; o menu, a sala inicial e a pausa foram observados no navegador desktop na URL pública. O canvas preenche a área visível em celulares horizontais por CSS, com tentativa de tela cheia a partir do toque inicial; o comportamento em aparelho Android real e a run completa ainda exigem validação.

## Migração posterior para app

1. Após P2/P3, testar PWA instalável e armazenamento local, inclusive retomada e atualização.
2. Adicionar shell Capacitor em pasta própria, sem bifurcar gameplay; importar o `dist/` da web.
3. Testar toque, áudio após desbloqueio, foco/pausa, orientação, densidade de pixel, safe areas, bateria, armazenamento e performance em Android real.
4. Criar ícones/splash e assinatura, versão e pipeline de APK/AAB. Validar distribuição separadamente.
5. iOS em trilha própria, com ambiente de build e testes em aparelho; não prometer APK para iPhone.

Sincronização, cooperativo e contas implicam backend e nova arquitetura; são decisões futuras, não pressupostos para o lançamento solo.
