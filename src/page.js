export const PAGE = String.raw`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Calendar Desk</title>
<style>
:root{--bg:#16111F;--panel:#211936;--panel-2:#2B2147;--edge:#43336B;--violet:#A987F5;--orchid:#E4A6F2;--ink:#EFE9FB;--ink-soft:#A99CC9;--ready:#6FE0A8;--ask:#F2C46B;--shadow:#0C0814}@media(prefers-color-scheme:light){:root{--bg:#F6F2FE;--panel:#fff;--panel-2:#F0E9FC;--edge:#C9B6F0;--violet:#6B45C6;--orchid:#A94FBF;--ink:#241B33;--ink-soft:#6C5F8A;--ready:#1F7A52;--ask:#8A5E12;--shadow:#CFC0EE}}:root[data-theme=dark]{--bg:#16111F;--panel:#211936;--panel-2:#2B2147;--edge:#43336B;--violet:#A987F5;--orchid:#E4A6F2;--ink:#EFE9FB;--ink-soft:#A99CC9;--ready:#6FE0A8;--ask:#F2C46B;--shadow:#0C0814}:root[data-theme=light]{--bg:#F6F2FE;--panel:#fff;--panel-2:#F0E9FC;--edge:#C9B6F0;--violet:#6B45C6;--orchid:#A94FBF;--ink:#241B33;--ink-soft:#6C5F8A;--ready:#1F7A52;--ask:#8A5E12;--shadow:#CFC0EE}*{box-sizing:border-box}[hidden]{display:none!important}body{margin:0;background:var(--bg);color:var(--ink);font-family:ui-monospace,"Cascadia Mono","SF Mono",Menlo,Consolas,monospace;font-size:14px;line-height:1.5}.app{max-width:27rem;margin:0 auto;padding:1.5rem 1rem 4rem;display:flex;flex-direction:column;gap:.85rem}header{display:flex;align-items:center;gap:.5rem;font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;color:var(--violet);font-weight:700;padding-bottom:.3rem}header .heart{color:var(--orchid)}.card{background:var(--panel);border:2px solid var(--edge);box-shadow:4px 4px 0 var(--shadow);padding:.9rem;display:flex;flex-direction:column;gap:.7rem}.card.done{background:var(--panel-2);box-shadow:2px 2px 0 var(--shadow);padding:.55rem .9rem;flex-direction:row;align-items:center;gap:.5rem;color:var(--ink-soft);font-size:.8rem}.card.done .tick{color:var(--ready);font-weight:700}.lbl{font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-soft);font-weight:700}textarea{font:inherit;font-size:.86rem;color:var(--ink);background:var(--bg);border:2px solid var(--edge);padding:.6rem;width:100%;min-height:5.5rem;resize:vertical}textarea:focus-visible,button:focus-visible{outline:2px solid var(--orchid);outline-offset:2px}.drop{border:2px dashed var(--edge);background:var(--bg);padding:.7rem;text-align:center;color:var(--ink-soft);font-size:.78rem}.shots{display:flex;gap:.35rem;flex-wrap:wrap}.shot{width:34px;height:34px;border:2px solid var(--edge);background:repeating-conic-gradient(var(--violet) 0 25%,var(--orchid) 0 50%) 0/12px 12px;image-rendering:pixelated}button{font:inherit;font-weight:700;font-size:.82rem;letter-spacing:.06em;text-transform:uppercase;background:var(--violet);color:var(--bg);border:2px solid var(--edge);box-shadow:3px 3px 0 var(--shadow);padding:.6rem .8rem;cursor:pointer}button:active:not(:disabled){transform:translate(2px,2px);box-shadow:1px 1px 0 var(--shadow)}button:disabled{opacity:.4;cursor:not-allowed}button.ghost{background:transparent;color:var(--ink)}.row{display:grid;grid-template-columns:auto 1fr auto;gap:.2rem .6rem;align-items:baseline;border-top:1px solid var(--edge);padding:.4rem 0;font-variant-numeric:tabular-nums}.row:first-child{border-top:0}.row .d{color:var(--ink);font-weight:700;font-size:.82rem}.row .t{color:var(--ink-soft);font-size:.8rem}.row .s{font-size:.68rem;font-weight:700;letter-spacing:.08em}.row .s.ok{color:var(--ready)}.row .s.q{color:var(--ask)}.ask-box{background:var(--panel-2);border-left:3px solid var(--ask);padding:.6rem .7rem;display:flex;flex-direction:column;gap:.55rem}.ask-box p{margin:0;font-size:.84rem}.btn-row{display:flex;gap:.45rem;flex-wrap:wrap}.btn-row button{font-size:.74rem;padding:.45rem .7rem}.wait{display:flex;align-items:center;gap:.6rem;font-size:.82rem;color:var(--ink-soft)}.blocks{display:flex;gap:3px}.blocks i{width:7px;height:7px;background:var(--violet);display:block;animation:blink 1s steps(2) infinite}.blocks i:nth-child(2){animation-delay:.15s}.blocks i:nth-child(3){animation-delay:.3s}@keyframes blink{50%{opacity:.2}}@media(prefers-reduced-motion:reduce){.blocks i{animation:none}}.hint{font-size:.74rem;color:var(--ink-soft);margin:0}.hint b{color:var(--ink)}.error{color:var(--ask);font-size:.8rem;margin:0}
</style></head><body><div class="app"><header><span class="heart">♡</span> Calendar Desk</header>
<div class="card" id="c1"><span class="lbl">What's happening?</span><textarea id="msg" spellcheck="false" placeholder="Dinner with Mom tomorrow at 6 PM for 90 minutes"></textarea><div class="drop" aria-disabled="true">Photos coming soon</div><button id="go">Review dates</button><p class="hint">We'll check with you before anything goes on the calendar.</p><p id="submit-error" class="error" hidden></p></div>
<div class="card" id="c2" hidden><div class="wait"><span class="blocks"><i></i><i></i><i></i></span><span id="wait-label">Reading your request…</span></div><p id="wait-detail" class="hint">Safe to leave — it's saved under <b>your requests</b>.</p><button id="restart" class="ghost" hidden>Start a new request</button></div>
</div>
<script>
(() => {
const ACTIVE='calendar-desk:active:v1', KEY='calendar-desk:key:v1';
let etag='', timer=0, softFails=0;
const MAX_SOFT_FAILS=4;
const $=id=>document.getElementById(id), c1=$('c1'), c2=$('c2'), msg=$('msg'), go=$('go'), error=$('submit-error');

function storageGet(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}}
function storageSet(k,v){localStorage.setItem(k,JSON.stringify(v))}
function clearActive(){localStorage.removeItem(ACTIVE);clearTimeout(timer);etag='';softFails=0}

function collapse(el,text){el.classList.add('done');el.innerHTML='<span class="tick">&#10003;</span><span>'+text+'</span>'}
function showWait(head,detail,restart){c2.hidden=false;$('wait-label').textContent=head;$('wait-detail').textContent=detail||'Safe to leave — it is saved under your requests.';$('restart').hidden=!restart}

/* Terminal: this request will never resolve. Stop polling, forget it, tell the truth. */
function terminal(head,detail){clearActive();collapse(c1,'Request sent');showWait(head,detail,true)}

/* No stored request, or a dead one: return to a clean compose screen with no ghost cards. */
function resetToCompose(notice){
  clearActive();
  c2.hidden=true;
  if(notice){error.textContent=notice;error.hidden=false}
}

function newRequest(){clearActive();location.reload()}
$('restart').onclick=newRequest;

function idempotency(text){let saved=storageGet(KEY);if(!saved||saved.text!==text){saved={text,key:crypto.randomUUID().replaceAll('-','')};storageSet(KEY,saved)}return saved.key}
msg.addEventListener('input',()=>{const saved=storageGet(KEY);if(saved&&saved.text!==msg.value)localStorage.removeItem(KEY)});

async function submit(){
  const text=msg.value.trim();
  error.hidden=true;
  if(!text){error.textContent='Add event details before reviewing dates.';error.hidden=false;return}
  go.disabled=true;go.textContent='Sending…';
  const f=new FormData();
  f.append('kind','create');f.append('text',text);f.append('idempotencyKey',idempotency(text));
  try{
    const r=await fetch('/api/jobs',{method:'POST',body:f});
    const b=await r.json().catch(()=>null);
    if(!r.ok||!b?.ok)throw new Error(b?.message||b?.code||'The request could not be sent.');
    if(!b.submissionId||!b.receipt)throw new Error('The request was received, but its private receipt was missing. Please try again.');
    storageSet(ACTIVE,{id:b.submissionId,receipt:b.receipt});
    etag='';softFails=0;
    collapse(c1,'Request sent');
    showWait('Reading your request…');
    poll();
  }catch(e){
    error.textContent=e.message||'The request could not be sent. Please try again.';
    error.hidden=false;go.disabled=false;go.textContent='Review dates';
  }
}

function next(delay,cap){const d=Math.min(delay,cap);timer=setTimeout(()=>poll(d),d)}

async function poll(delay=1200){
  const active=storageGet(ACTIVE);
  if(!active)return;
  let r;
  try{
    /* Receipt travels as a header, never in the URL: query strings land in
       server logs, browser history and referrer headers. */
    const headers={Authorization:'Receipt '+active.receipt};
    if(etag)headers['If-None-Match']=etag;
    r=await fetch('/api/v2/submissions/'+encodeURIComponent(active.id),{headers});
  }catch(e){
    /* Network-level failure only. Genuinely transient, so retry — but not forever. */
    if(++softFails>MAX_SOFT_FAILS){
      terminal('We lost contact with the desk','We could not reach Calendar Desk after several tries. Your request may still be running. Reload this page to check again.');
      return;
    }
    showWait('Trying to reach the desk…','Connection problem. Retrying…',false);
    next(delay*1.8,15000);
    return;
  }

  /* The request is gone, expired, or not ours. This is terminal — never retry it. */
  if(r.status===404||r.status===401||r.status===403){
    const stale=!c2.hidden;
    clearActive();
    if(stale){
      terminal('That request is no longer available','It may have expired, or it was made before a recent update. Nothing was changed. Start a new request below.');
      c2.hidden=false;
    }else{
      resetToCompose('An earlier request could not be found, so it was cleared. Nothing was changed.');
    }
    return;
  }

  if(r.status===304){next(delay*1.5,10000);return}

  const b=await r.json().catch(()=>null);

  if(!r.ok||!b?.ok){
    if(++softFails>MAX_SOFT_FAILS){
      terminal('We could not check this request','Something went wrong on our side and we stopped retrying. Nothing was changed. Start a new request.');
      return;
    }
    showWait('Still checking…','We had trouble reading the status. Trying again…',false);
    next(delay*1.8,15000);
    return;
  }

  softFails=0;
  etag=r.headers.get('etag')||'';

  if(b.state==='received'||b.state==='processing'){
    collapse(c1,'Request sent');
    showWait('Reading your request…','Safe to leave — it is saved under your requests.',false);
    next(delay*1.5,10000);
    return;
  }
  if(b.state==='needs_attention'){terminal('One detail is needed',b.message);return}
  if(b.state==='completed'){terminal('Calendar updated',b.message||'Your calendar request was completed.');return}
  terminal(b.headline||'Request could not be completed',b.message||'Nothing was changed. Start a new request with clearer details.');
}

go.onclick=submit;

/* On load: do NOT render the waiting card yet. A stale receipt from a previous
   visit must not paint a "reviewing your request" box before anything is submitted.
   Poll first; the card appears only once the server confirms work is genuinely in flight. */
const active=storageGet(ACTIVE);
if(active?.id&&active?.receipt){poll()}
})();
</script></body></html>`;
