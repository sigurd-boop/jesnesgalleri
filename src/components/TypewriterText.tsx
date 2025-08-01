import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  typingSpeed?: number;
  holdDuration?: number;
  className?: string;
  onComplete?: () => void;
}

export default function TypewriterText({
  text,
  typingSpeed = 50,
  holdDuration = 1000,
  className = "",
  onComplete,
}: TypewriterTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (index < text.length) {
      timeout = setTimeout(() => setIndex((i) => i + 1), typingSpeed);
    } else {
      timeout = setTimeout(() => onComplete?.(), holdDuration);
    }
    return () => clearTimeout(timeout);
  }, [index, typingSpeed, holdDuration, text, onComplete]);

  return (
    <span className={`whitespace-pre ${className}`}>
      {text.slice(0, index)}
      <span className="animate-blink">|</span>
    </span>
  );
}
