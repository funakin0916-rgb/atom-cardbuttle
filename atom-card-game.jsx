const {useState,useEffect,useCallback,useRef,createContext,useContext} = React;
// げんしモンスターバトル 🧪⚔️ v10

/* ── Lang ─── */
const LangCtx=createContext("hiragana");const useLang=()=>useContext(LangCtx);

/* ── SE ─── */
const SE=(()=>{let ctx=null,en=true;const gc=()=>{if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==="suspended")ctx.resume();return ctx;};const p=fn=>{if(!en)return;try{fn(gc());}catch(e){}};const tone=(c,t,f1,f2,d,v=.12)=>{const o=c.createOscillator(),g=c.createGain();o.type=t;o.frequency.setValueAtTime(f1,c.currentTime);if(f2)o.frequency.exponentialRampToValueAtTime(f2,c.currentTime+d*.6);g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.connect(g).connect(c.destination);o.start(c.currentTime);o.stop(c.currentTime+d);};return{setEnabled:v=>{en=v},isEnabled:()=>en,tap:()=>p(c=>tone(c,"sine",1000,null,.05,.05)),draw:()=>p(c=>tone(c,"sine",800,1200,.15,.15)),select:()=>p(c=>tone(c,"triangle",600,900,.1,.1)),deselect:()=>p(c=>tone(c,"triangle",700,400,.1,.08)),fuse:pts=>p(c=>{const t=c.currentTime;const ns=pts>=15?[523,659,784,1047,1319]:pts>=9?[523,659,784,1047]:[523,659,784];ns.forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type=pts>=15?"square":"sine";o.frequency.setValueAtTime(f,t+i*.12);g.gain.setValueAtTime(.12,t+i*.12);g.gain.exponentialRampToValueAtTime(.001,t+i*.12+.4);o.connect(g).connect(c.destination);o.start(t+i*.12);o.stop(t+i*.12+.4);});}),pass:()=>p(c=>tone(c,"sine",400,300,.25,.08)),discard:()=>p(c=>tone(c,"sawtooth",300,100,.2,.06)),attack:()=>p(c=>{const t=c.currentTime;[200,250,150].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="sawtooth";o.frequency.setValueAtTime(f,t+i*.08);g.gain.setValueAtTime(.15,t+i*.08);g.gain.exponentialRampToValueAtTime(.001,t+i*.08+.15);o.connect(g).connect(c.destination);o.start(t+i*.08);o.stop(t+i*.08+.15);});}),victory:()=>p(c=>{const t=c.currentTime;[523,523,523,698,784,698,784,1047].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type=i>=6?"square":"sine";o.frequency.setValueAtTime(f,t+i*.18);g.gain.setValueAtTime(.15,t+i*.18);g.gain.exponentialRampToValueAtTime(.001,t+i*.18+.5);o.connect(g).connect(c.destination);o.start(t+i*.18);o.stop(t+i*.18+.5);});}),lose:()=>p(c=>{const t=c.currentTime;[392,349,330,294,262].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(f,t+i*.3);g.gain.setValueAtTime(.1,t+i*.3);g.gain.exponentialRampToValueAtTime(.001,t+i*.3+.6);o.connect(g).connect(c.destination);o.start(t+i*.3);o.stop(t+i*.3+.6);});}),battleStart:()=>p(c=>{const t=c.currentTime;[262,330,392,523].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type="square";o.frequency.setValueAtTime(f,t+i*.1);g.gain.setValueAtTime(.1,t+i*.1);g.gain.exponentialRampToValueAtTime(.001,t+i*.1+.3);o.connect(g).connect(c.destination);o.start(t+i*.1);o.stop(t+i*.1+.3);});})};})();

/* ── BGM ─── */
const BGM=(()=>{let ctx=null,playing=false,nodes=[],timer=null,curTrack="title";const stopAll=()=>{if(timer){clearTimeout(timer);timer=null;}nodes.forEach(n=>{try{n.stop();}catch(e){}});nodes=[];};const TRACKS={title:{mel:[[523,.3],[659,.3],[784,.3],[659,.3],[587,.3],[523,.3],[494,.6],[440,.3],[494,.3],[523,.6],[587,.3],[523,.3],[440,.6],[523,.3],[659,.3],[784,.3],[880,.3],[784,.3],[659,.6],[587,.3],[659,.3],[784,.3],[880,.3],[1047,.3],[880,.6],[784,.6]],bas:[[131,.6],[196,.6],[165,.6],[196,.6],[175,.6],[131,.6],[196,.6],[131,.6],[131,.6],[196,.6],[165,.6],[196,.6],[175,.6],[196,.6],[131,1.2]],mt:"triangle",bt:"sine",mv:.05,bv:.035},stage_select:{mel:[[392,.2],[494,.2],[587,.2],[784,.4],[659,.2],[587,.2],[494,.4],[392,.2],[494,.2],[587,.2],[659,.2],[784,.4],[659,.2],[494,.2],[392,.6],[0,.2],[494,.2],[587,.2],[784,.2],[988,.4],[880,.2],[784,.2],[659,.6],[587,.2],[659,.2],[784,.2],[988,.4],[784,.4],[587,.8]],bas:[[196,.4],[247,.4],[294,.4],[247,.4],[196,.4],[247,.4],[294,.4],[247,.4],[196,.4],[165,.4],[262,.4],[294,.4],[196,.4],[165,.4],[262,.4],[294,.4],[196,.4],[247,.4],[294,.4],[196,.4]],mt:"triangle",bt:"sine",mv:.045,bv:.03},battle_normal:{mel:[[523,.15],[0,.05],[523,.15],[0,.05],[523,.15],[0,.05],[659,.3],[0,.1],[784,.15],[0,.05],[784,.15],[0,.05],[659,.15],[0,.05],[523,.3],[587,.2],[659,.2],[784,.2],[880,.4],[0,.1],[880,.15],[0,.05],[880,.15],[0,.05],[784,.15],[0,.05],[659,.3],[784,.2],[880,.2],[988,.2],[1047,.4],[988,.2],[880,.2],[784,.4],[0,.2],[1047,.2],[988,.2],[880,.2],[784,.2],[659,.2],[587,.2],[523,.4],[0,.2],[523,.15],[0,.05],[659,.15],[0,.05],[784,.3],[1047,.6]],bas:[[131,.25],[262,.25],[131,.25],[262,.25],[131,.25],[262,.25],[131,.25],[262,.25],[175,.25],[349,.25],[175,.25],[349,.25],[175,.25],[349,.25],[175,.25],[349,.25],[196,.25],[392,.25],[196,.25],[392,.25],[196,.25],[392,.25],[196,.25],[392,.25],[131,.25],[262,.25],[131,.25],[262,.25],[131,.5],[262,.5]],mt:"square",bt:"triangle",mv:.045,bv:.04},battle_boss:{mel:[[294,.3],[0,.1],[294,.2],[0,.1],[294,.4],[440,.3],[0,.1],[440,.2],[0,.1],[587,.4],[523,.15],[494,.15],[523,.15],[587,.15],[523,.3],[440,.3],[494,.15],[440,.15],[494,.15],[523,.15],[494,.3],[392,.3],[440,.2],[523,.2],[587,.2],[659,.3],[587,.2],[523,.2],[494,.2],[440,.3],[392,.15],[440,.15],[494,.15],[523,.15],[587,.3],[659,.3],[587,.15],[523,.15],[494,.15],[440,.15],[392,.3],[294,.5],[587,.3],[523,.3],[440,.3],[294,.6]],bas:[[147,.3],[220,.3],[147,.3],[220,.3],[147,.3],[220,.3],[175,.3],[220,.3],[196,.3],[294,.3],[196,.3],[294,.3],[196,.3],[294,.3],[196,.3],[294,.3],[220,.3],[330,.3],[220,.3],[330,.3],[220,.3],[330,.3],[220,.3],[330,.3],[147,.3],[220,.3],[147,.3],[220,.3],[147,.6],[147,.6]],mt:"sawtooth",bt:"square",mv:.05,bv:.035},ending:{mel:[[349,.4],[440,.4],[523,.4],[698,.8],[659,.4],[587,.4],[523,.8],[0,.2],[523,.4],[587,.4],[659,.4],[784,.8],[698,.4],[587,.4],[440,1],[0,.2],[523,.4],[659,.4],[784,.4],[1047,.8],[880,.4],[784,.4],[659,.8],[0,.2],[698,.4],[523,.4],[440,.4],[349,1.2]],bas:[[175,.8],[262,.8],[175,.8],[262,.8],[147,.8],[220,.8],[147,.8],[220,.8],[175,.8],[262,.8],[175,.8],[262,.8],[196,.8],[247,.8],[196,.8],[247,.8],[175,.8]],mt:"triangle",bt:"sine",mv:.05,bv:.04}};const loop=()=>{if(!playing)return;try{if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==="suspended")ctx.resume();stopAll();const tr=TRACKS[curTrack]||TRACKS.title;const t=ctx.currentTime;let off=0;tr.mel.forEach(([f,d])=>{if(f===0){off+=d;return;}const o=ctx.createOscillator(),g=ctx.createGain();o.type=tr.mt;o.frequency.setValueAtTime(f,t+off);g.gain.setValueAtTime(tr.mv,t+off);g.gain.exponentialRampToValueAtTime(.001,t+off+d*.9);o.connect(g).connect(ctx.destination);o.start(t+off);o.stop(t+off+d);nodes.push(o);off+=d;});const ld=off;let bo=0;tr.bas.forEach(([f,d])=>{if(bo>=ld)return;if(f===0){bo+=d;return;}const o=ctx.createOscillator(),g=ctx.createGain();o.type=tr.bt;o.frequency.setValueAtTime(f,t+bo);g.gain.setValueAtTime(tr.bv,t+bo);g.gain.exponentialRampToValueAtTime(.001,t+bo+d*.85);o.connect(g).connect(ctx.destination);o.start(t+bo);o.stop(t+bo+d);nodes.push(o);bo+=d;});timer=setTimeout(loop,ld*1000-100);}catch(e){}};if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();else if(playing)loop();});return{start:id=>{const t=id||"title";if(playing&&curTrack===t)return;stopAll();curTrack=t;playing=true;loop();},stop:()=>{playing=false;stopAll();},on:()=>playing};})();

/* ── PixelArt ─── */
const PA=({rows,palette,size=100})=>{const h=rows.length,w=Math.max(...rows.map(r=>r.length)),px=size/Math.max(w,h);return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{imageRendering:"pixelated"}}>{rows.map((row,y)=>row.split('').map((ch,x)=>{const col=palette[ch];return col?<rect key={`${x}-${y}`} x={x*px} y={y*px} width={px+.5} height={px+.5} fill={col}/>:null;}))}</svg>;};
const DrSprite=({size=80})=><PA size={size} palette={{'w':'#eceff1','W':'#cfd8dc','s':'#ffdcb5','g':'#455a64','G':'#37474f','e':'#263238','h':'#fff','b':'#4a6cf7','B':'#3949ab','r':'#e53935','u':'#1e88e5','c':'#4fc3f7','C':'#81d4fa','p':'#ffab91','m':'#a1887f','k':'#b0bec5'}} rows={['      WWWWWW      ','     WwWWWwWW     ','    WwWWWWWwWW    ','   WWwWWWWWwWWW   ','    sssssssssss   ','   sssssssssssss  ','  sssgghssgghsss  ','  sssGehssgGehss  ','  ssssssggsssssss ','  sspsskkkksspss  ','  ssssmmmmmmsss   ','   sssssssssss    ','    wwwbwwwwww    ','   wwruwBwwwwww   ','   wwwwwBwwwwwwc  ','   wwwwwbwwwwwwc  ','   wwwwwwwwwwwcCc ','    wwwwwwwwwwcCc ','    wwwwwwwwww c  ','     wwwwwwww     ']} />;

/* ── Atom Pixels ─── */
const ATOM_PIXELS={H:{p:{'a':'#76FF03','A':'#33691E','w':'#fff','e':'#1B5E20','g':'#B9F6CA','p':'#F48FB1','c':'#00E676'},r:['   ggggg   ','  ggaaagg  ',' ggaaaaagg ',' gaaaaaaag ',' aawaawaaa ',' aaeaaeaaa ',' aaaaaaaaa ',' aapaaaapa ',' caaaaaaac ','  aAAAAAA  ','   A   A   ']},O:{p:{'a':'#FF9800','A':'#BF360C','w':'#fff','e':'#6D1B00','b':'#FFB74D','p':'#F48FB1','c':'#FFD180','r':'#FF3D00','y':'#FFEB3B'},r:['   r   r   ','  ry r yr  ','  bbaaabb  ',' bbaaaaabb ',' aawaawaaa ',' aaeaaeaaa ',' aaaaaaaaa ',' aapaaaapa ',' baaaaaaab ','  aAAAAAA  ','   A   A   ']},C:{p:{'a':'#448AFF','A':'#0D47A1','w':'#fff','e':'#01579B','b':'#82B1FF','p':'#F48FB1','c':'#90CAF9','y':'#FFD600','Y':'#FFB300','s':'#E3F2FD'},r:['   y Y y   ','  yYyYyYy  ','  bbaaabb  ',' bbaaaaabb ',' aawaawaaa ',' aaeaaeaaa ',' aaaaaaaaa ',' aapaaaapa ',' bcaaaaacb ','  aAAAAAA  ','   A   A   ']},N:{p:{'a':'#D500F9','A':'#6A1B9A','w':'#fff','e':'#4A148C','b':'#EA80FC','p':'#F48FB1','c':'#CE93D8','s':'#FFD600','y':'#FFFFFF','d':'#E1BEE7'},r:[' y  s s  y ','   sssss   ','  bbaaabb  ',' bbaaaaabb ',' baawaawab ',' baaeaaeab ',' baaaaaaab ',' bpapaaaapb','  baaaaab  ','  cdAAAdc  ','   A   A   ']},S:{p:{'a':'#FFEB3B','A':'#F57F17','w':'#fff','e':'#E65100','b':'#FFF59D','p':'#F48FB1','c':'#FFE082','t':'#9C27B0','T':'#6A1B9A'},r:['  T     T  ','  t     t  ','  bbaaabb  ',' tbaaaaabt ',' baawaawab ',' baaeaaeab ',' baaaaaaab ',' bpapaaaapb','  baaaaab  ','  c AAA c  ','   A   A   ']},Cl:{p:{'a':'#00E5FF','A':'#006064','w':'#fff','e':'#004D40','b':'#80DEEA','p':'#F48FB1','c':'#4DD0E1','t':'#B2EBF2','y':'#00B8D4'},r:['   ttttt   ','  tbbbbbt  ','  bbaaabb  ',' bbaaaaabb ',' aawaawaaa ',' aaeaaeaaa ',' aaaaaaaaa ',' aapaaaapa ',' baaaaaaab ',' c c c c c ',' y   y   y ']},Na:{p:{'a':'#FF1744','A':'#B71C1C','w':'#fff','e':'#4A0000','b':'#FF5252','p':'#F48FB1','c':'#FF8A80','y':'#FFD600','Y':'#FF6F00'},r:[' y y y y y ',' YYYYYYYYY ','  bbaaabb  ',' bbaaaaabb ',' aawaawaaa ',' aaeaaeaaa ',' aaaaaaaaa ',' aapaaaapa ',' baaaaaaab ','  aAAAAAA  ','   A   A   ']},Cu:{p:{'a':'#FF7043','A':'#BF360C','w':'#fff','e':'#3E2723','b':'#FFAB91','p':'#F48FB1','c':'#FF8A65','y':'#FFD600','Y':'#F57F17','s':'#BDBDBD'},r:['   yyyyy   ','  yYYYYYy  ','  bbaaabb  ',' bbaaaaabb ',' baawaawab ',' baaeaaeab ',' baaaaaaab ',' bpapaaaapb','  baaaaab  ','  s AAA s  ','  s     s  ']},Ag:{p:{'a':'#B0BEC5','A':'#37474F','w':'#fff','e':'#263238','b':'#CFD8DC','p':'#F48FB1','c':'#ECEFF1','y':'#FDD835','Y':'#F57F17','r':'#C62828','R':'#B71C1C'},r:['   y Y y   ','  yYyYyYy  ','  bbaaabb  ',' bbaaaaabb ',' baawaawab ',' baaeaaeab ',' baaaaaaab ',' bpapaaaapb',' RbaaaaaabR',' RRAAAAAARR','  R     R  ']},Fe:{p:{'a':'#8D6E63','A':'#3E2723','w':'#fff','e':'#1A0000','b':'#A1887F','p':'#F48FB1','c':'#BCAAA4','r':'#BDBDBD','R':'#616161','h':'#4E342E','k':'#212121'},r:['   r   r   ','   R   R   ','   kaaak   ','  kkaaakk  ','  awaawaa  ','  aeaaeaa  ','  aaaaaaa  ','  paaaaap  ','  baaaaab  ','  kkAAAkk  ','  h     h  ']}};
const AtomSprite=({s,size=40})=>{const d=ATOM_PIXELS[s];return d?<PA rows={d.r} palette={d.p} size={size}/>:<div style={{width:size,height:size,background:"#333"}}/>;};

