const BASES = [
  "https://cdn.jsdelivr.net/gh/perfectfinmart/pf-recovery-live@main",
  "https://raw.githubusercontent.com/perfectfinmart/pf-recovery-live/main",
  ""
];
const ORDER = ["m0_1","m1_2","m2_3","m3_6","m6p"];
const LABELS = { m0_1:"1 EMI overdue", m1_2:"1–2 months", m2_3:"2–3 months", m3_6:"3–6 months", m6p:">6 months" };
const SHORT = { m0_1:"1 EMI", m1_2:"1–2 m", m2_3:"2–3 m", m3_6:"3–6 m", m6p:">6 m" };
const HINTS = { m0_1:"one EMI pending", m1_2:"31–60 days", m2_3:"61–90 days", m3_6:"91–180 days", m6p:"181+ days" };
const FLOOR = { m0_1:1, m1_2:31, m2_3:61, m3_6:91, m6p:181 };
const int = new Intl.NumberFormat("en-IN");
const inr = new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});

const RBI = { m0_1:"SMA-0", m1_2:"SMA-1", m2_3:"SMA-2", m3_6:"NPA", m6p:"NPA" };
const AIM = { m0_1:"≥85% a month", m1_2:"≥50% a month", m2_3:"≥30% a month", m3_6:"≥20% a month", m6p:"≥10% a month" };
function pf(n){ if(!isFinite(n)) return "—"; return (n<-0.05?"−":"")+Math.abs(n).toFixed(1)+"%"; }
function bookPos(lap){
  if (lap && lap.pos > 0) return lap.pos;
  const a = ((META && META.book && META.book.assets) || []).find(x => x.asset === "LAP");
  return a && a.pos ? a.pos : 0;
}
function ratesHtml(b, a, lap){
  const defC = lap.cases ? (b.cases / lap.cases) * 100 : 0;
  const pos = bookPos(lap);
  const defA = pos ? (b.overdue / pos) * 100 : 0;
  const par = pos && b.pos ? (b.pos / pos) * 100 : 0;
  const rec = a && a.overdue ? ((a.overdue - b.overdue) / a.overdue) * 100 : 0;
  return '<p class="hint">Default '+pf(defC)+' of book · '+int.format(b.cases)+' / '+int.format(lap.cases)+' files · '+(RBI[b.id]||'')+'</p>'
    +'<p class="hint">Overdue '+pf(defA)+' of POS'+(par?' · PAR '+pf(par):'')+'</p>'
    +'<p class="hint '+(rec>=0?'ok':'bad')+'">Recovery '+pf(rec)+' vs 16 Sep · aim '+(AIM[b.id]||'')+'</p>';
}

