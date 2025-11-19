import React, { useState, useRef, useEffect } from 'react';

/* --- COMPONENTE PER CATTURARE ERRORI (Antidoto allo schermo bianco) --- */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error: error, errorInfo: errorInfo });
    console.error("Errore catturato:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'black', background: 'white' }}>
          <h1>Qualcosa è andato storto.</h1>
          <p>Ecco l'errore (mandami questo testo se vedi questa schermata):</p>
          <pre style={{ color: 'red', background: '#eee', padding: '10px' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

/* --- ICONE INTEGRATE (ZERO DIPENDENZE) --- */
const IconPlay = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
const IconPause = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);
const IconRadio = ({ size = 24, strokeWidth = 2, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>
);
const IconTv = ({ size = 24, strokeWidth = 2, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
);
const IconMusic = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
);
const IconMaximize = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
);

function SMCRadioContent() {
  const [activeTab, setActiveTab] = useState('radio');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("Caricamento...");
  
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // URL streaming
  const RADIO_STREAM_URL = "https://a2.asurahosting.com:6150/radio.mp3";
  const RADIO_METADATA_URL = "https://a2.asurahosting.com:6150/status-json.xsl";
  const WEBTV_STREAM_URL = "https://f53a8aeeab01477abf3115d5628c70fa.msvdn.net/live/S75918331/aJfIRYHSb0i4/playlist.m3u8";

  // --- AUTO-RIPARAZIONE GRAFICA ---
  useEffect(() => {
    // Controlla se Tailwind è caricato, altrimenti lo inietta forzatamente
    if (!document.querySelector("script[src*='tailwindcss']")) {
        console.log("Tailwind mancante, inietto script...");
        const script = document.createElement('script');
        script.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(script);
    }
  }, []);

  // --- LOGICA RADIO ---
  const fetchTrackInfo = async () => {
    try {
      const response = await fetch(RADIO_METADATA_URL);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      
      let title = null;
      if (data.icestats && data.icestats.source) {
        const sources = Array.isArray(data.icestats.source) ? data.icestats.source : [data.icestats.source];
        const source = sources.find(s => s.listenurl.includes("radio.mp3")) || sources[0];
        if (source && source.title) {
          title = source.title;
        } else if (source && source.artist && source.title) {
            title = `${source.artist} - ${source.title}`;
        }
      }
      setCurrentTrack(title || "SMC Radio Live");
    } catch (error) {
      setCurrentTrack("SMC Radio");
    }
  };

  useEffect(() => {
    fetchTrackInfo();
    const interval = setInterval(fetchTrackInfo, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleRadioPlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.src = `${RADIO_STREAM_URL}?t=${Date.now()}`;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Errore riproduzione:", err);
          setIsLoading(false);
        });
    }
  };

  // --- LOGICA WEB TV ---
  useEffect(() => {
    if (activeTab !== 'webtv' || !videoRef.current) return;

    const video = videoRef.current;
    const hlsUrl = WEBTV_STREAM_URL;

    const initHls = () => {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = hlsUrl;
        } 
        else {
            if (window.Hls && window.Hls.isSupported()) {
                 const hls = new window.Hls();
                 hls.loadSource(hlsUrl);
                 hls.attachMedia(video);
            } else {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
                script.async = true;
                script.onload = () => {
                    if (window.Hls && window.Hls.isSupported()) {
                        const hls = new window.Hls();
                        hls.loadSource(hlsUrl);
                        hls.attachMedia(video);
                    }
                };
                document.body.appendChild(script);
            }
        }
    };
    initHls();

    const handleOrientationChange = () => {
        if (window.innerWidth > window.innerHeight) {
            if (video && !document.fullscreenElement) {
                video.requestFullscreen().catch(e => console.log("Auto-fullscreen bloccato:", e));
            }
        }
    };
    window.addEventListener('resize', handleOrientationChange);
    return () => {
        window.removeEventListener('resize', handleOrientationChange);
    };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'webtv' && isPlaying) toggleRadioPlay();
    if (activeTab === 'radio' && videoRef.current) videoRef.current.pause();
  }, [activeTab]);

  const toggleFullScreen = () => {
      if (videoRef.current) {
          if (!document.fullscreenElement) {
              videoRef.current.requestFullscreen().catch(err => console.error(err));
          } else {
              document.exitFullscreen();
          }
      }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans overflow-hidden select-none">
      <audio ref={audioRef} preload="none" crossOrigin="anonymous" />

      <header className="flex-none px-6 py-4 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-10 h-20">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-red-600 rounded-full flex items-center justify-center p-2 shadow-lg shadow-red-600/40 overflow-hidden">
            <img 
              src="https://i.imgur.com/G5g3B8A.png" 
              alt="SMC Logo" 
              className="h-full w-full object-contain" 
            />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none tracking-tight">SMC Radio</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]"></div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {/* RADIO TAB */}
        <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out flex flex-col ${activeTab === 'radio' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black z-0"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay blur-sm"></div>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 space-y-8">
            <div className="relative w-64 h-64 md:w-80 md:h-80 group">
              <div className={`absolute inset-0 bg-red-600 rounded-2xl blur-xl opacity-20 transition-all duration-1000 ${isPlaying ? 'animate-pulse scale-105' : 'scale-100'}`}></div>
              <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-black rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden p-6">
                {isPlaying ? (
                  <div className="text-center space-y-2 animate-fade-in w-full">
                     <div className="flex justify-center items-end space-x-1 h-16 mb-6">
                        <div className="w-3 bg-red-500 animate-[bounce_1s_infinite] h-4 rounded-t-md"></div>
                        <div className="w-3 bg-red-500 animate-[bounce_1.2s_infinite] h-12 rounded-t-md"></div>
                        <div className="w-3 bg-red-500 animate-[bounce_0.8s_infinite] h-8 rounded-t-md"></div>
                        <div className="w-3 bg-red-500 animate-[bounce_1.5s_infinite] h-14 rounded-t-md"></div>
                        <div className="w-3 bg-red-500 animate-[bounce_1.1s_infinite] h-6 rounded-t-md"></div>
                     </div>
                     <p className="text-white font-bold text-xl leading-tight drop-shadow-md line-clamp-3">{currentTrack}</p>
                  </div>
                ) : (
                  <IconMusic size={96} className="text-gray-600" />
                )}
              </div>
            </div>

            <div className="text-center space-y-2 max-w-md px-4">
              <h2 className="text-2xl font-bold text-white leading-snug">
                {isPlaying ? "" : (currentTrack !== "SMC Radio" && currentTrack !== "Caricamento..." ? currentTrack : "Premi Play per ascoltare")}
              </h2>
              {isPlaying && (
                 <p className="text-red-400 text-sm font-medium uppercase tracking-widest animate-pulse">In Onda</p>
              )}
            </div>

            <div className="flex items-center justify-center w-full">
               <button 
                onClick={toggleRadioPlay}
                className="w-24 h-24 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-600/40 transition-all active:scale-95"
               >
                 {isLoading ? (
                   <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                 ) : isPlaying ? (
                   <IconPause size={40} className="fill-current" />
                 ) : (
                   <IconPlay size={40} className="ml-1 fill-current" />
                 )}
               </button>
            </div>
          </div>
        </div>

        {/* TV TAB */}
        <div className={`absolute inset-0 bg-black flex flex-col transition-opacity duration-500 ${activeTab === 'webtv' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
           <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full bg-black">
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                  <video 
                    ref={videoRef}
                    controls 
                    playsInline 
                    className="w-full max-h-full object-contain shadow-2xl"
                    poster="https://placehold.co/1920x1080/1a1a1a/ffffff?text=SMC+Web+TV"
                  >
                    Il tuo browser non supporta il tag video.
                  </video>
                  <div className="absolute top-4 right-4 opacity-0 hover:opacity-100 transition-opacity">
                      <button onClick={toggleFullScreen} className="bg-black/50 p-2 rounded-full text-white hover:bg-red-600 transition-colors">
                          <IconMaximize size={24} />
                      </button>
                  </div>
              </div>
           </div>
        </div>
      </main>

      <nav className="flex-none bg-gray-900/95 backdrop-blur-md border-t border-white/10 pb-safe pt-2 px-6">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setActiveTab('radio')}
            className={`flex flex-col items-center justify-center w-20 space-y-1 transition-colors ${activeTab === 'radio' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <IconRadio size={24} strokeWidth={activeTab === 'radio' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Radio</span>
          </button>
          <div className="w-10"></div>
          <button 
            onClick={() => setActiveTab('webtv')}
            className={`flex flex-col items-center justify-center w-20 space-y-1 transition-colors ${activeTab === 'webtv' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <IconTv size={24} strokeWidth={activeTab === 'webtv' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Web TV</span>
          </button>
        </div>
      </nav>

      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
        @keyframes bounce { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}

/* --- COMPONENTE PRINCIPALE ESPORTATO --- */
export default function App() {
  return (
    <ErrorBoundary>
      <SMCRadioContent />
    </ErrorBoundary>
  );
}