/* ── Compound Pixels ─── */
const COMP_PIXELS={H2:{p:{'a':'#76FF03','A':'#33691E','g':'#B9F6CA','w':'#fff','e':'#1B5E20','p':'#F48FB1','c':'#00E676'},r:['   gggggg  ','  gaaaaaag ',' gaaaaaaaag',' aawaawawaa',' aaeaaeaeaa',' aaaaaaaaaa',' apaaaaaapa',' caaaaaaaac','  aAAAAAAAa','   A  A  A ']},O2:{p:{'a':'#FF9800','A':'#BF360C','b':'#FFB74D','w':'#fff','e':'#6D1B00','p':'#F48FB1','r':'#FF3D00','y':'#FFEB3B'},r:['  r r  r r ','  yry  yry ',' bbaaaaaabb',' baaaaaaab ',' awaawawawa',' aeaaeaaeaa',' aaaaaaaaaa',' apaaaaaap ',' baaaaaaab ','  AAAAAAA  ']},Cl2:{p:{'a':'#00E5FF','A':'#006064','b':'#80DEEA','w':'#fff','e':'#004D40','p':'#F48FB1','t':'#B2EBF2','c':'#4DD0E1','y':'#00B8D4'},r:['  ttttttt  ',' tbbbbbbbt ',' bbaaaaabb ','bbaaaaaaabb','aawaawawawa','aaeaaeaaeaa','aaaaaaaaaaa',' apaaaaaap ',' c c c c c ','y y y y y y']},N2:{p:{'a':'#D500F9','A':'#6A1B9A','b':'#EA80FC','w':'#fff','e':'#4A148C','p':'#F48FB1','s':'#FFD600','y':'#FFFFFF','d':'#E1BEE7'},r:[' y s s s s ','  sssssss  ',' bbaaaaabb ','bbaaaaaaabb','bawaawawaab','baeaaeaaeab','baaaaaaaaab',' papaaaaap ','  baaaaab  ','  cdAdAdc  ']},HCl:{p:{'a':'#76FF03','A':'#33691E','g':'#B9F6CA','w':'#fff','e':'#1B5E20','p':'#F48FB1','b':'#00E5FF','B':'#006064','c':'#80DEEA','t':'#B2EBF2','y':'#00B8D4'},r:['  gg   tt  ',' ggggggtttt',' gaaaabbbbb','gaaaaabbbbb','awaawbbwawb','aeaaebbeaeb','aaaaaabbbbb','pagaaapbbbp',' ggAAAABBBB','  A A  B B ']},NaCl:{p:{'a':'#FF1744','A':'#B71C1C','b':'#FF5252','w':'#fff','e':'#4A0000','p':'#F48FB1','c':'#00E5FF','C':'#006064','d':'#80DEEA','y':'#FFD600','Y':'#FF6F00'},r:['  Y Y Y Y  ',' yyyyyyyyy ',' bbaaaaadd ','bbaaaaaaddd','awaawcawadd','aeaaecaeaCd','aaaaaaaaCdd','papaaaapCpd',' baaaaaCCcc','  AAAACCCCC']},CuO:{p:{'a':'#FF7043','A':'#BF360C','b':'#FFAB91','w':'#fff','e':'#3E2723','p':'#F48FB1','y':'#FFD600','Y':'#F57F17','s':'#BDBDBD','r':'#FF3D00','o':'#FF9800'},r:[' y y r r y ',' YYY ryr Y ',' bbaaaaabb ','bbaaaaoaabb','awaawaoawaa','aeaaeaaeaea','aaaaaaaaaaa','papaaaapaop',' baaaaaaab ',' s AAAAA s ']},FeO:{p:{'a':'#8D6E63','A':'#3E2723','b':'#A1887F','w':'#fff','e':'#1A0000','p':'#F48FB1','k':'#212121','h':'#4E342E','r':'#BDBDBD','R':'#616161','o':'#FF9800','O':'#BF360C','q':'#FF3D00','y':'#FFEB3B'},r:[' r r y q q ',' R R yoy   ',' kaak  oOb ',' kkaaaaoOOb',' awaawaoawa',' aeaaeaaeaa',' aaaaaaaaaa',' paaaaaapoa','  baaaaaab ','  hhAAAA h ']},CO2:{p:{'a':'#448AFF','A':'#0D47A1','b':'#82B1FF','w':'#fff','e':'#01579B','p':'#F48FB1','y':'#FFD600','Y':'#FFB300','c':'#90CAF9','o':'#FF9800','O':'#BF360C','r':'#FF3D00'},r:[' r yYy r   ',' ryYyYyr   ',' bbaaabbo  ','bbaaaaaabbo','bawaawawab ','baeaaeaeab ','baaaaaaaab ','papaaaaapo ',' bcaaaaacb ','  AAAAAAA  ']},SO2:{p:{'a':'#FFEB3B','A':'#F57F17','b':'#FFF59D','w':'#fff','e':'#E65100','p':'#F48FB1','t':'#9C27B0','T':'#6A1B9A','o':'#FF9800','O':'#BF360C','r':'#FF3D00'},r:[' T t T t T ',' t t t t t ',' bbaaaaabbo','tbaaaaaaabo','bawaawawabt','baeaaeaeab ','baaaaaaaaa ','papaaaaapor',' baaaaaaabo','  AAAAAAA  ']},H2O:{p:{'a':'#4FC3F7','A':'#0288D1','b':'#81D4FA','w':'#fff','e':'#01579B','p':'#F48FB1','c':'#B3E5FC','g':'#76FF03','G':'#33691E','h':'#B9F6CA','o':'#FF9800','O':'#BF360C','y':'#FFEB3B'},r:['   g  o o    ','   G  yry    ','  ggccccbb   ',' gccbbbbaab  ',' cccaaaaaacb ',' cawaaaaawac ',' caeaaaaaeac ',' caaaaaaaaac ','  papaaaaap  ','  baaaaaaab  ','  cAAAAAAc   ','   A  A A    ']},AgCl:{p:{'a':'#B0BEC5','A':'#37474F','b':'#CFD8DC','w':'#fff','e':'#263238','p':'#F48FB1','c':'#ECEFF1','y':'#FDD835','d':'#00E5FF','D':'#006064','t':'#80DEEA','B':'#B2EBF2'},r:['   y B B y   ','   yyyyyyy   ','   bbbbbtt   ','  bbaaaatdd  ',' bbaaaaatddd ',' awaawawadda ',' aeaaeaaeDdd ',' aaaaaaaaDdd ','  papaaapDdD ','  baaaaab DD ','   AAAAAA    ','  cAc  D D   ']},CuS:{p:{'a':'#FF7043','A':'#BF360C','b':'#FFAB91','w':'#fff','e':'#3E2723','p':'#F48FB1','y':'#FFD600','Y':'#F57F17','s':'#BDBDBD','S':'#FFEB3B','B':'#F9A825','t':'#9C27B0','T':'#6A1B9A','h':'#4E342E'},r:[' yyyy  T  T  ',' YYYY  t  t  ','   bbbbSSb   ','  bbaaaSSSb  ',' bawaaSawSab ',' baeaaSaeSab ',' aaaaaaSaaab ','  papSaaaap  ','  baSSSaaab  ','  BAAAAAB    ','  hA     Ah  ','              ']},FeS:{p:{'a':'#8D6E63','A':'#3E2723','b':'#A1887F','w':'#fff','e':'#1A0000','p':'#F48FB1','k':'#212121','h':'#4E342E','r':'#BDBDBD','R':'#616161','S':'#FFEB3B','B':'#F9A825','t':'#9C27B0','T':'#6A1B9A'},r:[' r  r  T  T  ',' R  R  t  t  ',' kaaak  SSSb ',' kkaaaaaSSab ',' bawaawSawab ',' baeaaeSaeab ',' aaaaaaSaaab ','  papaSaap   ','  baSSSaab   ','  BhAAAAhB   ','  B AAAA B   ','   hh  hh    ']},NaOH:{p:{'a':'#FF5252','A':'#C62828','b':'#FF8A80','w':'#fff','e':'#4A0000','p':'#F48FB1','y':'#FFD600','Y':'#FF6F00','c':'#FF8A80','g':'#76FF03','G':'#33691E','h':'#B9F6CA','o':'#FF9800','O':'#BF360C','r':'#FF3D00'},r:['  y y y y    ','  YYYYYYYY   ','   bbbbbb    ','  bbaaaaabr  ',' bawwaaawabr ',' baeeaaaeabo ',' aaaaaaaaaao ','  papaaaapbo ','  baagggab   ','  AAAAhggh   ','   A  hggh   ','      g  g   ']},H2S:{p:{'a':'#FFEB3B','A':'#F57F17','b':'#FFF59D','w':'#fff','e':'#E65100','p':'#F48FB1','t':'#9C27B0','T':'#6A1B9A','g':'#76FF03','G':'#33691E','h':'#B9F6CA'},r:[' T      T    ',' t   g  t g  ',' bbagggagbG  ','bbaaaagaaGhb ','bawaawaawahb ','baeaaeaaeabb ','baaaaaaaaaab ',' papaaaaap   ','  baaaaaab   ','  hAAAAAAh   ','     A  A    ']},O3:{p:{'a':'#FF9800','A':'#BF360C','b':'#FFB74D','w':'#fff','e':'#6D1B00','p':'#F48FB1','r':'#FF3D00','y':'#FFEB3B','o':'#FFD180'},r:[' r r r r r r ',' y y y y y y ','  bbaaaaab   ',' bbaaaaaabb  ',' awaawawawa  ',' aeaaeaaeaa  ',' aaaaaaaaaa  ','  papaaaap   ','  oaaaaab    ','  bAAAAAA    ','   A  A      ']},NH3:{p:{'a':'#D500F9','A':'#6A1B9A','b':'#EA80FC','w':'#fff','e':'#4A148C','p':'#F48FB1','c':'#CE93D8','s':'#FFD600','d':'#E1BEE7','g':'#76FF03','G':'#33691E','h':'#B9F6CA'},r:['  s   s   s  ','   g  s  g   ','   bbgbgbb   ','  bbaaaaabb  ',' bawaawawaab ',' baeaaeaaeab ',' baaaaaaaaab ',' papaaaaaap  ','  baaaaaab   ','  cdAAAAdc   ','   A    A    ']},CH4:{p:{'a':'#448AFF','A':'#0D47A1','b':'#82B1FF','w':'#fff','e':'#01579B','p':'#F48FB1','y':'#FFD600','Y':'#FFB300','c':'#90CAF9','g':'#76FF03','G':'#33691E','h':'#B9F6CA'},r:[' g y Y y g   ',' G YYYYY G   ',' Ghbbbbbbhg  ','gbbaaaaaabbg ','baawawawawaab','baaeaaaaeaab ','baaaaaaaaaab ',' apaaaaaaap  ','  bcaaaaacb  ',' ghAAAAAAhg  ',' g  A  A  g  ']},SO3:{p:{'a':'#FFEB3B','A':'#F57F17','b':'#FFF59D','w':'#fff','e':'#E65100','p':'#F48FB1','t':'#9C27B0','T':'#6A1B9A','o':'#FF9800','O':'#BF360C','r':'#FF3D00'},r:[' T r r r r T ',' t o o o o t ',' oooaaaaooo  ','oobbaaaabboo ','obawawawabo  ','obaeaaaaeabo ','oaaaaaaaaaao ',' papaaaaap   ',' obaaaaaabo  ','  OAAAAAO    ','  o  AA  o   ']},C2H2:{p:{'a':'#448AFF','A':'#0D47A1','b':'#82B1FF','w':'#fff','e':'#01579B','p':'#F48FB1','y':'#FFD600','Y':'#FFB300','c':'#90CAF9','g':'#76FF03','G':'#33691E','h':'#B9F6CA','r':'#FF1744'},r:[' yy g g yy   ',' Yy G G Yy   ',' hbbg  gbbh  ','gbbaaaaaaabbg','baawaawawaabb','baaeaaaaeabb ','baaaaaaaaaab ',' papaaaaap   ','  bcaaaacb   ','  rAAAArAA   ','   A    A    ']},CH4O:{p:{'a':'#448AFF','A':'#0D47A1','b':'#82B1FF','w':'#fff','e':'#01579B','p':'#F48FB1','y':'#FFD600','c':'#90CAF9','g':'#76FF03','G':'#33691E','h':'#B9F6CA','o':'#FF9800','O':'#BF360C','r':'#FF3D00'},r:[' g g y y g   ',' G G Y Y G   ',' gbbbbbbbgo  ','gbbaaaaaabbo ','baawawawaabo ','baaeaaaaeabb ','baaaaaaaaaab ',' papaaaaap   ','  bcaaaacb   ','  AAAAAAA    ','    A  A     ']},NaHCO3:{p:{'a':'#FF5252','A':'#C62828','b':'#FF8A80','w':'#fff','e':'#4A0000','p':'#F48FB1','y':'#FFD600','Y':'#FF6F00','o':'#FF9800','O':'#BF360C','r':'#FF3D00','c':'#448AFF','C':'#0D47A1','d':'#82B1FF','g':'#76FF03','G':'#33691E','h':'#B9F6CA'},r:['   Y Y Y Y     ','   yyyyyyy     ','  r  r  r      ','  oooooooo     ','  bbbaaabbb    ',' bbaaaaaaabb   ',' awaaaaaawab   ',' aeaaaaaaeab   ',' aaaaaagaaab   ',' pagaaagCaap   ','  bCCCdCCCb    ','  hAAAAAAAh    ','  g   A    g   ','  g        g   ']},Fe2O3:{p:{'a':'#8D6E63','A':'#3E2723','b':'#A1887F','w':'#fff','e':'#1A0000','p':'#F48FB1','k':'#212121','h':'#4E342E','r':'#BDBDBD','R':'#616161','o':'#FF9800','O':'#BF360C','q':'#FFB74D','Q':'#FF3D00','y':'#FFD600'},r:['  y  y  y  y   ','  Y  Y  Y  Y   ','  r  r  r  r   ','  R  R  R  R   ','   kaaaaaak    ','  kkaaaaaakk   ',' bawaawawawab  ',' baeaaeaaeaab  ',' aaaaaaaaaaaa  ',' papaaaaaaap   ','  baaaaaaab    ','  OAAAAAAAO    ','  O   A A  O   ','  h         h  ']},Na2CO3:{p:{'a':'#FF5252','A':'#C62828','b':'#FF8A80','w':'#fff','e':'#4A0000','p':'#F48FB1','y':'#FFD600','Y':'#FF6F00','o':'#FF9800','O':'#BF360C','r':'#FF3D00','q':'#FFB74D','c':'#448AFF','C':'#0D47A1','d':'#82B1FF'},r:['  y y  y  y    ',' YYYYY YYYYY   ','  r r  r r     ','  o o  o o     ','   bbbbbb      ','  bbaaaaab     ',' bawaawawab    ',' baeaaeaeab    ',' aaaaaaaaab    ',' papaccaap     ','  baCCCCb      ','  OAAAAO       ','  O  A   O     ','  r       r    ']},H2SO4:{p:{'a':'#FFEB3B','A':'#F57F17','b':'#FFF59D','w':'#fff','e':'#E65100','p':'#F48FB1','t':'#9C27B0','T':'#6A1B9A','o':'#FF9800','O':'#BF360C','r':'#FF3D00','q':'#FFB74D','g':'#76FF03','G':'#33691E','h':'#B9F6CA','y':'#FFD600'},r:[' T r y  y r T  ',' t o Y  Y o t  ',' oooggrgggoo   ',' oobbbbbbboo   ',' obbaaaaabbo   ',' bawaawawabo   ',' baeaaeaaeab   ',' aaaaaaaaaab   ',' papaaaaaap    ','  baaaaaaab    ','  OAAAAAAAO    ','  O   A A  O   ','  r         r  ','  g         g  ']},C7:{p:{'a':'#E040FB','A':'#AA00FF','w':'#fff','e':'#6A1B9A','g':'#FFD700','d':'#CE93D8','r':'#FF1744','b':'#2196F3','n':'#4CAF50','k':'#4A148C','G':'#FF8F00','D':'#AB47BC','y':'#FFEB3B','Y':'#FFFFFF','c':'#E91E63'},r:['  g r g b g n  ','  gGgGgGgGgGg  ','  ggggggggggg  ','   ddddddddd   ','  dddddddddd   ',' dawaawawawad  ',' daeaaeaaeaad  ',' daaaaaaaaaad  ',' dappaaaaappad ','  dDDDdddDDDd  ','   DDDDDDDDD   ','   kkDDDDDkk   ','   kk     kk   ','  Y         Y  ']},CO:{p:{'a':'#448AFF','A':'#0D47A1','b':'#82B1FF','w':'#fff','e':'#01579B','p':'#F48FB1','o':'#FF9800','O':'#BF360C','r':'#FF3D00','k':'#212121'},r:['  k  r r  k ','  koryoyok  ','  bbaaabb   ',' bbaaaaabb  ',' awaawawab  ',' aeaaeaeab  ',' aaaaaaaab  ',' apaaaaapo  ','  baaaaab   ','  AAAAAAA   ','   k   k    ']},NO:{p:{'a':'#D500F9','A':'#6A1B9A','b':'#EA80FC','w':'#fff','e':'#4A148C','p':'#F48FB1','s':'#FFD600','o':'#FF9800','O':'#BF360C','r':'#FF3D00'},r:['  s s r r   ','  sss oyo   ',' bbaaaabbo  ','bbaaaaaabbo ','bawaawawabb ','baeaaeaeab  ','baaaaaaaab  ',' papaaaap   ','  baaaaab   ','  AAAAAAA   ']},Na2O:{p:{'a':'#FF1744','A':'#B71C1C','b':'#FF5252','w':'#fff','e':'#4A0000','p':'#F48FB1','y':'#FFD600','Y':'#FF6F00','o':'#FF9800','O':'#BF360C','r':'#FF3D00'},r:[' y y y   r  ',' YYYYY  ryr ','  bbaabbo   ',' bbaaaaabbo ',' awaawawabo ',' aeaaeaeab  ',' aaaaaaaab  ',' papaaaap   ','  baaaaab   ','  AAAAAAA   ']},Ag2O:{p:{'a':'#B0BEC5','A':'#37474F','b':'#CFD8DC','w':'#fff','e':'#263238','p':'#F48FB1','c':'#ECEFF1','y':'#FDD835','o':'#FF9800','O':'#BF360C','r':'#FF3D00'},r:[' y y y   r  ',' yyyyy  ryr ','  bbaabbo   ',' bbaaaaabbo ',' awaawawabo ',' aeaaeaeab  ',' aaaaaaaab  ',' papaaaap   ','  baaaaab   ','  AAAAAAA   ']},Ag2S:{p:{'a':'#B0BEC5','A':'#37474F','b':'#CFD8DC','w':'#fff','e':'#263238','p':'#F48FB1','c':'#ECEFF1','y':'#FDD835','S':'#FFEB3B','B':'#F9A825','t':'#9C27B0','T':'#6A1B9A'},r:[' y y y  T T ',' yyyyy  t t ','  bbaabbSSS ',' bbaaaaaSab ',' bawaawSawab',' baeaaeSaeab',' aaaaaaSaab ',' papaSSaap  ','  baSaaab   ','  BAAAAAB   ']},Cu2O:{p:{'a':'#FF7043','A':'#BF360C','b':'#FFAB91','w':'#fff','e':'#3E2723','p':'#F48FB1','y':'#FFD600','Y':'#F57F17','o':'#FF9800','O':'#BF360C','r':'#FF3D00'},r:[' y y y   r  ',' YYYYY  ryr ','  bbaabbo   ',' bbaaaaabbo ',' awaawawabo ',' aeaaeaeab  ',' aaaaaaaab  ',' papaaaap   ','  baaaaab   ','  AAAAAAA   ']},NO2:{p:{'a':'#D500F9','A':'#6A1B9A','b':'#EA80FC','w':'#fff','e':'#4A148C','p':'#F48FB1','s':'#FFD600','o':'#FF9800','O':'#BF360C','r':'#FF3D00'},r:['  sss  r r  ','  s s  oyo  ',' bbaaaaabbo ','bbaaaaaabbo ','bawaawawabbo','baeaaeaeabb ','baaaaaaaab  ',' papaaaap o ','  baaaaab   ','  AAAAAAA   ']},N2O:{p:{'a':'#D500F9','A':'#6A1B9A','b':'#EA80FC','w':'#fff','e':'#4A148C','p':'#F48FB1','s':'#FFD600','y':'#FFFFFF','d':'#E1BEE7','o':'#FF9800','O':'#BF360C','r':'#FF3D00'},r:[' s s s   r  ',' yyy yy  r  ','  bbaabbo   ',' bbaaaaabbo ',' aaawwaaabo ',' aawwwwaab  ',' aaaaaaaab  ',' papaaaap   ','  baaaaab   ','  AAAAAAA   ']},FeCl2:{p:{'a':'#8D6E63','A':'#3E2723','b':'#A1887F','w':'#fff','e':'#1A0000','p':'#F48FB1','k':'#212121','h':'#4E342E','r':'#BDBDBD','R':'#616161','c':'#00E5FF','C':'#006064','d':'#80DEEA','t':'#B2EBF2'},r:[' r  r ttt t ',' R  R tbbbb ',' kaak  bbbb ',' kaaaa  bbb ',' awaawcawab ',' aeaaecaeab ',' aaaaaaCaab ','  paaaCaap  ','   baaaCab  ','  hhAAAA h  ']},CuCl2:{p:{'a':'#FF7043','A':'#BF360C','b':'#FFAB91','w':'#fff','e':'#3E2723','p':'#F48FB1','y':'#FFD600','Y':'#F57F17','c':'#00E5FF','C':'#006064','d':'#80DEEA','t':'#B2EBF2'},r:[' y y y ttt  ',' YYYYY tbb  ','  bbaa  bbd ',' bbaaaaa bd ',' bawaawcawad',' baeaaecaeab',' aaaaaaCaab ',' papaaCaap  ','  baaaCab   ',' s AAAAA s  ']},NaClO:{p:{'a':'#FF1744','A':'#B71C1C','b':'#FF5252','w':'#fff','e':'#4A0000','p':'#F48FB1','y':'#FFD600','Y':'#FF6F00','c':'#00E5FF','C':'#006064','d':'#80DEEA','t':'#B2EBF2','o':'#FF9800','O':'#BF360C','r':'#FF3D00'},r:[' y y y ttt  ',' YYYY tbbb r','  bbaab bb r',' bbaaaaabbr ',' bawaawcawa ',' baeaaecaea ',' aaaaaaCaab ',' papaaCaap  ','  baaaCab   ','  AAAAAAA   ']},H2O2:{p:{'a':'#4FC3F7','A':'#0288D1','b':'#81D4FA','w':'#fff','e':'#01579B','p':'#F48FB1','c':'#B3E5FC','g':'#76FF03','G':'#33691E','h':'#B9F6CA','o':'#FF9800','O':'#BF360C','r':'#FF3D00'},r:[' g g  r r   ',' G G  oyo   ','  bbccccb   ',' bcbccbaab  ',' cawaaaawa  ',' caeaaaaeac ',' caaaaaaac  ','  papaaap   ','  baaaaab   ','  AAAAAAA   ']},FeCl3:{p:{'a':'#8D6E63','A':'#3E2723','b':'#A1887F','w':'#fff','e':'#1A0000','p':'#F48FB1','k':'#212121','h':'#4E342E','r':'#BDBDBD','R':'#616161','c':'#00E5FF','C':'#006064','d':'#80DEEA','t':'#B2EBF2'},r:[' r  r t t t  ',' R  R bbbbbt ',' kaaak ccccd ',' kkaaak  ccc ',' bawaawcawab ',' baeaaecaeab ',' aaaaaaCaaab ','  papaCaaap  ','   baaCaaab  ',' CCCAAAAAACC ','  h       h  ']},HNO3:{p:{'a':'#D500F9','A':'#6A1B9A','b':'#EA80FC','w':'#fff','e':'#4A148C','p':'#F48FB1','s':'#FFD600','d':'#E1BEE7','g':'#76FF03','G':'#33691E','h':'#B9F6CA','o':'#FF9800','O':'#BF360C','r':'#FF3D00'},r:['  s r r r s  ',' g s o o o g ','  bbaaaabb   ',' bbaaaaaabbo ',' bawaawaawab ',' baeaaeaaeab ',' baaaaaaaab  ',' papaaaaap   ','  bcaaaacb   ','  OAAAAAAA   ','  O   A  O   ']}};
const CompSprite=({k,size=48})=>{const d=COMP_PIXELS[k];return d?<PA rows={d.r} palette={d.p} size={size}/>:null;};

