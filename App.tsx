import React, { useState, useRef, useCallback, useEffect } from 'react';
import Snow from './components/Snow';
import Tree from './components/Tree';
import Card from './components/Card';
import { GREETINGS, AUDIO_URL } from './constants';

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [currentGreeting, setCurrentGreeting] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [cdText, setCdText] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startExperience = () => {
    setStarted(true);
    playMusic();

    // Tự động hiện thiệp sau 10 giây
    setTimeout(() => {
      setShowCard(true);
    }, 10000);
  };

  const playMusic = () => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          console.log("Audio playing successfully");
          setAudioError(false);
          setIsMuted(false);
        })
        .catch(e => {
          console.error("Audio play failed:", e);
          setAudioError(true);
        });
      audioRef.current.volume = 0.5;
    }
  };

  const handleNextGreeting = useCallback(() => {
    setCurrentGreeting((prev) => (prev + 1) % GREETINGS.length);
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().then(() => {
          setIsMuted(false);
          setAudioError(false);
        }).catch(() => setAudioError(true));
      } else {
        audioRef.current.pause();
        setIsMuted(true);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsMuted(false);
      setAudioError(false);
    };
    const handlePause = () => setIsMuted(true);
    const handleError = (e: any) => {
      console.error("Audio error event:", e);
      setAudioError(true);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Đếm ngược đến Giáng Sinh
  useEffect(() => {
    if (!started) return;
    const tick = () => {
      const now = new Date();
      const tgt = new Date(now.getFullYear(), 11, 25);
      if (now > tgt) tgt.setFullYear(tgt.getFullYear() + 1);
      const d = Math.ceil((tgt.getTime() - now.getTime()) / 864e5);
      setCdText(d === 0 ? '🎄 Hôm nay là Giáng Sinh! ❤' : `🎄 Còn ${d} ngày đến Giáng Sinh`);
    };
    tick();
    const it = setInterval(tick, 60000);
    return () => clearInterval(it);
  }, [started]);

  return (
    <div className="relative w-full h-screen bg-[radial-gradient(ellipse_at_center,_#1b2735_0%,_#090a0f_100%)] overflow-hidden text-white flex flex-col">
      {/* Background Audio */}
      <audio
        ref={audioRef}
        src={AUDIO_URL}
        loop
        preload="auto"
        crossOrigin="anonymous"
        onError={() => setAudioError(true)}
      />

      {/* Snow + Stars + Moon */}
      <Snow />

      {/* Music Control & Error Messages */}
      {started && (
        <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-3">
          <button
            onClick={toggleMusic}
            className={`p-3 rounded-full backdrop-blur border transition-all text-xl pointer-events-auto shadow-lg ${
              isMuted ? 'bg-red-500/30 border-red-500/50' : 'bg-white/10 border-white/30 hover:bg-white/20'
            }`}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          {audioError && (
            <div className="flex flex-col items-end gap-1 animate-[appear_0.3s_ease-out]">
              <div className="bg-black/80 border border-red-500/40 p-2 rounded-lg text-right shadow-2xl">
                <p className="text-[11px] text-red-400 font-bold font-mono">⚠️ KHÔNG TẢI ĐƯỢC NHẠC</p>
                <p className="text-[9px] text-gray-400 font-mono italic max-w-[200px] break-all">Kiểm tra kết nối mạng hoặc link nhạc</p>
                <button
                  onClick={(e) => { e.stopPropagation(); playMusic(); }}
                  className="mt-2 text-[10px] bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 px-2 py-1 rounded transition-colors text-white font-mono pointer-events-auto"
                >
                  🔄 THỬ LẠI
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 relative flex flex-col items-center justify-center z-10 pointer-events-none">

        {/* Header Text */}
        <div className={`w-full transition-all duration-1000 transform ${started ? 'translate-y-0' : 'translate-y-[-60px]'}`}>
          <h1
            className="text-5xl md:text-7xl text-center mb-3"
            style={{
              fontFamily: "'Great Vibes', cursive",
              background: 'linear-gradient(180deg,#fff6cf 0%,#ffd36a 55%,#dfa63a 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              filter: 'drop-shadow(0 0 14px rgba(255,210,100,.55))'
            }}
          >
            Merry Christmas
          </h1>
          {started && (
             <div className="w-full h-10 md:h-14 relative overflow-hidden pointer-events-none">
                <div
                  key={currentGreeting}
                  className="absolute top-0 whitespace-nowrap text-xl md:text-3xl text-amber-200 font-semibold tracking-wide drop-shadow-[0_0_10px_rgba(255,200,90,.75)]"
                  style={{
                    animation: 'run 10s linear forwards',
                    willChange: 'transform'
                  }}
                  onAnimationEnd={handleNextGreeting}
                >
                  🎄 {GREETINGS[currentGreeting].text} 🎄
                </div>
             </div>
          )}
          {started && cdText && (
            <div className="mt-1 text-center">
              <span className="inline-block text-[11px] md:text-xs text-amber-100/90 bg-black/40 border border-amber-400/30 rounded-full px-3.5 py-1 backdrop-blur-sm">
                {cdText}
              </span>
            </div>
          )}
        </div>

        {/* Start Button / Star Interaction */}
        {!started && (
          <div className="relative flex flex-col items-center animate-[float_3s_ease-in-out_infinite] pointer-events-auto cursor-pointer" onClick={startExperience}>
             <div className="relative grid place-items-center">
               <span className="absolute w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-yellow-300/60 animate-[slowPing_1.8s_ease-out_infinite]"></span>
               <span className="absolute w-28 h-28 md:w-32 md:h-32 rounded-full border border-yellow-300/40 animate-[slowPing_1.8s_ease-out_infinite_0.9s]"></span>
               <div className="relative text-yellow-300 text-7xl md:text-8xl drop-shadow-[0_0_30px_rgba(255,215,0,1)] transition-transform hover:scale-110 active:scale-95">
                 ★
               </div>
             </div>
             <p className="mt-5 text-amber-100 text-lg md:text-xl px-5 py-2 rounded-full bg-black/40 border border-amber-300/40 backdrop-blur-sm shadow-xl">
               ✨ Chạm vào ngôi sao ✨
             </p>
          </div>
        )}

        {/* The Tree */}
        <div className={`transition-opacity duration-1000 ${started ? 'opacity-100' : 'opacity-0'}`}>
          <Tree isVisible={started} />
        </div>

      </div>

      {/* Floating Buttons/Controls */}
      {started && !showCard && (
        <button
          onClick={() => setShowCard(true)}
          className="absolute bottom-32 right-6 md:right-10 pointer-events-auto bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-red-400/60 rounded-full w-12 h-12 flex items-center justify-center transition-all z-20 animate-bounce shadow-[0_0_15px_rgba(255,100,100,0.4)] group"
          title="Mở thiệp chúc mừng"
        >
          <span className="text-xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">💌</span>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border border-white animate-pulse"></div>
        </button>
      )}

      {/* Message Card */}
      {showCard && (
        <div className="pointer-events-auto">
            <Card onClose={() => setShowCard(false)} />
        </div>
      )}

      {/* Footer / Info & Links */}
      <div className="w-full pb-6 pt-4 text-center z-30 flex flex-col items-center gap-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
         <p className="text-gray-400 text-xs md:text-sm font-mono opacity-90 pointer-events-none mb-1">
            Powered By <span className="text-red-400 font-bold">Nhutcoder</span>
         </p>

         <div className="flex flex-wrap justify-center gap-2 md:gap-4 px-4">
            <a
                href="https://www.facebook.com/share/1CQSP8hUo3/"
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto text-[10px] md:text-xs text-yellow-500 hover:text-yellow-300 underline underline-offset-4 transition-colors font-mono font-bold bg-black/40 px-3 py-1.5 rounded-full border border-yellow-500/30 shadow-md"
            >
                ☕ Donate cho mình
            </a>

            <a
                href="https://blog-89b4.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto text-[10px] md:text-xs text-green-400 hover:text-green-300 underline underline-offset-4 transition-colors font-mono font-bold bg-black/40 px-3 py-1.5 rounded-full border border-green-500/30 shadow-md"
            >
                📖 Đọc Blog
            </a>

            <a
                href="https://giaydephuongnho.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto text-[10px] md:text-xs text-red-400 hover:text-red-300 underline underline-offset-4 transition-colors font-mono font-bold bg-black/40 px-3 py-1.5 rounded-full border border-red-500/30 shadow-md"
            >
                👟 Mua giày dép
            </a>
         </div>
      </div>

    </div>
  );
};

export default App;
