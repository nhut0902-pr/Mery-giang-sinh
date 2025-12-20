import React, { useState, useEffect, useRef } from 'react';

interface CardProps {
  onClose: () => void;
}

const LINES = [
  "Chúc bạn một mùa Giáng Sinh thật ấm áp và tràn đầy yêu thương!",
  "Mong rằng những ngày lễ này sẽ mang đến cho bạn những khoảnh khắc tuyệt vời bên gia đình và người thân.",
  "Cảm ơn bạn vì đã luôn ở bên và chia sẻ những niềm vui trong năm qua. Chúc bạn năm mới an khang, hạnh phúc và thành công!"
];

const Card: React.FC<CardProps> = ({ onClose }) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>(["", "", ""]);
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Typing effect
  useEffect(() => {
    if (lineIndex >= LINES.length) return;

    const timer = setTimeout(() => {
      setDisplayedLines(prev => {
        const newLines = [...prev];
        const currentLineText = LINES[lineIndex];
        // Ensure we don't go out of bounds
        if (charIndex < currentLineText.length) {
            newLines[lineIndex] = currentLineText.substring(0, charIndex + 1);
        }
        return newLines;
      });

      if (charIndex + 1 < LINES[lineIndex].length) {
        setCharIndex(prev => prev + 1);
      } else {
        // Delay before starting next line
        setTimeout(() => {
            setLineIndex(prev => prev + 1);
            setCharIndex(0);
        }, 300);
      }
    }, 50); // Adjust typing speed here (lower is faster)

    return () => clearTimeout(timer);
  }, [lineIndex, charIndex]);

  // Handle skip animation
  const handleSkip = () => {
    setDisplayedLines(LINES);
    setLineIndex(LINES.length);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-md animate-[appear_0.5s_ease-out]">
      <div 
        className="relative bg-[#fffaff] border-[6px] border-red-400 rounded-3xl p-8 md:p-10 max-w-lg w-full shadow-[0_0_80px_rgba(255,50,50,0.5)] text-center text-[#222] font-['Mallanna',_sans-serif] transform -translate-y-12 transition-transform hover:scale-[1.02]"
        onClick={handleSkip}
      >
        
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute -top-4 -right-4 w-10 h-10 bg-white border-4 border-red-400 rounded-full flex items-center justify-center text-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all z-20 shadow-lg"
        >
          &times;
        </button>

        <div className="mb-6">
          <h2 className="text-4xl md:text-5xl text-red-600 font-bold drop-shadow-sm">🎄 Thư Chúc Mừng 🎄</h2>
          <div className="w-24 h-1 bg-red-400 mx-auto mt-2 rounded-full"></div>
        </div>

        <div 
            ref={containerRef}
            className="space-y-6 text-xl md:text-2xl leading-relaxed font-semibold min-h-[250px] text-left select-none cursor-pointer"
            title="Nhấn để hiện tất cả chữ"
        >
          {displayedLines.map((text, idx) => (
             // Only render lines that have started typing
             (idx <= lineIndex) && (
                 <p key={idx} className="bg-red-50/50 p-2 rounded-lg">
                   {text}
                   {/* Cursor: Show only on the active line being typed */}
                   {idx === lineIndex && lineIndex < LINES.length && (
                     <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} inline-block w-[3px] h-[1.2em] bg-red-600 ml-1 align-bottom`}></span>
                   )}
                 </p>
             )
          ))}
        </div>

        <div className={`mt-8 text-red-600 font-bold text-2xl md:text-3xl transition-all duration-1000 ${lineIndex >= LINES.length ? 'opacity-100 scale-110' : 'opacity-0 scale-90 translate-y-4'}`}>
          Giáng Sinh Vui Vẻ! ❤️
        </div>
        
        {lineIndex < LINES.length && (
            <div className="absolute bottom-4 right-6 text-sm text-gray-400 italic animate-pulse">
                Chạm để xem hết...
            </div>
        )}
      </div>
    </div>
  );
};

export default Card;