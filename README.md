# Estudo de Viabilidade - Guilherme Scharf

Aplicativo executivo em Next.js para apresentar o business case da area da Rua Guilherme Scharf, Blumenau/SC.

## Foco do estudo

- Terreno total: 128.000 m2
- Area util: 68.000 m2
- Frente para Rua Guilherme Scharf: 1.400 m
- Simulacoes por fracao: 2.500 m2, 3.000 m2 e 5.000 m2
- Vocacoes avaliadas: supermercado, posto de combustiveis, varejo de conveniencia e logistica/last mile
- CUB SC Junho/2026 usado como premissa: Galpao Industrial GI de R$ 1.366,85/m2

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://127.0.0.1:3000`.

## Validacoes feitas antes da publicacao

```bash
npm run lint
npm run build
```

As formulas do simulador diferenciam `Yield on Cost` de `Cap Rate` de mercado: o indicador principal usa NOI anual dividido pelo custo total de desenvolvimento.