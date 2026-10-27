const $=s=>document.querySelector(s);
const NAMES=["Do","Do♯","Ré","Ré♯","Mi","Fa","Fa♯","Sol","Sol♯","La","La♯","Si"];
const SCALES={"Dorien":[0,2,3,5,7,9,10],"Mineure naturelle":[0,2,3,5,7,8,10],"Majeure":[0,2,4,5,7,9,11],"Pentatonique mineure":[0,3,5,7,10],"Pentatonique majeure":[0,2,4,7,9]};
const INST={piano:{n:"Piano",w:"triangle",a:.005,d:.9,f:6000},synth:{n:"Synthé",w:"sawtooth",a:.01,d:.35,f:2500,v:.16},nappe:{n:"Nappe",w:"sawtooth",a:.25,d:1.4,f:1400,v:.1,det:7},basse:{n:"Basse",w:"sine",a:.01,d:.45,f:900,v:.5},pluck:{n:"Pluck",w:"square",a:.003,d:.18,f:3500,v:.12},cloche:{n:"Cloche",w:"sine",a:.003,d:1.2,f:8000,h:1},orgue:{n:"Orgue",w:"square",a:.02,d:.8,f:1800,v:.1},cordes:{n:"Cordes",w:"sawtooth",a:.35,d:1.6,f:2200,v:.09,det:12},voix:{n:"Voix",w:"triangle",a:.2,d:1.1,f:1100,v:.28},flute:{n:"Flûte",w:"sine",a:.08,d:.6,f:5000,v:.3},cuivres:{n:"Cuivres",w:"sawtooth",a:.07,d:.5,f:1800,v:.13},marimba:{n:"Marimba",w:"sine",a:.002,d:.35,f:7000,v:.4},kalimba:{n:"Kalimba",w:"sine",a:.002,d:.9,f:9000,v:.3,h:1},epiano:{n:"Piano électrique",w:"sine",a:.004,d:1.1,f:5000,v:.3,h:1},subbass:{n:"Sub",w:"sine",a:.02,d:1.2,f:300,v:.6},acid:{n:"Basse acide",w:"sawtooth",a:.005,d:.25,f:700,v:.2},harpe:{n:"Harpe",w:"triangle",a:.003,d:1.4,f:7000,v:.3},guitare:{n:"Guitare",w:"triangle",a:.003,d:.6,f:3000,v:.3}};
const KITV={classique:{n:"Kit classique",m:1,l:20000,dm:1},electro:{n:"Kit électro",m:1.4,l:20000,dm:.8},lofi:{n:"Kit lo-fi",m:.8,l:2500,dm:1.3}};
const DR=[["Grosse caisse","k",160,45,.4,.9],["Kick court","k",120,50,.2,.8],["Caisse claire","n",1900,0,.2,.5],["Rimshot","k",420,300,.06,.5],["Clap","n",1200,0,.14,.55],["Snap","n",3000,0,.05,.4],["Charley fermé","h",7000,0,.05,.3],["Charley ouvert","h",7000,0,.3,.3],["Shaker","h",5000,0,.09,.22],["Tom grave","k",130,70,.35,.8],["Tom moyen","k",190,110,.3,.8],["Tom aigu","k",260,160,.25,.8],["Cymbale","h",4500,0,1.1,.28],["Ride","h",6000,0,.6,.22],["Cloche vache","c",560,0,.3,.3],["Conga","k",330,230,.18,.7]];
const R=16,C=64,GUT=92;
const grid=()=>Array.from({length:R},()=>Array(C).fill(0));
const st={bpm:96,root:4,scale:"Dorien",active:0,playing:false,rv:30,ec:25,mv:80,
 tracks:[
  {name:"Batterie",color:"#C9C2B2",kit:1,vol:85,mute:false,oct:0,g:grid()},
  {name:"Percussions",color:"#D9A45B",kit:1,vol:60,mute:false,oct:0,g:grid()},
  {name:"Basse",color:"#5E8F9A",inst:"basse",vol:80,mute:false,oct:-12,g:grid()},
  {name:"Accords",color:"#9A86C9",inst:"nappe",vol:55,mute:false,oct:0,g:grid()},
  {name:"Arpège",color:"#7FA88A",inst:"pluck",vol:55,mute:false,oct:12,g:grid()},
  {name:"Mélodie",color:"#E8706A",inst:"synth",vol:65,mute:false,oct:12,g:grid()},
  {name:"Cordes",color:"#6FA8D6",inst:"cordes",vol:45,mute:false,oct:0,g:grid()},
  {name:"Voix",color:"#C98BB9",inst:"voix",vol:50,mute:false,oct:12,g:grid()}]};
