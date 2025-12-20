import React, { useState, useRef, useCallback } from 'react';
import Snow from './components/Snow';
import Tree from './components/Tree';
import Card from './components/Card';
import { GREETINGS, AUDIO_URL } from './constants';

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [currentGreeting, setCurrentGreeting] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startExperience = () => {
    setStarted(true);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed (user interaction required):", e));
      audioRef.current.volume = 0.5;
    }
    
    // Show card automatically after 10 seconds
    setTimeout(() => {
      setShowCard(true);
    }, 10000);
  };

  const handleNextGreeting = useCallback(() => {
    setCurrentGreeting((prev) => (prev + 1) % GREETINGS.length);
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[radial-gradient(ellipse_at_center,_#1b2735_0%,_#090a0f_100%)] overflow-hidden text-white">
      {/* Background Audio */}
      <audio ref={audioRef} src={AUDIO_URL} loop />

      {/* Snow Effect */}
      <Snow />

      {/* Music Control Button */}
      {started && (
        <button 
          onClick={toggleMusic}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/30 transition-all text-xl"
          title={isMuted ? "Play Music" : "Pause Music"}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        
        {/* Header Text */}
        <div className={`w-full transition-all duration-1000 transform ${started ? 'translate-y-[-250px] scale-75' : 'translate-y-[-100px]'}`}>
          <h1 className="text-4xl md:text-6xl text-yellow-400 font-bold tracking-wider drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] text-center mb-4">
            MERRY CHRISTMAS
          </h1>
          {started && (
             <div className="w-full h-16 relative overflow-hidden pointer-events-none">
                <div 
                  key={currentGreeting}
                  className="absolute top-0 whitespace-nowrap text-3xl md:text-4xl text-green-300 font-bold drop-shadow-[0_0_5px_rgba(0,255,0,0.8)]"
                  style={{ 
                    // animation: run duration timing-function delay iteration-count direction fill-mode
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
             <div className="text-yellow-300 text-8xl drop-shadow-[0_0_25px_rgba(255,215,0,1)] transition-transform hover:scale-110 active:scale-95">
               ★
             </div>
             <p className="mt-4 text-gray-300 text-xl font-mono border border-gray-600 px-4 py-2 rounded bg-black/40 backdrop-blur-sm">
               ⚠️ Chạm vào ngôi sao ⚠️
             </p>
          </div>
        )}

        {/* The Tree */}
        <div className={`transition-opacity duration-1000 ${started ? 'opacity-100' : 'opacity-0'}`}>
          <Tree isVisible={started} />
        </div>

      </div>

      {/* Floating Buttons/Controls (Reopening card) - Resized to be smaller */}
      {started && !showCard && (
        <button 
          onClick={() => setShowCard(true)}
          className="absolute bottom-40 right-8 md:right-12 pointer-events-auto bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-red-400/60 rounded-full w-14 h-14 flex items-center justify-center transition-all z-20 animate-bounce shadow-[0_0_15px_rgba(255,100,100,0.4)] group"
          title="Mở thiệp chúc mừng"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">💌</span>
          <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border border-white animate-pulse"></div>
        </button>
      )}

      {/* Message Card */}
      {showCard && (
        <div className="pointer-events-auto">
            <Card onClose={() => setShowCard(false)} />
        </div>
      )}
      
      {/* Footer / Copyright & Donation */}
      <div className="absolute bottom-4 left-0 w-full text-center z-30 flex flex-col items-center gap-1">
         <p className="text-gray-500 text-sm font-mono opacity-80 pointer-events-none">
            Powered By <span className="text-red-400 font-bold">Nhutcoder</span>
         </p>
         <a 
            href="https://www.facebook.com/share/1CQSP8hUo3/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="pointer-events-auto text-xs text-yellow-500/80 hover:text-yellow-400 underline underline-offset-4 transition-colors font-mono"
         >
            ☕ Ủng hộ tớ tại đây
         </a>
      </div>
    </div>
  );
};

export default App;