/* ── Boss Pixels ─── */
const BOSS_PIXELS={1:{p:{'a':'#81D4FA','A':'#4FC3F7','b':'#B3E5FC','B':'#29B6F6','w':'#fff','e':'#0d47a1','p':'#f48fb1','h':'#e1f5fe','s':'#FFF9C4','y':'#FFEB3B','c':'#E1F5FE'},r:['   s       s   ','     bbbb      ','    bhhhbb     ','   bhhhhbbbs   ','     bbbbb     ','    aaaaaaa    ','   aaaaaaaaa   ','  aawwaaawwaa  ','  aaewaaaewaa  ','  aaaaaaaaaa   ','  aapaaaaapa   ','  aaaammmmaA   ','   aaaaaaaA    ','    AAAAAA  s  ','   AA    AA    ']},2:{p:{'a':'#4FC3F7','A':'#0288d1','b':'#B3E5FC','B':'#01579B','w':'#fff','e':'#01579b','f':'#039be5','h':'#e1f5fe','k':'#01579B','s':'#81D4FA','y':'#FFFFFF','r':'#E1F5FE'},r:['    bb   bb    ','    BB   BB    ','     aaaaa     ','    aaaaaaa    ','   aawwaawwa   ','   aaewaaewaA  ','   aayyayyyaA  ','   aaaaaaaaa   ','     aaaaa     ','      aaa      ','   aaaaaaaa    ','  aaaaaaaaaA   ','  aaaaaaaaaA   ','   AAAAAAAA    ','  AAA    AAAA  ']},3:{p:{'a':'#FFE082','A':'#F57F17','b':'#FFF59D','B':'#F9A825','w':'#fff','e':'#E65100','d':'#FFCA28','h':'#FFF8E1','s':'#FFFFFF','y':'#FFC107','k':'#E65100'},r:['    s s s s    ','   bbbbbbbbb   ','   baaaaaaab   ','  baaaaaaaaab  ',' bbaawwawwaabb ',' baaewaaewaaaB ',' bbaaaaaaaaabB ',' BbaaakkkaaabB ',' BBaaaaaaaaaBB ',' BBaaadddddaaB ','  BaaaaaaaaaB  ','   AAAAAAAAA   ','  AAA     AAA  ',' AAA       AAA ',' hh         hh ']},4:{p:{'a':'#A5D6A7','A':'#2E7D32','b':'#C8E6C9','B':'#388E3C','w':'#fff','e':'#1B5E20','f':'#66BB6A','h':'#E8F5E9','g':'#81C784','c':'#FFFFFF','s':'#DCEDC8'},r:['  c         c  ','   c       c   ','    aaaaaaa    ',' cfaaaaaaaaafc ',' cfaaaaaaaaafc ','  faawwawwaaf  ','   aaewaaewa   ','   aaaaaaaaa   ','   aappaaapa   ','  ccaaaaaaacc  ','  cccaaaaaccc  ','    AAAAA      ','   cAA  AAc    ','  cc      cc   ',' c          c  ']},5:{p:{'a':'#FF8A65','A':'#BF360C','b':'#FFAB91','B':'#8E2600','w':'#fff','e':'#3E2723','y':'#FFF200','h':'#4E342E','k':'#212121','g':'#795548','s':'#FFCCBC','o':'#FF5722','c':'#FF7043'},r:['               ','    sssssss    ','   swwaaaaws   ','   sewaaaews   ','   sssssssss   ','  bbbbbbbbbbb  ',' bAAAAAAAAAAAb ',' bBAAyyyAAAAb  ',' bAAyyyyyAAAb  ',' bBAAyyyAAABb  ',' bAAAAAAAAAAb  ','  bbbbbbbbbb   ','  gg      gg   ','  hh      hh   ','               ']},6:{p:{'a':'#CFD8DC','A':'#455A64','b':'#ECEFF1','B':'#37474F','w':'#fff','e':'#263238','y':'#FDD835','r':'#C62828','k':'#212121','s':'#B0BEC5','d':'#78909C','R':'#B71C1C'},r:['  bb       bb  ','  bAb     bAb  ','  bAAb   bAAb  ','   AAaaaaaaA   ','  aaaaaaaaaaa  ','  awwaaasawwa  ','  awkakkkakwa  ','  aaaaaaaaaaa  ','  aakkaaakkaA  ','  aaaaaaaaaaA  ',' RRaaaaaaaaRR  ',' RRAAAsAAsAARR ',' R AAAyyyyyA R ','   AA     AA   ','  AA       AA  ']},7:{p:{'a':'#8D6E63','A':'#3E2723','b':'#A1887F','B':'#4E342E','w':'#fff','e':'#1A0000','r':'#FF1744','h':'#212121','k':'#000','y':'#FFC107','R':'#B71C1C','s':'#BDBDBD','g':'#616161'},r:['   kk     kk   ','   kAk   kAk   ','  aaaaaaaaaaa  ','  arrrhhhrrra  ','  arhhrrrhhra  ','  akAAAAAAAka  ','  aaaaaaaaaaa  ',' aassasssassaa ',' aaaaaaaaaaaaa ',' aaAAAAAAAAAaa ',' aaBBBBBBBBBaa ',' gggAAAAAAAggg ',' gg AAAAAAA gg ','   AAA   AAA   ','  AAA     AAA  ']},8:{p:{'a':'#FDD835','A':'#F57F17','b':'#FFF59D','B':'#F9A825','w':'#fff','e':'#E65100','k':'#212121','g':'#FFF176','t':'#9C27B0','T':'#6A1B9A','r':'#D84315','y':'#FFEB3B','s':'#8E24AA','R':'#B71C1C'},r:[' t  t  t  t  t ',' T  T  T  T  T ','    aaaaaaa    ','   aaaaaaaaa   ','  aarrearraaa  ','  aekkaakkea   ','  aeekkkkkea   ','  aaaaaaaaaa   ','  wwaaaaaaww   ','  wwaaaaaaaww  ','  aaaaaaaaaa   ','  Taaaaaaaat   ','  Ttttttttt    ','  tt  T  tt    ','  t   T   t    ']},9:{p:{'s':'#FFE0B2','S':'#D7A86E','w':'#FFFFFF','W':'#E0E0E0','e':'#D500F9','E':'#6A1B9A','k':'#212121','K':'#424242','h':'#fff','c':'#CE93D8','a':'#1a1a1a','y':'#FFEB3B','g':'#4CAF50','r':'#F44336','b':'#2196F3','L':'#B0BEC5'},r:[' KK  KK KK  KK ','  KKkkkkkkkkK  ','  kkkkkkkkkkK  ','  ksssssssssk  ','  keEksskEeks  ','  ssssksssssk  ','  sssskksssk   ','   sssSSSsss   ','  wwwwwwwww    ','  wLwbgrbwLw   ','  wLwygcywLw   ','  wwLwwwwLww   ',' WWwwwwwwwwWW  ',' W  wwwwww  W  ','    LL  LL     ']},10:{p:{'d':'#CE93D8','D':'#AB47BC','w':'#fff','e':'#4A148C','g':'#FFD700','G':'#FF8F00','r':'#F44336','b':'#2196F3','n':'#4CAF50','k':'#4A148C','B':'#311B92','c':'#E040FB','y':'#FFEB3B','E':'#BA68C8','h':'#FFFFFF'},r:['  g   r g   g  ','  gGgGgGgGgGg  ','  ggggggggggg  ','    ddddddd    ','   dEEddddEd   ','  dhwddddhwd   ',' ddewddddewdd  ',' ddddddddddd   ',' dbddddddnddd  ',' drdddddddddd  ','  dDDDDdDDDd   ','  DDDDDDDDDDD  ','  BBDDDDDDDBB  ','  BBB     BBB  ',' hh         hh ']},11:{p:{'a':'#00E5FF','A':'#00838F','b':'#B2EBF2','w':'#fff','e':'#006064','p':'#E040FB','h':'#E0F7FA','s':'#FFEE58'},r:['    s bbb s    ','    shhbbs b   ','   bhhhbbb bb  ','    bbbb sbb   ','    aaaaaaa    ','   aaaaaaaaa   ','  aaawwaawwaa  ','  aaaewaaewaA  ','  aaaaaaaaaaA  ','  aapaaaaapaA  ','  aaaaaaaaaAA  ','   aaaaaaaAA   ','    AAAAAAA    ','   AA    AA    ']},12:{p:{'a':'#FF6E40','A':'#BF360C','b':'#8D6E63','B':'#3E2723','w':'#fff','e':'#1a1a1a','r':'#FF1744','h':'#4E342E','s':'#ECEFF1','S':'#90A4AE','k':'#000','y':'#FFD600','c':'#FFAB91','g':'#FFEB3B'},r:['  rr       rr  ','  rrr     rrr  ','   aaa   bbb   ','  aaaaa bbbbb  ',' aaaaaaabbbbbb ',' aawwaaabbwwbb ',' aaewaaabbewbB ',' aaaaaaabbbbbB ',' cccaaaabbbbcc ',' sss AAA BBB SS',' Ss  AAA BBB sS','sS   AAA BBB  s','g    AAA BBB  S','g    AAA BBB   ','   hhh     hhh ','  hhh       hhh']},13:{p:{'a':'#CE93D8','A':'#4A148C','b':'#E040FB','B':'#6A1B9A','w':'#fff','e':'#1A001A','r':'#00E676','R':'#00C853','y':'#FFD700','Y':'#FFA000','p':'#F06292','g':'#4CAF50','E':'#FF1744','k':'#212121','s':'#F8BBD0','c':'#AA00FF'},r:[' Y   Y Y   Y   ',' YkYkYkYkYkY   ',' YYYYYYYYYYY   ','  bbbbbbbbb    ',' baaaaaaaaab   ',' baaaaaaaaab   ','BawEEaaaEEwaB  ','BaakkaaakkaaB  ','BaaaaaaaaaaaB  ','BaaappaaappaB  ',' BaaammmmmaaA  ',' BBbbBBBbbBBA  ',' cBAAABBAAABc  ',' c BBB B BBB c ',' r  BB   BB  r ','R    R   R    R']},14:{p:{'s':'#D7CCC8','S':'#A1887F','w':'#fff','e':'#00E5FF','E':'#00B0FF','a':'#3F51B5','A':'#1A237E','B':'#0D47A1','k':'#000','K':'#212121','h':'#FFFFFF','y':'#FFD600','c':'#E040FB','b':'#448AFF','g':'#4CAF50','r':'#F44336','n':'#FFEB3B','p':'#D7A86E','Y':'#FDD835'},r:['  y c b r n g  ','  Y C B R N G  ','    aaaaaaa    ','   aAAAAAAAa   ','  aAhhhhhhhAa  ','  asssSSSsssa  ','  swEEsssEEws  ','  seeksskees   ','  sssKKKKsss   ','  ssSSSSSSss   ','  SShhhhhhSS   ','   hhhhhhhh    ','  AAAaaaaaAAA  ','  ABcnbrgCBA   ',' AAaaaaaaaaAA  ',' A    AAA    A ']},15:{p:{'s':'#1a1a1a','w':'#0a0a0a','W':'#FFFFFF','e':'#FF1744','E':'#D50000','k':'#000','K':'#212121','h':'#FFEE58','r':'#FF1744','R':'#880E4F','b':'#4A148C','a':'#311B0E','A':'#1B0A08','y':'#FFD600','Y':'#FFA000','c':'#E91E63','g':'#FFB300','m':'#C62828'},r:[' y      y      ',' Y      Y    r ','     g       r ','   rrrrrrr  r  ','  rkkkkkkkr r  ','  kkWkkkWkkk   ','  kssssssssk   ',' rkseesseesskr ','  kssskssssk   ','  kkssssssk    ','   kkKKKkkr    ',' rrkkKKKKkkrr  ',' rREEEEEEEERr  ','  rEEEEEEEEr   ','  rr EEEEE rr  ','  AA       AA  ']}};
const BossSprite=({id,size=120})=>{const d=BOSS_PIXELS[id];return d?<PA rows={d.r} palette={d.p} size={size}/>:<div style={{fontSize:size/2}}>👾</div>;};

