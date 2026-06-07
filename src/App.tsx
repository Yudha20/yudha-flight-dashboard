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
  Info
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
    baggage: '15kg + 7kg',
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
    layover: '3h 10m',
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
    baggage: '30kg + 7kg',
    status: 'Scheduled' 
  },
];

const CITIES = [
  { name: 'Ahmedabad', code: 'AMD', lat: 23.0225, lon: 72.5714, tz: 'Asia/Kolkata' },
  { name: 'Mumbai', code: 'BOM', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
  { name: 'Bengaluru', code: 'BLR', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
  { name: 'Singapore', code: 'SIN', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
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

// --- UI Components ---

const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon: any }) => (
  <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4 px-1">
    <Icon className="h-3.5 w-3.5 text-zinc-400" />
    {children}
  </h2>
);

const SidebarCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300 p-5 ${className}`}>
    {children}
  </div>
);

const FlightLegRow = ({ leg, isLast }: { leg: FlightLeg, isLast: boolean }) => (
  <div className="relative pl-6 pb-8 last:pb-0">
    {!isLast && <div className="absolute left-[7px] top-6 bottom-0 w-[2px] bg-zinc-100" />}
    <div className="absolute left-0 top-1.5 h-[16px] w-[16px] rounded-full bg-white border-2 border-zinc-900 z-10 flex items-center justify-center">
       <div className="h-1.5 w-1.5 bg-zinc-900 rounded-full" />
    </div>
    
    <div className="flex justify-between items-start mb-2">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-bold text-zinc-900">{leg.from}</span>
          <ChevronRight className="h-3 w-3 text-zinc-400" />
          <span className="text-sm font-bold text-zinc-900">{leg.to}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500">
           <span className="text-zinc-900 font-bold uppercase">{leg.airline}</span>
           <span className="px-1.5 py-0.5 bg-zinc-100 rounded text-zinc-600 font-mono">{leg.flightNo}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="block text-xs font-bold text-zinc-900">{leg.depTime}</span>
        <span className="block text-[10px] text-zinc-500">{leg.depDate}</span>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2 mt-3">
       <div className="bg-zinc-50 rounded-lg p-2 border border-zinc-100">
          <p className="text-[9px] text-zinc-400 uppercase font-bold mb-0.5">Terminal</p>
          <p className="text-xs font-bold text-zinc-700">{leg.terminal}</p>
       </div>
       <div className="bg-zinc-50 rounded-lg p-2 border border-zinc-100">
          <p className="text-[9px] text-zinc-400 uppercase font-bold mb-0.5">Gate</p>
          <p className="text-xs font-bold text-zinc-700">{leg.gate}</p>
       </div>
       <div className="bg-zinc-50 rounded-lg p-2 border border-zinc-100">
          <p className="text-[9px] text-zinc-400 uppercase font-bold mb-0.5">Baggage</p>
          <p className="text-xs font-bold text-zinc-700">{leg.baggage}</p>
       </div>
    </div>

    {leg.layover && (
      <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-amber-50/50 border border-amber-100 rounded-lg">
         <Clock className="h-3 w-3 text-amber-600" />
         <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">Layover: {leg.layover}</span>
      </div>
    )}
  </div>
);

const CurrencyWidget = () => {
  const [val, setVal] = useState('1000');
  const rates = { SGD: 0.016, AED: 0.044 };
  return (
    <div className="bg-zinc-900 rounded-xl p-5 text-white shadow-lg">
       <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
             <Calculator className="h-4 w-4 text-zinc-400" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Forex Rapid-Calc</span>
          </div>
          <Wallet className="h-4 w-4 text-zinc-500" />
       </div>
       <div className="space-y-4">
          <div>
             <label className="block text-[9px] font-black text-zinc-500 uppercase mb-1.5 ml-1">Indian Rupee (INR)</label>
             <input 
               type="number" 
               value={val} 
               onChange={(e) => setVal(e.target.value)}
               className="w-full bg-zinc-800 border-none rounded-lg p-2.5 text-sm font-mono focus:ring-1 focus:ring-zinc-600 outline-none transition-all"
             />
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Singapore $</p>
                <p className="text-sm font-mono font-bold">{(Number(val) * rates.SGD).toFixed(2)}</p>
             </div>
             <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">UAE Dirham</p>
                <p className="text-sm font-mono font-bold">{(Number(val) * rates.AED).toFixed(2)}</p>
             </div>
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

  const toggleItem = (id: string) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const polyline: [number, number][] = CITIES.map(c => [c.lat, c.lon]);
  const bounds = L.latLngBounds(polyline);

  return (
    <div className="flex h-screen w-screen bg-zinc-50 overflow-hidden font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      
      {/* Left Sidebar (38%) */}
      <aside className="w-[38%] h-full bg-white border-r border-zinc-200 overflow-y-auto custom-scrollbar flex flex-col z-20 shadow-2xl">
        <header className="p-8 pb-6 bg-white sticky top-0 z-30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-200">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Expedition.SG</h1>
                <p className="text-[10px] font-bold text-zinc-400 tracking-[0.25em] uppercase mt-1">Yudha Ghosh • Dashboard</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-zinc-100 rounded-full border border-zinc-200">
               <span className="text-[10px] font-bold text-zinc-600">JUN 2026</span>
            </div>
          </div>
          <div className="h-px bg-zinc-100 w-full" />
        </header>

        <div className="p-8 pt-0 space-y-12 flex-1">
          {/* Flight Legs Timeline */}
          <section>
            <SectionTitle icon={Globe}>Flight Legs Timeline</SectionTitle>
            <SidebarCard>
              {FLIGHT_DATA.map((leg, i) => (
                <FlightLegRow key={leg.id} leg={leg} isLast={i === FLIGHT_DATA.length - 1} />
              ))}
            </SidebarCard>
          </section>

          {/* Logistics & Health Hub */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle icon={Package}>Hub Navigator</SectionTitle>
              <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200 mb-4">
                <button 
                  onClick={() => setActiveTab('logistics')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeTab === 'logistics' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
                >
                  LOGISTICS
                </button>
                <button 
                  onClick={() => setActiveTab('health')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeTab === 'health' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
                >
                  HEALTH
                </button>
              </div>
            </div>

            <SidebarCard className="space-y-4">
              {checklist.filter(i => i.category.toLowerCase() === activeTab).map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => toggleItem(item.id)}
                  className="flex items-start gap-4 cursor-pointer group p-1"
                >
                  <div className={`mt-0.5 h-4 w-4 rounded-md border-2 transition-all flex items-center justify-center ${item.checked ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-200 group-hover:border-zinc-400'}`}>
                    {item.checked && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold transition-all ${item.checked ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
                      {item.text}
                    </p>
                    {item.note && <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">{item.note}</p>}
                  </div>
                  {item.id === 'l2' && (
                    <div className="text-[9px] font-bold text-zinc-400 bg-zinc-50 px-2 py-0.5 border border-zinc-200 rounded">S$25-35</div>
                  )}
                </div>
              ))}
              
              {activeTab === 'logistics' && (
                <div className="pt-4 mt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Hostel Navigator</span>
                  </div>
                  <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200/60">
                    <p className="text-xs font-bold text-zinc-900 mb-1">10 Hyderabad Road, SIN</p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 mb-3">
                       <MapPin className="h-3 w-3" />
                       <span>Singapore 119579</span>
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                          <AlertCircle className="h-3 w-3" />
                          <span className="font-bold">STOVES PROHIBITED: MICROWAVE ONLY</span>
                       </div>
                       <div className="bg-white border border-zinc-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                             <Utensils className="h-3 w-3 text-zinc-900" />
                             <span className="text-[10px] font-black uppercase text-zinc-900">Protein Cheat Sheet</span>
                          </div>
                          <ul className="text-[10px] text-zinc-600 space-y-1 font-medium list-disc ml-3">
                             <li>Oatmeal + 2 scoops Whey (45g)</li>
                             <li>Microwavable Egg Whites (25g)</li>
                             <li>Greek Yogurt + Almonds (20g)</li>
                             <li>Pre-cooked Chicken Strips (35g)</li>
                          </ul>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </SidebarCard>
          </section>

          {/* Financial Desk */}
          <section>
            <SectionTitle icon={CreditCard}>Financial Desk</SectionTitle>
            <div className="space-y-4">
              <SidebarCard className="bg-zinc-50 border-zinc-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                   <Building2 className="h-12 w-12" />
                </div>
                <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{LOAN_DATA.bank}</p>
                      <p className="text-2xl font-black text-zinc-900 tracking-tighter">{LOAN_DATA.amount}</p>
                    </div>
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full uppercase border border-emerald-200">{LOAN_DATA.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Loan ID</p>
                    <p className="text-xs font-mono font-bold text-zinc-700">{LOAN_DATA.id}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Contact</p>
                    <p className="text-xs font-bold text-zinc-700">{LOAN_DATA.contact}</p>
                  </div>
                </div>
              </SidebarCard>
              <CurrencyWidget />
            </div>
          </section>
        </div>

        <footer className="p-8 border-t border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
           <div className="flex items-center gap-2 text-zinc-400">
              <FileText className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Restricted Access • Flight Ops v2.1</span>
           </div>
           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </footer>
      </aside>

      {/* Right Map (62%) */}
      <main className="w-[62%] h-full relative overflow-hidden">
        <MapContainer 
          bounds={bounds} 
          zoomControl={false}
          className="h-full w-full grayscale-[0.1] contrast-[1.05]"
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; Esri'
          />
          <Polyline 
            positions={polyline} 
            color="#09090b" 
            weight={2.5} 
            opacity={0.8} 
            dashArray="10, 15"
          />
          {CITIES.map((city) => (
            <Marker key={city.code} position={[city.lat, city.lon]}>
              <Popup className="premium-popup">
                <div className="p-3 font-sans min-w-[160px]">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-lg font-black text-zinc-900 leading-none">{city.code}</span>
                     <div className="p-1 bg-zinc-900 rounded-md">
                        <Navigation2 className="h-3 w-3 text-white fill-current" />
                     </div>
                  </div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">{city.name}</p>
                  <div className="space-y-2.5">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Clock className="h-3 w-3 text-zinc-400" />
                           <span className="text-[10px] font-bold text-zinc-600">LOCAL TIME</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-zinc-900">
                           {new Date().toLocaleTimeString('en-US', { timeZone: city.tz, hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <CloudSun className="h-3 w-3 text-zinc-400" />
                           <span className="text-[10px] font-bold text-zinc-600">WEATHER</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-900">28°C / Clear</span>
                     </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          <MapController bounds={bounds} />
        </MapContainer>

        {/* Floating Controls */}
        <div className="absolute top-8 right-8 z-[1000] flex flex-col gap-3">
           <div className="bg-white/90 backdrop-blur-md border border-zinc-200 p-4 rounded-2xl shadow-2xl max-w-xs border-l-4 border-l-zinc-900">
              <div className="flex items-center gap-2 mb-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em]">Expedition Active</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                 Real-time transit monitoring active. Singapore Student Pass formalities pending entry.
              </p>
           </div>
        </div>

        <div className="absolute bottom-8 right-8 z-[1000] flex gap-2">
           <button className="bg-white text-zinc-900 h-10 w-10 rounded-xl shadow-xl flex items-center justify-center border border-zinc-200 hover:bg-zinc-50 transition-all">
              <Info className="h-4 w-4" />
           </button>
           <button className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl shadow-xl flex items-center gap-3 hover:scale-105 transition-all">
              <Navigation2 className="h-4 w-4 fill-current" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Live Status</span>
           </button>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d4d4d8; }
        
        .leaflet-popup-content-wrapper { border-radius: 16px; border: 1px solid #e4e4e7; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); padding: 0; overflow: hidden; }
        .leaflet-popup-content { margin: 0; width: auto !important; }
        .leaflet-popup-tip { display: none; }
        .premium-popup .leaflet-popup-content-wrapper { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); }
      `}</style>

    </div>
  );
}
