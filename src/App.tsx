import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plane, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Calendar, 
  CheckCircle2, 
  Circle,
  ExternalLink,
  Thermometer,
  CloudSun,
  Package,
  ChevronDown,
  Globe,
  Navigation2,
  AlertCircle,
  CreditCard,
  Building2,
  FileText,
  Utensils,
  Smartphone,
  Wallet,
  Calculator,
  Stethoscope,
  Info,
  Menu,
  X,
  Wind,
  Droplets,
  Sunrise,
  ArrowRightLeft,
  RefreshCw,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Elite Map Configurations ---

// Custom SVG Pin to fix accuracy issues (anchored exactly at bottom center)
const createCustomIcon = (color: string = '#18181b') => {
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 28.5C16 28.5 24 20.5 24 14C24 9.58172 20.4183 6 16 6C11.5817 6 8 9.58172 8 14C8 20.5 16 28.5 16 28.5Z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="14" r="3" fill="white"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 28], // Anchors the bottom of the pin to the coordinate
    popupAnchor: [0, -28]
  });
};

const MAP_ICON = createCustomIcon('#18181b');
const MAP_ICON_ACTIVE = createCustomIcon('#3b82f6');

// --- Types ---
interface FlightLeg {
  id: string;
  airline: string;
  flightNo: string;
  from: string;
  to: string;
  depTime: string;
  arrTime: string;
  depDate: string;
  terminal: string;
  gate: string;
  pnr: string;
  baggage: string;
  layover?: string;
  status: 'Scheduled' | 'On Time' | 'Landed';
}

type Currency = 'INR' | 'SGD' | 'AED' | 'USD';

// --- Constants & Data ---
const FLIGHT_DATA: FlightLeg[] = [
  { 
    id: '1', 
    airline: 'Akasa Air', 
    flightNo: 'QP 1102', 
    from: 'AMD', 
    to: 'BOM', 
    depDate: 'Jun 17, 2026', 
    depTime: '07:55', 
    arrTime: '09:20', 
    terminal: 'T1', 
    gate: 'B4', 
    pnr: '8H49TF', 
    baggage: '25kg + 7kg',
    layover: '74h 50m (Home Stay)',
    status: 'Scheduled' 
  },
  { 
    id: '2', 
    airline: 'Air India', 
    flightNo: 'AI 2851', 
    from: 'BOM', 
    to: 'BLR', 
    depDate: 'Jun 20, 2026', 
    depTime: '11:10', 
    arrTime: '12:55', 
    terminal: 'T2', 
    gate: 'D13', 
    pnr: '8H49TF', 
    baggage: '25kg + 7kg',
    layover: '1.5 hours',
    status: 'Scheduled' 
  },
  { 
    id: '3', 
    airline: 'Singapore Airlines', 
    flightNo: 'SQ 803', 
    from: 'BLR', 
    to: 'SIN', 
    depDate: 'Jun 20, 2026', 
    depTime: '16:05', 
    arrTime: '22:20', 
    terminal: 'T2', 
    gate: 'A7', 
    pnr: '8H49TF', 
    baggage: '35kg + 7kg',
    status: 'Scheduled' 
  },
];

