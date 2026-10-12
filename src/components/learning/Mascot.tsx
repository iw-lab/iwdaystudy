'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

type MascotState = 'default' | 'happy' | 'thinking' | 'correct' | 'encourage' | 'celebrating' | 'sleeping' | 'reading';

interface Props {
  state?: MascotState;
  message?: string;
  size?: number;
  className?: string;
}

const stateConfig: Record<MascotState, { mouthPath: string; eyeScale: number; blushOpacity: number; bodyBounce: number[] }> = {
  default: {
    mouthPath: 'M46 56 Q50 60 54 56',
    eyeScale: 1,
    blushOpacity: 0.3,
    bodyBounce: [0, -4, 0],
  },
  happy: {
    mouthPath: 'M44 55 Q50 64 56 55',
    eyeScale: 0.8,
    blushOpacity: 0.6,
    bodyBounce: [0, -10, 0],
  },
  thinking: {
    mouthPath: 'M46 58 Q50 56 54 58',
    eyeScale: 1.1,
    blushOpacity: 0.2,
    bodyBounce: [0, -2, 0],
  },
  correct: {
    mouthPath: 'M43 54 Q50 66 57 54',
    eyeScale: 0.6,
    blushOpacity: 0.7,
    bodyBounce: [0, -16, 0],
  },
  encourage: {
    mouthPath: 'M45 56 Q50 62 55 56',
    eyeScale: 1,
    blushOpacity: 0.5,
    bodyBounce: [0, -6, 0],
  },
  celebrating: {
    mouthPath: 'M42 53 Q50 68 58 53',
    eyeScale: 0.5,
    blushOpacity: 0.8,
    bodyBounce: [0, -20, 0],
  },
  sleeping: {
    mouthPath: 'M47 57 Q50 55 53 57',
    eyeScale: 0.1,
    blushOpacity: 0.2,
    bodyBounce: [0, -1, 0],
  },
  reading: {
    mouthPath: 'M46 56 Q50 59 54 56',
    eyeScale: 0.9,
    blushOpacity: 0.3,
    bodyBounce: [0, -3, 0],
  },
};

// Contextual messages for each state
const contextualMessages: Record<MascotState, string[]> = {
  default: ['오늘도 파이팅!', '반가워요!', '무엇을 배울까요?'],
  happy: ['잘하고 있어요!', '멋져요!', '최고예요!'],
  thinking: ['음... 생각해봐요', '천천히 해도 돼요', '힌트를 볼까요?'],
  correct: ['정답이에요!', '대단해요!', '완벽해요!'],
  encourage: ['괜찮아요!', '다시 해봐요!', '힘내요!'],
  celebrating: ['축하해요!', '대단해요!', '짝짝짝!'],
  sleeping: ['Zzz...', '좋은 꿈 꿔요...'],
  reading: ['열심히 읽고 있어요', '집중!', '좋은 내용이네요'],
};

