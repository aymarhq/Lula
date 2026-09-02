import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion } from 'framer-motion';
import './styles.css';
import { idsDaInterface, montarPrompt, PRESIDENT_REFERENCE_BANK } from './config/prompts';

type ImageGenerationRequest = { image: string; scenario: string; seal: string; dedication: string; presidentReferences: readonly { url: string; angulo: string }[] };

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src; });
}

async function createDemoComposition(userSrc: string) {
  const canvas = document.createElement('canvas'); canvas.width = 1000; canvas.height = 1250;
  const context = canvas.getContext('2d')!;
  const gradient = context.createLinearGradient(0, 0, 1000, 1250); gradient.addColorStop(0, '#651018'); gradient.addColorStop(.55, '#b64031'); gradient.addColorStop(1, '#ec9a62'); context.fillStyle = gradient; context.fillRect(0, 0, 1000, 1250);
  try { const user = await loadImage(userSrc); context.save(); context.beginPath(); context.rect(55, 45, 890, 1050); context.clip(); context.globalAlpha = .94; context.drawImage(user, 55, 45, 890, 1050); context.restore(); } catch { /* mantém o fundo de demonstração */ }
  try { const lula = await loadImage('/lula-reference.jpg'); context.save(); context.globalAlpha = .82; context.globalCompositeOperation = 'multiply'; context.drawImage(lula, 455, 215, 485, 820); context.restore(); } catch { context.fillStyle = '#fff'; context.font = '800 116px Barlow Condensed, sans-serif'; context.fillText('LULA', 620, 880); }
  const overlay = context.createLinearGradient(0, 0, 1000, 0); overlay.addColorStop(0, 'rgba(70,0,0,.2)'); overlay.addColorStop(1, 'rgba(90,0,0,.48)'); context.fillStyle = overlay; context.fillRect(0, 0, 1000, 1100);
  context.fillStyle = '#191919'; context.fillRect(0, 1100, 1000, 150); context.fillStyle = '#f2b1a9'; context.font = '700 28px Nunito Sans, sans-serif'; context.fillText('HOMENAGEM POPULAR', 42, 1145); context.fillStyle = '#fff'; context.font = '800 42px Barlow Condensed, sans-serif'; context.fillText('Uma homenagem para guardar', 42, 1200); return canvas.toDataURL('image/jpeg', .9);
}

