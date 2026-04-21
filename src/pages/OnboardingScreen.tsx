import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Brain, Clock, Smartphone, Sparkles, Target } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppLogo from '@/components/AppLogo';

const QUICK_PRESETS = [
  { label: '2 hours', minutes: 120 },
  { label: '4 hours', minutes: 240 },
  { label: '6 hours', minutes: 360 },
  { label: '8+ hours', minutes: 480 },
];

function AnimatedNumber({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = display;
    const animate = (now: number) => {
      const elapsed = (now - start) / (duration * 1000);
      if (elapsed >= 1) {
        setDisplay(value);
        return;
      }
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span>{display.toLocaleString()}</span>;
}

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [screenTimeMinutes, setScreenTimeMinutes] = useState(0);
  const [customHours, setCustomHours] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const navigate = useNavigate();

  const totalMinutes = screenTimeMinutes || (parseInt(customHours || '0') * 60 + parseInt(customMinutes || '0'));
  const hoursPerDay = totalMinutes / 60;
  const hoursPerYear = Math.round(hoursPerDay * 365);
  const daysPerYear = Math.round(hoursPerYear / 24);
  const currentAge = 25;
  const yearsLeft = 80 - currentAge;
  const totalLifetimeHours = hoursPerYear * yearsLeft;
  const totalLifetimeYears = parseFloat((totalLifetimeHours / 8760).toFixed(1));

  const canProceedFromStep0 = totalMinutes > 0;

  const complete = () => {
    localStorage.setItem('onboarding_complete', 'true');
    window.dispatchEvent(new Event('onboarding_complete'));
    // Navigate to root — AppRoutes will show AuthScreen since user is null
    navigate('/');
  };

  const nextStep = () => setStep(s => s + 1);

  const slideVariants = {
    enter: { opacity: 0, y: 40 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -40 },
  };

  return (
    <div className="min-h-screen gradient-mesh flex flex-col overflow-hidden">
      {/* Progress bar */}
      <div className="px-8 pt-14 pb-2">
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            animate={{ width: `${((step + 1) / 6) * 100}%` }}
            className="h-full rounded-full bg-primary"
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground text-right mt-1.5">{step + 1}/6</p>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 0: Screen time input */}
        {step === 0 && (
          <motion.div
            key="step0"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 mb-8"
            >
              <AppLogo className="w-20 h-20" imageClassName="p-2" />
            </motion.div>

            <h2 className="text-2xl font-bold text-foreground text-center mb-2">
              What's your daily screen time?
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-8 max-w-xs">
              Check your phone's settings to find your average
            </p>

            {/* Quick presets */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6">
              {QUICK_PRESETS.map(p => (
                <motion.button key={p.label} whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setScreenTimeMinutes(p.minutes);
                    setCustomHours('');
                    setCustomMinutes('');
                  }}
                  className={`py-4 rounded-2xl text-sm font-semibold transition-all ${
                    screenTimeMinutes === p.minutes
                      ? 'bg-primary text-primary-foreground glow-primary'
                      : 'glass text-foreground hover:bg-card/80'
                  }`}
                >
                  {p.label}
                </motion.button>
              ))}
            </div>

            {/* Custom input */}
            <div className="flex items-center gap-2 w-full max-w-sm">
              <div className="flex-1 glass rounded-xl px-4 py-3 flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0"
                  value={customHours}
                  onChange={e => { 
                    const val = e.target.value === '' ? '' : Math.min(24, Math.max(0, parseInt(e.target.value) || 0)).toString();
                    setCustomHours(val); 
                    setScreenTimeMinutes(0); 
                  }}
                  className="w-full bg-transparent text-foreground text-center text-lg font-semibold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  max="24"
                />
                <span className="text-xs text-muted-foreground">hrs</span>
              </div>
              <div className="flex-1 glass rounded-xl px-4 py-3 flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0"
                  value={customMinutes}
                  onChange={e => { 
                    const val = e.target.value === '' ? '' : Math.min(59, Math.max(0, parseInt(e.target.value) || 0)).toString();
                    setCustomMinutes(val); 
                    setScreenTimeMinutes(0); 
                  }}
                  className="w-full bg-transparent text-foreground text-center text-lg font-semibold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  max="59"
                />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            </div>

            {canProceedFromStep0 && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={nextStep}
                className="mt-8 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 glow-primary"
              >
                See your results <ArrowRight size={18} />
              </motion.button>
            )}
          </motion.div>
        )}

        {/* STEP 1: Lifetime calculation animation */}
        {step === 1 && (
          <motion.div
            key="step1"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-10"
            >
              <Clock size={36} className="text-accent" />
            </motion.div>

            <div className="space-y-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm text-muted-foreground mb-1">Per year, that's</p>
                <p className="text-5xl font-bold text-foreground">
                  <AnimatedNumber value={hoursPerYear} /> <span className="text-xl font-normal text-muted-foreground">hours</span>
                </p>
                <p className="text-lg text-muted-foreground mt-1">
                  ≈ <AnimatedNumber value={daysPerYear} /> full days
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <p className="text-sm text-muted-foreground mb-1">By age 80, you'll spend</p>
                <p className="text-6xl font-bold text-gradient">
                  <AnimatedNumber value={Math.round(totalLifetimeYears)} duration={2} />
                </p>
                <p className="text-xl text-foreground font-medium">years on your phone</p>
              </motion.div>
            </div>

            <motion.button whileTap={{ scale: 0.95 }} onClick={nextStep}
              className="mt-12 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 glow-primary"
            >
              Continue <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* STEP 2: Emotional impact */}
        {step === 2 && (
          <motion.div
            key="step2"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center justify-center px-8"
          >
            <div className="space-y-10 text-center max-w-sm">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-foreground leading-tight"
              >
                That's nearly a decade of your life.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-xl text-muted-foreground leading-relaxed"
              >
                Time is your most valuable asset.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="text-lg text-muted-foreground"
              >
                Most of it is spent scrolling, distracted, unfocused.
              </motion.p>
            </div>

            <motion.button whileTap={{ scale: 0.95 }} onClick={nextStep}
              className="mt-12 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 glow-primary"
            >
              But what if... <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* STEP 3: Reframe */}
        {step === 3 && (
          <motion.div
            key="step3"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center justify-center px-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-10"
            >
              <Brain size={36} className="text-primary" />
            </motion.div>

            <div className="space-y-8 text-center max-w-sm">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-foreground leading-tight"
              >
                What if your screen time actually improved your life?
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="text-lg text-muted-foreground leading-relaxed"
              >
                What if every minute made you more{' '}
                <span className="text-primary font-semibold">focused</span>,{' '}
                <span className="text-accent font-semibold">calm</span>, and{' '}
                <span className="text-warm font-semibold">productive</span>?
              </motion.p>
            </div>

            <motion.button whileTap={{ scale: 0.95 }} onClick={nextStep}
              className="mt-12 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 glow-primary"
            >
              Show me how <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* STEP 4: Identity shift */}
        {step === 4 && (
          <motion.div
            key="step4"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center justify-center px-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-10"
            >
              <Target size={36} className="text-accent" />
            </motion.div>

            <div className="space-y-8 text-center max-w-sm">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-foreground leading-tight"
              >
                Focused people don't avoid screens.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="text-3xl font-bold text-gradient leading-tight"
              >
                They control them.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="text-lg text-muted-foreground"
              >
                Turn distraction into intention with scientifically-tuned audio frequencies.
              </motion.p>
            </div>

            <motion.button whileTap={{ scale: 0.95 }} onClick={nextStep}
              className="mt-12 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 glow-primary"
            >
              I'm ready <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* STEP 5: CTA */}
        {step === 5 && (
          <motion.div
            key="step5"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center justify-center px-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-24 h-24 mb-8"
            >
              <AppLogo className="w-24 h-24" imageClassName="p-2" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-foreground text-center mb-3"
            >
              Welcome to AuraTune
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-muted-foreground text-center max-w-xs mb-4"
            >
              Binaural beats and solfeggio frequencies, scientifically tuned to help you focus, sleep, and perform better.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col gap-3 w-full max-w-xs mt-4"
            >
              {[
                { icon: '🎯', text: 'Sharpen focus with Beta waves' },
                { icon: '🌙', text: 'Deep sleep with Delta frequencies' },
                { icon: '🧘', text: 'Meditate with Theta tones' },
                { icon: '⚡', text: 'Boost energy with Gamma beats' },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + i * 0.15 }}
                  className="flex items-center gap-3 glass rounded-xl px-4 py-3"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-foreground">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.button whileTap={{ scale: 0.95 }} onClick={complete}
              className="mt-10 w-full max-w-xs bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg glow-primary"
            >
              Start your first session
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
