/* Linn Selekt DSM promotion — public site (Advance Audio / Advance One) */
(function(){
const $=id=>document.getElementById(id);
const R=window.SITE.routes, MAP=window.SITE.map;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let cur='AUD', curLocked=false;
const money=(n,c)=>{c=c||cur;return (c==='NZD'?'NZ$':'$')+Math.round(n).toLocaleString('en-AU')};
const route=(hub,card)=>R.find(r=>r.chassis===hub&&r.card===card);
const DACN={'Standard DAC':'Standard DAC','Katalyst DAC':'Katalyst DAC','Organik Stereo DAC':'Organik DAC','Dual Mono Organik':'Dual Mono Organik'};
const HUBN={'Selekt Classic':'Selekt DSM Classic','Selekt Edition Hub':'Selekt DSM Edition'};
const USEN={'Line Out':'Streamer','Power Out':'Integrated amplifier'};
const promo=s=>s.mono?s.dsm[cur]+s.upg[cur]:s.pay[cur];

/* ---------- currency: URL > toggle > device ---------- */
const qc=(new URLSearchParams(location.search).get('cur')||'').toUpperCase();
function fromDevice(){try{const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';if(/^Pacific\/(Auckland|Chatham)$/i.test(tz))return'NZD';
  for(const l of [navigator.language].concat(navigator.languages||[])){if(/-NZ$/i.test(l||''))return'NZD';if(/-AU$/i.test(l||''))return'AUD'}}catch(e){}return null}
if(qc==='AUD'||qc==='NZD'){cur=qc;curLocked=true}else{cur=fromDevice()||'AUD'}
function setCur(c){
  cur=c;document.documentElement.setAttribute('data-cur',c);
  document.querySelectorAll('.seg button').forEach(b=>{const on=b.dataset.cur===c;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  $('footTxt').innerHTML=c==='NZD'
    ?'Linn in New Zealand is supported by Advance One · <a href="https://www.advanceone.co.nz">advanceone.co.nz</a>. Prices are New Zealand recommended retail in NZD, including GST.'
    :'Linn in Australia is supported by Advance Audio · <a href="https://www.advanceaudio.com.au">advanceaudio.com.au</a>. Prices are Australian recommended retail in AUD, including GST.';
  renderTokens();renderBuild();
}
document.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{curLocked=true;setCur(b.dataset.cur)});

/* ---------- offer ladder ---------- */
(function(){
  const L=[['Standard DAC','Katalyst DAC'],['Katalyst DAC','Organik DAC'],['Stereo Organik DAC','Dual Mono Organik*']];
  $('ladder').innerHTML=L.map((l,i)=>`<div class="rung r d${i+1}"><div class="n">0${i+1}</div><div class="buy">You buy</div><div class="from">${l[0]}</div><div class="arrow">&#8595;</div><div class="buy">You receive</div><div class="to"><em>${l[1]}</em></div>
    ${i===2?'<div class="foot">*Streamer (Line Out) systems only. You pay the difference to change the stereo Line Out cartridge for two Mono Line Out cartridges.</div>':''}</div>`).join('');
})();

function renderTokens(){
  const all=R.flatMap(r=>r.steps.map(s=>s.save[cur]));
  document.querySelectorAll('[data-max]').forEach(e=>e.textContent=money(Math.max(...all)));
  document.querySelectorAll('[data-from]').forEach(e=>{const h=e.dataset.from;const card=st.use||'Line Out';e.textContent=money(route(h,card).steps[0].pay[cur])});
}

/* ---------- builder ---------- */
const st={step:0,use:null,hub:null};
const panels=[$('p0'),$('p1'),$('p2')];
function go(n){
  if(n===1&&!st.use)return; if(n===2&&!(st.use&&st.hub))return;
  st.step=n;panels.forEach((p,i)=>{p.hidden=i!==n;if(i===n)p.classList.add('r')});
  renderBuild();
}
document.querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>{st.use=b.dataset.use;go(1);scrollToBuild()});
document.querySelectorAll('[data-hub]').forEach(b=>b.onclick=()=>{st.hub=b.dataset.hub;go(2);scrollToBuild()});
document.querySelectorAll('#stepper button').forEach(b=>b.onclick=()=>go(+b.dataset.go));
$('restart').onclick=()=>{st.use=null;st.hub=null;go(0);scrollToBuild()};
function scrollToBuild(){const t=$('build'),deck=$('deck');if(deck.scrollTop>t.offsetTop+40||deck.scrollTop<t.offsetTop-40)deck.scrollTo({top:t.offsetTop,behavior:'smooth'})}

function renderBuild(){
  document.querySelectorAll('[data-use]').forEach(b=>b.classList.toggle('sel',b.dataset.use===st.use));
  document.querySelectorAll('[data-hub]').forEach(b=>b.classList.toggle('sel',b.dataset.hub===st.hub));
  document.querySelectorAll('[data-from]').forEach(e=>{e.textContent=money(route(e.dataset.from,st.use||'Line Out').steps[0].pay[cur])});
  document.querySelectorAll('#stepper button').forEach((b,i)=>{
    b.classList.toggle('on',i===st.step);
    b.classList.toggle('done',i<st.step||(i===0&&st.use&&st.step!==0)||(i===1&&st.hub&&st.step!==1));
    b.disabled=(i===1&&!st.use)||(i===2&&!(st.use&&st.hub));
    if(i===st.step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');
  });
  $('sv0').textContent=st.use?'· '+USEN[st.use]:'';
  $('sv1').textContent=st.hub?'· '+(st.hub==='Selekt Classic'?'Classic':'Edition'):'';
  if(!(st.use&&st.hub))return;
  const r=route(st.hub,st.use);
  $('resTitle').innerHTML=`Your ${esc(HUBN[st.hub])} <em>upgrade options.</em>`;
  $('resSub').textContent=`${st.use==='Line Out'?'As a streamer into your own amplifier':'As an integrated amplifier with streaming'}. Pick the DAC you’d buy, and here’s the next level you’ll receive, at its promotion price.`;
  const res=$('res');res.classList.toggle('two',r.steps.length===2);
  res.innerHTML=r.steps.map((s,i)=>`<div class="rcard"><div class="n">Option 0${i+1}</div>
    <div class="buy">You buy</div><div class="from">${DACN[s.from]}</div>
    <div class="buy">You receive</div><div class="to"><em>${DACN[s.to]}</em></div>
    <div class="price"><small>Promotion price</small><b>${money(promo(s))}</b><div class="norm">Normally ${money(s.get[cur])}</div></div>
    ${s.mono?`<div class="note">Includes ${money(s.upg[cur])} to change the stereo Line Out cartridge for two Mono Line Out cartridges.</div>`:''}</div>`).join('');
  $('resFine').textContent=`Prices are ${cur==='NZD'?'New Zealand recommended retail in NZD, including GST':'Australian recommended retail in AUD, including GST'}, for a complete ${HUBN[st.hub]} with ${st.use==='Line Out'?'a stereo Line Out':'a stereo Power Out'} cartridge and the DAC shown. The normal price is what the system you receive usually costs. Terms and Conditions apply, please speak to your Linn specialist for more information.`;
}

/* ---------- dealers ---------- */
const D={
  NSW:[['Audio Connection','02 9561 0788','https://audioconnection.com.au','515 Parramatta Rd, Leichhardt'],
       ['Audio Solutions','02 9317 3330','https://audiosolutions.net.au','1195 Botany Rd, Mascot'],
       ['Len Wallis Audio','02 9427 6755','https://lenwallisaudio.com','64 Burns Bay Rd, Lane Cove'],
       ['Audio Genesis','02 9566 4621','https://www.audiogenesis.com.au','Shop 4, 1 Murray St, Pyrmont'],
       ['Sydney Hi-Fi Castle Hill','02 9899 9079','https://www.sydneyhificastlehill.com.au','7/19 Victoria Ave, Castle Hill']],
  VIC:[['Audio Trends','03 9874 8233','https://www.audiotrends.com.au','10 Argent Pl, Ringwood'],
       ['Sound Gallery','03 9578 8658','https://soundgallery.com.au','225–229 Koornang Rd, Carnegie'],
       ['Tivoli Hi-Fi','1800 848 654','https://tivolihifi.com.au','155–157 Camberwell Rd, Hawthorn East']],
  QLD:[['Todds Hi-Fi','07 3907 7777','https://www.todds.com.au','1/308 New Cleveland Rd, Tingalpa'],
       ['Trimira Audio','0452 088 986','https://trimira.com.au','202/14 Trafalgar St, Woolloongabba'],
       ['GC Hi-Fi','0418 691 294','https://gc-hifi.com.au','Arundel, Gold Coast · by appointment']],
  SA:[['HiFi Guru','08 8122 5652','https://hifiguru.com.au','58 King William St, Kent Town'],
      ['Limbik','0419 904 237','https://www.limbik.com.au','Adelaide · demonstrations by appointment']],
  WA:[['Frank Prowse Hi-Fi','08 9386 8384','https://www.frankprowsehifi.com.au','Shop 1A, 174 Stirling Hwy, Nedlands']],
  NZN:[['Soundlab','09 271 4711','https://www.soundlab.co.nz','5E/2 Bishop Browne Pl, Flat Bush, Auckland'],
       ['The Hi Fi Store','09 966 1020','https://www.thehifistore.co.nz','1/43 Apollo Dr, Rosedale, Auckland · by appointment']],
  NZS:[['HiFi Projects','0800 83 93 43','https://hifiprojects.co.nz','19 Pollock St, Alexandra, Central Otago'],
       ['New Zealand TV & HiFi','03 928 1161','https://www.nzhifi.nz','7 Battersea St, Sydenham, Christchurch']]
};
const NAME={NSW:'New South Wales',VIC:'Victoria',QLD:'Queensland',SA:'South Australia',WA:'Western Australia',TAS:'Tasmania',NT:'Northern Territory',ACT:'Australian Capital Territory',NZN:'North Island',NZS:'South Island'};
const SHORT={NSW:'NSW',VIC:'VIC',QLD:'QLD',SA:'SA',WA:'WA',TAS:'TAS',NT:'NT',ACT:'ACT',NZN:'North Island',NZS:'South Island'};
const NEAR={ACT:'NSW',TAS:'VIC',NT:'SA'};
const ORDER=['NSW','ACT','VIC','QLD','SA','WA','TAS','NT','NZN','NZS'];
let sel=null;
(function buildMap(){
  const svg=$('map');let h='';
  ORDER.forEach(k=>{const m=MAP[k];h+=`<path class="st${D[k]?' has':''}" data-k="${k}" d="${m.d}" tabindex="0" role="button" aria-label="${NAME[k]}${k[0]==='N'&&k[1]==='Z'?', New Zealand':''}"><title>${NAME[k]}</title></path>`});
  ORDER.forEach(k=>{let [x,y]=MAP[k].c;
    if(k==='ACT'){h+=`<line class="ld" x1="${x}" y1="${y}" x2="${x+38}" y2="${y+10}"/>`;x+=56;y+=14}
    else if(k==='TAS'){y+=4}
    const lab=k==='NZN'?'NORTH':k==='NZS'?'SOUTH':k;
    h+=`<text class="lb${k==='ACT'?' sm':''}" data-l="${k}" x="${x}" y="${y+4}">${lab}</text>`});
  h+=`<text class="cap" x="250" y="505">AUSTRALIA</text><text class="cap" x="740" y="330">NEW ZEALAND</text>`;
  svg.innerHTML=h;
  svg.querySelectorAll('.st').forEach(p=>{p.onclick=()=>pick(p.dataset.k);p.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(p.dataset.k)}}});
  $('chips').innerHTML=ORDER.map(k=>`<button type="button" data-k="${k}" aria-pressed="false">${SHORT[k]}</button>`).join('');
  $('chips').querySelectorAll('button').forEach(b=>b.onclick=()=>pick(b.dataset.k));
})();
function dcard(d){const tel=d[1].replace(/[^\d+]/g,'');const host=d[2].replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'');
  return `<div class="dcard"><b>${esc(d[0])}</b><div class="ad">${esc(d[3])}</div><div class="acts"><a class="ph" href="tel:${tel}">${esc(d[1])}</a><a href="${d[2]}" target="_blank" rel="noopener">${esc(host)} &#8599;</a></div></div>`}
