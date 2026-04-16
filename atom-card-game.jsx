const {useState,useEffect,useCallback,useRef} = React;

// ═══════════════════════════════════════════════════════════
// げんしモンスターバトル 🧪⚔️
// 原子モンスターを合体させて、ボスを倒せ！
// ═══════════════════════════════════════════════════════════

/* ── サウンドエンジン ─── */
const SE = (() => {
  let ctx=null, enabled=true;
  const gc = () => { if(!ctx) ctx=new(window.AudioContext||window.webkitAudioContext)(); if(ctx.state==="suspended")ctx.resume(); return ctx; };
  const p = fn => { if(!enabled)return; try{fn(gc());}catch(e){} };
  const tone = (c,type,f1,f2,dur,vol=0.12) => {
    const o=c.createOscillator(),g=c.createGain();
    o.type=type; o.frequency.setValueAtTime(f1,c.currentTime);
    if(f2) o.frequency.exponentialRampToValueAtTime(f2,c.currentTime+dur*0.6);
    g.gain.setValueAtTime(vol,c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+dur);
    o.connect(g).connect(c.destination); o.start(c.currentTime); o.stop(c.currentTime+dur);
  };
  return {
    setEnabled:v=>{enabled=v}, isEnabled:()=>enabled,
    tap: ()=>p(c=>tone(c,"sine",1000,null,0.05,0.05)),
    draw: ()=>p(c=>tone(c,"sine",800,1200,0.15,0.15)),
    select: ()=>p(c=>tone(c,"triangle",600,900,0.1,0.1)),
    deselect: ()=>p(c=>tone(c,"triangle",700,400,0.1,0.08)),
    fuse: pts=>p(c=>{const t=c.currentTime;const ns=pts>=15?[523,659,784,1047,1319]:pts>=9?[523,659,784,1047]:pts>=5?[523,659,784]:[523,659];ns.forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type=pts>=15?"square":"sine";o.frequency.setValueAtTime(f,t+i*0.12);g.gain.setValueAtTime(0.12,t+i*0.12);g.gain.exponentialRampToValueAtTime(0.001,t+i*0.12+0.4);o.connect(g).connect(c.destination);o.start(t+i*0.12);o.stop(t+i*0.12+0.4);});}),
    pass: ()=>p(c=>tone(c,"sine",400,300,0.25,0.08)),
    discard: ()=>p(c=>tone(c,"sawtooth",300,100,0.2,0.06)),
    attack: ()=>p(c=>{const t=c.currentTime;[200,250,150].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="sawtooth";o.frequency.setValueAtTime(f,t+i*0.08);g.gain.setValueAtTime(0.15,t+i*0.08);g.gain.exponentialRampToValueAtTime(0.001,t+i*0.08+0.15);o.connect(g).connect(c.destination);o.start(t+i*0.08);o.stop(t+i*0.08+0.15);});}),
    victory: ()=>p(c=>{const t=c.currentTime;[523,523,523,698,784,698,784,1047].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type=i>=6?"square":"sine";o.frequency.setValueAtTime(f,t+i*0.18);g.gain.setValueAtTime(0.15,t+i*0.18);g.gain.exponentialRampToValueAtTime(0.001,t+i*0.18+0.5);o.connect(g).connect(c.destination);o.start(t+i*0.18);o.stop(t+i*0.18+0.5);});}),
    lose: ()=>p(c=>{const t=c.currentTime;[392,349,330,294,262].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(f,t+i*0.3);g.gain.setValueAtTime(0.1,t+i*0.3);g.gain.exponentialRampToValueAtTime(0.001,t+i*0.3+0.6);o.connect(g).connect(c.destination);o.start(t+i*0.3);o.stop(t+i*0.3+0.6);});}),
    battleStart: ()=>p(c=>{const t=c.currentTime;[262,330,392,523].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="square";o.frequency.setValueAtTime(f,t+i*0.1);g.gain.setValueAtTime(0.1,t+i*0.1);g.gain.exponentialRampToValueAtTime(0.001,t+i*0.1+0.3);o.connect(g).connect(c.destination);o.start(t+i*0.1);o.stop(t+i*0.1+0.3);});})
  };
})();

/* ── ピクセルアートSVGレンダラー ─── */
const PixelArt = ({rows, palette, size=100}) => {
  const h=rows.length, w=Math.max(...rows.map(r=>r.length));
  const px=size/Math.max(w,h);
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{imageRendering:"pixelated"}}>
    {rows.map((row,y)=>row.split('').map((ch,x)=>{
      const col=palette[ch];
      return col?<rect key={`${x}-${y}`} x={x*px} y={y*px} width={px+.5} height={px+.5} fill={col}/>:null;
    }))}
  </svg>;
};

/* ── 原子データ（＝原子モンスター） ─── */
const ATOMS = [
  {s:"H", name:"ヒドロン",    color:"#4cff4c",bg:"#c8f7c5",tc:"#1b6e1b", emoji:"💧",n:18, atk:1, desc:"ちいさいけど元気！"},
  {s:"O", name:"オキシモン",  color:"#ff9100",bg:"#ffe0b2",tc:"#bf360c", emoji:"🌬️",n:14, atk:1, desc:"空気のモンスター"},
  {s:"C", name:"カーボン",    color:"#448aff",bg:"#bbdefb",tc:"#0d47a1", emoji:"✏️",n:9,  atk:2, desc:"かたい体がじまん"},
  {s:"N", name:"ニトロン",    color:"#d500f9",bg:"#e1bee7",tc:"#6a1b9a", emoji:"🌸",n:4,  atk:3, desc:"しずかだけどつよい"},
  {s:"S", name:"サルファン",  color:"#ffd600",bg:"#fff9c4",tc:"#f57f17", emoji:"⚡",n:4,  atk:3, desc:"くさいけどパワフル"},
  {s:"Cl",name:"クロリン",    color:"#00e5ff",bg:"#b2ebf2",tc:"#006064", emoji:"🫧",n:6,  atk:2, desc:"どくの泡をはく"},
  {s:"Na",name:"ナトリオン",  color:"#ff1744",bg:"#f8bbd0",tc:"#b71c1c", emoji:"🧂",n:6,  atk:2, desc:"水にふれると爆発！"},
  {s:"Cu",name:"コッパリン",  color:"#ff6e40",bg:"#ffccbc",tc:"#bf360c", emoji:"🪙",n:4,  atk:3, desc:"ピカピカのヨロイ"},
  {s:"Ag",name:"シルバロン",  color:"#90a4ae",bg:"#cfd8dc",tc:"#37474f", emoji:"🥈",n:4,  atk:3, desc:"きぞくのモンスター"},
  {s:"Fe",name:"アイアンガー",color:"#8d6e63",bg:"#d7ccc8",tc:"#3e2723", emoji:"🔩",n:4,  atk:3, desc:"てつの巨人"}
];
const getAtom = s => ATOMS.find(a=>a.s===s) || ATOMS[0];

