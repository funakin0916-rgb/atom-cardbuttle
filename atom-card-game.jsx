const {useState,useEffect,useCallback,useRef,createContext,useContext} = React;

// ═══════════════════════════════════════════════════════════
// げんしモンスターバトル 🧪⚔️ v6
// ═══════════════════════════════════════════════════════════

/* ── 言語コンテキスト ─── */
const LangCtx=createContext("hiragana");
const useLang=()=>useContext(LangCtx);

/* ── SE ─── */
const SE=(()=>{let ctx=null,en=true;const gc=()=>{if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==="suspended")ctx.resume();return ctx;};const p=fn=>{if(!en)return;try{fn(gc());}catch(e){}};const tone=(c,t,f1,f2,d,v=.12)=>{const o=c.createOscillator(),g=c.createGain();o.type=t;o.frequency.setValueAtTime(f1,c.currentTime);if(f2)o.frequency.exponentialRampToValueAtTime(f2,c.currentTime+d*.6);g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.connect(g).connect(c.destination);o.start(c.currentTime);o.stop(c.currentTime+d);};return{setEnabled:v=>{en=v},isEnabled:()=>en,tap:()=>p(c=>tone(c,"sine",1000,null,.05,.05)),draw:()=>p(c=>tone(c,"sine",800,1200,.15,.15)),select:()=>p(c=>tone(c,"triangle",600,900,.1,.1)),deselect:()=>p(c=>tone(c,"triangle",700,400,.1,.08)),fuse:pts=>p(c=>{const t=c.currentTime;const ns=pts>=15?[523,659,784,1047,1319]:pts>=9?[523,659,784,1047]:pts>=5?[523,659,784]:[523,659];ns.forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type=pts>=15?"square":"sine";o.frequency.setValueAtTime(f,t+i*.12);g.gain.setValueAtTime(.12,t+i*.12);g.gain.exponentialRampToValueAtTime(.001,t+i*.12+.4);o.connect(g).connect(c.destination);o.start(t+i*.12);o.stop(t+i*.12+.4);});}),pass:()=>p(c=>tone(c,"sine",400,300,.25,.08)),discard:()=>p(c=>tone(c,"sawtooth",300,100,.2,.06)),attack:()=>p(c=>{const t=c.currentTime;[200,250,150].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="sawtooth";o.frequency.setValueAtTime(f,t+i*.08);g.gain.setValueAtTime(.15,t+i*.08);g.gain.exponentialRampToValueAtTime(.001,t+i*.08+.15);o.connect(g).connect(c.destination);o.start(t+i*.08);o.stop(t+i*.08+.15);});}),victory:()=>p(c=>{const t=c.currentTime;[523,523,523,698,784,698,784,1047].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type=i>=6?"square":"sine";o.frequency.setValueAtTime(f,t+i*.18);g.gain.setValueAtTime(.15,t+i*.18);g.gain.exponentialRampToValueAtTime(.001,t+i*.18+.5);o.connect(g).connect(c.destination);o.start(t+i*.18);o.stop(t+i*.18+.5);});}),lose:()=>p(c=>{const t=c.currentTime;[392,349,330,294,262].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(f,t+i*.3);g.gain.setValueAtTime(.1,t+i*.3);g.gain.exponentialRampToValueAtTime(.001,t+i*.3+.6);o.connect(g).connect(c.destination);o.start(t+i*.3);o.stop(t+i*.3+.6);});}),battleStart:()=>p(c=>{const t=c.currentTime;[262,330,392,523].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="square";o.frequency.setValueAtTime(f,t+i*.1);g.gain.setValueAtTime(.1,t+i*.1);g.gain.exponentialRampToValueAtTime(.001,t+i*.1+.3);o.connect(g).connect(c.destination);o.start(t+i*.1);o.stop(t+i*.1+.3);});})};})();

/* ── PixelArt SVG ─── */
const PA=({rows,palette,size=100})=>{const h=rows.length,w=Math.max(...rows.map(r=>r.length)),px=size/Math.max(w,h);return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{imageRendering:"pixelated"}}>{rows.map((row,y)=>row.split('').map((ch,x)=>{const col=palette[ch];return col?<rect key={`${x}-${y}`} x={x*px} y={y*px} width={px+.5} height={px+.5} fill={col}/>:null;}))}</svg>;};

/* ── 博士 ─── */
const DrSprite=({size=80})=><PA size={size} palette={{'w':'#eceff1','W':'#cfd8dc','s':'#ffdcb5','S':'#f0c8a0','g':'#455a64','G':'#37474f','e':'#263238','h':'#fff','b':'#4a6cf7','B':'#3949ab','r':'#e53935','u':'#1e88e5','c':'#4fc3f7','C':'#81d4fa','p':'#ffab91','m':'#a1887f','k':'#b0bec5'}} rows={['      WWWWWW      ','     WwWWWwWW     ','    WwWWWWWwWW    ','   WWwWWWWWwWWW   ','    sssssssssss   ','   sssssssssssss  ','  sssgghssgghsss  ','  sssGehssgGehss  ','  ssssssggsssssss ','  sspsskkkksspss  ','  ssssmmmmmmsss   ','   sssssssssss    ','    wwwbwwwwww    ','   wwruwBwwwwww   ','   wwwwwBwwwwwwc  ','   wwwwwbwwwwwwc  ','   wwwwwwwwwwwcCc ','    wwwwwwwwwwcCc ','    wwwwwwwwww c  ','     wwwwwwww     ']} />;

/* ── 原子ドット絵 ─── */
const ATOM_PIXELS={
H:{p:{'a':'#4cff4c','A':'#2e7d32','w':'#fff','e':'#1b5e20'},r:['    aaa      ','   aaaaa     ','  aaaaaaa    ','  aawwaaa    ','  aaewaaA    ','  aaaaaAA    ','   aaapAA    ','   aaaaA     ','    AAA      ']},
O:{p:{'a':'#ff9100','A':'#e65100','w':'#fff','e':'#bf360c'},r:['    aaa      ','   aaaaa     ','  aaaaaaa    ','  aawwaaa    ','  aaewaaA    ','  aaaaaAA    ','   aaapAA    ','   aaaaA     ','    AAA      ']},
C:{p:{'a':'#448aff','A':'#1565c0','w':'#fff','e':'#0d47a1','y':'#ffd600'},r:['   yyyyyy    ','   yaaaaay   ','   aaaaaaa   ','  aaawwaaaa  ','  aaaewaaaA  ','  aaaaaaaaA  ','   aaaaaAA   ','   aAAAAA    ','    AAAA     ','    AA AA    ']},
N:{p:{'a':'#d500f9','A':'#7b1fa2','w':'#fff','e':'#4a148c','b':'#ea80fc'},r:['   b   b     ','   bb bb     ','    aaaaa    ','   aaaaaaa   ','  aawwaaa    ','  aaewaaA    ','  aaaaaAA    ','   aaaaA     ','    AAA      ']},
S:{p:{'a':'#ffd600','A':'#f57f17','w':'#fff','e':'#e65100'},r:['  gg    gg   ','  gg    gg   ','   aaaaaaa   ','  aaawwaaaa  ','  aaaewaaaA  ','  aaaaaaaaA  ','   aatttAA   ','    aaaaA    ','     AAA     ']},
Cl:{p:{'a':'#00e5ff','A':'#00838f','w':'#fff','e':'#006064','t':'#e0f7fa','b':'#80deea'},r:['  tt  tt     ','  bb  bb     ','   aaaaaaa   ','  aaawwaaaa  ','  aaaewaaaA  ','  aaaaaaaaA  ','   aapaaAA   ','    aaaaA    ','     AAA     ']},
Na:{p:{'a':'#ff1744','A':'#c62828','w':'#fff','e':'#b71c1c','y':'#ffd600'},r:['    yyy      ','   yaaay     ','   aaaaaaa   ','  aaawwaaaa  ','  aaaewaaaA  ','  aaaaaaaaA  ','   aaaffAA   ','    aaaaA    ','     AAA     ']},
Cu:{p:{'a':'#ff6e40','A':'#e65100','w':'#fff','e':'#bf360c','y':'#ffd600','h':'#4e342e'},r:['   yyyyyy    ','  yaaaaaay   ','  aaaaaaa    ','  aawwaaaa   ','  aaewaaaA   ','  aaaaaaaaA  ','  aaaaaAA    ','   AAAAA     ','   AA AA     ','   hh hh     ']},
Ag:{p:{'a':'#b0bec5','A':'#546e7a','w':'#fff','e':'#37474f','g':'#fdd835'},r:['    ggg      ','   gaaag     ','   aaaaaaa   ','  aawwaaaa   ','  aaewaaaA   ','  aaaaaaaA   ','   aacaaAA   ','    aaaaA    ','     AAA     ','     AA      ']},
Fe:{p:{'a':'#8d6e63','A':'#4e342e','w':'#fff','e':'#3e2723','r':'#ff1744','h':'#4e342e'},r:['  rr   rr    ','  rr   rr    ','   aaaaaaa   ','  aaawwaaaa  ','  aaaewaaaA  ','  aaaaaaaaA  ','  aaaaraAA   ','   AAAAAA    ','   AA  AA    ','   hh  hh    ']}
};
const AtomSprite=({s,size=40})=>{const d=ATOM_PIXELS[s];return d?<PA rows={d.r} palette={d.p} size={size}/>:<div style={{width:size,height:size,background:"#333"}}/>;};

