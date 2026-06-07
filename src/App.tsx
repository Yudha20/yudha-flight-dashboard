import React, { useState, useEffect } from 'react';
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
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

// --- Data ---
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
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon: any }) => (
  <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-5 px-1">
    <div className="p-1.5 bg-white/50 rounded-lg border border-white/40 shadow-sm">
      <Icon className="h-3 w-3 text-zinc-600" />
    </div>
    {children}
  </h2>
);

const FlightLegRow = ({ leg, isLast }: { leg: FlightLeg, isLast: boolean }) => (
  <div className="relative pl-8 pb-10 last:pb-0">
    {!isLast && <div className="absolute left-[11px] top-8 bottom-0 w-[1px] bg-gradient-to-b from-zinc-300 to-transparent" />}
    <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full bg-white/80 border border-white/40 shadow-sm z-10 flex items-center justify-center backdrop-blur-sm">
       <div className="h-2 w-2 bg-zinc-800 rounded-full" />
    </div>
    
    <div className="flex justify-between items-start mb-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base font-bold text-zinc-900 tracking-tight">{leg.from}</span>
          <ArrowRightLeft className="h-3 w-3 text-zinc-400" />
          <span className="text-base font-bold text-zinc-900 tracking-tight">{leg.to}</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{leg.airline}</span>
           <span className="px-2 py-0.5 bg-zinc-900/5 rounded-md text-[10px] font-mono font-bold text-zinc-600 border border-zinc-900/5">{leg.flightNo}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="block text-sm font-bold text-zinc-900 tabular-nums">{leg.depTime}</span>
        <span className="block text-[10px] font-medium text-zinc-500 mt-0.5 uppercase tracking-wide">{leg.depDate}</span>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3 mt-4">
       <div className="bg-white/40 rounded-2xl p-3 border border-white/60">
          <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest mb-1">Terminal</p>
          <p className="text-xs font-bold text-zinc-800">{leg.terminal}</p>
       </div>
       <div className="bg-white/40 rounded-2xl p-3 border border-white/60">
          <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest mb-1">Gate</p>
          <p className="text-xs font-bold text-zinc-800">{leg.gate}</p>
       </div>
       <div className="bg-white/40 rounded-2xl p-3 border border-white/60">
          <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest mb-1">Baggage</p>
          <p className="text-xs font-bold text-zinc-800">{leg.baggage}</p>
       </div>
    </div>

    {leg.layover && (
      <div className="mt-4 flex items-center gap-2.5 px-4 py-2.5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
         <Clock className="h-3.5 w-3.5 text-blue-600" />
         <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Layover: {leg.layover}</span>
      </div>
    )}
  </div>
);

const ClockWidget = ({ label, tz }: { label: string, tz: string }) => {
  const time = useLiveTime(tz);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
      <span className="text-lg font-bold text-zinc-900 tabular-nums leading-none">{time}</span>
    </div>
  );
};

const WeatherWidget = ({ city }: { city: typeof CITIES[0] }) => (
  <div className="flex items-center justify-between p-3 bg-white/30 rounded-2xl border border-white/40">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
        <CloudSun className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-zinc-800">{city.name}</p>
        <p className="text-[9px] text-zinc-500 font-medium">Clear Sky</p>
      </div>
    </div>
    <span className="text-xs font-bold text-zinc-900">28°C</span>
  </div>
);