/* ── Data ─── */
const ATOMS=[{s:"H",nh:"すいそ",nk:"水素",color:"#4cff4c",bg:"#c8f7c5",tc:"#1b6e1b",n:18,atk:1},{s:"O",nh:"さんそ",nk:"酸素",color:"#ff9100",bg:"#ffe0b2",tc:"#bf360c",n:14,atk:1},{s:"C",nh:"たんそ",nk:"炭素",color:"#448aff",bg:"#bbdefb",tc:"#0d47a1",n:9,atk:2},{s:"N",nh:"ちっそ",nk:"窒素",color:"#d500f9",bg:"#e1bee7",tc:"#6a1b9a",n:4,atk:3},{s:"S",nh:"いおう",nk:"硫黄",color:"#ffd600",bg:"#fff9c4",tc:"#f57f17",n:4,atk:3},{s:"Cl",nh:"えんそ",nk:"塩素",color:"#00e5ff",bg:"#b2ebf2",tc:"#006064",n:6,atk:2},{s:"Na",nh:"ナトリウム",nk:"ナトリウム",color:"#ff1744",bg:"#f8bbd0",tc:"#b71c1c",n:6,atk:2},{s:"Cu",nh:"どう",nk:"銅",color:"#ff6e40",bg:"#ffccbc",tc:"#bf360c",n:4,atk:3},{s:"Ag",nh:"ぎん",nk:"銀",color:"#90a4ae",bg:"#cfd8dc",tc:"#37474f",n:4,atk:3},{s:"Fe",nh:"てつ",nk:"鉄",color:"#8d6e63",bg:"#d7ccc8",tc:"#3e2723",n:4,atk:3}];
const getA=s=>ATOMS.find(a=>a.s===s)||ATOMS[0];const useAN=()=>{const l=useLang();return a=>l==="kanji"?a.nk:a.nh;};
const RARITY={H:1,O:1,C:2,Cl:2,Na:2,N:3,S:3,Cu:3,Ag:3,Fe:3};const MULT={2:1,3:1.5,4:2,5:2.5,6:3,7:3.5};const calcPts=a=>{const rare=Object.entries(a).reduce((s,[el,n])=>s+(RARITY[el]||1)*n,0);const cards=Object.values(a).reduce((s,n)=>s+n,0);return Math.round(rare*(MULT[cards]||1));};

