import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Clock, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Thermometer,
  Wind,
  Cloud,
  Sun,
  CloudRain,
  ExternalLink,
  ShieldCheck,
  Stethoscope,
  LayoutDashboard,
  Navigation,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface WeatherData {
  city: string;
  temp: number;
  code: number;
}

interface FlightLeg {
  id: string;
  airline: string;
  flightNo: string;
  from: string;
  fromFull: string;
  to: string;
  toFull: string;
  depTime: string;
  arrTime: string;
  date: string;
  terminal: string;
  gate: string;
  pnr: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  category: 'medical' | 'logistics';
}

// --- Data ---
const FLIGHTS: FlightLeg[] = [
  {
    id: 'leg-1',
    airline: 'Akasa Air',
    flightNo: 'QP 1102',
    from: 'AMD',
    fromFull: 'Ahmedabad',
    to: 'BOM',
    toFull: 'Mumbai',
    depTime: '07:55',
    arrTime: '09:20',
    date: 'Jun 17, 2026',
    terminal: 'T1',
    gate: 'B4',
    pnr: '8H49TF',
  },
  {
    id: 'leg-2',
    airline: 'Air India',
    flightNo: 'AI 2851',
    from: 'BOM',
    fromFull: 'Mumbai',
    to: 'BLR',
    toFull: 'Bengaluru',
    depTime: '11:10',
    arrTime: '12:55',
    date: 'Jun 20, 2026',
    terminal: 'T2',
    gate: 'D13',
    pnr: '8H49TF',
  },
  {
    id: 'leg-3',
    airline: 'Singapore Airlines',
    flightNo: 'SQ 803',
    from: 'BLR',
    fromFull: 'Bengaluru',
    to: 'SIN',
    toFull: 'Singapore',
    depTime: '16:05',
    arrTime: '22:20',
    date: 'Jun 20, 2026',
    terminal: 'T2',
    gate: 'A7',
    pnr: '8H49TF',
  },
];

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'm1', label: '4x Hydrasun Sunscreen', checked: false, category: 'medical' },
  { id: 'm2', label: '3x Nevlon Anti-Itch Cream', checked: false, category: 'medical' },
  { id: 'm3', label: '3x Ketnext AF Lotion', checked: false, category: 'medical' },
  { id: 'm4', label: '3x Biofwash Shampoo', checked: false, category: 'medical' },
  { id: 'm5', label: '3x Selenext Wash', checked: false, category: 'medical' },
  { id: 'm6', label: '3x Xylite Cream', checked: false, category: 'medical' },
  { id: 'm7', label: '3x Nioclean AD Gel', checked: false, category: 'medical' },
  { id: 'm8', label: '2x Cutishine Face Wash', checked: false, category: 'medical' },
  { id: 'm9', label: '2x Momecort-F Cream', checked: false, category: 'medical' },
  { id: 'm10', label: '1x Cosmoq Serum', checked: false, category: 'medical' },
  { id: 'l1', label: 'Grab App Setup (S$25-35 ready)', checked: false, category: 'logistics' },
  { id: 'l2', label: 'Submit SG Arrival Card (on/after June 17)', checked: false, category: 'logistics' },
  { id: 'l3', label: 'Academic Docs (PS Portal verified)', checked: true, category: 'logistics' },
  { id: 'l4', label: 'Student Pass Formalities', checked: false, category: 'logistics' },
];

const LOCATIONS = [
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
];

// --- Helpers ---
const getWeatherIcon = (code: number) => {
  if (code === 0) return <Sun className="w-4 h-4 text-amber-400" />;
  if (code <= 3) return <Cloud className="w-4 h-4 text-zinc-400" />;
  if (code >= 51) return <CloudRain className="w-4 h-4 text-blue-400" />;
  return <Cloud className="w-4 h-4 text-zinc-400" />;
};

// --- Components ---

