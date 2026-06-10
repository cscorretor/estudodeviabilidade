# Hospedagem na Hostinger

Este projeto foi ajustado para funcionar primeiro como site estatico, que e o caminho mais simples para publicar na Hostinger sem servidor especial.

## Caminho recomendado agora

1. Rodar `npm.cmd run build`.
2. Enviar o conteudo da pasta `out` para o `public_html` da Hostinger.
3. Manter a parte publica em `/`.
4. Manter o painel em `/dashboard` apenas como prototipo operacional local/estatico.

## O que funciona bem neste modo

- Site publico rapido.
- Dashboard navegavel.
- Cadastros salvos no navegador via `localStorage`.
- Sem VPS.
- Sem banco pago.
- Sem servidor Node em producao.

## Limite importante

Hospedagem estatica nao protege de verdade a rota `/dashboard`. Para CRM real com dados sensiveis, o proximo passo deve ser uma destas opcoes:

- Hostinger com PHP + MySQL: login, banco e painel usando os recursos tradicionais da hospedagem.
- Hostinger Managed Node.js: usar Next.js com API e autenticacao no proprio Node.
- Supabase Free: banco, login e storage com pouca configuracao, mantendo o site na Hostinger.

## Decisao tecnica recomendada

Para evitar custos e complexidade agora:

- Publicar primeiro a vitrine como estatico.
- Validar fluxo do CRM localmente.
- Depois criar login e banco em MySQL da Hostinger ou Supabase, conforme o plano disponivel.