const put=(i,r,s)=>st.tracks[i].g[r][s]=1;
for(let s=0;s<C;s+=4){put(0,0,s);put(0,6,s+2)}
for(let s=4;s<C;s+=8)put(0,2,s);
for(let s=0;s<C;s+=2)put(1,8,s);
for(let b=0;b<C;b+=16){[0,0,2,3].forEach((r,k)=>put(2,r,b+k*4));[0,2,4].forEach(r=>put(3,r,b));[3,5,7].forEach(r=>put(3,r,b+8))}
for(let s=0;s<C;s+=2)put(4,[2,4,6,4][(s/2)%4],s);
[[0,7],[2,9],[4,8],[6,7],[8,10],[10,9],[12,7],[14,5],[16,7],[18,9],[20,10],[22,9],[24,7],[26,5],[28,4],[30,5]].forEach(([s,r])=>{put(5,r,s);put(5,r>6?r-1:r+1,s+32)});
for(let b=0;b<C;b+=16){[4,6,8].forEach(r=>put(6,r,b));put(7,9,b+6);put(7,8,b+10);put(7,7,b+12)}

const midi=(r,t)=>{const sc=SCALES[st.scale],n=sc.length;return 48+st.root+t.oct+12*Math.floor(r/n)+sc[r%n]};

/* Dessin */
function draw(cx,W,H,g0,act,ps){
  cx.clearRect(0,0,W,H);
  const sc=SCALES[st.scale],n=sc.length,cw=(W-g0)/C,ch=H/R;
  for(let r=0;r<R;r++){
    const y=(R-1-r)*ch,root=r%n===0&&!(act>=0&&st.tracks[act].kit);
    cx.fillStyle=root?"#262932":(r%2?"#1C1E24":"#1F2127");
    cx.fillRect(g0,y,W-g0,ch);
    if(g0){
      cx.fillStyle=root?"#2C2F38":"#1A1B20";cx.fillRect(0,y,g0-2,ch);
      cx.fillStyle=root?"#E6E7EA":"#8B8F9A";cx.font="11px Inter,system-ui,sans-serif";cx.textBaseline="middle";
      const ta=st.tracks[Math.max(act,0)];
      if(ta.kit)cx.fillText(DR[r][0],10,y+ch/2);else{const m=midi(r,ta);cx.fillText(NAMES[m%12]+(Math.floor(m/12)-1),10,y+ch/2)}
    }
  }
  for(let c=0;c<=C;c++){
    const x=Math.round(g0+c*cw)+.5;
    cx.strokeStyle=c%16===0?"#4A4E5A":c%4===0?"#343742":"#2A2C34";
    cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke();
  }
  const order=st.tracks.map((_,i)=>i).sort((a,b)=>(a===act)-(b===act));
  for(const i of order){
    const t=st.tracks[i];cx.globalAlpha=(act<0||i===act)?1:.3;cx.fillStyle=t.color;
    for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(t.g[r][c]){
      cx.beginPath();cx.roundRect(g0+c*cw+1,(R-1-r)*ch+1,cw-2,ch-2,3);cx.fill();
    }
  }
  cx.globalAlpha=1;
  if(ps>=0){
    cx.fillStyle="rgba(232,112,106,.10)";cx.fillRect(g0+ps*cw,0,cw,H);
    cx.fillStyle="#E8706A";cx.fillRect(g0+ps*cw,0,2,H);
  }
}
function size(cv){
  const b=cv.parentElement.getBoundingClientRect(),d=devicePixelRatio||1;
  cv.width=b.width*d;cv.height=b.height*d;cv.style.width=b.width+"px";cv.style.height=b.height+"px";
  const cx=cv.getContext("2d");cx.setTransform(d,0,0,d,0,0);return[cx,b.width,b.height];
}
const roll=$("#roll"),pv=$("#pv");
let rc,rw,rh,pc,pw,ph,playStep=-1;
function render(){
  if(!$("#studio").hidden&&rc)draw(rc,rw,rh,GUT,st.active,playStep);
  else if(!$("#home").hidden&&pc)draw(pc,pw,ph,0,-1,-1);
}
function fit(){
  if(!$("#studio").hidden)[rc,rw,rh]=size(roll);
  else [pc,pw,ph]=size(pv);
  render();
}
addEventListener("resize",fit);

