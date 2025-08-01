import React, { useState } from "react";
import CircularText from "./CircularText";
import { motion } from "framer-motion";
import "../ShakeButton.css";

const WelcomeSection: React.FC = () => {
  const [bonkers, setBonkers] = useState(false);
  const [superBonkers, setSuperBonkers] = useState(false);

  const handleExploreClick = () => {
    const gallerySection = document.getElementById("gallery");
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Determine spin speed
  const spinMode = superBonkers
    ? "goBonkers"
    : bonkers
    ? "goBonkers"
    : "speedUp";
  const spinSpeed = superBonkers ? 5 : 20; // 5 = very fast

  return (
    <motion.section
      className="relative h-screen flex flex-col items-center justify-center bg-black text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Wrapper for hover on circle */}
      <motion.div
        className="relative flex items-center justify-center"
        onMouseEnter={() => setBonkers(true)}
        onMouseLeave={() => {
          setBonkers(false);
          setSuperBonkers(false);
        }}
      >
        {/* CircularText */}
        <CircularText
          text="JESNESGALLERI"
          onHover={spinMode}
          spinDuration={spinSpeed}
          className="border border-white"
        />

        {/* Explore Button */}
        <motion.button
          className={`${bonkers ? "shake" : ""} absolute`}
          style={{
            background: "#ffffff",
            color: "#000000",
            fontWeight: "bold",
            fontSize: "0.8rem",
            height: "2.2em",
            width: "6em",
            borderRadius: "10em",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={() => setSuperBonkers(true)}
          onMouseLeave={() => setSuperBonkers(false)}
          onClick={handleExploreClick}
          animate={bonkers ? { rotate: [0, 10, -10, 10, 0] } : {}}
          transition={{ repeat: bonkers ? Infinity : 0, duration: 0.2 }}
        >
          Explore
        </motion.button>
      </motion.div>
    </motion.section>
  );
};

export default WelcomeSection;