export default function Mascot({ state = 'default', message, size = 80, className }: Props) {
  const config = stateConfig[state];
  const [showMessage, setShowMessage] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Blinking animation for idle state
  useEffect(() => {
    if (state === 'sleeping') return;
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };
    const interval = setInterval(blink, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    if (message) {
      setShowMessage(true);
      // 작은(내비게이션) 마스코트는 말풍선이 문제·보기를 덮으니 짧게 띄운다
      const timer = setTimeout(() => setShowMessage(false), size <= 50 ? 1800 : 5000);
      return () => clearTimeout(timer);
    }
    setShowMessage(false);
  }, [message, size]);

  const effectiveEyeScale = isBlinking ? 0.1 : config.eyeScale;

  return (
    <div className={className} style={{ position: 'relative', width: size + 40, minHeight: size + 20 }}>
      {/* Speech bubble */}
      <AnimatePresence>
        {showMessage && message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-white font-medium text-foreground shadow-lg border border-border z-10 ${size <= 50 ? "mb-1 px-3 py-1 text-xs" : "mb-2 px-4 py-2 text-sm"}`}
            style={{ maxWidth: size <= 50 ? undefined : 220 }}
          >
            <span style={{ whiteSpace: size <= 50 ? 'nowrap' : 'pre-wrap', wordBreak: 'keep-all' }}>{message}</span>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character */}
      <motion.div
        animate={{ y: config.bodyBounce }}
        transition={{
          duration: state === 'correct' || state === 'celebrating' ? 0.4 : state === 'sleeping' ? 4 : 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Soil shadow */}
          <ellipse cx="50" cy="86" rx="18" ry="5" fill="#2ECC71" opacity="0.15" />

          {/* Stem */}
          <motion.path
            d="M50 82 L50 42"
            stroke="#2ECC71"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Left leaf */}
          <motion.path
            d="M50 58 C38 55 30 44 36 32 C42 24 50 34 50 46"
            fill="#2ECC71"
            animate={{
              rotate: state === 'happy' || state === 'celebrating'
                ? [-4, 4, -4]
                : state === 'sleeping'
                ? [-1, 1, -1]
                : [0, 0, 0]
            }}
            transition={{
              duration: state === 'celebrating' ? 0.3 : 0.8,
              repeat: Infinity,
            }}
            style={{ transformOrigin: '50px 58px' }}
          />

          {/* Right leaf */}
          <motion.path
            d="M50 50 C62 48 70 36 64 24 C58 16 50 26 50 38"
            fill="#27AE60"
            animate={{
              rotate: state === 'happy' || state === 'celebrating'
                ? [4, -4, 4]
                : state === 'sleeping'
                ? [1, -1, 1]
                : [0, 0, 0]
            }}
            transition={{
              duration: state === 'celebrating' ? 0.3 : 0.8,
              repeat: Infinity,
            }}
            style={{ transformOrigin: '50px 50px' }}
          />

          {/* Eyes */}
          <motion.circle
            cx="43"
            cy="52"
            r="2.5"
            fill="#1A1A2E"
            animate={{ scaleY: effectiveEyeScale }}
            transition={{ duration: 0.1 }}
            style={{ transformOrigin: '43px 52px' }}
          />
          <motion.circle
            cx="57"
            cy="52"
            r="2.5"
            fill="#1A1A2E"
            animate={{ scaleY: effectiveEyeScale }}
            transition={{ duration: 0.1 }}
            style={{ transformOrigin: '57px 52px' }}
          />

          {/* Eye shine (not when sleeping) */}
          {state !== 'sleeping' && (
            <>
              <circle cx="44" cy="51" r="0.8" fill="white" opacity="0.8" />
              <circle cx="58" cy="51" r="0.8" fill="white" opacity="0.8" />
            </>
          )}

          {/* Mouth */}
          <motion.path
            d={config.mouthPath}
            stroke="#1A1A2E"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Blush */}
          <motion.circle
            cx="37" cy="56" r="3.5" fill="#FF8BA7"
            animate={{ opacity: config.blushOpacity }}
            transition={{ duration: 0.3 }}
          />
          <motion.circle
            cx="63" cy="56" r="3.5" fill="#FF8BA7"
            animate={{ opacity: config.blushOpacity }}
            transition={{ duration: 0.3 }}
          />

          {/* Pencil hat */}
          <path d="M50 42 L44 26 L50 14 L56 26 Z" fill="#F9CA24" />
          <path d="M50 14 L47 20 L53 20 Z" fill="#1A1A2E" />

          {/* Sparkles for correct/happy/celebrating */}
          {(state === 'correct' || state === 'happy' || state === 'celebrating') && (
            <>
              <motion.circle
                cx="70"
                cy="20"
                r="2"
                fill="#F9CA24"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.circle
                cx="28"
                cy="30"
                r="1.5"
                fill="#FF8BA7"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
              />
              <motion.circle
                cx="72"
                cy="42"
                r="1.5"
                fill="#4ECDC4"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
              />
            </>
          )}

          {/* Extra sparkles for celebrating */}
          {state === 'celebrating' && (
            <>
              <motion.circle
                cx="25"
                cy="18"
                r="1.5"
                fill="#A18CD1"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5], y: [0, -5, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }}
              />
              <motion.circle
                cx="75"
                cy="32"
                r="2"
                fill="#FF6B35"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5], y: [0, -5, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.45 }}
              />
            </>
          )}

          {/* Question mark for thinking */}
          {state === 'thinking' && (
            <motion.text
              x="66"
              y="28"
              fontSize="16"
              fontWeight="bold"
              fill="#A18CD1"
              animate={{ opacity: [0.5, 1, 0.5], y: [28, 24, 28] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ?
            </motion.text>
          )}

          {/* Sleeping Z's */}
          {state === 'sleeping' && (
            <>
              <motion.text
                x="64"
                y="32"
                fontSize="12"
                fontWeight="bold"
                fill="#A18CD1"
                animate={{ opacity: [0, 1, 0], y: [32, 22, 12], x: [64, 68, 72] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                z
              </motion.text>
              <motion.text
                x="70"
                y="24"
                fontSize="10"
                fontWeight="bold"
                fill="#A18CD1"
                animate={{ opacity: [0, 1, 0], y: [24, 16, 8], x: [70, 74, 78] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                z
              </motion.text>
            </>
          )}

          {/* Book for reading state */}
          {state === 'reading' && (
            <motion.g
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ transformOrigin: '50px 74px' }}
            >
              <rect x="38" y="68" width="24" height="16" rx="2" fill="#4169E1" opacity="0.8" />
              <line x1="50" y1="69" x2="50" y2="83" stroke="white" strokeWidth="1" opacity="0.5" />
              <line x1="42" y1="72" x2="48" y2="72" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="42" y1="75" x2="48" y2="75" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="52" y1="72" x2="58" y2="72" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="52" y1="75" x2="58" y2="75" stroke="white" strokeWidth="0.5" opacity="0.3" />
            </motion.g>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
