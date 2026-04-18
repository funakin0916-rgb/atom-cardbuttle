const {useState,useEffect,useCallback,useRef,createContext,useContext} = React;
// げんしモンスターバトル 🧪⚔️ v10

/* ── Lang ─── */
const LangCtx=createContext("hiragana");const useLang=()=>useContext(LangCtx);

/* ── SE ─── */
const SE=(()=>{let ctx=null,en=true;const gc=()=>{if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==="suspended")ctx.resume();return ctx;};const p=fn=>{if(!en)return;try{fn(gc());}catch(e){}};const tone=(c,t,f1,f2,d,v=.12)=>{const o=c.createOscillator(),g=c.createGain();o.type=t;o.frequency.setValueAtTime(f1,c.currentTime);if(f2)o.frequency.exponentialRampToValueAtTime(f2,c.currentTime+d*.6);g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.connect(g).connect(c.destination);o.start(c.currentTime);o.stop(c.currentTime+d);};return{setEnabled:v=>{en=v},isEnabled:()=>en,tap:()=>p(c=>tone(c,"sine",1000,null,.05,.05)),draw:()=>p(c=>tone(c,"sine",800,1200,.15,.15)),select:()=>p(c=>tone(c,"triangle",600,900,.1,.1)),deselect:()=>p(c=>tone(c,"triangle",700,400,.1,.08)),fuse:pts=>p(c=>{const t=c.currentTime;const ns=pts>=15?[523,659,784,1047,1319]:pts>=9?[523,659,784,1047]:[523,659,784];ns.forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type=pts>=15?"square":"sine";o.frequency.setValueAtTime(f,t+i*.12);g.gain.setValueAtTime(.12,t+i*.12);g.gain.exponentialRampToValueAtTime(.001,t+i*.12+.4);o.connect(g).connect(c.destination);o.start(t+i*.12);o.stop(t+i*.12+.4);});}),pass:()=>p(c=>tone(c,"sine",400,300,.25,.08)),discard:()=>p(c=>tone(c,"sawtooth",300,100,.2,.06)),attack:()=>p(c=>{const t=c.currentTime;[200,250,150].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="sawtooth";o.frequency.setValueAtTime(f,t+i*.08);g.gain.setValueAtTime(.15,t+i*.08);g.gain.exponentialRampToValueAtTime(.001,t+i*.08+.15);o.connect(g).connect(c.destination);o.start(t+i*.08);o.stop(t+i*.08+.15);});}),victory:()=>p(c=>{const t=c.currentTime;[523,523,523,698,784,698,784,1047].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type=i>=6?"square":"sine";o.frequency.setValueAtTime(f,t+i*.18);g.gain.setValueAtTime(.15,t+i*.18);g.gain.exponentialRampToValueAtTime(.001,t+i*.18+.5);o.connect(g).connect(c.destination);o.start(t+i*.18);o.stop(t+i*.18+.5);});}),lose:()=>p(c=>{const t=c.currentTime;[392,349,330,294,262].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(f,t+i*.3);g.gain.setValueAtTime(.1,t+i*.3);g.gain.exponentialRampToValueAtTime(.001,t+i*.3+.6);o.connect(g).connect(c.destination);o.start(t+i*.3);o.stop(t+i*.3+.6);});}),battleStart:()=>p(c=>{const t=c.currentTime;[262,330,392,523].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="square";o.frequency.setValueAtTime(f,t+i*.1);g.gain.setValueAtTime(.1,t+i*.1);g.gain.exponentialRampToValueAtTime(.001,t+i*.1+.3);o.connect(g).connect(c.destination);o.start(t+i*.1);o.stop(t+i*.1+.3);});})};})();

/* ── BGM ─── */
const BGM=(()=>{let ctx=null,playing=false,nodes=[],timer=null,curTrack="title";const stopAll=()=>{if(timer){clearTimeout(timer);timer=null;}nodes.forEach(n=>{try{n.stop();}catch(e){}});nodes=[];};const TRACKS={title:{mel:[[440,.4],[494,.4],[587,.4],[659,.4],[440,.4],[587,.2],[659,.2],[587,.4],[494,.8],[440,.4],[587,.4],[659,.4],[784,.8],[659,.4],[587,.4],[494,.8],[440,.4],[494,.2],[587,.2],[494,.4],[440,.8],[392,.4],[440,.8]],bas:[[220,.8],[220,.8],[294,.8],[294,.8],[220,.8],[220,.8],[196,.8],[196,.8],[220,.8],[220,.8],[294,.8],[294,.8],[196,.8],[196,.8],[220,1.6]],mt:"triangle",bt:"sine",mv:.05,bv:.03},battle:{mel:[[523,.2],[0,.1],[659,.2],[0,.1],[784,.2],[659,.2],[0,.1],[523,.2],[0,.1],[659,.2],[784,.4],[0,.2],[880,.2],[784,.2],[659,.2],[0,.1],[523,.2],[0,.1],[587,.2],[659,.2],[587,.4],[523,.4],[0,.2],[440,.2],[523,.2],[659,.2],[0,.1],[587,.2],[523,.2],[440,.4],[523,.2],[0,.1],[440,.4],[0,.4]],bas:[[262,.4],[262,.4],[330,.4],[330,.4],[349,.4],[349,.4],[262,.4],[262,.4],[220,.4],[220,.4],[262,.4],[262,.4],[196,.4],[196,.4],[220,.4],[262,.4]],mt:"square",bt:"triangle",mv:.04,bv:.035},battle_hard:{mel:[[330,.1],[0,.05],[330,.1],[0,.05],[330,.1],[0,.1],[494,.15],[0,.05],[440,.2],[0,.1],[392,.1],[0,.05],[440,.1],[0,.05],[494,.2],[0,.1],[523,.15],[0,.05],[494,.2],[0,.1],[659,.15],[0,.05],[587,.15],[0,.05],[494,.2],[440,.1],[0,.05],[392,.2],[0,.1],[330,.1],[0,.05],[392,.1],[0,.05],[440,.15],[0,.05],[494,.2],[0,.1],[587,.2],[0,.1],[523,.15],[0,.05],[494,.2],[440,.15],[0,.05],[392,.2],[0,.1],[330,.2],[0,.1],[294,.3],[0,.2]],bas:[[165,.3],[165,.3],[196,.3],[196,.3],[220,.3],[220,.3],[247,.3],[247,.3],[165,.3],[165,.3],[131,.3],[131,.3],[147,.3],[147,.3],[165,.6]],mt:"sawtooth",bt:"square",mv:.045,bv:.03}};const loop=()=>{if(!playing)return;try{if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==="suspended")ctx.resume();stopAll();const tr=TRACKS[curTrack]||TRACKS.title;const t=ctx.currentTime;let off=0;tr.mel.forEach(([f,d])=>{if(f===0){off+=d;return;}const o=ctx.createOscillator(),g=ctx.createGain();o.type=tr.mt;o.frequency.setValueAtTime(f,t+off);g.gain.setValueAtTime(tr.mv,t+off);g.gain.exponentialRampToValueAtTime(.001,t+off+d*.9);o.connect(g).connect(ctx.destination);o.start(t+off);o.stop(t+off+d);nodes.push(o);off+=d;});const ld=off;let bo=0;tr.bas.forEach(([f,d])=>{if(bo>=ld)return;if(f===0){bo+=d;return;}const o=ctx.createOscillator(),g=ctx.createGain();o.type=tr.bt;o.frequency.setValueAtTime(f,t+bo);g.gain.setValueAtTime(tr.bv,t+bo);g.gain.exponentialRampToValueAtTime(.001,t+bo+d*.85);o.connect(g).connect(ctx.destination);o.start(t+bo);o.stop(t+bo+d);nodes.push(o);bo+=d;});timer=setTimeout(loop,ld*1000-100);}catch(e){}};if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();else if(playing)loop();});return{start:id=>{const t=id||"title";if(playing&&curTrack===t)return;stopAll();curTrack=t;playing=true;loop();},stop:()=>{playing=false;stopAll();},on:()=>playing};})();

/* ── PixelArt ─── */
const PA=({rows,palette,size=100})=>{const h=rows.length,w=Math.max(...rows.map(r=>r.length)),px=size/Math.max(w,h);return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{imageRendering:"pixelated"}}>{rows.map((row,y)=>row.split('').map((ch,x)=>{const col=palette[ch];return col?<rect key={`${x}-${y}`} x={x*px} y={y*px} width={px+.5} height={px+.5} fill={col}/>:null;}))}</svg>;};
const DrSprite=({size=80})=><PA size={size} palette={{'w':'#eceff1','W':'#cfd8dc','s':'#ffdcb5','g':'#455a64','G':'#37474f','e':'#263238','h':'#fff','b':'#4a6cf7','B':'#3949ab','r':'#e53935','u':'#1e88e5','c':'#4fc3f7','C':'#81d4fa','p':'#ffab91','m':'#a1887f','k':'#b0bec5'}} rows={['      WWWWWW      ','     WwWWWwWW     ','    WwWWWWWwWW    ','   WWwWWWWWwWWW   ','    sssssssssss   ','   sssssssssssss  ','  sssgghssgghsss  ','  sssGehssgGehss  ','  ssssssggsssssss ','  sspsskkkksspss  ','  ssssmmmmmmsss   ','   sssssssssss    ','    wwwbwwwwww    ','   wwruwBwwwwww   ','   wwwwwBwwwwwwc  ','   wwwwwbwwwwwwc  ','   wwwwwwwwwwwcCc ','    wwwwwwwwwwcCc ','    wwwwwwwwww c  ','     wwwwwwww     ']} />;

/* ── Atom Pixels ─── */
const ATOM_PIXELS={H:{p:{'a':'#4cff4c','A':'#2e7d32','w':'#fff','e':'#1b5e20'},r:['    aaa      ','   aaaaa     ','  aaaaaaa    ','  aawwaaa    ','  aaewaaA    ','  aaaaaAA    ','   aaapAA    ','   aaaaA     ','    AAA      ']},O:{p:{'a':'#ff9100','A':'#e65100','w':'#fff','e':'#bf360c'},r:['    aaa      ','   aaaaa     ','  aaaaaaa    ','  aawwaaa    ','  aaewaaA    ','  aaaaaAA    ','   aaapAA    ','   aaaaA     ','    AAA      ']},C:{p:{'a':'#448aff','A':'#1565c0','w':'#fff','e':'#0d47a1','y':'#ffd600'},r:['   yyyyyy    ','   yaaaaay   ','   aaaaaaa   ','  aaawwaaaa  ','  aaaewaaaA  ','  aaaaaaaaA  ','   aaaaaAA   ','   aAAAAA    ','    AAAA     ','    AA AA    ']},N:{p:{'a':'#d500f9','A':'#7b1fa2','w':'#fff','e':'#4a148c','b':'#ea80fc'},r:['   b   b     ','   bb bb     ','    aaaaa    ','   aaaaaaa   ','  aawwaaa    ','  aaewaaA    ','  aaaaaAA    ','   aaaaA     ','    AAA      ']},S:{p:{'a':'#ffd600','A':'#f57f17','w':'#fff','e':'#e65100'},r:['  gg    gg   ','  gg    gg   ','   aaaaaaa   ','  aaawwaaaa  ','  aaaewaaaA  ','  aaaaaaaaA  ','   aatttAA   ','    aaaaA    ','     AAA     ']},Cl:{p:{'a':'#00e5ff','A':'#00838f','w':'#fff','e':'#006064','t':'#e0f7fa','b':'#80deea'},r:['  tt  tt     ','  bb  bb     ','   aaaaaaa   ','  aaawwaaaa  ','  aaaewaaaA  ','  aaaaaaaaA  ','   aapaaAA   ','    aaaaA    ','     AAA     ']},Na:{p:{'a':'#ff1744','A':'#c62828','w':'#fff','e':'#b71c1c','y':'#ffd600'},r:['    yyy      ','   yaaay     ','   aaaaaaa   ','  aaawwaaaa  ','  aaaewaaaA  ','  aaaaaaaaA  ','   aaaffAA   ','    aaaaA    ','     AAA     ']},Cu:{p:{'a':'#ff6e40','A':'#e65100','w':'#fff','e':'#bf360c','y':'#ffd600','h':'#4e342e'},r:['   yyyyyy    ','  yaaaaaay   ','  aaaaaaa    ','  aawwaaaa   ','  aaewaaaA   ','  aaaaaaaaA  ','  aaaaaAA    ','   AAAAA     ','   AA AA     ','   hh hh     ']},Ag:{p:{'a':'#b0bec5','A':'#546e7a','w':'#fff','e':'#37474f','g':'#fdd835'},r:['    ggg      ','   gaaag     ','   aaaaaaa   ','  aawwaaaa   ','  aaewaaaA   ','  aaaaaaaA   ','   aacaaAA   ','    aaaaA    ','     AAA     ']},Fe:{p:{'a':'#8d6e63','A':'#4e342e','w':'#fff','e':'#3e2723','r':'#ff1744','h':'#4e342e'},r:['  rr   rr    ','  rr   rr    ','   aaaaaaa   ','  aaawwaaaa  ','  aaaewaaaA  ','  aaaaaaaaA  ','  aaaaraAA   ','   AAAAAA    ','   AA  AA    ','   hh  hh    ']}};
const AtomSprite=({s,size=40})=>{const d=ATOM_PIXELS[s];return d?<PA rows={d.r} palette={d.p} size={size}/>:<div style={{width:size,height:size,background:"#333"}}/>;};

