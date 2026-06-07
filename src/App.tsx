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
  <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden ${className}`}>
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
    <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/50 group hover:border-emerald-500/30 transition-all cursor-default">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:bg-zinc-800">
          <CloudSun className="h-4 w-4 text-emerald-400" />
        </div>
        <span className="text-sm font-semibold text-zinc-100">{city}</span>
      </div>
      <span className="text-sm font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
        {data ? `${data.temp}°C` : '--°'}
      </span>
    </div>
  );
};

const FlightLegRow = ({ leg, isLast }: { leg: FlightLeg, isLast: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {!isLast && <div className="absolute left-[19px] top-10 bottom-0 w-[2px] bg-zinc-800" />}
      
      <motion.div 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-10 flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border ${isOpen ? 'bg-zinc-800/50 border-zinc-700' : 'bg-transparent border-transparent hover:bg-zinc-800/30'}`}
      >
        <div className={`mt-1.5 h-10 w-10 rounded-full border-2 flex items-center justify-center bg-zinc-950 transition-colors ${isOpen ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-zinc-800'}`}>
          <Plane className={`h-5 w-5 ${isOpen ? 'text-emerald-400' : 'text-zinc-500'}`} />
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-zinc-100 tracking-tight">{leg.from}</span>
              <ChevronRight className="h-4 w-4 text-zinc-600" />
              <span className="text-xl font-bold text-zinc-100 tracking-tight">{leg.to}</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-zinc-700">
                {leg.flightNo}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
               <span className="text-emerald-400 font-bold tracking-tighter">{leg.depTime} — {leg.arrTime}</span>
               <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
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
                <div className="mt-4 pt-4 border-t border-zinc-700 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Airline</p>
                    <p className="text-sm font-semibold text-zinc-200">{leg.airline}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">PNR / Ref</p>
                    <p className="text-sm font-mono font-bold text-emerald-400">{leg.pnr}</p>
                  </div>
                  <div className="col-span-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
                     <span className="text-xs text-zinc-400">Status: <span className="text-emerald-500 font-bold ml-1 uppercase">{leg.status}</span></span>
                     <button className="text-[10px] font-bold text-zinc-100 bg-zinc-800 px-3 py-1 rounded-md border border-zinc-700 hover:bg-zinc-700">MANAGE SEATS</button>
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
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-emerald-500/30 p-4 md:p-8">
      {/* --- High End Header --- */}
      <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-800 pb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Navigation2 className="h-6 w-6 text-white fill-current" />
            </div>
            <h1 className="text-4xl font-black text-zinc-100 tracking-tighter uppercase italic">
              Expedition<span className="text-emerald-500">.</span>SG
            </h1>
          </div>
          <p className="text-zinc-500 text-xs font-bold tracking-[0.3em] uppercase pl-1">Elite Migration Dashboard</p>
        </div>

        <div className="flex gap-4 md:gap-8 bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-2xl">
          <div className="text-right border-r border-zinc-800 pr-6">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Ahmedabad / IST</p>
            <p className="text-2xl font-mono font-bold text-zinc-100 tracking-tighter">{getIST()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Singapore / SGT</p>
            <p className="text-2xl font-mono font-bold text-emerald-400 tracking-tighter">{getSGT()}</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- Main Itinerary (7 Cols) --- */}
        <div className="lg:col-span-7 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-sm font-black text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-500" />
                Mission Itinerary
              </h2>
              <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-tighter">
                PNR: 8H49TF
              </span>
            </div>

            <Card className="p-2 bg-zinc-900/50 backdrop-blur-sm">
              <div className="space-y-2">
                <FlightLegRow leg={FLIGHT_DATA[0]} isLast={false} />
                
                {/* Mumbai Layover Highlight */}
                <div className="relative pl-[52px] py-6 my-2">
                  <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-zinc-800" />
                  <div className="absolute left-[12px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-zinc-900 border-2 border-zinc-700" />
                  <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                         <MapPin className="h-3 w-3" /> Stopover: Mumbai
                      </p>
                      <p className="text-sm font-semibold text-zinc-300 mt-1">Jun 17 — Jun 20 (3 Nights)</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-zinc-500 uppercase">Prep Period</p>
                       <p className="text-xs font-mono text-amber-200/50 italic">Packing Finalization</p>
                    </div>
                  </div>
                </div>

                <FlightLegRow leg={FLIGHT_DATA[1]} isLast={false} />

                {/* Transit Highlight */}
                <div className="relative pl-[52px] py-4">
                  <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-zinc-800" />
                  <div className="flex items-center gap-3 text-zinc-500 italic text-xs font-medium">
                    <Clock className="h-3 w-3" /> 
                    <span>3h 10m Transit in Bengaluru (BLR)</span>
                  </div>
                </div>

                <FlightLegRow leg={FLIGHT_DATA[2]} isLast={true} />
              </div>
            </Card>
          </section>

          {/* Logistics Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-zinc-800 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-500" />
                  Preparation
                </h3>
                <span className="text-[10px] font-bold text-zinc-500">{checklist.filter((i:any)=>i.category==='Logistics' && i.checked).length}/4</span>
              </div>
              <div className="space-y-4">
                {checklist.filter((item: any) => item.category === 'Logistics').map((item: any) => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleItem(item.id)}
                    className="flex items-center gap-3 cursor-pointer group/item"
                  >
                    <div className={`h-5 w-5 rounded-lg border-2 transition-all flex items-center justify-center ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-700 group-hover/item:border-zinc-500'}`}>
                      {item.checked && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className={`text-sm font-semibold transition-all ${item.checked ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-dashed border-emerald-500/30 bg-emerald-500/[0.02]">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-emerald-400" />
                    Priority Action
                  </h3>
                  <p className="text-sm font-bold text-zinc-100 leading-tight">Submit SG Arrival Card (SGAC)</p>
                  <p className="text-[10px] text-zinc-500 mt-2 font-medium">Mandatory requirement for entry into Singapore. Can be submitted up to 3 days prior to arrival.</p>
                </div>
                <a 
                  href="https://eservices.ica.gov.sg/sgarrivalcard/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-zinc-100 text-zinc-950 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors"
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
            <h2 className="text-sm font-black text-zinc-100 uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-emerald-500" />
              Environment
            </h2>
            <Card className="p-4 space-y-3">
              {CITIES.map(city => (
                <WeatherBadge key={city.code} city={city.name} lat={city.lat} lon={city.lon} />
              ))}
            </Card>
          </section>

          {/* Medical Inventory */}
          <section>
             <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-sm font-black text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-emerald-500" />
                  Medical Stockpile
                </h2>
                <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(checklist.filter((i:any)=>i.category==='Medical' && i.checked).length / 10) * 100}%` }}
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                   />
                </div>
             </div>
             <Card className="max-h-[500px] overflow-y-auto scrollbar-hide p-4">
                <div className="space-y-1">
                  {checklist.filter((item: any) => item.category === 'Medical').map((item: any) => (
                    <div 
                      key={item.id} 
                      onClick={() => toggleItem(item.id)}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all border cursor-pointer group ${item.checked ? 'bg-zinc-950/50 border-zinc-800' : 'bg-transparent border-transparent hover:bg-zinc-800/30'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-4 w-4 rounded flex items-center justify-center transition-all ${item.checked ? 'text-emerald-500' : 'text-zinc-700 group-hover:text-zinc-500'}`}>
                          {item.checked ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        </div>
                        <span className={`text-xs font-bold transition-all ${item.checked ? 'text-zinc-600 line-through' : 'text-zinc-100'}`}>
                          {item.text}
                        </span>
                      </div>
                      {item.checked && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Secure</span>}
                    </div>
                  ))}
                </div>
             </Card>
          </section>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-20 pt-10 border-t border-zinc-800 text-center">
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.5em]">
          End of Line • Restricted Access • 2026 Flight Operations
        </p>
      </footer>
    </div>
  );
}