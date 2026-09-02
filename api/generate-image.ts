declare const process: { env: Record<string, string | undefined> };
declare const Buffer: any;
import { InferenceClient } from '@huggingface/inference';
import sharp from 'sharp';

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
      const referenceResponse = await fetch(new URL(reference.url, origin));
      if (!referenceResponse.ok) return res.status(500).json({ error: `Referência do Lula não encontrada: ${reference.url}` });
      const personBuffer = Buffer.from(await dataUrlToBlob(body.image).arrayBuffer());
      const lulaBuffer = Buffer.from(await referenceResponse.arrayBuffer());
      const personLayer = await sharp(personBuffer).resize(760, 1200, { fit: 'cover' }).png().toBuffer();
      const lulaLayer = await sharp(lulaBuffer).resize(600, 1000, { fit: 'cover' }).png().toBuffer();
      const combinedInput = await sharp({ create: { width: 1024, height: 1536, channels: 3, background: '#eadbd4' } }).composite([
        { input: personLayer, left: 40, top: 168 },
        { input: lulaLayer, left: 410, top: 250 },
      ]).png().toBuffer();
      const client = new InferenceClient(huggingFaceToken);
      const result = await client.imageToImage({
        model: 'Qwen/Qwen-Image-Edit', provider: 'fal-ai', inputs: new Blob([combinedInput], { type: 'image/png' }),
        parameters: { prompt: `${body.prompt} The input contains identity references only; do not copy its arrangement, borders or layout. PERSON_A is the exact uploaded person and must remain the same person: preserve their face, identity, skin tone, hair, age, body and clothing; do not replace, redraw or invent PERSON_A. PERSON_B is Luiz Inácio Lula da Silva; preserve his recognizable face and beard from the reference. Create one believable unified photographic scene from scratch: both people share the same space, stand close together and embrace naturally with connected arms and shoulders. The final result must look like one special candid photograph, with one background, one camera perspective, one light source and natural contact shadows.`, negative_prompt: `${body.negativo}, different person, substituted face, invented person A, altered identity, split screen, vertical divider, two panels, reference board, collage, side-by-side portrait, diptych`, target_size: { width: 1024, height: 1536 } },
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
