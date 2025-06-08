"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Headphones, Mic, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// Text Rotate Component
interface TextRotateProps {
  texts: string[];
  rotationInterval?: number;
  initial?: any;
  animate?: any;
  exit?: any;
  animatePresenceMode?: "wait" | "sync" | "popLayout";
  animatePresenceInitial?: boolean;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | number | "random";
  transition?: any;
  loop?: boolean;
  auto?: boolean;
  splitBy?: "words" | "characters" | "lines" | string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

interface WordObject {
  characters: string[];
  needsSpace: boolean;
}

const TextRotate = React.forwardRef<HTMLSpanElement, TextRotateProps>(
  (
    {
      texts,
      transition = { type: "spring", damping: 25, stiffness: 300 },
      initial = { y: "100%", opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: "-120%", opacity: 0 },
      animatePresenceMode = "wait",
      animatePresenceInitial = false,
      rotationInterval = 2000,
      staggerDuration = 0,
      staggerFrom = "first",
      loop = true,
      auto = true,
      splitBy = "characters",
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      ...props
    },
    ref
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const splitIntoCharacters = (text: string): string[] => {
      if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
        const segmenter = new (Intl as any).Segmenter("en", { granularity: "grapheme" });
        return Array.from(segmenter.segment(text), ({ segment }: any) => segment);
      }
      return Array.from(text);
    };

    const elements = React.useMemo(() => {
      const currentText = texts[currentTextIndex];
      if (splitBy === "characters") {
        const text = currentText.split(" ");
        return text.map((word, i) => ({
          characters: splitIntoCharacters(word),
          needsSpace: i !== text.length - 1,
        }));
      }
      return splitBy === "words"
        ? currentText.split(" ")
        : splitBy === "lines"
          ? currentText.split("\n")
          : currentText.split(splitBy);
    }, [texts, currentTextIndex, splitBy]);

    const getStaggerDelay = useCallback(
      (index: number, totalChars: number) => {
        const total = totalChars;
        if (staggerFrom === "first") return index * staggerDuration;
        if (staggerFrom === "last") return (total - 1 - index) * staggerDuration;
        if (staggerFrom === "center") {
          const center = Math.floor(total / 2);
          return Math.abs(center - index) * staggerDuration;
        }
        if (staggerFrom === "random") {
          const randomIndex = Math.floor(Math.random() * total);
          return Math.abs(randomIndex - index) * staggerDuration;
        }
        return Math.abs((staggerFrom as number) - index) * staggerDuration;
      },
      [staggerFrom, staggerDuration]
    );

    const handleIndexChange = useCallback((newIndex: number) => {
      setCurrentTextIndex(newIndex);
      onNext?.(newIndex);
    }, [onNext]);

    const next = useCallback(() => {
      const nextIndex = currentTextIndex === texts.length - 1
        ? (loop ? 0 : currentTextIndex)
        : currentTextIndex + 1;
      
      if (nextIndex !== currentTextIndex) {
        handleIndexChange(nextIndex);
      }
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    useEffect(() => {
      if (!auto) return;
      const intervalId = setInterval(next, rotationInterval);
      return () => clearInterval(intervalId);
    }, [next, rotationInterval, auto]);

    return (
      <motion.span
        className={cn("flex flex-wrap whitespace-pre-wrap", mainClassName)}
        {...props}
        layout
        transition={transition}
        ref={ref}
      >
        <span className="sr-only">{texts[currentTextIndex]}</span>

        <AnimatePresence
          mode={animatePresenceMode}
          initial={animatePresenceInitial}
        >
          <motion.div
            key={currentTextIndex}
            className={cn(
              "flex flex-wrap",
              splitBy === "lines" && "flex-col w-full"
            )}
            layout
            aria-hidden="true"
          >
            {(splitBy === "characters"
              ? (elements as WordObject[])
              : (elements as string[]).map((el, i) => ({
                  characters: [el],
                  needsSpace: i !== elements.length - 1,
                }))
            ).map((wordObj, wordIndex, array) => {
              const previousCharsCount = array
                .slice(0, wordIndex)
                .reduce((sum, word) => sum + word.characters.length, 0);

              return (
                <span
                  key={wordIndex}
                  className={cn("inline-flex", splitLevelClassName)}
                >
                  {wordObj.characters.map((char, charIndex) => (
                    <motion.span
                      initial={initial}
                      animate={animate}
                      exit={exit}
                      key={charIndex}
                      transition={{
                        ...transition,
                        delay: getStaggerDelay(
                          previousCharsCount + charIndex,
                          array.reduce(
                            (sum, word) => sum + word.characters.length,
                            0
                          )
                        ),
                      }}
                      className={cn("inline-block", elementLevelClassName)}
                    >
                      {char}
                    </motion.span>
                  ))}
                  {wordObj.needsSpace && (
                    <span className="whitespace-pre"> </span>
                  )}
                </span>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </motion.span>
    );
  }
);

TextRotate.displayName = "TextRotate";

// Colorful Button Component
interface ButtonColorfulProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

function ButtonColorful({
  className,
  label = "Explore Components",
  ...props
}: ButtonColorfulProps) {
  return (
    <Button
      className={cn(
        "relative h-12 px-6 overflow-hidden",
        "button-gradient-primary",
        "transition-all duration-200",
        "group",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0",
          "bg-gradient-to-r from-accent-teal-400 via-accent-mint-400 to-accent-persian-500",
          "opacity-40 group-hover:opacity-80",
          "blur transition-opacity duration-500"
        )}
      />
      <div className="relative flex items-center justify-center gap-2">
        <span className="text-text-cream100 font-semibold">{label}</span>
        <Music className="w-4 h-4 text-text-cream100/90" />
      </div>
    </Button>
  );
}

// Floating shapes component
function FloatingShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-accent-teal-400/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-accent-teal-400/[0.15]",
            "shadow-[0_8px_32px_0_rgba(45,212,191,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(45,212,191,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

// Main Hero Component
function AILanguageLearningHero() {
  const [currentLanguage, setCurrentLanguage] = useState(0);
  
  const languages = ["Spanish", "French", "German", "Italian", "Portuguese", "Japanese"];
  const musicGenres = ["Pop", "Rock", "Jazz", "Classical", "Hip-Hop", "Folk"];

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLanguage((prev) => (prev + 1) % languages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [languages.length]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2">
      {/* Positioned Bolt Logo */}
      <a 
        href="https://bolt.new/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute top-4 right-4 z-20 hover:opacity-80 transition-opacity duration-300"
      >
        <img 
          src="/white_circle_360x360.png" 
          alt="Powered by Bolt.new" 
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 object-contain"
        />
      </a>

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-teal-500/[0.05] via-transparent to-accent-persian-500/[0.05] blur-3xl" />

      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-accent-teal-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <FloatingShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-accent-persian-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <FloatingShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-accent-mint-400/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
        <FloatingShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-accent-teal-400/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />
      </div>

      {/* Floating Music Notes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-note text-accent-teal-400 text-4xl" style={{ left: '10%', top: '20%', textShadow: '0 0 10px rgba(45,212,191,0.5)' }}>♪</div>
        <div className="floating-note text-accent-mint-400 text-3xl" style={{ left: '25%', top: '40%', textShadow: '0 0 10px rgba(0,212,176,0.5)' }}>♫</div>
        <div className="floating-note text-accent-persian-500 text-5xl" style={{ left: '45%', top: '15%', textShadow: '0 0 10px rgba(0,168,150,0.5)' }}>♩</div>
        <div className="floating-note text-accent-teal-400 text-4xl" style={{ left: '65%', top: '35%', textShadow: '0 0 10px rgba(45,212,191,0.5)' }}>♬</div>
        <div className="floating-note text-accent-mint-400 text-3xl" style={{ left: '85%', top: '25%', textShadow: '0 0 10px rgba(0,212,176,0.5)' }}>♪</div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-teal-500/[0.03] border border-accent-teal-400/[0.08] mb-8 md:mb-12"
          >
            <Headphones className="h-4 w-4 fill-accent-teal-400/80 text-accent-teal-400/80" />
            <span className="text-sm text-text-cream300 tracking-wide">
              AI-Powered Music Learning
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-text-cream100 to-text-cream200">
                Learn{" "}
              </span>
              <TextRotate
                texts={languages}
                mainClassName="bg-clip-text text-transparent bg-gradient-to-r from-accent-teal-400 via-accent-mint-400 to-accent-persian-500 inline-block"
                staggerFrom="first"
                staggerDuration={0.02}
                rotationInterval={3000}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              />
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-teal-400 via-accent-mint-400 to-accent-persian-500">
                Through Music
              </span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-base sm:text-lg md:text-xl text-text-cream300 mb-8 leading-relaxed font-light tracking-wide max-w-2xl mx-auto px-4">
              Discover a revolutionary way to master languages through the power of music. 
              Our AI analyzes songs and creates personalized learning experiences that make 
              language acquisition natural, fun, and unforgettable.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center gap-6 mb-8"
          >
            <div className="flex items-center gap-2 text-text-cream400 text-sm">
              <Music className="w-4 h-4" />
              <span>10,000+ Songs</span>
            </div>
            <div className="flex items-center gap-2 text-text-cream400 text-sm">
              <Users className="w-4 h-4" />
              <span>500K+ Learners</span>
            </div>
            <div className="flex items-center gap-2 text-text-cream400 text-sm">
              <Mic className="w-4 h-4" />
              <span>AI Voice Coach</span>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            custom={4}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex justify-center"
          >
            <ButtonColorful
              label="Start Learning Free"
              className="text-base px-8 py-3"
            />
          </motion.div>

          {/* Music genre showcase */}
          <motion.div
            custom={5}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mt-12 flex flex-wrap justify-center gap-3"
          >
            {musicGenres.map((genre) => (
              <Badge
                key={genre}
                variant="outline"
                className="bg-accent-teal-500/5 border-accent-teal-400/20 text-text-cream300 hover:bg-accent-teal-500/10 transition-colors cursor-pointer"
              >
                {genre}
              </Badge>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-base-dark2 via-transparent to-base-dark2/80 pointer-events-none" />
    </div>
  );
}

export { AILanguageLearningHero };