/* ── 合体モンスタードット絵 ─── */
const COMP_PIXELS={
H2:{p:{'a':'#4cff4c','A':'#2e7d32','w':'#fff','e':'#1b5e20','g':'#69f0ae'},r:['  g        g   ','  aa      aa   ',' aaaa    aaaa  ',' awwaa  aawwa  ',' aewaa  aaewa  ',' aaaaa  aaaaa  ','  aaaaaaaaaaA  ','   aaaaaaaaA   ','   AAAAAAAAA   ','    AAAAAAA    ','     AAAAA     ']},
O2:{p:{'a':'#ff9100','A':'#e65100','w':'#fff','e':'#bf360c','y':'#ffd600'},r:['  y      y     ',' yy      yy    ','  aaaaaaaa     ',' aaaaaaaaaa    ',' aawwaaawwaa   ',' aaewaaaewaA   ',' aaaaaaaaaaaA  ','  aaaaaaaaaaA  ','   fAAAAAAAA   ','   ff AAAA ff  ','   f   AA   f  ']},
H2O:{p:{'a':'#4fc3f7','A':'#0288d1','w':'#fff','e':'#01579b','f':'#039be5','c':'#80d8ff','t':'#b3e5fc'},r:['  ff          f','  ffa        ff',' ffaaa      ff ','  aaaaaaa  ff  ',' aaaaaaaaa     ',' aawwaaawwaaa  ',' aaewaaaewaAA  ',' aaaaaaaaaaaA  ','  aacaaacaaAA  ','   aatttaaA    ','    aaaaaAA    ','     AAAA  AA  ','    AAAA    AA ','   AA    AA   ','   AA    AA   ']},
HCl:{p:{'a':'#76ff03','A':'#33691e','w':'#fff','e':'#1b5e20','t':'#f44336','g':'#b9f6ca'},r:['  gg          ','  gaaaa       ',' aaaaaaa      ',' aawwaaaa     ',' aaewaaaaa    ','  aataaaaaa   ','   aaaaaaaaa  ','    AAAAAaaaa ','     AAAA aaa','      AAA  AA','       AA  AA','        AAAA ','         AA  ']},
CO2:{p:{'a':'#78909c','A':'#455a64','w':'#fff','e':'#263238','c':'#cfd8dc','g':'#ffd700','s':'#90a4ae'},r:['    g g g      ','   ggggggg     ','   ccccccc     ','  ccaaaaaccc   ',' ccaaaaaaaacc  ',' caawwaaawwac  ',' caaewaaaewaA  ',' caaaaaaaaaaA  ','  caakaaakaaA  ','  caaammmaaA   ','   caaaaaAA    ','    cAAAAA     ','   AA    AA    ','   AA    AA    ']},
N2:{p:{'a':'#d500f9','A':'#7b1fa2','w':'#fff','e':'#4a148c','b':'#ea80fc','d':'#e1bee7'},r:['  bb      bb   ',' baa      aab  ',' aaaa    aaaa  ',' awwaa  aawwa  ',' aewaa  aaewa  ',' aaaaa  aaaaa  ','  aaadddddaA   ','   aadddddAA   ','    AAAAAAA    ','   AA    AA    ','   AA    AA    ']},
Cl2:{p:{'a':'#00e5ff','A':'#00838f','w':'#fff','e':'#006064','t':'#e0f7fa','p':'#84ffff','b':'#80deea'},r:['  t   t   t    ','  bb  bb  bb   ','   aaaaaaa     ','  aaaaaaaaa    ',' aawwaaawwaa   ',' aaewaaaewaA   ',' aaaaaaaaaaaA  ','  aapaaapaaAA  ','   aaammmAA    ','    AAAAAA     ','   AA    AA    ']},
NaCl:{p:{'a':'#ffab91','A':'#d84315','w':'#fff','e':'#bf360c','s':'#ffd54f','k':'#ff8a65','h':'#4e342e'},r:['    sssss      ','   sssssss     ','    aaaaaa     ','   aaaaaaaa    ','  aawwaaawwaa  ','  aaewaaaewaA  ','  aaaaaaaaaaA  ','   aaakkkaaA   ',' kkaaaaaaakk   ',' kkaAAAAAAkk   ',' kk AAAAAA kk  ','  k AAAAAA k   ','    AAAAAA     ','   hh    hh    ','   hh    hh    ']},
CuO:{p:{'a':'#ff6e40','A':'#e65100','w':'#fff','e':'#bf360c','y':'#ffd600','h':'#4e342e','g':'#bdbdbd'},r:['     yyy       ','    yaaay      ','   aaaaaaa     ','  aawwaaawwa   ','  aaewaaaewaA  ','  aaaaaaaaaaA  ','   aaakkkaaA   ',' ggaaAAAAaagg  ',' gg AAAAAA gg  ',' gg AAAAAA gg  ','  g AAAAAA g   ','    AAAAAA     ','    AA  AA     ','   hh    hh    ','   hh    hh    ']},
FeO:{p:{'a':'#8d6e63','A':'#5d4037','w':'#fff','e':'#3e2723','r':'#ff1744','h':'#4e342e','g':'#bdbdbd','s':'#a1887f'},r:['   rr  rr      ','   aaaaaaa     ','  aawwaaawwa   ','  aaewaaaewaA  ','  aaaaaaaaaaA  ','  aaaaaaaaAAA  ','  ggggggggg    ',' ggsssssssgg   ',' ggssAAAAssgg  ',' ggsAAAAAsgg   ',' gg sAAAA gg   ','  g  AAAA g    ','     AAAA      ','    hh  hh     ','    hh  hh     ']},
AgCl:{p:{'a':'#b0bec5','A':'#78909c','w':'#fff','e':'#37474f','g':'#fdd835','c':'#eceff1','f':'#cfd8dc'},r:['  cc   cc      ','  ccc ccc      ','   aaaaaa      ','  aaaaaaaa     ',' aawwaaawwaa   ',' aaewaaaewaA   ',' aaaaaaaaaaA   ','  aaagggaaA    ','  ccaAAAAcc    ',' cc  AAAA  cc  ',' c    AA    c  ','      AA       ','  cc      cc   ',' cc        cc  ']},
CuS:{p:{'a':'#ff6e40','A':'#e65100','w':'#fff','e':'#bf360c','r':'#ff1744','y':'#ffd600','h':'#4e342e'},r:['  rr      rr   ',' rraa    aarr  ',' raaaa  aaaar  ','  aaaaaaaaa    ',' aawwaaawwaa   ',' aaewaaaewaA   ',' aaaaaaaaaaaA  ','  aaraaaaraaA  ','   aaAAAAaA    ','    AAAAAA     ','   AA    AA    ','   hh    hh    ']},
FeS:{p:{'a':'#8d6e63','A':'#5d4037','w':'#fff','e':'#3e2723','r':'#ff1744','t':'#a1887f'},r:['        ttt    ','       tt t    ','  aaaaaaa t    ',' aaaaaaaaat    ',' aawwaaaww t   ',' aaewaaaewaA   ',' aaaaaaaaaaaA  ','  aaarrraaAA   ','   aaAAAA      ','    AAAA AA    ','    AA    AA   ','   AA      AA  ']},
NaOH:{p:{'a':'#ff5252','A':'#c62828','w':'#fff','e':'#b71c1c','b':'#7c4dff','B':'#651fff','c':'#b388ff','s':'#ea80fc','h':'#4e342e'},r:['    bbbbb      ','   bbbbbbb     ','   baaaaaab    ','    aaaaaa     ','   aawwaawwaa  ','   aaewaaewaa  ','   aaaaaaaaaa  ','    aaammaa    ','   BBBBBBBBs   ','   BcBBBBcBs   ','   BBBBBBBB    ','    BBBBBB     ','    BB  BB     ','   hh    hh    ']},
H2S:{p:{'a':'#cddc39','A':'#827717','w':'#fff','e':'#33691e','s':'#c6ff00','g':'#f0f4c3'},r:['    ssss       ','   ssssss      ','   saaaaas     ','  saaaaaaas    ','  aawwaaawwa   ','  aaewaaaewaA  ','  aaaaaaaaaaaA ','   aayaaayaA   ','   aaammmAAA   ','    aaaaaA     ','     AAAA      ']},
O3:{p:{'a':'#ff9100','A':'#e65100','w':'#fff','e':'#bf360c','c':'#4fc3f7','g':'#ffd600'},r:['    gggg       ','   gggggg      ','   gaaaaag     ','  gaaaaaaag    ',' aaawwaaawwaa  ',' aaaewaaaewaA  ',' aaaaaaaaaaaA  ','  aacaaacaaA   ',' ccaaammmaacc  ',' cc aaaaaA cc  ','  c  AAAA  c   ','      AA       ','   cc    cc    ']},
SO2:{p:{'a':'#ff5722','A':'#bf360c','w':'#fff','e':'#6d0000','r':'#ff1744','y':'#ffd600','f':'#ff9100'},r:['   yy  yy      ','  yyyy yyyy    ','   aaaaaaa     ','  aaaaaaaaa    ',' aawwaaawwaa   ',' aaewaaaewaA   ',' aaaaaaaaaaaA  ','  aafaaafaaAA  ','  rrAAAAAArr   ',' rrrAAAAAArrr  ',' rr  AAAA  rr  ','      AA       ','    rr  rr     ']},
NH3:{p:{'a':'#ce93d8','A':'#7b1fa2','w':'#fff','e':'#4a148c','p':'#f48fb1','d':'#e1bee7','s':'#ea80fc','c':'#ba68c8'},r:['   ss   ss     ','  ssaa aass    ',' ssaaaaaaass   ','  aaaaaaaaaa   ',' aawwaaawwaa   ',' aaewaaaewaA   ',' aaaaaaaaaaaA  ','  aapaaapaaAA  ','   aadddaaA    ','  ccaAAAAcc    ',' cc  AAAA  cc  ','  c   AA   c   ','      AA       ','   cc    cc    ']},
CH4:{p:{'a':'#ff7043','A':'#d84315','w':'#fff','e':'#bf360c','f':'#ffd600','y':'#ff9100','r':'#ff1744','t':'#ffab91'},r:['  ff      ff   ',' ffff    ffff  ',' f aaaaaaa  f  ','   aaaaaaaaa   ','  aawwaaawwaa  ','  aaewaaaewaA  ','  aaaaaaaaaaaA ','   aayaaayaAA  ','   aaatttaaA   ','    aaaaaa     ','  rrAAAAAArr   ',' rr  AAAA  rr  ','      AA       ','    AA  AA     ']},
SO3:{p:{'a':'#ffee58','A':'#f9a825','w':'#fff','e':'#f57f17','s':'#fdd835','r':'#ff5722','c':'#fff9c4'},r:['  cc   cc      ',' cccc cccc     ','  ccaaaacc     ','   aaaaaaaa    ','  aawwaaawwaa  ','  aaewaaaewaA  ','  aaaaaaaaaaaA ','   aasaaasaAA  ','   aarrrrrAA   ','    aaAAAA     ','  rr  AA  rr   ',' rr   AA   rr  ','      AA       ']},
C2H2:{p:{'a':'#448aff','A':'#1565c0','w':'#fff','e':'#0d47a1','f':'#ffd600','y':'#ff9100','r':'#ff1744'},r:['   ff  ff      ','  ffff ffff    ','   faaaaf      ','   aaaaaaa     ','  aawwaaawwaa  ','  aaewaaaewaA  ','  aaaaaaaaaaaA ','   aayaaayaAA  ','   aarrrrrAA   ','    AAAAAA     ','   AA    AA    ','   AA    AA    ']},
NaHCO3:{p:{'a':'#ffab91','A':'#d84315','w':'#fff','e':'#bf360c','s':'#ffd54f','y':'#ffe082','h':'#5d4037','g':'#ff8a65'},r:['    sssss      ','   syyyyys     ','   syaaays     ','   aaaaaaa     ','  aawwaaawwaa  ','  aaewaaaewaA  ','  aaaaaaaaaaaA ','   aaakkkaaAA  ',' ggaaAAAAaagg  ',' gg AAAAAA gg  ',' gg AAAAAA gg  ','  g AAAAAA g   ','    AAAAAA     ','   hh    hh    ','   hh    hh    ']},
CH4O:{p:{'a':'#80cbc4','A':'#00695c','w':'#fff','e':'#004d40','b':'#b2dfdb','c':'#e0f2f1','s':'#4db6ac','g':'#ffd600'},r:['   cc   cc     ','  cccc cccc    ','   caaaaac     ','   aaaaaaaa    ','  aawwaaawwaa  ','  aaewaaaewaA  ','  aaaaaaaaaaaA ','  bbagggabbAA  ','  bb aaa bbA   ','   b  A   b    ','      A        ','   cc   cc     ','  cc     cc    ']},
Fe2O3:{p:{'a':'#8d6e63','A':'#5d4037','w':'#fff','e':'#3e2723','g':'#ffd700','r':'#ff1744','h':'#4e342e','c':'#a1887f'},r:['   g r g r g   ','   ggggggg     ','   gaaaaag     ','  gaaaaaaaag   ',' aawwaaawwaa   ',' aaewaaaewaA   ',' aaaaaaaaaaaA  ',' raaraaarcaAA  ','  aaAAAAAAAA   ','  ccAAAAAAAA   ',' cc  AAAA  cc  ','      AA       ','    hh  hh     ','    hh  hh     ']},
Na2CO3:{p:{'a':'#ef5350','A':'#c62828','w':'#fff','e':'#b71c1c','f':'#ff9100','y':'#ffd600'},r:['      yy       ','     yyyy      ','    yaaaay     ','   ff aaa ff   ','  ff aawwaa ff ','  f aaewaaaf f ','  f aaaaaaaf f ',' ff  aaaaaA ff ','  ff  AAAA ff  ','   ff AAAA ff  ','    ffAAAAf    ','     fAAf      ','      ff       ','     f  f      ']},
H2SO4:{p:{'a':'#ab47bc','A':'#6a1b9a','w':'#fff','e':'#4a148c','r':'#ff1744','s':'#e040fb'},r:['  rr      rr   ',' rraa    aarr  ','  aaaaaaaaaa   ',' aaaaaaaaaaaa  ',' aawwaaawwaaaa ',' aaewaaaewaAAA ',' aaaaaaaaaaaAA ','  aaraaaaraaA  ',' ssaaammmaaass ','  ss aaaaaAss  ','   s  AAAA s   ','      AAAA     ','     AA  AA    ','    AA    AA   ']},
C7:{p:{'a':'#e040fb','A':'#aa00ff','w':'#fff','e':'#6a1b9a','g':'#ffd700','d':'#ce93d8','r':'#ff1744','b':'#2196f3','n':'#4caf50','k':'#4a148c','G':'#ff8f00','D':'#ab47bc','s':'#ea80fc'},r:['   g r g r g   ','   gGbGgGnGg   ','   gggggggg    ','    dddddddd   ','   dddddddddd  ','  ddwwddddwwdd ','  ddeeddddeedA ','  ddddddddddAA','   ddsdddsddA  ','   ddddddddAA  ','    DDDDDDAA   ','   DD    DDA   ','   kk    kk    ','   kk    kk    ']}
};
const CompSprite=({k,size=48})=>{const d=COMP_PIXELS[k];return d?<PA rows={d.r} palette={d.p} size={size}/>:null;};

