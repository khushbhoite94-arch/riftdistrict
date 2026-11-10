"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePersonalizationStore } from "@/store/personalizationStore";
import { useRouter } from "next/navigation";
import { useScrollLock } from "@/hooks/useScrollLock";
import { usePortal } from "@/hooks/usePortal";

const QUESTIONS = [
  {
    id: "fit",
    question: "What's your preferred fit?",
    options: [
      { value: "slim", label: "Slim Fit", desc: "Close to body, tailored" },
      { value: "regular", label: "Regular Fit", desc: "Classic, comfortable" },
      { value: "oversized", label: "Oversized", desc: "Loose, streetwear" },
    ],
  },
  {
    id: "style",
    question: "Which style speaks to you?",
    options: [
      { value: "minimal", label: "Minimal", desc: "Clean, understated" },
      { value: "bold", label: "Bold Graphics", desc: "Statement pieces" },
      { value: "streetwear", label: "Streetwear", desc: "Urban, edgy" },
    ],
  },
  {
    id: "colors",
    question: "Pick your go-to colors (select multiple)",
    multiple: true,
    options: [
      { value: "black", label: "Black", color: "#000000" },
      { value: "white", label: "White", color: "#FFFFFF" },
      { value: "grey", label: "Grey", color: "#808080" },
      { value: "beige", label: "Beige", color: "#D4C5B9" },
      { value: "olive", label: "Olive", color: "#556B2F" },
      { value: "navy", label: "Navy", color: "#000080" },
    ],
  },
  {
    id: "priceRange",
    question: "What's your budget sweet spot?",
    options: [
      { value: "budget", label: "₹500 - ₹1,500", desc: "Value picks" },
      { value: "mid", label: "₹1,500 - ₹3,000", desc: "Quality essentials" },
      { value: "premium", label: "₹3,000+", desc: "Premium pieces" },
    ],
  },
];

export function StyleQuiz() {
  const router = useRouter();
  const { hasCompletedQuiz, setPreferences, completeQuiz } = usePersonalizationStore();
  const [isOpen, setIsOpen] = useState(!hasCompletedQuiz);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    colors: [],
  });

  useScrollLock(isOpen);
  const portal = usePortal();

  if (hasCompletedQuiz) return null;

  const currentQuestion = QUESTIONS[step];
  const isLastStep = step === QUESTIONS.length - 1;

  const handleAnswer = (value: string) => {
    if (currentQuestion.multiple) {
      const current = answers[currentQuestion.id] || [];
      const updated = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [currentQuestion.id]: updated });
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: value });
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      setPreferences(answers as any);
      completeQuiz();
      setIsOpen(false);
      router.push("/shop");
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    completeQuiz();
    setIsOpen(false);
  };

  const canProceed = currentQuestion.multiple
    ? (answers[currentQuestion.id] || []).length > 0
    : answers[currentQuestion.id];

  const content = (
    <div style={{ pointerEvents: "auto" }}>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-rift-surface border border-rift-mist/20 rounded-3xl z-[201] overflow-hidden"
            >
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/50 mb-2">
                  Step {step + 1} of {QUESTIONS.length}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold">{currentQuestion.question}</h2>
              </div>

              <div className="w-full h-1 bg-white/5 rounded-full mb-8">
                <motion.div
                  className="h-full bg-rift-orange rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentQuestion.multiple
                    ? (answers[currentQuestion.id] || []).includes(option.value)
                    : answers[currentQuestion.id] === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-rift-orange bg-rift-orange/10"
                          : "border-rift-mist/15 hover:border-rift-mist/40"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {'color' in option && option.color && (
                          <div
                            className="w-10 h-10 rounded-full border-2 border-white/20"
                            style={{ backgroundColor: option.color }}
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{option.label}</p>
                          {'desc' in option && option.desc && (
                            <p className="text-xs text-rift-mist/50 mt-1">{option.desc}</p>
                          )}
                        </div>
                        {isSelected && <span className="text-rift-orange text-xl">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 text-xs tracking-[0.15em] uppercase text-rift-mist/60 hover:text-white transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="flex-1 px-6 py-3 bg-rift-orange text-white text-xs tracking-[0.15em] uppercase hover:bg-rift-rust transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLastStep ? "Complete & Shop" : "Next"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </div>
  );

  return portal ? createPortal(content, portal) : null;
}
