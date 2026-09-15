import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUpRight, Play, Pause, ArrowRight } from '@phosphor-icons/react';
import templates from './templates.json';

type Vehicle = (typeof templates)[number];
const asset = (name: string) => `/assets/templates/${name}.webp`;
const path = (item: Vehicle) => `/templates/${item.slug}/`;
export const campaign = (item: Vehicle) => `${item.slug.replace('vr-', '').replace('-template', '')}-campaign`;

export function CampaignImage({ item, eager = false }: { item: Vehicle; eager?: boolean }) {
  return <img className="campaign-image" src={asset(campaign(item))} srcSet={`${asset(campaign(item)+'-small')} 960w, ${asset(campaign(item))} 1920w`} sizes="100vw" width="1920" height="1080" alt={`Cinematic promotional artwork for ${item.name}`} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} />;
}

function VehicleTabs({ active, setActive, prefix }: { active: number; setActive: (value:number)=>void; prefix:string }) {
  const navigate = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const key = event.key;
    if (!['ArrowRight','ArrowLeft','Home','End'].includes(key)) return;
    event.preventDefault();
    const next = key === 'Home' ? 0 : key === 'End' ? 4 : (index + (key === 'ArrowRight' ? 1 : 4)) % 5;
    setActive(next); document.getElementById(`${prefix}-${next}`)?.focus();
  };
  return <div className="cinema-tabs" role="tablist" aria-label="Choose your vehicle">{templates.map((item,index)=><button id={`${prefix}-${index}`} key={item.slug} type="button" role="tab" aria-selected={active===index} aria-controls={`${prefix}-panel`} tabIndex={active===index?0:-1} onClick={()=>setActive(index)} onKeyDown={e=>navigate(e,index)}><img src={asset(campaign(item)+'-small')} width="320" height="180" alt="" loading="lazy" /><span><small>0{index+1}</small>{item.shortName}</span></button>)}</div>;
}

export default function CinematicShowroom({ home = false, selected, onSelect }: { home?: boolean; selected?:number; onSelect?:(value:number)=>void }) {
  const [local,setLocal] = useState(0);
  const active=selected ?? local;
  const setActive=onSelect ?? setLocal;
  const item = templates[active];
  const prefix = home ? 'studio-vehicle' : 'collection-vehicle';
  const Heading = home ? 'h2' : 'h1';
  return <section className={`cinema-hero ${home?'cinema-home':''}`} aria-labelledby={`${prefix}-heading`}>
    <div className="cinema-background" key={item.slug}><CampaignImage item={item} eager={!home} /></div>
    <div className="cinema-copy section-pad" id={`${prefix}-panel`} role="tabpanel" aria-labelledby={`${prefix}-${active}`}>
      <p className="cinema-eyebrow">Playframe Vault <span>/</span> VR vehicle collection</p>
      <Heading id={`${prefix}-heading`}>Make worlds<br />worth driving.</Heading>
      <p className="cinema-description">Five editable vehicle templates for Unreal Engine 5.8,<br className="desktop-break" /> with hands-on VR controls and demos to try.</p>
      <div className="cinema-actions"><a className="cinema-button" href={path(item)}>Explore {item.shortName.toLowerCase()} <ArrowUpRight aria-hidden="true" /></a><a className="cinema-play" href={home?`${path(item)}#film`:'#gameplay'}><Play weight="fill" aria-hidden="true" />Watch gameplay</a></div>
    </div>
    <div className="cinema-bottom section-pad"><p className="cinema-art-note">Promotional artwork · Actual gameplay below</p><VehicleTabs active={active} setActive={setActive} prefix={prefix} /><div className="cinema-baseline"><span>{item.name} / Unreal Engine 5.8</span><a href={home?'/templates/':'#choose'}>Explore the collection <ArrowRight aria-hidden="true" /></a></div></div>
  </section>;
}