const COMPOUNDS=[{k:"H2",f:"H₂",nh:"すいそぶんし",nk:"水素分子",a:{H:2},emoji:"💧",tip:"一番かるい気体。燃やすとすごい爆発をおこすよ！"},{k:"O2",f:"O₂",nh:"さんそぶんし",nk:"酸素分子",a:{O:2},emoji:"🌬️",tip:"空気の約21%。生きものが呼吸でつかうよ！"},{k:"H2O",f:"H₂O",nh:"みず",nk:"水",a:{H:2,O:1},emoji:"🐉",tip:"地球のひみつ！人間の体の60%はこれでできてるよ"},{k:"HCl",f:"HCl",nh:"えんかすいそ",nk:"塩化水素",a:{H:1,Cl:1},emoji:"🐍",tip:"水にとけると強いさん(塩酸)になる。胃のなかにもあるよ！"},{k:"CO2",f:"CO₂",nh:"にさんかたんそ",nk:"二酸化炭素",a:{C:1,O:2},emoji:"💨",tip:"はく息や炭酸ジュースに入ってる。植物のごはん！"},{k:"N2",f:"N₂",nh:"ちっそぶんし",nk:"窒素分子",a:{N:2},emoji:"🌸",tip:"空気の約78%！ふくろのおかしを守るガスにつかわれるよ"},{k:"Cl2",f:"Cl₂",nh:"えんそぶんし",nk:"塩素分子",a:{Cl:2},emoji:"🫧",tip:"プールや水道水のしょうどくに使うよ。きいろい気体"},{k:"NaCl",f:"NaCl",nh:"えんかナトリウム",nk:"塩化ナトリウム",a:{Na:1,Cl:1},emoji:"🧂",tip:"みんなが食べてる「お塩」だよ！海水にもたくさん溶けてる"},{k:"CuO",f:"CuO",nh:"さんかどう",nk:"酸化銅",a:{Cu:1,O:1},emoji:"⚔️",tip:"10円玉をずっと置いとくと黒くなるのがこれ！"},{k:"FeO",f:"FeO",nh:"さんかてつ",nk:"酸化鉄",a:{Fe:1,O:1},emoji:"🛡️",tip:"鉄のサビの一種。黒っぽい色だよ"},{k:"AgCl",f:"AgCl",nh:"えんかぎん",nk:"塩化銀",a:{Ag:1,Cl:1},emoji:"🌫️",tip:"光にあたると黒くなる。昔のフィルム写真に使われてたよ"},{k:"CuS",f:"CuS",nh:"りゅうかどう",nk:"硫化銅",a:{Cu:1,S:1},emoji:"👹",tip:"黒い鉱石。銅(どう)の鉱山からとれるよ"},{k:"FeS",f:"FeS",nh:"りゅうかてつ",nk:"硫化鉄",a:{Fe:1,S:1},emoji:"🦂",tip:"「黄鉄鉱(おうてっこう)」とも呼ばれる。金色にかがやく！"},{k:"NaOH",f:"NaOH",nh:"すいさんかナトリウム",nk:"水酸化ナトリウム",a:{Na:1,O:1,H:1},emoji:"🧪",tip:"強いアルカリせい。せっけんや紙づくりに使うよ"},{k:"H2S",f:"H₂S",nh:"りゅうかすいそ",nk:"硫化水素",a:{H:2,S:1},emoji:"🥚",tip:"くさった卵のにおい！温泉のあのニオイもこれだよ"},{k:"O3",f:"O₃",nh:"オゾン",nk:"オゾン",a:{O:3},emoji:"🌀",tip:"空のたかいところで紫外線(しがいせん)から守ってくれてる！"},{k:"SO2",f:"SO₂",nh:"にさんかいおう",nk:"二酸化硫黄",a:{S:1,O:2},emoji:"🌋",tip:"火山からふきでるガス。酸性雨のげんいんのひとつ"},{k:"NH3",f:"NH₃",nh:"アンモニア",nk:"アンモニア",a:{N:1,H:3},emoji:"💜",tip:"ツンとしたにおい!ひりょうや薬の原料になるよ"},{k:"CH4",f:"CH₄",nh:"メタン",nk:"メタン",a:{C:1,H:4},emoji:"🔥",tip:"天然ガスの主な成分!家のガスコンロで使ってるよ"},{k:"SO3",f:"SO₃",nh:"さんさんかいおう",nk:"三酸化硫黄",a:{S:1,O:3},emoji:"🌪️",tip:"水とくっつくと強いりゅうさんになるよ。こわい！"},{k:"C2H2",f:"C₂H₂",nh:"アセチレン",nk:"アセチレン",a:{C:2,H:2},emoji:"⚡",tip:"燃やすととっても明るくて熱い!鉄をとかす溶接(ようせつ)に使う"},{k:"NaHCO3",f:"NaHCO₃",nh:"じゅうそう",nk:"重曹",a:{Na:1,H:1,C:1,O:3},emoji:"🧁",tip:"パンをふくらませたり、おそうじに使える万能やつ!"},{k:"CH4O",f:"CH₃OH",nh:"メタノール",nk:"メタノール",a:{C:1,H:4,O:1},emoji:"🍶",tip:"燃料や消毒にも使うアルコール。飲むとキケン!"},{k:"Fe2O3",f:"Fe₂O₃",nh:"さんかてつ(III)",nk:"酸化鉄(III)",a:{Fe:2,O:3},emoji:"👑",tip:"赤茶色の鉄のサビ。むかしの土器の色のもと!"},{k:"Na2CO3",f:"Na₂CO₃",nh:"たんさんナトリウム",nk:"炭酸ナトリウム",a:{Na:2,C:1,O:3},emoji:"🦅",tip:"「ソーダ灰」ともいう。ガラスや洗剤のげんりょう!"},{k:"H2SO4",f:"H₂SO₄",nh:"りゅうさん",nk:"硫酸",a:{H:2,S:1,O:4},emoji:"⚗️",tip:"とっても強いさん!車のバッテリーや工場でつかうよ"},{k:"C7",f:"C₇",nh:"ダイヤモンド",nk:"ダイヤモンド",a:{C:7},emoji:"💎",tip:"世界で一番かたい物質!たんそだけでできたほうせき",sp:true},{k:"CO",f:"CO",nh:"いっさんかたんそ",nk:"一酸化炭素",a:{C:1,O:1},emoji:"☠️",tip:"きけんなどく!燃焼ガスやストーブの不完全燃焼ででるよ"},{k:"NO",f:"NO",nh:"いっさんかちっそ",nk:"一酸化窒素",a:{N:1,O:1},emoji:"🏭",tip:"車の排気ガス。体内では血管をひろげる大切なぶっしつ!"},{k:"Na2O",f:"Na₂O",nh:"さんかナトリウム",nk:"酸化ナトリウム",a:{Na:2,O:1},emoji:"🔶",tip:"ガラスの原料の一つ。ナトリウムが酸素とくっついたもの"},{k:"Ag2O",f:"Ag₂O",nh:"さんかぎん",nk:"酸化銀",a:{Ag:2,O:1},emoji:"⚫",tip:"ボタン電池の材料。黒い粉だよ"},{k:"Ag2S",f:"Ag₂S",nh:"りゅうかぎん",nk:"硫化銀",a:{Ag:2,S:1},emoji:"🕯️",tip:"銀(ぎん)のアクセサリーがくろくくすむやつの正体!"},{k:"Cu2O",f:"Cu₂O",nh:"さんかどう(I)",nk:"酸化銅(I)",a:{Cu:2,O:1},emoji:"🧱",tip:"れんがのような赤い粉。宝石の仲間にもあるよ"},{k:"NO2",f:"NO₂",nh:"にさんかちっそ",nk:"二酸化窒素",a:{N:1,O:2},emoji:"🌫️",tip:"赤茶色のきたないガス。光化学スモッグの原因!"},{k:"N2O",f:"N₂O",nh:"いっさんかにちっそ",nk:"一酸化二窒素",a:{N:2,O:1},emoji:"😄",tip:"「笑気(しょうき)ガス」とよばれる。病院のますいに使う"},{k:"FeCl2",f:"FeCl₂",nh:"えんかてつ(II)",nk:"塩化鉄(II)",a:{Fe:1,Cl:2},emoji:"🧲",tip:"うすいみどり色のけっしょう。水にとけやすい"},{k:"CuCl2",f:"CuCl₂",nh:"えんかどう(II)",nk:"塩化銅(II)",a:{Cu:1,Cl:2},emoji:"💚",tip:"炎に入れると青みどりに光る!花火の色はこれ"},{k:"NaClO",f:"NaClO",nh:"じあえんそさんナトリウム",nk:"次亜塩素酸ナトリウム",a:{Na:1,Cl:1,O:1},emoji:"🧴",tip:"「ハイター」とかのお洗濯の漂白剤(ひょうはくざい)の正体!"},{k:"H2O2",f:"H₂O₂",nh:"かさんかすいそ",nk:"過酸化水素",a:{H:2,O:2},emoji:"💊",tip:"けがのしょうどくに使うオキシドールのせいぶんだよ"},{k:"FeCl3",f:"FeCl₃",nh:"えんかてつ(III)",nk:"塩化鉄(III)",a:{Fe:1,Cl:3},emoji:"🟤",tip:"水をきれいにする浄水場(じょうすいじょう)のお仕事人!"},{k:"HNO3",f:"HNO₃",nh:"しょうさん",nk:"硝酸",a:{H:1,N:1,O:3},emoji:"💥",tip:"3大強酸のひとつ!金もとかせちゃう!? ひりょうづくりにも使う"}].map(c=>({...c,atk:c.sp?50:calcPts(c.a)}));
const useCN=()=>{const l=useLang();return c=>l==="kanji"?c.nk:c.nh;};

/* ── Stages: 10 main + 5 EX ─── */
const STAGES=[
  {id:1,bossId:1,name:"はじまりの草原",hl:10,deckSize:50,diff:"easy",bossName:"バブリン",bossEmoji:"🫧",bossHp:8,bossColor:"#81D4FA",bossDesc:"シャボン玉のモンスター",intro:"博士「バブリンは水素の泡でできたモンスターじゃ！\nまずは手札から同じ原子を2まいえらんで\n分子に合体させてみよう！」",win:"博士「やるじゃないか！」",winStory:"博士「水たまりの中で何かが動いておるぞ！」",lose:"博士「もう一回じゃ！」"},
  {id:2,bossId:2,name:"あわの洞窟",hl:10,deckSize:50,diff:"easy",bossName:"アクアン",bossEmoji:"💧",bossHp:14,bossColor:"#4FC3F7",bossDesc:"水竜モンスター",intro:"博士「アクアンは水（H₂O）の力を持つ水竜じゃ！\n水素2つと酸素1つで水ができるぞ。\n合体するモンスターを選ぼう！」",win:"博士「すばらしい！」",winStory:"博士「白い結晶が！塩のモンスターが現れそうじゃ」",lose:"博士「次こそ！」"},
  {id:3,bossId:3,name:"結晶の渓谷",hl:9,deckSize:48,diff:"normal",bossName:"ソルティ",bossEmoji:"🧂",bossHp:20,bossColor:"#FFE082",bossDesc:"塩の結晶モンスター",intro:"博士「ソルティはナトリウムと塩素でできた\n塩の結晶モンスターじゃ！\n手札9枚までの制限があるから\nムダ使いせず合体を狙うのじゃ」",win:"博士「溶かしてやったぞ！」",winStory:"博士「風が強くなってきた！」",lose:"博士「しょっぱい攻撃にやられた…」"},
  {id:4,bossId:4,name:"風の高原",hl:9,deckSize:48,diff:"normal",bossName:"エアロン",bossEmoji:"💨",bossHp:25,bossColor:"#A5D6A7",bossDesc:"風の精霊",intro:"博士「エアロンは空気の大半をしめる\n窒素（N）の精霊じゃ！\n窒素は2つでN₂になるぞ。\nアンモニア（NH₃）もねらい目じゃ！」",win:"博士「実力はホンモノじゃ！」",winStory:"博士「銅のヨロイのモンスターが近づいてくる！」",lose:"博士「風に飛ばされたか…」"},
  {id:5,bossId:5,name:"銅の遺跡",hl:8,deckSize:45,diff:"normal",bossName:"コッパー",bossEmoji:"🪙",bossHp:30,bossColor:"#FF8A65",bossDesc:"銅のヨロイの亀",intro:"博士「コッパーは銅（Cu）のヨロイをまとった亀じゃ！\n酸化銅（CuO）や硫化銅（CuS）で\nヨロイを貫けるぞ。\n手札8枚までなので計画的にいくのじゃ」",win:"博士「ヨロイを貫いたぞ！」",winStory:"博士「銀の騎士が現れた！」",lose:"博士「作戦を練り直すんじゃ！」"},
  {id:6,bossId:6,name:"銀の城",hl:8,deckSize:45,diff:"hard",bossName:"シルバーグ",bossEmoji:"🥈",bossHp:35,bossColor:"#B0BEC5",bossDesc:"銀の狼騎士",intro:"博士「シルバーグは銀（Ag）の鎧をまとった狼騎士！\n塩化銀（AgCl）で一刀両断じゃ！\nここからは強敵ぞろい、\n合体リストも活用するのじゃぞ」",win:"博士「勝った！」",winStory:"博士「鉄の巨人が這い上がってくる！」",lose:"博士「剣さばきにやられたか…」"},
  {id:7,bossId:7,name:"鉄の火山",hl:8,deckSize:45,diff:"hard",bossName:"アイアンX",bossEmoji:"🔩",bossHp:40,bossColor:"#8D6E63",bossDesc:"鉄の巨人",intro:"博士「アイアンXは鉄（Fe）の巨人じゃ！\n硫化鉄（FeS）や酸化鉄Ⅲ（Fe₂O₃）の\n強力な合体でなぐり倒せ！\n枚数の多い合体ほど強いぞ」",win:"博士「化学パワーはすごい！」",winStory:"博士「硫黄の毒モンスターが現れるぞ！」",lose:"博士「パワーに圧倒されたか…」"},
  {id:8,bossId:8,name:"毒の沼地",hl:7,deckSize:42,diff:"hard",bossName:"サルファー",bossEmoji:"⚡",bossHp:45,bossColor:"#FDD835",bossDesc:"硫黄の毒モンスター",intro:"博士「サルファーは硫黄（S）の毒モンスターじゃ！\n手札が7枚しか持てん。\n引いたカードはすぐ合体させないと\n手札がパンパンになってしまうぞ！」",win:"博士「浄化した！」",winStory:"博士「暴走した元同僚・カオスじゃ！」",lose:"博士「あきらめるな！」"},
  {id:9,bossId:9,name:"暗黒研究所",hl:7,deckSize:42,diff:"hard",bossName:"ドクターカオス",bossEmoji:"⚗️",bossHp:55,bossColor:"#CE93D8",bossDesc:"暴走した科学者",intro:"博士「ドクターカオスは…ワシの元同僚じゃ。\n化学の力で暴走してしまった…\n正気に戻すには高ATKの合体が必須じゃ！\nリストを封印して×1.5ボーナスも狙え！」",win:"博士「カオスを止めてくれた！」",winStory:"博士「最深部にダイヤキングがおる！」",lose:"博士「もっと強くなるんじゃ！」"},
  {id:10,bossId:10,name:"結晶の玉座",hl:7,deckSize:40,diff:"hard",bossName:"ダイヤキング",bossEmoji:"💎",bossHp:70,bossColor:"#E040FB",bossDesc:"最強の結晶モンスター",intro:"博士「ダイヤキングは純粋な炭素（C）の結晶──\nダイヤモンドの王じゃ！\nHP70！C₇（ダイヤ）のATK50を軸に、\n複数の合体を重ねて一撃で決めるのじゃ！」",win:"博士「化学マスターじゃ！！！」",winStory:"博士「ダイヤキングが砕け散った！…ん？王冠の欠片が怪しく光っておる。モンスターたちが…進化しておる！？EXステージ解放じゃ！」",lose:"博士「キミなら倒せる！」"},
  // ── EXステージ ──
  {id:11,bossId:11,name:"EX はじまりの試練",hl:7,deckSize:38,diff:"hard",bossName:"ネオバブリン",bossEmoji:"🫧",bossHp:50,bossColor:"#00BCD4",bossDesc:"進化したバブリン",ex:true,intro:"博士「なんと、バブリンが進化しておる！\nネオバブリンはHP50、手札は7枚制限。\n序盤の油断は禁物じゃ！\n合体リストにたよらず、\n暗記の×1.5ボーナスを活かすのじゃ」",win:"博士「進化版も倒した！」",winStory:"博士「次は2体が合体したツインメタルじゃ！」",lose:"博士「手札が少ないと厳しいな…」"},
  {id:12,bossId:12,name:"EX 合体の遺跡",hl:7,deckSize:38,diff:"hard",bossName:"ツインメタル",bossEmoji:"⚔️",bossHp:60,bossColor:"#FF6E40",bossDesc:"銅と鉄の合体獣",ex:true,intro:"博士「ツインメタルは銅（Cu）と鉄（Fe）が\n融合した合体モンスターじゃ！HP60。\n金属系の合体（CuO/CuS/FeO/FeS）で\n一気にATKを積み上げるのじゃ！」",win:"博士「合体モンスターも敵じゃないか！」",winStory:"博士「紫色の霧が…毒の女王じゃ！山札が少ない！」",lose:"博士「二重攻撃は強いな…」"},
  {id:13,bossId:13,name:"EX 毒の霧",hl:7,deckSize:35,diff:"hard",bossName:"ポイズンクイーン",bossEmoji:"☠️",bossHp:65,bossColor:"#AB47BC",bossDesc:"毒の女王",ex:true,intro:"博士「ポイズンクイーンは毒の女王じゃ！HP65。\nしかも山札はたったの35枚…短期決戦！\nムダ引きは命取りじゃ。\n高ATK合体をねらって勝負をかけろ！」",win:"博士「毒の女王を浄化した！」",winStory:"博士「ワシの師匠・プロフェッサーXの力じゃ！」",lose:"博士「一手のミスが致命的じゃ…」"},
  {id:14,bossId:14,name:"EX 師匠の試練",hl:7,deckSize:35,diff:"hard",bossName:"プロフェッサーX",bossEmoji:"🧬",bossHp:75,bossColor:"#5C6BC0",bossDesc:"化学の神",ex:true,intro:"博士「プロフェッサーXは…ワシの師匠じゃ。\n化学の神と呼ばれた伝説の男…HP75！\n並の合体では届かぬ。\nH₂SO₄（硫酸）やFe₂O₃（酸化鉄Ⅲ）を\nねらって最大火力を出すのじゃ！」",win:"博士「師匠を超えた！！天才じゃ！」",winStory:"博士「赤い光が…正体不明の最後の敵じゃ！」",lose:"博士「さすが師匠…」"},
  {id:15,bossId:15,name:"EX 最終決戦",hl:7,deckSize:32,diff:"hard",bossName:"???",bossEmoji:"🌌",bossHp:85,bossColor:"#FF1744",bossDesc:"正体不明のモンスター",ex:true,intro:"博士「正体不明のモンスター…！HP85、\n山札32枚＆手札7枚の最凶ハンデじゃ。\nC₇（ダイヤ）のATK50を必ずつくれ！\nリスト封印×1.5ボーナスも駆使して、\n化学マスターの真価を見せるのじゃ！」",win:"博士「あの姿は…若い頃のワシじゃったか！？完全なる化学マスターじゃ！！！」",winStory:"博士「すべてのモンスターが消えた…真の化学マスター！ありがとう！！」",lose:"博士「次元が違う…でもキミなら！」"}
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
const CSS=`@import url('https://fonts.googleapis.com/css2?family=DotGothic16&family=Press+Start+2P&display=swap');*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none}body{font-family:'DotGothic16',monospace;overflow-x:hidden;background:#080820;image-rendering:pixelated}button{font-family:'DotGothic16',monospace;cursor:pointer;transition:transform .08s}button:active{transform:scale(.93)!important}@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes su{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes pg{0%,100%{box-shadow:0 0 8px var(--g)}50%{box-shadow:0 0 20px var(--g),0 0 40px var(--g)}}@keyframes ca{0%{opacity:0;transform:scale(.6)}60%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}@keyframes ke{0%{opacity:0;transform:translate(0,0) scale(.3)}30%{opacity:1;transform:translate(calc(var(--dx)*.4),calc(var(--dy)*.4)) scale(1.2)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.2)}}@keyframes slideRight{from{transform:translateX(-100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes titleGlow{0%,100%{text-shadow:2px 2px 0 #003,0 0 6px rgba(80,180,255,.4)}50%{text-shadow:2px 2px 0 #003,0 0 12px rgba(80,180,255,.7),0 0 24px rgba(80,180,255,.3)}}@keyframes pixelStar{0%,100%{opacity:.15}50%{opacity:.9}}@keyframes bossIdle{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeScale{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}@keyframes pulseRing{0%{transform:scale(.8);opacity:0}40%{opacity:1}100%{transform:scale(1.4);opacity:0}}@keyframes fw{0%{transform:scale(0);opacity:1}50%{opacity:1}100%{transform:scale(1);opacity:0}}@keyframes cf{0%{transform:translateY(-20px);opacity:0}10%{opacity:.8}90%{opacity:.8}100%{transform:translateY(100vh);opacity:0}}
@keyframes whiteFlash{0%{opacity:1}100%{opacity:0}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(80,180,255,.2)}`;

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
const PassScreen=({nextName,nextColor,onReady,message})=>{
  const[count,setCount]=useState(3);
  useEffect(()=>{if(count>0){const t=setTimeout(()=>setCount(c=>c-1),700);return()=>clearTimeout(t);}},[count]);
  return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:`radial-gradient(ellipse at 50% 40%,${nextColor}22,transparent 60%),linear-gradient(180deg,#080820,#0c0c30)`,position:"relative"}}><Stars n={15}/><Scan/>
    <div style={{position:"relative",zIndex:2,textAlign:"center",maxWidth:320}}>
      <div style={{fontSize:72,marginBottom:12,animation:"fl 2s ease-in-out infinite"}}>📱</div>
      <div style={{fontSize:12,color:"#888",fontWeight:700,marginBottom:6,animation:"pixelStar 2s ease-in-out infinite"}}>{message||"つぎのひとに スマホを わたしてね"}</div>
      <div style={{fontSize:10,color:"#555",marginBottom:20}}>▼ ▼ ▼</div>
      <div style={{padding:"20px 24px",background:"#0c0c1a",border:`3px solid ${nextColor}`,marginBottom:20,"--g":nextColor+"88",animation:"pg 1.5s ease-in-out infinite"}}>
        <div style={{fontSize:10,color:"#888",marginBottom:4}}>つぎは…</div>
        <div style={{fontSize:22,fontWeight:900,color:nextColor,fontFamily:"'Press Start 2P','DotGothic16',monospace"}}>{nextName}</div>
        <div style={{fontSize:10,color:"#888",marginTop:6}}>さんのターン</div>
      </div>
      {count>0?<div style={{fontSize:12,color:"#555"}}>{count}びょうまってね…</div>:
        <Btn onClick={onReady} bg="#6a1b9a" style={{width:"100%",padding:"14px",fontSize:16}}>✋ じゅんびできた！</Btn>}
    </div>
  </div>;
};