const ClockSection = () => {
  const [times, setTimes] = useState({ ist: '', sgt: '' });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const ist = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
      const sgt = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit', hour12: false });
      setTimes({ ist, sgt });
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-6 text-zinc-400 font-mono text-xs">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">India (IST)</span>
        <span className="text-zinc-200 text-lg font-bold tracking-tight">{times.ist}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Singapore (SGT)</span>
        <span className="text-zinc-200 text-lg font-bold tracking-tight">{times.sgt}</span>
      </div>
    </div>
  );
};

export default function App() {
  const [selectedLeg, setSelectedLeg] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('yudha-prep-checklist');
    return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
  });

  useEffect(() => {
    localStorage.setItem('yudha-prep-checklist', JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const results = await Promise.all(
          LOCATIONS.map(async (loc) => {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code`);
            const data = await res.json();
            return {
              city: loc.name,
              temp: Math.round(data.current.temperature_2m),
              code: data.current.weather_code
            };
          })
        );
        setWeather(results);
      } catch (err) {
        console.error('Weather fetch failed', err);
      }
    };
    fetchWeather();
  }, []);

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-zinc-700 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-end md:items-center border-b border-zinc-800 pb-8 gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 text-zinc-400" />
              Yudha's Move <span className="text-zinc-500 font-normal">/ SIN 2026</span>
            </h1>
            <p className="text-zinc-500 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Academic migration itinerary and prep
            </p>
          </div>
          <ClockSection />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Timeline */}
          <div className="lg:col-span-7 space-y-10">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                <Navigation className="w-4 h-4" /> Transit Timeline
              </h2>
              
              <div className="space-y-0 relative border-l border-zinc-800 ml-4 pl-8">
                {FLIGHTS.map((leg, idx) => (
                  <React.Fragment key={leg.id}>
                    {/* Flight Leg */}
                    <motion.div 
                      whileHover={{ x: 4 }}
                      onClick={() => setSelectedLeg(selectedLeg === leg.id ? null : leg.id)}
                      className={`relative group cursor-pointer p-5 rounded-xl border transition-all mb-4 ${
                        selectedLeg === leg.id ? 'bg-zinc-900 border-zinc-700 shadow-xl' : 'bg-transparent border-transparent hover:bg-zinc-900/50 hover:border-zinc-800'
                      }`}
                    >
                      <div className="absolute -left-[41px] top-7 w-4 h-4 rounded-full border-2 border-zinc-800 bg-[#09090b] z-10 group-hover:border-zinc-500 transition-colors" />
                      
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                          <Plane className="w-3 h-3" /> {leg.airline} • {leg.flightNo}
                        </div>
                        <span className="text-zinc-500 text-[10px] font-medium">{leg.date}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-xl font-bold tracking-tight text-white">{leg.from}</span>
                          <span className="text-[10px] text-zinc-500 uppercase">{leg.depTime}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-700" />
                        <div className="flex flex-col">
                          <span className="text-xl font-bold tracking-tight text-white">{leg.to}</span>
                          <span className="text-[10px] text-zinc-500 uppercase">{leg.arrTime}</span>
                        </div>
                        <div className="ml-auto">
                          <ChevronRight className={`w-4 h-4 text-zinc-600 transition-transform ${selectedLeg === leg.id ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedLeg === leg.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-6 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1">
                                <p className="text-zinc-500 uppercase text-[9px] font-bold">Confirmation</p>
                                <p className="text-zinc-200 font-mono text-sm">{leg.pnr}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-zinc-500 uppercase text-[9px] font-bold">Gate / Terminal</p>
                                <p className="text-zinc-200 text-sm">{leg.gate} ({leg.terminal})</p>
                              </div>
                              <div className="col-span-2 space-y-1">
                                <p className="text-zinc-500 uppercase text-[9px] font-bold">Routing</p>
                                <p className="text-zinc-300 text-sm">{leg.fromFull} to {leg.toFull}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Layovers */}
                    {idx === 0 && (
                      <div className="relative mb-4 py-6 px-5 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl ml-0">
                         <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-0.5 bg-zinc-800" />
                         <div className="flex items-center gap-3">
                           <MapPin className="w-4 h-4 text-zinc-500" />
                           <div>
                             <p className="text-xs font-bold text-zinc-300">Mumbai Stopover</p>
                             <p className="text-[10px] text-zinc-500 uppercase">3 Days • Jun 17 — Jun 20</p>
                           </div>
                         </div>
                      </div>
                    )}
                    {idx === 1 && (
                      <div className="relative mb-4 py-4 px-5 border-l-2 border-zinc-800 ml-4">
                         <div className="flex items-center gap-2">
                           <Clock className="w-3 h-3 text-zinc-600" />
                           <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">3h 10m Transit in BLR</p>
                         </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </section>

            {/* Weather */}
            <section className="pt-4">
               <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                <Thermometer className="w-4 h-4" /> Live Destination Pulse
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {weather.map((w, i) => (
                  <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">{w.city}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold tracking-tighter text-white">{w.temp}°</span>
                      {getWeatherIcon(w.code)}
                    </div>
                  </div>
                ))}
                {weather.length === 0 && [1,2,3,4].map(i => (
                  <div key={i} className="h-20 bg-zinc-900/50 border border-zinc-800 rounded-xl animate-pulse" />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Checklists */}
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
               <div className="p-5 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                   <Stethoscope className="w-4 h-4 text-zinc-500" /> Medical Stockpile
                 </h3>
                 <span className="text-[10px] text-zinc-600 font-mono">
                   {checklist.filter(i => i.category === 'medical' && i.checked).length}/{checklist.filter(i => i.category === 'medical').length}
                 </span>
               </div>
               <div className="p-2 space-y-1 max-h-[350px] overflow-y-auto">
                 {checklist.filter(i => i.category === 'medical').map(item => (
                   <div 
                    key={item.id} 
                    onClick={() => toggleItem(item.id)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                   >
                     {item.checked ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500" />}
                     <span className={`text-xs ${item.checked ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>{item.label}</span>
                   </div>
                 ))}
               </div>
            </section>

            <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
               <div className="p-5 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                   <Info className="w-4 h-4 text-zinc-500" /> Logistics Prep
                 </h3>
               </div>
               <div className="p-2 space-y-1">
                 {checklist.filter(i => i.category === 'logistics').map(item => (
                   <div 
                    key={item.id} 
                    onClick={() => toggleItem(item.id)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                   >
                     {item.checked ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500" />}
                     <span className={`text-xs ${item.checked ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>{item.label}</span>
                   </div>
                 ))}
                 <div className="p-3 mt-2">
                   <a 
                    href="https://eservices.ica.gov.sg/sgarrivalcard/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 flex items-center gap-2 transition-colors"
                   >
                     OFFICIAL SGAC PORTAL <ExternalLink className="w-3 h-3" />
                   </a>
                 </div>
               </div>
            </section>

            <div className="p-6 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                 <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Arrival Quick Info</h4>
               </div>
               <div className="space-y-4">
                 <div className="flex justify-between items-center">
                   <span className="text-xs text-zinc-500">Hostel Transport</span>
                   <span className="text-xs font-bold text-white">S$25 - S$35</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-xs text-zinc-500">Mobile Data</span>
                   <span className="text-xs font-bold text-white">Singtel Tourist SIM</span>
                 </div>
                 <div className="pt-4 border-t border-zinc-800">
                    <p className="text-[9px] leading-relaxed text-zinc-600 italic uppercase">Ensure SG Arrival Card is submitted within 3 days of arrival in Singapore.</p>
                 </div>
               </div>
            </div>
          </div>

        </div>

        <footer className="pt-12 border-t border-zinc-800 flex justify-between items-center">
           <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-bold">Terminal One • Elite Migration Dashboard</p>
           <div className="flex gap-4">
             <div className="w-2 h-2 rounded-full bg-zinc-800" />
             <div className="w-2 h-2 rounded-full bg-zinc-800" />
             <div className="w-2 h-2 rounded-full bg-zinc-800" />
           </div>
        </footer>

      </div>
    </div>
  );
}