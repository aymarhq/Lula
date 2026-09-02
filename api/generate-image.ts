declare const process: { env: Record<string, string | undefined> };
declare const Buffer: any;
import { InferenceClient } from '@huggingface/inference';

type Reference = { url: string; angulo: string };

function dataUrlToBlob(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('A foto enviada não está em um formato válido.');
  return new Blob([Buffer.from(match[2], 'base64')], { type: match[1] });
}

async function blobToDataUrl(blob: Blob) {
  const base64 = Buffer.from(await blob.arrayBuffer()).toString('base64');
  return `data:${blob.type || 'image/png'};base64,${base64}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  const apiKey = process.env.OPENAI_API_KEY;
  const huggingFaceToken = process.env.HUGGINGFACE_TOKEN;
  if (!apiKey && !huggingFaceToken) return res.status(500).json({ error: 'Configure OPENAI_API_KEY ou HUGGINGFACE_TOKEN na Vercel.' });

  try {
    const body = req.body as { image?: string; prompt?: string; negativo?: string; presidentReferences?: Reference[] };
    if (!body.image || !body.prompt) return res.status(400).json({ error: 'Foto e prompt são obrigatórios.' });
    const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
    if (huggingFaceToken) {
      const reference = body.presidentReferences?.[0];
      if (!reference) return res.status(400).json({ error: 'Nenhuma referência do Lula foi selecionada.' });
      const client = new InferenceClient(huggingFaceToken);
      const result = await client.imageToImage({
        model: 'Qwen/Qwen-Image-Edit', provider: 'fal-ai', inputs: dataUrlToBlob(body.image),
        parameters: { prompt: `${body.prompt} Add the referenced Brazilian president Luiz Inácio Lula da Silva standing beside the person in the input and embracing them naturally.`, negative_prompt: body.negativo, target_size: { width: 1024, height: 1536 } },
      });
      return res.status(200).json({ image: await blobToDataUrl(result) });
    }
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