const VsSetup=({onStart,onBack})=>{
  const[p1,setP1]=useState("プレイヤー1");const[p2,setP2]=useState("プレイヤー2");const[hl,setHl]=useState(8);const[deckSize,setDeckSize]=useState(50);
  const ok=p1.trim()&&p2.trim()&&p1.trim()!==p2.trim();
  return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"linear-gradient(180deg,#080820,#1a0c30)",position:"relative"}}><Stars/><Scan/><div style={{position:"relative",zIndex:2,maxWidth:320,width:"100%"}}>
    <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:48,animation:"fl 3s ease-in-out infinite"}}>👥</div><h2 style={{fontSize:18,fontWeight:900,color:"#fff",marginTop:6}}>みんなであそぶ</h2><div style={{fontSize:10,color:"#888",marginTop:4}}>スマホをまわして2人で対戦！</div></div>
    <div style={{padding:12,background:"#0c0c1a",border:"2px solid #223",marginBottom:10}}>
      <div style={{fontSize:11,color:"#5cf",fontWeight:700,marginBottom:6}}>👤 プレイヤー1</div>
      <input type="text" value={p1} onChange={e=>setP1(e.target.value.slice(0,10))} maxLength={10} style={{width:"100%",padding:8,background:"#060612",border:"2px solid #334",color:"#fff",fontSize:14,fontFamily:"'DotGothic16',monospace",outline:"none"}}/>
    </div>
    <div style={{padding:12,background:"#0c0c1a",border:"2px solid #223",marginBottom:10}}>
      <div style={{fontSize:11,color:"#f9c",fontWeight:700,marginBottom:6}}>👤 プレイヤー2</div>
      <input type="text" value={p2} onChange={e=>setP2(e.target.value.slice(0,10))} maxLength={10} style={{width:"100%",padding:8,background:"#060612",border:"2px solid #334",color:"#fff",fontSize:14,fontFamily:"'DotGothic16',monospace",outline:"none"}}/>
    </div>
    <div style={{padding:12,background:"#0c0c1a",border:"2px solid #223",marginBottom:10}}>
      <div style={{fontSize:11,color:"#fc3",fontWeight:700,marginBottom:6}}>⚙️ ルール</div>
      <div style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}><span style={{fontSize:10,color:"#888",width:56}}>てふだ</span>{[6,8,10].map(n=><SBtn key={n} l={`${n}まい`} a={hl===n} co="#5cf" onClick={()=>setHl(n)}/>)}</div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:10,color:"#888",width:56}}>やま</span>{[40,50,60].map(n=><SBtn key={n} l={`${n}まい`} a={deckSize===n} co="#fc3" onClick={()=>setDeckSize(n)}/>)}</div>
    </div>
    {!ok&&<div style={{fontSize:10,color:"#f66",textAlign:"center",marginBottom:8}}>名前をちがう名前にしてね</div>}
    <Btn onClick={()=>ok&&onStart({p1:p1.trim(),p2:p2.trim(),hl,deckSize})} disabled={!ok} bg="#6a1b9a" style={{width:"100%",padding:"14px",fontSize:16}}>⚔️ はじめる</Btn>
    <button onClick={onBack} style={{width:"100%",marginTop:10,padding:"10px",border:"2px solid #334",background:"transparent",color:"#666",fontSize:13,fontWeight:700}}>← もどる</button>
  </div></div>;
};

