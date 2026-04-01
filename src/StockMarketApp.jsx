import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

// ─── FONTS ──────────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root {
      --bg:#0a1628;--bg2:#0f2044;--bg3:#162952;--bg4:#1e3566;
      --border:#1e3a6e;--border2:#2a4f8a;
      --text:#ffffff;--text2:#b8d0f0;--text3:#6a96cc;
      --green:#22c55e;--green2:#4ade80;--green-bg:rgba(34,197,94,0.12);
      --red:#ef4444;--red2:#f87171;--red-bg:rgba(239,68,68,0.12);
      --blue:#38bdf8;--blue2:#7dd3fc;--blue-bg:rgba(56,189,248,0.12);
      --gold:#fbbf24;--gold2:#fcd34d;
      --accent:#38bdf8;
      --font-display:'Syne',sans-serif;
      --font-mono:'JetBrains Mono',monospace;
      --sidebar:240px;
      --radius:8px;
      --shadow:0 4px 24px rgba(0,0,0,0.5);
    }
    html,body{height:100%;background:var(--bg);color:var(--text);font-family:var(--font-display)}
    #root{height:100%}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:var(--bg2)}
    ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
    button{cursor:pointer;font-family:var(--font-display);border:none;outline:none}
    input,select,textarea{font-family:var(--font-display);outline:none}
    a{text-decoration:none;color:inherit}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes glow{0%,100%{box-shadow:0 0 8px var(--blue)}50%{box-shadow:0 0 20px var(--blue)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes countUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  `}</style>
);

// ─── CURRENCY ────────────────────────────────────────────────────────────────
const USD_TO_INR = 83.5;
const toINR = (usd) => usd * USD_TO_INR;
// Format a rupee value: ₹1,58,456.78 style (Indian numbering)
const inr = (usd, decimals=2) => {
  const val = usd * USD_TO_INR;
  return '₹' + val.toLocaleString('en-IN', {minimumFractionDigits:decimals, maximumFractionDigits:decimals});
};
const inrC = (usd, decimals=0) => {
  const val = usd * USD_TO_INR;
  return '₹' + val.toLocaleString('en-IN', {maximumFractionDigits:decimals});
};

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const STOCKS = [
  {sym:"AAPL",name:"Apple Inc.",price:189.84,chg:2.41,chgPct:1.29,mktCap:"2.94T",vol:"54.2M",sector:"Technology",pe:31.2,eps:6.08,high52:199.62,low52:143.90},
  {sym:"MSFT",name:"Microsoft Corp.",price:415.32,chg:5.18,chgPct:1.26,mktCap:"3.08T",vol:"22.1M",sector:"Technology",pe:36.8,eps:11.28,high52:430.82,low52:309.45},
  {sym:"GOOGL",name:"Alphabet Inc.",price:175.43,chg:-1.23,chgPct:-0.70,mktCap:"2.18T",vol:"18.4M",sector:"Technology",pe:25.1,eps:6.99,high52:193.31,low52:128.85},
  {sym:"AMZN",name:"Amazon.com Inc.",price:192.45,chg:3.67,chgPct:1.94,mktCap:"2.02T",vol:"31.5M",sector:"Consumer Cyclical",pe:44.2,eps:4.35,high52:201.20,low52:118.35},
  {sym:"NVDA",name:"NVIDIA Corp.",price:878.35,chg:22.45,chgPct:2.62,mktCap:"2.17T",vol:"41.8M",sector:"Technology",pe:72.3,eps:12.15,high52:974.00,low52:402.18},
  {sym:"TSLA",name:"Tesla Inc.",price:177.58,chg:-4.32,chgPct:-2.38,mktCap:"0.56T",vol:"98.2M",sector:"Consumer Cyclical",pe:55.7,eps:3.19,high52:299.29,low52:138.80},
  {sym:"META",name:"Meta Platforms",price:527.14,chg:8.92,chgPct:1.72,mktCap:"1.34T",vol:"15.3M",sector:"Technology",pe:28.4,eps:18.56,high52:544.28,low52:279.40},
  {sym:"JPM",name:"JPMorgan Chase",price:212.78,chg:1.05,chgPct:0.50,mktCap:"0.61T",vol:"8.7M",sector:"Financial",pe:12.3,eps:17.30,high52:225.48,low52:147.26},
  {sym:"V",name:"Visa Inc.",price:276.54,chg:2.18,chgPct:0.79,mktCap:"0.57T",vol:"5.2M",sector:"Financial",pe:30.1,eps:9.18,high52:290.96,low52:226.97},
  {sym:"WMT",name:"Walmart Inc.",price:64.78,chg:0.42,chgPct:0.65,mktCap:"0.52T",vol:"12.4M",sector:"Consumer Defensive",pe:28.7,eps:2.26,high52:67.18,low52:46.28},
  {sym:"JNJ",name:"Johnson & Johnson",price:158.32,chg:-0.87,chgPct:-0.55,mktCap:"0.38T",vol:"6.1M",sector:"Healthcare",pe:16.8,eps:9.43,high52:171.96,low52:143.13},
  {sym:"XOM",name:"Exxon Mobil",price:113.45,chg:1.23,chgPct:1.10,mktCap:"0.45T",vol:"14.2M",sector:"Energy",pe:14.2,eps:7.99,high52:123.75,low52:95.77},
  {sym:"NFLX",name:"Netflix Inc.",price:632.18,chg:11.42,chgPct:1.84,mktCap:"0.27T",vol:"4.8M",sector:"Communication",pe:48.3,eps:13.09,high52:691.89,low52:344.73},
  {sym:"AMD",name:"Advanced Micro Devices",price:178.42,chg:-2.15,chgPct:-1.19,mktCap:"0.29T",vol:"37.2M",sector:"Technology",pe:44.6,eps:4.00,high52:227.30,low52:93.12},
  {sym:"BA",name:"Boeing Co.",price:182.54,chg:-3.42,chgPct:-1.84,mktCap:"0.11T",vol:"9.8M",sector:"Industrials",pe:null,eps:-6.04,high52:267.54,low52:159.70},
];

const INDICES = [
  {name:"S&P 500",val:"5,243.77",chg:"+0.87%",up:true},
  {name:"NASDAQ",val:"16,384.47",chg:"+1.14%",up:true},
  {name:"DOW JONES",val:"39,282.31",chg:"+0.23%",up:true},
  {name:"RUSSELL 2000",val:"2,071.14",chg:"-0.41%",up:false},
  {name:"VIX",val:"14.82",chg:"-3.21%",up:false},
  {name:"10Y TREASURY",val:"4.32%",chg:"+0.02",up:true},
];

const NEWS = [
  {id:1,title:"Fed Signals Rate Cuts Could Come Earlier Than Expected",source:"Reuters",time:"2h ago",tag:"Macro",sentiment:"bullish",sym:"SPY"},
  {id:2,title:"NVIDIA Reports Record Revenue, Beats Estimates by 18%",source:"CNBC",time:"3h ago",tag:"Earnings",sentiment:"bullish",sym:"NVDA"},
  {id:3,title:"Apple Vision Pro Sales Disappoint in Q1 2024",source:"Bloomberg",time:"5h ago",tag:"Earnings",sentiment:"bearish",sym:"AAPL"},
  {id:4,title:"Tesla Announces 5% Global Workforce Reduction",source:"WSJ",time:"6h ago",tag:"Corporate",sentiment:"bearish",sym:"TSLA"},
  {id:5,title:"Amazon Web Services Signs $4B AI Partnership",source:"TechCrunch",time:"8h ago",tag:"Deals",sentiment:"bullish",sym:"AMZN"},
  {id:6,title:"Meta Releases Llama 3 Open Source Language Model",source:"The Verge",time:"1d ago",tag:"Product",sentiment:"bullish",sym:"META"},
  {id:7,title:"Oil Prices Surge on Middle East Supply Concerns",source:"FT",time:"1d ago",tag:"Macro",sentiment:"bullish",sym:"XOM"},
  {id:8,title:"Boeing Production Halt Extended Amid Quality Issues",source:"AP News",time:"2d ago",tag:"Corporate",sentiment:"bearish",sym:"BA"},
];

const INIT_PORTFOLIO = [
  {sym:"AAPL",shares:15,avgCost:162.40},
  {sym:"NVDA",shares:8,avgCost:612.80},
  {sym:"MSFT",shares:10,avgCost:380.20},
  {sym:"AMZN",shares:12,avgCost:175.60},
  {sym:"META",shares:6,avgCost:480.30},
];

const TRANSACTIONS = [
  {id:1,type:"BUY",sym:"NVDA",shares:3,price:812.40,date:"2024-03-15",total:2437.20},
  {id:2,type:"SELL",sym:"TSLA",shares:10,price:188.20,date:"2024-03-12",total:1882.00},
  {id:3,type:"BUY",sym:"AAPL",shares:5,price:181.50,date:"2024-03-08",total:907.50},
  {id:4,type:"BUY",sym:"META",shares:2,price:510.40,date:"2024-03-05",total:1020.80},
  {id:5,type:"SELL",sym:"AMD",shares:20,price:192.30,date:"2024-02-28",total:3846.00},
  {id:6,type:"BUY",sym:"MSFT",shares:3,price:402.10,date:"2024-02-20",total:1206.30},
];

const ALERTS = [
  {id:1,sym:"AAPL",type:"PRICE_ABOVE",value:195,active:true,triggered:false},
  {id:2,sym:"NVDA",type:"PRICE_BELOW",value:800,active:true,triggered:false},
  {id:3,sym:"TSLA",type:"PCT_CHANGE",value:-5,active:true,triggered:false},
  {id:4,sym:"MSFT",type:"PRICE_ABOVE",value:420,active:false,triggered:true},
];

// Generate sparkline data
const genSparkline = (base, n=20) => {
  let v = base;
  return Array.from({length:n},()=>{v+=v*(Math.random()-0.48)*0.02;return Math.max(v*0.8,v);});
};

// Generate OHLC data
const genOHLC = (base, days=90) => {
  let price = base;
  return Array.from({length:days},(_, i)=>{
    const open = price;
    const chg = price*(Math.random()-0.48)*0.025;
    const close = price+chg;
    const high = Math.max(open,close)*(1+Math.random()*0.01);
    const low = Math.min(open,close)*(1-Math.random()*0.01);
    const vol = Math.floor(Math.random()*50000000+10000000);
    const date = new Date(2024,0,i+1).toLocaleDateString('en',{month:'short',day:'numeric'});
    price = close;
    return {date,open,close,high,low,vol};
  });
};

// ─── APP CONTEXT ─────────────────────────────────────────────────────────────
const AppCtx = createContext(null);

const useApp = () => useContext(AppCtx);

// ─── SPARKLINE SVG ───────────────────────────────────────────────────────────
const Sparkline = ({data,color,width=80,height=28}) => {
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v,i)=>{
    const x = (i/(data.length-1))*width;
    const y = height-((v-min)/(max-min||1))*height;
    return `${x},${y}`;
  }).join(' ');
  const area = `M0,${height} L${pts.split(' ').map((p,i)=>i===0?`${p.split(',')[0]},${height} L${p}`:p).join(' ')} L${width},${height} Z`;
  return (
    <svg width={width} height={height} style={{display:'block'}}>
      <defs>
        <linearGradient id={`sg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`M0,${height} L${data.map((v,i)=>`${(i/(data.length-1))*width},${height-((v-min)/(max-min||1))*height}`).join(' L')} L${width},${height}`}
        fill={`url(#sg${color.replace('#','')})`} stroke="none"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// ─── MINI CHART ──────────────────────────────────────────────────────────────
const MiniChart = ({data,width=300,height=100,color}) => {
  const min=Math.min(...data), max=Math.max(...data);
  const pts = data.map((v,i)=>{
    const x=(i/(data.length-1))*width;
    const y=height-((v-min)/(max-min||1))*(height-8)+4;
    return [x,y];
  });
  const d=pts.map((p,i)=>`${i===0?'M':'L'}${p[0]},${p[1]}`).join(' ');
  const areaD=`${d} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{display:'block'}}>
      <defs>
        <linearGradient id="mcg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#mcg)"/>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
};

// ─── CANDLESTICK CHART ───────────────────────────────────────────────────────
const CandleChart = ({data,width=680,height=280}) => {
  if(!data||!data.length) return null;
  const subset = data.slice(-60);
  const prices = subset.flatMap(d=>[d.high,d.low]);
  const min=Math.min(...prices), max=Math.max(...prices);
  const padL=40, padR=10, padT=10, padB=30;
  const cw=width-padL-padR, ch=height-padT-padB;
  const bw=Math.max(2,(cw/subset.length)-2);
  const py=(v)=>padT+ch-((v-min)/(max-min||1))*ch;
  const ticks=5;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{display:'block'}}>
      {Array.from({length:ticks+1},(_,i)=>{
        const v=min+(max-min)*(i/ticks);
        const y=py(v);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={width-padR} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3"/>
            <text x={padL-4} y={y+4} textAnchor="end" fill="var(--text3)" fontSize="9" fontFamily="var(--font-mono)">₹{(v*83.5).toFixed(0)}</text>
          </g>
        );
      })}
      {subset.map((d,i)=>{
        const x=padL+i*(cw/subset.length)+(cw/subset.length-bw)/2;
        const up=d.close>=d.open;
        const color=up?'var(--green)':'var(--red)';
        const bodyY=py(Math.max(d.open,d.close));
        const bodyH=Math.max(1,Math.abs(py(d.open)-py(d.close)));
        const mx=x+bw/2;
        return (
          <g key={i}>
            <line x1={mx} y1={py(d.high)} x2={mx} y2={py(Math.max(d.open,d.close))} stroke={color} strokeWidth="1"/>
            <line x1={mx} y1={py(Math.min(d.open,d.close))} x2={mx} y2={py(d.low)} stroke={color} strokeWidth="1"/>
            <rect x={x} y={bodyY} width={bw} height={bodyH} fill={up?color:'none'} stroke={color} strokeWidth="1" rx="0.5"/>
          </g>
        );
      })}
      {[0,15,30,45,59].map(i=>(
        subset[i] && <text key={i} x={padL+i*(cw/subset.length)+bw/2} y={height-8} textAnchor="middle" fill="var(--text3)" fontSize="9" fontFamily="var(--font-mono)">{subset[i].date}</text>
      ))}
    </svg>
  );
};

// ─── PIE CHART ───────────────────────────────────────────────────────────────
const PieChart = ({data,size=140}) => {
  const total=data.reduce((s,d)=>s+d.value,0);
  const colors=['var(--green)','var(--blue)','var(--gold)','var(--red)','#a78bfa','#f472b6','#34d399'];
  let angle=0;
  const slices=data.map((d,i)=>{
    const pct=d.value/total, sweep=pct*2*Math.PI;
    const x1=Math.cos(angle)*55+70, y1=Math.sin(angle)*55+70;
    const x2=Math.cos(angle+sweep)*55+70, y2=Math.sin(angle+sweep)*55+70;
    const large=sweep>Math.PI?1:0;
    const path=`M70,70 L${x1},${y1} A55,55 0 ${large},1 ${x2},${y2} Z`;
    angle+=sweep;
    return {path,color:colors[i%colors.length],label:d.label,pct:(pct*100).toFixed(1)};
  });
  return (
    <div style={{display:'flex',gap:16,alignItems:'center'}}>
      <svg width={size} height={size} viewBox="0 0 140 140">
        {slices.map((s,i)=>(
          <path key={i} d={s.path} fill={s.color} stroke="var(--bg2)" strokeWidth="2" opacity="0.9"/>
        ))}
        <circle cx="70" cy="70" r="28" fill="var(--bg2)"/>
        <text x="70" y="74" textAnchor="middle" fill="var(--text)" fontSize="11" fontFamily="var(--font-display)" fontWeight="700">ALLOC</text>
      </svg>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {slices.map((s,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
            <div style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0}}/>
            <span style={{color:'var(--text2)',width:50}}>{data[i].label}</span>
            <span style={{color:'var(--text)',fontFamily:'var(--font-mono)',fontWeight:600}}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── BADGE ───────────────────────────────────────────────────────────────────
const Badge = ({up,children,size='sm'}) => (
  <span style={{
    display:'inline-flex',alignItems:'center',gap:3,
    padding:size==='sm'?'2px 7px':'3px 10px',
    borderRadius:4,fontSize:size==='sm'?11:12,
    fontFamily:'var(--font-mono)',fontWeight:600,
    background:up?'var(--green-bg)':'var(--red-bg)',
    color:up?'var(--green)':'var(--red)',
  }}>
    {up?'▲':'▼'} {children}
  </span>
);

// ─── CARD ────────────────────────────────────────────────────────────────────
const Card = ({children,style={}}) => (
  <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:20,...style}}>
    {children}
  </div>
);

// ─── TICKER TAPE ─────────────────────────────────────────────────────────────
const TickerTape = ({prices}) => {
  const items = [...STOCKS.slice(0,10),...STOCKS.slice(0,10)];
  return (
    <div style={{background:'var(--bg3)',borderBottom:'1px solid var(--border)',overflow:'hidden',height:32,display:'flex',alignItems:'center'}}>
      <div style={{animation:'ticker 30s linear infinite',display:'flex',gap:0,whiteSpace:'nowrap'}}>
        {items.map((s,i)=>{
          const live=prices[s.sym]||s.price;
          const chg=prices[s.sym]?((live-s.price)/s.price*100):s.chgPct;
          const up=chg>=0;
          return (
            <span key={i} style={{display:'inline-flex',alignItems:'center',gap:8,padding:'0 24px',fontSize:12,fontFamily:'var(--font-mono)',borderRight:'1px solid var(--border)'}}>
              <span style={{color:'var(--text)',fontWeight:600}}>{s.sym}</span>
              <span style={{color:'var(--text2)'}}>{inr(live)}</span>
              <span style={{color:up?'var(--green)':'var(--red)'}}>{up?'+':''}{chg.toFixed(2)}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const NAV = [
  {id:'dashboard',icon:'⬛',label:'Dashboard'},
  {id:'market',icon:'📊',label:'Market'},
  {id:'portfolio',icon:'💼',label:'Portfolio'},
  {id:'watchlist',icon:'👁',label:'Watchlist'},
  {id:'trading',icon:'⚡',label:'Trading'},
  {id:'alerts',icon:'🔔',label:'Alerts'},
  {id:'news',icon:'📰',label:'News'},
  {id:'reports',icon:'📈',label:'Reports'},
  {id:'admin',icon:'⚙️',label:'Admin'},
];

const Sidebar = ({page,setPage,user}) => {
  const [collapsed,setCollapsed]=useState(false);
  return (
    <aside style={{
      width:collapsed?56:'var(--sidebar)',flexShrink:0,
      background:'var(--bg2)',borderRight:'1px solid var(--border)',
      display:'flex',flexDirection:'column',transition:'width 0.2s ease',overflow:'hidden',
    }}>
      {/* Logo */}
      <div style={{padding:'16px 12px',display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid var(--border)',minHeight:56}}>
        <div style={{width:32,height:32,borderRadius:8,background:'var(--blue)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <span style={{fontFamily:'var(--font-mono)',fontWeight:800,fontSize:14,color:'#fff'}}>S</span>
        </div>
        {!collapsed&&<span style={{fontWeight:800,fontSize:15,letterSpacing:'-0.5px',whiteSpace:'nowrap'}}>StockPulse</span>}
        <button onClick={()=>setCollapsed(!collapsed)} style={{marginLeft:'auto',background:'none',color:'var(--text3)',fontSize:14,padding:2,flexShrink:0}}>
          {collapsed?'→':'←'}
        </button>
      </div>
      {/* Nav */}
      <nav style={{flex:1,padding:'8px 0',overflowY:'auto'}}>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setPage(n.id)} style={{
            width:'100%',padding:collapsed?'12px 0':'10px 14px',
            display:'flex',alignItems:'center',gap:10,
            background:page===n.id?'var(--bg3)':'none',
            color:page===n.id?'var(--blue)':'var(--text2)',
            borderLeft:page===n.id?'2px solid var(--blue)':'2px solid transparent',
            fontSize:13,fontWeight:page===n.id?700:400,
            transition:'all 0.15s',justifyContent:collapsed?'center':'flex-start',
          }}>
            <span style={{fontSize:15,flexShrink:0}}>{n.icon}</span>
            {!collapsed&&<span style={{whiteSpace:'nowrap'}}>{n.label}</span>}
          </button>
        ))}
      </nav>
      {/* User */}
      {!collapsed&&(
        <div style={{padding:14,borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--blue),var(--green))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff',flexShrink:0}}>
            {user.name[0]}
          </div>
          <div style={{minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,truncate:true,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.name}</div>
            <div style={{fontSize:10,color:'var(--text3)'}}>{user.role}</div>
          </div>
        </div>
      )}
    </aside>
  );
};

// ─── HEADER ──────────────────────────────────────────────────────────────────
const Header = ({page,searchQ,setSearchQ,user}) => {
  const titles={dashboard:'Dashboard',market:'Market Overview',portfolio:'My Portfolio',watchlist:'Watchlist',trading:'Virtual Trading',alerts:'Price Alerts',news:'Market News',reports:'Reports & Analytics',admin:'Admin Panel'};
  return (
    <header style={{
      height:56,background:'var(--bg2)',borderBottom:'1px solid var(--border)',
      display:'flex',alignItems:'center',padding:'0 20px',gap:16,flexShrink:0,
    }}>
      <h1 style={{fontWeight:800,fontSize:16,letterSpacing:'-0.5px',color:'var(--text)'}}>{titles[page]||page}</h1>
      <div style={{flex:1}}/>
      <div style={{position:'relative'}}>
        <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',fontSize:13,color:'var(--text3)'}}>🔍</span>
        <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
          placeholder="Search stocks…"
          style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:6,padding:'6px 10px 6px 30px',color:'var(--text)',fontSize:12,width:200}}/>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:8,height:8,borderRadius:'50%',background:'var(--blue)',animation:'glow 2s ease-in-out infinite'}}/>
        <span style={{fontSize:11,color:'var(--blue)',fontFamily:'var(--font-mono)',fontWeight:600}}>LIVE</span>
        <span style={{fontSize:11,color:'var(--text3)',fontFamily:'var(--font-mono)'}}>
          {new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})} EST
        </span>
      </div>
    </header>
  );
};

// ═══════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
const Dashboard = () => {
  const {prices,setPage,setSelectedStock,portfolio}=useApp();
  const totalVal=portfolio.reduce((s,p)=>{const st=STOCKS.find(s=>s.sym===p.sym);return s+(st?(prices[p.sym]||st.price)*p.shares:0);},0);
  const totalCost=portfolio.reduce((s,p)=>s+p.avgCost*p.shares,0);
  const totalPnl=totalVal-totalCost;
  const totalPnlPct=(totalPnl/totalCost*100);
  const gainers=STOCKS.filter(s=>s.chgPct>0).sort((a,b)=>b.chgPct-a.chgPct).slice(0,5);
  const losers=STOCKS.filter(s=>s.chgPct<0).sort((a,b)=>a.chgPct-b.chgPct).slice(0,5);

  const statBoxes=[
    {label:'Portfolio Value',val:inr(totalVal),sub:`${totalPnlPct>=0?'+':''}${totalPnlPct.toFixed(2)}% all time`,up:totalPnlPct>=0,icon:'💼'},
    {label:'Total P&L',val:`${totalPnl>=0?'+':'-'}${inr(Math.abs(totalPnl))}`,sub:'Unrealized gains',up:totalPnl>=0,icon:'📊'},
    {label:'Virtual Cash',val:'₹20,52,615',sub:'+₹1,03,540 today',up:true,icon:'💵'},
    {label:'Active Alerts',val:'3',sub:'1 triggered today',up:true,icon:'🔔'},
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20,animation:'slideIn 0.3s ease'}}>
      {/* Market Indices */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8}}>
        {INDICES.map((idx,i)=>(
          <div key={i} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,padding:'10px 14px'}}>
            <div style={{fontSize:9,color:'var(--text3)',fontFamily:'var(--font-mono)',fontWeight:600,marginBottom:4,letterSpacing:'0.5px'}}>{idx.name}</div>
            <div style={{fontSize:15,fontWeight:800,fontFamily:'var(--font-mono)',marginBottom:2}}>{idx.val}</div>
            <div style={{fontSize:11,color:idx.up?'var(--green)':'var(--red)',fontFamily:'var(--font-mono)',fontWeight:600}}>{idx.chg}</div>
          </div>
        ))}
      </div>

      {/* Stat Boxes */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {statBoxes.map((b,i)=>(
          <div key={i} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16,display:'flex',flexDirection:'column',gap:8}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:11,color:'var(--text2)',fontWeight:600}}>{b.label}</span>
              <span style={{fontSize:18}}>{b.icon}</span>
            </div>
            <div style={{fontSize:22,fontWeight:800,fontFamily:'var(--font-mono)',color:i===0?'var(--text)':b.up?'var(--green)':'var(--red)',letterSpacing:'-1px'}}>{b.val}</div>
            <div style={{fontSize:11,color:b.up?'var(--green)':'var(--red)',fontFamily:'var(--font-mono)'}}>{b.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:12}}>
        {/* Portfolio Chart */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <span style={{fontWeight:700,fontSize:13}}>Portfolio Performance</span>
            <div style={{display:'flex',gap:6}}>
              {['1W','1M','3M','YTD','1Y'].map(t=>(
                <button key={t} style={{background:t==='1M'?'var(--blue-bg)':'none',color:t==='1M'?'var(--blue)':'var(--text3)',border:`1px solid ${t==='1M'?'var(--blue)':'var(--border)'}`,borderRadius:4,padding:'3px 9px',fontSize:11,fontFamily:'var(--font-mono)'}}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <MiniChart data={genSparkline(totalVal,50)} width={500} height={120} color="var(--blue)"/>
        </div>

        {/* Allocation Pie */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:16}}>Allocation</div>
          <PieChart data={portfolio.map(p=>{const st=STOCKS.find(s=>s.sym===p.sym);return{label:p.sym,value:(prices[p.sym]||st.price)*p.shares};})} />
        </div>
      </div>

      {/* Gainers/Losers + Recent */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        {/* Gainers */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:'var(--blue2)'}}>▲ Top Gainers</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {gainers.map(s=>(
              <div key={s.sym} onClick={()=>{setSelectedStock(s);setPage('market');}} style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',padding:'6px 8px',borderRadius:6,background:'var(--bg3)',transition:'background 0.15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--bg3)'}>
                <div>
                  <div style={{fontSize:12,fontWeight:700}}>{s.sym}</div>
                  <div style={{fontSize:10,color:'var(--text3)'}}>{s.name.split(' ')[0]}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:12,fontWeight:700,fontFamily:'var(--font-mono)'}}>{inr(prices[s.sym]||s.price)}</div>
                  <Badge up>{s.chgPct.toFixed(2)}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:'var(--red)'}}>▼ Top Losers</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {losers.map(s=>(
              <div key={s.sym} onClick={()=>{setSelectedStock(s);setPage('market');}} style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',padding:'6px 8px',borderRadius:6,background:'var(--bg3)',transition:'background 0.15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--bg3)'}>
                <div>
                  <div style={{fontSize:12,fontWeight:700}}>{s.sym}</div>
                  <div style={{fontSize:10,color:'var(--text3)'}}>{s.name.split(' ')[0]}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:12,fontWeight:700,fontFamily:'var(--font-mono)'}}>{inr(prices[s.sym]||s.price)}</div>
                  <Badge up={false}>{Math.abs(s.chgPct).toFixed(2)}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Recent Transactions</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {TRANSACTIONS.slice(0,5).map(t=>(
              <div key={t.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{padding:'2px 6px',borderRadius:3,fontSize:10,fontWeight:700,fontFamily:'var(--font-mono)',background:t.type==='BUY'?'var(--green-bg)':'var(--red-bg)',color:t.type==='BUY'?'var(--green)':'var(--red)'}}>{t.type}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700}}>{t.sym}</div>
                    <div style={{fontSize:10,color:'var(--text3)'}}>{t.shares} shares</div>
                  </div>
                </div>
                <div style={{textAlign:'right',fontSize:11,fontFamily:'var(--font-mono)'}}>
                  <div style={{fontWeight:700}}>{inrC(t.total)}</div>
                  <div style={{color:'var(--text3)'}}>{t.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest News */}
      <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Market Headlines</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
          {NEWS.slice(0,4).map(n=>(
            <div key={n.id} style={{background:'var(--bg3)',borderRadius:6,padding:12,border:'1px solid var(--border)',cursor:'pointer'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border2)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:9,padding:'2px 6px',borderRadius:3,fontFamily:'var(--font-mono)',fontWeight:700,background:'var(--bg4)',color:'var(--text3)'}}>{n.tag}</span>
                <span style={{fontSize:9,color:n.sentiment==='bullish'?'var(--green)':'var(--red)',fontFamily:'var(--font-mono)',fontWeight:700}}>{n.sentiment.toUpperCase()}</span>
              </div>
              <div style={{fontSize:12,fontWeight:600,lineHeight:1.4,marginBottom:8}}>{n.title}</div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--text3)'}}>
                <span>{n.source}</span><span>{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── MARKET PAGE ─────────────────────────────────────────────────────────────
const MarketPage = () => {
  const {prices,selectedStock,setSelectedStock}=useApp();
  const [filter,setFilter]=useState('All');
  const [sort,setSort]=useState('mktCap');
  const [tf,setTf]=useState('1M');
  const sectors=['All','Technology','Financial','Healthcare','Energy','Consumer Cyclical','Consumer Defensive','Industrials','Communication'];
  const filtered=STOCKS.filter(s=>filter==='All'||s.sector===filter).sort((a,b)=>sort==='sym'?a.sym.localeCompare(b.sym):sort==='chgPct'?b.chgPct-a.chgPct:0);

  const active=selectedStock||STOCKS[0];
  const ohlc=genOHLC(active.price);
  const sparkD=genSparkline(active.price,100);

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:16,height:'100%'}}>
      {/* Stock List */}
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {/* Filters */}
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {sectors.map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{padding:'5px 12px',borderRadius:4,border:`1px solid ${filter===s?'var(--blue)':'var(--border)'}`,background:filter===s?'var(--blue-bg)':'none',color:filter===s?'var(--blue2)':'var(--text2)',fontSize:11,fontWeight:filter===s?700:400}}>
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'var(--bg3)',borderBottom:'1px solid var(--border)'}}>
                {['Symbol','Company','Price','Change','% Change','Mkt Cap','Volume','52W Range','Trend'].map(h=>(
                  <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:10,color:'var(--text3)',fontWeight:700,fontFamily:'var(--font-mono)',letterSpacing:'0.5px',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s,i)=>{
                const live=prices[s.sym]||s.price;
                const up=s.chgPct>=0;
                const sData=genSparkline(s.price);
                return (
                  <tr key={s.sym} onClick={()=>setSelectedStock(s)} style={{borderBottom:'1px solid var(--border)',cursor:'pointer',background:selectedStock?.sym===s.sym?'var(--bg4)':'none',transition:'background 0.1s'}}
                    onMouseEnter={e=>e.currentTarget.style.background=selectedStock?.sym===s.sym?'var(--bg4)':'var(--bg3)'}
                    onMouseLeave={e=>e.currentTarget.style.background=selectedStock?.sym===s.sym?'var(--bg4)':'none'}>
                    <td style={{padding:'10px 14px',fontSize:13,fontWeight:800,color:'var(--text)',fontFamily:'var(--font-mono)'}}>{s.sym}</td>
                    <td style={{padding:'10px 14px',fontSize:11,color:'var(--text2)',maxWidth:140}}>
                      <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
                      <div style={{fontSize:9,color:'var(--text3)',marginTop:1}}>{s.sector}</div>
                    </td>
                    <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontWeight:700,fontSize:13}}>{inr(live)}</td>
                    <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12,color:up?'var(--green)':'var(--red)'}}>{up?'+':''}{s.chg.toFixed(2)}</td>
                    <td style={{padding:'10px 14px'}}><Badge up={up}>{Math.abs(s.chgPct).toFixed(2)}%</Badge></td>
                    <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text2)'}}>{s.mktCap}</td>
                    <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text2)'}}>{s.vol}</td>
                    <td style={{padding:'10px 14px'}}>
                      <div style={{fontSize:9,color:'var(--text3)',fontFamily:'var(--font-mono)'}}>₹{(s.low52*83.5).toFixed(0)} — ₹{(s.high52*83.5).toFixed(0)}</div>
                      <div style={{width:80,height:4,background:'var(--bg4)',borderRadius:2,marginTop:3,position:'relative'}}>
                        <div style={{position:'absolute',left:`${((live-s.low52)/(s.high52-s.low52))*100}%`,top:-1,width:6,height:6,borderRadius:'50%',background:'var(--gold)',transform:'translateX(-50%)'}}/>
                      </div>
                    </td>
                    <td style={{padding:'10px 14px'}}><Sparkline data={sData} color={up?'#00d084':'#ff4757'}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Detail Panel */}
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
            <div>
              <div style={{fontSize:22,fontWeight:800,fontFamily:'var(--font-mono)',letterSpacing:'-1px'}}>{active.sym}</div>
              <div style={{fontSize:12,color:'var(--text2)'}}>{active.name}</div>
              <div style={{fontSize:9,color:'var(--text3)',marginTop:2}}>{active.sector}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:26,fontWeight:800,fontFamily:'var(--font-mono)',letterSpacing:'-1px'}}>{inr(prices[active.sym]||active.price)}</div>
              <Badge up={active.chgPct>=0} size="md">{Math.abs(active.chgPct).toFixed(2)}%</Badge>
            </div>
          </div>

          {/* Timeframe tabs */}
          <div style={{display:'flex',gap:4,marginBottom:12}}>
            {['1D','1W','1M','3M','6M','1Y'].map(t=>(
              <button key={t} onClick={()=>setTf(t)} style={{background:tf===t?'var(--blue)':'var(--bg3)',color:tf===t?'#fff':'var(--text2)',border:'1px solid var(--border)',borderRadius:4,padding:'4px 10px',fontSize:10,fontFamily:'var(--font-mono)',fontWeight:tf===t?700:400}}>
                {t}
              </button>
            ))}
          </div>

          {/* Candlestick */}
          <div style={{background:'var(--bg3)',borderRadius:6,padding:8,marginBottom:8}}>
            <CandleChart data={ohlc} width={340} height={220}/>
          </div>

          {/* Volume bars */}
          <div style={{height:40,display:'flex',alignItems:'flex-end',gap:0.5,marginBottom:12}}>
            {ohlc.slice(-40).map((d,i)=>(
              <div key={i} style={{flex:1,background:d.close>=d.open?'rgba(56,189,248,0.4)':'rgba(239,68,68,0.4)',height:`${(d.vol/60000000)*100}%`,minHeight:1,borderRadius:'1px 1px 0 0'}}/>
            ))}
          </div>

          {/* Key Stats */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[
              ['Market Cap',active.mktCap],
              ['Volume',active.vol],
              ['P/E Ratio',active.pe?active.pe.toFixed(1):'N/A'],
              ['EPS',active.eps?inr(active.eps):'N/A'],
              ['52W High',inr(active.high52)],
              ['52W Low',inr(active.low52)],
            ].map(([k,v])=>(
              <div key={k} style={{background:'var(--bg3)',borderRadius:6,padding:'8px 10px'}}>
                <div style={{fontSize:9,color:'var(--text3)',fontFamily:'var(--font-mono)',marginBottom:3}}>{k}</div>
                <div style={{fontSize:13,fontWeight:700,fontFamily:'var(--font-mono)'}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Related News */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Related News</div>
          {NEWS.filter(n=>n.sym===active.sym).concat(NEWS.slice(0,2)).slice(0,3).map(n=>(
            <div key={n.id} style={{padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:11,fontWeight:600,lineHeight:1.4,marginBottom:4}}>{n.title}</div>
              <div style={{fontSize:10,color:'var(--text3)',display:'flex',gap:8}}>
                <span>{n.source}</span><span>{n.time}</span>
                <span style={{color:n.sentiment==='bullish'?'var(--green)':'var(--red)',fontWeight:700}}>{n.sentiment}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── PORTFOLIO PAGE ──────────────────────────────────────────────────────────
const PortfolioPage = () => {
  const {prices,portfolio,setPortfolio}=useApp();
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({sym:'',shares:'',cost:''});

  const rows=portfolio.map(p=>{
    const st=STOCKS.find(s=>s.sym===p.sym);
    if(!st)return null;
    const live=prices[p.sym]||st.price;
    const value=live*p.shares;
    const invested=p.avgCost*p.shares;
    const pnl=value-invested;
    const pnlPct=(pnl/invested)*100;
    return{...p,live,value,invested,pnl,pnlPct,st};
  }).filter(Boolean);

  const totVal=rows.reduce((s,r)=>s+r.value,0);
  const totInv=rows.reduce((s,r)=>s+r.invested,0);
  const totPnl=totVal-totInv;
  const totPct=(totPnl/totInv)*100;

  const handleAdd=()=>{
    if(!form.sym||!form.shares||!form.cost)return;
    setPortfolio(prev=>{
      const ex=prev.find(p=>p.sym===form.sym.toUpperCase());
      if(ex){
        return prev.map(p=>p.sym===form.sym.toUpperCase()?{...p,shares:p.shares+Number(form.shares)}:p);
      }
      return[...prev,{sym:form.sym.toUpperCase(),shares:Number(form.shares),avgCost:Number(form.cost)}];
    });
    setForm({sym:'',shares:'',cost:''});setShowAdd(false);
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16,animation:'slideIn 0.3s ease'}}>
      {/* Summary */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {[
          {label:'Total Value',val:inr(totVal),color:'var(--text)'},
          {label:'Total Invested',val:inr(totInv),color:'var(--text)'},
          {label:'Total P&L',val:`${totPnl>=0?'+':'-'}${inr(Math.abs(totPnl))}`,color:totPnl>=0?'var(--green)':'var(--red)'},
          {label:'Return',val:`${totPct>=0?'+':''}${totPct.toFixed(2)}%`,color:totPct>=0?'var(--green)':'var(--red)'},
        ].map((b,i)=>(
          <div key={i} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
            <div style={{fontSize:11,color:'var(--text2)',marginBottom:8,fontWeight:600}}>{b.label}</div>
            <div style={{fontSize:22,fontWeight:800,fontFamily:'var(--font-mono)',color:b.color,letterSpacing:'-1px'}}>{b.val}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
        {/* Holdings Table */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontWeight:700,fontSize:13}}>Holdings</span>
            <button onClick={()=>setShowAdd(!showAdd)} style={{background:'var(--blue)',color:'#fff',padding:'6px 14px',borderRadius:5,fontSize:12,fontWeight:700}}>+ Add Position</button>
          </div>
          {showAdd&&(
            <div style={{padding:14,borderBottom:'1px solid var(--border)',background:'var(--bg3)',display:'flex',gap:8,alignItems:'flex-end'}}>
              {[['Symbol','sym','AAPL'],['Shares','shares','10'],['Avg Cost','cost','150.00']].map(([l,k,ph])=>(
                <div key={k} style={{flex:1}}>
                  <div style={{fontSize:10,color:'var(--text3)',marginBottom:4}}>{l}</div>
                  <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={ph}
                    style={{width:'100%',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:4,padding:'6px 8px',color:'var(--text)',fontSize:12,fontFamily:'var(--font-mono)'}}/>
                </div>
              ))}
              <button onClick={handleAdd} style={{background:'var(--green)',color:'#000',padding:'6px 14px',borderRadius:4,fontSize:12,fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>Add</button>
            </div>
          )}
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'var(--bg3)'}}>
                {['Symbol','Shares','Avg Cost','Current','Value','P&L','Return','Sparkline'].map(h=>(
                  <th key={h} style={{padding:'9px 14px',textAlign:'left',fontSize:10,color:'var(--text3)',fontWeight:700,fontFamily:'var(--font-mono)'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.sym} style={{borderBottom:'1px solid var(--border)'}}>
                  <td style={{padding:'10px 14px'}}>
                    <div style={{fontSize:13,fontWeight:800,fontFamily:'var(--font-mono)'}}>{r.sym}</div>
                    <div style={{fontSize:10,color:'var(--text3)'}}>{r.st.name.split(' ')[0]}</div>
                  </td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12}}>{r.shares}</td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12}}>{inr(r.avgCost)}</td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12,fontWeight:700}}>{inr(r.live)}</td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12,fontWeight:700}}>{inrC(r.value)}</td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12,color:r.pnl>=0?'var(--green)':'var(--red)',fontWeight:700}}>{r.pnl>=0?'+':'-'}{inrC(Math.abs(r.pnl))}</td>
                  <td style={{padding:'10px 14px'}}><Badge up={r.pnlPct>=0}>{Math.abs(r.pnlPct).toFixed(2)}%</Badge></td>
                  <td style={{padding:'10px 14px'}}><Sparkline data={genSparkline(r.live)} color={r.pnlPct>=0?'#00d084':'#ff4757'}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Allocation + Perf */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:16}}>Allocation</div>
            <PieChart data={rows.map(r=>({label:r.sym,value:r.value}))}/>
          </div>
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Performance</div>
            {rows.sort((a,b)=>b.pnlPct-a.pnlPct).map(r=>(
              <div key={r.sym} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:11}}>
                  <span style={{fontWeight:700}}>{r.sym}</span>
                  <span style={{fontFamily:'var(--font-mono)',color:r.pnlPct>=0?'var(--green)':'var(--red)',fontWeight:700}}>{r.pnlPct>=0?'+':''}{inrC(r.pnl)}</span>
                </div>
                <div style={{height:4,background:'var(--bg4)',borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${Math.min(Math.abs(r.pnlPct)*2,100)}%`,background:r.pnlPct>=0?'var(--green)':'var(--red)',borderRadius:2,transition:'width 0.5s ease'}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── WATCHLIST PAGE ───────────────────────────────────────────────────────────
const WatchlistPage = () => {
  const {prices,watchlist,setWatchlist}=useApp();
  const [activeList,setActiveList]=useState(0);
  const [lists,setLists]=useState([
    {name:'Tech Giants',stocks:['AAPL','MSFT','NVDA','META','GOOGL']},
    {name:'Value Plays',stocks:['JPM','WMT','JNJ','XOM','V']},
    {name:'High Risk',stocks:['TSLA','AMD','NFLX','BA']},
  ]);
  const [newName,setNewName]=useState('');

  const cur=lists[activeList];
  const curStocks=STOCKS.filter(s=>cur.stocks.includes(s.sym));

  const removeStock=(sym)=>{
    setLists(prev=>prev.map((l,i)=>i===activeList?{...l,stocks:l.stocks.filter(s=>s!==sym)}:l));
  };
  const addList=()=>{
    if(!newName.trim())return;
    setLists(prev=>[...prev,{name:newName,stocks:[]}]);
    setNewName('');
  };

  return (
    <div style={{display:'flex',gap:16,height:'100%',animation:'slideIn 0.3s ease'}}>
      {/* List Sidebar */}
      <div style={{width:200,display:'flex',flexDirection:'column',gap:8}}>
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
          <div style={{padding:'12px 14px',borderBottom:'1px solid var(--border)',fontWeight:700,fontSize:12}}>My Watchlists</div>
          {lists.map((l,i)=>(
            <button key={i} onClick={()=>setActiveList(i)} style={{width:'100%',padding:'10px 14px',textAlign:'left',background:activeList===i?'var(--bg4)':'none',borderLeft:activeList===i?'2px solid var(--blue)':'2px solid transparent',color:activeList===i?'var(--text)':'var(--text2)',fontSize:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span>{l.name}</span>
              <span style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--font-mono)'}}>{l.stocks.length}</span>
            </button>
          ))}
        </div>
        <div style={{display:'flex',gap:6}}>
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="New list…"
            style={{flex:1,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:4,padding:'6px 8px',color:'var(--text)',fontSize:11}}/>
          <button onClick={addList} style={{background:'var(--green)',color:'#000',padding:'6px 10px',borderRadius:4,fontSize:13,fontWeight:800}}>+</button>
        </div>
      </div>

      {/* Stocks */}
      <div style={{flex:1,display:'flex',flexDirection:'column',gap:12}}>
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontWeight:700,fontSize:13}}>{cur.name}</span>
            <span style={{fontSize:11,color:'var(--text3)'}}>{curStocks.length} stocks</span>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'var(--bg3)'}}>
                {['Symbol','Price','Change','% Change','Volume','Mkt Cap','52W','Trend',''].map(h=>(
                  <th key={h} style={{padding:'8px 14px',textAlign:'left',fontSize:10,color:'var(--text3)',fontWeight:700,fontFamily:'var(--font-mono)'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {curStocks.map(s=>{
                const live=prices[s.sym]||s.price;
                const up=s.chgPct>=0;
                return (
                  <tr key={s.sym} style={{borderBottom:'1px solid var(--border)'}}>
                    <td style={{padding:'10px 14px'}}>
                      <div style={{fontSize:13,fontWeight:800,fontFamily:'var(--font-mono)'}}>{s.sym}</div>
                      <div style={{fontSize:10,color:'var(--text3)'}}>{s.sector}</div>
                    </td>
                    <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontWeight:700,fontSize:13}}>{inr(live)}</td>
                    <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12,color:up?'var(--green)':'var(--red)'}}>{up?'+':''}{s.chg.toFixed(2)}</td>
                    <td style={{padding:'10px 14px'}}><Badge up={up}>{Math.abs(s.chgPct).toFixed(2)}%</Badge></td>
                    <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text2)'}}>{s.vol}</td>
                    <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text2)'}}>{s.mktCap}</td>
                    <td style={{padding:'10px 14px',fontSize:10,color:'var(--text3)',fontFamily:'var(--font-mono)'}}>₹{(s.low52*83.5).toFixed(0)}—₹{(s.high52*83.5).toFixed(0)}</td>
                    <td style={{padding:'10px 14px'}}><Sparkline data={genSparkline(s.price)} color={up?'#00d084':'#ff4757'}/></td>
                    <td style={{padding:'10px 14px'}}>
                      <button onClick={()=>removeStock(s.sym)} style={{background:'none',color:'var(--text3)',fontSize:14,padding:'2px 6px',borderRadius:3,border:'1px solid var(--border)'}} title="Remove">✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Stocks */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:14}}>
          <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>Add to Watchlist</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {STOCKS.filter(s=>!cur.stocks.includes(s.sym)).map(s=>(
              <button key={s.sym} onClick={()=>setLists(prev=>prev.map((l,i)=>i===activeList?{...l,stocks:[...l.stocks,s.sym]}:l))}
                style={{padding:'4px 10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:4,color:'var(--text2)',fontSize:11,fontFamily:'var(--font-mono)',fontWeight:600}}>
                + {s.sym}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TRADING PAGE ─────────────────────────────────────────────────────────────
const TradingPage = () => {
  const {prices}=useApp();
  const [cash,setCash]=useState(25000);
  const [vPort,setVPort]=useState([{sym:'AAPL',shares:5,avgCost:181.50},{sym:'NVDA',shares:2,avgCost:812.40}]);
  const [form,setForm]=useState({sym:'AAPL',action:'BUY',shares:'1'});
  const [trades,setTrades]=useState(TRANSACTIONS.slice(0,4));
  const [msg,setMsg]=useState(null);

  const selected=STOCKS.find(s=>s.sym===form.sym)||STOCKS[0];
  const live=prices[form.sym]||selected.price;
  const total=live*Number(form.shares||0);

  const vPortRows=vPort.map(p=>{
    const st=STOCKS.find(s=>s.sym===p.sym);
    const price=prices[p.sym]||st.price;
    const val=price*p.shares,inv=p.avgCost*p.shares;
    return{...p,price,val,pnl:val-inv,pct:(val-inv)/inv*100};
  });
  const vTotVal=vPortRows.reduce((s,r)=>s+r.val,0);

  const execute=()=>{
    const shares=Number(form.shares);
    if(!shares||shares<=0){setMsg({type:'error',text:'Invalid share count'});return;}
    if(form.action==='BUY'&&total>cash){setMsg({type:'error',text:'Insufficient cash!'});return;}
    if(form.action==='SELL'){
      const pos=vPort.find(p=>p.sym===form.sym);
      if(!pos||pos.shares<shares){setMsg({type:'error',text:'Not enough shares!'});return;}
    }
    if(form.action==='BUY'){
      setCash(c=>c-total);
      setVPort(prev=>{
        const ex=prev.find(p=>p.sym===form.sym);
        if(ex){
          const newShares=ex.shares+shares;
          const newAvg=(ex.avgCost*ex.shares+live*shares)/newShares;
          return prev.map(p=>p.sym===form.sym?{...p,shares:newShares,avgCost:newAvg}:p);
        }
        return[...prev,{sym:form.sym,shares,avgCost:live}];
      });
    } else {
      setCash(c=>c+total);
      setVPort(prev=>prev.map(p=>p.sym===form.sym?{...p,shares:p.shares-shares}:p).filter(p=>p.shares>0));
    }
    setTrades(prev=>[{id:Date.now(),type:form.action,sym:form.sym,shares,price:live,date:new Date().toISOString().split('T')[0],total},{...prev[0]},...prev.slice(1,4)]);
    setMsg({type:'success',text:`${form.action} ${shares} ${form.sym} @ ${inr(live)}`});
    setTimeout(()=>setMsg(null),3000);
  };

  return (
    <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:16,animation:'slideIn 0.3s ease'}}>
      {/* Order Form */}
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:14}}>Place Order</div>

          <div style={{display:'flex',gap:0,marginBottom:14,borderRadius:6,overflow:'hidden',border:'1px solid var(--border)'}}>
            {['BUY','SELL'].map(a=>(
              <button key={a} onClick={()=>setForm({...form,action:a})} style={{flex:1,padding:'9px',background:form.action===a?(a==='BUY'?'var(--green)':'var(--red)'):'none',color:form.action===a?'#000':'var(--text2)',fontWeight:700,fontSize:13,fontFamily:'var(--font-mono)',transition:'all 0.15s'}}>
                {a}
              </button>
            ))}
          </div>

          {[['Stock Symbol','sym','select'],['Number of Shares','shares','number']].map(([label,key,type])=>(
            <div key={key} style={{marginBottom:12}}>
              <div style={{fontSize:11,color:'var(--text2)',marginBottom:6,fontWeight:600}}>{label}</div>
              {type==='select'?(
                <select value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
                  style={{width:'100%',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:5,padding:'8px 10px',color:'var(--text)',fontSize:13,fontFamily:'var(--font-mono)',fontWeight:700}}>
                  {STOCKS.map(s=><option key={s.sym} value={s.sym}>{s.sym} — {s.name}</option>)}
                </select>
              ):(
                <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} min="1"
                  style={{width:'100%',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:5,padding:'8px 10px',color:'var(--text)',fontSize:13,fontFamily:'var(--font-mono)',fontWeight:700}}/>
              )}
            </div>
          ))}

          <div style={{background:'var(--bg3)',borderRadius:6,padding:12,marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:12}}>
              <span style={{color:'var(--text2)'}}>Market Price</span>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:700}}>{inr(live)}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:12}}>
              <span style={{color:'var(--text2)'}}>Shares</span>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:700}}>{form.shares||0}</span>
            </div>
            <div style={{height:1,background:'var(--border)',margin:'8px 0'}}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:14}}>
              <span style={{fontWeight:700}}>Total</span>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:800,color:form.action==='BUY'?'var(--red)':'var(--green)'}}>{inr(total)}</span>
            </div>
          </div>

          {msg&&(
            <div style={{padding:'8px 12px',borderRadius:5,marginBottom:12,fontSize:12,fontWeight:700,background:msg.type==='success'?'var(--green-bg)':'var(--red-bg)',color:msg.type==='success'?'var(--green)':'var(--red)',border:`1px solid ${msg.type==='success'?'var(--green)':'var(--red)'}`}}>
              {msg.type==='success'?'✓':'✕'} {msg.text}
            </div>
          )}

          <button onClick={execute} style={{width:'100%',padding:'11px',borderRadius:6,background:form.action==='BUY'?'var(--blue)':'var(--red)',color:'#fff',fontWeight:800,fontSize:14,fontFamily:'var(--font-mono)',letterSpacing:'0.5px',transition:'opacity 0.15s'}}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            {form.action} {form.shares||'0'} {form.sym}
          </button>

          <div style={{display:'flex',justifyContent:'space-between',marginTop:12,fontSize:11,color:'var(--text2)'}}>
            <span>Available Cash:</span>
            <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:'var(--green)'}}>₹{(cash*83.5).toLocaleString('en-IN',{minimumFractionDigits:2})}</span>
          </div>
        </div>

        {/* Trade History */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Trade History</div>
          {trades.map((t,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid var(--border)',fontSize:11}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{padding:'2px 6px',borderRadius:3,fontSize:9,fontWeight:700,fontFamily:'var(--font-mono)',background:t.type==='BUY'?'var(--green-bg)':'var(--red-bg)',color:t.type==='BUY'?'var(--green)':'var(--red)'}}>{t.type}</span>
                <span style={{fontWeight:700}}>{t.sym}</span>
                <span style={{color:'var(--text3)'}}>{t.shares}×{inr(t.price)}</span>
              </div>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:700}}>{inrC(t.total)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Portfolio */}
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {[
            {label:'Portfolio Value',val:inrC(vTotVal),color:'var(--text)'},
            {label:'Available Cash',val:`₹${(cash*83.5).toLocaleString('en-IN',{maximumFractionDigits:0})}`,color:'var(--green)'},
            {label:'Total Assets',val:inrC(vTotVal+cash),color:'var(--blue)'},
          ].map((b,i)=>(
            <div key={i} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
              <div style={{fontSize:11,color:'var(--text2)',marginBottom:8,fontWeight:600}}>{b.label}</div>
              <div style={{fontSize:20,fontWeight:800,fontFamily:'var(--font-mono)',color:b.color,letterSpacing:'-1px'}}>{b.val}</div>
            </div>
          ))}
        </div>

        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',fontWeight:700,fontSize:13}}>Virtual Holdings</div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'var(--bg3)'}}>
              {['Symbol','Shares','Avg Cost','Current','Value','P&L','Return'].map(h=>(
                <th key={h} style={{padding:'8px 14px',textAlign:'left',fontSize:10,color:'var(--text3)',fontWeight:700,fontFamily:'var(--font-mono)'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {vPortRows.map(r=>(
                <tr key={r.sym} style={{borderBottom:'1px solid var(--border)'}}>
                  <td style={{padding:'10px 14px',fontWeight:800,fontFamily:'var(--font-mono)',fontSize:13}}>{r.sym}</td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12}}>{r.shares}</td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12}}>{inr(r.avgCost)}</td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12,fontWeight:700}}>{inr(r.price)}</td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12,fontWeight:700}}>{inrC(r.val)}</td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12,fontWeight:700,color:r.pnl>=0?'var(--green)':'var(--red)'}}>{r.pnl>=0?'+':'-'}{inrC(Math.abs(r.pnl))}</td>
                  <td style={{padding:'10px 14px'}}><Badge up={r.pct>=0}>{Math.abs(r.pct).toFixed(2)}%</Badge></td>
                </tr>
              ))}
              {vPortRows.length===0&&<tr><td colSpan={7} style={{padding:24,textAlign:'center',color:'var(--text3)',fontSize:13}}>No holdings yet. Place your first trade!</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── ALERTS PAGE ──────────────────────────────────────────────────────────────
const AlertsPage = () => {
  const {prices}=useApp();
  const [alerts,setAlerts]=useState(ALERTS);
  const [form,setForm]=useState({sym:'AAPL',type:'PRICE_ABOVE',value:''});
  const TYPES=['PRICE_ABOVE','PRICE_BELOW','PCT_CHANGE'];

  const addAlert=()=>{
    if(!form.value)return;
    setAlerts(prev=>[...prev,{id:Date.now(),sym:form.sym,type:form.type,value:Number(form.value),active:true,triggered:false}]);
    setForm({...form,value:''});
  };
  const toggle=(id)=>setAlerts(prev=>prev.map(a=>a.id===id?{...a,active:!a.active}:a));
  const remove=(id)=>setAlerts(prev=>prev.filter(a=>a.id!==id));

  return (
    <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:16,animation:'slideIn 0.3s ease'}}>
      {/* Create Alert */}
      <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16,height:'fit-content'}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:14}}>Create Alert</div>
        {[['Stock',<select value={form.sym} onChange={e=>setForm({...form,sym:e.target.value})} style={{width:'100%',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:5,padding:'8px 10px',color:'var(--text)',fontSize:12,fontFamily:'var(--font-mono)',fontWeight:700}}>{STOCKS.map(s=><option key={s.sym}>{s.sym}</option>)}</select>],
           ['Alert Type',<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{width:'100%',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:5,padding:'8px 10px',color:'var(--text)',fontSize:12,fontFamily:'var(--font-mono)',fontWeight:700}}>{TYPES.map(t=><option key={t}>{t}</option>)}</select>],
           ['Value',<input type="number" value={form.value} onChange={e=>setForm({...form,value:e.target.value})} placeholder={form.type==='PCT_CHANGE'?'e.g. -5':'e.g. 200'} style={{width:'100%',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:5,padding:'8px 10px',color:'var(--text)',fontSize:12,fontFamily:'var(--font-mono)',fontWeight:700}}/>],
        ].map(([label,input])=>(
          <div key={label} style={{marginBottom:12}}>
            <div style={{fontSize:11,color:'var(--text2)',marginBottom:6,fontWeight:600}}>{label}</div>
            {input}
          </div>
        ))}
        <button onClick={addAlert} style={{width:'100%',padding:'10px',borderRadius:5,background:'var(--blue)',color:'#fff',fontWeight:700,fontSize:13}}>+ Create Alert</button>
      </div>

      {/* Alert List */}
      <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
        <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',fontWeight:700,fontSize:13}}>Active Alerts ({alerts.filter(a=>a.active).length})</div>
        <div style={{padding:12,display:'flex',flexDirection:'column',gap:10}}>
          {alerts.map(a=>{
            const st=STOCKS.find(s=>s.sym===a.sym);
            const live=prices[a.sym]||(st?.price||0);
            let triggered=a.triggered;
            if(!triggered){
              if(a.type==='PRICE_ABOVE'&&live>=a.value)triggered=true;
              if(a.type==='PRICE_BELOW'&&live<=a.value)triggered=true;
            }
            return (
              <div key={a.id} style={{background:'var(--bg3)',borderRadius:6,padding:14,border:`1px solid ${triggered?'var(--gold)':a.active?'var(--border)':'var(--border)'}`,display:'flex',alignItems:'center',gap:12,opacity:a.active?1:0.5}}>
                <div style={{width:36,height:36,borderRadius:8,background:triggered?'rgba(245,158,11,0.15)':a.active?'var(--blue-bg)':'var(--bg4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                  {triggered?'🔔':a.active?'⏳':'🔕'}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <span style={{fontWeight:800,fontFamily:'var(--font-mono)',fontSize:14}}>{a.sym}</span>
                    <span style={{fontSize:10,padding:'2px 6px',borderRadius:3,background:'var(--bg4)',color:'var(--text3)',fontFamily:'var(--font-mono)'}}>{a.type.replace('_',' ')}</span>
                    {triggered&&<span style={{fontSize:10,padding:'2px 6px',borderRadius:3,background:'rgba(245,158,11,0.15)',color:'var(--gold)',fontFamily:'var(--font-mono)',fontWeight:700}}>TRIGGERED</span>}
                  </div>
                  <div style={{fontSize:12,color:'var(--text2)'}}>
                    Target: <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:'var(--text)'}}>{a.type==='PCT_CHANGE'?`${a.value}%`:inr(a.value)}</span>
                    <span style={{color:'var(--text3)',margin:'0 8px'}}>|</span>
                    Current: <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:triggered?'var(--gold)':'var(--text)'}}>{inr(live)}</span>
                  </div>
                </div>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <button onClick={()=>toggle(a.id)} style={{padding:'5px 10px',borderRadius:4,background:a.active?'var(--blue-bg)':'var(--bg4)',color:a.active?'var(--blue)':'var(--text3)',border:`1px solid ${a.active?'var(--blue)':'var(--border)'}`,fontSize:11,fontWeight:700}}>
                    {a.active?'ON':'OFF'}
                  </button>
                  <button onClick={()=>remove(a.id)} style={{padding:'5px 8px',borderRadius:4,background:'var(--red-bg)',color:'var(--red)',border:'1px solid var(--red)',fontSize:11,fontWeight:700}}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── NEWS PAGE ────────────────────────────────────────────────────────────────
const NewsPage = () => {
  const [filter,setFilter]=useState('All');
  const tags=['All','Macro','Earnings','Corporate','Deals','Product'];
  const filtered=NEWS.filter(n=>filter==='All'||n.tag===filter);
  const allNews=[...NEWS,...NEWS.map(n=>({...n,id:n.id+100,title:n.title+' (Update)',time:'3d ago'}))];
  const showing=allNews.filter(n=>filter==='All'||n.tag===filter);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16,animation:'slideIn 0.3s ease'}}>
      {/* Tags */}
      <div style={{display:'flex',gap:8}}>
        {tags.map(t=>(
          <button key={t} onClick={()=>setFilter(t)} style={{padding:'5px 14px',borderRadius:4,border:`1px solid ${filter===t?'var(--blue)':'var(--border)'}`,background:filter===t?'var(--blue-bg)':'none',color:filter===t?'var(--blue2)':'var(--text2)',fontSize:12,fontWeight:filter===t?700:400}}>
            {t}
          </button>
        ))}
        <div style={{marginLeft:'auto',display:'flex',gap:6,alignItems:'center'}}>
          <span style={{fontSize:11,color:'var(--text3)'}}>{showing.length} articles</span>
        </div>
      </div>

      {/* Featured */}
      {showing[0]&&(
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:20,borderLeft:'3px solid var(--blue)'}}>
          <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'center'}}>
            <span style={{fontSize:10,padding:'3px 8px',borderRadius:3,background:'var(--blue-bg)',color:'var(--blue2)',fontFamily:'var(--font-mono)',fontWeight:700}}>FEATURED</span>
            <span style={{fontSize:10,padding:'3px 8px',borderRadius:3,background:'var(--bg3)',color:'var(--text3)',fontFamily:'var(--font-mono)'}}>{showing[0].tag}</span>
            <span style={{fontSize:11,color:showing[0].sentiment==='bullish'?'var(--green)':'var(--red)',fontWeight:700,marginLeft:'auto'}}>{showing[0].sentiment.toUpperCase()}</span>
          </div>
          <div style={{fontSize:18,fontWeight:800,lineHeight:1.3,marginBottom:10}}>{showing[0].title}</div>
          <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.6,marginBottom:12}}>
            Market participants are closely watching developments as this story continues to unfold. Analysts suggest potential impact on sector valuations could be significant over the coming weeks.
          </div>
          <div style={{display:'flex',gap:12,fontSize:11,color:'var(--text3)'}}>
            <span style={{fontWeight:700,color:'var(--text2)'}}>{showing[0].source}</span>
            <span>{showing[0].time}</span>
            <span style={{fontFamily:'var(--font-mono)',color:'var(--gold)'}}>#{showing[0].sym}</span>
          </div>
        </div>
      )}

      {/* Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
        {showing.slice(1).map(n=>(
          <div key={n.id} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16,cursor:'pointer',transition:'border-color 0.15s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border2)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:10,alignItems:'flex-start'}}>
              <span style={{fontSize:9,padding:'2px 6px',borderRadius:3,background:'var(--bg3)',color:'var(--text3)',fontFamily:'var(--font-mono)',fontWeight:700}}>{n.tag}</span>
              <span style={{fontSize:9,color:n.sentiment==='bullish'?'var(--green)':'var(--red)',fontFamily:'var(--font-mono)',fontWeight:700}}>{n.sentiment.toUpperCase()}</span>
            </div>
            <div style={{fontSize:13,fontWeight:700,lineHeight:1.4,marginBottom:10}}>{n.title}</div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--text3)'}}>
              <span style={{fontWeight:700,color:'var(--text2)'}}>{n.source}</span>
              <div style={{display:'flex',gap:8}}>
                <span style={{fontFamily:'var(--font-mono)',color:'var(--gold)'}}>#{n.sym}</span>
                <span>{n.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
const ReportsPage = () => {
  const {prices,portfolio}=useApp();
  const [dateRange,setDateRange]=useState('3M');
  const rows=portfolio.map(p=>{
    const st=STOCKS.find(s=>s.sym===p.sym);
    const live=prices[p.sym]||st.price;
    return{...p,live,val:live*p.shares,inv:p.avgCost*p.shares,st};
  });
  const totVal=rows.reduce((s,r)=>s+r.val,0);
  const totInv=rows.reduce((s,r)=>s+r.inv,0);
  const realized=TRANSACTIONS.filter(t=>t.type==='SELL').reduce((s,t)=>s+t.total,0);

  const perfData=genSparkline(totVal*0.85,30).map((v,i)=>({month:['Oct','Nov','Dec','Jan','Feb','Mar','Apr'][Math.floor(i/5)]||'Apr',val:v}));

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16,animation:'slideIn 0.3s ease'}}>
      {/* Controls */}
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <span style={{fontSize:12,color:'var(--text2)',fontWeight:600}}>Period:</span>
        {['1M','3M','6M','YTD','1Y','All'].map(r=>(
          <button key={r} onClick={()=>setDateRange(r)} style={{padding:'5px 12px',borderRadius:4,border:`1px solid ${dateRange===r?'var(--blue)':'var(--border)'}`,background:dateRange===r?'var(--blue-bg)':'none',color:dateRange===r?'var(--blue2)':'var(--text2)',fontSize:11,fontWeight:dateRange===r?700:400,fontFamily:'var(--font-mono)'}}>
            {r}
          </button>
        ))}
        <button style={{marginLeft:'auto',padding:'6px 14px',borderRadius:5,background:'var(--blue)',color:'#fff',fontSize:12,fontWeight:700}}>⬇ Export PDF</button>
        <button style={{padding:'6px 14px',borderRadius:5,background:'var(--bg3)',border:'1px solid var(--border)',color:'var(--text)',fontSize:12,fontWeight:600}}>⬇ Export Excel</button>
      </div>

      {/* KPI Row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10}}>
        {[
          {l:'Portfolio Value',v:inrC(totVal),c:'var(--text)'},
          {l:'Total Invested',v:inrC(totInv),c:'var(--text)'},
          {l:'Unrealized P&L',v:`${(totVal-totInv)>=0?'+':'-'}${inrC(Math.abs(totVal-totInv))}`,c:(totVal-totInv)>=0?'var(--green)':'var(--red)'},
          {l:'Realized Gains',v:inrC(realized),c:'var(--green)'},
          {l:'Total Return',v:`${((totVal-totInv)/totInv*100).toFixed(2)}%`,c:(totVal-totInv)>=0?'var(--green)':'var(--red)'},
        ].map((b,i)=>(
          <div key={i} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:14}}>
            <div style={{fontSize:10,color:'var(--text3)',marginBottom:6,fontFamily:'var(--font-mono)',fontWeight:600}}>{b.l}</div>
            <div style={{fontSize:18,fontWeight:800,fontFamily:'var(--font-mono)',color:b.c,letterSpacing:'-0.5px'}}>{b.v}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:12}}>
        {/* Performance Chart */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:16}}>Portfolio Performance — {dateRange}</div>
          <MiniChart data={genSparkline(totVal,60)} width={500} height={140} color="var(--blue)"/>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:12,fontSize:10,color:'var(--text3)',fontFamily:'var(--font-mono)'}}>
            {['Oct','Nov','Dec','Jan','Feb','Mar'].map(m=><span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Sector Breakdown */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:16}}>Sector Allocation</div>
          <PieChart data={[
            {label:'Tech',value:58},{label:'Finance',value:15},{label:'Health',value:12},{label:'Energy',value:8},{label:'Other',value:7}
          ]} size={120}/>
        </div>
      </div>

      {/* P&L Table */}
      <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
        <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',fontWeight:700,fontSize:13}}>Position Report</div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:'var(--bg3)'}}>
            {['Symbol','Shares','Avg Cost','Current Price','Market Value','Cost Basis','Unrealized P&L','% Return','Weight'].map(h=>(
              <th key={h} style={{padding:'8px 14px',textAlign:'left',fontSize:10,color:'var(--text3)',fontWeight:700,fontFamily:'var(--font-mono)',whiteSpace:'nowrap'}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map(r=>{
              const pnl=r.val-r.inv;const pct=pnl/r.inv*100;
              return (
                <tr key={r.sym} style={{borderBottom:'1px solid var(--border)'}}>
                  <td style={{padding:'10px 14px',fontWeight:800,fontFamily:'var(--font-mono)',fontSize:13}}>{r.sym}</td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12}}>{r.shares}</td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12}}>{inr(r.avgCost)}</td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12,fontWeight:700}}>{inr(r.live)}</td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12,fontWeight:700}}>{inrC(r.val)}</td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12}}>{inrC(r.inv)}</td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12,fontWeight:700,color:pnl>=0?'var(--green)':'var(--red)'}}>{pnl>=0?'+':'-'}{inrC(Math.abs(pnl))}</td>
                  <td style={{padding:'10px 14px'}}><Badge up={pct>=0}>{Math.abs(pct).toFixed(2)}%</Badge></td>
                  <td style={{padding:'10px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:60,height:4,background:'var(--bg4)',borderRadius:2}}>
                        <div style={{height:'100%',width:`${(r.val/totVal)*100}%`,background:'var(--blue)',borderRadius:2}}/>
                      </div>
                      <span style={{fontSize:10,fontFamily:'var(--font-mono)',color:'var(--text2)'}}>{((r.val/totVal)*100).toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Transaction History */}
      <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
        <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',fontWeight:700,fontSize:13}}>Transaction History</div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:'var(--bg3)'}}>
            {['Date','Type','Symbol','Shares','Price','Total'].map(h=>(
              <th key={h} style={{padding:'8px 14px',textAlign:'left',fontSize:10,color:'var(--text3)',fontWeight:700,fontFamily:'var(--font-mono)'}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {TRANSACTIONS.map(t=>(
              <tr key={t.id} style={{borderBottom:'1px solid var(--border)'}}>
                <td style={{padding:'9px 14px',fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text2)'}}>{t.date}</td>
                <td style={{padding:'9px 14px'}}><span style={{padding:'2px 7px',borderRadius:3,fontSize:10,fontWeight:700,fontFamily:'var(--font-mono)',background:t.type==='BUY'?'var(--green-bg)':'var(--red-bg)',color:t.type==='BUY'?'var(--green)':'var(--red)'}}>{t.type}</span></td>
                <td style={{padding:'9px 14px',fontWeight:800,fontFamily:'var(--font-mono)',fontSize:13}}>{t.sym}</td>
                <td style={{padding:'9px 14px',fontFamily:'var(--font-mono)',fontSize:12}}>{t.shares}</td>
                <td style={{padding:'9px 14px',fontFamily:'var(--font-mono)',fontSize:12}}>{inr(t.price)}</td>
                <td style={{padding:'9px 14px',fontFamily:'var(--font-mono)',fontSize:12,fontWeight:700}}>{inrC(t.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── ADMIN PAGE ────────────────────────────────────────────────────────────────
const AdminPage = () => {
  const [tab,setTab]=useState('users');
  const users=[
    {id:1,name:'Alex Johnson',email:'alex@example.com',role:'Admin',joined:'2024-01-15',status:'active',trades:47},
    {id:2,name:'Sarah Chen',email:'sarah@example.com',role:'User',joined:'2024-02-03',status:'active',trades:23},
    {id:3,name:'Mike Davis',email:'mike@example.com',role:'User',joined:'2024-02-18',status:'active',trades:8},
    {id:4,name:'Emma Wilson',email:'emma@example.com',role:'User',joined:'2024-03-01',status:'inactive',trades:0},
    {id:5,name:'James Taylor',email:'james@example.com',role:'User',joined:'2024-03-10',status:'active',trades:15},
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16,animation:'slideIn 0.3s ease'}}>
      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {[
          {l:'Total Users',v:'5',icon:'👥',color:'var(--blue)'},
          {l:'Active Sessions',v:'3',icon:'🟢',color:'var(--green)'},
          {l:'Total Trades Today',v:'12',icon:'⚡',color:'var(--gold)'},
          {l:'API Calls/min',v:'847',icon:'📡',color:'var(--text)'},
        ].map((b,i)=>(
          <div key={i} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16,display:'flex',gap:12,alignItems:'center'}}>
            <div style={{fontSize:24}}>{b.icon}</div>
            <div>
              <div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--font-mono)',marginBottom:4}}>{b.l}</div>
              <div style={{fontSize:24,fontWeight:800,fontFamily:'var(--font-mono)',color:b.color,letterSpacing:'-1px'}}>{b.v}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:0,borderBottom:'1px solid var(--border)'}}>
        {['users','system','stocks','logs'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'10px 18px',background:'none',color:tab===t?'var(--blue2)':'var(--text3)',borderBottom:tab===t?'2px solid var(--blue)':'2px solid transparent',fontWeight:tab===t?700:400,fontSize:12,textTransform:'capitalize',fontFamily:'var(--font-display)',marginBottom:-1}}>
            {t}
          </button>
        ))}
      </div>

      {tab==='users'&&(
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'var(--bg3)'}}>
              {['User','Email','Role','Joined','Status','Trades','Actions'].map(h=>(
                <th key={h} style={{padding:'9px 14px',textAlign:'left',fontSize:10,color:'var(--text3)',fontWeight:700,fontFamily:'var(--font-mono)'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id} style={{borderBottom:'1px solid var(--border)'}}>
                  <td style={{padding:'10px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,var(--blue),var(--green))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff',flexShrink:0}}>{u.name[0]}</div>
                      <span style={{fontSize:12,fontWeight:700}}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{padding:'10px 14px',fontSize:12,color:'var(--text2)'}}>{u.email}</td>
                  <td style={{padding:'10px 14px'}}><span style={{fontSize:10,padding:'2px 7px',borderRadius:3,fontFamily:'var(--font-mono)',fontWeight:700,background:u.role==='Admin'?'rgba(245,158,11,0.15)':'var(--blue-bg)',color:u.role==='Admin'?'var(--gold)':'var(--blue2)'}}>{u.role}</span></td>
                  <td style={{padding:'10px 14px',fontSize:11,color:'var(--text3)',fontFamily:'var(--font-mono)'}}>{u.joined}</td>
                  <td style={{padding:'10px 14px'}}><span style={{fontSize:10,padding:'2px 7px',borderRadius:3,fontFamily:'var(--font-mono)',fontWeight:700,background:u.status==='active'?'var(--green-bg)':'var(--red-bg)',color:u.status==='active'?'var(--green)':'var(--red)'}}>{u.status}</span></td>
                  <td style={{padding:'10px 14px',fontFamily:'var(--font-mono)',fontSize:12,fontWeight:700}}>{u.trades}</td>
                  <td style={{padding:'10px 14px',display:'flex',gap:6}}>
                    <button style={{padding:'4px 10px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:3,color:'var(--text2)',fontSize:11}}>Edit</button>
                    <button style={{padding:'4px 10px',background:'var(--red-bg)',border:'1px solid var(--red)',borderRadius:3,color:'var(--red)',fontSize:11}}>Suspend</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='system'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
          {[
            {label:'API Status',items:[['Alpha Vantage','CONNECTED','green'],['NewsAPI','CONNECTED','green'],['Socket.io','LIVE','green'],['MongoDB','CONNECTED','green']]},
            {label:'Rate Limits',items:[['API Calls Today','847 / 10,000','text'],['WebSocket Conns','3 / 100','text'],['DB Queries/min','124','text'],['Cache Hit Rate','89%','green']]},
          ].map((section,i)=>(
            <div key={i} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>{section.label}</div>
              {section.items.map(([k,v,c])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:12}}>
                  <span style={{color:'var(--text2)'}}>{k}</span>
                  <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:c==='green'?'var(--green)':c==='red'?'var(--red)':'var(--text)'}}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab==='logs'&&(
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:16,fontFamily:'var(--font-mono)',fontSize:11}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12,fontFamily:'var(--font-display)'}}>System Logs</div>
          {[
            {t:'14:23:01',l:'INFO',m:'WebSocket client connected: user_id=2'},
            {t:'14:22:58',l:'INFO',m:'Stock prices updated: 15 symbols'},
            {t:'14:22:45',l:'WARN',m:'Rate limit approaching for Alpha Vantage API'},
            {t:'14:22:30',l:'INFO',m:'User login: alex@example.com'},
            {t:'14:22:15',l:'INFO',m:'Portfolio updated: user_id=1, sym=NVDA'},
            {t:'14:22:00',l:'ERROR',m:'NewsAPI timeout, retrying... attempt 2/3'},
            {t:'14:21:55',l:'INFO',m:'Alert triggered: user_id=1, MSFT PRICE_ABOVE 420'},
            {t:'14:21:30',l:'INFO',m:'Cache miss: GOOGL, fetching from API'},
          ].map((log,i)=>(
            <div key={i} style={{padding:'6px 0',borderBottom:'1px solid var(--border)',display:'flex',gap:12}}>
              <span style={{color:'var(--text3)',flexShrink:0}}>{log.t}</span>
              <span style={{flexShrink:0,width:44,color:log.l==='ERROR'?'var(--red)':log.l==='WARN'?'var(--gold)':'var(--green)',fontWeight:700}}>{log.l}</span>
              <span style={{color:'var(--text2)'}}>{log.m}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
const AuthPage = ({onLogin}) => {
  const [mode,setMode]=useState('login');
  const [form,setForm]=useState({email:'demo@stockpulse.io',password:'demo123',name:''});
  const [loading,setLoading]=useState(false);

  const submit=()=>{
    setLoading(true);
    setTimeout(()=>{
      onLogin({name:form.name||'Alex Johnson',email:form.email,role:'Admin'});
      setLoading(false);
    },800);
  };

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
      {/* Background grid */}
      <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(var(--border) 1px, transparent 1px),linear-gradient(90deg, var(--border) 1px, transparent 1px)',backgroundSize:'60px 60px',opacity:0.3}}/>
      {/* Glow */}
      <div style={{position:'absolute',top:'30%',left:'50%',transform:'translate(-50%,-50%)',width:400,height:400,background:'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)',pointerEvents:'none'}}/>

      <div style={{position:'relative',width:400,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:32,boxShadow:'0 24px 64px rgba(0,0,0,0.6)'}}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:28}}>
          <div style={{width:40,height:40,borderRadius:10,background:'var(--blue)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontFamily:'var(--font-mono)',fontWeight:800,fontSize:18,color:'#fff'}}>S</span>
          </div>
          <div>
            <div style={{fontWeight:800,fontSize:18,letterSpacing:'-0.5px'}}>StockPulse</div>
            <div style={{fontSize:11,color:'var(--text3)'}}>Professional Trading Platform</div>
          </div>
        </div>

        <div style={{marginBottom:20}}>
          <div style={{display:'flex',gap:0,background:'var(--bg3)',borderRadius:6,padding:3,marginBottom:20}}>
            {['login','register'].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'8px',borderRadius:4,background:mode===m?'var(--bg2)':'none',color:mode===m?'var(--text)':'var(--text3)',fontWeight:mode===m?700:400,fontSize:12,textTransform:'capitalize',transition:'all 0.15s',border:mode===m?'1px solid var(--border)':'1px solid transparent'}}>
                {m}
              </button>
            ))}
          </div>

          {mode==='register'&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:'var(--text2)',marginBottom:6,fontWeight:600}}>Full Name</div>
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Alex Johnson"
                style={{width:'100%',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:6,padding:'10px 12px',color:'var(--text)',fontSize:13}}/>
            </div>
          )}

          {[['Email','email','email',form.email],['Password','password','password',form.password]].map(([l,k,t,v])=>(
            <div key={k} style={{marginBottom:14}}>
              <div style={{fontSize:11,color:'var(--text2)',marginBottom:6,fontWeight:600}}>{l}</div>
              <input type={t} value={v} onChange={e=>setForm({...form,[k]:e.target.value})}
                style={{width:'100%',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:6,padding:'10px 12px',color:'var(--text)',fontSize:13}}/>
            </div>
          ))}

          {mode==='login'&&<div style={{fontSize:11,color:'var(--blue2)',textAlign:'right',marginBottom:16,cursor:'pointer',marginTop:-8}}>Forgot password?</div>}
        </div>

        <button onClick={submit} style={{width:'100%',padding:'12px',borderRadius:6,background:'var(--blue)',color:'#fff',fontWeight:800,fontSize:14,fontFamily:'var(--font-mono)',letterSpacing:'0.5px',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          {loading?<span style={{animation:'spin 0.6s linear infinite',display:'inline-block',width:14,height:14,border:'2px solid #000',borderTopColor:'transparent',borderRadius:'50%'}}/>:null}
          {mode==='login'?'SIGN IN':'CREATE ACCOUNT'}
        </button>

        <div style={{fontSize:11,color:'var(--text3)',textAlign:'center',marginTop:14}}>
          Demo credentials pre-filled. Just click Sign In.
        </div>
      </div>
    </div>
  );
};

// ─── SEARCH OVERLAY ───────────────────────────────────────────────────────────
const SearchOverlay = ({q,setPage,setSelectedStock}) => {
  if(!q.trim())return null;
  const results=STOCKS.filter(s=>s.sym.toLowerCase().includes(q.toLowerCase())||s.name.toLowerCase().includes(q.toLowerCase())).slice(0,6);
  if(!results.length)return null;
  return (
    <div style={{position:'absolute',top:57,right:20,width:320,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,boxShadow:'0 12px 32px rgba(0,0,0,0.5)',zIndex:100,overflow:'hidden'}}>
      {results.map(s=>(
        <div key={s.sym} onClick={()=>{setSelectedStock(s);setPage('market');}} style={{padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',borderBottom:'1px solid var(--border)',transition:'background 0.1s'}}
          onMouseEnter={e=>e.currentTarget.style.background='var(--bg3)'}
          onMouseLeave={e=>e.currentTarget.style.background='none'}>
          <div>
            <div style={{fontSize:13,fontWeight:800,fontFamily:'var(--font-mono)'}}>{s.sym}</div>
            <div style={{fontSize:11,color:'var(--text3)'}}>{s.name}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:13,fontWeight:700,fontFamily:'var(--font-mono)'}}>{inr(s.price)}</div>
            <Badge up={s.chgPct>=0}>{Math.abs(s.chgPct).toFixed(2)}%</Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [authed,setAuthed]=useState(false);
  const [user,setUser]=useState(null);
  const [page,setPage]=useState('dashboard');
  const [prices,setPrices]=useState({});
  const [selectedStock,setSelectedStock]=useState(null);
  const [portfolio,setPortfolio]=useState(INIT_PORTFOLIO);
  const [watchlist,setWatchlist]=useState(['AAPL','NVDA','TSLA','MSFT']);
  const [searchQ,setSearchQ]=useState('');

  // Simulate live price updates
  useEffect(()=>{
    if(!authed)return;
    const tick=()=>{
      setPrices(prev=>{
        const next={...prev};
        STOCKS.forEach(s=>{
          const cur=prev[s.sym]||s.price;
          const delta=cur*(Math.random()-0.498)*0.0008;
          next[s.sym]=Math.max(cur*0.95,cur+delta);
        });
        return next;
      });
    };
    const iv=setInterval(tick,1500);
    return()=>clearInterval(iv);
  },[authed]);

  if(!authed)return(
    <>
      <FontLoader/>
      <AuthPage onLogin={(u)=>{setUser(u);setAuthed(true);}}/>
    </>
  );

  const ctx={prices,selectedStock,setSelectedStock,portfolio,setPortfolio,watchlist,setWatchlist,setPage,user};

  const pageMap={
    dashboard:<Dashboard/>,
    market:<MarketPage/>,
    portfolio:<PortfolioPage/>,
    watchlist:<WatchlistPage/>,
    trading:<TradingPage/>,
    alerts:<AlertsPage/>,
    news:<NewsPage/>,
    reports:<ReportsPage/>,
    admin:<AdminPage/>,
  };

  return (
    <AppCtx.Provider value={ctx}>
      <FontLoader/>
      <div style={{display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden'}}>
        <TickerTape prices={prices}/>
        <div style={{display:'flex',flex:1,overflow:'hidden'}}>
          <Sidebar page={page} setPage={p=>{setPage(p);setSearchQ('');}} user={user}/>
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>
            <Header page={page} searchQ={searchQ} setSearchQ={setSearchQ} user={user}/>
            {searchQ&&<SearchOverlay q={searchQ} setPage={setPage} setSelectedStock={setSelectedStock}/>}
            <main style={{flex:1,overflowY:'auto',padding:20,background:'var(--bg)'}}>
              {pageMap[page]||<Dashboard/>}
            </main>
          </div>
        </div>
      </div>
    </AppCtx.Provider>
  );
}
