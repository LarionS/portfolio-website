import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, ArrowRight, ArrowLeft, DownloadSimple, Play, X, CornersOut, Check, VirtualReality, Code, SlidersHorizontal } from "@phosphor-icons/react";
import templates from "./templates.json";

export type VehicleTemplate = (typeof templates)[number];
export { templates };
export const templatePath = (item: VehicleTemplate) => `/templates/${item.slug}/`;
const media = (name: string) => `/assets/templates/${name}.webp`;
const store = "https://www.fab.com/sellers/Playframe%20Vault";

function TemplateImage({ item, eager = false }: { item: VehicleTemplate; eager?: boolean }) {
  return <img src={media(item.image)} srcSet={`${media(`${item.image}-small`)} 720w, ${media(item.image)} 1280w`} sizes="(max-width: 760px) 100vw, 65vw" alt={item.imageAlt} width="1280" height="720" loading={eager ? "eager" : "lazy"} decoding="async" />;
}

function Eyebrow({ children }: { children: string }) {
  return <p className="eyebrow"><span aria-hidden="true" />{children}</p>;
}

export function TemplateShowcase() {
  const [active, setActive] = useState(0);
  const item = templates[active];
  const navigate = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % templates.length;
    else if (event.key === "ArrowLeft") next = (index + templates.length - 1) % templates.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = templates.length - 1;
    else return;
    event.preventDefault(); setActive(next); document.getElementById(`vehicle-tab-${next}`)?.focus();
  };
  return <section className="vehicle-showcase section-pad" aria-labelledby="templates-title">
    <div className="vehicle-intro"><div><Eyebrow>Playframe Vault / Unreal Engine 5.8</Eyebrow><h2 id="templates-title">Take the controls.<br /><span>Make it yours.</span></h2></div><div className="vehicle-intro-note"><p>Five vehicles. A world of starting points.<br />Editable VR systems, built to become<br className="desktop-break" /> something of your own.</p><a className="text-link" href="/templates/">Explore all templates <ArrowUpRight aria-hidden="true" /></a></div></div>
    <div className="vehicle-tabs" role="tablist" aria-label="Explore VR vehicle templates">{templates.map((vehicle, index) => <button key={vehicle.slug} id={`vehicle-tab-${index}`} type="button" role="tab" aria-selected={index === active} aria-controls="vehicle-panel" tabIndex={index === active ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => navigate(event, index)}><span className="vehicle-tab-number">0{index + 1}</span>{vehicle.shortName}<ArrowUpRight aria-hidden="true" /></button>)}</div>
    <div className="vehicle-stage" id="vehicle-panel" role="tabpanel" aria-labelledby={`vehicle-tab-${active}`} tabIndex={0}>
      <a className="vehicle-stage-image" href={templatePath(item)} aria-label={`Explore ${item.name}`}><TemplateImage item={item} /><span className="vehicle-media-label">Actual product imagery</span><span className="vehicle-image-link"><CornersOut aria-hidden="true" />Explore the pack</span></a>
      <div className="vehicle-stage-copy"><span className="vehicle-category">{item.category} / 0{active + 1}</span><h3>{item.tagline}</h3><p>{item.summary}</p><ul>{item.highlights.map(feature => <li key={feature}><Check aria-hidden="true" />{feature}</li>)}</ul><a className="vehicle-button" href={templatePath(item)}>Explore {item.shortName.toLowerCase()} <ArrowUpRight aria-hidden="true" /></a><span className="vehicle-stage-foot">{item.name}</span></div>
    </div>
    <div className="vehicle-showcase-bottom"><span>Unreal Engine 5.8 <i>/</i> OpenXR <i>/</i> Blueprint customization</span><a href="/templates/#choose">Find your starting point <ArrowRight aria-hidden="true" /></a></div>
  </section>;
}

function TemplateHeader() {
  return <><a className="skip-link" href="#main">Skip to content</a><header className="template-header section-pad"><a href="/" className="template-brand" aria-label="Playframe home"><img src="/playframe-favicon.png" width="30" height="30" alt="" /><span>playframe<span>.</span></span></a><nav aria-label="Main navigation"><a href="/">The studio</a><a href="/templates/" aria-current="page">VR templates</a><a className="template-header-fab" href={store} target="_blank" rel="noreferrer">Our Fab store <ArrowUpRight aria-hidden="true" /></a></nav></header></>;
}