/* ── Compound Pixels ─── */
const COMP_PIXELS={H2:{p:{'a':'#4cff4c','A':'#2e7d32','w':'#fff','e':'#1b5e20','g':'#69f0ae'},r:['  g        g   ','  aa      aa   ',' aaaa    aaaa  ',' awwaa  aawwa  ',' aewaa  aaewa  ',' aaaaa  aaaaa  ','  aaaaaaaaaaA  ','   aaaaaaaaA   ','   AAAAAAAAA   ','    AAAAAAA    ']},O2:{p:{'a':'#ff9100','A':'#e65100','w':'#fff','e':'#bf360c','y':'#ffd600'},r:['  y      y     ',' yy      yy    ','  aaaaaaaa     ',' aaaaaaaaaa    ',' aawwaaawwaa   ',' aaewaaaewaA   ',' aaaaaaaaaaaA  ','  aaaaaaaaaaA  ','   fAAAAAAAA   ','   ff AAAA ff  ']},H2O:{p:{'a':'#4fc3f7','A':'#0288d1','w':'#fff','e':'#01579b','f':'#039be5','c':'#80d8ff','t':'#b3e5fc'},r:['  ff          f','  ffa        ff',' ffaaa      ff ','  aaaaaaa  ff  ',' aaaaaaaaa     ',' aawwaaawwaaa  ',' aaewaaaewaAA  ',' aaaaaaaaaaaA  ','  aacaaacaaAA  ','   aatttaaA    ','    aaaaaAA    ','     AAAA  AA  ','    AAAA    AA ','   AA    AA   ']},HCl:{p:{'a':'#76ff03','A':'#33691e','w':'#fff','e':'#1b5e20','t':'#f44336','g':'#b9f6ca'},r:['  gg          ','  gaaaa       ',' aaaaaaa      ',' aawwaaaa     ',' aaewaaaaa    ','  aataaaaaa   ','   aaaaaaaaa  ','    AAAAAaaaa ','     AAAA aaa','      AAA  AA','       AA  AA','        AAAA ']},CO2:{p:{'a':'#78909c','A':'#455a64','w':'#fff','e':'#263238','c':'#cfd8dc','g':'#ffd700'},r:['    g g g      ','   ggggggg     ','   ccccccc     ','  ccaaaaaccc   ',' ccaaaaaaaacc  ',' caawwaaawwac  ',' caaewaaaewaA  ',' caaaaaaaaaaA  ','  caakaaakaaA  ','   caaaaaAA    ','    cAAAAA     ','   AA    AA    ']},N2:{p:{'a':'#d500f9','A':'#7b1fa2','w':'#fff','e':'#4a148c','b':'#ea80fc','d':'#e1bee7'},r:['  bb      bb   ',' baa      aab  ',' aaaa    aaaa  ',' awwaa  aawwa  ',' aewaa  aaewa  ',' aaaaa  aaaaa  ','  aaadddddaA   ','   aadddddAA   ','    AAAAAAA    ','   AA    AA    ']},Cl2:{p:{'a':'#00e5ff','A':'#00838f','w':'#fff','e':'#006064','t':'#e0f7fa','b':'#80deea'},r:['  t   t   t    ','  bb  bb  bb   ','   aaaaaaa     ','  aaaaaaaaa    ',' aawwaaawwaa   ',' aaewaaaewaA   ',' aaaaaaaaaaaA  ','  aapaaapaaAA  ','   aaammmAA    ','    AAAAAA     ']},NaCl:{p:{'a':'#ffab91','A':'#d84315','w':'#fff','e':'#bf360c','s':'#ffd54f','k':'#ff8a65','h':'#4e342e'},r:['    sssss      ','   sssssss     ','    aaaaaa     ','   aaaaaaaa    ','  aawwaaawwaa  ','  aaewaaaewaA  ','  aaaaaaaaaaA  ','   aaakkkaaA   ',' kkaaaaaaakk   ',' kkaAAAAAAkk   ','    AAAAAA     ','   hh    hh    ']},CuO:{p:{'a':'#ff6e40','A':'#e65100','w':'#fff','e':'#bf360c','y':'#ffd600','h':'#4e342e','g':'#bdbdbd'},r:['     yyy       ','    yaaay      ','   aaaaaaa     ','  aawwaaawwa   ','  aaewaaaewaA  ','  aaaaaaaaaaA  ',' ggaaAAAAaagg  ',' gg AAAAAA gg  ','    AAAAAA     ','   hh    hh    ']},FeO:{p:{'a':'#8d6e63','A':'#5d4037','w':'#fff','e':'#3e2723','r':'#ff1744','h':'#4e342e','g':'#bdbdbd'},r:['   rr  rr      ','   aaaaaaa     ','  aawwaaawwa   ','  aaewaaaewaA  ','  aaaaaaaaaaA  ','  ggggggggg    ',' ggssAAAAssgg  ','  g  AAAA g    ','     AAAA      ','    hh  hh     ']},AgCl:{p:{'a':'#b0bec5','A':'#78909c','w':'#fff','e':'#37474f','g':'#fdd835','c':'#eceff1'},r:['  cc   cc      ','   aaaaaa      ','  aaaaaaaa     ',' aawwaaawwaa   ',' aaewaaaewaA   ',' aaaaaaaaaaA   ','  aaagggaaA    ',' cc  AAAA  cc  ','      AA       ','  cc      cc   ']},CuS:{p:{'a':'#ff6e40','A':'#e65100','w':'#fff','e':'#bf360c','r':'#ff1744','h':'#4e342e'},r:['  rr      rr   ',' rraa    aarr  ','  aaaaaaaaa    ',' aawwaaawwaa   ',' aaewaaaewaA   ',' aaaaaaaaaaaA  ','   aaAAAAaA    ','    AAAAAA     ','   hh    hh    ']},FeS:{p:{'a':'#8d6e63','A':'#5d4037','w':'#fff','e':'#3e2723','r':'#ff1744','t':'#a1887f'},r:['        ttt    ','  aaaaaaa t    ',' aawwaaaww t   ',' aaewaaaewaA   ',' aaaaaaaaaaaA  ','  aaarrraaAA   ','    AAAA AA    ','   AA      AA  ']},NaOH:{p:{'a':'#ff5252','A':'#c62828','w':'#fff','e':'#b71c1c','b':'#7c4dff','B':'#651fff','c':'#b388ff','h':'#4e342e'},r:['    bbbbb      ','   baaaaaab    ','   aawwaawwaa  ','   aaewaaewaa  ','   aaaaaaaaaa  ','   BBBBBBBBs   ','   BBBBBBBB    ','    BB  BB     ','   hh    hh    ']},H2S:{p:{'a':'#cddc39','A':'#827717','w':'#fff','e':'#33691e','s':'#c6ff00'},r:['    ssss       ','   saaaaas     ','  aawwaaawwa   ','  aaewaaaewaA  ','  aaaaaaaaaaaA ','   aaammmAAA   ','    aaaaaA     ','     AAAA      ']},O3:{p:{'a':'#ff9100','A':'#e65100','w':'#fff','e':'#bf360c','c':'#4fc3f7','g':'#ffd600'},r:['    gggg       ','   gaaaaag     ',' aaawwaaawwaa  ',' aaaewaaaewaA  ',' aaaaaaaaaaaA  ','  aacaaacaaA   ',' cc aaaaaA cc  ','      AA       ']},SO2:{p:{'a':'#ff5722','A':'#bf360c','w':'#fff','e':'#6d0000','r':'#ff1744','y':'#ffd600','f':'#ff9100'},r:['   yy  yy      ','   aaaaaaa     ',' aawwaaawwaa   ',' aaewaaaewaA   ',' aaaaaaaaaaaA  ','  rrAAAAAArr   ',' rr  AAAA  rr  ','      AA       ']},NH3:{p:{'a':'#ce93d8','A':'#7b1fa2','w':'#fff','e':'#4a148c','p':'#f48fb1','d':'#e1bee7','s':'#ea80fc','c':'#ba68c8'},r:['   ss   ss     ',' ssaaaaaaass   ',' aawwaaawwaa   ',' aaewaaaewaA   ',' aaaaaaaaaaaA  ','  aapaaapaaAA  ',' cc  AAAA  cc  ','      AA       ']},CH4:{p:{'a':'#ff7043','A':'#d84315','w':'#fff','e':'#bf360c','f':'#ffd600','r':'#ff1744'},r:['  ff      ff   ',' f aaaaaaa  f  ','  aawwaaawwaa  ','  aaewaaaewaA  ','  aaaaaaaaaaaA ','   aaatttaaA   ','  rrAAAAAArr   ','      AA       ','    AA  AA     ']},SO3:{p:{'a':'#ffee58','A':'#f9a825','w':'#fff','e':'#f57f17','r':'#ff5722','c':'#fff9c4'},r:['  cc   cc      ','   aaaaaaaa    ','  aawwaaawwaa  ','  aaewaaaewaA  ','  aaaaaaaaaaaA ','   aarrrrrAA   ','  rr  AA  rr   ','      AA       ']},C2H2:{p:{'a':'#448aff','A':'#1565c0','w':'#fff','e':'#0d47a1','f':'#ffd600','r':'#ff1744'},r:['   ff  ff      ','   aaaaaaa     ','  aawwaaawwaa  ','  aaewaaaewaA  ','  aaaaaaaaaaaA ','   aarrrrrAA   ','   AA    AA    ']},NaHCO3:{p:{'a':'#ffab91','A':'#d84315','w':'#fff','e':'#bf360c','s':'#ffd54f','y':'#ffe082','h':'#5d4037','g':'#ff8a65'},r:['    sssss      ','   aaaaaaa     ','  aawwaaawwaa  ','  aaewaaaewaA  ','  aaaaaaaaaaaA ',' ggaaAAAAaagg  ',' gg AAAAAA gg  ','    AAAAAA     ','   hh    hh    ']},CH4O:{p:{'a':'#80cbc4','A':'#00695c','w':'#fff','e':'#004d40','b':'#b2dfdb','c':'#e0f2f1','g':'#ffd600'},r:['   cc   cc     ','   aaaaaaaa    ','  aawwaaawwaa  ','  aaewaaaewaA  ','  aaaaaaaaaaaA ','  bb aaa bbA   ','      A        ','  cc     cc    ']},Fe2O3:{p:{'a':'#8d6e63','A':'#5d4037','w':'#fff','e':'#3e2723','g':'#ffd700','r':'#ff1744','h':'#4e342e','c':'#a1887f'},r:['   g r g r g   ','   gaaaaag     ',' aawwaaawwaa   ',' aaewaaaewaA   ',' aaaaaaaaaaaA  ','  ccAAAAAAAA   ',' cc  AAAA  cc  ','    hh  hh     ']},Na2CO3:{p:{'a':'#ef5350','A':'#c62828','w':'#fff','e':'#b71c1c','f':'#ff9100','y':'#ffd600'},r:['      yy       ','    yaaaay     ','  ff aawwaa ff ','  f aaewaaaf f ',' ff  aaaaaA ff ','   ff AAAA ff  ','     fAAf      ','     f  f      ']},H2SO4:{p:{'a':'#ab47bc','A':'#6a1b9a','w':'#fff','e':'#4a148c','r':'#ff1744','s':'#e040fb'},r:['  rr      rr   ','  aaaaaaaaaa   ',' aawwaaawwaaaa ',' aaewaaaewaAAA ',' aaaaaaaaaaaAA ',' ssaaammmaaass ','      AAAA     ','    AA    AA   ']},C7:{p:{'a':'#e040fb','A':'#aa00ff','w':'#fff','e':'#6a1b9a','g':'#ffd700','d':'#ce93d8','r':'#ff1744','b':'#2196f3','n':'#4caf50','k':'#4a148c','G':'#ff8f00','D':'#ab47bc'},r:['   g r g r g   ','   gGbGgGnGg   ','   gggggggg    ','   dddddddddd  ','  ddwwddddwwdd ','  ddeeddddeedA ','  ddddddddddAA','   ddddddddAA  ','    DDDDDDAA   ','   kk    kk    ']}};
const CompSprite=({k,size=48})=>{const d=COMP_PIXELS[k];return d?<PA rows={d.r} palette={d.p} size={size}/>:null;};

/* ── Boss Pixels ─── */
const BOSS_PIXELS={1:{p:{'a':'#81D4FA','A':'#4FC3F7','b':'#B3E5FC','w':'#fff','e':'#0d47a1','p':'#f48fb1','h':'#e1f5fe'},r:['     bbb       ','    bhhbb  b   ','   bhhhbbb bb  ','    bbbb  bb   ','    aaaaaaa    ','   aaaaaaaaa   ','  aaawwaawwaa  ','  aaaewaaewaA  ','  aaaaaaaaaaA  ','  aapaaaaapaA  ','  aaaammmaaAA  ','   aaaaaaaAA   ','    AAAAAAA    ','   AA    AA    ']},2:{p:{'a':'#4FC3F7','A':'#0288d1','b':'#B3E5FC','w':'#fff','e':'#01579b','f':'#039be5','h':'#e1f5fe'},r:['   f    f      ','  ff    ff     ','  f aaaaaa f   ','    aaaaaaa    ','   aaawwaawwaa ','   aaaewaewaa  ','   aaaaaaaaaa  ','    aapaaapaa  ','    aaaaaaa    ','     aaaaaa   A','      AAAA AAA ','    AA    AA   ']},3:{p:{'a':'#FFE082','A':'#F9A825','w':'#fff','e':'#e65100','d':'#FFC107'},r:['    A    A     ','   AA    AA    ','   AAaaaaaaA   ','    aaaaaaaa   ','   aaacaacaaa  ','   aaaeaaeaaa  ','   aaaaaaaaaa  ','    aaaaaaa    ','     AAAAA     ',' d   AAAAA  d  ','      A  A     ']},4:{p:{'a':'#A5D6A7','A':'#66BB6A','w':'#fff','e':'#1b5e20','f':'#81C784'},r:['      fff      ','     faaaf     ','   aaaaaaaaaa  ','  aaeeaaeeaaa  ','  aaaaaaaaaaaf ',' faaaaaaaaaa f ','  aaapaaapaa   ','   aaaaaaa     ','    AAAAA      ',' ff  AAA  ff   ','   ff   ff     ']},5:{p:{'a':'#FF8A65','A':'#E65100','w':'#fff','e':'#BF360C','y':'#FFF200','h':'#4E342E'},r:['    aaaaaaa    ','  aaawwawwaaa  ','  aaayeayeaaa  ','  aaaaaaaaaa   ','  eeeeeeeeeee  ',' eAAAAAAAAAAAAe ',' eAsAAAsAAAsAe  ',' eAAAAAAAAAAAAe ','  eeeeeeeeee   ','  hh      hh   ']},6:{p:{'a':'#B0BEC5','A':'#78909C','w':'#fff','e':'#37474F','y':'#FDD835','d':'#455A64'},r:[' aa  aa  aa    ',' aaaaaaaaaadd  ','  aaacaacaadd  ','  aaaeaaaeadd  ','  aaaaaaaaaddd ','  gaaaaaaaadd  ',' g AAAAAAsAdyd ',' gg AAAAAAA yd ','    AAAAAAA    ','    AA   AA    ']},7:{p:{'a':'#8D6E63','A':'#5D4037','w':'#fff','e':'#3E2723','r':'#FF1744','h':'#4E342E'},r:['    hh  hh     ','   eeeeeeee   ','   earrarre    ','   eaaaaaa e   ','  aa aaaaaa aa ','  AA aaxxa AA  ','  AA aaaaaa A  ','   A AAAAAA    ','  hh  AAAA  hh ','     hh  hh    ']},8:{p:{'a':'#FDD835','A':'#F9A825','w':'#fff','e':'#E65100','k':'#1a1a1a','g':'#FFF176','t':'#F57F17'},r:['   gg    gg    ','   aaaaaaaaa   ','  aaawwaawwaa  ','  aaakkaakkaA  ','  aaaaaaaaaa A ','   aawaaawaa   ','    aaaaaaa    ','    AAAAAA  A  ','       AA AA   ','        AA     ']},9:{p:{'s':'#E8D5B7','w':'#E0E0E0','W':'#BDBDBD','e':'#E91E63','E':'#C62828','k':'#424242','K':'#616161','h':'#fff','c':'#CE93D8','a':'#1a1a1a'},r:['  K  K K  K    ','   kkkkkkkk    ','  ssshhashhass ','  ssseasseass  ','   ssssssss    ','   sEsssEss    ','   wwwwwwww    ','   wWwwwwWw    ','    wwwwww  c  ','    ww  ww  c  ']},10:{p:{'d':'#CE93D8','D':'#AB47BC','w':'#fff','e':'#6A1B9A','g':'#FFD700','G':'#FF8F00','r':'#F44336','b':'#2196F3','n':'#4CAF50','k':'#4A148C'},r:['   g r g r g   ','   gGbGgGnGg   ','   gggggggg    ','    ddddddd    ','   ddhwdhwdd   ','   ddewddewdd  ','   ddddddddd   ','   DDDdddDDD   ','     DDDDD     ','  w    D    w  ']}};
const BossSprite=({id,size=120})=>{const d=BOSS_PIXELS[id];return d?<PA rows={d.r} palette={d.p} size={size}/>:<div style={{fontSize:size/2}}>👾</div>;};