async function generateWithCodex(request: ImageGenerationRequest & { promptId: string; prompt: string; negativo: string; anguloRef: string; acento: string; svgSelo: string }) {
  const endpoint = import.meta.env.VITE_IMAGE_GENERATION_URL as string | undefined;
  if (!endpoint) return null;
  const response = await fetch(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('O gerador não conseguiu criar sua imagem agora.');
  const payload = await response.json() as { image?: string; imageUrl?: string };
  const image = payload.image || payload.imageUrl;
  if (!image) throw new Error('O gerador respondeu sem uma imagem válida.');
  return image;
}

const icon = (value: string) => ({size=18}:{size?:number}) => <span style={{fontSize:size,lineHeight:1}} aria-hidden="true">{value}</span>;
const Camera=icon('◉'), Check=icon('✓'), ChevronDown=icon('⌄'), CircleAlert=icon('!'), Download=icon('↓'), ImagePlus=icon('＋'), LockKeyhole=icon('⌕'), MessageCircle=icon('◌'), ShieldCheck=icon('✓'), Sparkles=icon('✦'), Trash2=icon('×');

type Step = 'home' | 'generating' | 'preview' | 'checkout' | 'paid';
const scenarios = ['No comício', 'Na padaria do bairro', 'No portão da fábrica', 'Na feira livre', 'Na cozinha de casa', 'No sertão', 'Na várzea'];
const seals = ['Coração Vermelho', 'Estrela do Povo', 'Punho Erguido', 'Pão na Mesa', 'Esperança'];
const lulaReference = '/lula-reference.jpg';

function App() {
  const [step, setStep] = useState<Step>('home'); const [file, setFile] = useState<File | null>(null); const [src, setSrc] = useState('');
  const [consent, setConsent] = useState(false); const [scenario, setScenario] = useState(scenarios[0]); const [seal, setSeal] = useState(seals[0]); const [dedication, setDedication] = useState(''); const [customValue, setCustomValue] = useState(''); const [more, setMore] = useState(false); const [error, setError] = useState(''); const [generatedSrc, setGeneratedSrc] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const price = Math.max(990, Number(customValue.replace(',','.')) * 100 || 990);
  const displayPrice = (price / 100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const fakePoster = useMemo(() => generatedSrc || src || '', [generatedSrc, src]);
  function choose(f?: File) { setError(''); if (!f) return; if (!['image/jpeg','image/png','image/webp'].includes(f.type)) return setError('Esse formato não rola aqui. Manda em JPG, PNG ou WEBP.'); if (f.size > 10*1024*1024) return setError('Essa imagem passou de 10 MB. Escolha uma mais leve.'); setFile(f); setSrc(URL.createObjectURL(f)); }
  async function generate() { if (!file || !consent) return; setError(''); setStep('generating'); const startedAt = Date.now(); try { const userImage = await fileToDataUrl(file); const { cenarioId, seloId } = idsDaInterface(scenario, seal); const prompt = montarPrompt(cenarioId, seloId); const presidentReferences = PRESIDENT_REFERENCE_BANK.filter(reference => reference.angulo === prompt.anguloRef); const image = await generateWithCodex({ image: userImage, scenario, seal, dedication, presidentReferences, ...prompt, promptId: prompt.id }); setGeneratedSrc(image || await createDemoComposition(userImage)); await new Promise(resolve => setTimeout(resolve, Math.max(0, 1800 - (Date.now() - startedAt)))); setStep('preview'); } catch (generationError) { setStep('home'); setError(generationError instanceof Error ? generationError.message : 'Não foi possível gerar a imagem.'); } }
  function reset() { setStep('home'); setFile(null); setSrc(''); setGeneratedSrc(''); setConsent(false); setDedication(''); }
  function goCheckout() { setStep('checkout'); }
  return <div className="app">
    <div className="notice">Site independente de homenagem popular · Imagens criadas por inteligência artificial</div>
    <header><div className="brand"><span className="brand-mark">♥</span><span>EU E O<br/><b>PRESIDENTE</b></span></div><span className="status"><ShieldCheck size={16}/> arte fictícia com IA</span></header>
    {step === 'home' && <main>
      <section className="hero"><div className="eyebrow">HOMENAGEM POPULAR · FEITO PELO POVO, PARA O POVO</div><h1>Saiba como ficaria você ao lado do <em>presidente Lula</em></h1><p className="lead">Envie sua foto e veja uma montagem especial ao lado de Luiz Inácio Lula da Silva.</p><p className="support">Milhões de brasileiros carregam essa história dentro de casa. Agora você pode ter uma lembrança dessa história com o seu rosto nela.</p></section>
      <section className="card upload-card"><div className="section-kicker"><Camera size={20}/> SUA HOMENAGEM COMEÇA AQUI</div>
        {!file ? <button className="dropzone" onClick={()=>inputRef.current?.click()}><ImagePlus size={42}/><strong>Coloque sua foto aqui</strong><span>Arraste uma imagem ou clique para selecionar</span><small>JPG, PNG ou WEBP · Máximo 10 MB</small></button> : <div className="preview-upload"><img src={src} alt="Pré-visualização da sua foto"/><div><strong>Foto pronta para a montagem</strong><p>Funciona melhor com o rosto bem visível, de frente e com boa luz.</p><button className="text-button" onClick={()=>inputRef.current?.click()}>Trocar foto</button></div></div>}
        <input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>choose(e.target.files?.[0])}/>
        {error && <div className="error"><CircleAlert size={18}/>{error}</div>}
        <label className="consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>Sou maior de idade, a foto é minha e autorizo o uso apenas para criar esta montagem. Li e aceito os Termos de Uso e a Política de Privacidade.</span></label>
        <button className="primary" disabled={!file || !consent} onClick={generate}>{file && consent ? 'Gerar minha foto com o presidente' : 'Envie uma foto para continuar'} <Sparkles size={18}/></button>
        <p className="ai-note">A imagem é uma montagem gerada por inteligência artificial e não representa um encontro real.</p>
        <div className="trust"><span><LockKeyhole size={15}/> Não treinamos IA com sua foto</span><span><Trash2 size={15}/> Apagada em 24h</span><span><Check size={15}/> Pagamento único</span></div>
      </section>
      <section className="options"><h2>Deixe a homenagem com a sua cara</h2><p>Escolha um cenário e escreva um recado para entrar no seu pôster.</p><div className="option-grid"><div><label>Cenário da homenagem</label><select value={scenario} onChange={e=>setScenario(e.target.value)}>{scenarios.map(s=><option key={s}>{s}</option>)}</select></div><div><label>Selo de carinho</label><select value={seal} onChange={e=>setSeal(e.target.value)}>{seals.map(s=><option key={s}>{s}</option>)}</select></div><div className="full"><label>Escreva um recado pra ele <small>{dedication.length}/90</small></label><input maxLength={90} value={dedication} onChange={e=>setDedication(e.target.value)} placeholder="Obrigado por tudo, presidente."/></div></div></section>
      <section className="steps"><h2>Como funciona</h2><div className="step-grid">{[['1','Envie sua foto','Uma foto sua, de frente, com o rosto visível.'],['2','Gere sua montagem','Nossa IA cria sua homenagem em pôster.'],['3','Desbloqueie a versão final','Por R$ 9,90, receba o arquivo em alta resolução.']].map(([n,t,d])=><div className="step" key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></div>)}</div></section>
    </main>}
    {step === 'generating' && <Loading connected={Boolean(import.meta.env.VITE_IMAGE_GENERATION_URL)}/>} 
    {(step === 'preview' || step === 'checkout' || step === 'paid') && <main className="flow"><button className="back" onClick={()=>setStep(step==='checkout'?'preview':'home')}>← Voltar</button>{step === 'preview' && <Preview poster={fakePoster} scenario={scenario} seal={seal} dedication={dedication} onCheckout={goCheckout} onReset={reset}/>} {step === 'checkout' && <Checkout poster={fakePoster} displayPrice={displayPrice} more={more} setMore={setMore} customValue={customValue} setCustomValue={setCustomValue} onPaid={()=>setStep('paid')}/>} {step === 'paid' && <Paid poster={fakePoster} onReset={reset}/>}</main>}
    <footer><span>© 2026 Eu e o Presidente</span><span>Política de Privacidade · Termos de Uso · Como usamos IA · Excluir minha foto</span><p>Este site é independente e não possui vínculo com o presidente, governo, partido, campanha ou órgão público. Todas as imagens são fictícias e criadas por IA.</p></footer>
  </div>
}

function Loading({connected}:{connected:boolean}){return <main className="loading"><Sparkles size={40}/><h1>{connected ? 'O Codex está criando sua homenagem...' : 'Preparando sua homenagem...'}</h1><p>{connected ? 'A IA está combinando sua foto, o cenário e o acabamento do pôster.' : 'Analisando sua foto e ajustando luz e enquadramento.'}</p><div className="progress"><motion.div initial={{width:0}} animate={{width:'100%'}} transition={{duration:1.7}}/></div><span>{connected ? 'Isso pode levar alguns segundos.' : 'Modo demonstração ativo.'}</span></main>}
function Poster({src,scenario,seal,dedication,clean=false}:{src:string;scenario:string;seal:string;dedication:string;clean?:boolean}){const generated = src.startsWith('data:') || src.startsWith('http') || src.startsWith('/'); return <div className={'poster '+(clean?'clean':'')}><div className={'poster-image '+(generated?'generated-art':'collage')}>
  {generated ? <img src={src} alt="Montagem gerada por IA"/> : <><div className="person-panel user-panel">{src?<img src={src} alt="Pessoa que enviou a foto"/>:<div className="demo-person">VOCÊ</div>}</div><div className="person-panel lula-panel"><img src={lulaReference} alt="Presidente Lula" onError={e=>{e.currentTarget.style.display='none'; e.currentTarget.parentElement?.classList.add('fallback')}}/><div className="lula-placeholder">LULA<br/><small>imagem de referência</small></div></div></>}
  {!clean&&<div className="watermark">PRÉVIA · DESBLOQUEIE · PRÉVIA · DESBLOQUEIE</div>}</div><div className="poster-caption"><span>{scenario} · {seal}</span><strong>{dedication || 'Uma homenagem para guardar'}</strong><small>IMAGEM FICTÍCIA CRIADA POR IA</small></div></div>}
function Preview({poster,scenario,seal,dedication,onCheckout,onReset}:{poster:string;scenario:string;seal:string;dedication:string;onCheckout:()=>void;onReset:()=>void}){return <><div className="eyebrow">SUA PRÉVIA ESTÁ PRONTA</div><h1>Gostou do resultado?</h1><p className="lead">Desbloqueie sua imagem em alta qualidade e sem a marca d’água de prévia.</p><Poster src={poster} scenario={scenario} seal={seal} dedication={dedication}/><div className="unlock card"><h2>Leve essa lembrança com você</h2>{['Arquivo em alta resolução, pronto para impressão','Sua dedicatória e seu selo no pôster','Download imediato direto no navegador','Versão quadrada extra para postar'].map(x=><p key={x}><Check size={18}/>{x}</p>)}<button className="primary" onClick={onCheckout}>Baixar imagem sem marca d’água <Download size={18}/></button><small>Pagamento único de R$ 9,90 · Sem assinatura · Sem cobrança recorrente</small><button className="text-button" onClick={onReset}>Gerar novamente com outro cenário</button></div></>}
function Checkout({poster,displayPrice,more,setMore,customValue,setCustomValue,onPaid}:{poster:string;displayPrice:string;more:boolean;setMore:(v:boolean)=>void;customValue:string;setCustomValue:(v:string)=>void;onPaid:()=>void}){return <div className="checkout"><div><div className="eyebrow">COMPRA SEGURA</div><h1>Desbloqueie sua imagem</h1><p className="lead">Pague R$ 9,90 e receba agora a versão final da sua homenagem, em alta resolução e sem a marca d’água de prévia.</p><div className="mini"><Poster src={poster} scenario="Sua homenagem" seal="" dedication=""/></div></div><div className="card pay-card"><h2>Homenagem em alta resolução</h2><div className="price">{displayPrice}</div><button className="more-toggle" onClick={()=>setMore(!more)}>Quero pagar um valor maior <ChevronDown size={17}/></button>{more&&<><div className="price-options">{['9,90','19,90','29,90'].map(v=><button key={v} onClick={()=>setCustomValue(v)}>R$ {v}</button>)}</div><small>O valor acima de R$ 9,90 é opcional e vai apenas para os custos do site. Não é doação eleitoral e não vai para partido, campanha ou candidato.</small></>}<div className="ia-box"><Sparkles size={18}/><span>O selo “IMAGEM FICTÍCIA CRIADA POR IA” permanece na imagem final. Ele garante que a homenagem nunca seja confundida com um registro real.</span></div><button className="primary" onClick={onPaid}>Pagar com PIX <LockKeyhole size={18}/></button><small>🔒 Ambiente seguro · PIX aprovado na hora · Sem assinatura</small><button className="fake-payment" onClick={onPaid}>Simular pagamento aprovado (modo demonstração)</button></div></div>}
function Paid({poster,onReset}:{poster:string;onReset:()=>void}){return <div className="paid"><div className="success"><Check size={42}/></div><div className="eyebrow">PAGAMENTO CONFIRMADO</div><h1>Sua homenagem está pronta.</h1><p className="lead">A versão final está disponível para você baixar. O selo de IA permanece por transparência.</p><Poster src={poster} scenario="Sua homenagem" seal="" dedication="" clean/><button className="primary" onClick={()=>alert('Download simulado no MVP. A rota autenticada será ligada ao gateway real na próxima etapa.')}>Baixar minha imagem <Download size={18}/></button><button className="whatsapp"><MessageCircle size={18}/> Compartilhar no WhatsApp</button><button className="text-button" onClick={onReset}>Criar outra homenagem</button></div>}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