/* ── ボスドット絵 ─── */
const BOSS_PIXELS={
1:{p:{'a':'#81D4FA','A':'#4FC3F7','b':'#B3E5FC','w':'#fff','e':'#0d47a1','p':'#f48fb1','h':'#e1f5fe'},r:['     bbb       ','    bhhbb  b   ','   bhhhbbb bb  ','    bbbb  bb   ','    aaaaaaa    ','   aaaaaaaaa   ','  aaawwaawwaa  ','  aaaewaaewaA  ','  aaaaaaaaaaA  ','  aapaaaaapaA  ','  aaaammmaaAA  ','   aaaaaaaAA   ','   AAAAAaaA    ','    AAAAAAA    ','   AA    AA    ']},
2:{p:{'a':'#4FC3F7','A':'#0288d1','b':'#B3E5FC','w':'#fff','e':'#01579b','f':'#039be5','h':'#e1f5fe','p':'#80d8ff'},r:['   f    f      ','  ff    ff     ','  f aaaaaa f   ','    aaaaaaa    ','   aaawwaawwaa ','   aaaewaewaa  ','   aaaaaaaaaa  ','    aapaaapaa  ','    aaammmaa   ','    aaaaaaa    ','     aaaaaa   A','     AAAAAa  AA','      AAAA AAA ','       AAAAA   ','    AA    AA   ']},
3:{p:{'a':'#FFE082','A':'#F9A825','c':'#FFF8E1','w':'#fff','e':'#e65100','d':'#FFC107','k':'#FFF9C4'},r:['    A    A     ','   AA    AA    ','   AAaaaaaaA   ','    aaaaaaaa   ','   aaacaacaaa  ','   aaaeaaeaaa  ','   aaaaaaaaaa  ','    aaaaaaa    ','    aaeaeaa    ','    aaaaaaa    ','     AAAAA     ',' d   AAAAA  d  ',' dd  AA AA dd  ','      A  A     ','  w       w    ']},
4:{p:{'a':'#A5D6A7','A':'#66BB6A','b':'#C8E6C9','w':'#fff','e':'#1b5e20','f':'#81C784'},r:['      fff      ','     faaaf     ','   aaaaaaaaaa  ','  aabaaabaaaa  ','  aaeeaaeeaaa  ','  aaaaaaaaaaaf ',' faaaaaaaaaa f ','  aaapaaapaa   ','   aaammmaa    ','   aaaaaaa     ','    AAAAA      ','ff  AAAAA   ff ',' ff  AAA  ff   ','  ff     ff    ','   ff   ff     ']},
5:{p:{'a':'#FF8A65','A':'#E65100','c':'#FFCCBC','w':'#fff','e':'#BF360C','y':'#FFF200','s':'#D84315','h':'#4E342E'},r:['    aaaaaaa    ','   aaaaaaaaa   ','  aaawwawwaaa  ','  aaayeayeaaa  ','  aaaaaaaaaa   ','   aaammmaa    ','  eeeeeeeeeee  ',' eAAAAAAAAAAAAe ',' eAsAAAsAAAsAe  ',' eAAAAAAAAAAAAe ',' eAsAAAsAAAsAe  ',' eAAAAAAAAAAAAe ','  eeeeeeeeee   ','  hh      hh   ','  hh      hh   ']},
6:{p:{'a':'#B0BEC5','A':'#78909C','c':'#ECEFF1','w':'#fff','e':'#37474F','g':'#546E7A','y':'#FDD835','d':'#455A64'},r:['  a      a     ',' aa  aa  aa    ',' aaaaaaaaaadd  ','  aaacaacaadd  ','  aaaeaaaeadd  ','  aaaaaaaaaddd ','   aaaeaaaddd  ','  gaaaaaaaadd  ',' ggAAAAAAAAddd ',' g AAAAAAsAdyd ',' gg AAAAAAA yd ','  g AAAsAAA  d ','    AAAAAAA    ','    AA   AA    ','    AA   AA    ']},
7:{p:{'a':'#8D6E63','A':'#5D4037','c':'#D7CCC8','w':'#fff','e':'#3E2723','r':'#FF1744','h':'#4E342E'},r:['    hh  hh     ','   eeeeeeee   ','   earrarre    ','   eaaaaaa e   ','   eehhhhee    ','  aa aaaaaa aa ','  aa axaaxa aa ','  AA aaxxa AA  ','  AA axaaxa A  ','  AA aaaaaa A  ','   A AAAAAA    ','  hh AAAAAA hh ','  hh  AAAA  hh ','      AA AA    ','     hh  hh    ']},
8:{p:{'a':'#FDD835','A':'#F9A825','w':'#fff','e':'#E65100','k':'#1a1a1a','g':'#FFF176','t':'#F57F17'},r:['   gg    gg    ','   gg    gg    ','   aaaaaaaaa   ','  aaawwaawwaa  ','  aaakkaakkaA  ','  aaaaaaaaaa A ','  aaeaaaaaaeA  ','   aawaaawaa   ','   aaatttaaa   ','    aaaaaaa    ','    AAAAAA  A  ','     AAAA  AA  ','       AA AA   ','       AAAA    ','        AA     ']},
9:{p:{'s':'#E8D5B7','w':'#E0E0E0','W':'#BDBDBD','e':'#E91E63','E':'#C62828','k':'#424242','K':'#616161','h':'#fff','g':'#455A64','c':'#CE93D8','a':'#1a1a1a'},r:['  K  K K  K    ','  KK KK KK K   ','   kkkkkkkk    ','   kssssssk    ','  ssshhashhass ','  ssseasseass  ','  sssaaassass  ','   ssssssss    ','   sEsssEss    ','    sssssss    ','   wwwwwwww    ','   wWwwwwWw    ','   wwwwwwww c  ','    wwwwww  c  ','    ww  ww  c  ']},
10:{p:{'d':'#CE93D8','D':'#AB47BC','w':'#fff','e':'#6A1B9A','g':'#FFD700','G':'#FF8F00','r':'#F44336','b':'#2196F3','n':'#4CAF50','k':'#4A148C'},r:['   g r g r g   ','   gGbGgGnGg   ','   gggggggg    ','     ddddd     ','    ddddddd    ','   ddhwdhwdd   ','   ddewddewdd  ','   ddddddddd   ','  dddddddddd   ','   dddddddd    ','   DDDdddDDD   ','    DDDdDDD    ','     DDDDD     ','      DDD      ','  w    D    w  ']}
};
const BossSprite=({id,size=120})=>{const d=BOSS_PIXELS[id];return d?<PA rows={d.r} palette={d.p} size={size}/>:<div style={{fontSize:size/2}}>👾</div>;};

/* ── 原子データ (ひらがな/漢字) ─── */
const ATOMS=[
  {s:"H",nh:"すいそ",nk:"水素",color:"#4cff4c",bg:"#c8f7c5",tc:"#1b6e1b",n:18,atk:1},
  {s:"O",nh:"さんそ",nk:"酸素",color:"#ff9100",bg:"#ffe0b2",tc:"#bf360c",n:14,atk:1},
  {s:"C",nh:"たんそ",nk:"炭素",color:"#448aff",bg:"#bbdefb",tc:"#0d47a1",n:9,atk:2},
  {s:"N",nh:"ちっそ",nk:"窒素",color:"#d500f9",bg:"#e1bee7",tc:"#6a1b9a",n:4,atk:3},
  {s:"S",nh:"いおう",nk:"硫黄",color:"#ffd600",bg:"#fff9c4",tc:"#f57f17",n:4,atk:3},
  {s:"Cl",nh:"えんそ",nk:"塩素",color:"#00e5ff",bg:"#b2ebf2",tc:"#006064",n:6,atk:2},
  {s:"Na",nh:"ナトリウム",nk:"ナトリウム",color:"#ff1744",bg:"#f8bbd0",tc:"#b71c1c",n:6,atk:2},
  {s:"Cu",nh:"どう",nk:"銅",color:"#ff6e40",bg:"#ffccbc",tc:"#bf360c",n:4,atk:3},
  {s:"Ag",nh:"ぎん",nk:"銀",color:"#90a4ae",bg:"#cfd8dc",tc:"#37474f",n:4,atk:3},
  {s:"Fe",nh:"てつ",nk:"鉄",color:"#8d6e63",bg:"#d7ccc8",tc:"#3e2723",n:4,atk:3}
];
const getA=s=>ATOMS.find(a=>a.s===s)||ATOMS[0];
const useAN=()=>{const l=useLang();return a=>l==="kanji"?a.nk:a.nh;};
const RARITY={H:1,O:1,C:2,Cl:2,Na:2,N:3,S:3,Cu:3,Ag:3,Fe:3};
const MULT={2:1,3:1.5,4:2,5:2.5,6:3,7:3.5};
const calcPts=a=>{const rare=Object.entries(a).reduce((s,[el,n])=>s+(RARITY[el]||1)*n,0);const cards=Object.values(a).reduce((s,n)=>s+n,0);return Math.round(rare*(MULT[cards]||1));};