const TitleScreen=({onSelectStage,onEnding,onStartCpu,onStartVs,cleared,prologueDone,setPrologueDone,lang,setLang})=>{
  const[mode,setMode]=useState(null);const[selStage,setSelStage]=useState(null);const[bgmOn,setBgmOn]=useState(BGM.on());const[seOn,setSeOn]=useState(SE.isEnabled());
  // mode別BGM: トップ/設定=title、ステージ選択/詳細/CPU/VS=stage_select
  useEffect(()=>{if(!BGM.on())return;const usesSelect=mode==="stages"||mode==="cpu"||mode==="vs"||selStage;BGM.start(usesSelect?"stage_select":"title");},[mode,selStage]);
  if(!prologueDone) return <Prologue onDone={()=>setPrologueDone(true)}/>;

  const mainStages=STAGES.filter(s=>!s.ex);const exStages=STAGES.filter(s=>s.ex);const mainCleared=cleared.has(MAIN_CLEAR_ID);

  // CPU difficulty select
  if(mode==="cpu") return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"linear-gradient(180deg,#080820,#0c0c30)",position:"relative"}}><Stars/><Scan/><div style={{position:"relative",zIndex:2,maxWidth:320,width:"100%"}}>
    <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:48,animation:"fl 3s ease-in-out infinite"}}>🤖</div><h2 style={{fontSize:18,fontWeight:900,color:"#fff",marginTop:6}}>CPUとあそぶ</h2><div style={{fontSize:10,color:"#888",marginTop:4}}>やまふだ50まい/てふだ8まい</div></div>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {[{k:"easy",n:"よわい",co:"#5f8",d:"ひくめのあいて"},{k:"normal",n:"ふつう",co:"#fc3",d:"バランスのいいあいて"},{k:"hard",n:"つよい",co:"#f44",d:"ベストをだすあいて"}].map(d=>
        <Btn key={d.k} onClick={()=>onStartCpu(d.k)} bg={d.co==="#5f8"?"#2e7d32":d.co==="#fc3"?"#f57c00":"#c62828"} style={{width:"100%",padding:"14px",fontSize:15,textAlign:"left",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:2}}><div>{d.k==="easy"?"★":d.k==="normal"?"★★":"★★★"} {d.n}</div><div style={{fontSize:10,opacity:.8,fontWeight:400}}>{d.d}</div></Btn>)}
    </div>
    <button onClick={()=>setMode(null)} style={{width:"100%",marginTop:16,padding:"10px",border:"2px solid #334",background:"transparent",color:"#666",fontSize:13,fontWeight:700}}>← もどる</button>
  </div></div>;

  // VS mode setup
  if(mode==="vs") return <VsSetup onStart={onStartVs} onBack={()=>setMode(null)}/>;


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
        <Btn onClick={()=>setMode("cpu")} bg="#f57c00" style={{width:"100%",padding:"12px",fontSize:14,display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}>🤖 CPUとあそぶ</Btn>
        <Btn onClick={()=>setMode("vs")} bg="#6a1b9a" style={{width:"100%",padding:"12px",fontSize:14,display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}>👥 みんなであそぶ</Btn>
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
      <div style={{display:"flex",gap:10,alignItems:"flex-start",width:"100%",marginBottom:12,animation:"slideUp .5s .2s ease both",opacity:0}}><div style={{flexShrink:0}}><DrSprite size={40}/></div><div style={{flex:1,padding:10,background:"#0e0e1e",border:"2px solid #334",position:"relative"}}><div style={{position:"absolute",left:-5,top:10,width:0,height:0,borderTop:"5px solid transparent",borderBottom:"5px solid transparent",borderRight:"5px solid #334"}}/><p style={{fontSize:11,color:"rgba(255,255,255,.7)",lineHeight:1.8,margin:0,whiteSpace:"pre-line"}}>{selStage.intro}</p></div></div>
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
const CardPhase=({stage,onDone,cpuDiff,vsPlayerName,vsPlayerColor})=>{
  const cn=useCN();const an=useAN();
  const isCpu=!!cpuDiff;const isVs=!!vsPlayerName;
  const[deck,setDeck]=useState(()=>buildDeck(stage.deckSize));
  const[hand,setHand]=useState([]);const[cpuHand,setCpuHand]=useState([]);
  const[army,setArmy]=useState([]);const[cpuArmy,setCpuArmy]=useState([]);
  const[sel,setSel]=useState(new Set());const[drew,setDrew]=useState(false);const[drawnC,setDrawnC]=useState(null);
  const[justFused,setJustFused]=useState(null);const[showList,setShowList]=useState(false);const[showOther,setShowOther]=useState(false);const[peeked,setPeeked]=useState(false);
  const[cpuMsg,setCpuMsg]=useState(null);const[turn,setTurn]=useState("player");
  const hl=stage.hl;const totalAtk=army.reduce((s,m)=>s+m.atk,0);const cpuAtk=cpuArmy.reduce((s,m)=>s+m.atk,0);
  const canAttack=!isCpu&&!isVs&&totalAtk>=stage.bossHp;const deckEmpty=deck.length===0;

  useEffect(()=>{const d=[...deck],h=[],ch=[];for(let i=0;i<3;i++){if(d.length>0)h.push(d.pop());if(isCpu&&d.length>0)ch.push(d.pop());}setDeck(d);setHand(h);if(isCpu)setCpuHand(ch);},[]);

  const selCards=hand.filter(c=>sel.has(c.id));const selCnt=cntA(selCards);
  const match=COMPOUNDS.find(c=>Object.entries(c.a).every(([s,n])=>(selCnt[s]||0)===n)&&Object.entries(selCnt).every(([s,n])=>(c.a[s]||0)===n));
  const possible=findP(hand);const overLimit=hand.length>hl;const hc=cntA(hand);

  const toggle=card=>{setSel(p=>{const n=new Set(p);if(n.has(card.id)){n.delete(card.id);SE.deselect();}else{n.add(card.id);SE.select();}return n;});};
  const doDraw=()=>{if(deckEmpty||drew)return;const nd=[...deck],dr=nd.pop();setDeck(nd);setHand(h=>[...h,dr]);setDrew(true);setDrawnC(dr);SE.draw();};
  const doFuse=()=>{if(!match)return;const mult=peeked?1:1.5;const boosted=mult>1?{...match,atk:Math.round(match.atk*mult),boosted:true}:match;const ids=new Set(sel);setHand(h=>h.filter(c=>!ids.has(c.id)));setArmy(a=>[...a,boosted]);setSel(new Set());setJustFused(boosted);SE.fuse(boosted.atk);setTimeout(()=>setJustFused(null),1500);};
  const doDiscard=cid=>{setHand(h=>h.filter(c=>c.id!==cid));SE.discard();};
  const doPass=()=>{SE.pass();setDrew(false);setDrawnC(null);if(isCpu){setTurn("cpu");setTimeout(()=>runCpu(),800);}};
  const doFinish=()=>{if(isCpu){onDone({myArmy:army,cpuArmy});}else if(isVs){onDone(army);}else{onDone(army);}};

  const runCpu=()=>{setDeck(pd=>{const nd=[...pd];if(!nd.length){setTimeout(()=>doFinish(),500);return nd;}const dr=nd.pop();setCpuHand(h=>{const nh=[...h,dr];setTimeout(()=>{const bond=cpuPickBond(nh,cpuDiff);if(bond){const ids=new Set(cpuPickCards(nh,bond));setCpuHand(ch=>ch.filter(c=>!ids.has(c.id)));setCpuArmy(a=>[...a,bond]);setCpuMsg({action:"bond",comp:bond});SE.fuse(bond.atk);}else{setCpuMsg({action:"pass"});SE.pass();}setTimeout(()=>{setCpuMsg(null);setTurn("player");setDrew(false);setDrawnC(null);if(!nd.length)setTimeout(()=>doFinish(),500);},1200);},600);return nh;});return nd;});};

  return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,#080820,#0c0c30)"}}>
    {justFused&&<div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(6,6,18,.95)",animation:"fadeIn .2s ease",padding:20}}>{COMP_PIXELS[justFused.k]?<div style={{animation:"ca .4s ease both",filter:"drop-shadow(0 8px 30px rgba(80,255,128,.5))"}}><CompSprite k={justFused.k} size={140}/></div>:<div style={{fontSize:80,animation:"ca .4s ease both"}}>{justFused.emoji}</div>}<div style={{fontSize:18,fontWeight:900,color:"#fff",marginTop:8,animation:"su .4s .2s ease both",opacity:0}}>{cn(justFused)}</div><div style={{fontSize:28,fontWeight:900,color:"#fc3",marginTop:8,animation:"su .4s .4s ease both",opacity:0}}>ATK {justFused.atk}</div>{justFused.boosted&&<div style={{marginTop:6,fontSize:13,color:"#fc3",fontWeight:900,animation:"su .3s .6s ease both",opacity:0}}>🧠 ×1.5！</div>}{justFused.tip&&<div style={{marginTop:14,padding:"10px 14px",maxWidth:320,width:"100%",background:"rgba(80,255,128,.06)",border:"2px solid rgba(80,255,128,.25)",fontSize:12,color:"#cfc",lineHeight:1.6,animation:"su .4s .7s ease both",opacity:0,textAlign:"left"}}>💡 <span style={{fontWeight:900,color:"#9f9"}}>まめちしき：</span>{justFused.tip}</div>}</div>}
    {cpuMsg&&<div style={{position:"fixed",inset:0,zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(6,6,18,.9)",animation:"fadeIn .2s ease"}}><div style={{textAlign:"center",animation:"ca .3s ease both"}}><div style={{fontSize:48,marginBottom:8}}>🤖</div><div style={{fontSize:16,fontWeight:900,color:"#f93"}}>CPUのターン</div>{cpuMsg.action==="bond"&&<><div style={{fontSize:14,color:"#5f8",marginTop:8}}>がったい！</div><div style={{fontSize:32,marginTop:4}}>{cpuMsg.comp.emoji}</div><div style={{fontSize:14,fontWeight:900,color:"#fff"}}>{cn(cpuMsg.comp)}</div><div style={{fontSize:14,color:"#fc3",fontWeight:900}}>+{cpuMsg.comp.atk}</div></>}{cpuMsg.action==="pass"&&<div style={{fontSize:14,color:"#888",marginTop:8}}>パス…</div>}</div></div>}

    {/* Header */}
    <div style={{padding:"max(12px,env(safe-area-inset-top)) 14px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #222",background:"rgba(8,8,32,.9)"}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        {!isCpu&&!isVs&&<BossSprite id={stage.bossId} size={28}/>}
        {isCpu&&<span style={{fontSize:20}}>🤖</span>}
        {isVs&&<span style={{fontSize:20}}>👤</span>}
        <div>
          <div style={{fontSize:11,fontWeight:900,color:isVs?vsPlayerColor:(isCpu?(turn==="player"?"#5cf":"#f93"):"#5cf")}}>{isVs?vsPlayerName:(isCpu?(turn==="player"?"きみのターン":"CPU"):stage.name)}</div>
          {!isCpu&&!isVs&&<div style={{fontSize:9,color:"#555"}}>vs {stage.bossName}</div>}
          {isVs&&<div style={{fontSize:9,color:"#555"}}>じぶんのターン</div>}
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#555"}}>やま</div><div style={{fontSize:14,fontWeight:900,color:deck.length>10?"#5cf":"#f44"}}>{deck.length}</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:7,color:isCpu?"#5cf":"#555"}}>{isCpu?"きみ":"ATK"}</div><div style={{fontSize:14,fontWeight:900,color:canAttack?"#5f8":"#fc3"}}>{totalAtk}</div></div>
        {isCpu?<div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#f93"}}>CPU</div><div style={{fontSize:14,fontWeight:900,color:"#f44"}}>{cpuAtk}</div></div>:isVs?null:<div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#555"}}>HP</div><div style={{fontSize:14,fontWeight:900,color:"#f44"}}>{stage.bossHp}</div></div>}
      </div>
    </div>

    {/* Armies */}
    {(army.length>0||cpuArmy.length>0)&&<div style={{padding:"4px 10px",background:"#0a0a18",borderBottom:"1px solid #181828",display:"flex",flexDirection:"column",gap:2}}>
      {army.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:3,alignItems:"center"}}>{isCpu&&<span style={{fontSize:8,color:"#5cf",fontWeight:700}}>きみ:</span>}{isVs&&<span style={{fontSize:8,color:vsPlayerColor,fontWeight:700}}>{vsPlayerName}:</span>}{army.map((m,i)=><MBadge key={`m${i}`} comp={m}/>)}</div>}
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
      {!isCpu&&!isVs&&<div style={{marginTop:10,padding:8,background:"#0c0c1a",border:"2px solid #223",textAlign:"center"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><BossSprite id={stage.bossId} size={28}/><span style={{fontSize:12,color:stage.bossColor,fontWeight:900}}>{stage.bossName}</span><span style={{fontSize:14,color:"#f44",fontWeight:900}}>HP{stage.bossHp}</span></div>
        <div style={{marginTop:4,fontSize:11,color:canAttack?"#5f8":"#fc3",fontWeight:700}}>ATK {totalAtk}/{stage.bossHp} {canAttack?"✓":"— がったい！"}</div>
      </div>}

      {/* List toggle */}
      <div style={{marginTop:6}}>
        <button onClick={()=>{const next=!showList;setShowList(next);if(next)setPeeked(true);SE.tap();}} style={{width:"100%",padding:10,border:"2px solid #223",background:"#0e0e1e",color:"#555",fontSize:12,fontWeight:700}}>📋 {showList?"リストをとじる":"がったいリストを見る"}{!peeked&&<span style={{color:"#fc3",marginLeft:6,fontSize:10}}>※見ると×1.5消滅</span>}</button>
        {showList&&(()=>{
          const analyzed=COMPOUNDS.map(c=>{
            const reqs=Object.entries(c.a).map(([s,n])=>({s,need:n,have:hc[s]||0,ok:(hc[s]||0)>=n}));
            const missing=reqs.reduce((sum,r)=>sum+Math.max(0,r.need-r.have),0);
            return {c,reqs,missing,canMake:missing===0};
          });
          const readyList=analyzed.filter(a=>a.canMake).sort((a,b)=>b.c.atk-a.c.atk);
          const almostList=analyzed.filter(a=>!a.canMake&&a.missing===1).sort((a,b)=>b.c.atk-a.c.atk);
          const otherList=analyzed.filter(a=>!a.canMake&&a.missing>=2).sort((a,b)=>a.c.atk-b.c.atk);

          // 原子バッジ: 原子ごとの色を使用、達成なら✓、未達なら「持/必要」
          const atomBadge=(r,idx)=>{
            const ac=getA(r.s);
            return <span key={idx} style={{fontSize:11,padding:"2px 6px",fontWeight:900,color:r.ok?ac.color:"#fc3",background:r.ok?ac.color+"1a":"rgba(255,200,50,.1)",border:`2px solid ${r.ok?ac.color+"66":"#fc3"}`}}>{r.s}×{r.need} <span style={{fontSize:10,opacity:.85}}>{r.ok?`✓`:`${r.have}/${r.need}`}</span></span>;
          };

          // 「いますぐつくれる」用の大きめ行
          const readyRow=a=><div key={a.c.k} style={{padding:"10px 12px",marginBottom:5,background:"rgba(80,255,128,.08)",border:"2px solid rgba(80,255,128,.4)",display:"flex",flexDirection:"column",gap:6}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:40,height:40,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{COMP_PIXELS[a.c.k]?<CompSprite k={a.c.k} size={38}/>:<span style={{fontSize:28}}>{a.c.emoji}</span>}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:900,color:"#5f8",lineHeight:1.2}}>{cn(a.c)}</div>
                <div style={{fontSize:10,color:"#888",marginTop:1}}>{a.c.f}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>{a.reqs.map(atomBadge)}</div>
              </div>
              <div style={{fontSize:18,fontWeight:900,color:"#000",background:a.c.atk>=20?"#ff5722":a.c.atk>=10?"#f93":"#5f8",padding:"4px 10px",flexShrink:0,minWidth:36,textAlign:"center"}}>{a.c.atk}</div>
            </div>
            {a.c.tip&&<div style={{fontSize:10,color:"#9f9",lineHeight:1.4,padding:"4px 6px",background:"rgba(80,255,128,.04)",borderLeft:"2px solid rgba(80,255,128,.3)"}}>💡 {a.c.tip}</div>}
          </div>;

          // 「あと少し」用（原子バッジで何が足りないか明確に）
          const almostRow=a=>{
            const missingAtoms=a.reqs.filter(r=>!r.ok);
            return <div key={a.c.k} style={{padding:"8px 10px",marginBottom:4,background:"rgba(255,200,50,.05)",border:"2px solid rgba(255,200,50,.3)",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{COMP_PIXELS[a.c.k]?<CompSprite k={a.c.k} size={30}/>:<span style={{fontSize:22}}>{a.c.emoji}</span>}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:900,color:"#fc3",lineHeight:1.2}}>{cn(a.c)} <span style={{fontSize:10,color:"#888",fontWeight:700}}>{a.c.f}</span></div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>{a.reqs.map(atomBadge)}</div>
              </div>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div style={{fontSize:10,color:"#f93",fontWeight:900,padding:"1px 6px",border:"1px solid #f93",marginBottom:2}}>あと{missingAtoms.map(r=>`${r.s}×${r.need-r.have}`).join(",")}</div>
                <div style={{fontSize:15,fontWeight:900,color:"#000",background:a.c.atk>=20?"#ff5722":a.c.atk>=10?"#f93":"#fc3",padding:"2px 8px",textAlign:"center"}}>{a.c.atk}</div>
              </div>
            </div>;
          };

          // 「そのほか」用（コンパクト）
          const otherRow=a=>{
            const missingAtoms=a.reqs.filter(r=>!r.ok);
            return <div key={a.c.k} style={{padding:"6px 8px",marginBottom:2,background:"#0a0a14",border:"1px solid #181828",display:"flex",alignItems:"center",gap:8,opacity:.8}}>
              <div style={{width:28,height:28,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{COMP_PIXELS[a.c.k]?<CompSprite k={a.c.k} size={26}/>:<span style={{fontSize:18}}>{a.c.emoji}</span>}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:800,color:"#aaa",lineHeight:1.2}}>{cn(a.c)} <span style={{fontSize:9,color:"#666",fontWeight:700}}>{a.c.f}</span></div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:3}}>{a.reqs.map((r,idx)=>{const ac=getA(r.s);return <span key={idx} style={{fontSize:10,padding:"1px 4px",fontWeight:900,color:r.ok?ac.color:"#777",background:r.ok?ac.color+"15":"#161625",border:`1px solid ${r.ok?ac.color+"44":"#222"}`}}>{r.s}×{r.need} <span style={{fontSize:9,opacity:.8}}>{r.ok?`✓`:`${r.have}/${r.need}`}</span></span>;})}</div>
              </div>
              <div style={{fontSize:13,fontWeight:900,color:"#555",background:"#222",padding:"2px 6px",flexShrink:0,minWidth:32,textAlign:"center"}}>{a.c.atk}</div>
            </div>;
          };

          return <div style={{marginTop:4,background:"#0c0c1a",border:"2px solid #222",maxHeight:420,overflowY:"auto",animation:"su .2s ease"}}>
            {readyList.length>0&&<div style={{padding:10,background:"rgba(80,255,128,.04)",borderBottom:"2px solid rgba(80,255,128,.2)"}}>
              <div style={{fontSize:13,color:"#5f8",fontWeight:900,marginBottom:8,padding:"4px 8px",background:"rgba(80,255,128,.08)",border:"1px solid rgba(80,255,128,.2)"}}>🟢 いますぐつくれる（{readyList.length}しゅるい）</div>
              {readyList.map(readyRow)}
            </div>}
            {readyList.length===0&&<div style={{padding:"12px 10px",fontSize:11,color:"#666",textAlign:"center",borderBottom:"1px solid #222"}}>まだ合体できる組み合わせがないよ</div>}

            {almostList.length>0&&<div style={{padding:10,borderBottom:"1px solid #222"}}>
              <div style={{fontSize:13,color:"#fc3",fontWeight:900,marginBottom:6,padding:"4px 8px",background:"rgba(255,200,50,.06)",border:"1px solid rgba(255,200,50,.2)"}}>🎯 あとすこし（{almostList.length}しゅるい）</div>
              {almostList.map(almostRow)}
            </div>}

            <div style={{padding:10}}>
              <button onClick={()=>{setShowOther(v=>!v);SE.tap();}} style={{width:"100%",padding:8,background:"#0e0e1e",border:"1px solid #223",color:"#888",fontSize:12,fontWeight:700,textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>📖 そのほか（{otherList.length}しゅるい）</span><span>{showOther?"▲":"▼"}</span>
              </button>
              {showOther&&<div style={{marginTop:6}}>{otherList.map(otherRow)}</div>}
            </div>
          </div>;
        })()}
      </div>
    </div>

    {/* Action bar */}
    {turn==="player"&&<div style={{padding:"10px 14px max(20px,env(safe-area-inset-bottom))",borderTop:"1px solid #222",display:"flex",gap:8,background:"rgba(8,8,32,.97)"}}>
      {canAttack&&<Btn onClick={doFinish} bg="#c62828" style={{flex:1,padding:14,fontSize:16,"--g":"rgba(255,50,50,.5)",animation:"pg 1.5s ease-in-out infinite"}}>⚔️ こうげき！</Btn>}
      {isVs&&army.length>0&&<Btn onClick={doFinish} bg="#6a1b9a" style={{flex:1,padding:14,fontSize:14}}>✅ ターンおわり</Btn>}
      {!deckEmpty&&!drew&&<Btn onClick={doDraw} bg="#2244aa" style={{flex:1,padding:14,fontSize:canAttack?13:16}}>{canAttack?"🃏 もっとひく":"🃏 ひく"}</Btn>}
      {!deckEmpty&&drew&&!overLimit&&<Btn onClick={doPass} bg="#445566" style={{flex:1,padding:14,fontSize:13}}>{possible.length>0?"🔬 パス":"➡️ つぎへ"}</Btn>}
      {deckEmpty&&!isCpu&&!isVs&&!canAttack&&<Btn onClick={doFinish} bg="#555" style={{flex:1,padding:14,fontSize:13}}>😢 バトルへ</Btn>}
      {deckEmpty&&isVs&&<Btn onClick={doFinish} bg="#6a1b9a" style={{flex:1,padding:14,fontSize:14}}>🏁 ターンおわり</Btn>}
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
  useEffect(()=>{if(BGM.on())BGM.start("battle_boss");},[]);
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
const CpuResult=({myArmy,cpuArmy,onResult,p1Name,p2Name,p1Color,p2Color})=>{
  const cn=useCN();const myAtk=myArmy.reduce((s,m)=>s+m.atk,0);const cpuAtk=cpuArmy.reduce((s,m)=>s+m.atk,0);const won=myAtk>cpuAtk;const tie=myAtk===cpuAtk;
  const isVs=!!p1Name;const n1=p1Name||"きみ";const n2=p2Name||"CPU";const c1=p1Color||"#5cf";const c2=p2Color||"#f93";
  const winnerName=won?n1:!tie?n2:null;
  useEffect(()=>{if(won)SE.victory();else if(!tie)SE.lose();},[]);
  return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"linear-gradient(180deg,#080820,#0c0c30)",position:"relative"}}><Stars/><Scan/>
    <div style={{position:"relative",zIndex:2,textAlign:"center",maxWidth:320,width:"100%"}}>
      <div style={{fontSize:64,animation:"ca .5s ease both"}}>{tie?"🤝":"🏆"}</div>
      <div style={{fontSize:20,fontWeight:900,color:tie?"#aaa":"#fc3",marginTop:8,fontFamily:"'Press Start 2P','DotGothic16',monospace"}}>{tie?"ひきわけ！":isVs?`${winnerName} のかち！`:(won?"勝利！":"敗北…")}</div>
      <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:16}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:11,color:c1}}>{n1}</div><div style={{fontSize:28,fontWeight:900,color:won?"#5f8":"#888"}}>{myAtk}</div></div>
        <div style={{fontSize:20,color:"#555",alignSelf:"center"}}>vs</div>
        <div style={{textAlign:"center"}}><div style={{fontSize:11,color:c2}}>{n2}</div><div style={{fontSize:28,fontWeight:900,color:!won&&!tie?"#5f8":"#888"}}>{cpuAtk}</div></div>
      </div>
      {myArmy.length>0&&<div style={{marginTop:12}}><div style={{fontSize:10,color:c1,marginBottom:4}}>{n1}</div><div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{myArmy.map((m,i)=><MBadge key={i} comp={m}/>)}</div></div>}
      {cpuArmy.length>0&&<div style={{marginTop:8}}><div style={{fontSize:10,color:c2,marginBottom:4}}>{n2}</div><div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{cpuArmy.map((m,i)=><MBadge key={i} comp={m}/>)}</div></div>}
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
      t.push(setTimeout(()=>{setPh(2);SE.victory();if(BGM.on())BGM.start("ending");},4000));
      t.push(setTimeout(()=>setPh(3),9000));
      t.push(setTimeout(()=>setPh(4),18500));
      t.push(setTimeout(()=>setPh(5),22500));
    } else {
      // 通常: 1撃破 2平和 3暗転 4…ん？ 5揺れ 6ゴゴゴ 7ネオバブリン 8博士 9EX解放
      t.push(setTimeout(()=>setPh(1),800));
      t.push(setTimeout(()=>{setPh(2);SE.victory();if(BGM.on())BGM.start("ending");},4000));
      t.push(setTimeout(()=>setPh(3),11000));
      t.push(setTimeout(()=>{setPh(4);BGM.stop();},13000));
      t.push(setTimeout(()=>setPh(5),15000));
      t.push(setTimeout(()=>setPh(6),17500));
      t.push(setTimeout(()=>{setPh(7);SE.attack();if(BGM.on())BGM.start("battle_boss");},20000));
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
    {/* 白フラッシュ（ph7突入時だけ一瞬） */}
    {ph===7&&<div style={{position:"fixed",inset:0,background:"#fff",zIndex:100,animation:"whiteFlash .4s ease forwards",pointerEvents:"none"}}/>}
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
      {ph===7&&<div style={{textAlign:"center",position:"relative",zIndex:60}}>
        <div style={{fontSize:14,color:"#ff1744",fontWeight:900,letterSpacing:".25em",marginBottom:16,fontFamily:"'Press Start 2P','DotGothic16',monospace",animation:"shake .2s ease infinite",textShadow:"0 0 12px #f00"}}>⚠ WARNING ⚠</div>
        <div style={{animation:"ca .6s cubic-bezier(.34,1.56,.64,1) both",filter:"drop-shadow(0 16px 60px rgba(0,188,212,.9)) drop-shadow(0 0 30px rgba(0,188,212,.5))"}}>
          <BossSprite id={11} size={200}/>
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
const NextBossPreview=({nextStage,onFight,onHome})=>{const[show,setShow]=useState(false);useEffect(()=>{setTimeout(()=>setShow(true),300);},[]);return <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:`radial-gradient(ellipse at 50% 30%,${nextStage.bossColor}15,transparent 60%),linear-gradient(180deg,#080820,#0c0c30)`,position:"relative"}}><Stars n={20}/><Scan/><div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",maxWidth:320,width:"100%"}}><div style={{fontSize:14,color:"#f44",fontWeight:900,letterSpacing:".15em",marginBottom:16,fontFamily:"'Press Start 2P','DotGothic16',monospace",animation:"pg 1.5s ease-in-out infinite","--g":"rgba(255,50,50,.4)"}}>NEXT ENEMY</div>{show&&<><div style={{position:"relative",marginBottom:12,animation:"ca .8s cubic-bezier(.34,1.56,.64,1) both"}}><div style={{filter:`drop-shadow(0 12px 50px ${nextStage.bossColor}88)`,animation:"fl 3s ease-in-out infinite"}}><BossSprite id={nextStage.bossId} size={180}/></div></div><div style={{fontSize:10,color:nextStage.bossColor,fontWeight:700,animation:"su .4s .3s ease both",opacity:0}}>{nextStage.ex?`EX ${nextStage.id-10}`:`ステージ ${nextStage.id}`}</div><h2 style={{fontSize:22,fontWeight:900,color:"#fff",marginTop:4,fontFamily:"'Press Start 2P','DotGothic16',monospace",animation:"su .4s .5s ease both",opacity:0}}>{nextStage.bossEmoji} {nextStage.bossName}</h2><div style={{display:"flex",gap:10,marginTop:14,animation:"su .4s .9s ease both",opacity:0}}><div style={{padding:"6px 12px",background:"#0e0e1e",border:`2px solid ${nextStage.bossColor}33`,textAlign:"center"}}><div style={{fontSize:8,color:"#555"}}>HP</div><div style={{fontSize:18,fontWeight:900,color:"#f44"}}>{nextStage.bossHp}</div></div><div style={{padding:"6px 12px",background:"#0e0e1e",border:"2px solid #223",textAlign:"center"}}><div style={{fontSize:8,color:"#555"}}>てふだ</div><div style={{fontSize:18,fontWeight:900,color:"#5cf"}}>{nextStage.hl}</div></div></div><div style={{display:"flex",gap:10,alignItems:"flex-start",width:"100%",marginTop:12,animation:"su .5s 1.1s ease both",opacity:0}}><DrSprite size={40}/><div style={{flex:1,padding:10,background:"#0e0e1e",border:"2px solid #334",position:"relative"}}><div style={{position:"absolute",left:-5,top:10,width:0,height:0,borderTop:"5px solid transparent",borderBottom:"5px solid transparent",borderRight:"5px solid #334"}}/><p style={{fontSize:11,color:"rgba(255,255,255,.7)",lineHeight:1.8,margin:0,whiteSpace:"pre-line"}}>{nextStage.intro}</p></div></div><div style={{display:"flex",flexDirection:"column",gap:10,marginTop:16,width:"100%",animation:"su .5s 1.3s ease both",opacity:0}}><Btn onClick={onFight} bg="#c62828" style={{width:"100%",padding:"14px",fontSize:18}}>⚔️ たたかう！</Btn><Btn onClick={onHome} bg="#334" style={{width:"100%",fontSize:13}}>🏠 トップへ</Btn></div></>}</div></div>;};

/* ═══════════════════════════════════════════════════════════
   App
   ═══════════════════════════════════════════════════════════ */
window.__App=function App(){
  const[scr,setScr]=useState("title");const[stage,setStage]=useState(null);const[army,setArmy]=useState([]);const[cpuDiff,setCpuDiff]=useState(null);const[cpuArmies,setCpuArmies]=useState(null);const[nextStage,setNextStage]=useState(null);const[endingFinal,setEndingFinal]=useState(false);
  const[vsState,setVsState]=useState(null);
  const[lang,setLang]=useState(()=>{try{return localStorage.getItem("acb_lang")||"hiragana";}catch(e){return "hiragana";}});
  const[cleared,setCleared]=useState(()=>{try{const s=localStorage.getItem("acb_cleared");return s?new Set(JSON.parse(s)):new Set();}catch(e){return new Set();}});
  const[prologueDone,setPrologueDone]=useState(()=>{try{return localStorage.getItem("acb_prologue")==="1";}catch(e){return false;}});

  const saveLang=l=>{setLang(l);try{localStorage.setItem("acb_lang",l);}catch(e){}};
  const saveCleared=c=>{setCleared(c);try{localStorage.setItem("acb_cleared",JSON.stringify([...c]));}catch(e){}};
  const savePrologue=()=>{setPrologueDone(true);try{localStorage.setItem("acb_prologue","1");}catch(e){}};
  const goHome=()=>{setScr("title");setVsState(null);setCpuDiff(null);if(BGM.on())BGM.start("title");};

  const startStage=st=>{setStage(st);setArmy([]);setCpuDiff(null);setVsState(null);setScr("card");if(BGM.on())BGM.start(st.diff==="hard"?"battle_boss":"battle_normal");};
  const startCpu=(diff="normal")=>{
    const hlByDiff={easy:10,normal:8,hard:7}[diff]||8;
    const cpuStage={id:0,bossId:1,name:"CPU たいせん",hl:hlByDiff,deckSize:50,diff:"normal",bossName:"CPU",bossEmoji:"🤖",bossHp:999,bossColor:"#f93",bossDesc:"",intro:"",win:"",winStory:"",lose:""};
    setStage(cpuStage);setCpuDiff(diff);setVsState(null);setArmy([]);setScr("card");if(BGM.on())BGM.start("battle_normal");
  };
  const startVs=(config)=>{
    // config: {p1, p2, hl, deckSize}
    setVsState({...config,p1Color:"#5cf",p2Color:"#f9c",p1Army:null,p2Army:null,currentPlayer:1});
    setCpuDiff(null);
    setScr("vsPass1");
  };

  const onCardDone=result=>{
    if(cpuDiff){setCpuArmies(result);setScr("cpuResult");return;}
    if(vsState){
      if(vsState.currentPlayer===1){
        setVsState(v=>({...v,p1Army:result,currentPlayer:2}));
        setScr("vsPass2");
      }else{
        setVsState(v=>({...v,p2Army:result}));
        setScr("vsResult");
      }
      return;
    }
    setArmy(result);setScr("battle");
  };
  const onBattleResult=(won,action)=>{
    if(won&&stage){const nc=new Set([...cleared,stage.id]);saveCleared(nc);}
    if(action==="ending"){setEndingFinal(stage.id===ALL_CLEAR_ID);setScr("ending");return;}
    if(action==="nextPreview"){const next=STAGES.find(s=>s.id===stage.id+1);if(next){setNextStage(next);setScr("nextPreview");if(BGM.on())BGM.start("stage_select");return;}}
    if(action==="retry"){startStage(stage);return;}
    goHome();
  };
  const onCpuResult=action=>{if(action==="retry"){startCpu(cpuDiff||"normal");return;}goHome();};
  const onVsResult=action=>{if(action==="retry"&&vsState){startVs({p1:vsState.p1,p2:vsState.p2,hl:vsState.hl,deckSize:vsState.deckSize});return;}goHome();};

  // VS用のfakeステージ
  const vsStage=vsState?{id:0,bossId:1,name:"VS",hl:vsState.hl,deckSize:vsState.deckSize,diff:"normal",bossName:"VS",bossEmoji:"👥",bossHp:999,bossColor:"#6a1b9a",bossDesc:"",intro:"",win:"",winStory:"",lose:""}:null;

  return <LangCtx.Provider value={lang}><style>{CSS}</style><BgmBtn/>
    {scr==="title"&&<TitleScreen onSelectStage={startStage} onStartCpu={startCpu} onStartVs={startVs} onEnding={(f)=>{setEndingFinal(f);setScr("ending");}} cleared={cleared} prologueDone={prologueDone} setPrologueDone={savePrologue} lang={lang} setLang={saveLang}/>}
    {scr==="card"&&stage&&<CardPhase stage={stage} onDone={onCardDone} cpuDiff={cpuDiff}/>}
    {scr==="battle"&&stage&&<BattlePhase army={army} stage={stage} onResult={onBattleResult}/>}
    {scr==="cpuResult"&&cpuArmies&&<CpuResult myArmy={cpuArmies.myArmy} cpuArmy={cpuArmies.cpuArmy} onResult={onCpuResult}/>}
    {scr==="nextPreview"&&nextStage&&<NextBossPreview nextStage={nextStage} onFight={()=>startStage(nextStage)} onHome={goHome}/>}
    {scr==="ending"&&<Ending isFinal={endingFinal} onHome={goHome}/>}
    {scr==="vsPass1"&&vsState&&<PassScreen nextName={vsState.p1} nextColor={vsState.p1Color} message="さいしょのひとに スマホを わたしてね" onReady={()=>{if(BGM.on())BGM.start("battle_normal");setScr("vsCard");}}/>}
    {scr==="vsPass2"&&vsState&&<PassScreen nextName={vsState.p2} nextColor={vsState.p2Color} message="つぎのひとに スマホを わたしてね" onReady={()=>setScr("vsCard")}/>}
    {scr==="vsCard"&&vsState&&vsStage&&<CardPhase key={`vs-${vsState.currentPlayer}`} stage={vsStage} onDone={onCardDone} vsPlayerName={vsState.currentPlayer===1?vsState.p1:vsState.p2} vsPlayerColor={vsState.currentPlayer===1?vsState.p1Color:vsState.p2Color}/>}
    {scr==="vsResult"&&vsState&&<CpuResult myArmy={vsState.p1Army||[]} cpuArmy={vsState.p2Army||[]} onResult={onVsResult} p1Name={vsState.p1} p2Name={vsState.p2} p1Color={vsState.p1Color} p2Color={vsState.p2Color}/>}
  </LangCtx.Provider>;
};