/* Navigation */
function route(){
  const s=location.hash==="#studio";
  $("#home").hidden=s;$("#studio").hidden=!s;
  $("#n1").classList.toggle("on",!s);$("#n2").classList.toggle("on",s);
  fit();
}
addEventListener("hashchange",route);

/* Audio */
let ac,bus,rvG,ecG,delay,mG,nb,tg=[];
function makeIR(){
  const len=ac.sampleRate*2,b=ac.createBuffer(2,len,ac.sampleRate);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3)}
  return b;
}
function initAudio(){
  if(ac)return;
  ac=new (window.AudioContext||window.webkitAudioContext)();
  mG=ac.createGain();mG.connect(ac.destination);
  nb=ac.createBuffer(1,ac.sampleRate*1.5,ac.sampleRate);{const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  bus=ac.createGain();bus.connect(mG);
  const conv=ac.createConvolver();conv.buffer=makeIR();rvG=ac.createGain();
  bus.connect(conv);conv.connect(rvG);rvG.connect(mG);
  delay=ac.createDelay(2);const fb=ac.createGain();fb.gain.value=.38;ecG=ac.createGain();
  bus.connect(delay);delay.connect(fb);fb.connect(delay);delay.connect(ecG);ecG.connect(mG);
  st.tracks.forEach((t,i)=>{tg[i]=ac.createGain();tg[i].connect(bus)});
  applyMix();
}
function applyMix(){
  if(!ac)return;
  mG.gain.value=st.mv/100;rvG.gain.value=st.rv/100*.7;ecG.gain.value=st.ec/100*.5;
  delay.delayTime.value=60/st.bpm*.75;
  st.tracks.forEach((t,i)=>tg[i].gain.value=t.mute?0:t.vol/100);
}
function drum(i,r,time){
  const K=KITV[st.tracks[i].kv||"classique"],[,k,a0,a1,a2,v]=DR[r],f0=a0*K.m,f1=a1*K.m,d=a2*K.dm,g=ac.createGain(),lp=ac.createBiquadFilter();
  lp.type="lowpass";lp.frequency.value=K.l;
  g.gain.setValueAtTime(v*.8,time);g.gain.exponentialRampToValueAtTime(.001,time+d);g.connect(lp);lp.connect(tg[i]);
  if(k==="k"||k==="c"){
    const o=ac.createOscillator();o.type=k==="c"?"square":"sine";o.frequency.setValueAtTime(f0,time);
    if(k==="k")o.frequency.exponentialRampToValueAtTime(f1,time+d);
    o.connect(g);o.start(time);o.stop(time+d+.02);
  }else{
    const s=ac.createBufferSource(),f=ac.createBiquadFilter();s.buffer=nb;
    f.type=k==="n"?"bandpass":"highpass";f.frequency.value=f0;
    s.connect(f);f.connect(g);s.start(time);s.stop(time+d+.02);
  }
}
function note(i,r,time){
  const t=st.tracks[i];
  if(t.kit){drum(i,r,time);return}
  const p=INST[t.inst],o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter(),fr=440*Math.pow(2,(midi(r,t)-69)/12),pk=p.v||.3;
  o.type=p.w;o.frequency.value=fr;if(p.det)o.detune.value=p.det;
  f.type="lowpass";f.frequency.value=p.f;
  g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(pk,time+p.a);
  g.gain.exponentialRampToValueAtTime(.001,time+p.a+p.d);
  o.connect(f);f.connect(g);g.connect(tg[i]);o.start(time);o.stop(time+p.a+p.d+.05);
  if(p.h){const o2=ac.createOscillator(),g2=ac.createGain();o2.frequency.value=fr*2.76;g2.gain.setValueAtTime(pk*.3,time);g2.gain.exponentialRampToValueAtTime(.001,time+p.d*.5);o2.connect(g2);g2.connect(tg[i]);o2.start(time);o2.stop(time+p.d)}
}

/* Lecture */
let step=0,next=0,timer=null,q=[];
function tick(){
  const sd=60/st.bpm/4;
  while(next<ac.currentTime+.15){
    st.tracks.forEach((t,i)=>{for(let r=0;r<R;r++)if(t.g[r][step])note(i,r,next)});
    q.push({s:step,t:next});next+=sd;step=(step+1)%C;
  }
}
function anim(){
  if(!st.playing)return;
  while(q.length&&q[0].t<=ac.currentTime)playStep=q.shift().s;
  render();requestAnimationFrame(anim);
}
function toggle(){
  initAudio();ac.resume();
  st.playing=!st.playing;
  $("#play").textContent=st.playing?"Arrêter":"Lire";
  if(st.playing){step=0;q=[];next=ac.currentTime+.05;timer=setInterval(tick,25);anim()}
  else{clearInterval(timer);playStep=-1;render()}
}
$("#play").onclick=toggle;
addEventListener("keydown",e=>{
  if(e.code==="Space"&&!$("#studio").hidden&&!/INPUT|SELECT/.test(e.target.tagName)){e.preventDefault();toggle()}
});

/* Édition de la grille */
let paint=null;
function cellAt(e){
  const b=roll.getBoundingClientRect();
  const c=Math.floor((e.clientX-b.left-GUT)/((rw-GUT)/C)),r=R-1-Math.floor((e.clientY-b.top)/(rh/R));
  return(c>=0&&c<C&&r>=0&&r<R)?[c,r]:null;
}
function apply([c,r]){
  const g=st.tracks[st.active].g;
  if(g[r][c]===paint)return;
  g[r][c]=paint;
  if(paint){initAudio();ac.resume();note(st.active,r,ac.currentTime,.35)}
  render();
}
roll.onpointerdown=e=>{
  const k=cellAt(e);if(!k)return;
  roll.setPointerCapture(e.pointerId);
  paint=st.tracks[st.active].g[k[1]][k[0]]?0:1;apply(k);
};
roll.onpointermove=e=>{if(paint===null)return;const k=cellAt(e);if(k)apply(k)};
roll.onpointerup=roll.onpointercancel=()=>paint=null;

/* Contrôles */
NAMES.forEach((n,i)=>$("#root").add(new Option(n,i,false,i===st.root)));
Object.keys(SCALES).forEach(s=>$("#scale").add(new Option(s,s,false,s===st.scale)));
$("#root").onchange=e=>{st.root=+e.target.value;render()};
$("#scale").onchange=e=>{st.scale=e.target.value;render()};
$("#bpm").oninput=e=>{st.bpm=+e.target.value;$("#bpmv").textContent=st.bpm;applyMix()};
$("#clear").onclick=()=>{st.tracks[st.active].g=grid();render()};
$("#rv").oninput=e=>{st.rv=+e.target.value;applyMix()};
$("#ec").oninput=e=>{st.ec=+e.target.value;applyMix()};
$("#mv").oninput=e=>{st.mv=+e.target.value;applyMix()};

function buildTracks(){
  $("#tracks").innerHTML=st.tracks.map((t,i)=>`
  <div class="trk${i===st.active?" on":""}" data-i="${i}" style="--c:${t.color}">
    <div class="th"><span class="dot"></span><b>${t.name}</b><button class="mt" aria-pressed="${t.mute}">Muet</button></div>
    <div class="row"><label for="v${i}">Volume</label><input type="range" id="v${i}" min="0" max="100" value="${t.vol}"></div>
    <div class="row"><label for="t${i}">Son</label><select id="t${i}">${Object.entries(t.kit?KITV:INST).map(([k,v])=>`<option value="${k}"${k===(t.kit?(t.kv||"classique"):t.inst)?" selected":""}>${v.n}</option>`).join("")}</select></div>
  </div>`).join("");
  document.querySelectorAll(".trk").forEach(el=>{
    const i=+el.dataset.i,t=st.tracks[i];
    el.addEventListener("pointerdown",()=>{
      if(st.active!==i){st.active=i;document.querySelectorAll(".trk").forEach(x=>x.classList.toggle("on",+x.dataset.i===i));render()}
    });
    el.querySelector(".mt").onclick=e=>{t.mute=!t.mute;e.target.setAttribute("aria-pressed",t.mute);applyMix()};
    el.querySelector("input").oninput=e=>{t.vol=+e.target.value;applyMix()};
    el.querySelector("select").onchange=e=>{if(t.kit)t.kv=e.target.value;else t.inst=e.target.value};
  });
}
buildTracks();
route();
