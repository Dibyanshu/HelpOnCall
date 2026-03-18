import { useState } from 'react';
import { MapPin, Maximize2, Check } from 'lucide-react';

export default function MapSelector({ onLocationPinned, initialAddress = '' }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [tempAddress, setTempAddress] = useState('9999 Yonge Street, Toronto, ON M5E 1A1');

  const handlePinConfirm = () => {
    setIsPinned(true);
    onLocationPinned(tempAddress);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-3">
      <div 
        className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm transition-all duration-300 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Mock Map Background */}
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="relative">
            <div className={`absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold shadow-xl transition-all duration-300 ${isPinned ? 'opacity-100' : 'opacity-0 scale-95'}`}>
              Pinned!
            </div>
            <MapPin className={`h-8 w-8 transition-all duration-500 ${isPinned ? 'text-teal-700 scale-110' : 'text-gray-400 group-hover:text-teal-500'}`} />
            <div className={`absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-black/10 transition-all duration-500 ${isPinned ? 'scale-[3] blur-sm' : 'scale-100 blur-none'}`} />
          </div>
        </div>

        {/* Hover Overlay */}
        <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md transition-all duration-300 ${isHovered && !isModalOpen ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
             onClick={() => setIsModalOpen(true)}>
          <p className="px-6 text-center text-xs font-bold text-gray-900 drop-shadow-sm">
            Want to adjust the pin location?
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-full bg-teal-700 px-4 py-1.5 text-[10px] font-bold text-white shadow-lg shadow-teal-700/30">
            <Maximize2 className="h-3 w-3" />
            Open Map
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in duration-300">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Adjust Precise Location</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="relative aspect-video bg-gray-100">
              {/* Full Interactive Mock Map Container */}
              <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(#d1d5db_1.5px,transparent_1.5px)] [background-size:24px_24px]">
                <div className="relative cursor-move p-4 group" draggable="true">
                  <MapPin className="h-12 w-12 text-teal-700 drop-shadow-2xl animate-bounce" />
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-teal-700 shadow-2xl whitespace-nowrap">
                    Drag Me to your location
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="rounded-2xl bg-white/90 p-4 shadow-xl backdrop-blur-md border border-white/20">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-4 w-4 text-teal-700" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Target Address</p>
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {tempAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <button
                onClick={handlePinConfirm}
                className="btn-primary w-full shadow-xl shadow-teal-700/20"
              >
                <div className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" />
                  Pin this location
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