/* ── 化合物 (ひらがな/漢字) ─── */
const COMPOUNDS=[
  {k:"H2",f:"H₂",nh:"すいそぶんし",nk:"水素分子",a:{H:2},emoji:"💧"},
  {k:"O2",f:"O₂",nh:"さんそぶんし",nk:"酸素分子",a:{O:2},emoji:"🌬️"},
  {k:"H2O",f:"H₂O",nh:"みず",nk:"水",a:{H:2,O:1},emoji:"🐉"},
  {k:"HCl",f:"HCl",nh:"えんかすいそ",nk:"塩化水素",a:{H:1,Cl:1},emoji:"🐍"},
  {k:"CO2",f:"CO₂",nh:"にさんかたんそ",nk:"二酸化炭素",a:{C:1,O:2},emoji:"💨"},
  {k:"N2",f:"N₂",nh:"ちっそぶんし",nk:"窒素分子",a:{N:2},emoji:"🌸"},
  {k:"Cl2",f:"Cl₂",nh:"えんそぶんし",nk:"塩素分子",a:{Cl:2},emoji:"🫧"},
  {k:"NaCl",f:"NaCl",nh:"えんかナトリウム",nk:"塩化ナトリウム",a:{Na:1,Cl:1},emoji:"🧂"},
  {k:"CuO",f:"CuO",nh:"さんかどう",nk:"酸化銅",a:{Cu:1,O:1},emoji:"⚔️"},
  {k:"FeO",f:"FeO",nh:"さんかてつ",nk:"酸化鉄",a:{Fe:1,O:1},emoji:"🛡️"},
  {k:"AgCl",f:"AgCl",nh:"えんかぎん",nk:"塩化銀",a:{Ag:1,Cl:1},emoji:"🌫️"},
  {k:"CuS",f:"CuS",nh:"りゅうかどう",nk:"硫化銅",a:{Cu:1,S:1},emoji:"👹"},
  {k:"FeS",f:"FeS",nh:"りゅうかてつ",nk:"硫化鉄",a:{Fe:1,S:1},emoji:"🦂"},
  {k:"NaOH",f:"NaOH",nh:"すいさんかナトリウム",nk:"水酸化ナトリウム",a:{Na:1,O:1,H:1},emoji:"🧪"},
  {k:"H2S",f:"H₂S",nh:"りゅうかすいそ",nk:"硫化水素",a:{H:2,S:1},emoji:"🥚"},
  {k:"O3",f:"O₃",nh:"オゾン",nk:"オゾン",a:{O:3},emoji:"🌀"},
  {k:"SO2",f:"SO₂",nh:"にさんかいおう",nk:"二酸化硫黄",a:{S:1,O:2},emoji:"🌋"},
  {k:"NH3",f:"NH₃",nh:"アンモニア",nk:"アンモニア",a:{N:1,H:3},emoji:"💜"},
  {k:"CH4",f:"CH₄",nh:"メタン",nk:"メタン",a:{C:1,H:4},emoji:"🔥"},
  {k:"SO3",f:"SO₃",nh:"さんさんかいおう",nk:"三酸化硫黄",a:{S:1,O:3},emoji:"🌪️"},
  {k:"C2H2",f:"C₂H₂",nh:"アセチレン",nk:"アセチレン",a:{C:2,H:2},emoji:"⚡"},
  {k:"NaHCO3",f:"NaHCO₃",nh:"じゅうそう",nk:"重曹",a:{Na:1,H:1,C:1,O:3},emoji:"🧁"},
  {k:"CH4O",f:"CH₃OH",nh:"メタノール",nk:"メタノール",a:{C:1,H:4,O:1},emoji:"🍶"},
  {k:"Fe2O3",f:"Fe₂O₃",nh:"さんかてつ(III)",nk:"酸化鉄(III)",a:{Fe:2,O:3},emoji:"👑"},
  {k:"Na2CO3",f:"Na₂CO₃",nh:"たんさんナトリウム",nk:"炭酸ナトリウム",a:{Na:2,C:1,O:3},emoji:"🦅"},
  {k:"H2SO4",f:"H₂SO₄",nh:"りゅうさん",nk:"硫酸",a:{H:2,S:1,O:4},emoji:"⚗️"},
  {k:"C7",f:"C₇",nh:"ダイヤモンド",nk:"ダイヤモンド",a:{C:7},emoji:"💎",sp:true}
].map(c=>({...c,atk:c.sp?50:calcPts(c.a)}));
const useCN=()=>{const l=useLang();return c=>l==="kanji"?c.nk:c.nh;};

/* ── ステージ ─── */
const STAGES=[
  {id:1,bossId:1,name:"はじまりの草原",hl:10,deckSize:50,diff:"easy",bossName:"バブリン",bossEmoji:"🫧",bossHp:8,bossColor:"#81D4FA",bossDesc:"シャボン玉のモンスター",intro:"博士「おや、実験室からモンスターが逃げ出したぞ！まずはバブリンを倒すんじゃ！」",win:"博士「やるじゃないか！」",winStory:"博士「バブリンが消えた跡に…水たまりが。何かが動いておるぞ！」",lose:"博士「うーむ、負けてしまったか…もう一回じゃ！」"},
  {id:2,bossId:2,name:"あわの洞窟",hl:10,deckSize:50,diff:"easy",bossName:"アクアン",bossEmoji:"💧",bossHp:14,bossColor:"#4FC3F7",bossDesc:"水竜モンスター",intro:"博士「水たまりからアクアンが現れた！」",win:"博士「すばらしい！」",winStory:"博士「水が蒸発して…白い結晶が！塩のモンスターが現れそうじゃ」",lose:"博士「水攻めにやられたか…次こそ！」"},
  {id:3,bossId:3,name:"結晶の渓谷",hl:9,deckSize:48,diff:"normal",bossName:"ソルティ",bossEmoji:"🧂",bossHp:20,bossColor:"#FFE082",bossDesc:"塩の結晶モンスター",intro:"博士「ソルティじゃ！手札9枚制限じゃ」",win:"博士「溶かしてやったぞ！」",winStory:"博士「風が強くなってきた。目に見えない敵が近づいておる！」",lose:"博士「しょっぱい攻撃にやられた…」"},
  {id:4,bossId:4,name:"風の高原",hl:9,deckSize:48,diff:"normal",bossName:"エアロン",bossEmoji:"💨",bossHp:25,bossColor:"#A5D6A7",bossDesc:"風の精霊",intro:"博士「空気のモンスター・エアロンじゃ！」",win:"博士「吹き飛ばした！実力はホンモノじゃ！」",winStory:"博士「地面がガンガンと…銅のヨロイのモンスターが近づいてくる！」",lose:"博士「風に飛ばされたか…」"},
  {id:5,bossId:5,name:"銅の遺跡",hl:8,deckSize:45,diff:"normal",bossName:"コッパー",bossEmoji:"🪙",bossHp:30,bossColor:"#FF8A65",bossDesc:"銅のヨロイの亀",intro:"博士「コッパーじゃ！手札8枚じゃ！」",win:"博士「ヨロイを貫いたぞ！」",winStory:"博士「ヨロイが砕け散ると…銀色に光る欠片が！銀の騎士が現れた！」",lose:"博士「防御は固いな…作戦を練り直すんじゃ！」"},
  {id:6,bossId:6,name:"銀の城",hl:8,deckSize:45,diff:"hard",bossName:"シルバーグ",bossEmoji:"🥈",bossHp:35,bossColor:"#B0BEC5",bossDesc:"銀の狼騎士",intro:"博士「銀の騎士シルバーグじゃ！」",win:"博士「勝った！」",winStory:"博士「大地が揺れた！鉄の巨人が這い上がってくる！」",lose:"博士「剣さばきにやられたか…」"},
  {id:7,bossId:7,name:"鉄の火山",hl:8,deckSize:45,diff:"hard",bossName:"アイアンX",bossEmoji:"🔩",bossHp:40,bossColor:"#8D6E63",bossDesc:"鉄の巨人",intro:"博士「鉄の巨人アイアンXじゃ！」",win:"博士「倒した！化学パワーはすごい！」",winStory:"博士「残骸から黄色い煙が…硫黄の毒モンスターが現れるぞ！」",lose:"博士「パワーに圧倒されたか…」"},
  {id:8,bossId:8,name:"毒の沼地",hl:7,deckSize:42,diff:"hard",bossName:"サルファー",bossEmoji:"⚡",bossHp:45,bossColor:"#FDD835",bossDesc:"硫黄の毒モンスター",intro:"博士「サルファーじゃ！手札7枚の制限付き！」",win:"博士「浄化した！あと少しじゃ！」",winStory:"博士「毒が晴れると…研究所の奥の扉が開いた！暴走した元同僚・カオスじゃ！」",lose:"博士「毒にやられた…あきらめるな！」"},
  {id:9,bossId:9,name:"暗黒研究所",hl:7,deckSize:42,diff:"hard",bossName:"ドクターカオス",bossEmoji:"⚗️",bossHp:55,bossColor:"#CE93D8",bossDesc:"暴走した科学者",intro:"博士「ドクターカオスじゃ！ワシの元同僚なんじゃ…止めてくれ！」",win:"博士「カオスを止めてくれた！」",winStory:"博士「カオスが正気に戻った！『あの結晶の王を…止めてくれ…』最深部にダイヤキングがおる！」",lose:"博士「危険すぎる…もっと強くなるんじゃ！」"},
  {id:10,bossId:10,name:"結晶の玉座",hl:7,deckSize:40,diff:"hard",bossName:"ダイヤキング",bossEmoji:"💎",bossHp:70,bossColor:"#E040FB",bossDesc:"最強の結晶モンスター",intro:"博士「最強のダイヤキング！すべての頂点に立つ存在じゃ！」",win:"🏆博士「ダイヤキングを倒した！！化学マスターじゃ！！！」",winStory:"博士「やった！ダイヤキングが砕け散った！研究所に平和が戻ったぞ！ありがとう！！」",lose:"博士「ダイヤキングは強い…でもキミなら倒せる！」"}
];

/* ── プロローグ ─── */
const PROLOGUE=["ここは、原子科学研究所。","世界的な化学者・ゲンシ博士が\n日夜研究を続ける場所だ。","ある日、実験中の事故で\n原子エネルギーが暴走！","原子の力を持つモンスターたちが\n研究所から逃げ出してしまった！","博士「大変じゃ！原子モンスターを\n合体させて敵を倒してくれ！」","原子を組み合わせて強いモンスターを作り、\nボスを倒すのだ！"];

/* ── ユーティリティ ─── */
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=0|Math.random()*(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;};
const buildDeck=mx=>{const d=[];let id=0;for(const a of ATOMS)for(let i=0;i<a.n;i++)d.push({id:id++,s:a.s});const s=shuffle(d);return mx?s.slice(0,mx):s;};
const cntA=cards=>{const c={};for(const x of cards)c[x.s]=(c[x.s]||0)+1;return c;};
const findP=hand=>COMPOUNDS.filter(c=>Object.entries(c.a).every(([s,n])=>(cntA(hand)[s]||0)>=n));

