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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm animate-[appear_0.5s_ease-out]">
      <div 
        className="relative bg-[#fffaff] border-[4px] border-red-400 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-[0_0_50px_rgba(255,50,50,0.3)] text-center text-[#222] font-['Mallanna',_sans-serif] transform md:-translate-y-8 transition-transform hover:scale-[1.01]"
        onClick={handleSkip}
      >
        
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute -top-3 -right-3 w-8 h-8 bg-white border-2 border-red-400 rounded-full flex items-center justify-center text-xl text-red-500 hover:bg-red-500 hover:text-white transition-all z-20 shadow-md"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="mb-4">
          <h2 className="text-3xl md:text-4xl text-red-600 font-bold drop-shadow-sm">🎄 Thư Chúc Mừng 🎄</h2>
          <div className="w-16 h-1 bg-red-400 mx-auto mt-1 rounded-full"></div>
        </div>

        <div 
            ref={containerRef}
            className="space-y-4 text-lg md:text-xl leading-snug font-semibold min-h-[180px] text-left select-none cursor-pointer"
            title="Nhấn để hiện tất cả chữ"
        >
          {displayedLines.map((text, idx) => (
             (idx <= lineIndex) && (
                 <p key={idx} className="bg-red-50/50 p-2 rounded-lg border-l-2 border-red-200">
                   {text}
                   {idx === lineIndex && lineIndex < LINES.length && (
                     <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} inline-block w-[2px] h-[1.1em] bg-red-600 ml-1 align-bottom`}></span>
                   )}
                 </p>
             )
          ))}
        </div>

        <div className={`mt-6 text-red-600 font-bold text-xl md:text-2xl transition-all duration-1000 ${lineIndex >= LINES.length ? 'opacity-100 scale-105' : 'opacity-0 translate-y-2'}`}>
          Giáng Sinh Vui Vẻ! ❤️
        </div>
        
        {lineIndex < LINES.length && (
            <div className="absolute bottom-2 right-4 text-[10px] text-gray-400 italic animate-pulse">
                Chạm để xem hết...
            </div>
        )}
      </div>
    </div>
  );
};

export default Card;