/* ── Data ─── */
const ATOMS=[{s:"H",nh:"すいそ",nk:"水素",color:"#4cff4c",bg:"#c8f7c5",tc:"#1b6e1b",n:18,atk:1},{s:"O",nh:"さんそ",nk:"酸素",color:"#ff9100",bg:"#ffe0b2",tc:"#bf360c",n:14,atk:1},{s:"C",nh:"たんそ",nk:"炭素",color:"#448aff",bg:"#bbdefb",tc:"#0d47a1",n:9,atk:2},{s:"N",nh:"ちっそ",nk:"窒素",color:"#d500f9",bg:"#e1bee7",tc:"#6a1b9a",n:4,atk:3},{s:"S",nh:"いおう",nk:"硫黄",color:"#ffd600",bg:"#fff9c4",tc:"#f57f17",n:4,atk:3},{s:"Cl",nh:"えんそ",nk:"塩素",color:"#00e5ff",bg:"#b2ebf2",tc:"#006064",n:6,atk:2},{s:"Na",nh:"ナトリウム",nk:"ナトリウム",color:"#ff1744",bg:"#f8bbd0",tc:"#b71c1c",n:6,atk:2},{s:"Cu",nh:"どう",nk:"銅",color:"#ff6e40",bg:"#ffccbc",tc:"#bf360c",n:4,atk:3},{s:"Ag",nh:"ぎん",nk:"銀",color:"#90a4ae",bg:"#cfd8dc",tc:"#37474f",n:4,atk:3},{s:"Fe",nh:"てつ",nk:"鉄",color:"#8d6e63",bg:"#d7ccc8",tc:"#3e2723",n:4,atk:3}];
const getA=s=>ATOMS.find(a=>a.s===s)||ATOMS[0];const useAN=()=>{const l=useLang();return a=>l==="kanji"?a.nk:a.nh;};
const RARITY={H:1,O:1,C:2,Cl:2,Na:2,N:3,S:3,Cu:3,Ag:3,Fe:3};const MULT={2:1,3:1.5,4:2,5:2.5,6:3,7:3.5};const calcPts=a=>{const rare=Object.entries(a).reduce((s,[el,n])=>s+(RARITY[el]||1)*n,0);const cards=Object.values(a).reduce((s,n)=>s+n,0);return Math.round(rare*(MULT[cards]||1));};

const COMPOUNDS=[{k:"H2",f:"H₂",nh:"すいそぶんし",nk:"水素分子",a:{H:2},emoji:"💧"},{k:"O2",f:"O₂",nh:"さんそぶんし",nk:"酸素分子",a:{O:2},emoji:"🌬️"},{k:"H2O",f:"H₂O",nh:"みず",nk:"水",a:{H:2,O:1},emoji:"🐉"},{k:"HCl",f:"HCl",nh:"えんかすいそ",nk:"塩化水素",a:{H:1,Cl:1},emoji:"🐍"},{k:"CO2",f:"CO₂",nh:"にさんかたんそ",nk:"二酸化炭素",a:{C:1,O:2},emoji:"💨"},{k:"N2",f:"N₂",nh:"ちっそぶんし",nk:"窒素分子",a:{N:2},emoji:"🌸"},{k:"Cl2",f:"Cl₂",nh:"えんそぶんし",nk:"塩素分子",a:{Cl:2},emoji:"🫧"},{k:"NaCl",f:"NaCl",nh:"えんかナトリウム",nk:"塩化ナトリウム",a:{Na:1,Cl:1},emoji:"🧂"},{k:"CuO",f:"CuO",nh:"さんかどう",nk:"酸化銅",a:{Cu:1,O:1},emoji:"⚔️"},{k:"FeO",f:"FeO",nh:"さんかてつ",nk:"酸化鉄",a:{Fe:1,O:1},emoji:"🛡️"},{k:"AgCl",f:"AgCl",nh:"えんかぎん",nk:"塩化銀",a:{Ag:1,Cl:1},emoji:"🌫️"},{k:"CuS",f:"CuS",nh:"りゅうかどう",nk:"硫化銅",a:{Cu:1,S:1},emoji:"👹"},{k:"FeS",f:"FeS",nh:"りゅうかてつ",nk:"硫化鉄",a:{Fe:1,S:1},emoji:"🦂"},{k:"NaOH",f:"NaOH",nh:"すいさんかナトリウム",nk:"水酸化ナトリウム",a:{Na:1,O:1,H:1},emoji:"🧪"},{k:"H2S",f:"H₂S",nh:"りゅうかすいそ",nk:"硫化水素",a:{H:2,S:1},emoji:"🥚"},{k:"O3",f:"O₃",nh:"オゾン",nk:"オゾン",a:{O:3},emoji:"🌀"},{k:"SO2",f:"SO₂",nh:"にさんかいおう",nk:"二酸化硫黄",a:{S:1,O:2},emoji:"🌋"},{k:"NH3",f:"NH₃",nh:"アンモニア",nk:"アンモニア",a:{N:1,H:3},emoji:"💜"},{k:"CH4",f:"CH₄",nh:"メタン",nk:"メタン",a:{C:1,H:4},emoji:"🔥"},{k:"SO3",f:"SO₃",nh:"さんさんかいおう",nk:"三酸化硫黄",a:{S:1,O:3},emoji:"🌪️"},{k:"C2H2",f:"C₂H₂",nh:"アセチレン",nk:"アセチレン",a:{C:2,H:2},emoji:"⚡"},{k:"NaHCO3",f:"NaHCO₃",nh:"じゅうそう",nk:"重曹",a:{Na:1,H:1,C:1,O:3},emoji:"🧁"},{k:"CH4O",f:"CH₃OH",nh:"メタノール",nk:"メタノール",a:{C:1,H:4,O:1},emoji:"🍶"},{k:"Fe2O3",f:"Fe₂O₃",nh:"さんかてつ(III)",nk:"酸化鉄(III)",a:{Fe:2,O:3},emoji:"👑"},{k:"Na2CO3",f:"Na₂CO₃",nh:"たんさんナトリウム",nk:"炭酸ナトリウム",a:{Na:2,C:1,O:3},emoji:"🦅"},{k:"H2SO4",f:"H₂SO₄",nh:"りゅうさん",nk:"硫酸",a:{H:2,S:1,O:4},emoji:"⚗️"},{k:"C7",f:"C₇",nh:"ダイヤモンド",nk:"ダイヤモンド",a:{C:7},emoji:"💎",sp:true}].map(c=>({...c,atk:c.sp?50:calcPts(c.a)}));
const useCN=()=>{const l=useLang();return c=>l==="kanji"?c.nk:c.nh;};

/* ── Stages: 10 main + 5 EX ─── */
const STAGES=[
  {id:1,bossId:1,name:"はじまりの草原",hl:10,deckSize:50,diff:"easy",bossName:"バブリン",bossEmoji:"🫧",bossHp:8,bossColor:"#81D4FA",bossDesc:"シャボン玉のモンスター",intro:"博士「まずはバブリンを倒すんじゃ！」",win:"博士「やるじゃないか！」",winStory:"博士「水たまりの中で何かが動いておるぞ！」",lose:"博士「もう一回じゃ！」"},
  {id:2,bossId:2,name:"あわの洞窟",hl:10,deckSize:50,diff:"easy",bossName:"アクアン",bossEmoji:"💧",bossHp:14,bossColor:"#4FC3F7",bossDesc:"水竜モンスター",intro:"博士「アクアンが現れた！」",win:"博士「すばらしい！」",winStory:"博士「白い結晶が！塩のモンスターが現れそうじゃ」",lose:"博士「次こそ！」"},
  {id:3,bossId:3,name:"結晶の渓谷",hl:9,deckSize:48,diff:"normal",bossName:"ソルティ",bossEmoji:"🧂",bossHp:20,bossColor:"#FFE082",bossDesc:"塩の結晶モンスター",intro:"博士「ソルティじゃ！手札9枚制限じゃ」",win:"博士「溶かしてやったぞ！」",winStory:"博士「風が強くなってきた！」",lose:"博士「しょっぱい攻撃にやられた…」"},
  {id:4,bossId:4,name:"風の高原",hl:9,deckSize:48,diff:"normal",bossName:"エアロン",bossEmoji:"💨",bossHp:25,bossColor:"#A5D6A7",bossDesc:"風の精霊",intro:"博士「エアロンじゃ！」",win:"博士「実力はホンモノじゃ！」",winStory:"博士「銅のヨロイのモンスターが近づいてくる！」",lose:"博士「風に飛ばされたか…」"},
  {id:5,bossId:5,name:"銅の遺跡",hl:8,deckSize:45,diff:"normal",bossName:"コッパー",bossEmoji:"🪙",bossHp:30,bossColor:"#FF8A65",bossDesc:"銅のヨロイの亀",intro:"博士「コッパーじゃ！手札8枚！」",win:"博士「ヨロイを貫いたぞ！」",winStory:"博士「銀の騎士が現れた！」",lose:"博士「作戦を練り直すんじゃ！」"},
  {id:6,bossId:6,name:"銀の城",hl:8,deckSize:45,diff:"hard",bossName:"シルバーグ",bossEmoji:"🥈",bossHp:35,bossColor:"#B0BEC5",bossDesc:"銀の狼騎士",intro:"博士「シルバーグじゃ！」",win:"博士「勝った！」",winStory:"博士「鉄の巨人が這い上がってくる！」",lose:"博士「剣さばきにやられたか…」"},
  {id:7,bossId:7,name:"鉄の火山",hl:8,deckSize:45,diff:"hard",bossName:"アイアンX",bossEmoji:"🔩",bossHp:40,bossColor:"#8D6E63",bossDesc:"鉄の巨人",intro:"博士「アイアンXじゃ！」",win:"博士「化学パワーはすごい！」",winStory:"博士「硫黄の毒モンスターが現れるぞ！」",lose:"博士「パワーに圧倒されたか…」"},
  {id:8,bossId:8,name:"毒の沼地",hl:7,deckSize:42,diff:"hard",bossName:"サルファー",bossEmoji:"⚡",bossHp:45,bossColor:"#FDD835",bossDesc:"硫黄の毒モンスター",intro:"博士「手札7枚の制限付き！」",win:"博士「浄化した！」",winStory:"博士「暴走した元同僚・カオスじゃ！」",lose:"博士「あきらめるな！」"},
  {id:9,bossId:9,name:"暗黒研究所",hl:7,deckSize:42,diff:"hard",bossName:"ドクターカオス",bossEmoji:"⚗️",bossHp:55,bossColor:"#CE93D8",bossDesc:"暴走した科学者",intro:"博士「ワシの元同僚なんじゃ…止めてくれ！」",win:"博士「カオスを止めてくれた！」",winStory:"博士「最深部にダイヤキングがおる！」",lose:"博士「もっと強くなるんじゃ！」"},
  {id:10,bossId:10,name:"結晶の玉座",hl:7,deckSize:40,diff:"hard",bossName:"ダイヤキング",bossEmoji:"💎",bossHp:70,bossColor:"#E040FB",bossDesc:"最強の結晶モンスター",intro:"博士「すべての頂点に立つ存在じゃ！」",win:"博士「化学マスターじゃ！！！」",winStory:"博士「ダイヤキングが砕け散った！…ん？王冠の欠片が怪しく光っておる。モンスターたちが…進化しておる！？EXステージ解放じゃ！」",lose:"博士「キミなら倒せる！」"},
  // ── EXステージ ──
  {id:11,bossId:1,name:"EX はじまりの試練",hl:7,deckSize:38,diff:"hard",bossName:"ネオバブリン",bossEmoji:"🫧",bossHp:50,bossColor:"#00BCD4",bossDesc:"進化したバブリン",ex:true,intro:"博士「バブリンが進化しておる！手札7枚じゃ！」",win:"博士「進化版も倒した！」",winStory:"博士「次は2体が合体したツインメタルじゃ！」",lose:"博士「手札が少ないと厳しいな…」"},
  {id:12,bossId:5,name:"EX 合体の遺跡",hl:7,deckSize:38,diff:"hard",bossName:"ツインメタル",bossEmoji:"⚔️",bossHp:60,bossColor:"#FF6E40",bossDesc:"銅と鉄の合体獣",ex:true,intro:"博士「銅と鉄が合体したツインメタルじゃ！」",win:"博士「合体モンスターも敵じゃないか！」",winStory:"博士「紫色の霧が…毒の女王じゃ！山札が少ない！」",lose:"博士「二重攻撃は強いな…」"},
  {id:13,bossId:4,name:"EX 毒の霧",hl:7,deckSize:35,diff:"hard",bossName:"ポイズンクイーン",bossEmoji:"☠️",bossHp:65,bossColor:"#AB47BC",bossDesc:"毒の女王",ex:true,intro:"博士「山札が少ないから短期決戦じゃ！」",win:"博士「毒の女王を浄化した！」",winStory:"博士「ワシの師匠・プロフェッサーXの力じゃ！」",lose:"博士「一手のミスが致命的じゃ…」"},
  {id:14,bossId:9,name:"EX 師匠の試練",hl:7,deckSize:35,diff:"hard",bossName:"プロフェッサーX",bossEmoji:"🧬",bossHp:75,bossColor:"#5C6BC0",bossDesc:"化学の神",ex:true,intro:"博士「ワシの師匠…化学の神と呼ばれた方じゃ」",win:"博士「師匠を超えた！！天才じゃ！」",winStory:"博士「赤い光が…正体不明の最後の敵じゃ！」",lose:"博士「さすが師匠…」"},
  {id:15,bossId:10,name:"EX 最終決戦",hl:7,deckSize:32,diff:"hard",bossName:"???",bossEmoji:"🌌",bossHp:85,bossColor:"#FF1744",bossDesc:"正体不明のモンスター",ex:true,intro:"博士「正体不明のモンスター！手札7枚＋山札最少の最凶ハンデ！」",win:"博士「あの姿は…若い頃のワシじゃったか！？完全なる化学マスターじゃ！！！」",winStory:"博士「すべてのモンスターが消えた…真の化学マスター！ありがとう！！」",lose:"博士「次元が違う…でもキミなら！」"}
];
const MAIN_CLEAR_ID=10;const ALL_CLEAR_ID=15;

