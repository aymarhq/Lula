export const BASE = `Two-person commemorative poster portrait, painterly editorial illustration with visible fine film grain and screen-print texture. Artistic tribute poster — deliberately stylized, NOT a photograph.

SUBJECTS — two people standing side by side, same ground plane:
- PERSON_A: from reference image 1. Preserve facial identity exactly — face shape, skin tone, hair, facial hair, glasses, apparent age, body build. Do not idealize, slim, whiten, rejuvenate or beautify. Keep natural skin texture.
- PERSON_B: from reference image 2. Preserve facial identity exactly — face shape, skin tone, hair, beard, apparent age. Elderly man, white hair, white beard.

INTERACTION — warm, respectful, plausible: standing shoulder to shoulder, both turned slightly toward camera, relaxed posture. Optional single natural contact point: a handshake, or a hand resting on the shoulder. Both looking toward the viewer with a calm, genuine smile. No hugging faces together, no kissing, no lifting, no theatrical gestures.

PHYSICAL COHERENCE — one single dominant light source for both people, identical lens rendering and depth of field, matching perspective and camera height, consistent scale, grounded contact shadows on the same floor, no cut-out edges, halo or seam, unified color grading.

FRAMING: waist-up two-shot, vertical 4:5, subjects centered with generous headroom for the poster frame. Eye level camera, 50mm equivalent.`;

export const FECHAMENTO = `OUTPUT: single vertical 4:5 image, high resolution, clean margins on all sides reserved for the poster frame. Leave the bottom 12% visually calm and uncluttered — dedication text and the AI disclosure badge are composited there afterwards.

STYLE ANCHOR: this must read as a hand-crafted tribute poster, not as a news photograph or a documentary record.`;

export const NEGATIVO = `photorealistic press photograph, photojournalism, news wire photo, any text, lettering, typography, words, numbers, captions, signage, brand names, logos, political party logos, campaign material, ballot, candidate number, presidential sash, official podium, government building, official ceremony, press conference backdrop, extra fingers, deformed hands, extra limbs, warped face, asymmetric eyes, waxy skin, beauty filter, face slimming, skin whitening, age reduction, two different light directions, mismatched lighting, hard cut-out edge, visible compositing seam, halo outline, sticker look, pasted-on subject, floating subject, missing shadow, inconsistent scale, third person, extra face, cloned face, crowd in sharp focus, cluttered background, blurry low resolution, jpeg artifacts, oversaturated, HDR halo, heavy vignette`;