/* ── レアリティ＆得点→ATK計算 ─── */
const RARITY = {H:1,O:1,C:2,Cl:2,Na:2,N:3,S:3,Cu:3,Ag:3,Fe:3};
const MULT = {2:1,3:1.5,4:2,5:2.5,6:3,7:3.5};
const calcPts = a => { const rare=Object.entries(a).reduce((s,[el,n])=>s+(RARITY[el]||1)*n,0); const cards=Object.values(a).reduce((s,n)=>s+n,0); return Math.round(rare*(MULT[cards]||1)); };

/* ── 化合物モンスターデータ ─── */
const COMPOUNDS = [
  {k:"H2",  f:"H₂",  name:"ツインヒドロ",     a:{H:2},        emoji:"💧", desc:"2体が合体した水のモンスター"},
  {k:"O2",  f:"O₂",  name:"ダブルオキシ",     a:{O:2},        emoji:"🌬️", desc:"風をまとった2体の合体"},
  {k:"H2O", f:"H₂O", name:"アクアドラゴン",   a:{H:2,O:1},    emoji:"🐉", desc:"伝説の水竜モンスター"},
  {k:"HCl", f:"HCl", name:"アシッドスネーク", a:{H:1,Cl:1},   emoji:"🐍", desc:"酸の毒蛇"},
  {k:"CO2", f:"CO₂", name:"スモッグキング",   a:{C:1,O:2},    emoji:"💨", desc:"煙の王"},
  {k:"N2",  f:"N₂",  name:"ツインニトロ",     a:{N:2},        emoji:"🌸", desc:"2体合体のしずかなる力"},
  {k:"Cl2", f:"Cl₂", name:"ポイズンバブル",   a:{Cl:2},       emoji:"🫧", desc:"どくの泡モンスター"},
  {k:"NaCl",f:"NaCl",name:"ソルトゴーレム",   a:{Na:1,Cl:1},  emoji:"🧂", desc:"塩の巨人"},
  {k:"CuO", f:"CuO", name:"コッパーナイト",   a:{Cu:1,O:1},   emoji:"⚔️", desc:"銅の騎士"},
  {k:"FeO", f:"FeO", name:"アイアンシールド", a:{Fe:1,O:1},   emoji:"🛡️", desc:"鉄のぼうぎょモンスター"},
  {k:"AgCl",f:"AgCl",name:"シルバーフォグ",   a:{Ag:1,Cl:1},  emoji:"🌫️", desc:"銀の霧モンスター"},
  {k:"CuS", f:"CuS", name:"コッパーデーモン", a:{Cu:1,S:1},   emoji:"👹", desc:"銅と硫黄の悪魔"},
  {k:"FeS", f:"FeS", name:"メタルスコーピオ", a:{Fe:1,S:1},   emoji:"🦂", desc:"鉄のサソリ"},
  {k:"NaOH",f:"NaOH",name:"アルカリウス",     a:{Na:1,O:1,H:1},emoji:"🧪",desc:"アルカリの魔法使い"},
  {k:"H2S", f:"H₂S", name:"ロッテンエッグ",   a:{H:2,S:1},    emoji:"🥚", desc:"くさい卵モンスター"},
  {k:"O3",  f:"O₃",  name:"オゾンガーディアン",a:{O:3},        emoji:"🌀", desc:"オゾンの守護者"},
  {k:"SO2", f:"SO₂", name:"ボルケイノス",     a:{S:1,O:2},    emoji:"🌋", desc:"火山から来た魔獣"},
  {k:"NH3", f:"NH₃", name:"アンモナイトX",    a:{N:1,H:3},    emoji:"💜", desc:"アンモニアの古代獣"},
  {k:"CH4", f:"CH₄", name:"メタンドラゴン",   a:{C:1,H:4},    emoji:"🔥", desc:"メタンの火竜"},
  {k:"SO3", f:"SO₃", name:"サルファーストーム",a:{S:1,O:3},    emoji:"🌪️", desc:"硫酸の嵐モンスター"},
  {k:"C2H2",f:"C₂H₂",name:"アセチレンフレア",a:{C:2,H:2},    emoji:"⚡", desc:"溶接の炎モンスター"},
  {k:"NaHCO3",f:"NaHCO₃",name:"ベーキングタイタン",a:{Na:1,H:1,C:1,O:3},emoji:"🧁",desc:"ふくらむ巨人"},
  {k:"CH4O",f:"CH₃OH",name:"メタノールスピリット",a:{C:1,H:4,O:1},emoji:"🍶",desc:"アルコールの精霊"},
  {k:"Fe2O3",f:"Fe₂O₃",name:"ラストエンペラー",a:{Fe:2,O:3},  emoji:"👑", desc:"さびの皇帝"},
  {k:"Na2CO3",f:"Na₂CO₃",name:"ソーダフェニックス",a:{Na:2,C:1,O:3},emoji:"🦅",desc:"ソーダの不死鳥"},
  {k:"H2SO4",f:"H₂SO₄",name:"ヴィトリオルデーモン",a:{H:2,S:1,O:4},emoji:"⚗️",desc:"硫酸の大悪魔"},
  {k:"C7",  f:"C₇",  name:"ダイヤモンドキング",a:{C:7},       emoji:"💎", desc:"最強の結晶王", sp:true}
].map(c=>({...c, atk:c.sp?50:calcPts(c.a)}));

