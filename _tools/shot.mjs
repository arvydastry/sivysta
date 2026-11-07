// Usage: node shot.mjs <url> <out.png> [width=1440] [height=900] [--full] [--scroll] [--wait=ms] [--js="code"] [--port=9333]
// Real viewport via CDP (works at 390px). Hard-kills itself after 55 s.
// --full    captures the whole page (scrolls through first so reveal animations fire)
// --scroll  scrolls step-by-step before capture (implied by --full)
// --reduce  emulates prefers-reduced-motion: reduce
// Prints console errors + horizontal overflow report to stdout.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const killer = setTimeout(() => { console.error('TIMEOUT 55s'); cleanup(); process.exit(2); }, 55000);
const args = process.argv.slice(2);
const pos = args.filter(a => !a.startsWith('--'));
const flag = n => args.find(a => a.startsWith('--' + n));
const val = (n, d) => { const f = flag(n); return f && f.includes('=') ? f.slice(f.indexOf('=') + 1) : d; };
const [url, out, w = '1440', h = '900'] = pos;
const W = +w, H = +h, full = !!flag('full'), doScroll = full || !!flag('scroll');
const waitMs = +val('wait', 1200), extraJs = val('js', ''), port = +val('port', 9300 + Math.floor(Math.random() * 600));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const udd = mkdtempSync(join(tmpdir(), 'cdp-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${udd}`, '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
function cleanup() { try { chrome.kill('SIGKILL'); } catch {} try { rmSync(udd, { recursive: true, force: true }); } catch {} }
const sleep = ms => new Promise(r => setTimeout(r, ms));

let ws, id = 0; const pending = new Map(); const errors = [];
async function connect() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find(t => t.type === 'page');
      if (page) { ws = new WebSocket(page.webSocketDebuggerUrl); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; }); break; }
    } catch {}
    await sleep(200);
  }
  if (!ws) throw new Error('no CDP');
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.j(new Error(JSON.stringify(m.error))) : p.r(m.result); }
    else if (m.method === 'Runtime.exceptionThrown') errors.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('CONSOLE ' + m.params.args.map(a => a.value ?? a.description).join(' '));
    else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push('LOG ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
  };
}
const send = (method, params = {}) => new Promise((r, j) => { const i = ++id; pending.set(i, { r, j }); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

try {
  await connect();
  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 768 });
  if (W < 768) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  if (flag('reduce')) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Page.navigate', { url });
  for (let i = 0; i < 50; i++) { await sleep(200); if (await evalJs('document.readyState') === 'complete') break; }
  await sleep(waitMs);
  if (extraJs) { await evalJs(`(async()=>{${extraJs}})()`); await sleep(500); }
  if (doScroll) {
    const total = await evalJs('document.documentElement.scrollHeight');
    for (let y = 0; y < total; y += Math.round(H * 0.6)) { await evalJs(`window.scrollTo(0,${y});window.dispatchEvent(new Event('scroll'))`); await sleep(120); }
    await sleep(500);
    if (!full) { await evalJs('window.scrollTo(0,0)'); await sleep(400); }
  }
  const report = await evalJs(`(()=>{const dw=document.documentElement.clientWidth;const over=[];document.querySelectorAll('body *').forEach(el=>{const r=el.getBoundingClientRect();if(r.width&&(r.right>dw+1||r.left<-1)){const cs=getComputedStyle(el);let p=el.parentElement,clipped=false;while(p){const s=getComputedStyle(p);if(/hidden|clip|auto|scroll/.test(s.overflowX)){clipped=true;break}p=p.parentElement}if(!clipped&&cs.position!=='fixed')over.push((el.tagName+'.'+[...el.classList].join('.')).slice(0,60)+' r='+Math.round(r.right))}});return {scrollW:document.documentElement.scrollWidth,clientW:dw,height:document.documentElement.scrollHeight,overflow:over.slice(0,12),brokenImgs:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src')).slice(0,10)}})()`);
  let shot;
  if (full) {
    const hgt = Math.min(report.height, 16000);
    await evalJs('window.scrollTo(0,0)'); await sleep(300);
    shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: W, height: hgt, scale: 1 } });
  } else {
    shot = await send('Page.captureScreenshot', { format: 'png' });
  }
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log(JSON.stringify({ out, ...report, errors: errors.slice(0, 15) }));
} catch (e) { console.error('ERR', e.message); cleanup(); clearTimeout(killer); process.exit(1); }
cleanup(); clearTimeout(killer); process.exit(0);