export const CENARIOS = {
  C01: { rotulo: 'No comício', anguloRef: 'frontal', prompt: 'SCENE: outdoor popular rally at golden hour. Dense crowd behind them, softly out of focus, many plain red flags and banners with NO text, letters, party logos or acronyms. Hands raised in the crowd. LIGHT: warm low sun from camera left, long soft shadows, dust and backlit haze, rim light on both silhouettes. WARDROBE: PERSON_B in a white long-sleeve shirt, sleeves rolled up. MOOD: collective euphoria, belonging. PALETTE: warm reds, amber, golden dust.' },
  C02: { rotulo: 'Na padaria do bairro', anguloRef: '3-4', prompt: 'SCENE: small neighborhood bakery early in the morning. Glass counter with bread, coffee machine, plain tiled wall, two small cups of coffee. Humble, real, no branding. LIGHT: soft daylight through a shop window from camera right, warm bounce from wooden counter. WARDROBE: PERSON_B in a simple shirt, no tie. MOOD: quiet everyday intimacy. PALETTE: warm cream, wood brown, soft white.' },
  C03: { rotulo: 'No portão da fábrica', anguloRef: 'frontal', prompt: 'SCENE: metalworking factory gate at shift change, morning. Industrial corrugated wall, steel gate, workers blurred in the far background. No signage, company name or logos. LIGHT: cool overcast morning, soft and even, faint warm bounce from ground. WARDROBE: PERSON_B in a dark work jacket over a plain shirt. MOOD: dignity of labor, quiet pride. PALETTE: steel grey, muted blue, oxidized red.' },
  C04: { rotulo: 'Na feira livre', anguloRef: '3-4', prompt: 'SCENE: open-air street market at mid-morning. Fabric awnings and crates of fruit and vegetables in rich color, blurred, a few market people deep in background. LIGHT: bright daylight filtered through colored awning fabric, dappled highlights, open shade on both faces. WARDROBE: PERSON_B in a light short-sleeve shirt. MOOD: crowded warmth, ordinary Brazilian street life. PALETTE: saturated greens, oranges, awning blue.' },
  C05: { rotulo: 'Na cozinha de casa', anguloRef: '3-4', prompt: 'SCENE: simple home kitchen. Modest table with homemade cake and coffee pot, patterned tiles, curtain over window. Lived-in, humble, warm. LIGHT: warm afternoon side-window light, soft and enveloping. WARDROBE: PERSON_B in a plain shirt, very relaxed. MOOD: family visit, home, welcome. PALETTE: warm yellow, terracotta, soft domestic tones.' },
  C06: { rotulo: 'No sertão', anguloRef: 'frontal', prompt: 'SCENE: dry backland landscape, bare earth, sparse caatinga vegetation, wide open sky and distant low hills. LIGHT: strong high sun, hard directional light, deep short shadows, controlled heat shimmer. WARDROBE: PERSON_B in a light shirt; leather hat acceptable. MOOD: resistance, endurance, roots, dry heat. PALETTE: ochre, dust beige, bleached sky blue.' },
  C07: { rotulo: 'Na várzea', anguloRef: 'frontal', prompt: 'SCENE: amateur neighborhood football pitch on Sunday. Worn grass, bare dirt patches, simple goal, low concrete bleachers with a few blurred people. LIGHT: late afternoon side sun, long shadows, slight lens flare at frame edge. WARDROBE: both in plain football shirts with NO logos, sponsors, numbers or text. MOOD: Sunday joy, neighborhood, sweat and laughter. PALETTE: grass green, warm dirt brown, late-sun gold.' },
} as const;

export const SELOS = {
  SA: { rotulo: 'Coração Vermelho', acento: '#D32029', svg: 'coracao.svg', prompt: 'EMOTIONAL GRADE: tender and affectionate. Lifted shadows, warm skin tones, soft red accent glow, gentle human warmth, soft contrast.' },
  SB: { rotulo: 'Estrela do Povo', acento: '#C9A227', svg: 'estrela.svg', prompt: 'EMOTIONAL GRADE: bright and hopeful. Luminous highlights, airy open feel, subtle warm star-shaped highlight bloom, optimistic and elevated.' },
  SC: { rotulo: 'Punho Erguido', acento: '#111111', svg: 'punho.svg', prompt: 'EMOTIONAL GRADE: strong and determined. Higher contrast, deeper blacks, firmer directional light, defined jaw and shadow shaping, confident closed-mouth smile.' },
  SD: { rotulo: 'Pão na Mesa', acento: '#8B5E34', svg: 'pao.svg', prompt: 'EMOTIONAL GRADE: nourishing and grounded. Warm golden-brown midtones, soft matte finish, cozy tactile feel, low contrast, quiet gratitude.' },
  SE: { rotulo: 'Esperança', acento: '#E8B84B', svg: 'sol.svg', prompt: 'EMOTIONAL GRADE: luminous and forward-looking. Soft haze, gentle lens bloom, light behind and above creating a halo rim on both, calm and serene.' },
} as const;

export function montarPrompt(cenarioId: keyof typeof CENARIOS, seloId: keyof typeof SELOS) {
  const cenario = CENARIOS[cenarioId]; const selo = SELOS[seloId];
  return { id: `${cenarioId}_${seloId}`, prompt: [BASE, cenario.prompt, selo.prompt, FECHAMENTO].join('\n\n'), negativo: NEGATIVO, anguloRef: cenario.anguloRef, acento: selo.acento, svgSelo: selo.svg };
}

export function idsDaInterface(cenario: string, selo: string) {
  const cenarioId = (Object.keys(CENARIOS) as Array<keyof typeof CENARIOS>).find(id => CENARIOS[id].rotulo === cenario) || 'C01';
  const seloId = (Object.keys(SELOS) as Array<keyof typeof SELOS>).find(id => SELOS[id].rotulo === selo) || 'SA';
  return { cenarioId, seloId };
}