/* ── CSS ─── */
const CSS=`
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
@keyframes slideRight{from{transform:translateX(-100%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes titleGlow{0%,100%{text-shadow:2px 2px 0 #003,0 0 6px rgba(80,180,255,.4)}50%{text-shadow:2px 2px 0 #003,0 0 12px rgba(80,180,255,.7),0 0 24px rgba(80,180,255,.3)}}
@keyframes pixelStar{0%,100%{opacity:.15}50%{opacity:.9}}
@keyframes bossIdle{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeScale{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes pulseRing{0%{transform:scale(.8);opacity:0}40%{opacity:1}100%{transform:scale(1.4);opacity:0}}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(80,180,255,.2)}
`;

/* ── UI部品 ─── */
const Stars=({n=30})=>{const s=useRef(Array.from({length:n},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,sz:(1+Math.floor(Math.random()*2))*2,d:2+Math.random()*4,dl:Math.random()*4,co:["#5cf","#fff","#c9f","#8f8","#fc8"][i%5]}))).current;return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>{s.map(s=><div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.sz,height:s.sz,background:s.co,animation:`pixelStar ${s.d}s ${s.dl}s ease-in-out infinite`}}/>)}</div>;};
const Scan=()=><div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.12) 2px,rgba(0,0,0,.12) 4px)",opacity:.5}}/>;
const Btn=({children,onClick,bg="#3355cc",disabled,style,...r})=><button onClick={()=>{if(!disabled){SE.tap();onClick?.();}}} disabled={disabled} style={{border:`3px solid ${disabled?"#444":bg}`,background:disabled?"#222":bg,color:disabled?"#555":"#fff",fontSize:14,fontWeight:700,padding:"12px 20px",boxShadow:disabled?"none":`0 4px 0 rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.2)`,textShadow:disabled?"none":"1px 1px 0 rgba(0,0,0,.6)",...style}} {...r}>{children}</button>;
const SBtn=({l,a,co="#5cf",onClick})=><button onClick={()=>{onClick();SE.tap();}} style={{padding:"6px 10px",border:`2px solid ${a?co:"#333"}`,background:a?co+"22":"#111",color:a?co:"#555",fontSize:12,fontWeight:700}}>{l}</button>;

/* ── 原子カード ─── */
const AtomCard=({card,sel,onTap})=>{const a=getA(card.s);const an=useAN();return <div onClick={()=>onTap?.(card)} style={{width:62,minWidth:62,height:82,background:sel?a.bg:"#161630",border:`3px solid ${sel?a.color:"#334"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:sel?`0 0 8px ${a.color}88`:`0 3px 0 #0a0a1a`,cursor:onTap?"pointer":"default",transition:"all .12s",flexShrink:0,transform:sel?"translateY(-8px)":"none","--g":a.color+"66",animation:sel?"pg 1.5s ease-in-out infinite":"ca .3s ease both",gap:0}}>
  <AtomSprite s={card.s} size={28}/>
  <span style={{fontSize:14,fontWeight:900,color:sel?a.tc:"#fff",textShadow:sel?"none":"1px 1px 0 #000",marginTop:1}}>{card.s}</span>
  <span style={{fontSize:7,color:sel?a.tc+"cc":"#777",fontWeight:700}}>{an(a)}</span>
  <span style={{fontSize:6,color:sel?a.tc+"99":"#555"}}>ATK{a.atk}</span>
</div>;};

/* ── モンスターバッジ ─── */
const MBadge=({comp})=>{const cn=useCN();const t=comp.atk>=20?"#f44":comp.atk>=10?"#f93":comp.atk>=5?"#fc3":"#5f8";const hs=COMP_PIXELS[comp.k];return <div style={{display:"inline-flex",alignItems:"center",gap:3,background:"#111",padding:"3px 6px",border:`2px solid ${t}44`}}>
  {hs?<CompSprite k={comp.k} size={26}/>:<span style={{fontSize:14}}>{comp.emoji}</span>}
  <span style={{fontSize:9,fontWeight:700,color:"#ccc"}}>{cn(comp)}</span>
  {comp.boosted&&<span style={{fontSize:7,color:"#fc3",fontWeight:900}}>×1.5</span>}
  <span style={{fontSize:9,fontWeight:900,color:"#000",background:t,padding:"0 4px"}}>{comp.atk}</span>
</div>;};

/* ── プロローグ ─── */
const Prologue=({onDone})=>{const[pg,setPg]=useState(0);const[fade,setFade]=useState(true);const go=()=>{if(pg>=PROLOGUE.length-1){onDone();return;}setFade(false);setTimeout(()=>{setPg(p=>p+1);setFade(true);},300);SE.tap();};return <div onClick={go} style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,cursor:"pointer",background:"radial-gradient(ellipse at 50% 40%,rgba(80,180,255,.1),transparent 60%),linear-gradient(180deg,#080820,#0c0c30)",position:"relative"}}><Stars n={6}/><Scan/>
  {pg>=1&&<div style={{marginBottom:20,animation:"fadeScale .5s ease both"}}><DrSprite size={pg>=4?120:80}/></div>}
  <div style={{position:"relative",zIndex:2,maxWidth:300,width:"100%",padding:16,background:"rgba(8,8,32,.92)",border:"3px solid rgba(80,180,255,.25)",boxShadow:"0 4px 0 rgba(0,0,0,.4)",opacity:fade?1:0,transition:"opacity .3s",animation:fade?"slideUp .4s ease both":"none"}}><p style={{fontSize:15,color:"rgba(255,255,255,.8)",lineHeight:2,textAlign:"center",whiteSpace:"pre-line",fontWeight:600}}>{PROLOGUE[pg]}</p></div>
  <div style={{display:"flex",gap:6,marginTop:20,zIndex:2}}>{PROLOGUE.map((_,i)=><div key={i} style={{width:i===pg?20:6,height:6,background:i===pg?"#5cf":"rgba(255,255,255,.15)",transition:"all .3s"}}/>)}</div>
  <div style={{marginTop:16,fontSize:12,color:"rgba(255,255,255,.25)",zIndex:2}}>{pg>=PROLOGUE.length-1?"タップしてはじめる":"タップでつぎへ ▶"}</div>
</div>;};

/* ═══════════════════════════════════════════════════════════
   タイトル＋設定＋ステージ選択
   ═══════════════════════════════════════════════════════════ */
const TitleScreen=({onSelectStage,cleared,prologueDone,setPrologueDone,lang,setLang})=>{
  const[mode,setMode]=useState(null);
  const[selStage,setSelStage]=useState(null);

  if(!prologueDone) return <Prologue onDone={()=>setPrologueDone(true)}/>;

  const SettingsPanel=()=><div style={{marginTop:16,padding:14,background:"#0c0c1a",border:"2px solid #223",maxWidth:300,width:"100%"}}>
    <div style={{fontSize:13,fontWeight:900,color:"#fc3",marginBottom:10}}>⚙️ せってい</div>
    <div style={{fontSize:12,color:"#888",fontWeight:700,marginBottom:6}}>🔤 もじ</div>
    <div style={{display:"flex",gap:8,justifyContent:"center"}}><SBtn l="ひらがな" a={lang==="hiragana"} co="#5cf" onClick={()=>setLang("hiragana")}/><SBtn l="漢字" a={lang==="kanji"} co="#5cf" onClick={()=>setLang("kanji")}/></div>
  </div>;

  if(!mode) return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"linear-gradient(180deg,#080820,#0c0c30)",position:"relative"}}><Stars/><Scan/>
    <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{animation:"fl 3s ease-in-out infinite",marginBottom:8}}><DrSprite size={80}/></div>
      <h1 style={{fontSize:14,color:"#5cf",textAlign:"center",letterSpacing:".05em",animation:"titleGlow 4s ease-in-out infinite",fontFamily:"'Press Start 2P','DotGothic16',monospace",lineHeight:2}}>げんし<br/>モンスターバトル</h1>
      <div style={{fontSize:8,color:"#555",marginTop:8,marginBottom:28,fontFamily:"'Press Start 2P',monospace",animation:"pixelStar 2s ease-in-out infinite"}}>- PRESS START -</div>
      <Btn onClick={()=>setMode("stages")} bg="#c62828" style={{padding:"16px 40px",fontSize:18}}>⚔️ あそぶ</Btn>
      <SettingsPanel/>
      <div style={{marginTop:20,display:"flex",gap:6,opacity:.5}}>{[1,3,5,7,10].map(id=><div key={id} style={{animation:`fl ${2+id*.3}s ease-in-out infinite`}}><BossSprite id={id} size={28}/></div>)}</div>
    </div>
  </div>;

  if(mode==="stages"&&!selStage) return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 20px",background:"linear-gradient(180deg,#080820,#0c0c30)",position:"relative"}}><Stars/><Scan/>
    <div style={{position:"relative",zIndex:2,width:"100%",maxWidth:360,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}><DrSprite size={48}/><h2 style={{fontSize:18,fontWeight:900,color:"#fff"}}>ステージ選択</h2></div>
      <div style={{width:"100%",display:"flex",flexDirection:"column",gap:8}}>
        {STAGES.map((st,i)=>{const unlocked=i===0||cleared.has(STAGES[i-1].id);const done=cleared.has(st.id);const dc={easy:"#5f8",normal:"#fc3",hard:"#f44"}[st.diff];
          return <button key={st.id} onClick={()=>{if(unlocked){SE.tap();setSelStage(st);}}} style={{padding:12,border:`2px solid ${unlocked?st.bossColor+'44':'#222'}`,background:unlocked?`${st.bossColor}08`:'#0a0a14',color:"#fff",textAlign:"left",opacity:unlocked?1:.35,position:"relative"}}>
            {done&&<div style={{position:"absolute",top:4,right:8,fontSize:9,color:"#5f8",fontWeight:800}}>✓</div>}
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",background:`${st.bossColor}15`,border:`2px solid ${st.bossColor}33`,flexShrink:0}}>{unlocked?<BossSprite id={st.bossId} size={40}/>:<span style={{fontSize:20}}>🔒</span>}</div>
              <div><div style={{fontSize:13,fontWeight:900}}>{unlocked?`${st.id}. ${st.name}`:"🔒 ???"}</div>
                {unlocked&&<div style={{fontSize:10,color:"#888",marginTop:2}}>{st.bossName} HP{st.bossHp}</div>}
                <div style={{fontSize:10,color:dc,fontWeight:700}}>{"★".repeat({easy:1,normal:2,hard:3}[st.diff])}</div>
              </div></div></button>;})}
      </div>
      <button onClick={()=>setMode(null)} style={{marginTop:18,padding:"10px 24px",border:"2px solid #334",background:"transparent",color:"#666",fontSize:13,fontWeight:700}}>← もどる</button>
    </div></div>;

  if(selStage) return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"linear-gradient(180deg,#080820,#0c0c30)",position:"relative"}}><Stars/><Scan/>
    <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",maxWidth:320}}>
      <div style={{position:"relative",marginBottom:12,animation:"fadeScale .5s ease both"}}><div style={{filter:`drop-shadow(0 8px 40px ${selStage.bossColor}66)`,animation:"fl 3s ease-in-out infinite"}}><BossSprite id={selStage.bossId} size={140}/></div><div style={{position:"absolute",inset:"-30px",borderRadius:"50%",background:`radial-gradient(circle,${selStage.bossColor}22,transparent 70%)`,zIndex:-1,animation:"pulseRing 3s ease-in-out infinite"}}/></div>
      <h2 style={{fontSize:18,fontWeight:900,color:"#fff",fontFamily:"'Press Start 2P','DotGothic16',monospace"}}>{selStage.bossName}</h2>
      <div style={{fontSize:13,color:selStage.bossColor,fontWeight:700,marginBottom:16}}>ステージ {selStage.id}</div>
      <div style={{display:"flex",gap:10,alignItems:"flex-start",width:"100%",marginBottom:16,animation:"slideUp .5s .2s ease both",opacity:0}}><div style={{flexShrink:0}}><DrSprite size={44}/></div><div style={{flex:1,padding:10,background:"#0e0e1e",border:"2px solid #334",position:"relative"}}><div style={{position:"absolute",left:-5,top:10,width:0,height:0,borderTop:"5px solid transparent",borderBottom:"5px solid transparent",borderRight:"5px solid #334"}}/><p style={{fontSize:12,color:"rgba(255,255,255,.7)",lineHeight:1.8,margin:0}}>{selStage.intro}</p></div></div>
      <div style={{display:"flex",gap:10,marginBottom:16,animation:"slideUp .5s .35s ease both",opacity:0}}>
        <div style={{padding:"6px 12px",background:"#0e0e1e",border:"2px solid #223",textAlign:"center"}}><div style={{fontSize:9,color:"#555"}}>てふだ</div><div style={{fontSize:14,fontWeight:900,color:"#5cf"}}>{selStage.hl}</div></div>
        <div style={{padding:"6px 12px",background:"#0e0e1e",border:"2px solid #223",textAlign:"center"}}><div style={{fontSize:9,color:"#555"}}>やまふだ</div><div style={{fontSize:14,fontWeight:900,color:"#fc3"}}>{selStage.deckSize}</div></div>
        <div style={{padding:"6px 12px",background:"#0e0e1e",border:"2px solid #223",textAlign:"center"}}><div style={{fontSize:9,color:"#555"}}>ボスHP</div><div style={{fontSize:14,fontWeight:900,color:"#f44"}}>{selStage.bossHp}</div></div>
      </div>
      <Btn onClick={()=>{SE.battleStart();onSelectStage(selStage);}} bg="#c62828" style={{padding:"14px 44px",fontSize:18,animation:"slideUp .5s .5s ease both",opacity:0}}>⚔️ たたかう！</Btn>
      <button onClick={()=>setSelStage(null)} style={{marginTop:14,padding:"8px 20px",border:"2px solid #334",background:"transparent",color:"#555",fontSize:12,fontWeight:700}}>← もどる</button>
    </div></div>;
};

