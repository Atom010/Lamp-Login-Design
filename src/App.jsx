import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, CheckCircle, Lightbulb, UserPlus, LogIn, RefreshCw } from 'lucide-react';

// Custom inline SVG icons for social logins
const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

// Dust particles component inside the spotlight beam
const DustParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate particles with random coordinates and motion properties
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2.5 + 1, // 1px to 3.5px
      left: Math.random() * 75 + 15, // centered in light beam
      delay: Math.random() * 12,
      duration: Math.random() * 8 + 8, // 8s to 16s
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

// Play a highly realistic physical light switch clack sound using the Web Audio API
const playClickSound = (isOn) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // 1. Resonant housing "clack" using bandpass filtered white noise
    const bufferSize = Math.floor(ctx.sampleRate * 0.045); // 45ms burst
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    // Turning ON has a slightly tighter, higher pitch sound than turning OFF
    filter.frequency.setValueAtTime(isOn ? 850 : 700, ctx.currentTime);
    filter.Q.setValueAtTime(8, ctx.currentTime); // High Q creates hollow case ringing
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);
    
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    // 2. High-pitch metallic click / snap using a fast sine sweep
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isOn ? 2600 : 2100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.015);
    
    oscGain.gain.setValueAtTime(0.25, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);
    
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    
    // Play both components synchronously
    noiseSource.start();
    osc.start();
    
    noiseSource.stop(ctx.currentTime + 0.045);
    osc.stop(ctx.currentTime + 0.045);
  } catch (e) {
    console.error("Audio Context failed to play switch sound:", e);
  }
};

