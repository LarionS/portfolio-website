export const measurementId = 'G-K819TB5RLR';
export const consentKey = 'playframe.analytics.v1';
const consentLifetime = 180 * 24 * 60 * 60 * 1000;
type Choice = 'granted' | 'denied';
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; [key: `ga-disable-${string}`]: boolean };

export function readChoice(storage: Pick<Storage, 'getItem'>, now = Date.now()): Choice | null {
  try {
    const value = JSON.parse(storage.getItem(consentKey) || 'null');
    return value && value.expires > now && ['granted', 'denied'].includes(value.choice) ? value.choice : null;
  } catch { return null; }
}

export function cleanPageURL(value: string): string {
  const url = new URL(value);
  const allowed = new URLSearchParams();
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
    const value = url.searchParams.get(key);
    if (value && /^[a-zA-Z0-9_-]{1,100}$/.test(value)) allowed.set(key, value);
  }
  return url.origin + url.pathname + (allowed.size ? '?' + allowed.toString() : '');
}

export function classifyLink(href: string, label: string, base: string) {
  const url = new URL(href, base);
  const host = url.hostname.replace(/^www\./, '');
  const clean = url.origin + url.pathname;
  if (host === 'fab.com') return { event: 'fab_click', destination: clean };
  if (host === 'drive.google.com') return { event: /demo/i.test(label) ? 'demo_click' : /guide|documentation/i.test(label) ? 'guide_click' : 'resource_click', destination: clean };
  if (url.origin === new URL(base).origin && url.pathname.startsWith('/guides/')) return { event: 'guide_click', destination: clean };
  if (host === 'youtube.com' || host === 'youtu.be') return { event: 'video_link_click', destination: clean };
  return null;
}

export function startAnalytics(win: AnalyticsWindow, doc: Document, choice: Choice | null, id: string): boolean {
  if (choice !== 'granted' || !/^G-[A-Z0-9]+$/.test(id) || win.location.hostname !== 'playframe.qd.je') return false;
  if (doc.getElementById('playframe-google-tag')) return true;
  win[`ga-disable-${id}`] = false;
  win.dataLayer = win.dataLayer || [];
  win.gtag = function () { win.dataLayer!.push(arguments); };
  win.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  win.gtag('consent', 'update', { analytics_storage: 'granted' });
  win.gtag('js', new Date());
  win.gtag('config', id, {
    page_location: cleanPageURL(win.location.href),
    page_referrer: doc.referrer ? new URL(doc.referrer).origin : '',
    allow_google_signals: false, allow_ad_personalization_signals: false,
    cookie_domain: win.location.hostname, cookie_expires: 180 * 24 * 60 * 60,
    cookie_update: false, cookie_flags: 'SameSite=Lax;Secure',
  });
  const script = doc.createElement('script');
  script.id = 'playframe-google-tag'; script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  doc.head.append(script);
  return true;
}

export function mountAnalytics() {
  if (!measurementId || document.getElementById('analytics-choices')) return;
  const win = window as unknown as AnalyticsWindow;
  let choice: Choice | null = null;
  try { choice = readChoice(localStorage); } catch { /* Storage can be unavailable. */ }
  let active = startAnalytics(win, document, choice, measurementId);
  const panel = document.createElement('aside');
  panel.id = 'analytics-choices'; panel.className = 'analytics-choices';
  panel.setAttribute('aria-label', 'Optional website analytics');
  panel.innerHTML = `<strong>Help us improve Playframe.</strong><p>Allow Google Analytics to measure page visits, video plays and clicks to Fab, demos and guides? It uses cookies and shares usage and device information with Google. Advertising features are off. Your choice lasts 180 days.</p><a href="/privacy/">Privacy notice</a><div><button type="button" data-choice="denied">No thanks</button><button type="button" data-choice="granted">Allow analytics</button></div>`;
  panel.hidden = choice !== null;
  const manage = document.createElement('button');
  manage.type = 'button'; manage.className = 'analytics-manage'; manage.textContent = 'Privacy choices';
  manage.setAttribute('aria-controls', panel.id); manage.setAttribute('aria-expanded', String(!panel.hidden));
  manage.onclick = () => { panel.hidden = !panel.hidden; manage.setAttribute('aria-expanded', String(!panel.hidden)); if (!panel.hidden) panel.querySelector('button')?.focus(); };
  panel.querySelectorAll<HTMLButtonElement>('button[data-choice]').forEach(button => button.onclick = () => {
    choice = button.dataset.choice as Choice;
    try { localStorage.setItem(consentKey, JSON.stringify({ choice, expires: Date.now() + consentLifetime })); } catch { /* Honour the choice for this visit. */ }
    if (choice === 'granted') active = startAnalytics(win, document, choice, measurementId);
    else if (active) {
      win[`ga-disable-${measurementId}`] = true;
      for (const part of document.cookie.split(';')) {
        const name = part.trim().split('=')[0];
        if (name === '_ga' || name.startsWith('_ga_')) {
          for (const domain of ['', `;domain=${location.hostname}`, `;domain=.${location.hostname}`]) document.cookie = `${name}=; Max-Age=0;path=/${domain};SameSite=Lax;Secure`;
        }
      }
      // Reload removes the loaded tag and its automatic event listeners immediately.
      location.reload(); return;
    }
    panel.hidden = true; manage.setAttribute('aria-expanded', 'false'); manage.focus();
  });
  document.body.append(panel, manage);
  const send = (event: string, data: Record<string, string>) => { if (active && choice === 'granted') win.gtag?.('event', event, { ...data, page_path: location.pathname, transport_type: 'beacon' }); };
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a'); if (!link || link.closest('#analytics-choices')) return;
    const result = classifyLink(link.href, link.textContent || '', location.href);
    if (result) send(result.event, { destination: result.destination });
  });
  for (const event of ['play', 'ended']) document.addEventListener(event, action => {
    if (action.target instanceof HTMLVideoElement) send(event === 'play' ? 'video_start' : 'video_complete', { video_title: action.target.getAttribute('aria-label') || 'Playframe film', video_url: action.target.currentSrc.split('?')[0] });
  }, true);
}
