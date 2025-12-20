import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  pauseDuration?: number;
  onComplete?: () => void;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  text, 
  speed = 100, 
  pauseDuration = 2000,
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const indexRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText('');
    setShowCursor(true);
    indexRef.current = 0;
    
    if (timerRef.current) clearInterval(timerRef.current);

    // Start typing
    timerRef.current = window.setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current));
        indexRef.current++;
      } else {
        // Typing finished
        if (timerRef.current) clearInterval(timerRef.current);
        
        // Wait for pauseDuration then call onComplete
        setTimeout(() => {
          if (onComplete) onComplete();
        }, pauseDuration);
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed, pauseDuration, onComplete]);

  return (
    <div className="inline-block">
      <span className="text-green-300 drop-shadow-[0_0_5px_rgba(0,255,0,0.8)] font-mono text-xl md:text-2xl">
        {displayedText}
      </span>
      <span className={`inline-block w-[3px] h-[24px] md:h-[30px] bg-yellow-400 ml-1 align-bottom ${showCursor ? 'opacity-100' : 'opacity-0'} animate-[blink_1s_infinite]`}></span>
    </div>
  );
};

export default TypewriterText;