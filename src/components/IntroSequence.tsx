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
    let t: ReturnType<typeof setTimeout>;
    switch (step) {
      case 0:
        t = setTimeout(() => setStep(1), 2500);
        break;
      case 1:
        t = setTimeout(() => setStep(2), 5000);
        break;
      case 2:
        t = setTimeout(() => setStep(3), 5000);
        break;
      case 3:
        t = setTimeout(() => setStep(4), 4000);
        break;
      case 4:
        onComplete();
        break;
    }
    return () => clearTimeout(t);
  }, [step, onComplete]);

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white p-4 text-center">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="fuzzy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FuzzyText>JesnesGalleri</FuzzyText>
          </motion.div>
        )}
        {step === 1 && (
          <motion.div key="t1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TypewriterText
              text="Jeg har jobbet profesjonelt med kunst og design i over fire \u00E5r, inkludert russebuss-prosjekter."
              typingSpeed={40}
              holdDuration={1500}
              onComplete={() => setStep(2)}
            />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="t2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TypewriterText
              text="Jeg har programmert moderne web- og mobilapper i omtrent tre \u00E5r."
              typingSpeed={40}
              holdDuration={1500}
              onComplete={() => setStep(3)}
            />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div key="t3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DecryptedText
              text="Galleriet viser et utvalg av mine kundearbeider."
              animateOn="view"
              sequential
              className="text-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
