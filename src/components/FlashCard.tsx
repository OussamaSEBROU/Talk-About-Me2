import { MemorialPerson } from '../types';
import { X, Share2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { useRef, useState } from 'react';

export default function FlashCard({ person, lang, theme = 'light', onClose }: { person: MemorialPerson, lang: 'ar'|'en', theme?: 'light'|'dark', onClose: () => void }) {
    const isAr = lang === 'ar';
    const isDark = theme === 'dark';
    const cardRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async () => {
        if (!cardRef.current || isSharing) return;
        
        try {
            setIsSharing(true);
            // We temporarily hide the buttons before taking screenshot
            const elementsToHide = cardRef.current.querySelectorAll('.no-capture');
            elementsToHide.forEach((el: any) => el.style.display = 'none');

            const blob = await htmlToImage.toBlob(cardRef.current, {
                backgroundColor: isDark ? '#0a0a0a' : '#fcfbfc',
                pixelRatio: 2, 
            });

            elementsToHide.forEach((el: any) => el.style.display = '');
            
            if (!blob) {
                setIsSharing(false);
                return;
            }
            
            const file = new File([blob], `martyr-${person.ID || 'unknown'}.png`, { type: 'image/png' });
            
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: isAr ? person.الاسم : person.Name,
                        text: isAr ? 'الاحتلال قتلني! أرجوك تحدث عني!' : 'IDF KILLED ME! TALK ABOUT ME!',
                    });
                } catch (error) {
                    console.log('Share error or cancelled', error);
                }
            } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `martyr.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            setIsSharing(false);
        } catch (error) {
            console.error('Error generating image', error);
            setIsSharing(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isAr ? 'font-ar' : 'font-en'}`} onClick={onClose}>
            <div 
                ref={cardRef}
                className={`relative w-[85vw] max-w-[320px] pb-6 rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in-95 duration-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] border border-red-500/40 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#fcfbfc]'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Floating Buttons */}
                <button onClick={onClose} className="no-capture absolute top-4 right-4 bg-slate-900/40 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center text-white hover:bg-slate-900/60 transition-all z-20 shadow-lg">
                    <X size={18} />
                </button>

                <button 
                    onClick={handleShare} 
                    disabled={isSharing}
                    className="no-capture absolute bottom-5 left-5 bg-slate-900/10 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-900/20 hover:text-slate-800 transition-all z-20 disabled:opacity-50"
                >
                    <Share2 size={16} className={isSharing ? "animate-pulse" : ""} />
                </button>

                <div className={`px-6 pt-12 pb-10 flex flex-col items-center text-center relative z-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    
                    <p className={`text-red-500 text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase mb-4 opacity-100 ${isAr ? 'tracking-normal' : ''}`}>
                        {isAr ? "الاحتلال قتلني! أرجوك تحدث عني!" : "IDF KILLED ME! TALK ABOUT ME!"}
                    </p>

                    <h2 className="text-2xl md:text-3xl font-black mb-6 leading-tight drop-shadow-sm px-2">
                        {isAr ? (person.الاسم || person.Name) : (person.Name || person.الاسم)}
                    </h2>

                    <div className="w-12 h-1 bg-red-500/80 rounded-full mb-6"></div>

                    <div className="w-full space-y-3 px-2">
                        <div className={`flex flex-col items-center justify-center py-2 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                            <span className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{isAr ? 'العمر' : 'AGE'}</span>
                            <span className="text-lg font-black">{person.Age} <span className="text-xs font-medium opacity-60">{isAr ? 'سنة' : 'Years'}</span></span>
                        </div>
                        
                        {person.Sex && (
                            <div className={`flex flex-col items-center justify-center py-2 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                                <span className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{isAr ? 'الجنس' : 'SEX'}</span>
                                <span className="text-lg font-black">{String(person.Sex).toLowerCase() === 'm' ? (isAr ? 'ذكر' : 'Male') : (String(person.Sex).toLowerCase() === 'f' ? (isAr ? 'أنثى' : 'Female') : person.Sex)}</span>
                            </div>
                        )}

                        {person.ID && (
                            <div className={`flex flex-col items-center justify-center py-2 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                                <span className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{isAr ? 'رقم الهوية' : 'ID'}</span>
                                <span className="text-base font-black tracking-wider">{person.ID}</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
