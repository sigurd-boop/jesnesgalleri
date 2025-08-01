import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DecryptedText from "./DecryptedText";
import FuzzyText from "./FuzzyText";
import TypewriterText from "./TypewriterText";

interface IntroSequenceProps {
  onComplete: () => void;
}

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (step === 0) {
      t = setTimeout(() => setStep(1), 3000);
    } else if (step === 4) {
      t = setTimeout(() => setStep(5), 3000);
    } else if (step === 6) {
      onComplete();
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [step, onComplete]);

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white p-4 text-center overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="fuzzy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: [0, 40, -40, 0], y: [0, -30, 30, 0] }}
            exit={{ opacity: 0 }}
          >
            <FuzzyText fontSize="clamp(4rem, 12vw, 12rem)">Galleri Jesnes</FuzzyText>
          </motion.div>
        )}
        {step === 1 && (
          <motion.div key="t1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TypewriterText
              text="Velkommen til min digitale portefølje."
              typingSpeed={40}
              holdDuration={2000}
              onComplete={() => setStep(2)}
              className="text-4xl md:text-6xl"
            />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="t2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TypewriterText
              text="Jeg har fire års erfaring med kunst og design, blant annet skreddersydde russebuss-prosjekter."
              typingSpeed={40}
              holdDuration={2500}
              onComplete={() => setStep(3)}
              className="text-3xl md:text-5xl"
            />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div key="t3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TypewriterText
              text="I tre år har jeg utviklet moderne web- og mobilapplikasjoner."
              typingSpeed={40}
              holdDuration={2500}
              onComplete={() => setStep(4)}
              className="text-3xl md:text-5xl"
            />
          </motion.div>
        )}
        {step === 4 && (
          <motion.div key="t4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DecryptedText
              text="Utforsk et utvalg av mine kundearbeider."
              animateOn="view"
              sequential
              className="text-3xl md:text-5xl"
            />
          </motion.div>
        )}
        {step === 5 && (
          <motion.div key="t5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TypewriterText
              text="Galleri Jesnes"
              typingSpeed={60}
              holdDuration={2000}
              onComplete={() => setStep(6)}
              className="text-5xl md:text-7xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