function cr(n){ const a=Math.abs(n); if(a>=1e7) return (n<0?"−":"")+"₹"+(a/1e7).toFixed(2)+" Cr"; if(a>=1e5) return (n<0?"−":"")+"₹"+(a/1e5).toFixed(2)+" L"; return inr.format(Math.round(n)); }
function isoDays(from,to){
  const a=Date.parse(from+"T00:00:00+05:30"), b=Date.parse(to+"T00:00:00+05:30");
  if(!isFinite(a)||!isFinite(b)||b<a) return 1;
  return Math.max(1, Math.round((b-a)/86400000)+1);
}
function dwellMark(caseNo, bucket, lateBy){
  const asOf = (META && META.asOf) || "";
  const floor = FLOOR[bucket] || 1;
  const fromDpd = Math.max(1, (Number(lateBy)||0) - floor + 1);
  const daysList = ((HIST && HIST.days) || []).filter(d => d.asOf && (!asOf || d.asOf <= asOf)).sort((a,b)=>b.asOf.localeCompare(a.asOf));
  let firstSame = asOf, saw=false;
  for (const d of daysList){
    if (d.asOf === asOf) continue;
    const row = (d.od||[]).find(x => x[0]===caseNo);
    if (!row || !row[7]) continue;
    if (row[7] !== bucket){ saw=true; break; }
    firstSame = d.asOf;
  }
  const days = saw && asOf ? Math.min(fromDpd, isoDays(firstSame, asOf)) : fromDpd;
  const just = saw && days<=2;
  return '<span class="dwell">• '+days+'d in this desk'+(just?' · just in':'')+'</span>';
}
function nm(r){ return dwellMark(r[0], r[7], r[2])+' '+(r[1]||'—'); }
function nmCase(caseNo, name, bucket, lateBy){
  if (!bucket) {
    const r = ROWS.find(x => x[0]===caseNo);
    if (r) { bucket=r[7]; lateBy=r[2]; }
  }
  if (!bucket) return name||'—';
  return dwellMark(caseNo, bucket, lateBy)+' '+(name||'—');
}
function fd(v){ if(!v) return "—"; const [y,m,d]=v.split("-"); return d+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(m)-1]+" "+y; }
function cls(n){ return n<-0.5?"ok":n>0.5?"bad":""; }
function sd(v){ if(!v) return "—"; const [y,m,d]=v.split("-"); return Number(d)+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(m)-1]; }
function laterCopy(later, earlier, money, laterL, earlierL){
  const d = later - earlier;
  if(Math.abs(d)<0.5) return laterL+" same as "+earlierL;
  const body = money ? cr(Math.abs(d)) : int.format(Math.abs(d));
  const more = d>0 ? "more" : "less";
  const word = d<0 ? "Improved" : "Worsened";
  return laterL+": "+body+" "+more+" than "+earlierL+". "+word+".";
}
function result(d, money){
  if(Math.abs(d)<0.5) return "Same";
  const body = money ? cr(Math.abs(d)) : int.format(Math.abs(d));
  const more = d>0 ? "more" : "less";
  const word = d<0 ? "Improved" : "Worsened";
  return body+" "+more+". "+word+".";
}
function boardBanner(lap, vs){
  const dumpAsOf = META.asOf;
  const startAsOf = "2026-09-16";
  const dumpLater = dumpAsOf >= startAsOf;
  const laterL = sd(dumpLater ? dumpAsOf : startAsOf);
  const earlierL = sd(dumpLater ? startAsOf : dumpAsOf);
  const later = dumpLater ? lap : vs;
  const earlier = dumpLater ? vs : lap;
  const same = dumpAsOf === startAsOf;
  const odDelta = later.overdue - earlier.overdue;
  const caseDelta = later.odCases - earlier.odCases;
  const npaDelta = later.npa91 - earlier.npa91;
  const worse = [];
  const better = [];
  ORDER.forEach(id => {
    const l = later.buckets.find(x=>x.id===id) || {cases:0,overdue:0};
    const e = earlier.buckets.find(x=>x.id===id) || {cases:0,overdue:0};
    if (l.cases-e.cases>0 || l.overdue-e.overdue>0.5) worse.push(SHORT[id]);
    else if (l.cases-e.cases<0 || l.overdue-e.overdue<-0.5) better.push(SHORT[id]);
  });
  const worseList = worse.join(", ") || "none";
  const betterList = better.join(", ") || "none";
  let title, why, tone;
  if(same){
    title = laterL+" is the start day.";
    why = "The next mail will be judged against this day. We always talk about the later date.";
    tone = "";
  } else if(odDelta < -0.5 && caseDelta <= 0){
    title = laterL+" improved vs "+earlierL+".";
    why = "We always judge the later day. Buckets that worsened: "+worseList+". Buckets that improved: "+betterList+".";
    tone = "ok";
  } else if(odDelta > 0.5 && caseDelta >= 0){
    title = laterL+" worsened vs "+earlierL+".";
    why = "We always judge the later day. Buckets that worsened: "+worseList+". Buckets that improved: "+betterList+".";
    tone = "bad";
  } else {
    title = laterL+" is mixed vs "+earlierL+".";
    why = "We always judge the later day. Buckets that worsened: "+worseList+". Buckets that improved: "+betterList+".";
    tone = "";
  }
  const pills = same ? "" : (
    worse.map(x=>'<span class="chip bad" style="display:inline-block;width:auto;margin:.15rem .25rem 0 0">'+x+' worsened</span>').join("")
    + better.map(x=>'<span class="chip ok" style="display:inline-block;width:auto;margin:.15rem .25rem 0 0">'+x+' improved</span>').join("")
  );
  return '<div class="banner '+tone+'"><p class="kicker2">Later day vs earlier day</p><p class="title">'+title+'</p><p class="hint">'+why+'</p><div style="margin-top:.4rem">'+pills+'</div>'
    +'<table class="compare"><thead><tr><th>What</th><th>Earlier · '+earlierL+'</th><th>Later · '+laterL+'</th><th>'+laterL+' result</th></tr></thead><tbody>'
    +'<tr><td>Cases not paid</td><td class="mono">'+int.format(earlier.odCases)+'</td><td class="mono">'+int.format(later.odCases)+'</td><td class="'+cls(caseDelta)+'">'+laterCopy(later.odCases,earlier.odCases,false,laterL,earlierL)+'</td></tr>'
    +'<tr><td>Money not paid</td><td class="mono">'+cr(earlier.overdue)+'</td><td class="mono">'+cr(later.overdue)+'</td><td class="'+cls(odDelta)+'">'+laterCopy(later.overdue,earlier.overdue,true,laterL,earlierL)+'</td></tr>'
    +'<tr><td>Cases late 91 days+</td><td class="mono">'+int.format(earlier.npa91)+'</td><td class="mono">'+int.format(later.npa91)+'</td><td class="'+cls(npaDelta)+'">'+laterCopy(later.npa91,earlier.npa91,false,laterL,earlierL)+'</td></tr>'
    +'</tbody></table><p class="legend">Example: 11 Sep vs 16 Sep → we say if 16 Sep improved or worsened. 19 Sep vs 16 Sep → we say if 19 Sep improved or worsened.</p></div>';
}
let META=null, ROWS=[], FLOW={}, HIST=null;
function band(){ const h=(location.hash||"").replace(/^#\/?/,""); const m=h.match(/^sheet\/(m0_1|m1_2|m2_3|m3_6|m6p)$/); return m?m[1]:""; }
function go(id){
  const hash = id ? "#/sheet/"+id : "#";
  try { history.replaceState(null, "", location.pathname + location.search + hash); }
  catch (e) { try { location.hash = hash; } catch (e2) {} }
  render();
}
function closeFlow(){ document.getElementById("flow-modal").hidden = true; }
function showFlow(id, kind){
  const pack = liveFlow()[id] || {added:[], reduced:[]};
  const list = pack[kind] || [];
  document.getElementById("flow-sub").textContent = kind === "reduced" ? "Green list — cases reduced vs 16 Sep" : "Red list — cases added vs 16 Sep";
  document.getElementById("flow-title").textContent = kind === "reduced" ? "These files left this band" : "These files came into this band";
  const rows = list.length
    ? list.map(r=>'<tr><td class="mono">'+r[0]+'</td><td>'+nmCase(r[0], r[1], r[7], r[2])+'</td><td class="r mono">'+int.format(r[2])+'</td><td class="r mono">'+cr(r[3])+'</td><td>'+(r[4]||'')+'</td></tr>').join('')
    : '<tr><td colspan="5" style="padding:2rem;text-align:center">No file list for this alert.</td></tr>';
  document.getElementById("flow-body").innerHTML = '<div class="hint" style="padding:.6rem 1rem">'+int.format(list.length)+' files. File / case no. is the key.</div><div class="scroll" style="margin:0"><table><thead><tr><th>File / case no.</th><th>Name</th><th class="r">Days</th><th class="r">Pending</th><th>Why</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  document.getElementById("flow-modal").hidden = false;
}
function kpi(label,value,hint,delta){
  return '<div class="card" style="cursor:default"><div class="label">'+label+'</div><div class="num">'+value+'</div><div class="hint">'+hint+'</div>'+(delta?'<div class="hint '+cls(delta.n)+'">'+delta.t+'</div>':'')+'</div>';
}
function liveFlow(){
  if (FLOW && FLOW.oriented) return FLOW;
  if (!META || META.asOf >= "2026-09-16") return FLOW;
  const out = {};
  ORDER.forEach(id => {
    const f = FLOW[id] || {added:[], reduced:[]};
    out[id] = { added: f.reduced || [], reduced: f.added || [] };
  });
  return out;
}
function chips(id,dc,da){
  const f = liveFlow()[id] || {added:[], reduced:[]};
  const out=[];
  if(f.reduced && f.reduced.length){
    out.push('<button type="button" class="chip ok" onclick="event.stopPropagation();showFlow(\''+id+'\',\'reduced\')">'+int.format(f.reduced.length)+' cases reduced. Click to see the files.</button>');
  } else if(dc<0){
    out.push('<span class="chip ok">'+int.format(Math.abs(dc))+' cases less. Good.</span>');
  }
  if(f.added && f.added.length){
    out.push('<button type="button" class="chip bad" onclick="event.stopPropagation();showFlow(\''+id+'\',\'added\')">'+int.format(f.added.length)+' cases added. Click to see the files.</button>');
  } else if(dc>0){
    out.push('<span class="chip bad">'+int.format(dc)+' cases more. Bad.</span>');
  }
  if(!out.length) out.push('<span class="chip" style="color:var(--subtle)">Same as 16 Sep</span>');
  return out.join('');
}
function nav(cur){
  return '<nav class="nav"><button type="button" class="'+(!cur?'on':'')+'" onclick="go(\'\')">Summary</button>'+ORDER.map(id=>'<button type="button" class="'+(cur===id?'on':'')+'" onclick="go(\''+id+'\')">'+SHORT[id]+'</button>').join('')+'</nav>';
}
function render(){
  if(!META) return;
  const lap=META.lap, vs=META.vs16Sep, cur=band();
  document.getElementById('sub').textContent = 'This mail '+fd(META.asOf)+' · we only compare with 16 Sep start';
  const odDelta=lap.overdue-vs.overdue, caseDelta=lap.odCases-vs.odCases;
  if(!cur){
    document.getElementById('app').innerHTML =
      boardBanner(lap, vs)
      +nav('')+
      '<div class="kpis">'
        +kpi('LAP files', int.format(lap.cases), int.format(lap.current)+' paying on time', {n:lap.cases-vs.cases,t:result(lap.cases-vs.cases,false)})
        +kpi('Pending EMI', cr(lap.overdue), int.format(lap.odCases)+' cases not paid', {n:odDelta,t:result(odDelta,true)})
        +kpi('Late 91 days+', cr(lap.npa91Overdue), int.format(lap.npa91)+' cases', {n:lap.npa91Overdue-vs.npa91Overdue,t:result(lap.npa91Overdue-vs.npa91Overdue,true)})
        +kpi('Paying on time', int.format(lap.current), 'current accounts', {n:-(lap.current-vs.current),t:(lap.current-vs.current)>0.5 ? int.format(lap.current-vs.current)+' more. Good.' : (lap.current-vs.current)<-0.5 ? int.format(Math.abs(lap.current-vs.current))+' less. Bad.' : 'Same as 16 Sep'})
      +'</div><div class="bands">'+ORDER.map(id=>{
        const b=lap.buckets.find(x=>x.id===id); const a=vs.buckets.find(x=>x.id===id)||{cases:0,overdue:0};
        const dc=b.cases-a.cases, da=b.overdue-a.overdue;
        return '<article class="card">'+chips(id,dc,da)+
          '<button type="button" onclick="go(\''+id+'\')" style="display:block;width:100%;border:0;background:transparent;text-align:left;padding:0;color:inherit">'
          +'<p style="font-family:Fraunces,Georgia,serif;font-size:1.05rem;margin:.35rem 0 0">'+LABELS[id]+'</p><p class="hint">'+HINTS[id]+'</p>'
          +'<p class="num">'+int.format(b.cases)+'</p><p class="hint">cases in this mail</p>'
          +'<p class="mono" style="margin-top:.5rem">'+cr(b.overdue)+'</p>'
          +ratesHtml(b,a,lap)
          +'<p class="hint">16 Sep start '+int.format(a.cases)+' · '+cr(a.overdue)+'</p>'
          +'<p class="hint '+ (cls(da)||cls(dc)) +'">'+result(dc,false)+' '+result(da,true)+'</p>'
          +'<p class="hint" style="color:var(--teal);margin-top:.4rem">Open full list →</p></button></article>';
      }).join('')+'</div><footer>Click a bucket to open that person’s list.</footer>';
    return;
  }
  const b=lap.buckets.find(x=>x.id===cur); const a=vs.buckets.find(x=>x.id===cur)||{cases:0,overdue:0};
  const dc=b.cases-a.cases, da=b.overdue-a.overdue;
  const list=ROWS.filter(r=>r[7]===cur).sort((x,y)=>y[3]-x[3]);
  const body = list.length ? list.map(r=>'<tr><td class="mono">'+r[0]+'</td><td>'+nm(r)+'</td><td class="r mono">'+int.format(r[2])+'</td><td class="r mono">'+cr(r[3])+'</td><td class="mono">'+(r[5]||'—')+'</td><td class="mono">'+(r[8]||'—')+'</td></tr>').join('') : '<tr><td colspan="6" style="padding:2rem;text-align:center;color:var(--muted)">No files in this bucket on this mail.</td></tr>';
  document.getElementById('app').innerHTML = nav(cur)+
    '<div class="banner '+(dc<0||da<0?'ok':'bad')+'" style="margin-top:1rem"><strong>'+LABELS[cur]+'</strong><div class="hint">This mail '+int.format(b.cases)+' cases / '+cr(b.overdue)+'. 16 Sep start '+int.format(a.cases)+' cases / '+cr(a.overdue)+'.</div><div style="margin-top:.4rem">'+chips(cur,dc,da)+'</div></div>'
    +'<div class="kpis">'+kpi('Cases this mail', int.format(b.cases), 'this bucket', {n:dc,t:result(dc,false)})+kpi('Pending this mail', cr(b.overdue), LABELS[cur], {n:da,t:result(da,true)})+kpi('Default rate', (function(){ const defC = lap.cases ? (b.cases/lap.cases)*100 : 0; return pf(defC); })(), int.format(b.cases)+' / '+int.format(lap.cases)+' LAP files')+kpi('Recovery vs 16 Sep', (function(){ const rec = a.overdue ? ((a.overdue-b.overdue)/a.overdue)*100 : 0; return pf(rec); })(), 'overdue down ÷ 16 Sep overdue of this desk · '+(RBI[cur]||''), {n: (a.overdue-b.overdue)*-1, t: AIM[cur]})+'</div>'
    +'<div class="scroll"><table><thead><tr><th>File / case no.</th><th>Name</th><th class="r">Days</th><th class="r">Pending</th><th>Last paid</th><th>Mobile</th></tr></thead><tbody>'+body+'</tbody></table></div>';
}
async function j(path){
  for (const base of BASES) {
    try {
      const url = (base ? base+'/' : '') + path + '?t=' + Date.now();
      const r = await fetch(url, { cache: 'no-store' });
      if (r.ok) {
        const ct = r.headers.get('content-type') || '';
        if (ct.includes('text/html')) continue;
        return r.json();
      }
    } catch (e) {}
  }
  return null;
}
async function load(){
  META = await j('live-meta.json');
  HIST = await j('live-history.json') || HIST;
  const packs = await Promise.all(['live-m0_1.json','live-m0_1a.json','live-m0_1b.json','live-m1_2.json','live-m2_3.json','live-m3_6.json','live-m6p.json'].map(j));
  const merged = packs.flatMap(x => Array.isArray(x) ? x : []);
  if (merged.length) ROWS = merged;
  const flow = await j('live-flow.json');
  if (flow && flow.m1_2) FLOW = flow;
  else {
    const fp = await Promise.all(ORDER.map(id => j('live-flow-'+id+'.json')));
    const next = {};
    ORDER.forEach((id,i) => { if (fp[i] && (fp[i].added || fp[i].reduced)) next[id] = fp[i]; });
    if (Object.keys(next).length) FLOW = next;
  }
  if(META) render(); else document.getElementById('sub').textContent='Live feed not reached';
}
window.go=go;
window.showFlow=showFlow;
window.closeFlow=closeFlow;
window.addEventListener('hashchange', render);
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeFlow(); });
load();
setInterval(load, 120000);