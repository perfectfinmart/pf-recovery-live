const BASES = [
  "",
  "https://cdn.jsdelivr.net/gh/perfectfinmart/pf-recovery-live@main",
  "https://raw.githubusercontent.com/perfectfinmart/pf-recovery-live/main"
];
const ORDER = ["m0_1","m1_2","m2_3","m3_6","m6p"];
const LABELS = { m0_1:"1 EMI overdue", m1_2:"1–2 months", m2_3:"2–3 months", m3_6:"3–6 months", m6p:">6 months" };
const SHORT = { m0_1:"1 EMI", m1_2:"1–2 m", m2_3:"2–3 m", m3_6:"3–6 m", m6p:">6 m" };
const HINTS = { m0_1:"one EMI pending", m1_2:"31–60 days", m2_3:"61–90 days", m3_6:"91–180 days", m6p:"181+ days" };
const FLOOR = { m0_1:1, m1_2:31, m2_3:61, m3_6:91, m6p:181 };
const SHEET = {
  m0_1:{open:"https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fperfectfinmart%2Fpf-recovery-live%40main%2FPF-Person-1-m0_1.xlsx",xlsx:"https://raw.githubusercontent.com/perfectfinmart/pf-recovery-live/main/PF-Person-1-m0_1.xlsx",pdf:"https://cdn.jsdelivr.net/gh/perfectfinmart/pf-recovery-live@main/PF-Person-1-m0_1.xlsx"},
  m1_2:{open:"https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fperfectfinmart%2Fpf-recovery-live%40main%2FPF-Person-2-m1_2.xlsx",xlsx:"https://raw.githubusercontent.com/perfectfinmart/pf-recovery-live/main/PF-Person-2-m1_2.xlsx",pdf:"https://cdn.jsdelivr.net/gh/perfectfinmart/pf-recovery-live@main/PF-Person-2-m1_2.xlsx"},
  m2_3:{open:"https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fperfectfinmart%2Fpf-recovery-live%40main%2FPF-Person-3-m2_3.xlsx",xlsx:"https://raw.githubusercontent.com/perfectfinmart/pf-recovery-live/main/PF-Person-3-m2_3.xlsx",pdf:"https://cdn.jsdelivr.net/gh/perfectfinmart/pf-recovery-live@main/PF-Person-3-m2_3.xlsx"},
  m3_6:{open:"https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fperfectfinmart%2Fpf-recovery-live%40main%2FPF-Person-4-m3_6.xlsx",xlsx:"https://raw.githubusercontent.com/perfectfinmart/pf-recovery-live/main/PF-Person-4-m3_6.xlsx",pdf:"https://cdn.jsdelivr.net/gh/perfectfinmart/pf-recovery-live@main/PF-Person-4-m3_6.xlsx"},
  m6p:{open:"https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fperfectfinmart%2Fpf-recovery-live%40main%2FPF-Person-5-m6p.xlsx",xlsx:"https://raw.githubusercontent.com/perfectfinmart/pf-recovery-live/main/PF-Person-5-m6p.xlsx",pdf:"https://cdn.jsdelivr.net/gh/perfectfinmart/pf-recovery-live@main/PF-Person-5-m6p.xlsx"}
};
function sheetBar(id){
  const s=SHEET[id], p=id==="m0_1"?1:id==="m1_2"?2:id==="m2_3"?3:id==="m3_6"?4:5;
  return '<a href="'+s.open+'" target="_blank" rel="noreferrer" class="chip" style="background:var(--ink);color:var(--paper);margin-bottom:.5rem;text-align:center">Google Sheet · Person '+p+'</a>';
}
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
  return '<span class="dwell'+(just?' new':'')+'" title="'+days+' day'+(days===1?'':'s')+' on this desk. Counter restarts the day this file changes bucket.">• '+days+'d</span>';
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
    +'</tbody></table><p class="legend">We always judge the later day against 16 Sep (the start line). Green = improved. Red = worsened.</p></div>';
}
let META=null, ROWS=[], FLOW={}, HUDDLE=null, HIST=null, PICK={later:"", earlier:"2026-09-16"};
function band(){
  const h=(location.hash||"").replace(/^#\/?/,"");
  if(PAGES.includes(h)) return h;
  const m=h.match(/^(?:sheet\/)?(m0_1|m1_2|m2_3|m3_6|m6p)$/);
  return m?m[1]:"";
}
function go(id){
  const hash = !id ? "#" : PAGES.includes(id) ? "#/"+id : "#/sheet/"+id;
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
const PAGES = ["huddle","people","early","nach","geo","dates","npa","call","disb"];
const TABS = [
  ["","Home"],["huddle","Meet"],["people","People"],["early","1st"],["nach","ECS"],
  ["geo","Map"],["dates","Dates"],["npa","91+"],["call","Call"],["disb","New"]
];
function nav(cur){
  const btn = (id, label) => '<button type="button" class="'+(cur===id?'on':'')+'" onclick="go(\''+id+'\')">'+label+'</button>';
  return '<nav class="nav">'+TABS.map(t=>btn(t[0], t[1])).join('')+'</nav>';
}
function histDays(){
  const list = ((HIST && HIST.days) || []).map(d => ({asOf:d.asOf, lap:d.lap, od:d.od||[]}));
  if (META && META.asOf && !list.some(d => d.asOf === META.asOf)) list.push({asOf: META.asOf, lap: META.lap, od:[]});
  list.sort((a,b)=>a.asOf.localeCompare(b.asOf));
  return list;
}
function snapDay(iso){
  const days = histDays();
  const hit = days.filter(d => d.asOf <= iso).pop();
  return hit || days[days.length-1] || days[0];
}
function addIso(iso, n){
  const d = new Date(iso+"T00:00:00+05:30");
  d.setDate(d.getDate()+n);
  return d.toISOString().slice(0,10);
}
function monthIso(iso){
  const d = new Date(iso+"T00:00:00+05:30");
  d.setMonth(d.getMonth()-1);
  return d.toISOString().slice(0,10);
}
function pickLater(iso){
  const hit = snapDay(iso);
  if (hit) PICK.later = hit.asOf;
  render();
}
function pickEarlier(iso){
  const hit = snapDay(iso);
  if (hit) PICK.earlier = hit.asOf;
  if (PICK.earlier === (PICK.later || (META && META.asOf))) {
    const days = histDays().filter(d => d.asOf < PICK.later);
    if (days.length) PICK.earlier = days[days.length-1].asOf;
  }
  render();
}
function pickWeek(){ if (META) pickEarlier(addIso(META.asOf, -7)); }
function pickMonth(){ if (META) pickEarlier(monthIso(META.asOf)); }
function pickStart(){ PICK.earlier = "2026-09-16"; render(); }
function pickTodayYest(){
  const days = histDays();
  if (!days.length) return;
  const later = days[days.length-1];
  const yest = days.filter(d => d.asOf < later.asOf).pop();
  PICK.later = later.asOf;
  if (yest) PICK.earlier = yest.asOf;
  render();
}
let DATEFLOW = {};
function filesFromOd(od){
  const map = new Map();
  (od||[]).forEach(r => { if (r && r[0]) map.set(String(r[0]), r); });
  return map;
}
function flowFromDays(laterDay, earlierDay){
  const L = filesFromOd(laterDay && laterDay.od);
  const E = filesFromOd(earlierDay && earlierDay.od);
  const rank = {}; ORDER.forEach((id,i)=>rank[id]=i);
  const out = {};
  ORDER.forEach(id => out[id] = {added:[], reduced:[], leave:[], enter:[], up:[], down:[]});
  const keys = new Set([...L.keys(), ...E.keys()]);
  keys.forEach(k => {
    const n = L.get(k), p = E.get(k);
    const nb = n ? n[7] : null, pb = p ? p[7] : null;
    if (p && !n && out[pb]) {
      const row = [p[0], p[1], p[2], p[3], 'Left unpaid book (paid / current)', 'leave'];
      out[pb].reduced.push(row); out[pb].leave.push(row);
    } else if (!p && n && out[nb]) {
      const row = [n[0], n[1], n[2], n[3], 'New unpaid', 'enter'];
      out[nb].added.push(row); out[nb].enter.push(row);
    } else if (p && n && pb !== nb) {
      const aged = (rank[nb]||0) > (rank[pb]||0);
      if (out[pb]) {
        const row = [p[0], p[1], n[2], p[3], aged ? ('Aged out to '+SHORT[nb]+' ('+p[2]+'d → '+n[2]+'d)') : ('Came down to '+SHORT[nb]+' ('+p[2]+'d → '+n[2]+'d)'), 'leave'];
        out[pb].reduced.push(row); out[pb].leave.push(row);
      }
      if (out[nb]) {
        const row = [n[0], n[1], n[2], n[3], aged ? ('Aged in from '+SHORT[pb]+' ('+p[2]+'d → '+n[2]+'d)') : ('Came down from '+SHORT[pb]+' ('+p[2]+'d → '+n[2]+'d)'), 'enter'];
        out[nb].added.push(row); out[nb].enter.push(row);
      }
    } else if (p && n && pb === nb && out[nb]) {
      const d = (Number(n[3])||0) - (Number(p[3])||0);
      if (d > 0.5) {
        const row = [n[0], n[1], n[2], n[3], 'Same desk · overdue up '+cr(d)+' ('+p[2]+'d → '+n[2]+'d)', 'up'];
        out[nb].added.push(row); out[nb].up.push(row);
      } else if (d < -0.5) {
        const row = [n[0], n[1], n[2], n[3], 'Same desk · overdue down '+cr(-d)+' ('+p[2]+'d → '+n[2]+'d)', 'down'];
        out[nb].reduced.push(row); out[nb].down.push(row);
      }
    }
  });
  return out;
}
function showDateFlow(id, kind){
  const pack = DATEFLOW[id] || {added:[], reduced:[], leave:[], enter:[], up:[], down:[]};
  const list = pack[kind] || [];
  const titles = {
    reduced: ['Green — reduced', 'Left the desk or overdue came down'],
    added: ['Red — added', 'Came into the desk or overdue went up'],
    leave: ['Left this desk', 'Paid, current, or moved to another desk'],
    enter: ['Came into this desk', 'New unpaid, aged in, or came down from another desk'],
    down: ['Overdue came down', 'Same desk · amount decreased'],
    up: ['Overdue went up', 'Same desk · amount increased']
  };
  const t = titles[kind] || ['Files', ''];
  document.getElementById("flow-title").textContent = t[0];
  document.getElementById("flow-sub").textContent = t[1];
  const rows = list.length
    ? list.map(r=>'<tr><td class="mono">'+r[0]+'</td><td>'+nmCase(r[0], r[1], r[7], r[2])+'</td><td class="r mono">'+int.format(r[2])+'</td><td class="r mono">'+cr(r[3])+'</td><td>'+(r[4]||'')+'</td></tr>').join('')
    : '<tr><td colspan="5" style="padding:2rem;text-align:center">No file list for this alert.</td></tr>';
  document.getElementById("flow-body").innerHTML = '<div class="hint" style="padding:.6rem 1rem">'+int.format(list.length)+' files. File / case no. is the key.</div><div class="scroll" style="margin:0"><table><thead><tr><th>File / case no.</th><th>Name</th><th class="r">Days</th><th class="r">Pending</th><th>Why</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  document.getElementById("flow-modal").hidden = false;
}
function dateFileBlock(id, kind, title, hint, tone){
  const list = (DATEFLOW[id] && DATEFLOW[id][kind]) || [];
  const head = '<div class="card" style="padding:0;overflow:hidden;border:1px solid '+(tone==='ok'?'#cfe3d6':'#ead3d3')+'"><div style="padding:.65rem .85rem;border-bottom:1px solid var(--line)"><button type="button" class="chip '+(tone==='ok'?'ok':'bad')+'" style="width:auto" onclick="showDateFlow(\''+id+'\',\''+kind+'\')">'+title+' · '+int.format(list.length)+'</button><p class="hint" style="margin:.25rem 0 0">'+hint+'</p></div>';
  const body = list.slice(0,6).map((r,i)=>'<div style="padding:.5rem .85rem;border-top:1px solid var(--line)"><p class="mono" style="font-size:12px">'+(i+1)+'. '+r[0]+' · '+cr(r[3])+'</p><p class="hint">'+nmCase(r[0], r[1], r[7], r[2])+'</p><p class="hint">'+r[2]+'d · '+(r[4]||'')+'</p></div>').join('')
    || '<p class="hint" style="padding:.75rem .85rem">None</p>';
  const more = list.length>6 ? '<button type="button" class="chip" style="width:auto;margin:.5rem .85rem" onclick="showDateFlow(\''+id+'\',\''+kind+'\')">Show all '+int.format(list.length)+'</button>' : '';
  return head+body+more+'</div>';
}
function dateMovement(laterL, earlierL, laterLap, earlierLap){
  return '<div style="margin-top:1rem"><p class="kicker2">Who came in, who left · '+laterL+' vs '+earlierL+'</p><p class="hint">Each desk: cases on '+laterL+' and on '+earlierL+'. Then file movement — left, came in, overdue down, overdue up.</p>'
    +ORDER.map(id => {
      const f = DATEFLOW[id] || {leave:[],enter:[],up:[],down:[]};
      const b=(laterLap.buckets||[]).find(x=>x.id===id)||{cases:0,overdue:0};
      const a=(earlierLap.buckets||[]).find(x=>x.id===id)||{cases:0,overdue:0};
      const dc=b.cases-a.cases;
      return '<div class="banner" style="margin-top:.85rem"><p class="kicker2">'+SHORT[id]+'</p><p class="title" style="font-size:1.15rem">'+LABELS[id]+'</p>'
        +'<div class="kpis" style="margin-top:.7rem">'
        +kpi(laterL, int.format(b.cases), cr(b.overdue)+' overdue', {n:dc, t: dc<0 ? int.format(Math.abs(dc))+' cases less' : dc>0 ? int.format(dc)+' cases more' : 'same'})
        +kpi(earlierL, int.format(a.cases), cr(a.overdue)+' overdue', null)
        +'</div>'
        +'<p class="hint '+(dc<0?'ok':dc>0?'bad':'')+'">'+laterL+': '+int.format(b.cases)+' cases. '+earlierL+': '+int.format(a.cases)+' cases. '+(dc<0?int.format(Math.abs(dc))+' less. Improved.':dc>0?int.format(dc)+' more. Worsened.':'Same.')+'</p>'
        +'<p class="hint">'+int.format((f.leave||[]).length)+' left · '+int.format((f.enter||[]).length)+' in · '+int.format((f.down||[]).length)+' overdue down · '+int.format((f.up||[]).length)+' overdue up</p>'
        +'<div class="bands" style="margin-top:.7rem">'
        +dateFileBlock(id,'leave','Left this desk','Paid, current, or moved to another desk','ok')
        +dateFileBlock(id,'down','Overdue came down','Same desk · amount decreased','ok')
        +dateFileBlock(id,'enter','Came into this desk','New unpaid, aged in, or came down from another desk','bad')
        +dateFileBlock(id,'up','Overdue went up','Same desk · amount increased','bad')
        +'</div></div>';
    }).join('')+'</div>';
}
function dateChips(id, dc){
  const f = DATEFLOW[id] || {added:[], reduced:[]};
  const out=[];
  if(f.reduced && f.reduced.length){
    out.push('<button type="button" class="chip ok" onclick="event.stopPropagation();showDateFlow(\''+id+'\',\'reduced\')">'+int.format(f.reduced.length)+' cases reduced. Click to see the files.</button>');
  } else if(dc<0){
    out.push('<span class="chip ok">'+int.format(Math.abs(dc))+' cases less. Good.</span>');
  }
  if(f.added && f.added.length){
    out.push('<button type="button" class="chip bad" onclick="event.stopPropagation();showDateFlow(\''+id+'\',\'added\')">'+int.format(f.added.length)+' cases added. Click to see the files.</button>');
  } else if(dc>0){
    out.push('<span class="chip bad">'+int.format(dc)+' cases more. Bad.</span>');
  }
  if(!out.length) out.push('<span class="chip" style="color:var(--subtle)">Same as earlier date</span>');
  return out.join('');
}
function datesPage(){
  const days = histDays();
  const laterAs = PICK.later || (META && META.asOf) || "";
  const earlierAs = PICK.earlier || "2026-09-16";
  const later = days.find(d => d.asOf === laterAs) || days[days.length-1];
  const earlier = days.find(d => d.asOf === earlierAs) || days[0];
  if (!later || !earlier) return '<p class="hint">No dumps in the week store yet.</p>';
  const L = later.lap, E = earlier.lap;
  const min = days[0].asOf, max = days[days.length-1].asOf;
  const chips = days.map(d => '<span class="chip" style="width:auto;display:inline-block;margin:.15rem .25rem 0 0'+(d.asOf===later.asOf||d.asOf===earlier.asOf?';background:var(--ink);color:var(--paper)':'')+'">'+fd(d.asOf)+' · '+int.format(d.lap.odCases)+'</span>').join('');
  const rows = ORDER.map(id => {
    const b = (L.buckets||[]).find(x=>x.id===id) || {cases:0,overdue:0};
    const a = (E.buckets||[]).find(x=>x.id===id) || {cases:0,overdue:0};
    return '<tr><td>'+LABELS[id]+'</td><td class="mono">'+int.format(a.cases)+' / '+cr(a.overdue)+'</td><td class="mono">'+int.format(b.cases)+' / '+cr(b.overdue)+'</td><td class="'+cls(b.cases-a.cases)+'">'+laterCopy(b.cases,a.cases,false,fd(later.asOf),fd(earlier.asOf))+'</td></tr>';
  }).join('');
  DATEFLOW = flowFromDays(later, earlier);
  const worse=[], better=[];
  ORDER.forEach(id => {
    const b=(L.buckets||[]).find(x=>x.id===id)||{cases:0,overdue:0};
    const a=(E.buckets||[]).find(x=>x.id===id)||{cases:0,overdue:0};
    if (b.cases-a.cases>0 || b.overdue-a.overdue>0) worse.push(SHORT[id]);
    else if (b.cases-a.cases<0 || b.overdue-a.overdue<0) better.push(SHORT[id]);
  });
  const caseD = L.odCases-E.odCases, odD = L.overdue-E.overdue;
  const head = (caseD<0 || odD<0) && !(caseD>0 && odD>0)
    ? fd(later.asOf)+' improved vs '+fd(earlier.asOf)+'.'
    : (caseD>0 || odD>0)
      ? fd(later.asOf)+' worsened vs '+fd(earlier.asOf)+'.'
      : fd(later.asOf)+' is the same as '+fd(earlier.asOf)+'.';
  const why = fd(later.asOf)+' is the later day. Compared with '+fd(earlier.asOf)+': worsened in '+(worse.join(', ')||'none')+'. Improved in '+(better.join(', ')||'none')+'.';
  const desks = ORDER.map(id => {
    const b=(L.buckets||[]).find(x=>x.id===id)||{cases:0,overdue:0};
    const a=(E.buckets||[]).find(x=>x.id===id)||{cases:0,overdue:0};
    const dc=b.cases-a.cases, da=b.overdue-a.overdue;
    return '<article class="card">'+dateChips(id,dc)+
      '<p style="font-family:Fraunces,Georgia,serif;font-size:1.05rem;margin:.35rem 0 0">'+LABELS[id]+'</p>'
      +'<p class="num">'+int.format(b.cases)+'</p><p class="hint">cases on '+fd(later.asOf)+'</p>'
      +'<p class="mono" style="margin-top:.5rem">'+cr(b.overdue)+'</p>'
      +'<p class="hint">'+fd(earlier.asOf)+' '+int.format(a.cases)+' · '+cr(a.overdue)+'</p>'
      +'<p class="hint '+(cls(da)||cls(dc))+'">'+laterCopy(b.cases,a.cases,false,fd(later.asOf),fd(earlier.asOf))+' · '+laterCopy(b.overdue,a.overdue,true,fd(later.asOf),fd(earlier.asOf))+'</p></article>';
  }).join('');
  return '<div class="banner '+(caseD<0||odD<0?'ok':(caseD>0||odD>0?'bad':''))+'" style="margin-top:1rem"><p class="kicker2">Dates · complete analysis</p><p class="title">'+head+'</p><p class="hint">'+why+'</p>'
    +'<div style="display:grid;gap:.75rem;grid-template-columns:1fr 1fr;margin-top:.85rem">'
    +'<label class="hint">Later day<br><input type="date" value="'+later.asOf+'" min="'+min+'" max="'+max+'" onchange="pickLater(this.value)" style="margin-top:.35rem;width:100%;min-height:44px;padding:.4rem .6rem;border:1px solid var(--line);border-radius:.5rem;background:var(--paper);color:var(--ink)"></label>'
    +'<label class="hint">Compare with<br><input type="date" value="'+earlier.asOf+'" min="'+min+'" max="'+max+'" onchange="pickEarlier(this.value)" style="margin-top:.35rem;width:100%;min-height:44px;padding:.4rem .6rem;border:1px solid var(--line);border-radius:.5rem;background:var(--paper);color:var(--ink)"></label>'
    +'</div>'
    +'<div style="margin-top:.75rem;display:flex;flex-wrap:wrap;gap:.4rem">'
    +'<button type="button" class="chip" style="width:auto" onclick="pickTodayYest()">Today vs yesterday</button>'
    +'<button type="button" class="chip" style="width:auto" onclick="pickWeek()">Same day last week</button>'
    +'<button type="button" class="chip" style="width:auto" onclick="pickMonth()">Same day last month</button>'
    +'<button type="button" class="chip" style="width:auto" onclick="pickStart()">vs 16 Sep start</button>'
    +'</div>'
    +'<div style="margin-top:.75rem">'+chips+'</div></div>'
    +'<div class="kpis">'
      +kpi('Cases not paid', int.format(L.odCases), fd(earlier.asOf)+' '+int.format(E.odCases), {n:caseD,t:laterCopy(L.odCases,E.odCases,false,fd(later.asOf),fd(earlier.asOf))})
      +kpi('Money not paid', cr(L.overdue), fd(earlier.asOf)+' '+cr(E.overdue), {n:odD,t:laterCopy(L.overdue,E.overdue,true,fd(later.asOf),fd(earlier.asOf))})
      +kpi('Late 91 days+', int.format(L.npa91), fd(earlier.asOf)+' '+int.format(E.npa91), {n:L.npa91-E.npa91,t:laterCopy(L.npa91,E.npa91,false,fd(later.asOf),fd(earlier.asOf))})
      +kpi('Paying on time', int.format(L.current), fd(earlier.asOf)+' '+int.format(E.current), {n:-(L.current-E.current), t:(L.current-E.current)>0.5 ? int.format(L.current-E.current)+' more. Improved.' : (L.current-E.current)<-0.5 ? int.format(Math.abs(L.current-E.current))+' less. Worsened.' : fd(later.asOf)+' same as '+fd(earlier.asOf)})
    +'</div>'
    +'<div class="bands">'+desks+'</div>'
    +dateMovement(fd(later.asOf), fd(earlier.asOf), L, E)
    +'<div class="scroll" style="margin-top:1rem"><table><thead><tr><th>What</th><th>Earlier · '+fd(earlier.asOf)+'</th><th>Later · '+fd(later.asOf)+'</th><th>'+fd(later.asOf)+' result</th></tr></thead><tbody>'
    +'<tr><td>Cases not paid</td><td class="mono">'+int.format(E.odCases)+'</td><td class="mono">'+int.format(L.odCases)+'</td><td class="'+cls(L.odCases-E.odCases)+'">'+laterCopy(L.odCases,E.odCases,false,fd(later.asOf),fd(earlier.asOf))+'</td></tr>'
    +'<tr><td>Money not paid</td><td class="mono">'+cr(E.overdue)+'</td><td class="mono">'+cr(L.overdue)+'</td><td class="'+cls(L.overdue-E.overdue)+'">'+laterCopy(L.overdue,E.overdue,true,fd(later.asOf),fd(earlier.asOf))+'</td></tr>'
    +'<tr><td>Cases late 91 days+</td><td class="mono">'+int.format(E.npa91)+'</td><td class="mono">'+int.format(L.npa91)+'</td><td class="'+cls(L.npa91-E.npa91)+'">'+laterCopy(L.npa91,E.npa91,false,fd(later.asOf),fd(earlier.asOf))+'</td></tr>'
    +rows
    +'</tbody></table></div>'
    +'<footer>We keep about 7 daily dumps plus the 16 Sep start. Pick a date even if that exact day is not in the store — we use the nearest dump on or before it.</footer>';
}
function gistBox(){
  const ins = META.insights;
  if(!ins || !ins.gist) return "";
  const item = (t) => typeof t === "string" ? t : (t && t.text) ? t.text : "";
  const learns = (ins.learnings||[]).map(item).filter(Boolean).map(s=>'<li class="hint" style="margin:.4rem 0">'+s+'</li>').join("");
  const acts = (ins.actions||[]).map(item).filter(Boolean).map(s=>'<li class="hint" style="margin:.4rem 0">'+s+'</li>').join("");
  return '<div class="banner" style="margin-top:1rem"><p class="kicker2">Gist · from this dump</p><p class="title">'+ins.gist+'</p><p class="hint">'+ (ins.summary||"") +'</p>'
    +(learns?'<p class="kicker2" style="margin-top:.85rem">Learnings</p><ul style="margin:.2rem 0 0;padding-left:1.15rem">'+learns+'</ul>':'')
    +(acts?'<p class="kicker2" style="margin-top:.85rem">Do this today</p><ol style="margin:.2rem 0 0;padding-left:1.15rem">'+acts+'</ol>':'')
    +'</div>';
}

function personOf(id){ return id==="m0_1"?1:id==="m1_2"?2:id==="m2_3"?3:id==="m3_6"?4:5; }
function rowTable(list, extraTh, extraTd){
  extraTh = extraTh || ""; extraTd = extraTd || function(){ return ""; };
  const body = list.length
    ? list.map((r,i)=>'<tr><td class="mono">'+(i+1)+'</td><td class="mono">'+r[0]+'</td><td>'+nmCase(r[0], r[1], r[7]||r[10], r[2])+'</td><td class="r mono">'+int.format(r[2]||0)+'</td><td class="r mono">'+cr(r[3])+'</td>'+extraTd(r)+'</tr>').join("")
    : '<tr><td colspan="8" style="padding:2rem;text-align:center;color:var(--muted)">None on this dump.</td></tr>';
  return '<div class="scroll"><table><thead><tr><th>#</th><th>File / case no.</th><th>Name</th><th class="r">Days</th><th class="r">Pending</th>'+extraTh+'</tr></thead><tbody>'+body+'</tbody></table></div>';
}
function bandsGrid(lap, vs){
  return '<div class="bands">'+ORDER.map(id=>{
    const b=lap.buckets.find(x=>x.id===id); const a=(vs.buckets||[]).find(x=>x.id===id)||{cases:0,overdue:0};
    const dc=b.cases-a.cases, da=b.overdue-a.overdue;
    return '<article class="card">'+chips(id,dc,da)+
      '<button type="button" onclick="go(\''+id+'\')" style="display:block;width:100%;border:0;background:transparent;text-align:left;padding:0;color:inherit">'
      +'<p style="font-family:Fraunces,Georgia,serif;font-size:1.05rem;margin:.35rem 0 0">Person '+personOf(id)+' · '+LABELS[id]+'</p><p class="hint">'+HINTS[id]+'</p>'
      +'<p class="num">'+int.format(b.cases)+'</p><p class="hint">cases in this mail</p>'
      +'<p class="mono" style="margin-top:.5rem">'+cr(b.overdue)+'</p>'
      +ratesHtml(b,a,lap)
      +'<p class="hint">16 Sep start '+int.format(a.cases)+' · '+cr(a.overdue)+'</p>'
      +'<p class="hint '+ (cls(da)||cls(dc)) +'">'+result(dc,false)+' '+result(da,true)+'</p>'
      +'<p class="hint" style="color:var(--teal);margin-top:.4rem">Open full list →</p></button></article>';
  }).join('')+'</div>';
}
function pageBanner(kicker, title, hint){
  return '<div class="banner" style="margin-top:1rem"><p class="kicker2">'+kicker+'</p><p class="title">'+title+'</p>'+(hint?'<p class="hint">'+hint+'</p>':'')+'</div>';
}

function render(){
  if(!META) return;
  const lap=META.lap, vs=META.vs16Sep;
  document.getElementById('h1').textContent = 'Daily monitor';
  document.getElementById('sub').textContent = fd(META.asOf)+' · '+int.format(lap.odCases)+' overdue · vs 16 Sep';
  const cur=band();
  if(cur==="dates"){
    document.getElementById('sub').textContent = fd(META.asOf)+' · pick two dumps';
    document.getElementById('app').innerHTML = nav('dates') + datesPage();
    return;
  }
  if(cur==="early"){
    const first = ((EARLY&&EARLY.first)||[]).slice().sort((a,b)=>a[2]-b[2]);
    const e23 = ((EARLY&&EARLY.early23)||[]).slice().sort((a,b)=>a[2]-b[2]);
    const mapRow = (r) => [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[10]||r[7], r[9]||r[8]];
    document.getElementById('app').innerHTML = nav('early')
      +pageBanner("First EMI and early bounce", int.format(first.length)+" first EMI · "+int.format(e23.length)+" first 2–3 EMIs unpaid", "New loans. Call them before they age into 3–6 months.")
      +'<div class="kpis">'+kpi("First EMI not paid", int.format(first.length), "zero or one receipt")+kpi("First 2–3 EMIs unpaid", int.format(e23.length), "habit not set")+'</div>'
      +'<p class="kicker2" style="margin-top:1rem">First EMI not paid / bounced</p>'
      +rowTable(first.map(mapRow), '<th>Mobile</th>', function(r){ return '<td class="mono">'+(r[8]||'—')+'</td>'; })
      +'<p class="kicker2" style="margin-top:1rem">First 2–3 EMIs not paid</p>'
      +rowTable(e23.map(mapRow), '<th>Mobile</th>', function(r){ return '<td class="mono">'+(r[8]||'—')+'</td>'; });
    return;
  }
  if(cur==="nach"){
    const pack = NACH || {};
    const s = pack.summary || (META.lap && META.lap.nach) || {};
    const list = (pack.notLive||[]).slice();
    const unpaid = list.filter(r => Number(r[3])>0);
    const current = list.filter(r => !(Number(r[3])>0));
    const asRow = (r) => [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[6]];
    document.getElementById('app').innerHTML = nav('nach')
      +pageBanner("NACH / ECS not live", "Watch every file that is not ECS", "ECS = mandate live. PDC = cheques. NPDC = neither.")
      +'<div class="kpis">'+kpi("ECS live", int.format(s.ecs||0), "mandate on")+kpi("Not on ECS", int.format(s.notLive||list.length), (s.pdc||0)+" PDC · "+(s.npdc||0)+" NPDC")+kpi("Unpaid without ECS", int.format(s.notLiveUnpaid||unpaid.length), cr(s.notLiveOd||0))+kpi("Current, no ECS", int.format(current.length), "activate before bounce")+'</div>'
      +'<p class="kicker2" style="margin-top:1rem">Unpaid — NACH not activated</p>'
      +rowTable(unpaid.map(asRow), '<th>PDC</th><th>Mobile</th>', function(r){ return '<td class="mono">'+(r[5]||'')+'</td><td class="mono">'+(r[6]||'')+'</td>'; })
      +'<p class="kicker2" style="margin-top:1rem">Paying on time — still no ECS</p>'
      +rowTable(current.map(asRow), '<th>PDC</th><th>Mobile</th>', function(r){ return '<td class="mono">'+(r[5]||'')+'</td><td class="mono">'+(r[6]||'')+'</td>'; });
    return;
  }
  if(cur==="people"){
    document.getElementById('app').innerHTML = nav('people')
      +pageBanner("Five desks", "Give each person their list", "Numbers follow the daily mail.")
      +bandsGrid(lap, vs);
    return;
  }
  if(cur==="geo"){
    const pins = ((GEO&&GEO.pins)||(lap.pins)||[]).slice().sort((a,b)=>(b.overdue||0)-(a.overdue||0));
    const top = pins.filter(p => p.odCases>0).slice(0, 40);
    const body = top.map((p,i)=>'<tr><td class="mono">'+(i+1)+'</td><td class="mono">'+(p.pin||'')+'</td><td>'+(p.label||p.district||'')+'</td><td class="r mono">'+int.format(p.odCases||0)+' / '+int.format(p.cases||0)+'</td><td class="r mono">'+cr(p.overdue||0)+'</td><td class="r mono">'+int.format(p.npa91||0)+'</td></tr>').join("")
      || '<tr><td colspan="6">No pin heat on this dump.</td></tr>';
    document.getElementById('app').innerHTML = nav('geo')
      +pageBanner("Heat map", int.format(top.length)+" pins with overdue", "Hottest pincodes first. Same dump as Home.")
      +'<div class="scroll"><table><thead><tr><th>#</th><th>Pin</th><th>Place</th><th class="r">Overdue / book</th><th class="r">Pending</th><th class="r">91+</th></tr></thead><tbody>'+body+'</tbody></table></div>';
    return;
  }
  if(cur==="npa"){
    const list = ROWS.filter(r => Number(r[2])>=91).sort((a,b)=>b[2]-a[2]);
    document.getElementById('app').innerHTML = nav('npa')
      +pageBanner("NPA 91+", int.format(list.length)+" files · "+cr(lap.npa91Overdue), "91+ DPD. File / case no. is the key.")
      +rowTable(list, '<th>Last paid</th><th>Mobile</th>', function(r){ return '<td class="mono">'+(r[5]||'—')+'</td><td class="mono">'+(r[8]||'—')+'</td>'; });
    return;
  }
  if(cur==="call"){
    const list = ROWS.slice().sort((a,b)=>a[2]-b[2]);
    document.getElementById('app').innerHTML = nav('call')
      +pageBanner("Calling book", int.format(list.length)+" overdue files", "All five desks. File / case no. is the key.")
      +rowTable(list, '<th>Desk</th><th>Mobile</th>', function(r){ return '<td>'+(SHORT[r[7]]||r[7]||'')+'</td><td class="mono">'+(r[8]||'—')+'</td>'; });
    return;
  }
  if(cur==="disb"){
    const first = ((EARLY&&EARLY.first)||[]);
    const total = (META && META.disbTotal) || 0;
    document.getElementById('app').innerHTML = nav('disb')
      +pageBanner("New files", total ? ("Origination "+cr(total)) : "No origination rows in this dump", "First-EMI watch, not NPA. Same dump as Home.")
      +'<p class="kicker2" style="margin-top:1rem">First EMI bounce on new files</p>'
      +rowTable(first.map(r => [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[10]||r[7], r[9]||r[8]]), '<th>Mobile</th>', function(r){ return '<td class="mono">'+(r[8]||'—')+'</td>'; });
    return;
  }
  if(cur==="huddle"){
    const pack = HUDDLE || META.huddle || { named: [] };
    const named = pack.named || [];
    const rows = named.map((n,i)=>'<tr><td class="mono">'+(i+1)+'</td><td class="mono">'+(n.caseNo||'')+'</td><td>'+nmCase(n.caseNo, n.name, n.bucket, n.lateBy)+'</td><td class="r mono">'+(n.lateBy||'')+'</td><td class="r mono">'+cr(n.overdue)+'</td><td>'+(n.why||'')+'</td></tr>').join('')
      || '<tr><td colspan="6" style="padding:2rem;text-align:center">Huddle list not on this dump yet.</td></tr>';
    document.getElementById('app').innerHTML = nav('huddle')
      +'<div class="banner" style="margin-top:1rem"><p class="kicker2">Daily 6 pm meeting · standing job</p><p class="title">Name these files in the room</p><p class="hint">Tomorrow we check the same file numbers. If still unpaid, that person answers. This is every day, not a one-off.</p></div>'
      +'<div class="scroll"><table><thead><tr><th>#</th><th>File / case no.</th><th>Name</th><th class="r">Days</th><th class="r">Pending</th><th>Why</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
      +'<footer>In the app by 4 pm. Open this tab in the meeting. No 6 pm mail.</footer>';
    return;
  }
  document.getElementById('sub').textContent = int.format(lap.odCases)+' overdue · compared with 16 Sep start · '+ (META.headline||'');
  const odDelta=lap.overdue-vs.overdue, caseDelta=lap.odCases-vs.odCases;
  if(!cur){
    document.getElementById('app').innerHTML =
      nav('')+
      boardBanner(lap, vs)
      +gistBox()+
      '<div class="kpis">'
        +kpi('LAP files', int.format(lap.cases), int.format(lap.current)+' paying on time', {n:lap.cases-vs.cases,t:result(lap.cases-vs.cases,false)})
        +kpi('Pending EMI', cr(lap.overdue), int.format(lap.odCases)+' cases not paid', {n:odDelta,t:result(odDelta,true)})
        +kpi('Late 91 days+', cr(lap.npa91Overdue), int.format(lap.npa91)+' cases', {n:lap.npa91Overdue-vs.npa91Overdue,t:result(lap.npa91Overdue-vs.npa91Overdue,true)})
        +kpi('Paying on time', int.format(lap.current), 'current accounts', {n:-(lap.current-vs.current),t:(lap.current-vs.current)>0.5 ? int.format(lap.current-vs.current)+' more. Good.' : (lap.current-vs.current)<-0.5 ? int.format(Math.abs(lap.current-vs.current))+' less. Bad.' : 'Same as 16 Sep'})
      +'</div><div class="bands">'+ORDER.map(id=>{
        const b=lap.buckets.find(x=>x.id===id); const a=vs.buckets.find(x=>x.id===id)||{cases:0,overdue:0};
        const dc=b.cases-a.cases, da=b.overdue-a.overdue;
        return '<article class="card">'+chips(id,dc,da)+sheetBar(id)+
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
    sheetBar(cur)+
    '<div class="banner '+(dc<0||da<0?'ok':'bad')+'" style="margin-top:1rem"><strong>'+LABELS[cur]+'</strong><div class="hint">This mail '+int.format(b.cases)+' cases / '+cr(b.overdue)+'. 16 Sep start '+int.format(a.cases)+' cases / '+cr(a.overdue)+'.</div><div style="margin-top:.4rem">'+chips(cur,dc,da)+'</div></div>'
    +'<div class="kpis">'+kpi('Cases this mail', int.format(b.cases), 'this bucket', {n:dc,t:result(dc,false)})+kpi('Pending this mail', cr(b.overdue), LABELS[cur], {n:da,t:result(da,true)})+kpi('Default rate', (function(){ const defC = lap.cases ? (b.cases/lap.cases)*100 : 0; return pf(defC); })(), int.format(b.cases)+' / '+int.format(lap.cases)+' LAP files')+kpi('Recovery vs 16 Sep', (function(){ const rec = a.overdue ? ((a.overdue-b.overdue)/a.overdue)*100 : 0; return pf(rec); })(), 'overdue down ÷ 16 Sep overdue of this desk · '+(RBI[cur]||''), {n: (a.overdue-b.overdue)*-1, t: AIM[cur]})+'</div>'
    +'<div class="scroll"><table><thead><tr><th>File / case no.</th><th>Name</th><th class="r">Days</th><th class="r">Pending</th><th>Last paid</th><th>Mobile</th></tr></thead><tbody>'+body+'</tbody></table></div>';
}
async function j(path){
  const q = '?t='+Date.now()+'&n='+Math.random().toString(36).slice(2);
  for (const base of BASES) {
    try {
      const url = (base ? base+'/' : '') + path + q;
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) continue;
      const ct = r.headers.get('content-type') || '';
      if (ct.includes('text/html')) continue;
      return await r.json();
    } catch(e){}
  }
  return null;
}
async function load(){
  if (load.busy) return;
  load.busy = true;
  document.getElementById('sub').textContent = 'Refreshing live dump…';
  META = await j('live-meta.json') || FALLBACK_META;
  const packs = await Promise.all(['live-m0_1.json','live-m0_1a.json','live-m0_1b.json','live-m1_2.json','live-m2_3.json','live-m3_6.json','live-m6p.json'].map(j));
  const merged = packs.flatMap(x => Array.isArray(x) ? x : []);
  ROWS = merged.length ? merged : (FALLBACK_ROWS || []);
  const flow = await j('live-flow.json');
  if (flow && (flow.m1_2 || flow.oriented)) FLOW = flow;
  else if (FALLBACK_FLOW && (FALLBACK_FLOW.m1_2 || FALLBACK_FLOW.oriented)) FLOW = FALLBACK_FLOW;
  else {
    const fp = await Promise.all(ORDER.map(id => j('live-flow-'+id+'.json')));
    const next = {};
    ORDER.forEach((id,i) => { if (fp[i] && (fp[i].added || fp[i].reduced)) next[id] = fp[i]; });
    if (Object.keys(next).length) FLOW = next;
  }
  HUDDLE = await j('live-huddle.json') || FALLBACK_HUDDLE || (META && META.huddle) || HUDDLE;
  HIST = await j('live-history.json') || FALLBACK_HIST || HIST;
  EARLY = await j('live-early.json') || (typeof FALLBACK_EARLY!=='undefined' ? FALLBACK_EARLY : null) || EARLY;
  NACH = await j('live-nach.json') || (typeof FALLBACK_NACH!=='undefined' ? FALLBACK_NACH : null) || NACH;
  GEO = await j('live-geo.json') || (typeof FALLBACK_GEO!=='undefined' ? FALLBACK_GEO : null) || GEO;
  if(META) render(); else document.getElementById('sub').textContent='Live feed not reached';
  load.busy = false;
}
window.go=go;
window.showFlow=showFlow;
window.closeFlow=closeFlow;
window.pickLater=pickLater;
window.pickEarlier=pickEarlier;
window.pickWeek=pickWeek;
window.pickMonth=pickMonth;
window.pickStart=pickStart;
window.pickTodayYest=pickTodayYest;
window.showDateFlow=showDateFlow;
window.addEventListener('hashchange', render);
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeFlow(); });
load();
setInterval(load, 60000);
window.addEventListener('focus', load);
window.addEventListener('pageshow', load);
document.addEventListener('visibilitychange', function(){ if(document.visibilityState==='visible') load(); });