const CITIES = [
  { name: 'Ahmedabad', code: 'AMD', lat: 23.0225, lon: 72.5714, tz: 'Asia/Kolkata' },
  { name: 'Mumbai', code: 'BOM', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
  { name: 'Bengaluru', code: 'BLR', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
  { name: 'Singapore', code: 'SIN', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
  { name: 'Dubai', code: 'DXB', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai' },
];

const INITIAL_CHECKLIST = [
  { id: 'l1', text: 'Submit SG Arrival Card (SGAC)', category: 'Logistics', checked: false, note: 'Required on/after June 17' },
  { id: 'l2', text: 'Grab App Setup', category: 'Logistics', checked: false, note: 'Est. S$25-35 to hostel' },
  { id: 'l3', text: 'Hostel Check-in: 10 Hyderabad Rd', category: 'Logistics', checked: false },
  { id: 'm1', text: 'Multivitamins & Omega-3', category: 'Health', checked: true },
  { id: 'm2', text: 'Whey Protein (5kg Tub)', category: 'Health', checked: false },
  { id: 'm3', text: 'Basic First Aid Kit', category: 'Health', checked: false },
];

const LOAN_DATA = {
  bank: 'HDFC Credila',
  id: 'A2509185292',
  amount: '₹50,00,000',
  contact: 'Parth Barot',
  status: 'Active',
};

// --- Framer Motion Springs ---
const eliteSpring = { type: 'spring', stiffness: 300, damping: 30 };
const layoutTransition = { type: 'spring', stiffness: 200, damping: 25 };

// --- Hooks ---
const useLiveTime = (timeZone: string) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return time.toLocaleTimeString('en-US', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

// --- UI Components ---

const GlassContainer = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`relative group overflow-hidden backdrop-blur-xl bg-white/40 border border-white/40 rounded-[28px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] p-6 transition-all duration-700 hover:shadow-[0_40px_70px_-15px_rgba(0,0,0,0.12)] ${className}`}
  >
    <div className="absolute inset-0 rounded-[28px] border-[1px] border-black/[0.02] pointer-events-none" />
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
    <div className="relative z-10">{children}</div>
  </motion.div>
);

const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon: any }) => (
  <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2.5 mb-5 px-1 font-sans">
    <div className="p-2 bg-white/40 backdrop-blur-xl rounded-xl border border-white/60 shadow-sm">
      <Icon className="h-3.5 w-3.5 text-zinc-600" />
    </div>
    {children}
  </h2>
);

const FlightLegRow = ({ leg, isLast }: { leg: FlightLeg, isLast: boolean }) => (
  <div className="relative pl-8 pb-10 last:pb-0 font-sans">
    {!isLast && <div className="absolute left-[11px] top-8 bottom-0 w-[1px] bg-gradient-to-b from-zinc-200 to-transparent" />}
    <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full bg-white border border-zinc-100 shadow-sm z-10 flex items-center justify-center">
       <div className="h-1.5 w-1.5 bg-zinc-900 rounded-full" />
    </div>
    
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-lg font-bold text-zinc-900 tracking-tight">{leg.from}</span>
          <ArrowRightLeft className="h-3 w-3 text-zinc-300" />
          <span className="text-lg font-bold text-zinc-900 tracking-tight">{leg.to}</span>
        </div>
        <div className="flex items-center gap-2.5">
           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{leg.airline}</span>
           <span className="px-2 py-0.5 bg-zinc-100 rounded-md text-[10px] font-mono font-medium text-zinc-500 uppercase">{leg.flightNo}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="block text-base font-bold text-zinc-900 tabular-nums leading-none mb-1">{leg.depTime}</span>
        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{leg.depDate}</span>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3">
       {[
         { label: 'Terminal', value: leg.terminal },
         { label: 'Gate', value: leg.gate },
         { label: 'Baggage', value: leg.baggage }
       ].map((item, idx) => (
         <div key={idx} className="bg-white/40 rounded-2xl p-3 border border-white/60">
            <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest mb-1">{item.label}</p>
            <p className="text-xs font-bold text-zinc-800">{item.value}</p>
         </div>
       ))}
    </div>

    {leg.layover && (
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="mt-4 flex items-center gap-3 px-4 py-3 bg-blue-50/50 border border-blue-100/50 rounded-2xl backdrop-blur-md"
      >
         <Clock className="h-3.5 w-3.5 text-blue-500" />
         <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Layover: {leg.layover}</span>
      </motion.div>
    )}
  </div>
);

const ClockWidget = ({ label, tz }: { label: string, tz: string }) => {
  const time = useLiveTime(tz);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
      <span className="text-xl font-medium text-zinc-900 tabular-nums tracking-tighter font-mono">{time}</span>
    </div>
  );
};

