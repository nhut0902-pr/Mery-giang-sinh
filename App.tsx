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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startExperience = () => {
    setStarted(true);
    if (audioRef.current) {
      // Tải lại audio để đảm bảo source mới nhất được nhận diện sau tương tác người dùng
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
    
    // Tự động hiện thiệp sau 10 giây
    setTimeout(() => {
      setShowCard(true);
    }, 10000);
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

  // Đồng bộ trạng thái UI với trạng thái thực tế của thẻ audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsMuted(false);
      setAudioError(false);
    };
    const handlePause = () => setIsMuted(true);
    const handleError = () => {
      console.error("Audio path error or file not found:", AUDIO_URL);
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

  return (
    <div className="relative w-full h-screen bg-[radial-gradient(ellipse_at_center,_#1b2735_0%,_#090a0f_100%)] overflow-hidden text-white flex flex-col">
      {/* Background Audio - Sử dụng preload auto để trình duyệt chuẩn bị sẵn dữ liệu */}
      <audio ref={audioRef} src={AUDIO_URL} loop preload="auto" />

      {/* Snow Effect */}
      <Snow />

      {/* Music Control Button */}
      {started && (
        <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2">
          <button 
            onClick={toggleMusic}
            className={`p-3 rounded-full backdrop-blur border transition-all text-xl pointer-events-auto shadow-lg ${
              isMuted ? 'bg-red-500/20 border-red-500/50' : 'bg-white/10 border-white/30 hover:bg-white/20'
            }`}
            title={isMuted ? "Phát nhạc" : "Tạm dừng"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          {audioError && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-red-400 bg-black/70 px-2 py-1 rounded border border-red-500/30 animate-pulse font-mono">
                Lỗi: Không tìm thấy "assets/music.mp3"
              </span>
              <span className="text-[9px] text-gray-400 mt-1 italic">Vui lòng kiểm tra lại tên file</span>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 relative flex flex-col items-center justify-center z-10 pointer-events-none">
        
        {/* Header Text */}
        <div className={`w-full transition-all duration-1000 transform ${started ? 'translate-y-[-180px] md:translate-y-[-220px] scale-75' : 'translate-y-[-60px]'}`}>
          <h1 className="text-3xl md:text-6xl text-yellow-400 font-bold tracking-wider drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] text-center mb-4">
            MERRY CHRISTMAS
          </h1>
          {started && (
             <div className="w-full h-12 md:h-16 relative overflow-hidden pointer-events-none">
                <div 
                  key={currentGreeting}
                  className="absolute top-0 whitespace-nowrap text-2xl md:text-4xl text-green-300 font-bold drop-shadow-[0_0_5px_rgba(0,255,0,0.8)]"
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
        </div>

        {/* Start Button / Star Interaction */}
        {!started && (
          <div className="flex flex-col items-center animate-[float_3s_ease-in-out_infinite] pointer-events-auto cursor-pointer" onClick={startExperience}>
             <div className="text-yellow-300 text-7xl md:text-8xl drop-shadow-[0_0_25px_rgba(255,215,0,1)] transition-transform hover:scale-110 active:scale-95">
               ★
             </div>
             <p className="mt-4 text-gray-300 text-lg md:text-xl font-mono border border-gray-600 px-4 py-2 rounded bg-black/40 backdrop-blur-sm shadow-xl">
               ⚠️ Chạm vào ngôi sao ⚠️
             </p>
          </div>
        )}

        {/* The Tree */}
        <div className={`transition-opacity duration-1000 ${started ? 'opacity-100' : 'opacity-0'}`}>
          <Tree isVisible={started} />
        </div>

      </div>

      {/* Floating Buttons/Controls (Reopening card) */}
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
      
      {/* Footer / Copyright & Donation */}
      <div className="w-full pb-8 pt-4 text-center z-30 flex flex-col items-center gap-2 bg-gradient-to-t from-black/90 to-transparent">
         <p className="text-gray-400 text-xs md:text-sm font-mono opacity-90 pointer-events-none">
            Powered By <span className="text-red-400 font-bold">Nhutcoder</span>
         </p>
         <a 
            href="https://www.facebook.com/share/1CQSP8hUo3/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="pointer-events-auto text-[10px] md:text-xs text-yellow-500 hover:text-yellow-300 underline underline-offset-4 transition-colors font-mono font-bold bg-black/40 px-4 py-1.5 rounded-full border border-yellow-500/30 shadow-md mb-2"
         >
            ☕ Ủng hộ tớ tại đây
         </a>
      </div>
    </div>
  );
};

export default App;