function TemplateFooter() {
  return <footer className="template-footer section-pad"><div><Eyebrow>Made by Playframe</Eyebrow><h2>Your idea.<br />Our starting point.</h2><p>Questions about a template or a custom VR project?<br />Talk directly to the studio that builds them.</p><a className="text-link" href="mailto:Larion1@gmail.com?subject=Playframe%20VR%20templates">Get in touch <ArrowUpRight aria-hidden="true" /></a></div><nav aria-label="Footer navigation"><a href="/">Explore the studio <ArrowUpRight aria-hidden="true" /></a><a href="/templates/">All VR templates <ArrowUpRight aria-hidden="true" /></a><a href={store} target="_blank" rel="noreferrer">Playframe Vault on Fab <ArrowUpRight aria-hidden="true" /></a></nav><div className="template-footer-baseline"><span>© 2026 Playframe</span><span>Unreal Engine. Real possibilities.</span></div></footer>;
}

function TemplateCard({ item, featured = false }: { item: VehicleTemplate; featured?: boolean }) {
  return <article className={`catalogue-card${featured ? " catalogue-featured" : ""}`}><a className="catalogue-image" href={templatePath(item)}><TemplateImage item={item} /><span className="vehicle-media-label">{item.category}</span><span className="catalogue-image-arrow"><ArrowUpRight aria-hidden="true" /></span></a><div className="catalogue-card-copy"><span className="vehicle-category">Unreal Engine 5.8 / OpenXR</span><h2><a href={templatePath(item)}>{item.name}<ArrowUpRight aria-hidden="true" /></a></h2><p>{item.summary}</p><div className="template-tags">{item.highlights.map(tag => <span key={tag}>{tag}</span>)}</div><a className="text-link" href={templatePath(item)}>Explore the template <ArrowRight aria-hidden="true" /></a></div></article>;
}

function Catalogue() {
  return <><TemplateHeader /><main id="main" className="template-main"><section className="catalogue-heading section-pad"><Eyebrow>Playframe Vault / VR vehicle collection</Eyebrow><div><h1>Put your world<br />in <em>motion.</em></h1><p>From your first corner to your first takeoff.<br />Five editable vehicle systems for Unreal Engine,<br className="desktop-break" /> with hands-on VR controls and demos to try.</p></div><div className="catalogue-heading-foot"><span>05 templates / Road · Water · Air</span><a href="#choose">Choose your vehicle <ArrowRight aria-hidden="true" /></a></div></section>
    <section className="catalogue-grid section-pad" id="choose" aria-label="VR vehicle templates">{templates.map((item,index) => <TemplateCard key={item.slug} item={item} featured={index === 0} />)}</section>
    <section className="template-principles section-pad" aria-label="How to get started"><div><VirtualReality aria-hidden="true" /><h2>Try the experience.</h2><p>Find available Windows and Quest demos on each template page. Check the feel on your own hardware.</p></div><div><SlidersHorizontal aria-hidden="true" /><h2>Make it yours.</h2><p>Explore the illustrated guides, editor settings and Blueprint workflows before choosing your starting point.</p></div><div><Code aria-hidden="true" /><h2>Build from there.</h2><p>Get the plugin on Fab, follow its setup guide, and adapt the vehicle to your Unreal project.</p></div></section>
    <section className="catalogue-faq section-pad"><Eyebrow>Before you get started</Eyebrow><h2>A few useful details.</h2><details><summary>Are these games or development templates?</summary><p>These are Unreal Engine plugins for developers. The packaged demos let you try the experience; the purchased plugins provide editable systems and content for your own projects.</p></details><details><summary>Which engine version and headsets do they support?</summary><p>The current collection targets Unreal Engine 5.8. Each product page links its hardware scope, dependencies and setup guide. Try the relevant demo on your target hardware before buying.</p></details><details><summary>Where do I buy them?</summary><p>Purchases, current pricing and Personal/Professional license choices are handled on <a href={store} target="_blank" rel="noreferrer">Playframe Vault on Fab</a>. Each template is a separate product.</p></details><details><summary>Do you make other assets?</summary><p>Yes. You can also explore Epic Maze Generator and Epic Static Maze Pack in <a href={store} target="_blank" rel="noreferrer">our Fab store</a>.</p></details></section>
  </main><TemplateFooter /></>;
}

