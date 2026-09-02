declare const process: { env: Record<string, string | undefined> };
declare const Buffer: { from(value: string, encoding: string): Uint8Array };

type Reference = { url: string; angulo: string };

function dataUrlToBlob(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('A foto enviada não está em um formato válido.');
  return new Blob([Buffer.from(match[2], 'base64')], { type: match[1] });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY não configurada na Vercel.' });

  try {
    const body = req.body as { image?: string; prompt?: string; negativo?: string; presidentReferences?: Reference[] };
    if (!body.image || !body.prompt) return res.status(400).json({ error: 'Foto e prompt são obrigatórios.' });
    const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
    const form = new FormData();
    form.append('model', 'gpt-image-1');
    form.append('prompt', `${body.prompt}\n\nAVOID: ${body.negativo || ''}`);
    form.append('input_fidelity', 'high');
    form.append('quality', 'high');
    form.append('size', '1024x1536');
    form.append('output_format', 'png');
    form.append('image[]', dataUrlToBlob(body.image), 'person.jpg');

    const reference = body.presidentReferences?.[0];
    if (!reference) return res.status(400).json({ error: 'Nenhuma referência do Lula foi selecionada.' });
    const referenceResponse = await fetch(new URL(reference.url, origin));
    if (!referenceResponse.ok) return res.status(500).json({ error: `Referência do Lula não encontrada: ${reference.url}` });
    form.append('image[]', new Blob([await referenceResponse.arrayBuffer()], { type: referenceResponse.headers.get('content-type') || 'image/jpeg' }), 'lula-reference.jpg');

    const imageResponse = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: form });
    const payload = await imageResponse.json() as { data?: Array<{ b64_json?: string }>; error?: { message?: string } };
    if (!imageResponse.ok || !payload.data?.[0]?.b64_json) return res.status(imageResponse.status || 502).json({ error: payload.error?.message || 'O gerador não retornou uma imagem.' });
    return res.status(200).json({ image: `data:image/png;base64,${payload.data[0].b64_json}` });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Falha ao gerar a imagem.' });
  }
}
