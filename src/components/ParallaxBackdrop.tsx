import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

export function ParallaxBackdrop() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  const warmGlowOpacity = useTransform(smoothProgress, [0.25, 0.55, 1], [0.06, 0.2, 0.3]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden bg-zinc-950 pointer-events-none select-none"
    >
      {/* Rich warm yellow-to-black atmospheric gradient matching header image color and reference effect */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(246, 222, 72, 0.35) 0%, rgba(229, 169, 60, 0.18) 26%, rgba(18, 18, 22, 0.85) 60%, #09090b 100%)',
        }}
      />

      {/* Subtle studio ambient glow for My Work and Let's Talk pages */}
      <motion.div
        style={{ opacity: shouldReduceMotion ? 0.18 : warmGlowOpacity }}
        className="absolute inset-0 will-change-opacity"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              'radial-gradient(circle at 74% 28%, rgba(246, 222, 72, 0.25) 0%, rgba(24, 24, 27, 0.4) 52%, transparent 80%)',
          }}
        />
      </motion.div>
    </div>
  );
}