function ProductPage({ item }: { item: VehicleTemplate }) {
  const [enlarged, setEnlarged] = useState<{ image: string; alt: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (enlarged && !dialog.current?.open) dialog.current?.showModal(); }, [enlarged]);
  const gallery = [{image:item.image,alt:item.imageAlt,caption:"The included vehicle in the product gallery."},...item.gallery];
  return <><TemplateHeader /><main id="main" className="template-main">
    <section className="template-product-heading section-pad"><a className="template-back" href="/templates/"><ArrowLeft aria-hidden="true" />All VR templates</a><div className="template-product-intro"><div><Eyebrow>{`${item.category} / Unreal Engine 5.8`}</Eyebrow><h1>{item.name}</h1></div><div><p>{item.summary}</p><div className="template-actions"><a className="vehicle-button" href={item.fab} target="_blank" rel="noreferrer">View on Fab <ArrowUpRight aria-hidden="true" /></a><a className="vehicle-button vehicle-button-outline" href="#downloads">Try a demo <DownloadSimple aria-hidden="true" /></a></div><span className="template-buy-note">Current pricing and license options on Fab.</span></div></div></section>
    <figure className="template-hero-media section-pad"><TemplateImage item={item} eager /><figcaption><span>Actual product imagery</span><span>{item.name} / Playframe Vault</span></figcaption></figure>
    <section className="template-overview section-pad"><div><Eyebrow>Built for your next world</Eyebrow><h2>{item.tagline}</h2></div><div><p>{item.description}</p><div className="template-tags">{item.highlights.map(tag=><span key={tag}>{tag}</span>)}</div></div></section>
    <section className="template-feature-grid section-pad" aria-label="Included features">{item.features.map((feature,index)=><article key={feature.title}><span>0{index+1}</span><h3>{feature.title}</h3><p>{feature.body}</p></article>)}</section>
    <section className="template-gallery section-pad" aria-labelledby="gallery-title"><div className="template-section-heading"><h2 id="gallery-title">A closer look.</h2><span>From the product</span></div><div className="template-gallery-grid">{gallery.map(frame=><figure key={frame.image}><a href={media(frame.image)} onClick={event=>{event.preventDefault();setEnlarged(frame);}} aria-label={`Enlarge: ${frame.alt}`}><img src={media(frame.image)} alt={frame.alt} loading="lazy" decoding="async" width="1280" height="720" /><span><CornersOut aria-hidden="true" /></span></a><figcaption>{frame.caption}</figcaption></figure>)}</div><p className="template-media-note">{item.mediaNote}</p></section>
    <section className="template-film section-pad" aria-labelledby="film-title"><div className="template-section-heading"><h2 id="film-title">See it in motion.</h2>{!item.video && <a className="text-link" href={item.videoLink} target="_blank" rel="noreferrer"><Play aria-hidden="true" />{item.videoLabel}<ArrowUpRight aria-hidden="true" /></a>}</div>{item.video ? <><video controls playsInline preload="none" poster={media(item.image)} aria-label={`${item.name} trailer`}><source src={item.video} type="video/webm" /><a href={item.video}>Open the trailer</a></video><div className="template-film-caption"><span>{item.videoLabel}</span><a href={item.video} target="_blank" rel="noreferrer">Open video file <ArrowUpRight aria-hidden="true" /></a></div>{item.musicCredit && <p className="template-media-note">Trailer music: <a href="https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1300046" target="_blank" rel="noreferrer">Dream Culture by Kevin MacLeod</a>, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Edited excerpt with fades and adjusted level; music is used in the trailer only.</p>}</> : <p className="template-media-note">Watch the published footage and walkthrough using the link above.</p>}</section>
    <section className="template-downloads section-pad" id="downloads" aria-labelledby="downloads-title"><div><Eyebrow>Explore before you buy</Eyebrow><h2 id="downloads-title">Try it.<br />Read it. Build it.</h2><p>Public demos and documentation, straight from the product listing. Files open on Google Drive.</p><p className="template-download-note">Packaged demos let you try the vehicle. Editable examples may require the purchased plugin; follow the included guide.</p></div><div className="template-resource-list">{item.downloads.map(resource=><a key={resource.url} href={resource.url} target="_blank" rel="noreferrer"><DownloadSimple aria-hidden="true" /><span><strong>{resource.label}</strong><span>{resource.detail}</span></span><ArrowUpRight aria-hidden="true" /></a>)}</div></section>
    <section className="template-requirements section-pad"><h2>Before you build.</h2><div>{item.requirements.map(requirement=><p key={requirement}>{requirement}</p>)}<a className="text-link" href={item.fab} target="_blank" rel="noreferrer">Full technical details on Fab <ArrowUpRight aria-hidden="true" /></a></div></section>
    <section className="template-related section-pad" aria-labelledby="related-title"><div className="template-section-heading"><h2 id="related-title">Where next?</h2><a className="text-link" href="/templates/">All templates <ArrowRight aria-hidden="true" /></a></div><div>{templates.filter(other=>other.slug!==item.slug).map(other=><a key={other.slug} href={templatePath(other)}><TemplateImage item={other}/><span>{other.shortName}<ArrowUpRight aria-hidden="true" /></span></a>)}</div></section>
  </main><TemplateFooter /><dialog className="template-lightbox" ref={dialog} onClose={()=>setEnlarged(null)} onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}} aria-label="Product image">{enlarged && <div><button autoFocus type="button" aria-label="Close image" onClick={()=>dialog.current?.close()}><X /></button><img src={media(enlarged.image)} alt={enlarged.alt}/><p>{enlarged.alt}</p></div>}</dialog></>;
}

export default function Templates({ slug = "" }: { slug?: string }) {
  const item = templates.find(template=>template.slug===slug);
  return item ? <ProductPage item={item} /> : <Catalogue />;
}
