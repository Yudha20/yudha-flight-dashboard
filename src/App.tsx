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
  Stethoscope,
  ChevronDown,
  Globe,
  Navigation2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons in React
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

interface WeatherData {
  temp: number;
  code: number;
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

const INITIAL_CHECKLIST = [
  { id: 'm1', text: '4x Hydrasun Sunscreen', category: 'Medical', checked: false },
  { id: 'm2', text: '3x Nevlon Anti-Itch Cream', category: 'Medical', checked: false },
  { id: 'm3', text: '3x Ketnext AF Lotion', category: 'Medical', checked: false },
  { id: 'm4', text: '3x Biofwash Shampoo', category: 'Medical', checked: false },
  { id: 'm5', text: '3x Selenext Wash', category: 'Medical', checked: false },
  { id: 'm6', text: '3x Xylite Cream', category: 'Medical', checked: false },
  { id: 'm7', text: '3x Nioclean AD Gel', category: 'Medical', checked: false },
  { id: 'm8', text: '2x Cutishine Face Wash', category: 'Medical', checked: false },
  { id: 'm9', text: '2x Momecort-F Cream', category: 'Medical', checked: false },
  { id: 'm10', text: '1x Cosmoq Serum', category: 'Medical', checked: false },
  { id: 'l1', text: 'Grab App Setup (S$25-35)', category: 'Logistics', checked: false },
  { id: 'l2', text: 'Submit SG Arrival Card (SGAC)', category: 'Logistics', checked: false },
  { id: 'l3', text: 'Academic Docs Checklist', category: 'Logistics', checked: false },
  { id: 'l4', text: 'Student Pass Formalities', category: 'Logistics', checked: false },
];

// --- Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-zinc-900/50 border border-zinc-800/50 rounded-2xl shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const WeatherBadge = ({ city, lat, lon }: { city: string, lat: number, lon: number }) => {
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`)
      .then(res => res.json())
      .then(json => setData({ temp: Math.round(json.current.temperature_2m), code: json.current.weather_code }));
  }, [lat, lon]);

  return (
    <div className="flex items-center justify-between p-3 bg-zinc-900/30 rounded-xl border border-zinc-800/30 group hover:bg-zinc-800/50 hover:border-emerald-500/20 transition-all cursor-default">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/50 group-hover:bg-zinc-800 group-hover:border-emerald-500/20">
          <CloudSun className="h-4 w-4 text-emerald-500/70" />
        </div>
        <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200">{city}</span>
      </div>
      <span className="text-sm font-mono text-emerald-500/80 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
        {data ? `${data.temp}°C` : '--°'}
      </span>
    </div>
  );
};

const FlightLegRow = ({ leg, isLast }: { leg: FlightLeg, isLast: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {!isLast && <div className="absolute left-[19px] top-10 bottom-0 w-[1px] bg-zinc-800/50" />}
      
      <motion.div 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-10 flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border ${isOpen ? 'bg-zinc-800/40 border-zinc-700/50' : 'bg-transparent border-transparent hover:bg-zinc-800/20'}`}
      >
        <div className={`mt-1.5 h-10 w-10 rounded-full border flex items-center justify-center bg-zinc-950 transition-all ${isOpen ? 'border-emerald-500/50 shadow-sm' : 'border-zinc-800/50'}`}>
          <Plane className={`h-4 w-4 ${isOpen ? 'text-emerald-500/80' : 'text-zinc-600'}`} />
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-zinc-200 tracking-tight">{leg.from}</span>
              <ChevronRight className="h-4 w-4 text-zinc-700" />
              <span className="text-lg font-bold text-zinc-200 tracking-tight">{leg.to}</span>
              <span className="ml-2 px-1.5 py-0.5 rounded bg-zinc-800/50 text-[10px] font-mono text-zinc-500 border border-zinc-800/50">
                {leg.flightNo}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
               <span className="text-emerald-500/70 font-bold tracking-tight">{leg.depTime} — {leg.arrTime}</span>
               <ChevronDown className={`h-4 w-4 text-zinc-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-medium text-zinc-500">
            <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {leg.depDate}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {leg.terminal}, {leg.gate}</span>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-zinc-800/50 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Airline</p>
                    <p className="text-xs font-semibold text-zinc-400">{leg.airline}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">PNR / Ref</p>
                    <p className="text-xs font-mono font-bold text-emerald-500/70">{leg.pnr}</p>
                  </div>
                  <div className="col-span-2 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50 flex items-center justify-between">
                     <span className="text-[11px] text-zinc-500">Status: <span className="text-emerald-500/60 font-bold ml-1 uppercase">{leg.status}</span></span>
                     <button className="text-[10px] font-bold text-zinc-400 bg-zinc-800/50 px-3 py-1 rounded-md border border-zinc-700/50 hover:bg-zinc-700 transition-colors">MANAGE</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// Map auto-fitting logic
const ChangeView = ({ bounds }: { bounds: L.LatLngBoundsExpression }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [bounds, map]);
  return null;
};

const SatelliteMap = () => {
  const polyline: [number, number][] = CITIES.map(c => [c.lat, c.lon]);
  const bounds = L.latLngBounds(polyline);

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-zinc-800/50 shadow-inner relative group">
      <MapContainer 
        bounds={bounds} 
        scrollWheelZoom={true} 
        dragging={true}
        zoomControl={true}
        style={{ height: '100%', width: '100%', background: '#09090b' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <Polyline 
          positions={polyline} 
          color="#10b981" 
          weight={2} 
          opacity={0.4} 
          dashArray="8, 12"
        />
        {CITIES.map((city) => (
          <Marker key={city.code} position={[city.lat, city.lon]}>
            <Popup>
              <div className="text-zinc-900 font-bold text-xs">{city.name} ({city.code})</div>
            </Popup>
          </Marker>
        ))}
        <ChangeView bounds={bounds} />
      </MapContainer>
      <div className="absolute top-4 left-4 z-[1000] bg-zinc-900/60 backdrop-blur-md border border-zinc-800/50 px-3 py-1.5 rounded-lg pointer-events-none transition-opacity group-hover:opacity-100 opacity-80">
        <p className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest flex items-center gap-2">
          <Navigation2 className="h-3 w-3 fill-current" /> Interactive Route Map
        </p>
      </div>
    </div>
  );
};

export default function App() {
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('travel_checklist');
    return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
  });

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    localStorage.setItem('travel_checklist', JSON.stringify(checklist));
    return () => clearInterval(timer);
  }, [checklist]);

  const toggleItem = (id: string) => {
    setChecklist(checklist.map((item: any) => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const getIST = () => time.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const getSGT = () => time.toLocaleTimeString('en-GB', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 font-sans selection:bg-emerald-500/20 p-4 md:p-8">
      {/* --- Smooth Header --- */}
      <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-900/50 pb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Navigation2 className="h-5 w-5 text-emerald-500/70 fill-current" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight uppercase italic">
              Expedition<span className="text-emerald-500/50">.</span>SG
            </h1>
          </div>
          <p className="text-zinc-600 text-[10px] font-bold tracking-[0.3em] uppercase pl-1">Smooth Migration Dashboard</p>
        </div>

        <div className="flex gap-4 md:gap-8 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50 shadow-sm">
          <div className="text-right border-r border-zinc-800/50 pr-6">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Ahmedabad / IST</p>
            <p className="text-xl font-mono font-medium text-zinc-300 tracking-tight">{getIST()}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Singapore / SGT</p>
            <p className="text-xl font-mono font-medium text-emerald-500/60 tracking-tight">{getSGT()}</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- Main Itinerary (7 Cols) --- */}
        <div className="lg:col-span-7 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-emerald-500/40" />
                Mission Itinerary
              </h2>
              <span className="text-[9px] font-bold text-emerald-500/50 border border-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-tighter">
                PNR: 8H49TF
              </span>
            </div>

            <Card className="p-2">
              <div className="space-y-1">
                <FlightLegRow leg={FLIGHT_DATA[0]} isLast={false} />
                
                {/* Mumbai Layover Highlight */}
                <div className="relative pl-[52px] py-4 my-1">
                  <div className="absolute left-[19px] top-0 bottom-0 w-[1px] bg-zinc-800/50" />
                  <div className="absolute left-[14px] top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-zinc-900 border border-zinc-700/50" />
                  <div className="bg-amber-500/[0.02] border border-amber-500/10 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest flex items-center gap-2">
                         <MapPin className="h-3 w-3" /> Stopover: Mumbai
                      </p>
                      <p className="text-xs font-semibold text-zinc-400 mt-0.5">Jun 17 — Jun 20</p>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-600 italic">3 Nights</p>
                  </div>
                </div>

                <FlightLegRow leg={FLIGHT_DATA[1]} isLast={false} />

                {/* Transit Highlight */}
                <div className="relative pl-[52px] py-3">
                  <div className="absolute left-[19px] top-0 bottom-0 w-[1px] bg-zinc-800/50" />
                  <div className="flex items-center gap-3 text-zinc-600 italic text-[11px] font-medium">
                    <Clock className="h-3 w-3 opacity-50" /> 
                    <span>3h 10m Transit in BLR</span>
                  </div>
                </div>

                <FlightLegRow leg={FLIGHT_DATA[2]} isLast={true} />
              </div>
            </Card>
          </section>

          {/* Interactive Map Section */}
          <section>
            <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
              <Navigation2 className="h-3.5 w-3.5 text-emerald-500/40" />
              Strategic Overlay
            </h2>
            <SatelliteMap />
          </section>

          {/* Logistics Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-zinc-800/50 group">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-emerald-500/40" />
                  Preparation
                </h3>
                <span className="text-[10px] font-bold text-zinc-600">{checklist.filter((i:any)=>i.category==='Logistics' && i.checked).length}/4</span>
              </div>
              <div className="space-y-4">
                {checklist.filter((item: any) => item.category === 'Logistics').map((item: any) => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleItem(item.id)}
                    className="flex items-center gap-3 cursor-pointer group/item"
                  >
                    <div className={`h-4 w-4 rounded border transition-all flex items-center justify-center ${item.checked ? 'bg-emerald-500/20 border-emerald-500/30' : 'border-zinc-800 group-hover/item:border-zinc-700'}`}>
                      {item.checked && <CheckCircle2 className="h-3 w-3 text-emerald-500/70" />}
                    </div>
                    <span className={`text-xs font-medium transition-all ${item.checked ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-emerald-500/[0.01] border-dashed border-emerald-500/10">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-emerald-500/40" />
                    Priority Action
                  </h3>
                  <p className="text-xs font-bold text-zinc-200 leading-tight">Submit SG Arrival Card (SGAC)</p>
                  <p className="text-[10px] text-zinc-600 mt-2 font-medium leading-relaxed">Mandatory requirement for entry into Singapore. Can be submitted up to 3 days prior to arrival.</p>
                </div>
                <a 
                  href="https://eservices.ica.gov.sg/sgarrivalcard/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors border border-zinc-700/30"
                >
                  ICA Portal <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </Card>
          </section>
        </div>

        {/* --- Sidebar (5 Cols) --- */}
        <div className="lg:col-span-5 space-y-8">
          {/* Weather Section */}
          <section>
            <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
              <Thermometer className="h-3.5 w-3.5 text-emerald-500/40" />
              Environment
            </h2>
            <Card className="p-4 space-y-2">
              {CITIES.map(city => (
                <WeatherBadge key={city.code} city={city.name} lat={city.lat} lon={city.lon} />
              ))}
            </Card>
          </section>

          {/* Medical Inventory */}
          <section>
             <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Stethoscope className="h-3.5 w-3.5 text-emerald-500/40" />
                  Medical Stockpile
                </h2>
                <div className="h-1 w-20 bg-zinc-900 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(checklist.filter((i:any)=>i.category==='Medical' && i.checked).length / 10) * 100}%` }}
                    className="h-full bg-emerald-500/30" 
                   />
                </div>
             </div>
             <Card className="max-h-[500px] overflow-y-auto p-3">
                <div className="space-y-1">
                  {checklist.filter((item: any) => item.category === 'Medical').map((item: any) => (
                    <div 
                      key={item.id} 
                      onClick={() => toggleItem(item.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-all border cursor-pointer group ${item.checked ? 'bg-zinc-900/40 border-zinc-800/30' : 'bg-transparent border-transparent hover:bg-zinc-800/10'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-3.5 w-3.5 rounded flex items-center justify-center transition-all ${item.checked ? 'text-emerald-500/60' : 'text-zinc-800 group-hover:text-zinc-700'}`}>
                          {item.checked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                        </div>
                        <span className={`text-[11px] font-medium transition-all ${item.checked ? 'text-zinc-700 line-through' : 'text-zinc-400'}`}>
                          {item.text}
                        </span>
                      </div>
                      {item.checked && <span className="text-[8px] font-bold text-emerald-500/40 uppercase tracking-tighter">SECURE</span>}
                    </div>
                  ))}
                </div>
             </Card>
          </section>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-20 pt-10 border-t border-zinc-900/50 text-center">
        <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-[0.5em]">
          End of Line • Restricted Access • 2026 Flight Operations
        </p>
      </footer>
    </div>
  );
}
