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

      {/* Floating Buttons/Controls (Optional - for reopening card) */}
      {started && !showCard && (
        <button 
          onClick={() => setShowCard(true)}
          className="absolute bottom-10 right-10 pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur text-white border border-white/30 rounded-full w-12 h-12 flex items-center justify-center transition-all z-20 animate-bounce"
          title="Open Card"
        >
          💌
        </button>
      )}

      {/* Message Card */}
      {showCard && (
        <div className="pointer-events-auto">
            <Card onClose={() => setShowCard(false)} />
        </div>
      )}
      
      {/* Footer / Copyright */}
      <div className="absolute bottom-4 left-0 w-full text-center text-gray-600 text-sm pointer-events-none">
         Designed with ❤️ for Christmas
      </div>
    </div>
  );
};

export default App;