import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { List } from 'react-window';
import { MemorialPerson } from '../types';

export default function SidePanel({ data, lang, theme = 'light', isOpen, onClose, onPersonSelect }: { data: MemorialPerson[], lang: 'ar'|'en', theme?: 'light'|'dark', isOpen: boolean, onClose: () => void, onPersonSelect: (p: MemorialPerson) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<'all'|'children'|'women'|'elderly'>('all');
  const [listDimensions, setListDimensions] = useState({ width: 300, height: 500 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setListDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isOpen]);

  const filteredData = useMemo(() => {
    return data.filter(person => {
      const matchSearch = person.Name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          person.الاسم?.includes(searchTerm);
      if (!matchSearch) return false;
      
      const ageStr = String(person.Age || '').toLowerCase();
      const ageNum = parseInt(ageStr);
      const isChild = ageStr.includes('less') || ageStr.includes('month') || ageStr.includes('day') || (ageNum < 18);
      const isElderly = ageNum >= 60;
      const isWoman = String(person.Sex || '').toLowerCase() === 'f';
      
      if (tab === 'children') return isChild;
      if (tab === 'women') return isWoman;
      if (tab === 'elderly') return isElderly;
      return true;
    });
  }, [data, searchTerm, tab]);

  const isAr = lang === 'ar';
  const isDark = theme === 'dark';

  const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const item = filteredData[index];
    return (
      <div 
        style={style} 
        onClick={() => onPersonSelect(item)}
        className={`px-5 md:px-6 py-3 border-b transition-colors cursor-pointer flex flex-col justify-center group ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-black/5 hover:bg-slate-50'}`}
      >
        <h3 className={`font-semibold group-hover:text-red-600 transition-colors truncate text-[13px] md:text-sm leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {isAr ? (item.الاسم || item.Name) : (item.Name || item.الاسم)}
        </h3>
        <span className={`text-[10px] md:text-xs flex items-center gap-1.5 md:gap-2 mt-1 md:mt-1.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className={`px-1.5 py-0.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200'}`}>{isAr ? 'رقم:' : 'ID:'} {item.Index}</span>
            {item.Age && <span>{item.Age} {isAr ? 'سنة' : 'y'}</span>}
        </span>
      </div>
    );
  };

  const tabs = [
      { id: 'all', ar: 'الكل', en: 'All' },
      { id: 'children', ar: 'الأطفال', en: 'Children' },
      { id: 'women', ar: 'النساء', en: 'Women' },
      { id: 'elderly', ar: 'كبار السن', en: 'Elderly' },
  ] as const;

  return (
    <div className={`fixed top-0 bottom-0 ${isAr ? 'right-0' : 'left-0'} w-[85vw] max-w-[340px] sm:w-[400px] sm:max-w-none backdrop-blur-2xl shadow-[20px_0_80px_rgba(0,0,0,0.5)] z-40 flex flex-col pt-6 md:pt-8 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isDark ? 'bg-slate-900/95 border-white/10 text-white' : 'bg-white/95 border-slate-200 text-slate-900'} ${isAr ? 'border-l' : 'border-r'} ${isOpen ? 'translate-x-0' : (isAr ? 'translate-x-full' : '-translate-x-full')}`}>
      <button onClick={onClose} className={`absolute top-3 md:top-4 ${isAr ? 'left-3 md:left-4' : 'right-3 md:right-4'} w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full transition-colors z-20 ${isDark ? 'text-slate-500 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}>
          <X size={20} className="md:w-6 md:h-6" />
      </button>

      <div className="px-5 md:px-6 relative z-10 pt-1 md:pt-2">
          <h1 className="text-xl md:text-3xl font-extrabold mb-4 md:mb-6 tracking-wide md:tracking-widest drop-shadow-sm font-en uppercase origin-left">
              Talk About Me!
          </h1>
          
          <div className="relative mb-4 md:mb-6">
            <Search className={`absolute ${isAr ? 'right-3.5 md:right-4' : 'left-3.5 md:left-4'} top-3 md:top-3.5 transition-colors w-4 h-4 md:w-[18px] md:h-[18px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input 
              type="text" 
              placeholder={isAr ? "ابحث عن شهيد..." : "Search victims..."}
              className={`w-full border rounded-xl md:rounded-2xl py-2.5 md:py-3 text-xs md:text-sm ${isAr ? 'pr-10 md:pr-12 pl-4' : 'pl-10 md:pl-12 pr-4'} focus:outline-none focus:ring-4 transition-all font-medium ${isDark ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-red-500/50 focus:ring-red-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-red-500 focus:ring-red-50'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5 md:gap-2 mb-3 md:mb-4 overflow-x-auto pb-2 scrollbar-none">
              {tabs.map(t => (
                  <button 
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[11px] md:text-sm whitespace-nowrap transition-all duration-300 border ${tab === t.id ? (isDark ? 'bg-white text-slate-900 shadow-md border-transparent' : 'bg-slate-900 text-white shadow-md border-transparent') : (isDark ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200')}`}
                  >
                      {isAr ? t.ar : t.en}
                  </button>
              ))}
          </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
        <div className={`absolute inset-x-0 top-0 h-4 bg-gradient-to-b z-10 pointer-events-none ${isDark ? 'from-slate-900/95' : 'from-white/95'} to-transparent`}></div>
        {isOpen && (
            <List
                rowCount={filteredData.length}
                rowHeight={72}
                rowComponent={Row as any}
                rowProps={{}}
                style={{ 
                    height: listDimensions.height, 
                    width: '100%',
                    overflowX: 'hidden', 
                    direction: isAr ? 'rtl' : 'ltr' 
                }}
            />
        )}
        <div className={`absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t ${isDark ? 'from-slate-900' : 'from-slate-950/80'} to-transparent z-10 pointer-events-none`}></div>
      </div>
    </div>
  );
}