const WeatherWidget = ({ city }: { city: typeof CITIES[0] }) => (
  <motion.div 
    whileHover={{ x: 5 }}
    transition={eliteSpring}
    className="flex items-center justify-between p-4 bg-white/30 rounded-2xl border border-white/50 backdrop-blur-md group"
  >
    <div className="flex items-center gap-3.5">
      <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-900/10 group-hover:bg-blue-600 transition-colors duration-500">
        <CloudSun className="h-4.5 w-4.5 text-white" />
      </div>
      <div>
        <p className="text-xs font-bold text-zinc-800 uppercase tracking-wider leading-none mb-1">{city.name}</p>
        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Clear Sky</p>
      </div>
    </div>
    <span className="text-sm font-bold text-zinc-900 tabular-nums">28°C</span>
  </motion.div>
);

const ForexWidget = () => {
  const [val, setVal] = useState('1000');
  const [base, setBase] = useState<Currency>('INR');
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  
  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
        const data = await res.json();
        if (data.rates) {
          setRates(data.rates);
          setLastUpdate(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error('Failed to fetch rates', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, [base]);

  const currencies: { code: Currency; symbol: string; label: string }[] = [
    { code: 'INR', symbol: '₹', label: 'Rupee' },
    { code: 'SGD', symbol: 'S$', label: 'Singapore' },
    { code: 'AED', symbol: 'د.إ', label: 'Dubai' },
    { code: 'USD', symbol: '$', label: 'US Dollar' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex bg-zinc-100/50 p-1 rounded-2xl border border-zinc-200/50">
        {currencies.map((c) => (
          <button
            key={c.code}
            onClick={() => setBase(c.code)}
            className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all duration-300 ${base === c.code ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            {c.code}
          </button>
        ))}
      </div>

      <div className="relative">
        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5 ml-1">Input Amount</label>
        <div className="relative">
          <input 
            type="number" 
            value={val} 
            onChange={(e) => setVal(e.target.value)}
            className="w-full bg-white/50 border border-white/80 rounded-2xl p-5 pr-12 text-lg font-medium font-mono focus:ring-4 focus:ring-blue-500/5 outline-none transition-all backdrop-blur-md"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
            {currencies.find(c => c.code === base)?.symbol}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {currencies.filter(c => c.code !== base).map((c) => (
          <motion.div 
            layout
            key={c.code}
            className="bg-white/40 rounded-[22px] p-5 border border-white/60 flex justify-between items-center"
          >
            <div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">{c.label} ({c.code})</p>
              <p className="text-xl font-medium text-zinc-900 tabular-nums font-mono tracking-tighter">
                {c.symbol} {loading ? '...' : (Number(val) * (rates[c.code] || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <RefreshCw className={`h-4 w-4 text-blue-500 ${loading ? 'animate-spin' : 'opacity-30'}`} />
            </div>
          </motion.div>
        ))}
      </div>
      
      {lastUpdate && (
        <p className="text-[8px] text-center text-zinc-400 font-bold uppercase tracking-widest">
          Last Sync: {lastUpdate}
        </p>
      )}
    </div>
  );
};

const MapController = ({ bounds }: { bounds: L.LatLngBoundsExpression }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [100, 100] });
  }, [bounds, map]);
  return null;
};

// --- Main App ---

export default function App() {
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [activeTab, setActiveTab] = useState<'logistics' | 'health'>('logistics');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleItem = (id: string) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const polyline: [number, number][] = CITIES.slice(0, 4).map(c => [c.lat, c.lon]);
  const bounds = useMemo(() => L.latLngBounds(polyline), [polyline]);

  // iOS Viewport Height Fix
  useEffect(() => {
    const setVH = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);
    return () => window.removeEventListener('resize', setVH);
  }, []);

  return (
    <div className="flex w-screen bg-[#f8fafc] overflow-hidden font-sans text-zinc-900 selection:bg-blue-500 selection:text-white" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-400/10 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar Toggle */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-8 left-8 z-[100] h-12 w-12 bg-white/80 backdrop-blur-xl border border-white shadow-xl rounded-2xl flex items-center justify-center transition-shadow hover:shadow-2xl"
      >
        {sidebarOpen ? <X className="h-5 w-5 text-zinc-600" /> : <Menu className="h-5 w-5 text-zinc-600" />}
      </motion.button>

      {/* Left Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside 
            initial={{ x: -450, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -450, opacity: 0 }}
            transition={layoutTransition}
            className="w-[450px] max-w-[85vw] h-full relative z-50 flex flex-col border-r border-zinc-200/50 bg-white/20 backdrop-blur-xl"
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-24 space-y-10">
              
              <header className="mb-14">
                <div className="flex items-center gap-5 mb-6">
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="h-16 w-16 bg-zinc-900 rounded-[24px] flex items-center justify-center shadow-2xl shadow-black/20"
                  >
                    <Plane className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 leading-none mb-2">Expedition.SG</h1>
                    <p className="text-[10px] font-bold text-zinc-400 tracking-[0.25em] uppercase">Yudha Ghosh • Protagonist</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="px-4 py-2 bg-white rounded-full border border-zinc-100 shadow-sm">
                    <span className="text-[10px] font-bold text-zinc-500 tracking-wider">JUNE 2026</span>
                  </div>
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm">
                    <span className="text-[10px] font-bold tracking-wider uppercase">Active</span>
                  </div>
                </div>
              </header>

              <GlassContainer className="grid grid-cols-3 gap-8 py-6">
                <ClockWidget label="IST" tz="Asia/Kolkata" />
                <ClockWidget label="SGT" tz="Asia/Singapore" />
                <ClockWidget label="GST" tz="Asia/Dubai" />
              </GlassContainer>

              <section>
                <SectionTitle icon={Globe}>Leg Navigator</SectionTitle>
                <GlassContainer>
                  {FLIGHT_DATA.map((leg, i) => (
                    <FlightLegRow key={leg.id} leg={leg} isLast={i === FLIGHT_DATA.length - 1} />
                  ))}
                </GlassContainer>
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <SectionTitle icon={Package}>Hub Protocol</SectionTitle>
                  <div className="flex bg-zinc-100 p-1 rounded-xl">
                    {(['logistics', 'health'] as const).map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 text-[9px] font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <GlassContainer className="space-y-6">
                  <LayoutGroup>
                    {checklist.filter(i => i.category.toLowerCase() === activeTab).map((item) => (
                      <motion.div 
                        layout
                        key={item.id} 
                        onClick={() => toggleItem(item.id)}
                        className="flex items-start gap-4 cursor-pointer group"
                      >
                        <div className={`mt-0.5 h-5 w-5 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${item.checked ? 'bg-zinc-900 border-zinc-900' : 'bg-white/50 border-zinc-200 group-hover:border-zinc-400'}`}>
                          {item.checked && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium transition-all ${item.checked ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
                            {item.text}
                          </p>
                          {item.note && <p className="text-[10px] text-zinc-400 mt-1 font-medium tracking-wide uppercase">{item.note}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </LayoutGroup>
                  
                  {activeTab === 'logistics' && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="pt-6 mt-6 border-t border-zinc-100"
                    >
                      <div className="bg-zinc-900 rounded-[24px] p-6 text-white shadow-xl">
                        <div className="flex items-center gap-2 mb-4">
                           <MapPin className="h-4 w-4 text-blue-400" />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Base Operations</span>
                        </div>
                        <p className="text-base font-bold mb-1">10 Hyderabad Road</p>
                        <p className="text-xs text-zinc-400 mb-6">Singapore 119579</p>
                        
                        <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                           <div className="flex items-center gap-2 mb-3">
                              <Utensils className="h-3.5 w-3.5 text-zinc-300" />
                              <span className="text-[9px] font-bold uppercase tracking-widest">Protocol</span>
                           </div>
                           <ul className="text-[10px] text-zinc-300 space-y-2.5 font-medium uppercase tracking-wide">
                              <li>• Whey Intake (45g)</li>
                              <li>• Microwavable Eggs</li>
                              <li>• Greek Yogurt Base</li>
                           </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </GlassContainer>
              </section>

              <section>
                <SectionTitle icon={Coins}>Forex Engine</SectionTitle>
                <GlassContainer>
                  <ForexWidget />
                </GlassContainer>
              </section>

              <section>
                <SectionTitle icon={Thermometer}>Weather Deck</SectionTitle>
                <GlassContainer className="space-y-3">
                  {CITIES.map(city => <WeatherWidget key={city.code} city={city} />)}
                </GlassContainer>
              </section>

              <footer className="pt-12 pb-10 border-t border-zinc-100 flex items-center justify-between">
                 <div className="flex items-center gap-3 text-zinc-300">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Protocol v5.0 • Elite Build</span>
                 </div>
                 <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
              </footer>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Map Viewport */}
      <main className={`h-full relative overflow-hidden transition-all duration-700 ease-[0.16, 1, 0.3, 1] ${sidebarOpen ? 'w-[calc(100%-450px)] hidden sm:block' : 'w-full block'}`}>
        <MapContainer 
          bounds={bounds} 
          zoomControl={false}
          className="h-full w-full"
          tap={false}
        >
          {/* CartoDB Positron - Premium Elite Styling */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          <Polyline 
            positions={polyline} 
            color="#3b82f6" 
            weight={2} 
            opacity={0.3} 
            dashArray="8, 12"
          />

          {CITIES.map((city) => (
            <Marker 
              key={city.code} 
              position={[city.lat, city.lon]}
              icon={city.code === 'SIN' ? MAP_ICON_ACTIVE : MAP_ICON}
            >
              <Popup className="premium-popup">
                <div className="p-6 min-w-[240px] font-sans">
                  <div className="flex justify-between items-center mb-6">
                     <span className="text-3xl font-bold text-zinc-900 tabular-nums tracking-tighter">{city.code}</span>
                     <div className="h-10 w-10 bg-zinc-900 rounded-2xl flex items-center justify-center">
                        <Navigation2 className="h-4 w-4 text-white fill-current" />
                     </div>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">{city.name}</p>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Time</span>
                        <span className="text-xs font-bold text-zinc-900 font-mono">
                           {new Date().toLocaleTimeString('en-US', { timeZone: city.tz, hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Optimal</span>
                     </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          <MapController bounds={bounds} />
        </MapContainer>

        {/* Floating Core Status */}
        <div className="absolute top-8 right-8 z-[100] hidden xs:block">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="backdrop-blur-xl bg-zinc-900/90 p-6 rounded-[28px] shadow-2xl max-w-xs border border-white/10"
           >
              <div className="flex items-center gap-3 mb-3">
                 <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                 <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Expedition Core</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium leading-relaxed uppercase tracking-wider">
                 Satellite Uplink Active. Transitioning to Singapore Student Visa Protocol. Ready for BOM transit.
              </p>
           </motion.div>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-8 right-8 z-[100] flex gap-4">
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="h-14 w-14 bg-white/80 backdrop-blur-xl text-zinc-900 rounded-2xl shadow-xl flex items-center justify-center border border-white"
           >
              <Info className="h-6 w-6" />
           </motion.button>
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="bg-zinc-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10"
           >
              <Navigation2 className="h-4.5 w-4.5 fill-current" />
              <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Telemetry</span>
           </motion.button>
        </div>
      </main>

      <style>{`
        @import url('https://rsms.me/inter/inter.css');
        
        :root { font-family: 'Inter', sans-serif; }
        @supports (font-variation-settings: normal) {
          :root { font-family: 'Inter var', sans-serif; }
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; }
        
        .leaflet-popup-content-wrapper { 
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          border-radius: 28px !important; 
          border: 1px solid white !important;
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.1) !important; 
          padding: 0 !important; 
        }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip { display: none !important; }
        
        .leaflet-container {
          background: #f8fafc !important;
        }

        /* Geist Mono Simulation for tabular data */
        .font-mono {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          letter-spacing: -0.02em;
        }

        /* Fix for smaller mobile screens */
        @media (max-width: 640px) {
          aside {
            width: 100% !important;
            max-width: 100vw !important;
          }
        }
      `}</style>

    </div>
  );
}