/* ── ボスモンスター ─── */
const BOSSES = [
  {id:1, name:"スライムリン",   emoji:"🟢",hp:8,  color:"#66bb6a",desc:"よわっちいスライム",
   pixels:{p:{'a':'#66bb6a','A':'#388e3c','w':'#fff','e':'#1b5e20','p':'#f48fb1'},
   r:['     aaa     ','   aaaaaaa   ','  aawwaawwaa  ','  aaewaaewaa  ','  aaaaaaaaaaa ','  aapaaaapaa  ','  aaammmmaa   ','   aaaaaaaa   ','    AAAAAA    ','   AAAAAAAA   ']}},
  {id:2, name:"バブルキング",   emoji:"🫧",hp:14, color:"#4fc3f7",desc:"泡をあやつる王",
   pixels:{p:{'a':'#4fc3f7','A':'#0288d1','w':'#fff','e':'#01579b','g':'#ffd700','b':'#b3e5fc'},
   r:['    g g g    ','   ggggggg   ','    aaaaaa   ','   aaaaaaaa  ','  aawwaawwaa ','  aaewaaewaa ','  aaaaaaaaaa ','   aaeaaaaa  ','   aaaaaaaa  ','    AAAAAA   ','   AAAAAAAA  ']}},
  {id:3, name:"メタルゴーレム", emoji:"🤖",hp:22, color:"#78909c",desc:"てつの体をもつ巨人",
   pixels:{p:{'a':'#78909c','A':'#455a64','w':'#fff','e':'#263238','r':'#ff1744','h':'#546e7a','y':'#fdd835'},
   r:['   hhhhhh    ','  haaaaaah   ','  earrarreh  ','  eaaaaaaaeh ','   hhhhhhh   ','  aaaaaaaaa  ','  aayaaayaa  ','  aaayyyaa   ','  aayaaayaa  ','  aaaaaaaaa  ','   AAAAAAA   ','   AA   AA   ','   hh   hh   ']}},
  {id:4, name:"ポイズンクイーン",emoji:"☠️",hp:30, color:"#ab47bc",desc:"どくの女王",
   pixels:{p:{'a':'#ab47bc','A':'#7b1fa2','w':'#fff','e':'#4a148c','g':'#ffd700','r':'#e91e63','p':'#f48fb1'},
   r:['    g r g    ','   ggrgggg   ','   aaaaaaa   ','  aaahhaahha ','  aaaeaaaeaa ','  aaaaaaaaaa ','  aapaaapaa  ','   aawwwaa   ','    aaaaaa   ','     AAAA  A ','      AAA AA ','       AAAA  ','        AA   ']}},
  {id:5, name:"フレイムドラゴン",emoji:"🐲",hp:40, color:"#ff6e40",desc:"ほのおの竜",
   pixels:{p:{'a':'#ff6e40','A':'#e65100','w':'#fff','e':'#bf360c','r':'#ff1744','y':'#ffd600','f':'#ff9100'},
   r:['  f      f   ','  ff    ff   ','  f aaaaaa f ','    aaaaaaaa ','   aaawwaaww ','   aaaewaewa ','   aaaaaaaaa ','    aaaaaaa  ','  rraaaaaaAA ','  rrrAAAAAA  ','    AAAAAA   ','   AA    AA  ','   AA    AA  ']}},
  {id:6, name:"ダークエンペラー",emoji:"👿",hp:55, color:"#e040fb",desc:"やみの大魔王",
   pixels:{p:{'a':'#e040fb','A':'#aa00ff','w':'#fff','e':'#6a1b9a','k':'#1a1a1a','g':'#ffd700','r':'#ff1744','d':'#ce93d8'},
   r:['  k      k   ','  kk    kk   ','   kkkkkkkk  ','   kaaaaaak  ','  aaagaaagaa ','  aaaeaaaeaa ','  aaaaaaaaaa ','  aaraaaaraa ','   aaaaaaaa  ','   AAAAAAAA  ','    AAAAAA   ','  g  AA  AA g','     AA  AA  ']}},
  {id:7, name:"コスモスゴッド", emoji:"🌌",hp:75, color:"#ff1744",desc:"うちゅうの神",
   pixels:{p:{'a':'#ff1744','A':'#d50000','w':'#fff','e':'#b71c1c','d':'#ff5252','k':'#1a1a1a','g':'#ffd600','c':'#ff8a80'},
   r:['    ddddddd  ','   ddaaaadd  ','  ddaaaaadd  ','  daawwdawwa ','  daaeedaeea ','  daaaaaaaad ','  ddaaaaaddd ','   ddawwwadd ','    ddaaadd  ','     ddddd   ','  g   ddd  g ','       d     ','  c       c  ']}}
];

/* ── ステージデータ ─── */
const STAGES = [
  {id:1, bossId:1, name:"はじまりの草原",    hl:10, deckSize:50, diff:"easy"},
  {id:2, bossId:2, name:"あわの洞窟",       hl:10, deckSize:50, diff:"easy"},
  {id:3, bossId:3, name:"てつの遺跡",       hl:9,  deckSize:48, diff:"normal"},
  {id:4, bossId:4, name:"どくの沼地",       hl:9,  deckSize:45, diff:"normal"},
  {id:5, bossId:5, name:"ほのおの火山",     hl:8,  deckSize:45, diff:"hard"},
  {id:6, bossId:6, name:"やみの城",         hl:8,  deckSize:42, diff:"hard"},
  {id:7, bossId:7, name:"うちゅうの果て",   hl:7,  deckSize:40, diff:"hard"}
];

/* ── ユーティリティ ─── */
const shuffle = a => { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=0|Math.random()*(i+1);[b[i],b[j]]=[b[j],b[i]];} return b; };
const buildDeck = (maxCards) => {
  const d=[]; let id=0;
  for(const a of ATOMS) for(let i=0;i<a.n;i++) d.push({id:id++, s:a.s});
  const shuffled = shuffle(d);
  return maxCards ? shuffled.slice(0, maxCards) : shuffled;
};
const cntAtoms = cards => { const c={}; for(const x of cards) c[x.s]=(c[x.s]||0)+1; return c; };
const findPossible = hand => {
  const hc = cntAtoms(hand);
  return COMPOUNDS.filter(c=>Object.entries(c.a).every(([s,n])=>(hc[s]||0)>=n));
};

/* ═══════════════════════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DotGothic16&family=Press+Start+2P&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none}
body{font-family:'DotGothic16',monospace;overflow-x:hidden;background:#080820;image-rendering:pixelated}
button{font-family:'DotGothic16',monospace;cursor:pointer;transition:transform .08s}
button:active{transform:scale(.93)!important}
@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes su{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pg{0%,100%{box-shadow:0 0 8px var(--g)}50%{box-shadow:0 0 20px var(--g),0 0 40px var(--g)}}
@keyframes ca{0%{opacity:0;transform:scale(.6)}60%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
@keyframes ke{0%{opacity:0;transform:translate(0,0) scale(.3)}30%{opacity:1;transform:translate(calc(var(--dx)*.4),calc(var(--dy)*.4)) scale(1.2)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.2)}}
@keyframes hitFlash{0%{opacity:1}50%{opacity:0.2}100%{opacity:1}}
@keyframes slideRight{from{transform:translateX(-100%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes titleGlow{0%,100%{text-shadow:2px 2px 0 #003,0 0 6px rgba(80,180,255,.4)}50%{text-shadow:2px 2px 0 #003,0 0 12px rgba(80,180,255,.7),0 0 24px rgba(80,180,255,.3)}}
@keyframes pixelStar{0%,100%{opacity:.15}50%{opacity:.9}}
@keyframes hpDrain{from{background-position:0 0}to{background-position:200% 0}}
@keyframes bossIdle{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(80,180,255,.2)}
`;

/* ── 星空背景 ─── */
const Stars = ({n=30}) => {
  const stars = useRef(Array.from({length:n},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,sz:(1+Math.floor(Math.random()*2))*2,d:2+Math.random()*4,dl:Math.random()*4,co:["#5cf","#fff","#c9f","#8f8","#fc8"][i%5]}))).current;
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
    {stars.map(s=><div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.sz,height:s.sz,background:s.co,animation:`pixelStar ${s.d}s ${s.dl}s ease-in-out infinite`}} />)}
  </div>;
};