const ForexWidget = () => {
  const [val, setVal] = useState('1000');
  const rates = { SGD: 0.016, AED: 0.044, SGDAED: 2.75 };
  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Input Base (INR)</label>
        <input 
          type="number" 
          value={val} 
          onChange={(e) => setVal(e.target.value)}
          className="w-full bg-white/40 border border-white/60 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-zinc-400"
        />
        <div className="absolute right-4 top-[38px] text-[10px] font-bold text-zinc-400 tracking-widest">₹</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/40 rounded-2xl p-4 border border-white/60">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Singapore (S$)</p>
          <p className="text-sm font-bold text-zinc-900 tabular-nums">{(Number(val) * rates.SGD).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
        <div className="bg-white/40 rounded-2xl p-4 border border-white/60">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Dubai (AED)</p>
          <p className="text-sm font-bold text-zinc-900 tabular-nums">{(Number(val) * rates.AED).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
      </div>
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
  const bounds = L.latLngBounds(polyline);

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] overflow-hidden font-sans text-zinc-900 selection:bg-blue-500 selection:text-white">
      
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-purple-200/30 rounded-full blur-[130px]" />
        <div className="absolute top-[20%] right-[15%] w-[30%] h-[30%] bg-emerald-200/20 rounded-full blur-[110px]" />
      </div>

      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-8 left-8 z-[100] h-12 w-12 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-500 group"
      >
        {sidebarOpen ? <X className="h-5 w-5 text-zinc-600 group-hover:rotate-90 transition-transform duration-500" /> : <Menu className="h-5 w-5 text-zinc-600" />}
      </button>

      {/* Left Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside 
            initial={{ x: -450, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -450, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="w-[450px] h-full relative z-50 flex flex-col border-r border-white/20"
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-24 space-y-8">
              
              <header className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 bg-gradient-to-br from-zinc-800 to-black rounded-[22px] flex items-center justify-center shadow-2xl shadow-black/20">
                    <Plane className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight leading-none text-zinc-900">Expedition.SG</h1>
                    <p className="text-[10px] font-bold text-zinc-400 tracking-[0.3em] uppercase mt-1.5">Yudha Ghosh • Student Pass</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-white/50 backdrop-blur-md rounded-full border border-white/60 shadow-sm">
                    <span className="text-[10px] font-bold text-zinc-500 tracking-wider">JUN 2026</span>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 backdrop-blur-md rounded-full border border-emerald-500/20 shadow-sm">
                    <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">Active Mission</span>
                  </div>
                </div>
              </header>

              {/* Live Clocks Grid */}
              <GlassContainer className="grid grid-cols-3 gap-6 py-5 px-6">
                <ClockWidget label="IST (India)" tz="Asia/Kolkata" />
                <ClockWidget label="SGT (SG)" tz="Asia/Singapore" />
                <ClockWidget label="GST (DXB)" tz="Asia/Dubai" />
              </GlassContainer>

              {/* Flight Timeline */}
              <section>
                <SectionTitle icon={Globe}>Leg Navigator</SectionTitle>
                <GlassContainer>
                  {FLIGHT_DATA.map((leg, i) => (
                    <FlightLegRow key={leg.id} leg={leg} isLast={i === FLIGHT_DATA.length - 1} />
                  ))}
                </GlassContainer>
              </section>

              {/* Hub Widgets */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <SectionTitle icon={Package}>System Hub</SectionTitle>
                  <div className="flex bg-white/40 backdrop-blur-md p-1 rounded-2xl border border-white/60 shadow-sm">
                    {['logistics', 'health'].map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-5 py-2 text-[10px] font-black rounded-xl transition-all duration-500 ${activeTab === tab ? 'bg-white shadow-xl text-zinc-900 scale-105' : 'text-zinc-400 hover:text-zinc-600'}`}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <GlassContainer className="space-y-6">
                  {checklist.filter(i => i.category.toLowerCase() === activeTab).map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => toggleItem(item.id)}
                      className="flex items-start gap-4 cursor-pointer group"
                    >
                      <div className={`mt-0.5 h-5 w-5 rounded-lg border-[1.5px] transition-all duration-500 flex items-center justify-center ${item.checked ? 'bg-zinc-900 border-zinc-900 shadow-lg shadow-black/10' : 'bg-white border-zinc-200 group-hover:border-zinc-400'}`}>
                        {item.checked && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold transition-all duration-500 ${item.checked ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
                          {item.text}
                        </p>
                        {item.note && <p className="text-[10px] text-zinc-400 mt-1 font-medium tracking-wide uppercase">{item.note}</p>}
                      </div>
                    </div>
                  ))}
                  
                  {activeTab === 'logistics' && (
                    <div className="pt-6 mt-6 border-t border-white/60">
                      <div className="flex items-center gap-2 mb-4">
                        <Building2 className="h-4 w-4 text-zinc-400" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Base Operations</span>
                      </div>
                      <div className="bg-white/40 rounded-3xl p-5 border border-white/60 shadow-sm">
                        <p className="text-sm font-black text-zinc-900 mb-1">10 Hyderabad Road, SIN</p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 mb-5 font-bold uppercase tracking-wider">
                           <MapPin className="h-3 w-3" />
                           <span>Singapore 119579</span>
                        </div>
                        <div className="space-y-3">
                           <div className="flex items-center gap-3 text-[10px] text-amber-700 bg-amber-500/10 px-4 py-3 rounded-2xl border border-amber-500/10">
                              <AlertCircle className="h-4 w-4" />
                              <span className="font-black uppercase tracking-wider leading-tight">Critical: Microwave Prep Only</span>
                           </div>
                           <div className="bg-white/60 border border-white/80 rounded-2xl p-4 shadow-sm">
                              <div className="flex items-center gap-2 mb-3">
                                 <Utensils className="h-3.5 w-3.5 text-zinc-900" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">High-Protein Protocol</span>
                              </div>
                              <ul className="text-[11px] text-zinc-600 space-y-2.5 font-bold">
                                 <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-zinc-300" />Oatmeal + 2 scoops Whey (45g)</li>
                                 <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-zinc-300" />Microwavable Egg Whites (25g)</li>
                                 <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-zinc-300" />Greek Yogurt + Almonds (20g)</li>
                                 <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-zinc-300" />Pre-cooked Chicken Strips (35g)</li>
                              </ul>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </GlassContainer>
              </section>

              {/* Financial Desk */}
              <section>
                <SectionTitle icon={CreditCard}>Financial Desk</SectionTitle>
                <div className="space-y-4">
                  <GlassContainer className="bg-gradient-to-br from-zinc-800 to-black text-white border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[120%] bg-white/5 skew-x-12" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-10">
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mb-2">{LOAN_DATA.bank}</p>
                            <p className="text-3xl font-black tracking-tighter tabular-nums">{LOAN_DATA.amount}</p>
                          </div>
                          <span className="text-[9px] font-black bg-emerald-500 text-white px-3 py-1.5 rounded-full uppercase tracking-widest">{LOAN_DATA.status}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Portfolio ID</p>
                          <p className="text-xs font-mono font-bold text-zinc-200">{LOAN_DATA.id}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Relationship Mgr</p>
                          <p className="text-xs font-bold text-zinc-200">{LOAN_DATA.contact}</p>
                        </div>
                      </div>
                    </div>
                  </GlassContainer>
                  <GlassContainer>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-zinc-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Forex Engine</span>
                      </div>
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    </div>
                    <ForexWidget />
                  </GlassContainer>
                </div>
              </section>

              {/* Weather Deck */}
              <section>
                <SectionTitle icon={Thermometer}>Global Weather</SectionTitle>
                <GlassContainer className="space-y-3">
                  {CITIES.map(city => <WeatherWidget key={city.code} city={city} />)}
                </GlassContainer>
              </section>

              <footer className="pt-12 pb-8 border-t border-white/20 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-zinc-400">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Protocol v3.0 • Liquid Glass</span>
                 </div>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
              </footer>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Viewport */}
      <main className={`h-full relative overflow-hidden transition-all duration-700 ease-[0.16, 1, 0.3, 1] ${sidebarOpen ? 'w-[calc(100%-450px)]' : 'w-full'}`}>
        <MapContainer 
          bounds={bounds} 
          zoomControl={false}
          className="h-full w-full"
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; Esri'
          />
          <Polyline 
            positions={polyline} 
            color="white" 
            weight={3} 
            opacity={0.6} 
            dashArray="1, 12"
            lineCap="round"
          />
          {CITIES.map((city) => (
            <Marker key={city.code} position={[city.lat, city.lon]}>
              <Popup className="premium-popup">
                <div className="p-4 min-w-[180px]">
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-xl font-black text-zinc-900 tabular-nums leading-none">{city.code}</span>
                     <div className="p-2 bg-zinc-900 rounded-xl shadow-lg">
                        <Navigation2 className="h-3.5 w-3.5 text-white fill-current" />
                     </div>
                  </div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">{city.name}</p>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Clock className="h-3.5 w-3.5 text-zinc-400" />
                           <span className="text-[10px] font-bold text-zinc-500">LOCAL</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-900 tabular-nums">
                           {new Date().toLocaleTimeString('en-US', { timeZone: city.tz, hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <CloudSun className="h-3.5 w-3.5 text-zinc-400" />
                           <span className="text-[10px] font-bold text-zinc-500">TEMP</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-900">28°C</span>
                     </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          <MapController bounds={bounds} />
        </MapContainer>

        {/* Floating Status Card */}
        <div className="absolute top-8 right-8 z-[100] flex flex-col gap-4">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="backdrop-blur-2xl bg-white/70 border border-white/60 p-5 rounded-[28px] shadow-2xl max-w-sm border-l-[6px] border-l-blue-500"
           >
              <div className="flex items-center gap-2.5 mb-2.5">
                 <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                 <span className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.2em]">Expedition Core</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-bold leading-relaxed uppercase tracking-wide">
                 Satellite Uplink Active. Transitioning to Singapore Student Visa Protocol. Ready for BOM transit.
              </p>
           </motion.div>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-8 right-8 z-[100] flex gap-3">
           <button className="h-12 w-12 bg-white/80 backdrop-blur-xl text-zinc-900 rounded-2xl shadow-2xl flex items-center justify-center border border-white/60 hover:scale-110 transition-all">
              <Info className="h-5 w-5" />
           </button>
           <button className="bg-zinc-900 text-white px-7 py-3.5 rounded-[20px] shadow-2xl flex items-center gap-3.5 hover:scale-105 active:scale-95 transition-all group">
              <Navigation2 className="h-4 w-4 fill-current group-hover:rotate-12 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Telemetry</span>
           </button>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
        
        .leaflet-popup-content-wrapper { 
          background: rgba(255, 255, 255, 0.7) !important;
          backdrop-filter: blur(20px) !important;
          border-radius: 28px !important; 
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1) !important; 
          padding: 0 !important; 
          overflow: hidden; 
        }
        .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .leaflet-popup-tip { display: none !important; }
        
        .leaflet-container {
          filter: contrast(1.1) saturate(1.2);
        }
      `}</style>

    </div>
  );
}
