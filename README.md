# Eu e o Presidente

MVP mobile-first da experiência de homenagem artística descrita em `prompt-montagem-lula_4f72af52.md`.

## Rodar localmente

```bash
npm install
npm run dev
```

O projeto inclui a rota real `api/generate-image.ts` para a Vercel. Configure `OPENAI_API_KEY` nas variáveis de ambiente da Vercel; opcionalmente, use `VITE_IMAGE_GENERATION_URL` para apontar para outro backend. A chave do modelo deve ficar somente no backend.

O frontend envia `POST` JSON com `{ image, scenario, seal, dedication, promptId, prompt, negativo, anguloRef, acento, svgSelo, presidentReferences }`, onde `image` é um data URL e `presidentReferences` é o banco de fotos do Lula filtrado pelo ângulo do cenário. Coloque as fotos autorizadas em `public/` com os nomes `lula-reference-01.jpg` até `lula-reference-06.jpg`, ou faça o backend resolver esses caminhos para as imagens privadas do banco. O endpoint deve responder `{ "image": "data:image/png;base64,..." }` ou `{ "imageUrl": "https://..." }`. Assim o navegador nunca acessa diretamente a credencial do gerador.

Para visualizar a composição em duas pessoas durante o desenvolvimento, coloque uma imagem autorizada de referência em `public/lula-reference.jpg`. Sem esse arquivo, o lado do presidente mostra o fallback ilustrativo “LULA”.

## Próxima etapa de produção

- Criar API Node para validação de assinatura de bytes, moderação, retenção de 24h e watermark queimada no servidor.
- Implementar `GatewayPagamento` com Abacate Pay/Cactos e liberação somente por webhook assinado.
- Ligar um `GeradorImagem` autorizado, com selo permanente `IMAGEM FICTÍCIA CRIADA POR IA` e metadados de origem sintética.
- Obter autorização de uso de imagem da figura homenageada e licenças das imagens-base.
- Criar painel administrativo para moderação, pedidos e exclusão.