/* ── スキャンライン ─── */
const Scanlines = () => <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.12) 2px,rgba(0,0,0,.12) 4px)",opacity:.5}} />;

/* ── ピクセルボタン ─── */
const Btn = ({children,onClick,bg="#3355cc",disabled,style,...rest}) =>
  <button onClick={()=>{if(!disabled){SE.tap();onClick?.();}}} disabled={disabled} style={{
    border:`3px solid ${disabled?"#444":bg}`, background:disabled?"#222":bg,
    color:disabled?"#555":"#fff", fontSize:14, fontWeight:700, padding:"12px 20px",
    boxShadow:disabled?"none":`0 4px 0 rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.2)`,
    letterSpacing:".04em", textShadow:disabled?"none":"1px 1px 0 rgba(0,0,0,.6)",
    imageRendering:"pixelated", ...style
  }} {...rest}>{children}</button>;

/* ── 原子カード ─── */
const AtomCard = ({card, sel, onTap, small}) => {
  const a = getAtom(card.s);
  const sz = small ? {w:50,h:66,fs:14,es:14,ns:7} : {w:66,h:88,fs:18,es:18,ns:8};
  return <div onClick={()=>onTap?.(card)} style={{
    width:sz.w, minWidth:sz.w, height:sz.h, position:"relative",
    background:sel?a.bg:"#161630", border:`3px solid ${sel?a.color:"#334"}`,
    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
    boxShadow:sel?`0 0 8px ${a.color}88,0 4px 0 ${a.color}44`:`0 3px 0 #0a0a1a`,
    cursor:onTap?"pointer":"default", transition:"all .12s", flexShrink:0,
    transform:sel?"translateY(-8px)":"none", gap:1, "--g":a.color+"66",
    animation:sel?"pg 1.5s ease-in-out infinite":"ca .3s ease both"
  }}>
    <span style={{fontSize:sz.es}}>{a.emoji}</span>
    <span style={{fontSize:sz.fs,fontWeight:900,color:sel?a.tc:"#fff",textShadow:sel?"none":"1px 1px 0 #000"}}>{card.s}</span>
    <span style={{fontSize:sz.ns,color:sel?a.tc+"cc":"#777",fontWeight:700}}>{a.name}</span>
    {!small && <span style={{fontSize:7,color:sel?a.tc+"99":"#555"}}>ATK {a.atk}</span>}
  </div>;
};

/* ── 合体モンスターバッジ ─── */
const MonsterBadge = ({comp, showAtk}) => {
  const tier = comp.atk>=20?"#f44":comp.atk>=10?"#f93":comp.atk>=5?"#fc3":"#5f8";
  return <div style={{
    display:"inline-flex", alignItems:"center", gap:4,
    background:"#111", padding:"4px 8px", border:`2px solid ${tier}44`
  }}>
    <span style={{fontSize:14}}>{comp.emoji}</span>
    <span style={{fontSize:11,fontWeight:700,color:"#ccc"}}>{comp.name}</span>
    {showAtk!==false && <span style={{fontSize:10,fontWeight:900,color:"#000",background:tier,padding:"1px 6px"}}>{comp.atk}</span>}
  </div>;
};

/* ── ボスモンスター描画 ─── */
const BossSprite = ({boss, size=120, shake:doShake}) => {
  const b = boss.pixels;
  return <div style={{animation:doShake?"shake .3s ease":"bossIdle 3s ease-in-out infinite",filter:`drop-shadow(0 8px 30px ${boss.color}66)`}}>
    <PixelArt rows={b.r} palette={b.p} size={size} />
  </div>;
};

/* ═══════════════════════════════════════════════════════════
   🏠 タイトル画面
   ═══════════════════════════════════════════════════════════ */
const TitleScreen = ({onSelectStage, cleared}) => {
  const [showStages, setShowStages] = useState(false);

  if(!showStages) return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"linear-gradient(180deg,#080820,#0c0c30)",position:"relative"}}>
    <Stars /><Scanlines />
    <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center"}}>
      {/* ロゴ */}
      <div style={{fontSize:48,marginBottom:8,animation:"fl 3s ease-in-out infinite"}}>🧪</div>
      <h1 style={{fontSize:16,color:"#5cf",textAlign:"center",letterSpacing:".05em",animation:"titleGlow 4s ease-in-out infinite",fontFamily:"'Press Start 2P','DotGothic16',monospace",lineHeight:1.8}}>げんし<br/>モンスターバトル</h1>
      <div style={{fontSize:8,color:"#555",marginTop:8,marginBottom:32,fontFamily:"'Press Start 2P',monospace",animation:"pixelStar 2s ease-in-out infinite"}}>- PRESS START -</div>

      <Btn onClick={()=>setShowStages(true)} bg="#c62828" style={{padding:"16px 40px",fontSize:18}}>
        ⚔️ あそぶ
      </Btn>

      {/* ミニモンスター行進 */}
      <div style={{marginTop:32,display:"flex",gap:8,opacity:.5}}>
        {ATOMS.slice(0,5).map((a,i)=><div key={a.s} style={{animation:`fl ${2+i*.3}s ease-in-out infinite`,fontSize:24}}>{a.emoji}</div>)}
      </div>
    </div>
  </div>;

  // ステージ選択
  return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 20px",background:"linear-gradient(180deg,#080820,#0c0c30)",position:"relative"}}>
    <Stars /><Scanlines />
    <div style={{position:"relative",zIndex:2,width:"100%",maxWidth:360,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <h2 style={{fontSize:18,fontWeight:900,color:"#fff",margin:"0 0 20px"}}>⚔️ ステージ選択</h2>
      <div style={{width:"100%",display:"flex",flexDirection:"column",gap:10}}>
        {STAGES.map((st,i)=>{
          const boss = BOSSES.find(b=>b.id===st.bossId);
          const unlocked = i===0 || cleared.has(STAGES[i-1].id);
          const done = cleared.has(st.id);
          const diffCol = {easy:"#5f8",normal:"#fc3",hard:"#f44"}[st.diff];
          return <button key={st.id} onClick={()=>{if(unlocked){SE.tap();onSelectStage(st);}}} style={{
            padding:"14px",border:`2px solid ${unlocked?boss.color+'44':'#222'}`,
            background:unlocked?`${boss.color}08`:'#0a0a14',
            color:"#fff",textAlign:"left",opacity:unlocked?1:.35,position:"relative"
          }}>
            {done && <div style={{position:"absolute",top:4,right:8,fontSize:10,color:"#5f8",fontWeight:800}}>✓ クリア</div>}
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",background:`${boss.color}15`,border:`2px solid ${boss.color}33`,flexShrink:0}}>
                {unlocked ? <span style={{fontSize:28}}>{boss.emoji}</span> : <span style={{fontSize:20}}>🔒</span>}
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:900}}>{unlocked?`${st.id}. ${st.name}`:"🔒 ???"}</div>
                {unlocked && <div style={{fontSize:11,color:"#888",marginTop:2}}>ボス: {boss.name} (HP {boss.hp})</div>}
                <div style={{fontSize:10,color:diffCol,fontWeight:700,marginTop:1}}>{"★".repeat({easy:1,normal:2,hard:3}[st.diff])}</div>
              </div>
            </div>
          </button>;
        })}
      </div>
      <button onClick={()=>setShowStages(false)} style={{marginTop:18,padding:"10px 24px",border:"2px solid #334",background:"transparent",color:"#666",fontSize:13,fontWeight:700}}>← もどる</button>
    </div>
  </div>;
};

