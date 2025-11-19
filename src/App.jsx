import React, { useState, useRef, useEffect } from 'react';

/* --- COMPONENTE PER CATTURARE ERRORI --- */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error(error, errorInfo); }
  render() { if (this.state.hasError) return <div className="p-4 text-white">Si è verificato un errore. Ricarica la pagina.</div>; return this.props.children; }
}

/* --- ICONE SVG --- */
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
  const [isReady, setIsReady] = useState(false);
  
  // Gestione Copertina
  const [coverUrl, setCoverUrl] = useState("");
  const [imageError, setImageError] = useState(true);

  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const RADIO_STREAM_URL = "https://a2.asurahosting.com:6150/radio.mp3";
  const RADIO_METADATA_URL = "https://a2.asurahosting.com:6150/status-json.xsl";
  const WEBTV_STREAM_URL = "https://f53a8aeeab01477abf3115d5628c70fa.msvdn.net/live/S75918331/aJfIRYHSb0i4/playlist.m3u8";
  const BASE_COVER_URL = "/api/cover"; 

  useEffect(() => {
    const configureApp = () => {
        if (!document.querySelector("meta[name='viewport']")) {
            const meta = document.createElement('meta');
            meta.name = "viewport";
            meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
            document.head.appendChild(meta);
        }
        if (!document.querySelector("script[src*='tailwindcss']")) {
            const script = document.createElement('script');
            script.src = "https://cdn.tailwindcss.com";
            script.onload = () => {
                 setTimeout(() => setIsReady(true), 100);
            };
            document.head.appendChild(script);
        } else {
            setIsReady(true);
        }
    };
    configureApp();
  }, []);

  const fetchTrackInfo = async () => {
    try {
      const response = await fetch(RADIO_METADATA_URL);
      if (!response.ok) throw new Error("Network error");
      const data = await response.json();
      
      let title = null;
      if (data.icestats && data.icestats.source) {
        const sources = Array.isArray(data.icestats.source) ? data.icestats.source : [data.icestats.source];
        const source = sources.find(s => s.listenurl.includes("radio.mp3")) || sources[0];
        if (source && source.title) title = source.title;
        else if (source && source.artist && source.title) title = `${source.artist} - ${source.title}`;
      }
      
      const newTitle = title || "SMC Radio Live";
      setCurrentTrack(prev => {
          if (prev !== newTitle) {
             return newTitle;
          }
          return prev;
      });

    } catch (error) {
      setCurrentTrack("SMC Radio");
    }
  };

  useEffect(() => {
    fetchTrackInfo();
    const interval = setInterval(fetchTrackInfo, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      const timestamp = Date.now();
      setCoverUrl(`${BASE_COVER_URL}?t=${timestamp}`);
      setImageError(false);
  }, [currentTrack]);

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
        .then(() => { setIsPlaying(true); setIsLoading(false); })
        .catch(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    if (activeTab !== 'webtv' || !videoRef.current) return;
    const video = videoRef.current;
    const hlsUrl = WEBTV_STREAM_URL;

    const initHls = () => {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = hlsUrl;
        } else {
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

    const handleResize = () => {
        if (window.innerWidth > window.innerHeight && video && !document.fullscreenElement) {
             video.requestFullscreen().catch(e => {});
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'webtv' && isPlaying) toggleRadioPlay();
    if (activeTab === 'radio' && videoRef.current) videoRef.current.pause();
  }, [activeTab]);

  const toggleFullScreen = () => {
      if (videoRef.current) {
          if (!document.fullscreenElement) videoRef.current.requestFullscreen().catch(() => {});
          else document.exitFullscreen();
      }
  };

  if (!isReady) {
      return <div className="fixed inset-0 bg-black flex items-center justify-center text-white">Caricamento SMC Radio...</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 text-white font-sans overflow-hidden select-none flex flex-col">
      <audio ref={audioRef} preload="none" crossOrigin="anonymous" />

      <header className="flex-none px-4 py-2 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-10 h-16 sm:h-20">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-red-600 rounded-full flex items-center justify-center p-2 shadow-lg shadow-red-600/40 overflow-hidden shrink-0">
            <img src="https://www.smcradio.it/wp-content/uploads/logosmcbianco.png" alt="SMC" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold leading-none tracking-tight truncate">SMC Radio</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]"></div>
        </div>
      </header>

      <main className="flex-1 relative w-full h-full overflow-hidden">
        <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out flex flex-col ${activeTab === 'radio' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black z-0"></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay blur-md transition-all duration-1000" 
               style={{ backgroundImage: `url(${!imageError ? coverUrl : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop'})` }}>
          </div>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 space-y-6 sm:space-y-8 w-full">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 group shrink-0 shadow-2xl rounded-2xl">
              <div className={`absolute inset-0 bg-red-600 rounded-2xl blur-2xl opacity-20 transition-all duration-1000 ${isPlaying ? 'animate-pulse scale-105' : 'scale-100'}`}></div>
              <div className="relative w-full h-full bg-gray-900 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center">
                {!imageError ? (
                    <img 
                        src={coverUrl} 
                        alt="Album Cover" 
                        className="w-full h-full object-cover transition-opacity duration-500"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full p-6">
                        {isPlaying ? (
                           <div className="flex justify-center items-end space-x-1 h-12 sm:h-16">
                                <div className="w-2 sm:w-3 bg-red-500 animate-[bounce_1s_infinite] h-8 rounded-t-md"></div>
                                <div className="w-2 sm:w-3 bg-red-500 animate-[bounce_1.2s_infinite] h-16 rounded-t-md"></div>
                                <div className="w-2 sm:w-3 bg-red-500 animate-[bounce_0.8s_infinite] h-10 rounded-t-md"></div>
                                <div className="w-2 sm:w-3 bg-red-500 animate-[bounce_1.5s_infinite] h-14 rounded-t-md"></div>
                                <div className="w-2 sm:w-3 bg-red-500 animate-[bounce_1.1s_infinite] h-8 rounded-t-md"></div>
                           </div>
                        ) : (
                           <IconMusic size={80} className="text-gray-600" />
                        )}
                    </div>
                )}
              </div>
            </div>

            <div className="text-center space-y-1 max-w-xs sm:max-w-md px-4 z-20">
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug truncate drop-shadow-lg">
                {currentTrack !== "SMC Radio" && currentTrack !== "Caricamento..." ? currentTrack : (isPlaying ? "In Diretta" : "SMC Radio")}
              </h2>
              {isPlaying && (
                 <p className="text-red-400 text-xs sm:text-sm font-medium uppercase tracking-widest animate-pulse">In Onda</p>
              )}
            </div>

            <div className="flex items-center justify-center w-full z-20">
               <button 
                onClick={toggleRadioPlay}
                className="w-20 h-20 sm:w-24 sm:h-24 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-600/40 transition-all active:scale-95"
               >
                 {isLoading ? (
                   <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                 ) : isPlaying ? (
                   <IconPause size={32} className="fill-current sm:w-10 sm:h-10" />
                 ) : (
                   <IconPlay size={32} className="ml-1 fill-current sm:w-10 sm:h-10" />
                 )}
               </button>
            </div>
          </div>
        </div>

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
                  <div className="absolute top-4 right-4 opacity-0 hover:opacity-100 transition-opacity z-20">
                      <button onClick={toggleFullScreen} className="bg-black/50 p-2 rounded-full text-white hover:bg-red-600 transition-colors">
                          <IconMaximize size={24} />
                      </button>
                  </div>
              </div>
           </div>
        </div>
      </main>

      <nav className="flex-none bg-gray-900/95 backdrop-blur-md border-t border-white/10 pb-safe pt-2 px-6">
        <div className="flex justify-around items-center h-16 sm:h-20">
          <button 
            onClick={() => setActiveTab('radio')}
            className={`flex flex-col items-center justify-center w-20 space-y-1 transition-colors ${activeTab === 'radio' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <IconRadio size={24} strokeWidth={activeTab === 'radio' ? 2.5 : 2} />
            <span className="text-[10px] sm:text-xs font-medium">Radio</span>
          </button>
          <div className="w-10"></div>
          <button 
            onClick={() => setActiveTab('webtv')}
            className={`flex flex-col items-center justify-center w-20 space-y-1 transition-colors ${activeTab === 'webtv' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <IconTv size={24} strokeWidth={activeTab === 'webtv' ? 2.5 : 2} />
            <span className="text-[10px] sm:text-xs font-medium">Web TV</span>
          </button>
        </div>
      </nav>

      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
        @keyframes bounce { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
      `}</style>
    </div>
  );
}

export default function App() {
  return <ErrorBoundary><SMCRadioContent /></ErrorBoundary>;
}