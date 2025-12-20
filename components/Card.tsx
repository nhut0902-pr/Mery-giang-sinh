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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 backdrop-blur-sm animate-[appear_0.5s_ease-out]">
      <div 
        className="relative bg-[#fff0f5] border-4 border-pink-300 rounded-xl p-6 md:p-8 max-w-md w-full shadow-[0_0_50px_rgba(255,192,203,0.6)] text-center text-[#333] font-['Mallanna',_sans-serif]"
        onClick={handleSkip}
      >
        
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-red-500 transition-colors z-10"
        >
          &times;
        </button>

        <div className="mb-4">
          <span className="text-3xl text-red-500">🎄 Gửi Bạn Yêu 🎄</span>
        </div>

        <div 
            ref={containerRef}
            className="space-y-4 text-lg md:text-xl leading-relaxed font-semibold min-h-[220px] text-left select-none cursor-pointer"
            title="Click to show all text"
        >
          {displayedLines.map((text, idx) => (
             // Only render lines that have started typing
             (idx <= lineIndex) && (
                 <p key={idx}>
                   {text}
                   {/* Cursor: Show only on the active line being typed */}
                   {idx === lineIndex && lineIndex < LINES.length && (
                     <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} inline-block w-[2px] h-[1.2em] bg-pink-500 ml-1 align-bottom`}></span>
                   )}
                 </p>
             )
          ))}
        </div>

        <div className={`mt-6 text-pink-500 font-bold text-xl transition-all duration-1000 ${lineIndex >= LINES.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Merry Christmas! ❤️
        </div>
        
        {lineIndex < LINES.length && (
            <div className="absolute bottom-2 right-4 text-xs text-gray-400 italic animate-pulse">
                Click to skip...
            </div>
        )}
      </div>
    </div>
  );
};

export default Card;