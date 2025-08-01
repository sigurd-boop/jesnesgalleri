import { motion } from "framer-motion";

interface IconCircleProps {
  size?: number;
  spinDuration?: number;
}

const icons = [
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    alt: "React",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
    alt: "Java",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
    alt: "C#",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    alt: "JavaScript",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
    alt: "TypeScript",
  },
];

export default function IconCircle({ size = 220, spinDuration = 20 }: IconCircleProps) {
  return (
    <motion.div
      className="relative text-white"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, ease: "linear", duration: spinDuration }}
    >
      {icons.map((ic, i) => {
        const angle = (360 / icons.length) * i;
        const radius = size / 2 - 30;
        const transform = `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`;
        return (
          <img
            key={i}
            src={ic.src}
            alt={ic.alt}
            className="absolute left-1/2 top-1/2 w-10 h-10"
            style={{ transform, transformOrigin: "0 0" }}
          />
        );
      })}
      <div className="absolute inset-0 flex items-center justify-center font-bold text-center">
        Gallerijesnes
      </div>
    </motion.div>
  );
}