const PROLOGUE=["ここは、原子科学研究所。","世界的な化学者・ゲンシ博士が\n日夜研究を続ける場所だ。","ある日、実験中の事故で\n原子エネルギーが暴走！","原子の力を持つモンスターたちが\n研究所から逃げ出してしまった！","博士「大変じゃ！原子モンスターを\n合体させて敵を倒してくれ！」","原子を組み合わせて強いモンスターを作り、\nボスを倒すのだ！"];

/* ── Utils ─── */
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=0|Math.random()*(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;};
const buildDeck=mx=>{const d=[];let id=0;for(const a of ATOMS)for(let i=0;i<a.n;i++)d.push({id:id++,s:a.s});const s=shuffle(d);return mx?s.slice(0,mx):s;};
const cntA=cards=>{const c={};for(const x of cards)c[x.s]=(c[x.s]||0)+1;return c;};
const findP=hand=>COMPOUNDS.filter(c=>Object.entries(c.a).every(([s,n])=>(cntA(hand)[s]||0)>=n));
const cpuPickBond=(hand,diff)=>{const p=findP(hand);if(!p.length)return null;if(diff==="easy"){if(Math.random()<.5)return null;return[...p].sort((a,b)=>a.atk-b.atk)[0];}if(diff==="normal"){if(Math.random()<.2)return null;const s=[...p].sort((a,b)=>b.atk-a.atk);return s[0|s.length/2]||s[0];}return[...p].sort((a,b)=>b.atk-a.atk)[0];};
const cpuPickCards=(hand,comp)=>{const n={...comp.a},ids=[];for(const c of hand)if(n[c.s]>0){ids.push(c.id);n[c.s]--;}return ids;};

/* ── CSS ─── */
const CSS=`@import url('https://fonts.googleapis.com/css2?family=DotGothic16&family=Press+Start+2P&display=swap');*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none}body{font-family:'DotGothic16',monospace;overflow-x:hidden;background:#080820;image-rendering:pixelated}button{font-family:'DotGothic16',monospace;cursor:pointer;transition:transform .08s}button:active{transform:scale(.93)!important}@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes su{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes pg{0%,100%{box-shadow:0 0 8px var(--g)}50%{box-shadow:0 0 20px var(--g),0 0 40px var(--g)}}@keyframes ca{0%{opacity:0;transform:scale(.6)}60%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}@keyframes ke{0%{opacity:0;transform:translate(0,0) scale(.3)}30%{opacity:1;transform:translate(calc(var(--dx)*.4),calc(var(--dy)*.4)) scale(1.2)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.2)}}@keyframes slideRight{from{transform:translateX(-100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes titleGlow{0%,100%{text-shadow:2px 2px 0 #003,0 0 6px rgba(80,180,255,.4)}50%{text-shadow:2px 2px 0 #003,0 0 12px rgba(80,180,255,.7),0 0 24px rgba(80,180,255,.3)}}@keyframes pixelStar{0%,100%{opacity:.15}50%{opacity:.9}}@keyframes bossIdle{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeScale{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}@keyframes pulseRing{0%{transform:scale(.8);opacity:0}40%{opacity:1}100%{transform:scale(1.4);opacity:0}}@keyframes fw{0%{transform:scale(0);opacity:1}50%{opacity:1}100%{transform:scale(1);opacity:0}}@keyframes cf{0%{transform:translateY(-20px);opacity:0}10%{opacity:.8}90%{opacity:.8}100%{transform:translateY(100vh);opacity:0}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(80,180,255,.2)}`;

