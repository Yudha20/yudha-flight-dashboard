import React from 'react';
import { 
  Plane, 
  Cloud, 
  CloudRain, 
  Sun, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  Circle,
  ChevronRight,
  Wifi,
  Wind
} from 'lucide-react';
import { motion } from 'framer-motion';

const flights = [
  { id: 1, from: 'AMD', to: 'BOM', flightNo: 'QP 1102', status: 'Landed', time: '06:15 - 07:30', current: false },
  { id: 2, from: 'BOM', to: 'BLR', flightNo: 'AI 2851', status: 'On Time', time: '10:45 - 12:20', current: true },
  { id: 3, from: 'BLR', to: 'SIN', flightNo: 'SQ 803', status: 'Scheduled', time: '23:05 - 06:10', current: false },
];

const cities = [
  { name: 'Ahmedabad', temp: '32°C', condition: 'Sunny', icon: Sun },
  { name: 'Mumbai', temp: '29°C', condition: 'Humid', icon: Cloud },
  { name: 'Bengaluru', temp: '26°C', condition: 'Partly Cloudy', icon: CloudRain },
  { name: 'Singapore', temp: '28°C', condition: 'Tropical', icon: Wind },
];

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`rounded-xl border border-border bg-[#09090b] text-foreground shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

export default function App() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Plane className="h-8 w-8 text-blue-500" />
            SkyTrack <span className="text-muted-foreground font-light">| Elite</span>
          </h1>
          <p className="text-muted-foreground mt-1 uppercase tracking-widest text-xs font-semibold text-[10px]">Premium Itinerary Experience</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Welcome back,</p>
            <p className="font-semibold text-sm">Yudhajit Ghosh</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/20" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#09090b]/50 backdrop-blur-xl">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-500" />
                Live Journey Status
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 font-bold uppercase tracking-tighter">
                PNR: 8H49TF
              </span>
            </div>
            <div className="p-6 space-y-8">
              {flights.map((flight, idx) => (
                <motion.div 
                  key={flight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative pl-8 group"
                >
                  {idx !== flights.length - 1 && (
                    <div className="absolute left-[11px] top-7 bottom-[-20px] w-0.5 bg-border group-hover:bg-blue-500/30 transition-colors" />
                  )}
                  <div className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border-2 flex items-center justify-center bg-background z-10 transition-colors ${flight.current ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : flight.status === 'Landed' ? 'border-green-500' : 'border-muted'}`}>
                    {flight.status === 'Landed' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className={`h-2 w-2 ${flight.current ? 'fill-blue-500' : 'fill-muted'}`} />}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold">{flight.from}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-2xl font-bold">{flight.to}</span>
                        <span className="text-[10px] font-mono text-muted-foreground ml-2 px-2 py-0.5 bg-muted rounded border border-border">
                          {flight.flightNo}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 text-[11px]"><Clock className="h-3 w-3" /> {flight.time}</span>
                        {flight.current && <span className="flex items-center gap-1 text-blue-500 font-medium animate-pulse text-[11px]">● Live Tracking Active</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end justify-center">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                        flight.status === 'Landed' ? 'text-green-500' : 
                        flight.current ? 'text-blue-500 bg-blue-500/10 border border-blue-500/20' : 
                        'text-muted-foreground'
                      }`}>
                        {flight.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="p-6 bg-[#09090b]/40">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Amenities</h3>
                  <Wifi className="h-4 w-4 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">In-flight WiFi</span>
                    <span className="text-green-500 font-medium">Available</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Seat 12A</span>
                    <span className="font-medium">Extra Legroom</span>
                  </div>
                </div>
             </Card>
             <Card className="p-6 bg-[#09090b]/40 border-dashed border-blue-500/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Plane className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Upgrade Available</h3>
                    <p className="text-[10px] text-muted-foreground">Upgrade to Business Class for $120</p>
                  </div>
                </div>
             </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-600/10 via-background to-purple-600/10 border-blue-500/20">
            <div className="p-6">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Confirmation Number</p>
                   <p className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-400">8H49TF</p>
                 </div>
                 <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                   <div className="w-8 h-8 bg-white opacity-20 rounded-sm" />
                 </div>
               </div>
               <div className="space-y-3">
                 <div className="flex justify-between text-xs">
                   <span className="text-muted-foreground">Guest</span>
                   <span className="font-semibold tracking-tight">Yudhajit Ghosh</span>
                 </div>
                 <div className="flex justify-between text-xs">
                   <span className="text-muted-foreground">Class</span>
                   <span className="font-semibold tracking-tight">Economy Premium</span>
                 </div>
                 <div className="pt-4 mt-4 border-t border-border flex justify-center">
                    <div className="w-full h-12 bg-white/5 rounded flex items-center justify-center border border-white/10 italic text-muted-foreground text-[10px] tracking-widest">
                      SCAN BOARDING PASS
                    </div>
                 </div>
               </div>
            </div>
          </Card>

          <Card className="bg-[#09090b]/50">
            <div className="p-4 border-b border-border">
              <h3 className="text-xs font-semibold flex items-center gap-2 uppercase tracking-tighter">
                <Cloud className="h-4 w-4 text-blue-400" />
                Destination Weather
              </h3>
            </div>
            <div className="divide-y divide-border">
              {cities.map((city, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between group hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background border border-border group-hover:border-blue-500/30 transition-colors">
                      <city.icon className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{city.name}</p>
                      <p className="text-[9px] text-muted-foreground uppercase">{city.condition}</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold">{city.temp}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      
      <footer className="text-center pb-8 border-t border-border pt-8">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Generated by SkyTrack AI • 2026 Flight Services</p>
      </footer>
    </div>
  );
}