export default function App() {
  const [isLampOn, setIsLampOn] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  // Ref to prevent double-clicks or rapid trigger sound overlap
  const lastPullTimeRef = useRef(0);

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // UI Flow States
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  // Pull cord handler
  const handlePullCord = () => {
    const now = Date.now();
    // Debounce to block quick consecutive triggers / double click bugs
    if (now - lastPullTimeRef.current < 350) return;
    lastPullTimeRef.current = now;

    setIsPulling(true);
    playClickSound(!isLampOn);
    
    // Simulate chain pulling down and bouncing back up
    setTimeout(() => {
      setIsPulling(false);
      setIsLampOn((prev) => !prev);
      setLoginError('');
    }, 150);
  };

  // Login Submit Handler
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (!email || !password || !confirmPassword) {
      setLoginError('Please fill in all fields.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (password !== confirmPassword) {
      setLoginError('Passwords do not match.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLoginSuccess(true);
    }, 1500);
  };

  const handleLogOut = () => {
    setLoginSuccess(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsLampOn(false);
  };

  return (
    <div className={`relative min-h-screen w-full bg-black flex flex-col md:flex-row items-center justify-center md:justify-end md:pr-16 lg:pr-32 overflow-hidden select-none transition-all duration-500 ${isLampOn ? 'lamp-on-bg md:lamp-on-bg-desktop' : ''}`}>
      


      {/* Floor standing lamp assembly */}
      <div className="absolute md:fixed top-0 left-0 w-full md:w-[450px] h-[380px] md:h-screen pt-4 md:pt-0 flex justify-center md:items-center z-20 pointer-events-none">
        <div className="relative w-[300px] h-[380px] flex justify-center pointer-events-none">
          <svg viewBox="0 0 300 380" className="w-full h-full">
            <defs>
              {/* Soft bulb glow filter */}
              <filter id="bulb-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Flat lamp shade rim */}
            <ellipse cx="150" cy="80" rx="40" ry="4" fill="#0f0e0d" stroke="#1c1917" strokeWidth="1" />
            
            {/* Light bulb glowing panel */}
            <ellipse 
              cx="150" 
              cy="84" 
              rx="22" 
              ry="6" 
              fill={isLampOn ? "#fffae6" : "#44403c"} 
              filter={isLampOn ? "url(#bulb-glow)" : ""}
              className="transition-colors duration-300"
            />

            {/* Bulb filament inside */}
            {isLampOn ? (
              <path d="M 146 84 Q 150 78 154 84" stroke="#f59e0b" strokeWidth="1" fill="none" />
            ) : (
              <path d="M 146 84 Q 150 80 154 84" stroke="#292524" strokeWidth="0.5" fill="none" />
            )}

            {/* Stem */}
            <rect x="148.5" y="87" width="3" height="263" fill="#0f0e0d" />

            {/* Base */}
            <rect x="110" y="350" width="80" height="6" rx="3" fill="#0f0e0d" />

            {/* Pull chain chain connector */}
            <circle cx="190" cy="82" r="2.5" fill="#292524" />

            {/* Pull Chain with spring jiggle physics */}
            <motion.line 
              x1="190" 
              y1="82" 
              x2="190" 
              animate={{ y2: isPulling ? 205 : 180 }}
              stroke="#4b5563" 
              strokeWidth="1.2" 
              strokeDasharray="3 2" 
              transition={{ type: "spring", stiffness: 600, damping: 9, mass: 0.6 }}
            />
          </svg>

          {/* Pull chain handle (clickable container overlay) with spring physics */}
          <motion.div 
            onClick={handlePullCord}
            className="absolute left-[180px] w-[20px] h-[35px] flex items-end justify-center cursor-pointer pointer-events-auto top-[177px]"
            animate={{ y: isPulling ? 25 : 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 9, mass: 0.6 }}
          >
            {/* The gold pull capsule matching the photo */}
            <div className="w-[8px] h-[16px] rounded-full bg-yellow-500 border border-yellow-600 shadow-md hover:scale-125 transition-transform duration-200 active:scale-95 flex items-center justify-center">
              {/* Pulsing beacon if lamp is off to guide user */}
              {!isLampOn && (
                <span className="absolute w-[18px] h-[18px] rounded-full border border-yellow-500/40 animate-ping pointer-events-none" />
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Guide text when the lamp is off */}
      <AnimatePresence>
        {!isLampOn && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute top-[20px] md:top-[40px] left-1/2 -translate-x-1/2 text-xs font-semibold tracking-[0.25em] uppercase text-stone-500 text-center pointer-events-none select-none z-10 font-display"
          >
            PULL THE STRING TO TOGGLE LOGIN
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spotlight light beam container */}
      <AnimatePresence>
        {isLampOn && (
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* The Conical spotlight light beam */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
              className="absolute inset-0 w-full h-full lamp-light-beam origin-top md:lamp-light-beam-desktop"
            >
              {/* Particle dust floating specifically inside the beam of light */}
              <DustParticles />
            </motion.div>

            {/* Soft radial glow centered on the light source */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute w-[350px] h-[350px] lamp-light-beam-glow rounded-full lamp-light-beam-glow-responsive md:lamp-light-beam-glow-desktop"
            />

            {/* Glowing pool of light on the floor surface under the base */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="absolute w-[380px] h-[30px] lamp-floor-glow rounded-full lamp-floor-glow-responsive md:lamp-floor-glow-desktop"
            />
          </div>
        )}
      </AnimatePresence>

      {/* Main card and container area */}
      <div className="relative w-full max-w-sm px-6 z-10 mt-[380px] md:mt-0">
        <AnimatePresence mode="wait">
          {isLampOn && (
            <motion.div
              key="auth-card"
              initial={{ opacity: 0, y: 45, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                x: shake ? [-8, 8, -6, 6, -3, 3, 0] : 0
              }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ 
                type: shake ? "tween" : "spring", 
                stiffness: 120, 
                damping: 16,
                x: { duration: 0.4 } 
              }}
              layout
              className="w-full bg-[#181820]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-7 sm:p-8 shadow-2xl glass-glow flex flex-col relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {loginSuccess ? (
                  // Success State screen
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center text-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                      className="w-14 h-14 bg-violet-500/20 text-violet-400 rounded-full flex items-center justify-center mb-5"
                    >
                      <CheckCircle className="w-8 h-8" strokeWidth={2.5} />
                    </motion.div>
                    
                    <h2 className="text-xl font-bold text-white mb-2 font-display">
                      Welcome Back!
                    </h2>
                    
                    <p className="text-slate-400 text-xs max-w-xs mb-8 leading-relaxed">
                      You have successfully authenticated. The panel is now open.
                    </p>

                    <div className="w-full space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-500/10 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Enter Dashboard <ArrowRight className="w-4 h-4" />
                      </motion.button>

                      <button
                        onClick={handleLogOut}
                        className="w-full py-2.5 px-4 rounded-xl border border-white/10 text-slate-400 font-medium text-xs hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                      >
                        Sign Out / Reset
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  // Form fields matching the photo
                  <motion.div key="login-form" layout>
                    
                    {/* Header */}
                    <div className="mb-6 text-center">
                      <h2 className="text-2xl font-bold text-white font-display mb-1.5">
                        Welcome Back
                      </h2>
                    </div>

                    {/* Alert Message */}
                    {loginError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {loginError}
                      </motion.div>
                    )}

                    {/* Form Core */}
                    <form onSubmit={handleLogin} className="space-y-4">
                      
                      {/* Email address field */}
                      <div className="space-y-1.5">
                        <input
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full py-3.5 px-4 bg-[#0d0c11] border border-white/5 rounded-xl text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                        />
                      </div>

                      {/* Password field */}
                      <div className="space-y-1.5 relative">
                        <input
                          type={passwordVisible ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full py-3.5 pl-4 pr-11 bg-[#0d0c11] border border-white/5 rounded-xl text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Confirm Password field */}
                      <div className="space-y-1.5 relative">
                        <input
                          type={confirmPasswordVisible ? "text" : "password"}
                          placeholder="Confirm Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full py-3.5 pl-4 pr-11 bg-[#0d0c11] border border-white/5 rounded-xl text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {confirmPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Forgot password link */}
                      <div className="text-right">
                        <a href="#forgot" className="text-xs text-violet-500 hover:text-violet-400 hover:underline">
                          Forgot Password?
                        </a>
                      </div>

                      {/* Main Submit Button */}
                      <div className="pt-2">
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          disabled={isLoading}
                          type="submit"
                          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 transition-colors shadow-lg shadow-violet-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              SIGN IN
                            </>
                          )}
                        </motion.button>
                      </div>
                    </form>

                    {/* Social Login Separator */}
                    <div className="relative my-6 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/5" />
                      </div>
                      <span className="relative px-3 bg-[#181820] text-xs text-slate-500 uppercase tracking-wider">
                        or
                      </span>
                    </div>

                    {/* Google Sign In button */}
                    <button className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-white/5 rounded-xl bg-[#24242d] hover:bg-[#2e2e38] text-white text-sm font-semibold transition-all cursor-pointer">
                      <GoogleIcon className="w-4.5 h-4.5" /> Continue with Google
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
