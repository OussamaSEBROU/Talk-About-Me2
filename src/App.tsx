/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { fetchAndParseData } from './services/dataFetcher';
import { MemorialPerson } from './types';
import MapCanvas from './components/MapCanvas';
import SidePanel from './components/SidePanel';
import StatsOverlay from './components/StatsOverlay';
import FlashCard from './components/FlashCard';
import { Globe, Menu, Moon, Sun } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<MemorialPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'ar'|'en'>('en');
  const [mapTheme, setMapTheme] = useState<'dark'|'light'>('dark');
  
  // App States
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<MemorialPerson | null>(null);
  const [introTextVisible, setIntroTextVisible] = useState(true);
  const [uiVisible, setUiVisible] = useState(false);

  useEffect(() => {
    fetchAndParseData().then(data => {
      setData(data);
      setLoading(false);
    }).catch(e => {
        console.error(e);
        setLoading(false);
    });
  }, []);

  const handleIntroEnd = () => {
     setIntroTextVisible(false);
     setTimeout(() => {
        setUiVisible(true);
     }, 1500); // Wait bit more before showing UI
  };

  const isAr = lang === 'ar';

  if (loading) {
     return (
         <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#0B0F19] text-white">
             <div className="w-12 h-12 border-4 border-white/10 border-t-red-500 rounded-full animate-spin mb-4"></div>
             <p className="text-white/60 tracking-widest uppercase text-sm">Loading Memorial Data...</p>
         </div>
     );
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className={`relative w-screen h-screen overflow-hidden bg-[#0B0F19] selection:bg-red-500/30 ${isAr ? 'font-ar' : 'font-en'}`}>
      
      {/* Background Map layer */}
      <MapCanvas data={data} theme={mapTheme} onPersonSelect={setSelectedPerson} onIntroEnd={handleIntroEnd} />
      
      {/* Intro Overlay Text */}
      <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none transition-all duration-[2000ms] ${introTextVisible ? 'opacity-100' : 'opacity-0'} ${mapTheme === 'dark' ? 'text-white drop-shadow-[0_0_20px_rgba(0,0,0,1)]' : 'text-slate-900 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]'}`}>
          <h1 className="text-xl sm:text-2xl md:text-5xl lg:text-7xl font-extrabold tracking-wide md:tracking-widest text-center px-4 leading-snug md:leading-tight whitespace-nowrap" dir={isAr ? 'rtl' : 'ltr'}>
             {isAr ? "فلسطين من البحر إلى النهر" : "Palestine From The River To The Sea"}
          </h1>
      </div>

      {/* Main UI Layer (Fades in after Drone Effect) */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 z-20 ${uiVisible ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* Modern Floating Poignant Pill */}
          <div className={`pointer-events-none absolute bottom-[130px] md:bottom-[90px] left-1/2 -translate-x-1/2 z-10 w-max max-w-[90vw] transition-all duration-1000 delay-500 ${panelOpen ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <div className={`backdrop-blur-xl px-4 py-2.5 md:px-6 md:py-3.5 rounded-full transition-all duration-700 transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden flex items-center justify-center border shadow-xl ${mapTheme === 'dark' ? 'bg-slate-900/80 border-red-500/30 text-white shadow-[0_10px_30px_rgba(239,68,68,0.2)]' : 'bg-white/95 border-white text-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.08),0_0_20px_rgba(239,68,68,0.15)]'}`}>
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_3s_infinite]"></div>
                  
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
                  <p className={`text-[10px] sm:text-xs md:text-sm font-bold leading-snug relative z-10 text-center mx-3 md:mx-4 drop-shadow-sm ${isAr ? 'tracking-normal' : 'tracking-wide'}`}>
                      {isAr ? "كل نقطة هي قصة إنسان كانت له أحلام وأهداف.." : "Every point is a human life that had dreams and goals.."}
                  </p>
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
              </div>
          </div>

          {/* Zen Mode Title */}
          <div className={`absolute top-4 md:top-6 left-1/2 -translate-x-1/2 transition-all duration-700 pointer-events-none ${panelOpen ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <h2 className={`text-xl sm:text-2xl md:text-4xl font-extrabold tracking-widest uppercase text-center mt-2 px-6 py-2 transition-colors duration-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] font-en ${mapTheme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                 Talk About Me!
              </h2>
          </div>

          {/* Menu Button (Zen Mode) */}
          <button 
             onClick={() => setPanelOpen(true)}
             className={`pointer-events-auto absolute top-4 md:top-6 ${isAr ? 'right-4 md:right-6' : 'left-4 md:left-6'} backdrop-blur-2xl w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-full border transition-all duration-500 hover:scale-105 ${mapTheme === 'dark' ? 'bg-slate-900/60 border-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:bg-white/10' : 'bg-white/70 border-white/60 text-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:bg-white/90'}`}
          >
             <Menu size={24} className="md:w-7 md:h-7" />
          </button>

          <StatsOverlay data={data} lang={lang} theme={mapTheme} />
          
          <div className={`pointer-events-auto absolute bottom-[80px] md:bottom-6 ${isAr ? 'left-4 md:left-6' : 'right-4 md:right-6'} z-20 flex gap-3`}>
              <button 
                onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
                className={`backdrop-blur-2xl rounded-full h-11 md:h-12 px-5 md:px-6 flex items-center gap-2 transition-all duration-500 shadow-xl font-bold hover:scale-105 border ${mapTheme === 'dark' ? 'bg-slate-900/60 border-white/10 text-white hover:bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)]' : 'bg-white/70 border-white/60 text-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:bg-white/90'}`}
              >
                  <Globe size={20} className={mapTheme === 'dark' ? "opacity-90" : "opacity-80"} />
                  <span className="text-sm md:text-base">{isAr ? 'English' : 'عربي'}</span>
              </button>
              
              <button 
                onClick={() => setMapTheme(t => t === 'light' ? 'dark' : 'light')}
                className={`backdrop-blur-2xl rounded-full w-11 h-11 md:w-12 md:h-12 flex items-center justify-center transition-all duration-500 shadow-xl font-bold hover:scale-105 border ${mapTheme === 'dark' ? 'bg-slate-900/60 border-white/10 text-white hover:bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)]' : 'bg-white/70 border-white/60 text-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:bg-white/90'}`}
              >
                  {mapTheme === 'light' ? <Moon size={20} className="md:w-[22px] md:h-[22px]" /> : <Sun size={20} className="md:w-[22px] md:h-[22px]" />}
              </button>
          </div>

          <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-full max-w-[95%] md:max-w-4xl px-2 md:px-4 text-center">
              <p className={`text-[10px] md:text-xs font-semibold leading-snug md:leading-relaxed drop-shadow-md transition-colors duration-500 ${mapTheme === 'dark' ? 'text-white/60 text-shadow-sm' : 'text-slate-800 bg-white/60 border border-white/60 px-4 py-1.5 rounded-full inline-block backdrop-blur-md shadow-sm'}`}>
                  {isAr 
                    ? "هذه البيانات مأخوذة من وزارة الصحة الفلسطينية - تشمل المنصة 60,199 ضحية تم تسجيلهم وتوثيقهم حتى 31 يوليو 2025" 
                    : "This data is sourced from the Palestinian Ministry of Health - The platform lists 60,199 victims recorded and certified by 31 July 2025"}
              </p>
          </div>
      </div>

      {/* Side Panel & Flash Card */}
      <SidePanel 
          data={data} 
          lang={lang}
          theme={mapTheme}
          isOpen={panelOpen} 
          onClose={() => setPanelOpen(false)} 
          onPersonSelect={(p) => {
              setSelectedPerson(p);
              // Option: close side panel when a person is selected to reveal map
              if (window.innerWidth < 640) setPanelOpen(false); 
          }} 
      />

      {selectedPerson && (
          <FlashCard 
             person={selectedPerson} 
             lang={lang} 
             onClose={() => setSelectedPerson(null)} 
          />
      )}

    </div>
  );
}
