// Placeholder - base game code
// This will be replaced with the actual game code
const {useState,useEffect,useCallback,useRef,createContext,useContext} = React;
window.__App = function App() {
  return React.createElement('div', {
    style: {
      minHeight:'100dvh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'#080820', color:'#5cf',
      fontFamily:"'DotGothic16',monospace"
    }
  },
    React.createElement('h1', {style:{fontSize:24,fontFamily:"'Press Start 2P',monospace",textShadow:'0 0 12px rgba(80,180,255,.5)'}}, 'げんしカードバトル'),
    React.createElement('p', {style:{marginTop:16,color:'#888',fontSize:14}}, '🧪 Coming Soon...')
  );
};