/* ═══════════════════════════════════════════════════════════
   カードフェーズ（暗記ボーナス付き）
   ═══════════════════════════════════════════════════════════ */
const CardPhase=({stage,onDone})=>{
  const cn=useCN(); const an=useAN();
  const[deck,setDeck]=useState(()=>buildDeck(stage.deckSize));
  const[hand,setHand]=useState([]);
  const[army,setArmy]=useState([]);
  const[sel,setSel]=useState(new Set());
  const[drew,setDrew]=useState(false);
  const[drawnC,setDrawnC]=useState(null);
  const[justFused,setJustFused]=useState(null);
  const[showList,setShowList]=useState(false);
  const[peeked,setPeeked]=useState(false); // リスト見たらtrue
  const hl=stage.hl;
  const totalAtk=army.reduce((s,m)=>s+m.atk,0);
  const canAttack=totalAtk>=stage.bossHp;
  const deckEmpty=deck.length===0;

  useEffect(()=>{const d=[...deck],h=[];for(let i=0;i<3&&d.length>0;i++)h.push(d.pop());setDeck(d);setHand(h);},[]);

  const selCards=hand.filter(c=>sel.has(c.id));
  const selCnt=cntA(selCards);
  const match=COMPOUNDS.find(c=>Object.entries(c.a).every(([s,n])=>(selCnt[s]||0)===n)&&Object.entries(selCnt).every(([s,n])=>(c.a[s]||0)===n));
  const possible=findP(hand);
  const overLimit=hand.length>hl;
  const hc=cntA(hand);

  const toggle=card=>{setSel(p=>{const n=new Set(p);if(n.has(card.id)){n.delete(card.id);SE.deselect();}else{n.add(card.id);SE.select();}return n;});};
  const doDraw=()=>{if(deck.length===0||drew)return;const nd=[...deck],dr=nd.pop();setDeck(nd);setHand(h=>[...h,dr]);setDrew(true);setDrawnC(dr);SE.draw();};
  const doFuse=()=>{
    if(!match)return;
    const mult=peeked?1:1.5;
    const boosted=mult>1?{...match,atk:Math.round(match.atk*mult),origAtk:match.atk,boosted:true}:match;
    const ids=new Set(sel);
    setHand(h=>h.filter(c=>!ids.has(c.id)));
    setArmy(a=>[...a,boosted]);
    setSel(new Set());
    setJustFused(boosted);
    SE.fuse(boosted.atk);
    setTimeout(()=>setJustFused(null),1800);
  };
  const doDiscard=cid=>{setHand(h=>h.filter(c=>c.id!==cid));SE.discard();};
  const doPass=()=>{SE.pass();setDrew(false);setDrawnC(null);};
  const doFinish=()=>onDone(army);

  return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,#080820,#0c0c30)"}}>
    {/* フュージョン演出 */}
    {justFused&&<div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(6,6,18,.95)",animation:"fadeIn .2s ease"}}>
      {COMP_PIXELS[justFused.k]?<div style={{animation:"ca .4s ease both",filter:`drop-shadow(0 8px 30px ${justFused.atk>=20?"rgba(255,50,50,.5)":justFused.atk>=10?"rgba(255,150,50,.5)":"rgba(80,255,128,.5)"})`}}><CompSprite k={justFused.k} size={140}/></div>:<div style={{fontSize:80,animation:"ca .4s ease both"}}>{justFused.emoji}</div>}
      <div style={{fontSize:18,fontWeight:900,color:"#fff",marginTop:8,animation:"su .4s .2s ease both",opacity:0}}>{cn(justFused)}</div>
      <div style={{fontSize:13,color:"#888",marginTop:4,animation:"su .4s .3s ease both",opacity:0}}>{justFused.f}</div>
      <div style={{fontSize:32,fontWeight:900,color:"#fc3",marginTop:8,animation:"su .4s .4s ease both",opacity:0}}>ATK {justFused.atk}</div>
      {justFused.boosted&&<div style={{marginTop:8,animation:"su .3s .6s ease both",opacity:0}}>
        <div style={{fontSize:14,color:"#fc3",fontWeight:900}}>🧠 あんきボーナス ×1.5！</div>
        <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"center",marginTop:6}}>
          <DrSprite size={36}/>
          <div style={{padding:"6px 10px",background:"rgba(255,200,50,.08)",border:"2px solid rgba(255,200,50,.2)",maxWidth:180,textAlign:"left"}}>
            <span style={{fontSize:10,color:"#fc3",fontWeight:700,lineHeight:1.6}}>博士「リストを見ないで作るとは…すごいぞ！」</span>
          </div>
        </div>
      </div>}
    </div>}

    {/* ヘッダー */}
    <div style={{padding:"max(12px,env(safe-area-inset-top)) 14px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #222",background:"rgba(8,8,32,.9)"}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <BossSprite id={stage.bossId} size={28}/>
        <div><div style={{fontSize:11,fontWeight:900,color:"#5cf"}}>{stage.name}</div><div style={{fontSize:9,color:"#555"}}>vs {stage.bossName}</div></div>
      </div>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#555"}}>やま</div><div style={{fontSize:16,fontWeight:900,color:deck.length>10?"#5cf":"#f44"}}>{deck.length}</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#555"}}>ATK</div><div style={{fontSize:16,fontWeight:900,color:canAttack?"#5f8":"#fc3"}}>{totalAtk}</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#555"}}>HP</div><div style={{fontSize:16,fontWeight:900,color:"#f44"}}>{stage.bossHp}</div></div>
      </div>
    </div>

    {army.length>0&&<div style={{padding:"6px 10px",display:"flex",flexWrap:"wrap",gap:3,background:"#0a0a18",borderBottom:"1px solid #181828"}}>{army.map((m,i)=><MBadge key={i} comp={m}/>)}</div>}

    {drawnC&&<div style={{padding:"6px 14px",display:"flex",alignItems:"center",gap:8,background:"rgba(80,180,255,.05)",borderBottom:"1px solid #182838",animation:"su .3s ease"}}><span style={{fontSize:11,color:"#5cf",fontWeight:700}}>ひいた→</span><AtomCard card={drawnC}/></div>}

    {overLimit&&<div style={{padding:"8px 14px",textAlign:"center",background:"rgba(255,50,50,.06)",borderBottom:"1px solid rgba(255,50,50,.1)"}}><span style={{fontSize:12,color:"#f44",fontWeight:800}}>⚠️ てふだ{hl}まいオーバー！</span></div>}

    {canAttack&&!justFused&&<div style={{padding:"8px 14px",textAlign:"center",background:"rgba(255,50,50,.08)",borderBottom:"2px solid rgba(255,50,50,.3)",animation:"su .3s ease"}}>
      <span style={{fontSize:13,color:"#f44",fontWeight:900}}>⚔️ こうげきできるぞ！</span>
      <span style={{fontSize:10,color:"#888",display:"block",marginTop:2}}>もっと集めてもOK</span>
    </div>}

    {/* 暗記ボーナス表示 */}
    {!peeked&&<div style={{padding:"4px 14px",background:"rgba(255,200,50,.04)",borderBottom:"1px solid rgba(255,200,50,.12)",textAlign:"center"}}>
      <span style={{fontSize:10,color:"#fc3",fontWeight:800}}>🧠 リストを見ずにがったい → ATK×1.5！</span>
    </div>}

    {/* メイン */}
    <div style={{flex:1,padding:"10px",overflowY:"auto"}}>
      <div style={{fontSize:11,color:"#555",marginBottom:6,fontWeight:700}}>🃏 てふだ ({hand.length}) — タップでえらぶ</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center"}}>
        {[...hand].sort((a,b)=>"H O C N S Cl Na Cu Ag Fe".split(" ").indexOf(a.s)-"H O C N S Cl Na Cu Ag Fe".split(" ").indexOf(b.s)).map(c=>
          <div key={c.id} style={{position:"relative"}}>
            <AtomCard card={c} sel={sel.has(c.id)} onTap={toggle}/>
            {overLimit&&<button onClick={()=>doDiscard(c.id)} style={{position:"absolute",top:-6,right:-6,width:20,height:20,border:"none",background:"#f44",color:"#fff",fontSize:12,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>×</button>}
          </div>
        )}
      </div>

      {/* 合成プレビュー */}
      {match&&!justFused&&<div style={{marginTop:14,padding:14,background:peeked?"rgba(80,255,128,.04)":"rgba(255,200,50,.06)",border:peeked?"2px solid rgba(80,255,128,.2)":"2px solid rgba(255,200,50,.3)",textAlign:"center",animation:"ca .3s ease"}}>
        <div style={{fontSize:11,color:peeked?"#5f8":"#fc3",fontWeight:700,marginBottom:4}}>がったいできる！{!peeked&&" 🧠×1.5"}</div>
        {COMP_PIXELS[match.k]?<div style={{filter:`drop-shadow(0 4px 12px ${match.atk>=10?"rgba(255,200,50,.4)":"rgba(80,255,128,.3)"})`}}><CompSprite k={match.k} size={80}/></div>:<div style={{fontSize:40}}>{match.emoji}</div>}
        <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>{cn(match)}</div>
        <div style={{fontSize:11,color:"#888"}}>{match.f}</div>
        <div style={{fontSize:20,fontWeight:900,color:peeked?"#5f8":"#fc3",marginTop:2}}>ATK {peeked?match.atk:Math.round(match.atk*1.5)}{!peeked&&<span style={{fontSize:11}}> ←{match.atk}×1.5</span>}</div>
        <Btn onClick={doFuse} bg={peeked?"#228833":"#cc8800"} style={{marginTop:8,padding:"10px 30px",fontSize:15}}>🔗 がったい！</Btn>
      </div>}

      {/* ボスHP目標 */}
      <div style={{marginTop:10,padding:8,background:"#0c0c1a",border:"2px solid #223",textAlign:"center"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <BossSprite id={stage.bossId} size={28}/>
          <span style={{fontSize:12,color:stage.bossColor,fontWeight:900}}>{stage.bossName}</span>
          <span style={{fontSize:14,color:"#f44",fontWeight:900}}>HP {stage.bossHp}</span>
        </div>
        <div style={{marginTop:4,fontSize:11,color:canAttack?"#5f8":"#fc3",fontWeight:700}}>ATK {totalAtk}/{stage.bossHp} {canAttack?"✓ OK！":"— もっとがったい！"}</div>
      </div>

      {/* ─── 化合物リスト（見やすく改善） ─── */}
      <div style={{marginTop:6}}>
        <button onClick={()=>{const next=!showList;setShowList(next);if(next)setPeeked(true);SE.tap();}} style={{width:"100%",padding:10,border:"2px solid #223",background:"#0e0e1e",color:"#555",fontSize:12,fontWeight:700}}>
          📋 {showList?"リストをとじる":"がったいリストを見る"}{!peeked&&<span style={{color:"#fc3",marginLeft:6,fontSize:10}}>※見ると×1.5ボーナス消滅</span>}
        </button>
        {showList&&<div style={{marginTop:4,padding:10,background:"#0c0c1a",border:"2px solid #222",maxHeight:400,overflowY:"auto",animation:"su .2s ease"}}>
          {/* 今作れる */}
          {possible.length>0&&<div style={{marginBottom:10}}>
            <div style={{fontSize:12,color:"#5f8",fontWeight:900,marginBottom:6,padding:"4px 8px",background:"rgba(80,255,128,.06)",border:"1px solid rgba(80,255,128,.15)"}}>🟢 いまつくれる（{possible.length}しゅるい）</div>
            {possible.map(c=><div key={c.k} style={{padding:"8px 10px",marginBottom:4,background:"rgba(80,255,128,.04)",border:"2px solid rgba(80,255,128,.15)",display:"flex",alignItems:"center",gap:8}}>
              {COMP_PIXELS[c.k]?<CompSprite k={c.k} size={36}/>:<span style={{fontSize:24}}>{c.emoji}</span>}
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:900,color:"#5f8"}}>{cn(c)}</div>
                <div style={{fontSize:10,color:"#888"}}>{c.f}</div>
                <div style={{display:"flex",gap:3,marginTop:2}}>{Object.entries(c.a).map(([s,n])=><span key={s} style={{fontSize:9,color:getA(s).color,fontWeight:700,padding:"1px 4px",background:getA(s).color+"15",border:`1px solid ${getA(s).color}33`}}>{s}×{n}</span>)}</div>
              </div>
              <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:900,color:"#000",background:"#5f8",padding:"2px 8px"}}>{c.atk}</div></div>
            </div>)}
          </div>}

          {/* リーチ */}
          {(()=>{const near=COMPOUNDS.map(c=>{let need=0;Object.entries(c.a).forEach(([s,n])=>{const d=n-(hc[s]||0);if(d>0)need+=d;});return{...c,need};}).filter(c=>c.need>0&&c.need<=2).sort((a,b)=>a.need-b.need||b.atk-a.atk);
            return near.length>0&&<div style={{marginBottom:10}}>
              <div style={{fontSize:12,color:"#fc3",fontWeight:900,marginBottom:6,padding:"4px 8px",background:"rgba(255,200,50,.06)",border:"1px solid rgba(255,200,50,.15)"}}>🎯 あとすこし（{near.length}しゅるい）</div>
              {near.map(c=><div key={c.k} style={{padding:"6px 10px",marginBottom:3,background:"rgba(255,200,50,.03)",border:c.need===1?"2px solid rgba(255,200,50,.25)":"1px solid rgba(255,200,50,.1)",display:"flex",alignItems:"center",gap:8}}>
                {COMP_PIXELS[c.k]?<CompSprite k={c.k} size={28}/>:<span style={{fontSize:18}}>{c.emoji}</span>}
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#fc3"}}>{cn(c)} <span style={{fontSize:9,color:"#888"}}>{c.f}</span></div>
                  <div style={{display:"flex",gap:3,marginTop:2}}>{Object.entries(c.a).map(([s,n])=>{const have=hc[s]||0;const ok=have>=n;return <span key={s} style={{fontSize:9,fontWeight:700,padding:"1px 4px",color:ok?getA(s).color:"#fc3",background:ok?getA(s).color+"15":"rgba(255,200,50,.1)",border:`1px solid ${ok?getA(s).color+"33":"#fc3"}`}}>{s}{have}/{n}</span>;})}</div>
                </div>
                <div><span style={{fontSize:10,color:c.need===1?"#f93":"#fc3",fontWeight:900,padding:"1px 6px",border:`1px solid ${c.need===1?"#f93":"rgba(255,200,50,.3)"}`}}>あと{c.need}</span><div style={{fontSize:13,fontWeight:900,color:"#000",background:c.atk>=10?"#f93":"#fc3",padding:"1px 6px",marginTop:3,textAlign:"center"}}>{c.atk}</div></div>
              </div>)}
            </div>;
          })()}

          {/* 全リスト */}
          <div style={{fontSize:12,color:"#555",fontWeight:900,marginBottom:6,padding:"4px 8px",background:"rgba(255,255,255,.02)"}}>📖 ぜんぶ（{COMPOUNDS.length}しゅるい）</div>
          {[...COMPOUNDS].sort((a,b)=>Object.values(a.a).reduce((s,v)=>s+v,0)-Object.values(b.a).reduce((s,v)=>s+v,0)||a.atk-b.atk).map(c=>{const ok=Object.entries(c.a).every(([s,n])=>(hc[s]||0)>=n);
            const near=Object.entries(c.a).reduce((s,[el,n])=>{const d=n-(hc[el]||0);return s+(d>0?d:0);},0);
            return <div key={c.k} style={{padding:"6px 8px",marginBottom:2,background:ok?"rgba(80,255,128,.04)":"#0a0a14",border:ok?"1px solid rgba(80,255,128,.12)":"1px solid #181828",display:"flex",alignItems:"center",gap:6,opacity:ok?1:.6}}>
              {COMP_PIXELS[c.k]?<CompSprite k={c.k} size={24}/>:<span style={{fontSize:16}}>{c.emoji}</span>}
              <div style={{flex:1}}>
                <span style={{fontSize:11,fontWeight:700,color:ok?"#5f8":"#aaa"}}>{cn(c)}</span>
                <span style={{fontSize:9,color:"#555",marginLeft:4}}>{c.f}</span>
                <div style={{display:"flex",gap:2,marginTop:1}}>{Object.entries(c.a).map(([s,n])=><span key={s} style={{fontSize:8,color:getA(s).color,fontWeight:700}}>{s}×{n}</span>)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                {!ok&&near<=2&&<div style={{fontSize:8,color:"#fc3",fontWeight:700}}>あと{near}</div>}
                {ok&&<div style={{fontSize:8,color:"#5f8",fontWeight:700}}>✓</div>}
                <div style={{fontSize:11,fontWeight:900,color:ok?"#000":"#555",background:ok?c.sp?"#c9f":c.atk>=10?"#f93":"#5f8":"#222",padding:"1px 6px"}}>{c.atk}</div>
              </div>
            </div>;})}
        </div>}
      </div>
    </div>

    {/* アクションバー */}
    <div style={{padding:"10px 14px max(20px,env(safe-area-inset-bottom))",borderTop:"1px solid #222",display:"flex",gap:8,background:"rgba(8,8,32,.97)"}}>
      {canAttack&&<Btn onClick={doFinish} bg="#c62828" style={{flex:1,padding:14,fontSize:16,"--g":"rgba(255,50,50,.5)",animation:"pg 1.5s ease-in-out infinite"}}>⚔️ こうげき！</Btn>}
      {!deckEmpty&&!drew&&<Btn onClick={doDraw} bg="#2244aa" style={{flex:1,padding:14,fontSize:canAttack?13:16}}>{canAttack?"🃏 もっとひく":"🃏 カードをひく"}</Btn>}
      {!deckEmpty&&drew&&!overLimit&&<Btn onClick={doPass} bg="#445566" style={{flex:1,padding:14,fontSize:13}}>{possible.length>0?"🔬 パス":"➡️ つぎへ"}</Btn>}
      {deckEmpty&&!canAttack&&<Btn onClick={doFinish} bg="#555" style={{flex:1,padding:14,fontSize:13}}>😢 バトルへ</Btn>}
      {deckEmpty&&drew&&!overLimit&&canAttack&&<Btn onClick={doPass} bg="#445566" style={{padding:14,fontSize:12}}>パス</Btn>}
    </div>
  </div>;
};

/* ═══════════════════════════════════════════════════════════
   バトルフェーズ
   ═══════════════════════════════════════════════════════════ */
const BattlePhase=({army,stage,onResult})=>{
  const cn=useCN();
  const[phase,setPhase]=useState("intro");
  const[bossHp,setBossHp]=useState(stage.bossHp);
  const[shaking,setShaking]=useState(false);
  const[flashW,setFlashW]=useState(false);
  const[chargeIdx,setChargeIdx]=useState(-1);
  const totalAtk=army.reduce((s,m)=>s+m.atk,0);
  const won=totalAtk>=stage.bossHp;

  const particles=useRef(Array.from({length:40},(_,i)=>{const ang=(i/40)*360*Math.PI/180;const dist=60+Math.random()*100;return{id:i,x:Math.cos(ang)*dist,y:Math.sin(ang)*dist,em:["💥","⭐","✨","🔥","💫","⚡"][i%6],sz:16+Math.random()*20,dl:Math.random()*.5};})).current;

  useEffect(()=>{
    if(phase==="intro"){SE.battleStart();setTimeout(()=>setPhase("charge"),2200);}
    if(phase==="charge"){let i=0;const iv=setInterval(()=>{if(i<army.length){setChargeIdx(i);SE.select();i++;}else{clearInterval(iv);setTimeout(()=>setPhase("allAttack"),600);}},300);return()=>clearInterval(iv);}
    if(phase==="allAttack"){SE.attack();setShaking(true);setFlashW(true);setTimeout(()=>setFlashW(false),200);setTimeout(()=>{let step=0;const steps=15;const iv=setInterval(()=>{step++;setBossHp(Math.max(0,stage.bossHp-Math.round(totalAtk*(step/steps))));if(step>=steps){clearInterval(iv);setBossHp(Math.max(0,stage.bossHp-totalAtk));setShaking(false);setTimeout(()=>{if(won)setPhase("bossDeath");else{SE.lose();setPhase("result");}},600);}},80);},400);}
    if(phase==="bossDeath"){SE.fuse(50);setShaking(true);setTimeout(()=>setShaking(false),500);setTimeout(()=>{setFlashW(true);setTimeout(()=>setFlashW(false),300);},800);setTimeout(()=>{SE.victory();setPhase("result");},1800);}
  },[phase]);

  if(phase==="intro") return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(180deg,#100808,#200c0c)",position:"relative"}}><Stars n={15}/><Scan/>
    <div style={{position:"relative",zIndex:2,textAlign:"center"}}>
      <div style={{fontSize:14,color:"#f44",fontWeight:900,marginBottom:16,letterSpacing:".15em",fontFamily:"'Press Start 2P','DotGothic16',monospace",animation:"pg 1s ease-in-out infinite","--g":"rgba(255,50,50,.5)"}}>BATTLE START</div>
      <div style={{animation:"ca .6s ease both"}}><BossSprite id={stage.bossId} size={160}/></div>
      <div style={{fontSize:24,fontWeight:900,color:"#fff",marginTop:12,animation:"su .5s .3s ease both",opacity:0}}>{stage.bossEmoji} {stage.bossName}</div>
      <div style={{marginTop:12,animation:"su .5s .7s ease both",opacity:0}}><span style={{fontSize:18,color:"#f44",fontWeight:900}}>HP {stage.bossHp}</span></div>
      <div style={{marginTop:16,animation:"su .5s .9s ease both",opacity:0}}>
        <div style={{fontSize:10,color:"#5cf",fontWeight:700,marginBottom:4}}>きみのぐんだん ATK {totalAtk}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{army.map((m,i)=><span key={i} style={{fontSize:14}}>{m.emoji}</span>)}</div>
      </div>
    </div>
  </div>;

  return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,#100808,#200c0c)",position:"relative",overflow:"hidden"}}><Stars n={10}/><Scan/>
    {flashW&&<div style={{position:"fixed",inset:0,background:"#fff",zIndex:100,animation:"fadeIn .1s ease"}}/>}
    <div style={{position:"relative",zIndex:2,flex:1,display:"flex",flexDirection:"column",padding:"max(16px,env(safe-area-inset-top)) 14px 24px"}}>
      <div style={{textAlign:"center",marginBottom:10,position:"relative"}}>
        {phase==="bossDeath"?<>
          {particles.map(p=><div key={p.id} style={{position:"absolute",left:"50%",top:"40%",fontSize:p.sz,transform:"translate(-50%,-50%)",animation:`ke .8s ${p.dl}s cubic-bezier(.2,.6,.3,1) forwards`,opacity:0,"--dx":`${p.x}px`,"--dy":`${p.y}px`,zIndex:5}}>{p.em}</div>)}
          <div style={{animation:"shake .5s ease",opacity:.3,filter:"brightness(3) saturate(0)"}}><BossSprite id={stage.bossId} size={120}/></div>
          <div style={{fontSize:28,fontWeight:900,color:"#ff1744",marginTop:8,animation:"ca .3s ease both",textShadow:"0 0 20px #f00"}}>💥 げきは！💥</div>
        </>:<div style={{display:"inline-block",animation:shaking?"shake .3s ease infinite":"bossIdle 3s ease-in-out infinite"}}><BossSprite id={stage.bossId} size={120}/></div>}
        {phase!=="bossDeath"&&<div style={{margin:"8px auto",maxWidth:260}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#f44",fontWeight:700}}><span>{stage.bossEmoji} {stage.bossName}</span><span>HP {Math.max(0,bossHp)}/{stage.bossHp}</span></div>
          <div style={{height:16,background:"#1a0a0a",border:"2px solid #422",overflow:"hidden"}}><div style={{height:"100%",width:`${Math.max(0,bossHp/stage.bossHp*100)}%`,background:bossHp/stage.bossHp>.5?"linear-gradient(90deg,#4caf50,#66bb6a)":bossHp/stage.bossHp>.25?"linear-gradient(90deg,#ff9800,#ffc107)":"linear-gradient(90deg,#f44336,#e57373)",transition:"width .15s ease"}}/></div>
        </div>}
      </div>
      <div style={{fontSize:11,color:"#5cf",fontWeight:700,marginBottom:4}}>{phase==="charge"?"⚡ チャージ中…":phase==="allAttack"?"💥 ぜんいん こうげき！":"⚔️ モンスターぐんだん"} <span style={{color:"#fc3"}}>ATK {totalAtk}</span></div>
      <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:10}}>
        {army.map((m,i)=>{const ch=phase==="charge"&&i<=chargeIdx;const atk=phase==="allAttack";return <div key={i} style={{padding:"3px 6px",background:atk?"rgba(255,200,50,.2)":ch?"rgba(80,180,255,.1)":"#111",border:`2px solid ${atk?"#fc3":ch?"#5cf":"#222"}`,transition:"all .2s",animation:atk?`slideRight .3s ${i*.05}s ease both`:ch?"ca .3s ease both":"none"}}>
          <span style={{fontSize:11}}>{m.emoji}</span><span style={{fontSize:9,fontWeight:700,color:atk?"#fc3":ch?"#5cf":"#ccc",marginLeft:3}}>{cn(m)}</span>
          {m.boosted&&<span style={{fontSize:7,color:"#fc3",marginLeft:2}}>×1.5</span>}
          <span style={{fontSize:9,fontWeight:900,color:atk?"#ff1744":"#888",marginLeft:3}}>{m.atk}</span>
        </div>;})}
      </div>

      {phase==="result"&&<div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"su .5s ease both"}}>
        {won?<>
          <div style={{fontSize:64,animation:"ca .5s ease both",filter:"drop-shadow(0 8px 30px rgba(255,200,50,.5))"}}>🏆</div>
          <div style={{fontSize:18,fontWeight:900,color:"#fc3",marginTop:10,fontFamily:"'Press Start 2P','DotGothic16',monospace"}}>勝利！</div>
          <div style={{display:"flex",gap:8,alignItems:"flex-start",maxWidth:300,width:"100%",marginTop:14,animation:"su .5s .3s ease both",opacity:0}}>
            <DrSprite size={40}/>
            <div style={{flex:1,padding:8,background:"#0e0e1e",border:"2px solid #334",position:"relative"}}><div style={{position:"absolute",left:-5,top:8,width:0,height:0,borderTop:"5px solid transparent",borderBottom:"5px solid transparent",borderRight:"5px solid #334"}}/><p style={{fontSize:11,color:"#fc3",lineHeight:1.8,margin:0}}>{stage.winStory||stage.win}</p></div>
          </div>
        </>:<>
          <div style={{fontSize:64,animation:"ca .5s ease both"}}>😢</div>
          <div style={{fontSize:18,fontWeight:900,color:"#666",marginTop:10}}>敗北…</div>
          <div style={{display:"flex",gap:8,alignItems:"flex-start",maxWidth:300,width:"100%",marginTop:14,animation:"su .5s .3s ease both",opacity:0}}>
            <DrSprite size={40}/>
            <div style={{flex:1,padding:8,background:"#0e0e1e",border:"2px solid #334",position:"relative"}}><div style={{position:"absolute",left:-5,top:8,width:0,height:0,borderTop:"5px solid transparent",borderBottom:"5px solid transparent",borderRight:"5px solid #334"}}/><p style={{fontSize:11,color:"#888",lineHeight:1.8,margin:0}}>{stage.lose}</p></div>
          </div>
          <div style={{fontSize:12,color:"#555",marginTop:8}}>ATK {totalAtk} — あと {stage.bossHp-totalAtk}</div>
        </>}
        <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:20,width:"100%",maxWidth:260}}>
          {won&&STAGES.find(s=>s.id===stage.id+1)&&<Btn onClick={()=>onResult(won,"next")} bg="#c62828" style={{width:"100%",fontSize:14}}>▶ つぎへ</Btn>}
          <Btn onClick={()=>onResult(won,"retry")} bg="#e65100" style={{width:"100%",fontSize:13}}>🔄 もういちど</Btn>
          <Btn onClick={()=>onResult(won,"home")} bg="#334" style={{width:"100%",fontSize:13}}>🏠 トップへ</Btn>
        </div>
      </div>}
    </div>
  </div>;
};