/* ── UI Components ─── */
const Stars=({n=30})=>{const s=useRef(Array.from({length:n},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,sz:(1+Math.floor(Math.random()*2))*2,d:2+Math.random()*4,dl:Math.random()*4,co:["#5cf","#fff","#c9f","#8f8","#fc8"][i%5]}))).current;return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>{s.map(s=><div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.sz,height:s.sz,background:s.co,animation:`pixelStar ${s.d}s ${s.dl}s ease-in-out infinite`}}/>)}</div>;};
const Scan=()=><div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.12) 2px,rgba(0,0,0,.12) 4px)",opacity:.5}}/>;
const Btn=({children,onClick,bg="#3355cc",disabled,style,...r})=><button onClick={()=>{if(!disabled){SE.tap();onClick?.();}}} disabled={disabled} style={{border:`3px solid ${disabled?"#444":bg}`,background:disabled?"#222":bg,color:disabled?"#555":"#fff",fontSize:14,fontWeight:700,padding:"12px 20px",boxShadow:disabled?"none":`0 4px 0 rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.2)`,textShadow:disabled?"none":"1px 1px 0 rgba(0,0,0,.6)",...style}} {...r}>{children}</button>;
const SBtn=({l,a,co="#5cf",onClick})=><button onClick={()=>{onClick();SE.tap();}} style={{padding:"6px 10px",border:`2px solid ${a?co:"#333"}`,background:a?co+"22":"#111",color:a?co:"#555",fontSize:12,fontWeight:700}}>{l}</button>;
const BgmBtn=()=>{const[on,setOn]=useState(BGM.on());return <button onClick={()=>{if(on){BGM.stop();setOn(false);}else{BGM.start();setOn(true);}}} style={{padding:"3px 8px",border:`2px solid ${on?"#5cf":"#333"}`,background:on?"#112":"#111",color:on?"#5cf":"#444",fontSize:10,fontWeight:700,position:"fixed",top:"max(8px,env(safe-area-inset-top))",right:8,zIndex:100,fontFamily:"'DotGothic16',monospace"}}>{on?"🔊":"🔇"}</button>;};
const AtomCard=({card,sel,onTap})=>{const a=getA(card.s);const an=useAN();return <div onClick={()=>onTap?.(card)} style={{width:62,minWidth:62,height:82,background:sel?a.bg:"#161630",border:`3px solid ${sel?a.color:"#334"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:sel?`0 0 8px ${a.color}88`:`0 3px 0 #0a0a1a`,cursor:onTap?"pointer":"default",transition:"all .12s",flexShrink:0,transform:sel?"translateY(-8px)":"none","--g":a.color+"66",animation:sel?"pg 1.5s ease-in-out infinite":"ca .3s ease both",gap:0}}><AtomSprite s={card.s} size={28}/><span style={{fontSize:14,fontWeight:900,color:sel?a.tc:"#fff",textShadow:sel?"none":"1px 1px 0 #000",marginTop:1}}>{card.s}</span><span style={{fontSize:7,color:sel?a.tc+"cc":"#777",fontWeight:700}}>{an(a)}</span><span style={{fontSize:6,color:sel?a.tc+"99":"#555"}}>ATK{a.atk}</span></div>;};
const MBadge=({comp})=>{const cn=useCN();const t=comp.atk>=20?"#f44":comp.atk>=10?"#f93":comp.atk>=5?"#fc3":"#5f8";const hs=COMP_PIXELS[comp.k];return <div style={{display:"inline-flex",alignItems:"center",gap:3,background:"#111",padding:"3px 6px",border:`2px solid ${t}44`}}>{hs?<CompSprite k={comp.k} size={26}/>:<span style={{fontSize:14}}>{comp.emoji}</span>}<span style={{fontSize:9,fontWeight:700,color:"#ccc"}}>{cn(comp)}</span>{comp.boosted&&<span style={{fontSize:7,color:"#fc3",fontWeight:900}}>×1.5</span>}<span style={{fontSize:9,fontWeight:900,color:"#000",background:t,padding:"0 4px"}}>{comp.atk}</span></div>;};
const Prologue=({onDone})=>{const[pg,setPg]=useState(0);const[fade,setFade]=useState(true);const go=()=>{if(pg>=PROLOGUE.length-1){onDone();return;}setFade(false);setTimeout(()=>{setPg(p=>p+1);setFade(true);},300);SE.tap();};return <div onClick={go} style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,cursor:"pointer",background:"radial-gradient(ellipse at 50% 40%,rgba(80,180,255,.1),transparent 60%),linear-gradient(180deg,#080820,#0c0c30)",position:"relative"}}><Stars n={6}/><Scan/>{pg>=1&&<div style={{marginBottom:20,animation:"fadeScale .5s ease both"}}><DrSprite size={pg>=4?120:80}/></div>}<div style={{position:"relative",zIndex:2,maxWidth:300,width:"100%",padding:16,background:"rgba(8,8,32,.92)",border:"3px solid rgba(80,180,255,.25)",opacity:fade?1:0,transition:"opacity .3s",animation:fade?"slideUp .4s ease both":"none"}}><p style={{fontSize:15,color:"rgba(255,255,255,.8)",lineHeight:2,textAlign:"center",whiteSpace:"pre-line",fontWeight:600}}>{PROLOGUE[pg]}</p></div><div style={{display:"flex",gap:6,marginTop:20,zIndex:2}}>{PROLOGUE.map((_,i)=><div key={i} style={{width:i===pg?20:6,height:6,background:i===pg?"#5cf":"rgba(255,255,255,.15)",transition:"all .3s"}}/>)}</div><div style={{marginTop:16,fontSize:12,color:"rgba(255,255,255,.25)",zIndex:2}}>{pg>=PROLOGUE.length-1?"タップしてはじめる":"▶"}</div></div>;};

/* ═══════════════════════════════════════════════════════════
   Title + Settings + Stage Select
   ═══════════════════════════════════════════════════════════ */
const TitleScreen=({onSelectStage,onEnding,cleared,prologueDone,setPrologueDone,lang,setLang})=>{
  const[mode,setMode]=useState(null);const[selStage,setSelStage]=useState(null);const[bgmOn,setBgmOn]=useState(BGM.on());const[seOn,setSeOn]=useState(SE.isEnabled());
  if(!prologueDone) return <Prologue onDone={()=>setPrologueDone(true)}/>;

  const mainStages=STAGES.filter(s=>!s.ex);const exStages=STAGES.filter(s=>s.ex);const mainCleared=cleared.has(MAIN_CLEAR_ID);

  // Settings screen
  if(mode==="settings") return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"linear-gradient(180deg,#080820,#0c0c30)",position:"relative"}}><Stars/><Scan/><div style={{position:"relative",zIndex:2,maxWidth:320,width:"100%"}}>
    <h2 style={{fontSize:18,fontWeight:900,color:"#fff",textAlign:"center",marginBottom:20}}>⚙️ せってい</h2>
    <div style={{padding:14,background:"#0c0c1a",border:"2px solid #223",marginBottom:12}}><div style={{fontSize:12,color:"#888",fontWeight:700,marginBottom:8}}>🔤 もじ</div><div style={{display:"flex",gap:8,justifyContent:"center"}}><SBtn l="ひらがな" a={lang==="hiragana"} co="#5cf" onClick={()=>setLang("hiragana")}/><SBtn l="漢字" a={lang==="kanji"} co="#5cf" onClick={()=>setLang("kanji")}/></div></div>
    <div style={{padding:14,background:"#0c0c1a",border:"2px solid #223",marginBottom:12}}><div style={{fontSize:12,color:"#888",fontWeight:700,marginBottom:8}}>🔊 おと</div><div style={{display:"flex",gap:12,justifyContent:"center"}}><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#666"}}>BGM</span><SBtn l="ON" a={bgmOn} co="#5f8" onClick={()=>{BGM.start("title");setBgmOn(true);}}/><SBtn l="OFF" a={!bgmOn} co="#f44" onClick={()=>{BGM.stop();setBgmOn(false);}}/></div><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#666"}}>SE</span><SBtn l="ON" a={seOn} co="#5f8" onClick={()=>{SE.setEnabled(true);setSeOn(true);}}/><SBtn l="OFF" a={!seOn} co="#f44" onClick={()=>{SE.setEnabled(false);setSeOn(false);}}/></div></div></div>
    <button onClick={()=>setMode(null)} style={{width:"100%",padding:"12px",border:"2px solid #334",background:"transparent",color:"#666",fontSize:14,fontWeight:700}}>← もどる</button>
  </div></div>;

  // Title top
  if(!mode) return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"linear-gradient(180deg,#080820,#0c0c30)",position:"relative"}}><Stars/><Scan/>
    <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{animation:"fl 3s ease-in-out infinite",marginBottom:8}}><DrSprite size={80}/></div>
      <h1 style={{fontSize:14,color:"#5cf",textAlign:"center",letterSpacing:".05em",animation:"titleGlow 4s ease-in-out infinite",fontFamily:"'Press Start 2P','DotGothic16',monospace",lineHeight:2}}>げんし<br/>モンスターバトル</h1>
      <div style={{fontSize:8,color:"#555",marginTop:8,marginBottom:24,fontFamily:"'Press Start 2P',monospace",animation:"pixelStar 2s ease-in-out infinite"}}>- PRESS START -</div>
      <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:260}}>
        <Btn onClick={()=>setMode("stages")} bg="#c62828" style={{width:"100%",padding:"14px",fontSize:16,display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}><BossSprite id={1} size={28}/> ストーリー</Btn>
        <Btn onClick={()=>setMode("settings")} bg="#334" style={{width:"100%",padding:"12px",fontSize:14}}>⚙️ せってい</Btn>
        <div style={{display:"flex",gap:6,width:"100%"}}>
          <button onClick={()=>onEnding(false)} style={{flex:1,padding:"6px",border:"1px solid #333",background:"transparent",color:"#555",fontSize:9}}>🌟 エンディング</button>
          <button onClick={()=>onEnding(true)} style={{flex:1,padding:"6px",border:"1px solid #c9f33",background:"transparent",color:"#c9f",fontSize:9}}>💎 TRUE END</button>
        </div>
      </div>
      <div style={{marginTop:20,display:"flex",gap:6,opacity:.5}}>{[1,3,5,7,10].map(id=><div key={id} style={{animation:`fl ${2+id*.3}s ease-in-out infinite`}}><BossSprite id={id} size={28}/></div>)}</div>
    </div>
  </div>;

  // Stage select
  if(mode==="stages"&&!selStage) return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 20px",background:"linear-gradient(180deg,#080820,#0c0c30)",position:"relative"}}><Stars/><Scan/>
    <div style={{position:"relative",zIndex:2,width:"100%",maxWidth:360,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><DrSprite size={48}/><h2 style={{fontSize:18,fontWeight:900,color:"#fff"}}>ステージ選択</h2></div>
      <div style={{width:"100%",display:"flex",flexDirection:"column",gap:6}}>
        {mainStages.map((st,i)=>{const unlocked=i===0||cleared.has(STAGES[i-1].id);const done=cleared.has(st.id);const dc={easy:"#5f8",normal:"#fc3",hard:"#f44"}[st.diff];
          return <button key={st.id} onClick={()=>{if(unlocked){SE.tap();setSelStage(st);}}} style={{padding:10,border:`2px solid ${unlocked?st.bossColor+'44':'#222'}`,background:unlocked?`${st.bossColor}08`:'#0a0a14',color:"#fff",textAlign:"left",opacity:unlocked?1:.35,position:"relative"}}>
            {done&&<div style={{position:"absolute",top:4,right:8,fontSize:9,color:"#5f8",fontWeight:800}}>✓</div>}
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",background:`${st.bossColor}15`,border:`1px solid ${st.bossColor}33`,flexShrink:0}}>{unlocked?<BossSprite id={st.bossId} size={36}/>:<span style={{fontSize:16}}>🔒</span>}</div>
              <div><div style={{fontSize:12,fontWeight:900}}>{unlocked?`${st.id}. ${st.name}`:"🔒"}</div>{unlocked&&<div style={{fontSize:9,color:"#888"}}>{st.bossName} HP{st.bossHp}</div>}<div style={{fontSize:9,color:dc,fontWeight:700}}>{"★".repeat({easy:1,normal:2,hard:3}[st.diff])}</div></div>
            </div></button>;})}

        {/* EX stages */}
        {mainCleared&&<><div style={{textAlign:"center",margin:"8px 0",fontSize:11,fontWeight:900,color:"#c9f"}}>— EX STAGES —</div>
          {exStages.map((st,i)=>{const prev=i===0?MAIN_CLEAR_ID:exStages[i-1].id;const unlocked=cleared.has(prev);const done=cleared.has(st.id);
            return <button key={st.id} onClick={()=>{if(unlocked){SE.tap();setSelStage(st);}}} style={{padding:10,border:`2px solid ${unlocked?st.bossColor+'44':'#222'}`,background:unlocked?`${st.bossColor}08`:'#0a0a14',color:"#fff",textAlign:"left",opacity:unlocked?1:.35,position:"relative"}}>
              {done&&<div style={{position:"absolute",top:4,right:8,fontSize:9,color:"#5f8",fontWeight:800}}>✓</div>}
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",background:`${st.bossColor}15`,border:`1px solid ${st.bossColor}33`,flexShrink:0}}>{unlocked?<BossSprite id={st.bossId} size={36}/>:<span style={{fontSize:16}}>🔒</span>}</div>
                <div><div style={{fontSize:12,fontWeight:900}}>{unlocked?`EX${st.id-10}. ${st.bossName}`:"🔒"}</div>{unlocked&&<div style={{fontSize:9,color:"#888"}}>HP{st.bossHp}</div>}<div style={{fontSize:9,color:"#f44",fontWeight:700}}>★★★</div></div>
              </div></button>;})}</>}
      </div>
      <button onClick={()=>setMode(null)} style={{marginTop:14,padding:"10px 24px",border:"2px solid #334",background:"transparent",color:"#666",fontSize:13,fontWeight:700}}>← もどる</button>
    </div></div>;

  // Stage detail
  if(selStage) return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"linear-gradient(180deg,#080820,#0c0c30)",position:"relative"}}><Stars/><Scan/>
    <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",maxWidth:320}}>
      <div style={{position:"relative",marginBottom:12,animation:"fadeScale .5s ease both"}}><div style={{filter:`drop-shadow(0 8px 40px ${selStage.bossColor}66)`,animation:"fl 3s ease-in-out infinite"}}><BossSprite id={selStage.bossId} size={140}/></div><div style={{position:"absolute",inset:"-30px",borderRadius:"50%",background:`radial-gradient(circle,${selStage.bossColor}22,transparent 70%)`,zIndex:-1,animation:"pulseRing 3s ease-in-out infinite"}}/></div>
      <h2 style={{fontSize:18,fontWeight:900,color:"#fff",fontFamily:"'Press Start 2P','DotGothic16',monospace"}}>{selStage.bossName}</h2>
      <div style={{fontSize:12,color:selStage.bossColor,fontWeight:700,marginBottom:12}}>{selStage.ex?`EX ${selStage.id-10}`:`ステージ ${selStage.id}`}</div>
      <div style={{display:"flex",gap:10,alignItems:"flex-start",width:"100%",marginBottom:12,animation:"slideUp .5s .2s ease both",opacity:0}}><div style={{flexShrink:0}}><DrSprite size={40}/></div><div style={{flex:1,padding:10,background:"#0e0e1e",border:"2px solid #334",position:"relative"}}><div style={{position:"absolute",left:-5,top:10,width:0,height:0,borderTop:"5px solid transparent",borderBottom:"5px solid transparent",borderRight:"5px solid #334"}}/><p style={{fontSize:11,color:"rgba(255,255,255,.7)",lineHeight:1.8,margin:0}}>{selStage.intro}</p></div></div>
      <div style={{display:"flex",gap:10,marginBottom:16,animation:"slideUp .5s .35s ease both",opacity:0}}>
        <div style={{padding:"6px 12px",background:"#0e0e1e",border:"2px solid #223",textAlign:"center"}}><div style={{fontSize:8,color:"#555"}}>てふだ</div><div style={{fontSize:14,fontWeight:900,color:"#5cf"}}>{selStage.hl}</div></div>
        <div style={{padding:"6px 12px",background:"#0e0e1e",border:"2px solid #223",textAlign:"center"}}><div style={{fontSize:8,color:"#555"}}>やまふだ</div><div style={{fontSize:14,fontWeight:900,color:"#fc3"}}>{selStage.deckSize}</div></div>
        <div style={{padding:"6px 12px",background:"#0e0e1e",border:"2px solid #223",textAlign:"center"}}><div style={{fontSize:8,color:"#555"}}>HP</div><div style={{fontSize:14,fontWeight:900,color:"#f44"}}>{selStage.bossHp}</div></div>
      </div>
      <Btn onClick={()=>{SE.battleStart();onSelectStage(selStage);}} bg="#c62828" style={{padding:"14px 44px",fontSize:18,animation:"slideUp .5s .5s ease both",opacity:0}}>⚔️ たたかう！</Btn>
      <button onClick={()=>setSelStage(null)} style={{marginTop:12,padding:"8px 20px",border:"2px solid #334",background:"transparent",color:"#555",fontSize:12,fontWeight:700}}>←</button>
    </div></div>;
};

/* ═══════════════════════════════════════════════════════════
   CardPhase (shared for story + CPU)
   ═══════════════════════════════════════════════════════════ */
const CardPhase=({stage,onDone,cpuDiff})=>{
  const cn=useCN();const an=useAN();
  const isCpu=!!cpuDiff;
  const[deck,setDeck]=useState(()=>buildDeck(stage.deckSize));
  const[hand,setHand]=useState([]);const[cpuHand,setCpuHand]=useState([]);
  const[army,setArmy]=useState([]);const[cpuArmy,setCpuArmy]=useState([]);
  const[sel,setSel]=useState(new Set());const[drew,setDrew]=useState(false);const[drawnC,setDrawnC]=useState(null);
  const[justFused,setJustFused]=useState(null);const[showList,setShowList]=useState(false);const[peeked,setPeeked]=useState(false);
  const[cpuMsg,setCpuMsg]=useState(null);const[turn,setTurn]=useState("player");
  const hl=stage.hl;const totalAtk=army.reduce((s,m)=>s+m.atk,0);const cpuAtk=cpuArmy.reduce((s,m)=>s+m.atk,0);
  const canAttack=!isCpu&&totalAtk>=stage.bossHp;const deckEmpty=deck.length===0;

  useEffect(()=>{const d=[...deck],h=[],ch=[];for(let i=0;i<3;i++){if(d.length>0)h.push(d.pop());if(isCpu&&d.length>0)ch.push(d.pop());}setDeck(d);setHand(h);if(isCpu)setCpuHand(ch);},[]);

  const selCards=hand.filter(c=>sel.has(c.id));const selCnt=cntA(selCards);
  const match=COMPOUNDS.find(c=>Object.entries(c.a).every(([s,n])=>(selCnt[s]||0)===n)&&Object.entries(selCnt).every(([s,n])=>(c.a[s]||0)===n));
  const possible=findP(hand);const overLimit=hand.length>hl;const hc=cntA(hand);

  const toggle=card=>{setSel(p=>{const n=new Set(p);if(n.has(card.id)){n.delete(card.id);SE.deselect();}else{n.add(card.id);SE.select();}return n;});};
  const doDraw=()=>{if(deckEmpty||drew)return;const nd=[...deck],dr=nd.pop();setDeck(nd);setHand(h=>[...h,dr]);setDrew(true);setDrawnC(dr);SE.draw();};
  const doFuse=()=>{if(!match)return;const mult=peeked?1:1.5;const boosted=mult>1?{...match,atk:Math.round(match.atk*mult),boosted:true}:match;const ids=new Set(sel);setHand(h=>h.filter(c=>!ids.has(c.id)));setArmy(a=>[...a,boosted]);setSel(new Set());setJustFused(boosted);SE.fuse(boosted.atk);setTimeout(()=>setJustFused(null),1500);};
  const doDiscard=cid=>{setHand(h=>h.filter(c=>c.id!==cid));SE.discard();};
  const doPass=()=>{SE.pass();setDrew(false);setDrawnC(null);if(isCpu){setTurn("cpu");setTimeout(()=>runCpu(),800);}};
  const doFinish=()=>{if(isCpu){onDone({myArmy:army,cpuArmy});}else{onDone(army);}};

  const runCpu=()=>{setDeck(pd=>{const nd=[...pd];if(!nd.length){setTimeout(()=>doFinish(),500);return nd;}const dr=nd.pop();setCpuHand(h=>{const nh=[...h,dr];setTimeout(()=>{const bond=cpuPickBond(nh,cpuDiff);if(bond){const ids=new Set(cpuPickCards(nh,bond));setCpuHand(ch=>ch.filter(c=>!ids.has(c.id)));setCpuArmy(a=>[...a,bond]);setCpuMsg({action:"bond",comp:bond});SE.fuse(bond.atk);}else{setCpuMsg({action:"pass"});SE.pass();}setTimeout(()=>{setCpuMsg(null);setTurn("player");setDrew(false);setDrawnC(null);if(!nd.length)setTimeout(()=>doFinish(),500);},1200);},600);return nh;});return nd;});};

  return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,#080820,#0c0c30)"}}>
    {justFused&&<div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(6,6,18,.95)",animation:"fadeIn .2s ease"}}>{COMP_PIXELS[justFused.k]?<div style={{animation:"ca .4s ease both",filter:"drop-shadow(0 8px 30px rgba(80,255,128,.5))"}}><CompSprite k={justFused.k} size={140}/></div>:<div style={{fontSize:80,animation:"ca .4s ease both"}}>{justFused.emoji}</div>}<div style={{fontSize:18,fontWeight:900,color:"#fff",marginTop:8,animation:"su .4s .2s ease both",opacity:0}}>{cn(justFused)}</div><div style={{fontSize:28,fontWeight:900,color:"#fc3",marginTop:8,animation:"su .4s .4s ease both",opacity:0}}>ATK {justFused.atk}</div>{justFused.boosted&&<div style={{marginTop:6,fontSize:13,color:"#fc3",fontWeight:900,animation:"su .3s .6s ease both",opacity:0}}>🧠 ×1.5！</div>}</div>}
    {cpuMsg&&<div style={{position:"fixed",inset:0,zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(6,6,18,.9)",animation:"fadeIn .2s ease"}}><div style={{textAlign:"center",animation:"ca .3s ease both"}}><div style={{fontSize:48,marginBottom:8}}>🤖</div><div style={{fontSize:16,fontWeight:900,color:"#f93"}}>CPUのターン</div>{cpuMsg.action==="bond"&&<><div style={{fontSize:14,color:"#5f8",marginTop:8}}>がったい！</div><div style={{fontSize:32,marginTop:4}}>{cpuMsg.comp.emoji}</div><div style={{fontSize:14,fontWeight:900,color:"#fff"}}>{cn(cpuMsg.comp)}</div><div style={{fontSize:14,color:"#fc3",fontWeight:900}}>+{cpuMsg.comp.atk}</div></>}{cpuMsg.action==="pass"&&<div style={{fontSize:14,color:"#888",marginTop:8}}>パス…</div>}</div></div>}

    {/* Header */}
    <div style={{padding:"max(12px,env(safe-area-inset-top)) 14px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #222",background:"rgba(8,8,32,.9)"}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        {!isCpu&&<BossSprite id={stage.bossId} size={28}/>}
        {isCpu&&<span style={{fontSize:20}}>🤖</span>}
        <div><div style={{fontSize:11,fontWeight:900,color:isCpu?(turn==="player"?"#5cf":"#f93"):"#5cf"}}>{isCpu?(turn==="player"?"きみのターン":"CPU"):stage.name}</div>{!isCpu&&<div style={{fontSize:9,color:"#555"}}>vs {stage.bossName}</div>}</div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#555"}}>やま</div><div style={{fontSize:14,fontWeight:900,color:deck.length>10?"#5cf":"#f44"}}>{deck.length}</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:7,color:isCpu?"#5cf":"#555"}}>{isCpu?"きみ":"ATK"}</div><div style={{fontSize:14,fontWeight:900,color:canAttack?"#5f8":"#fc3"}}>{totalAtk}</div></div>
        {isCpu?<div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#f93"}}>CPU</div><div style={{fontSize:14,fontWeight:900,color:"#f44"}}>{cpuAtk}</div></div>:<div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#555"}}>HP</div><div style={{fontSize:14,fontWeight:900,color:"#f44"}}>{stage.bossHp}</div></div>}
      </div>
    </div>

    {/* Armies */}
    {(army.length>0||cpuArmy.length>0)&&<div style={{padding:"4px 10px",background:"#0a0a18",borderBottom:"1px solid #181828",display:"flex",flexDirection:"column",gap:2}}>
      {army.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:3,alignItems:"center"}}>{isCpu&&<span style={{fontSize:8,color:"#5cf",fontWeight:700}}>きみ:</span>}{army.map((m,i)=><MBadge key={`m${i}`} comp={m}/>)}</div>}
      {cpuArmy.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:3,alignItems:"center"}}><span style={{fontSize:8,color:"#f93",fontWeight:700}}>CPU:</span>{cpuArmy.map((m,i)=><MBadge key={`c${i}`} comp={m}/>)}</div>}
    </div>}

    {drawnC&&<div style={{padding:"6px 14px",display:"flex",alignItems:"center",gap:8,background:"rgba(80,180,255,.05)",borderBottom:"1px solid #182838",animation:"su .3s ease"}}><span style={{fontSize:11,color:"#5cf"}}>ひいた→</span><AtomCard card={drawnC}/></div>}
    {overLimit&&<div style={{padding:"6px 14px",textAlign:"center",background:"rgba(255,50,50,.06)"}}><span style={{fontSize:12,color:"#f44",fontWeight:800}}>⚠️ {hl}まいオーバー！</span></div>}
    {canAttack&&!justFused&&<div style={{padding:"6px 14px",textAlign:"center",background:"rgba(255,50,50,.08)",borderBottom:"2px solid rgba(255,50,50,.3)"}}><span style={{fontSize:13,color:"#f44",fontWeight:900}}>⚔️ こうげきできる！もっと集めてもOK</span></div>}
    {!peeked&&<div style={{padding:"3px 14px",background:"rgba(255,200,50,.04)",textAlign:"center"}}><span style={{fontSize:10,color:"#fc3",fontWeight:800}}>🧠 リストを見ずに → ×1.5！</span></div>}

    {/* Main */}
    <div style={{flex:1,padding:"10px",overflowY:"auto"}}>
      <div style={{fontSize:11,color:"#555",marginBottom:6}}>🃏 てふだ ({hand.length})</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center"}}>{[...hand].sort((a,b)=>"H O C N S Cl Na Cu Ag Fe".split(" ").indexOf(a.s)-"H O C N S Cl Na Cu Ag Fe".split(" ").indexOf(b.s)).map(c=><div key={c.id} style={{position:"relative"}}><AtomCard card={c} sel={sel.has(c.id)} onTap={turn==="player"?toggle:undefined}/>{overLimit&&<button onClick={()=>doDiscard(c.id)} style={{position:"absolute",top:-6,right:-6,width:20,height:20,border:"none",background:"#f44",color:"#fff",fontSize:12,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>×</button>}</div>)}</div>

      {match&&!justFused&&turn==="player"&&<div style={{marginTop:14,padding:14,background:peeked?"rgba(80,255,128,.04)":"rgba(255,200,50,.06)",border:peeked?"2px solid rgba(80,255,128,.2)":"2px solid rgba(255,200,50,.3)",textAlign:"center",animation:"ca .3s ease"}}>
        <div style={{fontSize:11,color:peeked?"#5f8":"#fc3",fontWeight:700}}>がったいできる！{!peeked&&" 🧠×1.5"}</div>
        {COMP_PIXELS[match.k]?<CompSprite k={match.k} size={64}/>:<div style={{fontSize:36}}>{match.emoji}</div>}
        <div style={{fontSize:14,fontWeight:900,color:"#fff"}}>{cn(match)}</div>
        <div style={{fontSize:18,fontWeight:900,color:peeked?"#5f8":"#fc3"}}>ATK {peeked?match.atk:Math.round(match.atk*1.5)}</div>
        <Btn onClick={doFuse} bg={peeked?"#228833":"#cc8800"} style={{marginTop:8,padding:"10px 30px",fontSize:15}}>🔗 がったい！</Btn>
      </div>}

      {/* Boss target (story only) */}
      {!isCpu&&<div style={{marginTop:10,padding:8,background:"#0c0c1a",border:"2px solid #223",textAlign:"center"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><BossSprite id={stage.bossId} size={28}/><span style={{fontSize:12,color:stage.bossColor,fontWeight:900}}>{stage.bossName}</span><span style={{fontSize:14,color:"#f44",fontWeight:900}}>HP{stage.bossHp}</span></div>
        <div style={{marginTop:4,fontSize:11,color:canAttack?"#5f8":"#fc3",fontWeight:700}}>ATK {totalAtk}/{stage.bossHp} {canAttack?"✓":"— がったい！"}</div>
      </div>}

      {/* List toggle */}
      <div style={{marginTop:6}}><button onClick={()=>{const next=!showList;setShowList(next);if(next)setPeeked(true);SE.tap();}} style={{width:"100%",padding:8,border:"2px solid #223",background:"#0e0e1e",color:"#555",fontSize:11,fontWeight:700}}>📋 {showList?"とじる":"リスト"}{!peeked&&<span style={{color:"#fc3",marginLeft:4,fontSize:9}}>※×1.5消滅</span>}</button>
        {showList&&<div style={{marginTop:4,padding:8,background:"#0c0c1a",border:"2px solid #222",maxHeight:250,overflowY:"auto",animation:"su .2s ease"}}>
          {possible.length>0&&<div style={{marginBottom:6}}><div style={{fontSize:10,color:"#5f8",fontWeight:900,marginBottom:3}}>🟢 いまつくれる</div>{possible.map(c=><div key={c.k} style={{padding:"4px 6px",marginBottom:2,background:"rgba(80,255,128,.03)",border:"1px solid rgba(80,255,128,.1)",display:"flex",alignItems:"center",gap:6}}>{COMP_PIXELS[c.k]?<CompSprite k={c.k} size={24}/>:<span style={{fontSize:14}}>{c.emoji}</span>}<span style={{fontSize:10,fontWeight:900,color:"#5f8",flex:1}}>{cn(c)} <span style={{color:"#666",fontSize:8}}>{c.f}</span></span><span style={{fontSize:10,fontWeight:900,color:"#000",background:"#5f8",padding:"1px 4px"}}>{c.atk}</span></div>)}</div>}
          {[...COMPOUNDS].sort((a,b)=>a.atk-b.atk).map(c=>{const ok=Object.entries(c.a).every(([s,n])=>(hc[s]||0)>=n);return <div key={c.k} style={{padding:"3px 4px",marginBottom:2,background:ok?"rgba(80,255,128,.03)":"#0a0a14",border:ok?"1px solid rgba(80,255,128,.1)":"1px solid #181828",display:"flex",alignItems:"center",gap:4,opacity:ok?1:.5}}><span style={{fontSize:9}}>{c.emoji}</span><span style={{fontSize:9,fontWeight:700,color:ok?"#5f8":"#888",flex:1}}>{cn(c)} <span style={{color:"#555",fontSize:7}}>{c.f}</span></span><span style={{fontSize:8,fontWeight:900,color:ok?"#000":"#555",background:ok?"#5f8":"#222",padding:"1px 4px"}}>{c.atk}</span></div>;})}
        </div>}
      </div>
    </div>

    {/* Action bar */}
    {turn==="player"&&<div style={{padding:"10px 14px max(20px,env(safe-area-inset-bottom))",borderTop:"1px solid #222",display:"flex",gap:8,background:"rgba(8,8,32,.97)"}}>
      {canAttack&&<Btn onClick={doFinish} bg="#c62828" style={{flex:1,padding:14,fontSize:16,"--g":"rgba(255,50,50,.5)",animation:"pg 1.5s ease-in-out infinite"}}>⚔️ こうげき！</Btn>}
      {!deckEmpty&&!drew&&<Btn onClick={doDraw} bg="#2244aa" style={{flex:1,padding:14,fontSize:canAttack?13:16}}>{canAttack?"🃏 もっとひく":"🃏 ひく"}</Btn>}
      {!deckEmpty&&drew&&!overLimit&&<Btn onClick={doPass} bg="#445566" style={{flex:1,padding:14,fontSize:13}}>{possible.length>0?"🔬 パス":"➡️ つぎへ"}</Btn>}
      {deckEmpty&&!isCpu&&!canAttack&&<Btn onClick={doFinish} bg="#555" style={{flex:1,padding:14,fontSize:13}}>😢 バトルへ</Btn>}
      {deckEmpty&&isCpu&&<Btn onClick={doFinish} bg="#c62828" style={{flex:1,padding:14,fontSize:16}}>🏁 けっか！</Btn>}
    </div>}
  </div>;
};

/* ═══════════════════════════════════════════════════════════
   BattlePhase (story boss fight)
   ═══════════════════════════════════════════════════════════ */
const BattlePhase=({army,stage,onResult})=>{
  const cn=useCN();const[phase,setPhase]=useState("intro");const[bossHp,setBossHp]=useState(stage.bossHp);const[shaking,setShaking]=useState(false);const[flashW,setFlashW]=useState(false);const[chargeIdx,setChargeIdx]=useState(-1);const totalAtk=army.reduce((s,m)=>s+m.atk,0);const won=totalAtk>=stage.bossHp;
  const particles=useRef(Array.from({length:40},(_,i)=>{const ang=(i/40)*360*Math.PI/180;const dist=60+Math.random()*100;return{id:i,x:Math.cos(ang)*dist,y:Math.sin(ang)*dist,em:["💥","⭐","✨","🔥","💫","⚡"][i%6],sz:16+Math.random()*20,dl:Math.random()*.5};})).current;
  useEffect(()=>{
    if(phase==="intro"){SE.battleStart();setTimeout(()=>setPhase("charge"),2200);}
    if(phase==="charge"){let i=0;const iv=setInterval(()=>{if(i<army.length){setChargeIdx(i);SE.select();i++;}else{clearInterval(iv);setTimeout(()=>setPhase("allAttack"),600);}},300);return()=>clearInterval(iv);}
    if(phase==="allAttack"){SE.attack();setShaking(true);setFlashW(true);setTimeout(()=>setFlashW(false),200);setTimeout(()=>{let step=0;const steps=15;const iv=setInterval(()=>{step++;setBossHp(Math.max(0,stage.bossHp-Math.round(totalAtk*(step/steps))));if(step>=steps){clearInterval(iv);setBossHp(Math.max(0,stage.bossHp-totalAtk));setShaking(false);setTimeout(()=>{if(won)setPhase("bossDeath");else{SE.lose();setPhase("result");}},600);}},80);},400);}
    if(phase==="bossDeath"){SE.fuse(50);setShaking(true);setTimeout(()=>setShaking(false),500);setTimeout(()=>{setFlashW(true);setTimeout(()=>setFlashW(false),300);},800);setTimeout(()=>{SE.victory();setPhase("result");},1800);}
  },[phase]);

  if(phase==="intro") return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(180deg,#100808,#200c0c)",position:"relative"}}><Stars n={15}/><Scan/><div style={{position:"relative",zIndex:2,textAlign:"center"}}><div style={{fontSize:14,color:"#f44",fontWeight:900,marginBottom:16,letterSpacing:".15em",fontFamily:"'Press Start 2P','DotGothic16',monospace",animation:"pg 1s ease-in-out infinite","--g":"rgba(255,50,50,.5)"}}>BATTLE START</div><div style={{animation:"ca .6s ease both"}}><BossSprite id={stage.bossId} size={160}/></div><div style={{fontSize:24,fontWeight:900,color:"#fff",marginTop:12,animation:"su .5s .3s ease both",opacity:0}}>{stage.bossEmoji} {stage.bossName}</div><div style={{marginTop:12,animation:"su .5s .7s ease both",opacity:0}}><span style={{fontSize:18,color:"#f44",fontWeight:900}}>HP {stage.bossHp}</span></div></div></div>;

  return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,#100808,#200c0c)",position:"relative",overflow:"hidden"}}><Stars n={10}/><Scan/>
    {flashW&&<div style={{position:"fixed",inset:0,background:"#fff",zIndex:100,animation:"fadeIn .1s ease"}}/>}
    <div style={{position:"relative",zIndex:2,flex:1,display:"flex",flexDirection:"column",padding:"max(16px,env(safe-area-inset-top)) 14px 24px"}}>
      <div style={{textAlign:"center",marginBottom:10,position:"relative"}}>
        {phase==="bossDeath"?<>{particles.map(p=><div key={p.id} style={{position:"absolute",left:"50%",top:"40%",fontSize:p.sz,transform:"translate(-50%,-50%)",animation:`ke .8s ${p.dl}s cubic-bezier(.2,.6,.3,1) forwards`,opacity:0,"--dx":`${p.x}px`,"--dy":`${p.y}px`,zIndex:5}}>{p.em}</div>)}<div style={{animation:"shake .5s ease",opacity:.3,filter:"brightness(3) saturate(0)"}}><BossSprite id={stage.bossId} size={120}/></div><div style={{fontSize:28,fontWeight:900,color:"#ff1744",marginTop:8,animation:"ca .3s ease both",textShadow:"0 0 20px #f00"}}>💥 げきは！💥</div></>:<div style={{display:"inline-block",animation:shaking?"shake .3s ease infinite":"bossIdle 3s ease-in-out infinite"}}><BossSprite id={stage.bossId} size={120}/></div>}
        {phase!=="bossDeath"&&<div style={{margin:"8px auto",maxWidth:260}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#f44",fontWeight:700}}><span>{stage.bossName}</span><span>HP {Math.max(0,bossHp)}/{stage.bossHp}</span></div><div style={{height:16,background:"#1a0a0a",border:"2px solid #422",overflow:"hidden"}}><div style={{height:"100%",width:`${Math.max(0,bossHp/stage.bossHp*100)}%`,background:bossHp/stage.bossHp>.5?"#4caf50":bossHp/stage.bossHp>.25?"#ff9800":"#f44336",transition:"width .15s ease"}}/></div></div>}
      </div>
      <div style={{fontSize:11,color:"#5cf",fontWeight:700,marginBottom:4}}>{phase==="charge"?"⚡ チャージ…":phase==="allAttack"?"💥 こうげき！":"⚔️ ぐんだん"} <span style={{color:"#fc3"}}>ATK {totalAtk}</span></div>
      <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:10}}>{army.map((m,i)=>{const ch=phase==="charge"&&i<=chargeIdx;const atk=phase==="allAttack";return <div key={i} style={{padding:"3px 6px",background:atk?"rgba(255,200,50,.2)":ch?"rgba(80,180,255,.1)":"#111",border:`2px solid ${atk?"#fc3":ch?"#5cf":"#222"}`,animation:atk?`slideRight .3s ${i*.05}s ease both`:ch?"ca .3s ease both":"none"}}><span style={{fontSize:11}}>{m.emoji}</span><span style={{fontSize:9,fontWeight:700,color:atk?"#fc3":"#ccc",marginLeft:3}}>{cn(m)}</span><span style={{fontSize:9,fontWeight:900,color:"#888",marginLeft:3}}>{m.atk}</span></div>;})}</div>

      {phase==="result"&&<div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"su .5s ease both"}}>
        {won?<><div style={{fontSize:64,animation:"ca .5s ease both",filter:"drop-shadow(0 8px 30px rgba(255,200,50,.5))"}}>🏆</div><div style={{fontSize:18,fontWeight:900,color:"#fc3",marginTop:10,fontFamily:"'Press Start 2P','DotGothic16',monospace"}}>勝利！</div>
          <div style={{display:"flex",gap:8,alignItems:"flex-start",maxWidth:300,width:"100%",marginTop:14,animation:"su .5s .3s ease both",opacity:0}}><DrSprite size={40}/><div style={{flex:1,padding:8,background:"#0e0e1e",border:"2px solid #334",position:"relative"}}><div style={{position:"absolute",left:-5,top:8,width:0,height:0,borderTop:"5px solid transparent",borderBottom:"5px solid transparent",borderRight:"5px solid #334"}}/><p style={{fontSize:11,color:"#fc3",lineHeight:1.8,margin:0}}>{stage.winStory||stage.win}</p></div></div>
        </>:<><div style={{fontSize:64,animation:"ca .5s ease both"}}>😢</div><div style={{fontSize:18,fontWeight:900,color:"#666",marginTop:10}}>敗北…</div>
          <div style={{display:"flex",gap:8,alignItems:"flex-start",maxWidth:300,width:"100%",marginTop:14,animation:"su .5s .3s ease both",opacity:0}}><DrSprite size={40}/><div style={{flex:1,padding:8,background:"#0e0e1e",border:"2px solid #334"}}><p style={{fontSize:11,color:"#888",lineHeight:1.8,margin:0}}>{stage.lose}</p></div></div>
          <div style={{fontSize:12,color:"#555",marginTop:8}}>ATK {totalAtk} — あと {stage.bossHp-totalAtk}</div>
        </>}
        <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:20,width:"100%",maxWidth:260}}>
          {won&&(stage.id===MAIN_CLEAR_ID||stage.id===ALL_CLEAR_ID)&&<Btn onClick={()=>onResult(won,"ending")} bg="#ffd600" style={{width:"100%",fontSize:16,color:"#000"}}>🌟 エンディングへ</Btn>}
          {won&&stage.id!==MAIN_CLEAR_ID&&stage.id!==ALL_CLEAR_ID&&STAGES.find(s=>s.id===stage.id+1)&&<Btn onClick={()=>onResult(won,"nextPreview")} bg="#c62828" style={{width:"100%",fontSize:14}}>▶ つぎのてきを見る</Btn>}
          <Btn onClick={()=>onResult(won,"retry")} bg="#e65100" style={{width:"100%",fontSize:13}}>🔄 もういちど</Btn>
          <Btn onClick={()=>onResult(won,"home")} bg="#334" style={{width:"100%",fontSize:13}}>🏠 トップへ</Btn>
        </div>
      </div>}
    </div></div>;
};

/* ═══════════════════════════════════════════════════════════
   CPU Result
   ═══════════════════════════════════════════════════════════ */
const CpuResult=({myArmy,cpuArmy,onResult})=>{
  const cn=useCN();const myAtk=myArmy.reduce((s,m)=>s+m.atk,0);const cpuAtk=cpuArmy.reduce((s,m)=>s+m.atk,0);const won=myAtk>cpuAtk;const tie=myAtk===cpuAtk;
  useEffect(()=>{if(won)SE.victory();else if(!tie)SE.lose();},[]);
  return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"linear-gradient(180deg,#080820,#0c0c30)",position:"relative"}}><Stars/><Scan/>
    <div style={{position:"relative",zIndex:2,textAlign:"center",maxWidth:320,width:"100%"}}>
      <div style={{fontSize:64,animation:"ca .5s ease both"}}>{won?"🏆":tie?"🤝":"😢"}</div>
      <div style={{fontSize:20,fontWeight:900,color:won?"#fc3":tie?"#aaa":"#666",marginTop:8,fontFamily:"'Press Start 2P','DotGothic16',monospace"}}>{won?"勝利！":tie?"引き分け！":"敗北…"}</div>
      <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:16}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:11,color:"#5cf"}}>きみ</div><div style={{fontSize:28,fontWeight:900,color:won?"#5f8":"#888"}}>{myAtk}</div></div>
        <div style={{fontSize:20,color:"#555",alignSelf:"center"}}>vs</div>
        <div style={{textAlign:"center"}}><div style={{fontSize:11,color:"#f93"}}>CPU</div><div style={{fontSize:28,fontWeight:900,color:!won&&!tie?"#f44":"#888"}}>{cpuAtk}</div></div>
      </div>
      {myArmy.length>0&&<div style={{marginTop:12}}><div style={{fontSize:10,color:"#5cf",marginBottom:4}}>きみ</div><div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{myArmy.map((m,i)=><MBadge key={i} comp={m}/>)}</div></div>}
      {cpuArmy.length>0&&<div style={{marginTop:8}}><div style={{fontSize:10,color:"#f93",marginBottom:4}}>CPU</div><div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{cpuArmy.map((m,i)=><MBadge key={i} comp={m}/>)}</div></div>}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:20}}>
        <Btn onClick={()=>onResult("retry")} bg="#e65100" style={{width:"100%",fontSize:14}}>🔄 もういちど</Btn>
        <Btn onClick={()=>onResult("home")} bg="#334" style={{width:"100%",fontSize:13}}>🏠 トップへ</Btn>
      </div>
    </div></div>;
};

