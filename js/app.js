const K='the_system_v2',$=s=>document.querySelector(s);let HH=56;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dk=d=>{d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const pd=k=>{const[a,b,c]=k.split('-').map(Number);return new Date(a,b-1,c)};
const dn=d=>Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);
const mn=s=>{const[a,b]=s.split(':').map(Number);return a*60+b};
const f12=t=>{const[h,m]=t.split(':').map(Number);return (h%12||12)+':'+String(m).padStart(2,'0')+' '+(h<12?'AM':'PM')};
const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],STATS=['STR','INT','SEN','CHA'],SL={STR:'STRENGTH',INT:'INTELLIGENCE',SEN:'SENSE',CHA:'CHARM'},rs=n=>(typeof S==='object'&&S&&S.cur||'₹')+Number(n||0).toLocaleString('en-IN');
const PAL=['#3f51b5','#039be5','#d50000','#f09300','#33b679','#8e24aa','#e67c73','#616161','#0b8043','#7986cb'];
let S,tab='quests',selA=-1,ha=0,zm=1,hf='m',hx=0,cm=0,so=0,sd=dk(),hs=dk(),ed={};
const DEFPEN='Hard workout: 50 push-ups, 50 squats, 25 sit-ups, 2 km run. No entertainment for 24 hours.';
function def(){return{name:'Player',title:'Novice',q:'Level up every day',penalty:DEFPEN,cur:'₹',theme:null,lvl:1,xp:0,streak:0,start:dk(),chk:dk(),done:{},log:[],pen:[],money:0,stats:{STR:5,INT:5,SEN:5,CHA:5},
attrs:['Intelligence','Strength','Discipline','Social','Skills'].map((n,i)=>({n,v:0,c:PAL[i]})),tasks:[]}}
function load(){try{localStorage.removeItem('the_system_v1')}catch(e){}try{S=JSON.parse(localStorage.getItem(K))}catch(e){}S=S||def();
S.stats=Object.assign({STR:5,INT:5,SEN:5,CHA:5},S.stats);S.penalty=S.penalty||DEFPEN;S.title=S.title||'Novice';S.cur=S.cur||'₹';S.money=S.money||0;S.q=S.q||'Level up every day';
if(!S.theme)S.theme=matchMedia&&matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}clearTimeout(save.t);save.t=setTimeout(()=>{syncSW();schedAll()},800)}
function theme(){S.theme=S.theme==='light'?'dark':'light';save();applyT()}
const ORN='<i class="o a"></i><i class="o b"></i><i class="o c"></i><i class="o d"></i>',ic=p=>`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`,
SUN=ic('<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'),MOON=ic('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>');
const TH={Blue:{a:'#2f7cff',o:'#4aa3ff',d:['#050a18','#0e2150','#0b1630','#0d1b3d','#1a2547'],l:['#eef2fa','#dbe6fb','#ffffff','#f1f5ff','#ebedf0']},
Purple:{a:'#8b5cf6',o:'#b18cff',d:['#0a0618','#2a1456','#140d2e','#1b1240','#251a4a'],l:['#f3effc','#e4d9fb','#ffffff','#f6f1ff','#ece8f3']},
Emerald:{a:'#10b981',o:'#34d399',d:['#04100c','#0b3a2c','#0a1f19','#0e2c23','#16352c'],l:['#ecf8f3','#d3f0e4','#ffffff','#effaf5','#e6eeea']},
Crimson:{a:'#ef4444',o:'#ff7676',d:['#130607','#4a1219','#1f0d10','#2c1317','#37191e'],l:['#fcefef','#f9d6d6','#ffffff','#fff1f1','#f1e9e9']},
Gold:{a:'#d4a017',o:'#f0be3c',d:['#110d04','#47360d','#1f180b','#2b2210','#352b16'],l:['#fbf6e8','#f4e7bd','#ffffff','#fff9e8','#efebe0']},
Cyan:{a:'#06b6d4',o:'#22d3ee',d:['#031114','#08343d','#0a1d22','#0e2a31','#15343b'],l:['#ecf8fb','#cdeff6','#ffffff','#effafc','#e5eef0']}};
function applyT(){const r=document.documentElement,m=S.theme==='light'?'l':'d',h=TH[S.th]||TH.Blue,v=h[m];r.dataset.theme=S.theme;
['--bg','--bg2','--pn','--ib','--l0'].forEach((k,i)=>r.style.setProperty(k,v[i]));
r.style.setProperty('--ln',h.a);r.style.setProperty('--lnl',h.a+'33');r.style.setProperty('--orn',m==='l'?h.a:h.o);r.style.setProperty('--q2',h.o);
$('#th').innerHTML=S.theme==='light'?MOON:SUN}
const col=n=>{const i=S.attrs.findIndex(a=>a.n===n);return i>=0&&S.attrs[i].c||PAL[(i<0?7:i)%PAL.length]};
function quests(){return S.tasks.filter(t=>t.core)}
const sched=d=>S.tasks.filter(t=>!t.core&&(t.on?t.on===dk(d):t.days.includes(d.getDay()))).sort((a,b)=>a.start<b.start?-1:1);
const tier=()=>Math.floor((dn(new Date())-dn(pd(S.start)))/7)+1;
const rank=()=>'EDCBAS'[Math.min(5,Math.floor((S.lvl-1)/10))]+'-Rank';
function roll(){const t=dk(),T0=pd(t);let c=pd(S.chk);while(c<T0){const k=dk(c),q=quests(c);
if(q.length){if(q.every(x=>(S.done[k]||[]).includes(x.id)))S.streak++;else{S.streak=0;S.pen.push(k);const c={};q.filter(x=>!(S.done[k]||[]).includes(x.id)).forEach(x=>{const a=S.attrs.find(y=>y.n===x.attr);if(a&&a.v>0){a.v--;c[a.n]=(c[a.n]||0)-1}if(S.stats[x.stat]!=null&&S.stats[x.stat]>1){S.stats[x.stat]--;c[SL[x.stat]]=(c[SL[x.stat]]||0)-1}});(S.pdx=S.pdx||{})[k]=Object.entries(c).map(([n,v])=>n+' '+v).join(', ')||'none'}}c.setDate(c.getDate()+1)}S.chk=t;save()}
function toast(m){const e=$('#toast');e.innerHTML=m;e.className='';e.style.display='block';void e.offsetWidth;e.className='sh';clearTimeout(toast.t);clearTimeout(toast.u);toast.t=setTimeout(()=>{e.className='hd';toast.u=setTimeout(()=>e.style.display='none',300)},3200)}
function comp(id){const k=dk(),t=S.tasks.find(x=>x.id===id);if(!t)return;S.done[k]=S.done[k]||[];if(S.done[k].includes(id))return;
S.done[k].push(id);const xp=t.core?20:10;S.xp+=xp;if(S.stats[t.stat]!=null)S.stats[t.stat]++;
const a=S.attrs.find(x=>x.n===t.attr);if(a)a.v++;S.log.push({d:k,t:t.title,a:t.attr});
let m=`<b>[QUEST COMPLETE]</b> +${xp} XP${S.stats[t.stat]!=null?' · +1 '+SL[t.stat]:''}${a?' · +1 '+esc(a.n):''}`;
while(S.xp>=100*S.lvl){S.xp-=100*S.lvl;S.lvl++;m+=`<br><b>[LEVEL UP]</b> Level ${S.lvl}`}
save();toast(m);render()}
function tog(id){const k=dk();flip(()=>{if((S.done[k]||[]).includes(id))unc(id);else comp(id)})}
function unc(id){const k=dk(),t=S.tasks.find(x=>x.id===id);if(!t)return;const L=S.done[k]||[];if(!L.includes(id))return;
S.done[k]=L.filter(x=>x!==id);const xp=t.core?20:10;S.xp-=xp;while(S.xp<0&&S.lvl>1){S.lvl--;S.xp+=100*S.lvl}if(S.xp<0)S.xp=0;
if(S.stats[t.stat]!=null)S.stats[t.stat]=Math.max(1,S.stats[t.stat]-1);const a=S.attrs.find(x=>x.n===t.attr);if(a&&a.v>0)a.v--;
const i=S.log.map(l=>l.d===k&&l.t===t.title).lastIndexOf(true);if(i>=0)S.log.splice(i,1);
save();toast('<b>[QUEST UNDONE]</b> −'+xp+' XP');render()}
const srt=(a,k)=>a.map((t,i)=>[t,i]).sort((x,y)=>((S.done[k]||[]).includes(x[0].id)-(S.done[k]||[]).includes(y[0].id))||mn(x[0].start)-mn(y[0].start)||x[1]-y[1]).map(x=>x[0]);
function flip(fn){const o={};document.querySelectorAll('.r[data-id]').forEach(e=>o[e.dataset.id]=e.getBoundingClientRect().top);fn();document.querySelectorAll('.r[data-id]').forEach(e=>{const d=o[e.dataset.id]-e.getBoundingClientRect().top;if(d)e.animate([{transform:`translateY(${d}px)`},{transform:'none'}],{duration:450,easing:'cubic-bezier(.2,.8,.2,1)'})})}
const row=(t,k)=>{const d=(S.done[k]||[]).includes(t.id),w=t.note?' · '+esc(t.note):'';
return `<div class="r ${d?'d':''}" data-id="${t.id}" onclick="tog('${t.id}')"><i>${d?'✔':''}</i><div><b>${esc(t.title)}</b><small>${f12(t.start)} – ${f12(t.end)} · +${t.core?20:10} XP · ${esc(t.attr)}${w}</small></div></div>`}
function radar(){const A=S.attrs,n=A.length,m=Math.max(10,...A.map(a=>a.v))*1.15,P=(i,r)=>{const a=-Math.PI/2+2*Math.PI*i/n;return[(150+r*Math.cos(a)).toFixed(1),(150+r*Math.sin(a)).toFixed(1)]};
let g='';[.25,.5,.75,1].forEach(f=>g+=`<polygon points="${A.map((_,i)=>P(i,95*f).join(',')).join(' ')}" style="fill:none;stroke:var(--ln);stroke-opacity:.35"/>`);
A.forEach((a,i)=>{const[x,y]=P(i,95),[lx,ly]=P(i,116);g+=`<line x1="150" y1="150" x2="${x}" y2="${y}" style="stroke:var(--ln);stroke-opacity:.35"/><text onclick="selA=${i};ha=1;render()" x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle">${esc(a.n)} ${a.v}</text>`});
g+=`<polygon points="${A.map((a,i)=>P(i,95*a.v/m).join(',')).join(' ')}" style="fill:var(--ln);fill-opacity:.35;stroke:var(--orn)" stroke-width="2"/>`;
g+=`<circle cx="150" cy="150" r="13" onclick="hideA()" style="fill:var(--pn);stroke:var(--ln);stroke-width:1.5;cursor:pointer"/><circle cx="150" cy="150" r="3" style="fill:var(--ln);pointer-events:none"/>`;return `<svg viewBox="-25 5 350 290">${g}</svg>`}
function sum(from,to){const days=[];for(let c=new Date(from);c<=to;c.setDate(c.getDate()+1))days.push(dk(c));
const c={};let tot=0;days.forEach(k=>tot+=(S.done[k]||[]).length);
S.log.filter(l=>days.includes(l.d)).forEach(l=>c[l.a]=(c[l.a]||0)+1);
const best=Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([a,n])=>`${esc(a)} +${n}`).join(', ')||'none';
return `${days.length} days · ${tot} tasks completed · avg ${(tot/days.length).toFixed(1)}/day<br>Attribute gains: ${best}`}
function heat(){const t=new Date(),f=new Date(t.getFullYear(),t.getMonth()+cm,1),dim=new Date(f.getFullYear(),f.getMonth()+1,0).getDate(),tk=dk();
let c='<div class="mg">'+DN.map(d=>`<small>${d[0]}</small>`).join('')+'<span></span>'.repeat(f.getDay());
for(let i=1;i<=dim;i++){const d=new Date(f.getFullYear(),f.getMonth(),i),k=dk(d),n=(S.done[k]||[]).length;
c+=`<i class="c l${d>t||!n?0:n<3?1:n<5?2:n<7?3:4}${k===hs?' sel':''}${k===tk?' t':''}" onclick="hs='${k}';render()">${i}</i>`}
return {h:c+'</div>',t:f.toLocaleString('en',{month:'long',year:'numeric'})}}
const PEN='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>';
const wst=d=>{const s=new Date(d.getFullYear(),d.getMonth(),d.getDate());s.setDate(s.getDate()-(s.getDay()+6)%7);return s};
function gl(p){const k=p==='w'?dk(wst(new Date())):dk().slice(0,7);S.goals=S.goals||{w:{k:'',a:[]},m:{k:'',a:[]}};const g=S.goals[p];if(g.k!==k){g.k=k;g.a=[]}return g.a}
function gTog(p,i){const g=gl(p);g[i].d=g[i].d?0:1;save();render()}
function gbox(p){const g=gl(p),t=new Date();let r;if(p==='w'){const s=wst(t),e=new Date(s);e.setDate(s.getDate()+6);r=s.getDate()+' '+s.toLocaleString('en',{month:'short'})+' – '+e.getDate()+' '+e.toLocaleString('en',{month:'short'})}else r=t.toLocaleString('en',{month:'long',year:'numeric'});
return `<div class="p"><div class="top"><h2 style="margin:0">[${p==='w'?'WEEKLY':'MONTHLY'} GOAL]</h2><button class="pb" onclick="goalEd('${p}')" aria-label="Add goal">${PEN}</button></div><small style="margin:4px 0 6px">${r}</small>${g.map((x,i)=>`<div class="r ${x.d?'d':''}" onclick="gTog('${p}',${i})"><i>${x.d?'✔':''}</i><b>${esc(x.t)}</b></div>`).join('')||'<small>No goal set. Tap the pencil to add one.</small>'}</div>`}
function goalEd(p){const g=gl(p),m=$('#md');m.style.display='flex';m.innerHTML=`<div class="p"><h2>[${p==='w'?'WEEKLY':'MONTHLY'} GOAL]</h2><div class="f"><input id="gt" class="w" placeholder="Write a goal"><button class="pr w" onclick="gAdd('${p}')">Add goal</button>${g.map((x,i)=>`<div class="w r" style="cursor:default"><b style="flex:1">${esc(x.t)}</b><button class="x" onclick="gDel('${p}',${i})">✕</button></div>`).join('')}<button class="w" onclick="closeMd();render()">Close</button></div></div>`}
function gAdd(p){const v=$('#gt').value.trim();if(!v)return;gl(p).push({t:v,d:0});save();goalEd(p)}
function gDel(p,i){const g=gl(p);ask(`Delete goal “${esc(g[i].t)}”?`,()=>{g.splice(i,1);save();render()})}
const dfm=k=>{const d=pd(k);return d.getDate()+' '+d.toLocaleString('en',{month:'long'})+' '+d.getFullYear()};
const dl=k=>{const d=pd(k);return d.toLocaleString('en',{weekday:'long'})+' '+d.getDate()+' '+d.toLocaleString('en',{month:'long'})};
function tlx(k){const d=pd(k),ev=quests(d).concat(sched(d)).map(t=>({t,s:mn(t.start),e:Math.max(mn(t.end),mn(t.start)+15)}));lay(ev);const D=S.done[k]||[];
let hr='';for(let h=0;h<24;h++)hr+=`<div class="hr" style="top:${h*HH}px"><span>${h%12||12} ${h<12?'am':'pm'}</span></div>`;
const bl=ev.map(e=>{const m=e.e-e.s,x=D.includes(e.t.id);return `<div class="ev ro${x?' dn':''}" style="top:${e.s/60*HH}px;height:${Math.max(20,m/60*HH-2)}px;left:calc(${e.i}*100%/${e.n});width:calc(100%/${e.n} - 3px);background:${col(e.t.attr)}">${x?'✔ ':''}${esc(e.t.title)}<small>${f12(e.t.start)} – ${f12(e.t.end)}</small></div>`}).join('');
const n=new Date(),nl=k===dk()?`<div class="nw" style="top:${(n.getHours()*60+n.getMinutes())/60*HH}px"></div>`:'';
return `${ZB()}<div class="tl" id="tl2"><div class="in" style="height:${24*HH}px;width:${zm*100}%">${hr}<div class="gr">${bl}</div>${nl}</div></div>`}
const V={
status(){const need=100*S.lvl,k=dk(),q=quests(new Date()),n=q.filter(x=>(S.done[k]||[]).includes(x.id)).length;
let h=`<div class="p orn wn">${ORN}<h2 class="ttl">STATUS WINDOW</h2>
<div class="kv"><span>NAME: ${esc(S.name)}</span><span>LEVEL: ${S.lvl}</span><span>RANK: ${rank()}</span><span>STREAK: ${S.streak}</span><span class="w">TITLE: ${esc(S.title)}</span></div>
<hr class="dv"><small>XP ${S.xp} / ${need}</small><div class="bar"><b style="width:${S.xp/need*100}%"></b></div><small>Quest tier ${tier()} · Today ${n}/${q.length}</small>
<hr class="dv"><div class="kv st">${STATS.map(s=>`<span>${SL[s]}: ${S.stats[s]}</span>`).join('')}<span>MONEY: ${rs(S.money)}</span></div>
<hr class="dv"><small style="text-align:center;margin-bottom:8px">ATTRIBUTES</small><div class="kv st">${S.attrs.map(a=>`<span>${esc(a.n)}: ${a.v}</span>`).join('')}</div></div>
<div class="p ct"><h2>[ATTRIBUTE RADAR]</h2>${radar()}`;
if(S.attrs[selA]){const a=S.attrs[selA],now=dn(new Date()),lim=hf==='w'?7:hf==='m'?30:1e9,l=S.log.filter(x=>x.a===a.n&&now-dn(pd(x.d))<lim),g={};l.forEach(x=>g[x.t]=(g[x.t]||0)+1);const gs=Object.entries(g).sort((x,y)=>y[1]-x[1]),sh=hx?gs:gs.slice(0,6);
h+=`<div class="hl${ha?' hin':''}"><h2 style="margin-top:10px">[${esc(a.n)}: ${a.v}]</h2><div class="sw">${[['w','7 days'],['m','30 days'],['a','All']].map(([k,t])=>`<button class="${hf===k?'on':''}" onclick="hf='${k}';hx=0;render()">${t}</button>`).join('')}</div><small style="margin-top:8px">${l.length} tasks completed · ${gs.length} different tasks</small>${sh.map(([t,n])=>`<small style="color:var(--tx)">${esc(t)} ×${n}</small>`).join('')||'<small>No completed tasks in this period.</small>'}${gs.length>6?`<button style="margin-top:8px" onclick="hx=!hx;render()">${hx?'Show less':'Show all '+gs.length}</button>`:''}</div>`}
ha=0;return h+'</div>'},
quests(){const k=dk(),d=new Date();let h=`<div class="qb orn">${ORN}<div class="qt">${esc(S.q)}</div></div><div class="p" style="text-align:center"><b style="font-size:24px">${d.getDate()} ${d.toLocaleString('en',{month:'long'})} ${d.getFullYear()}</b></div>`;
if(S.pen.length)h+=`<div class="p pen"><h2>[PENALTY QUEST ACTIVE]</h2><b>Missed: ${S.pen.map(dfm).join(', ')}</b><br>Points deducted: ${S.pen.map(d=>`${dfm(d)} (${(S.pdx||{})[d]||'none'})`).join('; ')}<br>${esc(S.penalty)}<br><button class="pr" style="margin-top:8px" onclick="S.pen.shift();save();toast('[PENALTY CLEARED]');render()">Penalty completed</button></div>`;
if(!S.tasks.length)h+=`<div class="p ct"><h2>[WELCOME, PLAYER]</h2><small>Your system is empty. Set it up in three steps:</small><div class="hl" style="margin:8px 0"><small>1. Open settings and set your name, title and quote.</small><small>2. Add the attributes you want to grow.</small><small>3. Add daily quests and side quests with the + button.</small></div><button class="pr" onclick="openSet()">Open settings</button></div>`;
h+=`<div class="p"><h2 style="text-align:center">[DAILY QUEST]</h2>${srt(quests(d),k).map(t=>row(t,k)).join('')||'<small style="text-align:center">No daily quests yet.</small>'}<small id="cd" style="margin-top:8px"></small></div>`;
const s=sched(d);return h+`<div class="p"><h2 style="text-align:center">[SIDE QUEST]</h2>${srt(s,k).map(t=>row(t,k)).join('')||'<small>None scheduled.</small>'}</div>`},
log(){const t=new Date(),lastDay=new Date(t.getFullYear(),t.getMonth()+1,0).getDate()===t.getDate(),w=new Date(t),H=heat(),l=S.log.filter(x=>x.d===hs);w.setDate(t.getDate()-6);
return `<div class="p"><div class="top"><button onclick="cm--;render()">◀</button><b>${H.t}</b><button onclick="cm++;render()">▶</button></div>${H.h}
</div>
<div class="p"><h2>[${dl(hs)}: ${l.length} done]</h2>${tlx(hs)}</div>
${gbox('w')}${gbox('m')}`}};
function anim(el){const ch=el.id==='v'?[...el.children]:[...el.querySelector('.wrap').children];ch.forEach((c,i)=>c.style.setProperty('--d',Math.min(i,7)*170+'ms'));el.classList.remove('an');void el.offsetWidth;el.classList.add('an');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('an'),1500)}
function go(t){if(t===tab)return;tab=t;render();anim($('#v'))}
function openSet(){sd=dk();$('#set').innerHTML='';so=1;renderSet();$('#set').scrollTop=0;anim($('#set'))}
function hideA(){const e=document.querySelector('.hl');if(!e||e.classList.contains('hout'))return;e.style.overflow='hidden';e.style.height=e.offsetHeight+'px';e.style.transition='height .4s cubic-bezier(.4,0,.2,1)';e.classList.add('hout');requestAnimationFrame(()=>requestAnimationFrame(()=>{e.style.height='0px'}));setTimeout(()=>{selA=-1;render()},420)}
const ZL=[1,1.5,2,3],ZB=()=>`<div class="top" style="margin:4px 0 6px"><small>Zoom ${Math.round(zm*100)}%</small><span style="display:flex;gap:6px"><button class="pb" onclick="zoom(-1)" aria-label="Zoom out">−</button><button class="pb" onclick="zoom(0)" aria-label="Reset zoom">1×</button><button class="pb" onclick="zoom(1)" aria-label="Zoom in">+</button></span></div>`;
function zoom(d){const a=so?$('#tl'):$('#tl2'),o=HH,st=a?a.scrollTop/o:null,i=d?Math.max(0,Math.min(ZL.length-1,ZL.indexOf(zm)+d)):0;zm=ZL[i];HH=56*zm;render();const n=so?$('#tl'):$('#tl2');if(n&&st!=null)n.scrollTop=st*HH}
function resetAll(){ask('Erase ALL data (tasks, progress, history, money, goals) and start fresh? This cannot be undone.',()=>{try{localStorage.removeItem(K)}catch(e){}const th=S.theme,t2=S.th;S=def();S.theme=th;S.th=t2;save();so=0;selA=-1;tab='quests';applyT();renderSet();render()})}
const PK={},PAL2=['#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#14b8a6','#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899','#f43f5e','#64748b'];
function pkClose(){$('#pk').style.display='none'}
function pkShow(h){const o=$('#pk');if(o.style.display==='flex'&&o.firstChild){o.firstChild.innerHTML=h;return}o.innerHTML=`<div class="p sheet">${h}</div>`;o.style.display='flex'}
function sel(id,t,o,v){PK[id]={t,o};const c=o.find(x=>x.v===v)||o[0]||{v:'',l:''};return `<button type="button" class="pick w" id="${id}" data-v="${esc(c.v)}" onclick="openOpt('${id}')">${c.c?`<span class="dot" style="background:${c.c}"></span>`:''}<span class="t">${esc(c.l)}</span></button>`}
function openOpt(id){const P=PK[id],cur=$('#'+id).dataset.v;pkShow(`<h2>${esc(P.t)}</h2>${P.o.map((x,i)=>`<div class="op ${x.v===cur?'on':''}" onclick="setOpt('${id}',${i})">${x.c?`<span class="dot" style="background:${x.c}"></span>`:''}<b>${esc(x.l)}</b><i></i></div>`).join('')}<button class="w" style="width:100%;margin-top:10px" onclick="pkClose()">Cancel</button>`)}
function setOpt(id,i){const x=PK[id].o[i],b=$('#'+id);b.dataset.v=x.v;b.innerHTML=`${x.c?`<span class="dot" style="background:${x.c}"></span>`:''}<span class="t">${esc(x.l)}</span>`;pkClose();if(id==='nr')rp()}
let tp={};
function tBtn(id,v){return `<button type="button" class="pick" id="${id}" data-v="${v}" onclick="openTime('${id}')"><span class="t">${f12(v)}</span></button>`}
function openTime(id){const[h,m]=$('#'+id).dataset.v.split(':').map(Number);tp={id,h:h%12||12,m,p:h<12?'AM':'PM'};tpR()}
function tpR(){const p=x=>String(x).padStart(2,'0'),ms=[...new Set([...Array(12).keys()].map(i=>i*5).concat(tp.m))].sort((a,b)=>a-b);
pkShow(`<h2>Select time</h2><div class="tpv">${tp.h}:${p(tp.m)} <small>${tp.p}</small></div><small style="text-align:center">Hour</small><div class="chips">${[...Array(12)].map((_,i)=>`<button type="button" class="chip ${tp.h===i+1?'on':''}" onclick="tpS('h',${i+1})">${i+1}</button>`).join('')}</div><small style="text-align:center">Minute</small><div class="chips m">${ms.map(x=>`<button type="button" class="chip ${tp.m===x?'on':''}" onclick="tpS('m',${x})">${p(x)}</button>`).join('')}</div><div class="seg">${['AM','PM'].map(a=>`<button type="button" class="${tp.p===a?'on':''}" onclick="tpS('p','${a}')">${a}</button>`).join('')}</div><div class="f"><button class="pr" onclick="tpOk()">Set</button><button onclick="pkClose()">Cancel</button></div>`)}
function tpS(k,v){tp[k]=v;tpR()}
function tpOk(){let h=tp.h%12;if(tp.p==='PM')h+=12;const v=String(h).padStart(2,'0')+':'+String(tp.m).padStart(2,'0'),b=$('#'+tp.id);b.dataset.v=v;b.innerHTML=`<span class="t">${f12(v)}</span>`;pkClose()}
function colBtn(id,v){return `<button type="button" class="pick" id="${id}" data-v="${v}" aria-label="Choose colour" onclick="openCol('${id}')"><span class="dot" style="background:${v}"></span></button>`}
function openCol(id){const cur=$('#'+id).dataset.v;pkShow(`<h2>Choose colour</h2><div class="pal">${PAL2.map(c=>`<button type="button" class="${c===cur?'on':''}" style="background:${c}" onclick="setCol('${id}','${c}')" aria-label="${c}"></button>`).join('')}</div><button class="w" style="width:100%" onclick="pkClose()">Cancel</button>`)}
function setCol(id,c){const b=$('#'+id);b.dataset.v=c;b.innerHTML=`<span class="dot" style="background:${c}"></span>`;pkClose()}
let SWR=null,ipEv=null,lastM=new Date().getHours()*60+new Date().getMinutes();const fired={};
async function initSW(){if(!('serviceWorker' in navigator))return;try{SWR=await navigator.serviceWorker.register('sw.js');await navigator.serviceWorker.ready;
try{if(SWR.periodicSync){const q=await navigator.permissions.query({name:'periodic-background-sync'});if(q.state==='granted')await SWR.periodicSync.register('quest-check',{minInterval:15*60*1000})}}catch(e){}
syncSW();schedAll();if(so)renderSet()}catch(e){SWR=null}}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();ipEv=e;if(so)renderSet()});
async function notify(title,body,tag){const o={body,tag:tag||'sys',icon:'icons/icon-192.png',badge:'icons/icon-192.png',vibrate:[200,100,200],renotify:true,data:{url:'./'}};
try{if('Notification' in window&&Notification.permission==='granted'){const r=SWR||(navigator.serviceWorker&&await navigator.serviceWorker.getRegistration());if(r){await r.showNotification(title,o);return true}new Notification(title,o);return true}}catch(e){try{new Notification(title,o);return true}catch(_){}}return false}
function remind(){const n=new Date(),nm=n.getHours()*60+n.getMinutes(),k=dk();if(nm<lastM)lastM=-1;
quests(n).concat(sched(n)).forEach(t=>{const m=mn(t.start),f=k+t.id;if(m>lastM&&m<=nm&&m>=nm-30&&!fired[f]&&!(S.done[k]||[]).includes(t.id)){fired[f]=1;toast(`<b>[QUEST ACTIVE]</b> ${esc(t.title)}`);notify('[SYSTEM] '+t.title,f12(t.start)+' – '+f12(t.end),'q-'+f)}});lastM=nm}
function syncSW(){try{const a=SWR&&SWR.active;if(!a)return;const k=dk();a.postMessage({type:'snap',snap:{date:k,done:S.done[k]||[],tasks:S.tasks.map(t=>({id:t.id,title:t.title,start:t.start,end:t.end,core:t.core,days:t.days,on:t.on||''}))}})}catch(e){}}
async function schedAll(){try{if(!SWR||!('showTrigger' in Notification.prototype)||Notification.permission!=='granted')return;
const old=await SWR.getNotifications({includeTriggered:true});old.filter(n=>n.tag&&n.tag.startsWith('sch-')).forEach(n=>n.close());const now=Date.now();
for(let d=0;d<2;d++){const day=new Date();day.setDate(day.getDate()+d);const k=dk(day);
quests(day).concat(sched(day)).forEach(t=>{const[h,m]=t.start.split(':').map(Number),ts=new Date(day.getFullYear(),day.getMonth(),day.getDate(),h,m).getTime();
if(ts>now&&!(S.done[k]||[]).includes(t.id))SWR.showNotification('[SYSTEM] '+t.title,{tag:'sch-'+k+t.id,body:f12(t.start)+' – '+f12(t.end),icon:'icons/icon-192.png',badge:'icons/icon-192.png',showTrigger:new TimestampTrigger(ts),data:{url:'./'}})})}}catch(e){}}
const alStat=()=>!('Notification' in window)?'Notifications are not supported in this browser.':'Permission: '+Notification.permission+' · Background service: '+(SWR?'active':'not active');
function alerts(){if(!('Notification' in window))return toast('<b>[ALERTS]</b> Not supported in this browser');Notification.requestPermission().then(p=>{toast('<b>[ALERTS]</b> '+(p==='granted'?'Enabled':'Permission '+p));schedAll();if(so)renderSet()}).catch(()=>toast('<b>[ALERTS]</b> Could not ask for permission'))}
async function testAlert(){if(!('Notification' in window)||Notification.permission!=='granted')return toast('<b>[ALERTS]</b> Press Enable alerts first');const ok=await notify('[SYSTEM] Test alert','Alerts are working.','test');toast(ok?'<b>[ALERTS]</b> Test alert sent':'<b>[ALERTS]</b> Could not show a notification')}
function installApp(){if(!ipEv)return;ipEv.prompt();ipEv=null;if(so)renderSet()}
function setTh(n){S.th=n;save();applyT();if(so)renderSet()}
function render(){$('#v').classList.remove('an');$('nav').style.setProperty('--i',['quests','log','status'].indexOf(tab));document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));const t2=$('#tl2'),s2=t2?t2.scrollTop:null;$('#v').innerHTML=V[tab]();const n2=$('#tl2');if(n2)n2.scrollTop=s2!=null?s2:Math.max(0,(new Date().getHours()-1)*HH);tick();if(so)renderSet()}
function tick(){const e=$('#cd');if(!e)return;const n=new Date(),m=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1),s=Math.floor((m-n)/1000),p=x=>String(x).padStart(2,'0');
e.textContent=`[WARNING: PENALTY QUEST] in ${p(Math.floor(s/3600))}:${p(Math.floor(s%3600/60))}:${p(s%60)} if any quest is incomplete.`}
function lay(ev){ev.sort((a,b)=>a.s-b.s);let cur=null;const cl=[];
ev.forEach(e=>{if(!cur||e.s>=cur.end){cur={end:e.e,l:[],it:[]};cl.push(cur)}let i=cur.l.findIndex(x=>x<=e.s);if(i<0){i=cur.l.length;cur.l.push(0)}cur.l[i]=e.e;e.i=i;cur.it.push(e);cur.end=Math.max(cur.end,e.e)});
cl.forEach(c=>c.it.forEach(e=>e.n=c.l.length))}
function renderSet(){const o=$('#set');o.classList.remove('an');if(!so){o.style.display='none';return}
const sc=$('#tl'),st=sc?sc.scrollTop:null,d=pd(sd),f=new Date(d.getFullYear(),d.getMonth(),1),dim=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
let wk=DN.map(x=>`<small>${x[0]}</small>`).join('')+'<span></span>'.repeat(f.getDay());for(let i=1;i<=dim;i++){const k=dk(new Date(d.getFullYear(),d.getMonth(),i));wk+=`<b class="${k===sd?'on':''} ${k===dk()?'td':''}" onclick="sd='${k}';renderSet()">${i}</b>`}
const ev=quests(d).concat(sched(d)).map(t=>({t,s:mn(t.start),e:Math.max(mn(t.end),mn(t.start)+15)}));lay(ev);
let hr='';for(let h=0;h<24;h++)hr+=`<div class="hr" style="top:${h*HH}px"><span>${h%12||12} ${h<12?'am':'pm'}</span></div>`;
const bl=ev.map(e=>{const m=e.e-e.s,dn_=(S.done[sd]||[]).includes(e.t.id);return `<div class="ev ${dn_?'dn':''}" style="top:${e.s/60*HH}px;height:${Math.max(20,m/60*HH-2)}px;left:calc(${e.i}*100%/${e.n});width:calc(100%/${e.n} - 3px);background:${col(e.t.attr)}" onclick="event.stopPropagation();edT('${e.t.id}')">${dn_?'✔ ':''}${esc(e.t.title)}<small>${f12(e.t.start)} – ${f12(e.t.end)} · ${(m>=60?Math.floor(m/60)+'h ':'')+(m%60?m%60+'m':'')}</small></div>`}).join('');
const now=new Date(),nl=sd===dk()?`<div class="nw" style="top:${(now.getHours()*60+now.getMinutes())/60*HH}px"></div>`:'';
o.innerHTML=`<div class="wrap"><div class="top" style="margin-bottom:10px"><h2 style="margin:0;font-size:22px">[PLAN]</h2><button onclick="so=0;renderSet()">✕ Close</button></div>
<div class="p"><div class="top"><button onclick="shM(-1)">◀</button><b>${d.toLocaleString('en',{month:'long',year:'numeric'})}</b><button onclick="shM(1)">▶</button></div><div class="cg">${wk}</div><h2 style="margin:6px 0">${d.toLocaleString('en',{weekday:'long',day:'numeric',month:'long'})}</h2>
${ZB()}<div class="tl" id="tl"><div class="in" style="height:${24*HH}px;width:${zm*100}%" onclick="addAt(event)">${hr}<div class="gr">${bl}</div>${nl}</div></div>
<small style="margin-top:6px">Swipe the timeline left or right for other dates. Tap an empty slot or + to add. Tap a block to edit, complete or delete.</small></div>
<div class="p"><h2>[MONEY]</h2><small>Balance</small><div class="big">${rs(S.money)}</div><div class="f" style="margin-top:10px"><input id="ma" class="w" type="number" inputmode="decimal" min="0" placeholder="Amount" style="width:100%"><button class="pr" onclick="mon(1)">+ Add</button><button class="x" onclick="mon(-1)">− Remove</button></div></div>
<div class="p"><h2>[THEME]</h2><div class="sw">${Object.keys(TH).map(n=>`<button class="${(S.th||'Blue')===n?'on':''}" style="border-color:${TH[n].a}" onclick="setTh('${n}')"><span class="dot" style="background:${TH[n].a}"></span>${n}</button>`).join('')}</div></div>
<div class="p"><h2>[PROFILE]</h2><div class="f"><label class="w"><small>Player name</small><input id="pn" style="width:100%" value="${esc(S.name)}"></label><label class="w"><small>Title</small><input id="pt" style="width:100%" value="${esc(S.title)}"></label><label class="w"><small>Quote</small><input id="pq" style="width:100%" value="${esc(S.q)}"></label><label class="w"><small>Penalty when daily quests are missed</small><input id="pp" style="width:100%" value="${esc(S.penalty)}"></label><label class="w"><small>Currency symbol</small><input id="pc" style="width:100%" maxlength="3" value="${esc(S.cur)}"></label><button class="pr w" onclick="saveP()">Save profile</button></div></div>
<div class="p"><h2>[DATA]</h2><small>Everything is stored only on this device. Clearing browser data erases it.</small><button class="x w" style="margin-top:10px;width:100%" onclick="resetAll()">Reset all data</button></div>
<div class="p"><h2>[ATTRIBUTES]</h2><div class="f"><div class="arow"><input id="aa" placeholder="New attribute">${colBtn('ac',PAL2[S.attrs.length%PAL2.length])}</div><button class="w" onclick="addA()">Add attribute</button></div>
${S.attrs.map((a,i)=>`<div class="r" style="cursor:default"><span class="dot" style="background:${col(a.n)}"></span><b style="flex:1">${esc(a.n)} (${a.v})</b><button class="x" onclick="delA(${i})">✕</button></div>`).join('')}</div>
<div class="p"><h2>[ALERTS]</h2><small id="al" style="color:var(--tx)">${alStat()}</small><small style="margin-top:6px">Alerts fire at each task's start time. Install the app (browser menu, Add to Home screen), allow notifications, and set the browser's battery use to Unrestricted. When the app is fully closed, delivery depends on your phone and browser and can be delayed or skipped.</small><div class="f" style="margin-top:10px"><button class="pr" onclick="alerts()">Enable alerts</button><button onclick="testAlert()">Send test alert</button>${ipEv?'<button class="w" onclick="installApp()">Install app</button>':''}</div></div></div>
<button class="fab" onclick="edT()" aria-label="Add task">+</button>`;
o.style.display='block';const t=$('#tl');if(t)t.scrollTop=st!=null?st:Math.max(0,(new Date().getHours()-1)*HH)}
function shM(n){const d=pd(sd),y=d.getFullYear(),m=d.getMonth()+n,dim=new Date(y,m+1,0).getDate();sd=dk(new Date(y,m,Math.min(d.getDate(),dim)));renderSet()}
function shD(n){const d=pd(sd);d.setDate(d.getDate()+n);sd=dk(d);renderSet()}
function addAt(e){const r=e.currentTarget.getBoundingClientRect();edT(null,Math.min(23,Math.floor((e.clientY-r.top)/HH)))}
function edT(id,h){const t=id?S.tasks.find(x=>x.id===id):null,p=x=>String(x).padStart(2,'0'),hh=h==null?8:h;ed={id};
const rep=t?(t.core?'core':t.on?'none':t.days.length===7?'daily':'days'):'none',days=t?t.days:[pd(sd).getDay()],ok=t&&sd===dk()&&(t.core?quests(new Date()).some(q=>q.id===t.id):sched(new Date()).some(q=>q.id===t.id));
const m=$('#md');m.style.display='flex';
m.innerHTML=`<div class="p"><h2>[${t?'EDIT':'NEW'} TASK]</h2><div class="f"><input id="nt" class="w" placeholder="Task name" value="${t?esc(t.title):''}"><input id="nn" class="w" placeholder="Note (optional), e.g. 20 push-ups" value="${t&&t.note?esc(t.note):''}">
<label><small>Start</small>${tBtn('ns',t?t.start:p(hh)+':00')}</label><label><small>End</small>${tBtn('ne',t?t.end:hh>=23?'23:59':p(hh+1)+':00')}</label>
${sel('na','Attribute',S.attrs.map(a=>({v:a.n,l:a.n,c:col(a.n)})),t?t.attr:(S.attrs[0]||{}).n)}
${sel('nst','Raises stat',[{v:'STR',l:'Raises Strength'},{v:'INT',l:'Raises Intelligence'},{v:'SEN',l:'Raises Sense'},{v:'CHA',l:'Raises Charm'},{v:'',l:'Raises no stat'}],t?t.stat:'INT')}${sel('nr','Repeat',[{v:'none',l:sd===dk()?'Only today':'Only on '+dfm(sd)},{v:'daily',l:'Every day'},{v:'days',l:'Selected days of the week'},{v:'core',l:'Daily quest (every day, must complete)'}],rep)}
<div class="w dys" id="dy">${DN.map((x,i)=>`<label><input type="checkbox" class="dd" value="${i}" ${days.includes(i)?'checked':''}> ${x}</label>`).join('')}</div>
<button class="pr w" onclick="saveT()">Save</button>${ok?`<button class="w" onclick="tog('${t.id}');closeMd()">${(S.done[sd]||[]).includes(t.id)?'Mark not done':'Mark complete'}</button>`:''}${t?`<button class="x w" onclick="delT('${t.id}')">Delete task</button>`:''}<button class="w" onclick="closeMd()">Cancel</button></div></div>`;
rp()}
function rp(){$('#dy').style.display=$('#nr').dataset.v==='days'?'flex':'none'}
function closeMd(){$('#md').style.display='none'}
function saveT(){const n=$('#nt').value.trim();if(!n)return toast('[ERROR] Task name required');const r=$('#nr').dataset.v,d=[...document.querySelectorAll('.dd:checked')].map(x=>+x.value);
if(r==='days'&&!d.length)return toast('[ERROR] Select at least one day');
if($('#ne').dataset.v<=$('#ns').dataset.v)return toast('[ERROR] End time must be after start time');
const t=ed.id?S.tasks.find(x=>x.id===ed.id):null,a=$('#na').dataset.v,o={title:n,start:$('#ns').dataset.v,end:$('#ne').dataset.v,attr:a,core:r==='core',stat:$('#nst').dataset.v,note:$('#nn').value.trim(),days:r==='days'?d:[0,1,2,3,4,5,6]};
if(r==='none')o.on=(t&&t.on)||sd;else delete (t||{}).on;
if(t)Object.assign(t,o);else S.tasks.push(Object.assign(o,{id:'t'+Date.now()}));
save();closeMd();toast('[TASK REGISTERED]');render()}
let cb;function ask(m,f){cb=f;const o=$('#md');o.style.display='flex';o.innerHTML=`<div class="p pen"><h2>[CONFIRM]</h2><p style="margin:0 0 12px">${m}</p><div class="f"><button class="x" onclick="closeMd();cb()">Delete</button><button onclick="closeMd()">Cancel</button></div></div>`}
function delT(id){const t=S.tasks.find(x=>x.id===id);if(t)ask(`Delete task “${esc(t.title)}”?`,()=>{S.tasks=S.tasks.filter(x=>x.id!==id);save();render()})}
function saveP(){S.name=$('#pn').value.trim()||S.name;S.title=$('#pt').value.trim()||S.title;S.q=$('#pq').value.trim()||S.q;S.penalty=$('#pp').value.trim()||S.penalty;S.cur=($('#pc').value.trim()||S.cur).slice(0,3);save();toast('[PROFILE SAVED]');render()}
function mon(s){const v=parseFloat($('#ma').value);if(!(v>0))return toast('[ERROR] Enter a valid amount');const n=(S.money||0)+s*v;if(n<0)return toast('[ERROR] Balance cannot go below '+rs(0));S.money=n;save();toast('<b>[MONEY]</b> '+(s>0?'+':'−')+rs(v)+' · Balance '+rs(n));render()}
function addA(){const n=$('#aa').value.trim();if(n&&!S.attrs.some(a=>a.n===n)){S.attrs.push({n,v:0,c:$('#ac').dataset.v});save();render()}}
function delA(i){if(S.attrs.length<=3)return toast('[ERROR] Minimum 3 attributes');const a=S.attrs[i];ask(`Delete attribute “${esc(a.n)}”? Its score of ${a.v} will be lost.`,()=>{S.attrs.splice(i,1);selA=-1;save();render()})}
function swipe(el,fn){let x,y,g;el.addEventListener('touchstart',e=>{x=e.touches[0].clientX;y=e.touches[0].clientY;g=e.target},{passive:true});el.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-x,dy=e.changedTouches[0].clientY-y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)fn(dx<0?1:-1,g)},{passive:true})}
swipe(document,(d,g)=>{if(so||$('#md').style.display==='flex'||(zm>1&&g.closest('.tl')))return;const T=['quests','log','status'],i=T.indexOf(tab)+d;if(T[i])go(T[i])});
swipe($('#set'),(d,g)=>{if(g.closest('#tl')){if(zm===1)shD(d)}else if(g.closest('.cg'))shM(d)});
load();applyT();roll();render();anim($('#v'));initSW();setInterval(()=>{tick();remind()},1000);
let hid=0;document.addEventListener('visibilitychange',()=>{if(document.hidden){hid=Date.now();return}roll();if(Date.now()-hid>3000){tab='quests';so=0;selA=-1;closeMd();renderSet();render();anim($('#v'))}else render()});