/* ═══════════════════════════════════════════════════════════
   App
   ═══════════════════════════════════════════════════════════ */
window.__App=function App(){
  const[scr,setScr]=useState("title");
  const[stage,setStage]=useState(null);
  const[army,setArmy]=useState([]);
  const[lang,setLang]=useState(()=>{try{return localStorage.getItem("acb_lang")||"hiragana";}catch(e){return "hiragana";}});
  const[cleared,setCleared]=useState(()=>{try{const s=localStorage.getItem("acb_cleared");return s?new Set(JSON.parse(s)):new Set();}catch(e){return new Set();}});
  const[prologueDone,setPrologueDone]=useState(()=>{try{return localStorage.getItem("acb_prologue")==="1";}catch(e){return false;}});

  const saveLang=l=>{setLang(l);try{localStorage.setItem("acb_lang",l);}catch(e){}};
  const saveCleared=c=>{setCleared(c);try{localStorage.setItem("acb_cleared",JSON.stringify([...c]));}catch(e){}};
  const savePrologue=()=>{setPrologueDone(true);try{localStorage.setItem("acb_prologue","1");}catch(e){}};

  const startStage=st=>{setStage(st);setArmy([]);setScr("card");};
  const onCardDone=a=>{setArmy(a);setScr("battle");};
  const onBattleResult=(won,action)=>{
    if(won&&stage){const nc=new Set([...cleared,stage.id]);saveCleared(nc);}
    if(action==="next"){const next=STAGES.find(s=>s.id===stage.id+1);if(next){startStage(next);return;}}
    if(action==="retry"){startStage(stage);return;}
    setScr("title");
  };

  return <LangCtx.Provider value={lang}><style>{CSS}</style>
    {scr==="title"&&<TitleScreen onSelectStage={startStage} cleared={cleared} prologueDone={prologueDone} setPrologueDone={savePrologue} lang={lang} setLang={saveLang}/>}
    {scr==="card"&&stage&&<CardPhase stage={stage} onDone={onCardDone}/>}
    {scr==="battle"&&stage&&<BattlePhase army={army} stage={stage} onResult={onBattleResult}/>}
  </LangCtx.Provider>;
};