export function GameplayShowcase({ active, setActive }: { active:number;setActive:(value:number)=>void }) {
  const [paused,setPaused] = useState(true);
  const video = useRef<HTMLVideoElement>(null);
  const item=templates[active];
  useEffect(()=>{
    const node=video.current;
    if(!node) return;
    const observer = new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)node.pause();},{threshold:.1});
    observer.observe(node);
    const hide=()=>{if(document.hidden)node.pause();};
    document.addEventListener('visibilitychange',hide);
    return ()=>{observer.disconnect();document.removeEventListener('visibilitychange',hide);};
  },[active]);
  return <section className="cinema-gameplay section-pad" id="gameplay" aria-labelledby="gameplay-title"><div className="cinema-editorial-heading"><h2 id="gameplay-title">Your hands.<br />The controls.</h2><div><p>Reach for the wheel. Take the collective.<br />Feel how each vehicle responds, then make it part of your own world.</p><span>Actual Unreal Engine capture</span></div></div>
    <div className="cinema-film" id="gameplay-panel" role="tabpanel" aria-labelledby={`gameplay-${active}`}>
      {item.video ? <><video key={item.slug} ref={video} controls playsInline preload="none" poster={asset(item.gallery[0].image)} onPlay={()=>setPaused(false)} onPause={()=>setPaused(true)} aria-label={`${item.name} gameplay`}><source src={item.video} type="video/webm" /></video><button className="cinema-film-toggle" type="button" aria-label={paused?'Play gameplay':'Pause gameplay'} onClick={()=>{const node=video.current;if(node){if(node.paused)void node.play().catch(()=>setPaused(true));else node.pause();}}}>{paused?<Play weight="fill"/>:<Pause weight="fill"/>}<span>{paused?'Play film':'Pause film'}</span></button></> : <a href={item.videoLink} target="_blank" rel="noreferrer"><img src={asset(item.gallery[0].image)} alt={item.gallery[0].alt} width="1280" height="720" loading="lazy"/><span className="cinema-film-toggle"><Play weight="fill"/>Watch on {item.shortName==='Motorcycle'?'YouTube':'Fab'}<ArrowUpRight/></span></a>}
    </div><div className="cinema-film-foot"><p>{item.mediaNote}</p><a href={path(item)}>Explore {item.shortName.toLowerCase()} <ArrowUpRight aria-hidden="true"/></a></div>
    <div className="cinema-text-tabs" role="tablist" aria-label="Choose gameplay">{templates.map((vehicle,index)=><button id={`gameplay-${index}`} type="button" role="tab" aria-selected={active===index} aria-controls="gameplay-panel" key={vehicle.slug} tabIndex={active===index?0:-1} onKeyDown={event=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?4:(index+(event.key==='ArrowRight'?1:4))%5;video.current?.pause();setPaused(true);setActive(next);document.getElementById(`gameplay-${next}`)?.focus();}}} onClick={()=>{video.current?.pause();setPaused(true);setActive(index);}}><small>0{index+1}</small>{vehicle.shortName}</button>)}</div>
    {item.musicCredit && <p className="cinema-credit">Music: <a href="https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1300046">Dream Culture — Kevin MacLeod</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Edited with fades and level changes.</p>}
  </section>;
}

export function ProductCampaign({ item }: { item: Vehicle }) {
  return <section className="product-campaign"><CampaignImage item={item} eager/><div className="product-campaign-copy section-pad"><a className="product-collection-link" href="/templates/">The collection / {item.shortName}</a><p className="cinema-eyebrow">{item.category} / Unreal Engine 5.8</p><h1>{item.name}</h1><p>{item.summary}</p><div className="cinema-actions"><a className="cinema-button" href={item.fab} target="_blank" rel="noreferrer">View on Fab <ArrowUpRight aria-hidden="true"/></a><a className="cinema-play" href="#downloads">Try a demo <ArrowRight aria-hidden="true"/></a></div><span className="product-price-note">Current pricing and license options on Fab.</span></div><p className="product-art-note section-pad">Promotional artwork · Explore the included content below</p></section>;
}