function pick(k,scroll){
  sel=k;
  $('map').querySelectorAll('.st').forEach(p=>p.classList.toggle('sel',p.dataset.k===k));
  $('map').querySelectorAll('.lb').forEach(t=>t.classList.toggle('sel',t.dataset.l===k));
  $('chips').querySelectorAll('button').forEach(b=>{const on=b.dataset.k===k;b.classList.toggle('sel',on);b.setAttribute('aria-pressed',on)});
  const region=k.startsWith('NZ')?NAME[k]+', New Zealand':NAME[k];
  let h=`<div class="eyebrow">Linn dealers</div><h3>${esc(region)}</h3>`;
  if(D[k]){h+=`<p class="hint">Call ahead to book a demonstration at a time that suits you.</p><div class="dcards">${D[k].map(dcard).join('')}</div>`}
  else{const n=NEAR[k];h+=`<div class="empty">There isn’t a Linn dealer in ${esc(NAME[k])} for this promotion yet. Your nearest Linn specialists are in ${esc(NAME[n])}, and they’re happy to help by phone.</div><div class="dcards">${D[n].map(dcard).join('')}</div>`}
  $('list').innerHTML=h;
  if(window.innerWidth<980&&scroll!==false){const deck=$('deck'),l=$('list');deck.scrollTo({top:l.getBoundingClientRect().top+deck.scrollTop-80,behavior:'smooth'})}
}
function emptyList(){$('list').innerHTML=`<div class="eyebrow">Linn dealers</div><h3>Where are you?</h3><p class="hint">Select your state on the map, or your island in New Zealand, to see local Linn dealers with their phone numbers and websites.</p>`}
emptyList();

/* ---------- navigation ---------- */
const deck=$('deck'), slides=[...document.querySelectorAll('.slide')], prog=$('progress'), bar=$('bar');
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.08});
slides.forEach(s=>io.observe(s));
function onScroll(){
  const mid=deck.scrollTop+window.innerHeight*.35;let c=0;
  slides.forEach((s,i)=>{if(s.offsetTop<=mid)c=i});
  const s=slides[c];
  document.body.classList.toggle('on-paper',s.classList.contains('paper'));
  bar.classList.toggle('solid',deck.scrollTop>40);
  document.querySelectorAll('.bar nav a').forEach(a=>a.classList.toggle('active',a.dataset.sec===s.id));
  prog.style.width=Math.min(100,(deck.scrollTop/(deck.scrollHeight-deck.clientHeight||1))*100)+'%';
}
deck.addEventListener('scroll',onScroll,{passive:true});
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();deck.scrollTo({top:t.offsetTop,behavior:'smooth'})}});

setCur(cur);go(0);onScroll();
if(cur==='NZD'&&!sel){/* gentle default for NZ visitors: nothing preselected */}
})();