/* ═══════════════════════════════════════════════════════════
   Ending (通常: ネオバブリンカットイン / TRUE: 完全クリア)
   ═══════════════════════════════════════════════════════════ */
const Ending=({isFinal,onHome})=>{
  const cn=useCN();const[ph,setPh]=useState(0);
  // 通常: 0→1撃破 →2博士平和 →3暗転 →4ネオバブリン! →5博士驚き →6EX解放+ボタン
  // TRUE: 0→1撃破 →2博士感謝 →3パレード →4タイトルコール →5クレジット
  useEffect(()=>{
    BGM.stop();const t=[];
    if(isFinal){
      t.push(setTimeout(()=>setPh(1),800));
      t.push(setTimeout(()=>{setPh(2);SE.victory();},4000));
      t.push(setTimeout(()=>setPh(3),9000));
      t.push(setTimeout(()=>setPh(4),18500));
      t.push(setTimeout(()=>setPh(5),22500));
    } else {
      // 通常: 1撃破 2平和 3暗転 4…ん？ 5揺れ 6ゴゴゴ 7ネオバブリン 8博士 9EX解放
      t.push(setTimeout(()=>setPh(1),800));
      t.push(setTimeout(()=>{setPh(2);SE.victory();},4000));
      t.push(setTimeout(()=>setPh(3),11000));
      t.push(setTimeout(()=>setPh(4),13000));
      t.push(setTimeout(()=>setPh(5),15000));
      t.push(setTimeout(()=>setPh(6),17500));
      t.push(setTimeout(()=>{setPh(7);SE.attack();},20000));
      t.push(setTimeout(()=>setPh(8),24500));
      t.push(setTimeout(()=>setPh(9),29000));
    }
    return()=>t.forEach(clearTimeout);
  },[]);

  const fw=useRef(Array.from({length:60},(_,i)=>({id:i,x:Math.random()*100,y:10+Math.random()*50,dl:.5+Math.random()*8,sz:30+Math.random()*50,co:["#f44","#fc3","#5f8","#5cf","#c9f","#f93","#ff1744","#00e5ff","#ffd600"][i%9]}))).current;
  const conf=useRef(Array.from({length:50},(_,i)=>({id:i,x:Math.random()*100,dl:Math.random()*6,dur:2+Math.random()*4,co:["#f44","#fc3","#5f8","#5cf","#c9f","#f93"][i%6],sz:4+Math.random()*6}))).current;

  // ── TRUE ENDING ──
  if(isFinal) return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",position:"relative",overflow:"hidden",background:"linear-gradient(180deg,#040410,#080820,#040410)"}}><Stars n={50}/>
    {ph>=1&&fw.map(f=><div key={f.id} style={{position:"fixed",left:`${f.x}%`,top:`${f.y}%`,width:f.sz,height:f.sz,borderRadius:"50%",border:`2px solid ${f.co}`,opacity:0,animation:`fw 1.5s ${f.dl}s ease-out infinite`,boxShadow:`0 0 20px ${f.co}`,zIndex:4,pointerEvents:"none"}}/>)}
    {ph>=3&&conf.map(c=><div key={c.id} style={{position:"fixed",left:`${c.x}%`,top:-20,width:c.sz,height:c.sz*1.4,background:c.co,opacity:0,animation:`cf ${c.dur}s ${c.dl}s linear infinite`,zIndex:5,pointerEvents:"none"}}/>)}
    <div style={{position:"relative",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",width:"100%",maxWidth:340,padding:"max(40px,env(safe-area-inset-top)) 24px 40px"}}>
      {ph>=1&&ph<2&&<div style={{textAlign:"center",animation:"ca .8s ease both"}}><div style={{fontSize:14,color:"#f44",fontWeight:900,letterSpacing:".2em",marginBottom:16,fontFamily:"'Press Start 2P','DotGothic16',monospace"}}>TRUE ENDING</div><div style={{opacity:.4,filter:"brightness(2) saturate(0)",animation:"shake .5s ease"}}><BossSprite id={10} size={140}/></div><div style={{fontSize:28,fontWeight:900,color:"#ff1744",marginTop:12,textShadow:"0 0 30px #f00",animation:"ca .5s .5s ease both",opacity:0}}>💥 💎 💥</div></div>}
      {ph>=2&&ph<3&&<div style={{textAlign:"center",animation:"fadeIn 1s ease both"}}><div style={{animation:"fl 2s ease-in-out infinite",marginBottom:16}}><DrSprite size={140}/></div><div style={{padding:16,background:"rgba(8,8,32,.92)",border:"3px solid rgba(255,200,50,.3)",maxWidth:300,animation:"su .8s .5s ease both",opacity:0}}><p style={{fontSize:15,color:"#fc3",lineHeight:2.2,textAlign:"center",fontWeight:600,margin:0}}>{"博士「すべてのモンスターを…\n裏も表も全部倒した！\n\nキミは歴史に残る\n真の化学マスターじゃ！！！」"}</p></div><div style={{marginTop:12,fontSize:40,animation:"ca .5s 2s ease both",opacity:0}}>🎉🎊🏆🎊🎉</div></div>}
      {ph>=3&&ph<4&&<div style={{textAlign:"center",width:"100%",animation:"fadeIn .8s ease both"}}><div style={{fontSize:12,color:"#fc3",fontWeight:900,letterSpacing:".1em",marginBottom:16,fontFamily:"'Press Start 2P','DotGothic16',monospace"}}>ALL MONSTERS</div>
        {STAGES.map((s,i)=><div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 8px",marginBottom:3,background:`${s.bossColor}08`,border:`1px solid ${s.bossColor}33`,animation:`slideRight .4s ${i*.2}s ease both`,opacity:0}}><BossSprite id={s.bossId} size={32}/><span style={{fontSize:11,fontWeight:900,color:s.bossColor,flex:1}}>{s.bossName}</span><span style={{fontSize:12,color:"#5f8"}}>✓</span></div>)}
      </div>}
      {ph>=4&&<div style={{textAlign:"center",animation:"ca 1s ease both"}}><div style={{fontSize:60,marginBottom:12,filter:"drop-shadow(0 8px 40px rgba(255,200,50,.5))",animation:"fl 2s ease-in-out infinite"}}>🧪</div><h1 style={{fontSize:18,color:"#5cf",fontFamily:"'Press Start 2P','DotGothic16',monospace",lineHeight:2,animation:"titleGlow 3s ease-in-out infinite"}}>げんし<br/>モンスターバトル</h1><div style={{marginTop:12,fontSize:18,color:"#fc3",fontWeight:900,animation:"su .5s .5s ease both",opacity:0,fontFamily:"'Press Start 2P','DotGothic16',monospace"}}>TRUE COMPLETE!</div><div style={{marginTop:16,display:"flex",justifyContent:"center",gap:4}}>{ATOMS.map((a,i)=><div key={a.s} style={{animation:`fl ${1.5+i*.2}s ease-in-out infinite`}}><AtomSprite s={a.s} size={24}/></div>)}</div></div>}
      {ph>=5&&<div style={{textAlign:"center",marginTop:24,animation:"su .8s ease both",width:"100%"}}><div style={{padding:12,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",marginBottom:16}}><div style={{fontSize:9,color:"#555",lineHeight:2}}>SPECIAL THANKS<br/><span style={{color:"#fc3",fontSize:13,fontWeight:900}}>プレイしてくれてありがとう！</span></div></div><Btn onClick={()=>{SE.victory();onHome();}} bg="#3355cc" style={{width:"100%",padding:"14px",fontSize:16}}>🏠 タイトルへ</Btn></div>}
    </div></div>;

  // ── 通常エンディング（ネオバブリンカットイン） ──
  return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",position:"relative",overflow:"hidden",background:ph>=3&&ph<7?"#000":ph===7?"radial-gradient(ellipse at 50% 40%,rgba(0,188,212,.08),transparent 60%),#020210":"linear-gradient(180deg,#040410,#080820,#040410)",transition:"background 2s ease"}}><Stars n={ph>=3&&ph<7?0:ph===7?5:40}/>
    {/* 花火（ph1-2だけ） */}
    {ph>=1&&ph<3&&fw.map(f=><div key={f.id} style={{position:"fixed",left:`${f.x}%`,top:`${f.y}%`,width:f.sz,height:f.sz,borderRadius:"50%",border:`2px solid ${f.co}`,opacity:0,animation:`fw 1.5s ${f.dl}s ease-out infinite`,boxShadow:`0 0 20px ${f.co}`,zIndex:4,pointerEvents:"none"}}/>)}

    <div style={{position:"relative",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",width:"100%",maxWidth:340,padding:"max(40px,env(safe-area-inset-top)) 24px 40px"}}>

      {/* Ph1: ダイヤキング撃破 */}
      {ph===1&&<div style={{textAlign:"center",animation:"ca .8s ease both"}}>
        <div style={{fontSize:14,color:"#f44",fontWeight:900,letterSpacing:".2em",marginBottom:16,fontFamily:"'Press Start 2P','DotGothic16',monospace"}}>ENDING</div>
        <div style={{opacity:.4,filter:"brightness(2) saturate(0)",animation:"shake .5s ease"}}><BossSprite id={10} size={140}/></div>
        <div style={{fontSize:28,fontWeight:900,color:"#ff1744",marginTop:12,textShadow:"0 0 30px #f00",animation:"ca .5s .5s ease both",opacity:0}}>💥 💎 💥</div>
      </div>}

      {/* Ph2: 博士「平和がもどった…」 */}
      {ph===2&&<div style={{textAlign:"center",animation:"fadeIn 1s ease both"}}>
        <div style={{animation:"fl 2s ease-in-out infinite",marginBottom:16}}><DrSprite size={140}/></div>
        <div style={{padding:16,background:"rgba(8,8,32,.92)",border:"3px solid rgba(255,200,50,.3)",maxWidth:300,animation:"su .8s .5s ease both",opacity:0}}>
          <p style={{fontSize:15,color:"#fc3",lineHeight:2.2,textAlign:"center",fontWeight:600,margin:0}}>{"博士「ダイヤキングを倒した！\n\nキミのおかげで研究所に\n平和がもどったぞ！\n\nこれで安心じゃ…\nありがとう…！」"}</p>
        </div>
        <div style={{marginTop:12,fontSize:40,animation:"ca .5s 2s ease both",opacity:0}}>🎉🎊🏆🎊🎉</div>
        <div style={{marginTop:12,fontSize:12,color:"#888",animation:"su .5s 3s ease both",opacity:0}}>研究所に平和がもどった…</div>
      </div>}

      {/* Ph3: 暗転 — 静寂 */}
      {ph===3&&<div style={{textAlign:"center",animation:"fadeIn 2s ease both"}}>
        <div style={{fontSize:16,color:"#333",letterSpacing:".3em",animation:"pixelStar 2s ease-in-out infinite"}}>. . .</div>
      </div>}

      {/* Ph4: …ん？ */}
      {ph===4&&<div style={{textAlign:"center",animation:"fadeIn 1s ease both"}}>
        <div style={{fontSize:14,color:"#444",animation:"su 1s ease both"}}>…ん？</div>
        <div style={{marginTop:20,fontSize:11,color:"#333",animation:"su 1s .8s ease both",opacity:0}}>なにか おかしい…</div>
      </div>}

      {/* Ph5: 地面が揺れている */}
      {ph===5&&<div style={{textAlign:"center",animation:"shake .2s ease infinite"}}>
        <div style={{fontSize:15,color:"#c62828",fontWeight:900,animation:"su .5s ease both"}}>地面が…ゆれている…！？</div>
        <div style={{marginTop:16,fontSize:24,color:"#f4433666",animation:"pixelStar .5s ease-in-out infinite"}}>ゴ ゴ ゴ ゴ</div>
        <div style={{marginTop:16,fontSize:11,color:"#555",animation:"su 1s 1s ease both",opacity:0}}>ダイヤキングの欠片が…光っている…！</div>
      </div>}

      {/* Ph6: 画面激しく揺れ＋警告 */}
      {ph===6&&<div style={{textAlign:"center",animation:"shake .15s ease infinite"}}>
        <div style={{fontSize:30,color:"#f44",fontWeight:900,animation:"pixelStar .3s ease-in-out infinite",letterSpacing:".2em"}}>！！！</div>
        <div style={{marginTop:12,width:60,height:60,margin:"12px auto",background:"#c62828",animation:"pg .4s ease-in-out infinite","--g":"rgba(255,50,50,.8)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:28,animation:"pixelStar .3s ease-in-out infinite"}}>💎</span></div>
        <div style={{marginTop:12,fontSize:12,color:"#f44",fontWeight:900,animation:"pixelStar .4s ease-in-out infinite"}}>エネルギーが ぼうそうしている…！</div>
      </div>}

      {/* Ph7: ネオバブリン カットイン！！ */}
      {ph===7&&<div style={{textAlign:"center",position:"relative"}}>
        <div style={{position:"fixed",inset:0,background:"#fff",zIndex:50,animation:"fadeIn .05s ease forwards",pointerEvents:"none"}}/>
        <div style={{position:"fixed",inset:0,background:"radial-gradient(circle at 50% 40%,#00BCD488,#00083880)",zIndex:49,animation:"fadeIn .3s .1s ease forwards",opacity:0,pointerEvents:"none"}}/>
        <div style={{fontSize:14,color:"#ff1744",fontWeight:900,letterSpacing:".25em",marginBottom:16,fontFamily:"'Press Start 2P','DotGothic16',monospace",animation:"shake .2s ease infinite",textShadow:"0 0 12px #f00"}}>⚠ WARNING ⚠</div>
        <div style={{animation:"ca .6s cubic-bezier(.34,1.56,.64,1) both",filter:"drop-shadow(0 16px 60px rgba(0,188,212,.9)) drop-shadow(0 0 30px rgba(0,188,212,.5))"}}>
          <BossSprite id={1} size={200}/>
        </div>
        <div style={{fontSize:28,fontWeight:900,color:"#00BCD4",marginTop:12,textShadow:"0 0 24px #00BCD4, 0 0 60px #00BCD488",animation:"su .4s .4s ease both",opacity:0,fontFamily:"'Press Start 2P','DotGothic16',monospace"}}>ネオバブリン</div>
        <div style={{fontSize:16,color:"#ff1744",fontWeight:900,marginTop:12,animation:"shake .3s .8s ease both",opacity:0,textShadow:"0 0 8px #f00"}}>「…まだ おわりじゃ ないぞ…！」</div>
        <div style={{marginTop:16,fontSize:13,color:"#80deea",animation:"su .5s 1.5s ease both",opacity:0}}>進化したモンスターたちが現れた！</div>
      </div>}

      {/* Ph8: 博士「なんじゃと！？」 */}
      {ph===8&&<div style={{textAlign:"center",animation:"fadeIn .5s ease both"}}>
        <div style={{animation:"shake .3s ease",marginBottom:16}}><DrSprite size={120}/></div>
        <div style={{padding:16,background:"rgba(8,8,32,.92)",border:"3px solid rgba(255,50,50,.3)",maxWidth:300,animation:"su .5s .3s ease both",opacity:0}}>
          <p style={{fontSize:15,color:"#f44",lineHeight:2.2,textAlign:"center",fontWeight:600,margin:0}}>{"博士「な、なんじゃと！？\n\nダイヤキングの欠片から\nモンスターたちが進化しておる！\n\nまだ戦いは終わっておらん…\nキミの力がまた必要じゃ！」"}</p>
        </div>
      </div>}

      {/* Ph9: EX解放 + ボタン */}
      {ph===9&&<div style={{textAlign:"center",animation:"ca .8s ease both",width:"100%"}}>
        <div style={{padding:16,border:"3px solid rgba(0,188,212,.4)",background:"rgba(0,188,212,.06)",marginBottom:16,animation:"pg 2s ease-in-out infinite","--g":"rgba(0,188,212,.4)"}}>
          <div style={{fontSize:18,color:"#00BCD4",fontWeight:900,fontFamily:"'Press Start 2P','DotGothic16',monospace"}}>🔓 EX STAGES</div>
          <div style={{fontSize:14,color:"#00BCD4",fontWeight:900,marginTop:8}}>裏ステージ解放！</div>
          <div style={{marginTop:10,display:"flex",justifyContent:"center",gap:6}}>
            {STAGES.filter(s=>s.ex).map(s=><div key={s.id} style={{animation:`fl ${2+s.id*.2}s ease-in-out infinite`}}><BossSprite id={s.bossId} size={32}/></div>)}
          </div>
          <div style={{fontSize:11,color:"#888",marginTop:8}}>進化したモンスター5体が待ちうけるぞ！</div>
        </div>

        <div style={{display:"flex",gap:8,alignItems:"flex-start",width:"100%",marginBottom:16,animation:"su .5s .3s ease both",opacity:0}}>
          <DrSprite size={40}/>
          <div style={{flex:1,padding:10,background:"#0e0e1e",border:"2px solid #334",position:"relative"}}>
            <div style={{position:"absolute",left:-5,top:10,width:0,height:0,borderTop:"5px solid transparent",borderBottom:"5px solid transparent",borderRight:"5px solid #334"}}/>
            <p style={{fontSize:11,color:"#fc3",lineHeight:1.8,margin:0}}>博士「ステージ選択からEXに挑戦できるぞ！すべて倒せば…真のエンディングが待っておる！」</p>
          </div>
        </div>

        <Btn onClick={()=>{SE.tap();onHome();}} bg="#00838f" style={{width:"100%",padding:"14px",fontSize:16}}>⚔️ EXステージへ！</Btn>
        <button onClick={onHome} style={{marginTop:8,padding:"8px",border:"1px solid #333",background:"transparent",color:"#555",fontSize:11,fontWeight:700,width:"100%"}}>🏠 トップへ</button>
      </div>}
    </div>
  </div>;
};

/* ═══════════════════════════════════════════════════════════
   NextBossPreview
   ═══════════════════════════════════════════════════════════ */
const NextBossPreview=({nextStage,onFight,onHome})=>{const[show,setShow]=useState(false);useEffect(()=>{setTimeout(()=>setShow(true),300);},[]);return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:`radial-gradient(ellipse at 50% 30%,${nextStage.bossColor}15,transparent 60%),linear-gradient(180deg,#080820,#0c0c30)`,position:"relative"}}><Stars n={20}/><Scan/><div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",maxWidth:320,width:"100%"}}><div style={{fontSize:14,color:"#f44",fontWeight:900,letterSpacing:".15em",marginBottom:16,fontFamily:"'Press Start 2P','DotGothic16',monospace",animation:"pg 1.5s ease-in-out infinite","--g":"rgba(255,50,50,.4)"}}>NEXT ENEMY</div>{show&&<><div style={{position:"relative",marginBottom:12,animation:"ca .8s cubic-bezier(.34,1.56,.64,1) both"}}><div style={{filter:`drop-shadow(0 12px 50px ${nextStage.bossColor}88)`,animation:"fl 3s ease-in-out infinite"}}><BossSprite id={nextStage.bossId} size={180}/></div></div><div style={{fontSize:10,color:nextStage.bossColor,fontWeight:700,animation:"su .4s .3s ease both",opacity:0}}>{nextStage.ex?`EX ${nextStage.id-10}`:`ステージ ${nextStage.id}`}</div><h2 style={{fontSize:22,fontWeight:900,color:"#fff",marginTop:4,fontFamily:"'Press Start 2P','DotGothic16',monospace",animation:"su .4s .5s ease both",opacity:0}}>{nextStage.bossEmoji} {nextStage.bossName}</h2><div style={{display:"flex",gap:10,marginTop:14,animation:"su .4s .9s ease both",opacity:0}}><div style={{padding:"6px 12px",background:"#0e0e1e",border:`2px solid ${nextStage.bossColor}33`,textAlign:"center"}}><div style={{fontSize:8,color:"#555"}}>HP</div><div style={{fontSize:18,fontWeight:900,color:"#f44"}}>{nextStage.bossHp}</div></div><div style={{padding:"6px 12px",background:"#0e0e1e",border:"2px solid #223",textAlign:"center"}}><div style={{fontSize:8,color:"#555"}}>てふだ</div><div style={{fontSize:18,fontWeight:900,color:"#5cf"}}>{nextStage.hl}</div></div></div><div style={{display:"flex",gap:10,alignItems:"flex-start",width:"100%",marginTop:12,animation:"su .5s 1.1s ease both",opacity:0}}><DrSprite size={40}/><div style={{flex:1,padding:10,background:"#0e0e1e",border:"2px solid #334",position:"relative"}}><div style={{position:"absolute",left:-5,top:10,width:0,height:0,borderTop:"5px solid transparent",borderBottom:"5px solid transparent",borderRight:"5px solid #334"}}/><p style={{fontSize:11,color:"rgba(255,255,255,.7)",lineHeight:1.8,margin:0}}>{nextStage.intro}</p></div></div><div style={{display:"flex",flexDirection:"column",gap:10,marginTop:16,width:"100%",animation:"su .5s 1.3s ease both",opacity:0}}><Btn onClick={onFight} bg="#c62828" style={{width:"100%",padding:"14px",fontSize:18}}>⚔️ たたかう！</Btn><Btn onClick={onHome} bg="#334" style={{width:"100%",fontSize:13}}>🏠 トップへ</Btn></div></>}</div></div>;};

/* ═══════════════════════════════════════════════════════════
   App
   ═══════════════════════════════════════════════════════════ */
window.__App=function App(){
  const[scr,setScr]=useState("title");const[stage,setStage]=useState(null);const[army,setArmy]=useState([]);const[cpuDiff,setCpuDiff]=useState(null);const[cpuArmies,setCpuArmies]=useState(null);const[nextStage,setNextStage]=useState(null);const[endingFinal,setEndingFinal]=useState(false);
  const[lang,setLang]=useState(()=>{try{return localStorage.getItem("acb_lang")||"hiragana";}catch(e){return "hiragana";}});
  const[cleared,setCleared]=useState(()=>{try{const s=localStorage.getItem("acb_cleared");return s?new Set(JSON.parse(s)):new Set();}catch(e){return new Set();}});
  const[prologueDone,setPrologueDone]=useState(()=>{try{return localStorage.getItem("acb_prologue")==="1";}catch(e){return false;}});

  const saveLang=l=>{setLang(l);try{localStorage.setItem("acb_lang",l);}catch(e){}};
  const saveCleared=c=>{setCleared(c);try{localStorage.setItem("acb_cleared",JSON.stringify([...c]));}catch(e){}};
  const savePrologue=()=>{setPrologueDone(true);try{localStorage.setItem("acb_prologue","1");}catch(e){}};
  const goHome=()=>{setScr("title");if(BGM.on())BGM.start("title");};

  const startStage=st=>{setStage(st);setArmy([]);setCpuDiff(null);setScr("card");if(BGM.on())BGM.start(st.diff==="hard"?"battle_hard":"battle");};
  const startCpu=()=>{
    // CPU uses a fake stage for card phase
    const cpuStage={id:0,bossId:1,name:"CPU たいせん",hl:8,deckSize:50,diff:"normal",bossName:"CPU",bossEmoji:"🤖",bossHp:999,bossColor:"#f93",bossDesc:"",intro:"",win:"",winStory:"",lose:""};
    setStage(cpuStage);setCpuDiff("normal");setArmy([]);setScr("card");if(BGM.on())BGM.start("battle");
  };

  const onCardDone=result=>{
    if(cpuDiff){setCpuArmies(result);setScr("cpuResult");}
    else{setArmy(result);setScr("battle");}
  };
  const onBattleResult=(won,action)=>{
    if(won&&stage){const nc=new Set([...cleared,stage.id]);saveCleared(nc);}
    if(action==="ending"){setEndingFinal(stage.id===ALL_CLEAR_ID);setScr("ending");return;}
    if(action==="nextPreview"){const next=STAGES.find(s=>s.id===stage.id+1);if(next){setNextStage(next);setScr("nextPreview");if(BGM.on())BGM.start("title");return;}}
    if(action==="retry"){startStage(stage);return;}
    goHome();
  };
  const onCpuResult=action=>{if(action==="retry"){startCpu();return;}goHome();};

  return <LangCtx.Provider value={lang}><style>{CSS}</style><BgmBtn/>
    {scr==="title"&&<TitleScreen onSelectStage={startStage} onEnding={(f)=>{setEndingFinal(f);setScr("ending");}} cleared={cleared} prologueDone={prologueDone} setPrologueDone={savePrologue} lang={lang} setLang={saveLang}/>}
    {scr==="card"&&stage&&<CardPhase stage={stage} onDone={onCardDone} cpuDiff={cpuDiff}/>}
    {scr==="battle"&&stage&&<BattlePhase army={army} stage={stage} onResult={onBattleResult}/>}
    {scr==="cpuResult"&&cpuArmies&&<CpuResult myArmy={cpuArmies.myArmy} cpuArmy={cpuArmies.cpuArmy} onResult={onCpuResult}/>}
    {scr==="nextPreview"&&nextStage&&<NextBossPreview nextStage={nextStage} onFight={()=>startStage(nextStage)} onHome={goHome}/>}
    {scr==="ending"&&<Ending isFinal={endingFinal} onHome={goHome}/>}
  </LangCtx.Provider>;
};