/* ═══════════════════════════════════════════════════════════
   🃏 カードフェーズ（手札構築）
   ═══════════════════════════════════════════════════════════ */
const CardPhase = ({stage, boss, onDone}) => {
  const [deck, setDeck] = useState(()=>buildDeck(stage.deckSize));
  const [hand, setHand] = useState([]);
  const [army, setArmy] = useState([]); // 合体モンスター軍団
  const [sel, setSel] = useState(new Set());
  const [drew, setDrew] = useState(false);
  const [drawnCard, setDrawnCard] = useState(null);
  const [justFused, setJustFused] = useState(null);
  const [showList, setShowList] = useState(false);
  const hl = stage.hl;
  const totalAtk = army.reduce((s,m)=>s+m.atk,0);

  // 初期手札3枚
  useEffect(()=>{
    const d = [...deck];
    const h = [];
    for(let i=0;i<3&&d.length>0;i++) h.push(d.pop());
    setDeck(d); setHand(h);
  },[]);

  const selCards = hand.filter(c=>sel.has(c.id));
  const selCnt = cntAtoms(selCards);
  const match = COMPOUNDS.find(c=>Object.entries(c.a).every(([s,n])=>(selCnt[s]||0)===n)&&Object.entries(selCnt).every(([s,n])=>(c.a[s]||0)===n));
  const possible = findPossible(hand);
  const overLimit = hand.length > hl;

  const toggle = card => {
    setSel(p=>{const n=new Set(p);if(n.has(card.id)){n.delete(card.id);SE.deselect();}else{n.add(card.id);SE.select();}return n;});
  };

  const doDraw = () => {
    if(deck.length===0||drew) return;
    const nd=[...deck], dr=nd.pop();
    setDeck(nd); setHand(h=>[...h,dr]); setDrew(true); setDrawnCard(dr); SE.draw();
  };

  const doFuse = () => {
    if(!match) return;
    const ids = new Set(sel);
    setHand(h=>h.filter(c=>!ids.has(c.id)));
    setArmy(a=>[...a, match]);
    setSel(new Set());
    setJustFused(match);
    SE.fuse(match.atk);
    setTimeout(()=>setJustFused(null), 1500);
  };

  const doDiscard = (cardId) => {
    setHand(h=>h.filter(c=>c.id!==cardId));
    SE.discard();
  };

  const doPass = () => { SE.pass(); setDrew(false); setDrawnCard(null); };
  const doFinish = () => { onDone(army); };

  // 総ATK ≧ ボスHP で攻撃可能、または山札0でも強制バトル
  const canAttack = totalAtk >= boss.hp;
  const deckEmpty = deck.length === 0;

  return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,#080820,#0c0c30)"}}>
    {/* フュージョン演出 */}
    {justFused && <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(6,6,18,.95)",animation:"fadeIn .2s ease"}}>
      <div style={{fontSize:64,animation:"ca .4s ease both"}}>{justFused.emoji}</div>
      <div style={{fontSize:20,fontWeight:900,color:"#fff",marginTop:8,animation:"su .4s .2s ease both",opacity:0}}>{justFused.name}</div>
      <div style={{fontSize:14,color:"#888",marginTop:4,animation:"su .4s .3s ease both",opacity:0}}>{justFused.f}</div>
      <div style={{fontSize:32,fontWeight:900,color:"#fc3",marginTop:8,animation:"su .4s .4s ease both",opacity:0}}>ATK {justFused.atk}</div>
    </div>}

    {/* ヘッダー */}
    <div style={{padding:"max(12px,env(safe-area-inset-top)) 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #222",background:"rgba(8,8,32,.9)"}}>
      <div>
        <span style={{fontSize:13,fontWeight:900,color:"#5cf"}}>{stage.name}</span>
        <span style={{fontSize:11,color:"#555",marginLeft:8}}>vs {boss.name}</span>
      </div>
      <div style={{display:"flex",gap:14,alignItems:"center"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:8,color:"#555"}}>やまふだ</div>
          <div style={{fontSize:18,fontWeight:900,color:deck.length>10?"#5cf":"#f44"}}>{deck.length}</div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:8,color:"#555"}}>そうATK</div>
          <div style={{fontSize:18,fontWeight:900,color:totalAtk>=boss.hp?"#5f8":"#fc3"}}>{totalAtk}</div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:8,color:"#555"}}>ボスHP</div>
          <div style={{fontSize:18,fontWeight:900,color:"#f44"}}>{boss.hp}</div>
        </div>
      </div>
    </div>

    {/* 軍団表示 */}
    {army.length>0 && <div style={{padding:"8px 12px",display:"flex",flexWrap:"wrap",gap:4,background:"#0a0a18",borderBottom:"1px solid #181828"}}>
      {army.map((m,i)=><MonsterBadge key={i} comp={m} />)}
    </div>}

    {/* 引いたカード */}
    {drawnCard && <div style={{padding:"8px 16px",display:"flex",alignItems:"center",gap:10,background:"rgba(80,180,255,.05)",borderBottom:"1px solid #182838",animation:"su .3s ease"}}>
      <span style={{fontSize:12,color:"#5cf",fontWeight:700}}>ひいたカード →</span>
      <AtomCard card={drawnCard} small />
    </div>}

    {/* 手札オーバー警告 */}
    {overLimit && <div style={{padding:"8px 16px",textAlign:"center",background:"rgba(255,50,50,.06)",borderBottom:"1px solid rgba(255,50,50,.1)"}}>
      <span style={{fontSize:13,color:"#f44",fontWeight:800}}>⚠️ てふだ{hl}まいをこえた！がったいするか、1まいすてよう</span>
    </div>}

    {/* メインエリア */}
    <div style={{flex:1,padding:"12px",overflowY:"auto"}}>
      <div style={{fontSize:12,color:"#555",marginBottom:8,fontWeight:700}}>🃏 てふだ ({hand.length}まい) — タップでえらぶ</div>

      {/* 手札カード */}
      <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
        {[...hand].sort((a,b)=>"H O C N S Cl Na Cu Ag Fe".split(" ").indexOf(a.s)-"H O C N S Cl Na Cu Ag Fe".split(" ").indexOf(b.s)).map(c=>
          <div key={c.id} style={{position:"relative"}}>
            <AtomCard card={c} sel={sel.has(c.id)} onTap={toggle} />
            {overLimit && <button onClick={()=>doDiscard(c.id)} style={{
              position:"absolute",top:-6,right:-6,width:22,height:22,border:"none",
              background:"#f44",color:"#fff",fontSize:13,fontWeight:900,
              display:"flex",alignItems:"center",justifyContent:"center",zIndex:2
            }}>×</button>}
          </div>
        )}
      </div>

      {/* 合成プレビュー */}
      {match && <div style={{marginTop:16,padding:16,background:"rgba(255,200,50,.06)",border:"2px solid rgba(255,200,50,.3)",textAlign:"center",animation:"ca .3s ease"}}>
        <div style={{fontSize:12,color:"#fc3",fontWeight:700,marginBottom:4}}>がったいできる！</div>
        <div style={{fontSize:32}}>{match.emoji}</div>
        <div style={{fontSize:18,fontWeight:900,color:"#fff"}}>{match.name}</div>
        <div style={{fontSize:12,color:"#888"}}>{match.f} — {match.desc}</div>
        <div style={{fontSize:22,fontWeight:900,color:"#fc3",marginTop:4}}>ATK {match.atk}</div>
        <Btn onClick={doFuse} bg="#cc8800" style={{marginTop:10,padding:"10px 32px",fontSize:16}}>🔗 がったい！</Btn>
      </div>}

      {/* ボスHP目標 */}
      <div style={{marginTop:12,padding:10,background:"#0c0c1a",border:"2px solid #223",textAlign:"center"}}>
        <span style={{fontSize:11,color:"#888"}}>ボス </span>
        <span style={{fontSize:13,color:boss.color,fontWeight:900}}>{boss.emoji} {boss.name}</span>
        <span style={{fontSize:11,color:"#888"}}> の HP </span>
        <span style={{fontSize:16,color:"#f44",fontWeight:900}}>{boss.hp}</span>
        <span style={{fontSize:11,color:"#888"}}> をこえろ！</span>
        <div style={{marginTop:4,fontSize:11,color:totalAtk>=boss.hp?"#5f8":"#fc3",fontWeight:700}}>
          いまの そうATK: {totalAtk} / {boss.hp} {totalAtk>=boss.hp?"✓ 十分！":"— もっと がったい しよう！"}
        </div>
      </div>

      {/* 化合物リスト */}
      <div style={{marginTop:8}}>
        <button onClick={()=>setShowList(!showList)} style={{width:"100%",padding:10,border:"2px solid #223",background:"#0e0e1e",color:"#555",fontSize:12,fontWeight:700}}>
          📋 {showList?"とじる":"がったいリスト"}
        </button>
        {showList && <div style={{marginTop:4,padding:10,background:"#0c0c1a",border:"2px solid #222",maxHeight:300,overflowY:"auto",animation:"su .2s ease"}}>
          {possible.length>0 && <div style={{marginBottom:8}}>
            <div style={{fontSize:11,color:"#5f8",fontWeight:900,marginBottom:4}}>🟢 いまつくれる</div>
            {possible.map(c=><div key={c.k} style={{padding:"6px",marginBottom:4,background:"rgba(80,255,128,.03)",border:"1px solid rgba(80,255,128,.1)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12}}>{c.emoji} {c.name} <span style={{color:"#666",fontSize:10}}>({c.f})</span></span>
              <span style={{fontSize:11,fontWeight:900,color:"#000",background:"#5f8",padding:"1px 6px"}}>ATK {c.atk}</span>
            </div>)}
          </div>}
          <div style={{fontSize:11,color:"#555",fontWeight:900,marginBottom:4}}>ぜんぶ</div>
          {[...COMPOUNDS].sort((a,b)=>a.atk-b.atk).map(c=>{
            const hc=cntAtoms(hand);
            const canMake=Object.entries(c.a).every(([s,n])=>(hc[s]||0)>=n);
            return <div key={c.k} style={{padding:"4px 6px",marginBottom:3,background:canMake?"rgba(80,255,128,.03)":"#0a0a14",border:canMake?"1px solid rgba(80,255,128,.1)":"1px solid #181828",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:canMake?1:.5}}>
              <div>
                <span style={{fontSize:11}}>{c.emoji} {c.name}</span>
                <span style={{fontSize:9,color:"#555",marginLeft:4}}>{c.f}</span>
                <div style={{display:"flex",gap:2,marginTop:2}}>
                  {Object.entries(c.a).map(([s,n])=><span key={s} style={{fontSize:9,color:getAtom(s).color,fontWeight:700}}>{s}×{n}</span>)}
                </div>
              </div>
              <span style={{fontSize:10,fontWeight:900,color:canMake?"#000":"#555",background:canMake?"#5f8":"#222",padding:"1px 6px"}}>{c.atk}</span>
            </div>;
          })}
        </div>}
      </div>
    </div>

    {/* 攻撃可能バナー */}
    {canAttack && !justFused && <div style={{padding:"10px 16px",textAlign:"center",background:"rgba(255,50,50,.08)",borderBottom:"2px solid rgba(255,50,50,.3)",animation:"su .3s ease"}}>
      <span style={{fontSize:15,color:"#f44",fontWeight:900,animation:"pg 1.5s ease-in-out infinite","--g":"rgba(255,50,50,.5)"}}>⚔️ ボスのHPをこえた！こうげきできるぞ！</span>
    </div>}

    {/* アクションバー */}
    <div style={{padding:"12px 16px max(24px,env(safe-area-inset-bottom))",borderTop:"1px solid #222",display:"flex",gap:10,background:"rgba(8,8,32,.97)"}}>
      {canAttack
        ? <Btn onClick={doFinish} bg="#c62828" style={{flex:1,padding:16,fontSize:18,"--g":"rgba(255,50,50,.5)",animation:"pg 1.5s ease-in-out infinite"}}>⚔️ こうげき！</Btn>
        : deckEmpty
          ? <Btn onClick={doFinish} bg="#555" style={{flex:1,padding:14,fontSize:14}}>😢 バトルへ（ATKたりない…）</Btn>
          : !drew
            ? <Btn onClick={doDraw} bg="#2244aa" style={{flex:1,padding:14,fontSize:16}}>🃏 カードをひく</Btn>
            : !overLimit && <Btn onClick={doPass} bg="#445566" style={{flex:1,padding:14,fontSize:16}}>{possible.length>0?"🔬 パス":"➡️ つぎへ"}</Btn>
      }
    </div>
  </div>;
};

/* ═══════════════════════════════════════════════════════════
   ⚔️ バトルフェーズ — 派手な撃破演出
   ═══════════════════════════════════════════════════════════ */
const BattlePhase = ({army, boss, stage, onResult}) => {
  // phases: intro → charge → allAttack → bossHit → bossDeath → result (won)
  //         intro → charge → allAttack → bossHit → result (lost)
  const [phase, setPhase] = useState("intro");
  const [bossHp, setBossHp] = useState(boss.hp);
  const [shaking, setShaking] = useState(false);
  const [flashWhite, setFlashWhite] = useState(false);
  const [chargeIdx, setChargeIdx] = useState(-1);
  const totalAtk = army.reduce((s,m)=>s+m.atk,0);
  const won = totalAtk >= boss.hp;

  // 撃破エフェクト用パーティクル
  const particles = useRef(Array.from({length:40},(_,i)=>{
    const ang = (i/40)*360*Math.PI/180;
    const dist = 60+Math.random()*100;
    return {id:i, x:Math.cos(ang)*dist, y:Math.sin(ang)*dist, em:["💥","⭐","✨","🔥","💫","⚡"][i%6], sz:16+Math.random()*20, dl:Math.random()*.5};
  })).current;

  // フェーズ遷移
  useEffect(()=>{
    if(phase==="intro"){
      SE.battleStart();
      setTimeout(()=>setPhase("charge"), 2200);
    }
    if(phase==="charge"){
      // 味方モンスターが1体ずつチャージ
      let i=0;
      const iv = setInterval(()=>{
        if(i<army.length){ setChargeIdx(i); SE.select(); i++; }
        else { clearInterval(iv); setTimeout(()=>setPhase("allAttack"),600); }
      }, 300);
      return ()=>clearInterval(iv);
    }
    if(phase==="allAttack"){
      // 全員で一斉攻撃！
      SE.attack();
      setShaking(true);
      setFlashWhite(true);
      setTimeout(()=>setFlashWhite(false),200);
      // HPを一気に削る
      const drain = () => {
        let remaining = boss.hp;
        const steps = 15;
        const perStep = boss.hp / steps;
        let step = 0;
        const iv = setInterval(()=>{
          step++;
          remaining = Math.max(0, boss.hp - Math.round(totalAtk * (step/steps)));
          if(remaining < 0) remaining = 0;
          setBossHp(Math.max(0, remaining));
          if(step >= steps){
            clearInterval(iv);
            setBossHp(Math.max(0, boss.hp - totalAtk));
            setShaking(false);
            setTimeout(()=>{
              if(won) { setPhase("bossDeath"); }
              else { SE.lose(); setPhase("result"); }
            }, 600);
          }
        }, 80);
      };
      setTimeout(drain, 400);
    }
    if(phase==="bossDeath"){
      // 撃破演出
      SE.fuse(50);
      setShaking(true);
      setTimeout(()=>setShaking(false), 500);
      setTimeout(()=>{
        setFlashWhite(true);
        setTimeout(()=>setFlashWhite(false), 300);
      }, 800);
      setTimeout(()=>{
        SE.victory();
        setPhase("result");
      }, 1800);
    }
  },[phase]);

  // ── イントロ ──
  if(phase==="intro") return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(180deg,#100808,#200c0c)",position:"relative"}}>
    <Stars n={15} /><Scanlines />
    <div style={{position:"relative",zIndex:2,textAlign:"center"}}>
      <div style={{fontSize:16,color:"#f44",fontWeight:900,marginBottom:16,letterSpacing:".15em",animation:"pg 1s ease-in-out infinite","--g":"rgba(255,50,50,.5)",fontFamily:"'Press Start 2P','DotGothic16',monospace"}}>BATTLE START</div>
      <div style={{animation:"ca .6s ease both"}}>
        <BossSprite boss={boss} size={160} />
      </div>
      <div style={{fontSize:28,fontWeight:900,color:"#fff",marginTop:12,animation:"su .5s .3s ease both",opacity:0}}>{boss.emoji} {boss.name}</div>
      <div style={{fontSize:13,color:"#888",marginTop:6,animation:"su .5s .5s ease both",opacity:0}}>{boss.desc}</div>
      <div style={{marginTop:12,animation:"su .5s .7s ease both",opacity:0}}>
        <span style={{fontSize:18,color:"#f44",fontWeight:900}}>HP {boss.hp}</span>
      </div>
      {/* 味方軍団プレビュー */}
      <div style={{marginTop:20,animation:"su .5s .9s ease both",opacity:0}}>
        <div style={{fontSize:11,color:"#5cf",fontWeight:700,marginBottom:6}}>きみのぐんだん — そうATK {totalAtk}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center"}}>
          {army.map((m,i)=><span key={i} style={{fontSize:16}}>{m.emoji}</span>)}
        </div>
      </div>
    </div>
  </div>;

  // ── バトルメイン画面 ──
  return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,#100808,#200c0c)",position:"relative",overflow:"hidden"}}>
    <Stars n={10} /><Scanlines />

    {/* 白フラッシュ */}
    {flashWhite && <div style={{position:"fixed",inset:0,background:"#fff",zIndex:100,animation:"fadeIn .1s ease"}} />}

    <div style={{position:"relative",zIndex:2,flex:1,display:"flex",flexDirection:"column",padding:"max(16px,env(safe-area-inset-top)) 16px 24px"}}>

      {/* ── ボスエリア ── */}
      <div style={{textAlign:"center",marginBottom:12,position:"relative"}}>
        {phase==="bossDeath" ? <>
          {/* 撃破パーティクル */}
          {particles.map(p=><div key={p.id} style={{position:"absolute",left:"50%",top:"40%",fontSize:p.sz,transform:"translate(-50%,-50%)",animation:`ke .8s ${p.dl}s cubic-bezier(.2,.6,.3,1) forwards`,opacity:0,"--dx":`${p.x}px`,"--dy":`${p.y}px`,zIndex:5}}>{p.em}</div>)}
          {/* ボス消滅 */}
          <div style={{animation:"shake .5s ease",opacity:.3,filter:"brightness(3) saturate(0)"}}>
            <BossSprite boss={boss} size={120} />
          </div>
          <div style={{fontSize:32,fontWeight:900,color:"#ff1744",marginTop:8,animation:"ca .3s ease both",textShadow:"0 0 20px #f00"}}>💥 DESTROYED 💥</div>
        </> : <>
          <div style={{display:"inline-block",animation:shaking?"shake .3s ease infinite":"bossIdle 3s ease-in-out infinite",transition:"all .3s"}}>
            <BossSprite boss={boss} size={120} />
          </div>
        </>}

        {/* HP バー */}
        {phase!=="bossDeath" && <div style={{margin:"8px auto",maxWidth:260}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#f44",fontWeight:700}}>
            <span>{boss.emoji} {boss.name}</span>
            <span>HP {Math.max(0,bossHp)} / {boss.hp}</span>
          </div>
          <div style={{height:18,background:"#1a0a0a",border:"2px solid #422",position:"relative",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.max(0,bossHp/boss.hp*100)}%`,background:bossHp/boss.hp>.5?"linear-gradient(90deg,#4caf50,#66bb6a)":bossHp/boss.hp>.25?"linear-gradient(90deg,#ff9800,#ffc107)":"linear-gradient(90deg,#f44336,#e57373)",transition:"width .15s ease"}} />
          </div>
        </div>}
      </div>

      {/* ── 味方軍団 ── */}
      <div style={{fontSize:12,color:"#5cf",fontWeight:700,marginBottom:6}}>
        {phase==="charge"?"⚡ チャージ中…":phase==="allAttack"?"💥 ぜんいん こうげき！":"⚔️ きみの モンスターぐんだん"}
        <span style={{color:"#fc3",marginLeft:8}}>ATK {totalAtk}</span>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:12}}>
        {army.map((m,i)=>{
          const charged = phase==="charge" && i <= chargeIdx;
          const attacking = phase==="allAttack";
          return <div key={i} style={{
            padding:"4px 8px",
            background:attacking?"rgba(255,200,50,.2)":charged?"rgba(80,180,255,.1)":"#111",
            border:`2px solid ${attacking?"#fc3":charged?"#5cf":"#222"}`,
            transition:"all .2s",
            animation:attacking?`slideRight .3s ${i*0.05}s ease both`:charged?"ca .3s ease both":"none",
            transform:attacking?"scale(1.05)":"none"
          }}>
            <span style={{fontSize:12}}>{m.emoji}</span>
            <span style={{fontSize:10,fontWeight:700,color:attacking?"#fc3":charged?"#5cf":"#ccc",marginLeft:4}}>{m.name}</span>
            <span style={{fontSize:10,fontWeight:900,color:attacking?"#ff1744":"#888",marginLeft:4}}>{m.atk}</span>
          </div>;
        })}
        {army.length===0 && <div style={{fontSize:12,color:"#555"}}>モンスターがいない…</div>}
      </div>

      {/* ── リザルト ── */}
      {phase==="result" && <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"su .5s ease both"}}>
        {won ? <>
          <div style={{fontSize:72,animation:"ca .5s ease both",filter:"drop-shadow(0 8px 30px rgba(255,200,50,.5))"}}>🏆</div>
          <div style={{fontSize:20,fontWeight:900,color:"#fc3",marginTop:12,fontFamily:"'Press Start 2P','DotGothic16',monospace",textShadow:"0 0 20px rgba(255,200,50,.4)"}}>勝利！</div>
          <div style={{fontSize:13,color:"#888",marginTop:12,textAlign:"center",lineHeight:1.8}}>
            そうATK <span style={{color:"#5f8",fontWeight:900}}>{totalAtk}</span> で<br/>
            {boss.emoji} {boss.name} (HP {boss.hp}) を げきは！
          </div>
          <div style={{marginTop:8,fontSize:12,color:"#fc3",fontWeight:700}}>
            +{boss.hp * 10} EXP
          </div>
        </> : <>
          <div style={{fontSize:72,animation:"ca .5s ease both"}}>😢</div>
          <div style={{fontSize:20,fontWeight:900,color:"#666",marginTop:12}}>敗北…</div>
          <div style={{fontSize:13,color:"#555",marginTop:12,textAlign:"center",lineHeight:1.8}}>
            そうATK <span style={{color:"#f44",fontWeight:900}}>{totalAtk}</span><br/>
            あと <span style={{color:"#f44",fontWeight:900}}>{boss.hp - totalAtk}</span> たりなかった…
          </div>
        </>}

        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:24,width:"100%",maxWidth:260}}>
          {won && STAGES.find(s=>s.id===stage.id+1) && <Btn onClick={()=>onResult(won, "next")} bg="#c62828" style={{width:"100%",fontSize:15}}>▶ つぎのステージへ</Btn>}
          <Btn onClick={()=>onResult(won, "retry")} bg="#e65100" style={{width:"100%",fontSize:14}}>🔄 もういちど</Btn>
          <Btn onClick={()=>onResult(won, "home")} bg="#334" style={{width:"100%",fontSize:14}}>🏠 トップへ</Btn>
        </div>
      </div>}
    </div>
  </div>;
};

/* ═══════════════════════════════════════════════════════════
   🎮 App
   ═══════════════════════════════════════════════════════════ */
window.__App = function App() {
  const [screen, setScreen] = useState("title"); // title, card, battle
  const [stage, setStage] = useState(null);
  const [army, setArmy] = useState([]);
  const [cleared, setCleared] = useState(()=>{
    try { const s=localStorage.getItem("acb_cleared"); return s?new Set(JSON.parse(s)):new Set(); } catch(e){ return new Set(); }
  });

  const saveCleared = c => { setCleared(c); try{localStorage.setItem("acb_cleared",JSON.stringify([...c]));}catch(e){} };

  const startStage = st => {
    setStage(st); setArmy([]); setScreen("card");
  };

  const onCardDone = armyList => {
    setArmy(armyList); setScreen("battle");
  };

  const onBattleResult = (won, action) => {
    if(won && stage) {
      const nc = new Set([...cleared, stage.id]);
      saveCleared(nc);
    }
    if(action==="next") {
      const next = STAGES.find(s=>s.id===stage.id+1);
      if(next) { startStage(next); return; }
    }
    if(action==="retry") { startStage(stage); return; }
    setScreen("title");
  };

  const boss = stage ? BOSSES.find(b=>b.id===stage.bossId) : null;

  return <>
    <style>{CSS}</style>
    {screen==="title" && <TitleScreen onSelectStage={startStage} cleared={cleared} />}
    {screen==="card" && stage && boss && <CardPhase stage={stage} boss={boss} onDone={onCardDone} />}
    {screen==="battle" && stage && boss && <BattlePhase army={army} boss={boss} stage={stage} onResult={onBattleResult} />}
  </>;
};
