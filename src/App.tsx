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
  FileText
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
  status: 'Scheduled' | 'On Time' | 'Landed';
}

// --- Data ---
const FLIGHT_DATA: FlightLeg[] = [
  { id: '1', airline: 'Akasa Air', flightNo: 'QP 1102', from: 'AMD', to: 'BOM', depDate: 'Jun 17', depTime: '07:55', arrTime: '09:20', terminal: 'T1', gate: 'B4', pnr: '8H49TF', status: 'Scheduled' },
  { id: '2', airline: 'Air India', flightNo: 'AI 2851', from: 'BOM', to: 'BLR', depDate: 'Jun 20', depTime: '11:10', arrTime: '12:55', terminal: 'T2', gate: 'D13', pnr: '8H49TF', status: 'Scheduled' },
  { id: '3', airline: 'Singapore Airlines', flightNo: 'SQ 803', from: 'BLR', to: 'SIN', depDate: 'Jun 20', depTime: '16:05', arrTime: '22:20', terminal: 'T2', gate: 'A7', pnr: '8H49TF', status: 'Scheduled' },
];

const CITIES = [
  { name: 'Ahmedabad', code: 'AMD', lat: 23.0225, lon: 72.5714 },
  { name: 'Mumbai', code: 'BOM', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru', code: 'BLR', lat: 12.9716, lon: 77.5946 },
  { name: 'Singapore', code: 'SIN', lat: 1.3521, lon: 103.8198 },
];

const CHECKLIST = [
  { id: 'l1', text: 'Grab App Setup (S$25-35)', category: 'Logistics', checked: false },
  { id: 'l2', text: 'Submit SG Arrival Card (SGAC)', category: 'Logistics', checked: false },
  { id: 'l3', text: 'Academic Docs Checklist', category: 'Logistics', checked: false },
  { id: 'l4', text: 'Student Pass Formalities', category: 'Logistics', checked: false },
];

const LOAN_DATA = {
  bank: 'HDFC Bank',
  amount: '₹45,00,000',
  status: 'Disbursed',
  emiDate: '5th of every month',
  repaymentPeriod: '15 Years'
};

// --- UI Components ---

const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon: any }) => (
  <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4 px-1">
    <Icon className="h-3.5 w-3.5 text-zinc-300" />
    {children}
  </h2>
);

const SidebarCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border border-zinc-200 rounded-xl shadow-sm p-4 ${className}`}>
    {children}
  </div>
);

const FlightLegRow = ({ leg }: { leg: FlightLeg }) => (
  <div className="group relative pl-4 border-l-2 border-zinc-100 py-4 first:pt-0 last:pb-0 hover:border-zinc-300 transition-colors">
    <div className="absolute -left-[9px] top-5 h-4 w-4 rounded-full bg-white border-2 border-zinc-200 group-hover:border-zinc-400 transition-colors" />
    <div className="flex justify-between items-start mb-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-zinc-900">{leg.from}</span>
        <ChevronRight className="h-3 w-3 text-zinc-400" />
        <span className="text-sm font-bold text-zinc-900">{leg.to}</span>
      </div>
      <span className="text-[10px] font-mono font-bold text-zinc-400">{leg.flightNo}</span>
    </div>
    <div className="flex justify-between text-[11px] font-medium text-zinc-500">
      <span>{leg.depTime} — {leg.arrTime}</span>
      <span>{leg.depDate}</span>
    </div>
  </div>
);

const MapController = ({ bounds }: { bounds: L.LatLngBoundsExpression }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [bounds, map]);
  return null;
};

// --- Main App ---

export default function App() {
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('travel_checklist_v2');
    return saved ? JSON.parse(saved) : CHECKLIST;
  });

  useEffect(() => {
    localStorage.setItem('travel_checklist_v2', JSON.stringify(checklist));
  }, [checklist]);

  const toggleItem = (id: string) => {
    setChecklist(checklist.map((item: any) => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const polyline: [number, number][] = CITIES.map(c => [c.lat, c.lon]);
  const bounds = L.latLngBounds(polyline);

  return (
    <div className="flex h-screen w-screen bg-zinc-50 overflow-hidden font-sans text-zinc-900">
      
      {/* Left Sidebar (35%) */}
      <aside className="w-[35%] h-full bg-white border-r border-zinc-200 overflow-y-auto custom-scrollbar flex flex-col">
        <header className="p-8 border-b border-zinc-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-900 rounded-lg">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight uppercase">Expedition.SG</h1>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase">Operations Dashboard</p>
        </header>

        <div className="p-8 space-y-10 flex-1">
          {/* Flight Legs */}
          <section>
            <SectionTitle icon={Globe}>Flight Itinerary</SectionTitle>
            <SidebarCard className="space-y-1">
              {FLIGHT_DATA.map((leg) => (
                <FlightLegRow key={leg.id} leg={leg} />
              ))}
            </SidebarCard>
          </section>

          {/* Logistics */}
          <section>
            <SectionTitle icon={Package}>Logistics Checklist</SectionTitle>
            <SidebarCard className="space-y-3">
              {checklist.map((item: any) => (
                <div 
                  key={item.id} 
                  onClick={() => toggleItem(item.id)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className={`h-4 w-4 rounded border transition-all flex items-center justify-center ${item.checked ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-200 group-hover:border-zinc-400'}`}>
                    {item.checked && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <span className={`text-xs font-medium transition-all ${item.checked ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </SidebarCard>
          </section>

          {/* Hotel & Arrival */}
          <section className="grid grid-cols-1 gap-4">
             <div>
                <SectionTitle icon={Building2}>Arrival Details</SectionTitle>
                <SidebarCard>
                   <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Primary Residence</p>
                   <p className="text-xs font-bold text-zinc-900 mb-1">Standard Residency, SIN</p>
                   <p className="text-[11px] text-zinc-500 leading-relaxed">Booking Ref: #SG-882910<br/>Check-in: Jun 21, 2026</p>
                </SidebarCard>
             </div>
          </section>

          {/* Loan Info */}
          <section>
            <SectionTitle icon={CreditCard}>Financial Overview</SectionTitle>
            <SidebarCard className="bg-zinc-50 border-dashed border-zinc-300">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{LOAN_DATA.bank}</p>
                    <p className="text-lg font-bold text-zinc-900">{LOAN_DATA.amount}</p>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">{LOAN_DATA.status}</span>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                     <span className="text-zinc-500">EMI Date</span>
                     <span className="font-bold text-zinc-700">{LOAN_DATA.emiDate}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                     <span className="text-zinc-500">Tenure</span>
                     <span className="font-bold text-zinc-700">{LOAN_DATA.repaymentPeriod}</span>
                  </div>
               </div>
            </SidebarCard>
          </section>
        </div>

        <footer className="p-8 border-t border-zinc-100 bg-zinc-50/50">
           <div className="flex items-center gap-2 text-zinc-400">
              <FileText className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Restricted Access • Flight Ops v2.0</span>
           </div>
        </footer>
      </aside>

      {/* Right Map (65%) */}
      <main className="w-[65%] h-full relative">
        <MapContainer 
          bounds={bounds} 
          zoomControl={false}
          className="h-full w-full grayscale-[0.2] contrast-[1.1]"
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; Esri'
          />
          <Polyline 
            positions={polyline} 
            color="#09090b" 
            weight={3} 
            opacity={0.6} 
            dashArray="10, 15"
          />
          {CITIES.map((city) => (
            <Marker key={city.code} position={[city.lat, city.lon]}>
              <Popup>
                <div className="p-1 font-sans">
                  <p className="font-black text-xs text-zinc-900 uppercase">{city.name}</p>
                  <p className="text-[10px] text-zinc-500 font-bold">{city.code}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          <MapController bounds={bounds} />
        </MapContainer>

        {/* Map Overlays */}
        <div className="absolute top-8 right-8 z-[1000] flex flex-col gap-4 items-end">
           <div className="bg-white/80 backdrop-blur-md border border-zinc-200 p-4 rounded-xl shadow-premium max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">Live Route Tracking</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                 Monitoring transit corridors between AMD, BOM, BLR, and SIN. Weather conditions: Optimal.
              </p>
           </div>
        </div>

        <div className="absolute bottom-8 right-8 z-[1000]">
           <div className="bg-zinc-900 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-3">
              <Navigation2 className="h-4 w-4 fill-current" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Active Expedition</span>
           </div>
        </div>
      </main>

    </div>
  );
}
