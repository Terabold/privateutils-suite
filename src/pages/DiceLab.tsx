import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Hash, Disc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import StickyAnchorAd from "@/components/StickyAnchorAd";

function getSecureRandom(min: number, max: number): number {
  const range = max - min + 1;
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return min + (array[0] % range);
}

// ── Standardized 3x3 Dot Grid Die Face ─────────────────────────────────────────
const DieFace = ({ value }: { value: number }) => {
  // Dot placement maps for a 3x3 grid (0-8)
  const dotMaps: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  const dots = dotMaps[value] || [];

  return (
    <div className="w-full h-full bg-zinc-900 border-2 border-primary/40 rounded-xl grid grid-cols-3 grid-rows-3 p-2.5 [backface-visibility:hidden] overflow-hidden">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="flex items-center justify-center leading-none">
          {dots.includes(i) && (
            <div className="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
          )}
        </div>
      ))}
    </div>
  );
};

// ── 3D D20 (High-Stakes Hex) ──────────────────────────────────────────────────
const Die20 = ({ value, rolling }: { value: number; rolling: boolean }) => {
  return (
    <div className="die-container [perspective:1000px] w-20 h-20 relative select-none">
      <div 
        className={`w-full h-full relative transition-all duration-[1800ms] ease-out flex items-center justify-center ${rolling ? 'animate-rolling-hex' : ''}`}
        style={{ 
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            background: 'linear-gradient(135deg, #222, #111)',
            border: '2px solid rgba(var(--primary-rgb), 0.5)'
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1),transparent)]" />
        <span className="text-3xl font-black italic text-primary drop-shadow-glow z-10 transition-opacity duration-300">
            {rolling ? "?" : value}
        </span>
      </div>
    </div>
  );
};

// ── Standard 3D D6 ─────────────────────────────────────────────────────────────
const Die3D = ({ value, rolling }: { value: number; rolling: boolean }) => {
  const rotations: Record<number, string> = {
    1: "rotateX(0deg) rotateY(0deg)",
    2: "rotateX(-90deg) rotateY(0deg)",
    3: "rotateY(-90deg) rotateX(0deg)",
    4: "rotateY(90deg) rotateX(0deg)",
    5: "rotateX(90deg) rotateY(0deg)",
    6: "rotateX(180deg) rotateY(0deg)",
  };

  return (
    <div className="die-container [perspective:1000px] w-16 h-16 relative">
      <div 
        className={`die w-full h-full relative [transform-style:preserve-3d] transition-transform duration-[1500ms] ease-out ${rolling ? 'animate-rolling' : ''}`}
        style={!rolling ? { transform: rotations[value] || rotations[1] } : {}}
      >
        <div className="absolute inset-0 [transform:translateZ(32px)]"><DieFace value={1} /></div>
        <div className="absolute inset-0 [transform:rotateX(90deg)_translateZ(32px)]"><DieFace value={2} /></div>
        <div className="absolute inset-0 [transform:rotateY(90deg)_translateZ(32px)]"><DieFace value={3} /></div>
        <div className="absolute inset-0 [transform:rotateY(-90deg)_translateZ(32px)]"><DieFace value={4} /></div>
        <div className="absolute inset-0 [transform:rotateX(-90deg)_translateZ(32px)]"><DieFace value={5} /></div>
        <div className="absolute inset-0 [transform:rotateY(180deg)_translateZ(32px)]"><DieFace value={6} /></div>
      </div>
    </div>
  );
};

// ── 3D Coin Component ────────────────────────────────────────────────────────
const Coin3D = ({ result, flipping }: { result: "HEADS" | "TAILS" | null; flipping: boolean }) => {
  return (
    <div className="coin-container [perspective:1000px] w-24 h-24 relative select-none">
      <div 
        className={`coin w-full h-full relative [transform-style:preserve-3d] transition-all duration-[1200ms] ${flipping ? 'animate-coin-flip' : ''}`}
        style={!flipping && result === "TAILS" ? { transform: "rotateY(180deg)" } : { transform: "rotateY(0deg)" }}
      >
        {/* Heads side */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-700 rounded-full border-4 border-yellow-200/50 flex items-center justify-center [backface-visibility:hidden] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
           <div className="flex flex-col items-center">
             <Disc className="h-10 w-10 text-yellow-100/50" />
             <span className="text-[10px] font-black italic text-yellow-50 mt-1 uppercase tracking-widest drop-shadow-md">Heads</span>
           </div>
        </div>
        {/* Tails side */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-400 to-zinc-700 rounded-full border-4 border-zinc-200/50 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
           <div className="flex flex-col items-center">
             <Hash className="h-10 w-10 text-zinc-100/50" />
             <span className="text-[10px] font-black italic text-zinc-50 mt-1 uppercase tracking-widest drop-shadow-md">Tails</span>
           </div>
        </div>
      </div>
    </div>
  );
};

// ── Odometer Digit Component ──────────────────────────────────────────────────
const OdometerDigit = ({ value, animating }: { value: string; animating: boolean }) => {
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const targetIndex = digits.indexOf(value);
  
  return (
    <div className="digit-container h-16 w-10 bg-black/40 border border-primary/20 rounded-xl overflow-hidden relative shadow-inner casino-mask">
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none z-10" />
      <div 
        className={`digit-strip absolute w-full transition-all duration-[2500ms] cubic-bezier(0.15, 1, 0.3, 1) ${animating ? 'animate-odometer' : ''}`}
        style={{ transform: !animating ? `translateY(-${targetIndex * 10}%)` : 'none' }}
      >
        {digits.map(d => (
          <div key={d} className="h-16 flex items-center justify-center text-4xl font-black italic text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)] leading-[4rem] tabular-nums">{d}</div>
        ))}
      </div>
    </div>
  );
};

const DiceLab = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [diceCount, setDiceCount] = useState(1);
  const [diceSides, _setDiceSides] = useState(6);
  const [rolls, setRolls] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<"HEADS" | "TAILS" | null>(null);
  
  const [minRange, setMinRange] = useState("1");
  const [maxRange, setMaxRange] = useState("100");
  const [rngResult, setRngResult] = useState<number | null>(null);
  const [animatingRng, setAnimatingRng] = useState(false);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const rollDice = () => {
    setRolling(true);
    setRolls([]); // Reset to clear UI jump
    const newRolls = Array.from({ length: diceCount }, () => getSecureRandom(1, diceSides));
    setTimeout(() => {
      setRolls(newRolls);
      setRolling(false);
    }, 1500);
  };

  const flipCoin = () => {
    setFlipping(true);
    setCoinResult(null);
    const res = getSecureRandom(0, 1);
    setTimeout(() => {
      setCoinResult(res === 0 ? "HEADS" : "TAILS");
      setFlipping(false);
    }, 800);
  };

  const generateRNG = () => {
    setAnimatingRng(true);
    const min = parseInt(minRange) || 0;
    const max = parseInt(maxRange) || 0;
    const result = getSecureRandom(Math.min(min, max), Math.max(min, max));
    setTimeout(() => {
      setRngResult(result);
      setAnimatingRng(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 ">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-10 grow overflow-visible">
          <div className="flex flex-col gap-10">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60 shadow-2xl">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                  Studio <span className="text-primary italic">Dice Lab</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  High-Entropy Physics · Secure Randomization Studio
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-10 items-start overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                
                {/* Secure RNG (Digit Collider) - NOW FIRST */}
                <Card className="glass-morphism border-primary/10 rounded-3xl shadow-2xl bg-card p-0 border-2 border-primary/5 flex flex-col h-full group overflow-hidden md:col-span-1">
                  <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Digit Collider</p>
                     <p className="text-[9px] font-bold text-primary opacity-40 px-2 py-0.5 rounded-full border border-primary/20 bg-background/50">CASINO ODOMETER</p>
                  </div>
                  <div className="p-6 space-y-8 flex-1 flex flex-col">
                    <div className="flex-1 flex justify-center items-center min-h-[220px] bg-black/20 rounded-2xl border border-primary/5 shadow-inner overflow-hidden relative">
                         <div className="absolute inset-0 bg-primary/5 animate-pulse opacity-20" />
                         <div 
                           className="flex gap-1 md:gap-1.5 relative z-10 transition-transform duration-500 origin-center"
                           style={{ 
                             transform: `scale(${maxRange.length >= 4 ? Math.min(1.5, Math.max(0.3, 5.5 / maxRange.length)) : 1.5})`
                           }}
                         >
                            {rngResult !== null ? 
                              rngResult.toString().padStart(maxRange.length, "0").split("").map((digit, i) => (
                                <OdometerDigit key={i} value={digit} animating={animatingRng} />
                              )) : 
                              "0".repeat(maxRange.length).split("").map((digit, i) => (
                                <OdometerDigit key={i} value={digit} animating={animatingRng} />
                              ))
                            }
                         </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-40 italic ml-2">Floor</p>
                                <input 
                                  type="text" 
                                  inputMode="numeric"
                                  value={minRange} 
                                  onChange={e => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    if (val.length <= 18) setMinRange(val);
                                  }} 
                                  className="w-full h-12 bg-background/60 border border-primary/10 rounded-2xl px-5 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono" 
                                />
                             </div>
                             <div className="space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-40 italic ml-2">Ceiling</p>
                                <input 
                                  type="text" 
                                  inputMode="numeric"
                                  value={maxRange} 
                                  onChange={e => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    if (val.length <= 18) setMaxRange(val);
                                  }} 
                                  className="w-full h-12 bg-background/60 border border-primary/10 rounded-2xl px-5 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono" 
                                />
                             </div>
                        </div>
                         <Button onClick={generateRNG} disabled={animatingRng} className="w-full h-16 rounded-2xl font-black uppercase italic tracking-widest shadow-xl border border-primary/20 bg-gradient-to-br from-primary to-accent text-white hover:scale-[1.02] active:scale-[0.98] transition-all">
                            {animatingRng ? "Spinning Entropy..." : "Pull The Lever"}
                         </Button>
                    </div>
                  </div>
                </Card>

                {/* Dice Roller */}
                <Card className="glass-morphism border-primary/10 rounded-3xl shadow-2xl bg-card p-0 border-2 border-primary/5 flex flex-col h-full group overflow-hidden">
                  <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Gravity Forge</p>
                     <p className="text-[9px] font-bold text-primary opacity-40 px-2 py-0.5 rounded-full border border-primary/20 bg-background/50">3D PHYSICS</p>
                  </div>
                  <div className="p-6 space-y-8 flex-1 flex flex-col">
                    <div className="flex-1 flex justify-center items-center min-h-[220px] bg-black/20 rounded-2xl border border-primary/5 shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1)_0%,transparent_70%)] opacity-50" />
                        <div className="flex flex-wrap gap-4 md:gap-6 p-4 justify-center relative z-10 transition-all duration-500">
                            {rolls.length > 0 || rolling ? (
                                (rolling ? Array.from({ length: diceCount }) : rolls).map((r, i) => (
                                    <div 
                                      key={i} 
                                      className="relative group/die transition-all duration-500"
                                      style={{ transform: `scale(${diceCount > 6 ? 0.85 : 1})` }}
                                    >
                                        {diceSides === 6 ? (
                                            <Die3D value={(r as number) || 1} rolling={rolling} />
                                        ) : (
                                            <Die20 value={(r as number) || 1} rolling={rolling} />
                                        )}
                                        {!rolling && rolls.length === 1 && (
                                            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl animate-pulse -z-10" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center gap-4 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <Disc className="h-12 w-12 animate-pulse" />
                                    <span className="uppercase font-black tracking-[0.3em] text-[10px] italic underline decoration-primary underline-offset-4 decoration-2">Ready For Impact</span>
                                </div>
                            )}
                        </div>
                    </div>

                     <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex justify-between items-center bg-background/40 p-3 rounded-2xl border border-primary/10">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic ml-1">Type</span>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => _setDiceSides(diceSides === 6 ? 20 : 6)}
                                    className="h-8 px-3 text-[10px] font-black italic bg-primary/5 border border-primary/10 rounded-xl text-primary"
                                >
                                    D{diceSides}
                                </Button>
                            </div>
                            <div className="flex justify-between items-center bg-background/40 p-3 rounded-2xl border border-primary/10">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic ml-1">Qty</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setDiceCount(Math.max(1, diceCount - 1))} className="text-primary font-black opacity-60 hover:opacity-100 transition-opacity font-mono">-</button>
                                    <span className="font-black text-xs text-primary font-mono">{diceCount}</span>
                                    <button onClick={() => setDiceCount(Math.min(12, diceCount + 1))} className="text-primary font-black opacity-60 hover:opacity-100 transition-opacity font-mono">+</button>
                                </div>
                            </div>
                          </div>
                         <Button onClick={rollDice} disabled={rolling} className="w-full h-16 rounded-2xl font-black uppercase italic tracking-widest shadow-xl border border-primary/20 bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all">
                            {rolling ? "Rolling Steel..." : "Cast The Dice"}
                         </Button>
                    </div>
                  </div>
                </Card>

                {/* Coin Flip */}
                <Card className="glass-morphism border-primary/10 rounded-3xl shadow-2xl bg-card p-0 border-2 border-primary/5 flex flex-col h-full group overflow-hidden">
                  <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Momentum Toss</p>
                     <p className="text-[9px] font-bold text-primary opacity-40 px-2 py-0.5 rounded-full border border-primary/20 bg-background/50">PHYSICS</p>
                  </div>
                  <div className="p-6 space-y-8 flex-1 flex flex-col">
                    <div 
                      className={`flex-1 flex justify-center items-center min-h-[220px] bg-black/20 rounded-2xl border border-primary/5 shadow-inner cursor-pointer transition-all duration-700 ${!flipping && coinResult ? 'shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] ring-1 ring-primary/20' : ''}`} 
                      onClick={!flipping ? flipCoin : undefined}
                    >
                        <Coin3D result={coinResult} flipping={flipping} />
                    </div>

                    <div className="space-y-6">
                        <div className={`bg-background/40 p-4 rounded-2xl border border-primary/5 text-center transition-all ${!flipping && coinResult ? 'border-primary/40 bg-primary/5' : ''}`}>
                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all italic ${!flipping && coinResult ? 'text-primary' : 'opacity-30'}`}>
                                {flipping ? "Gravity Working..." : (coinResult ? `Result: ${coinResult}` : "Waiting for force")}
                            </span>
                        </div>
                         <Button onClick={flipCoin} disabled={flipping} variant="secondary" className="w-full h-16 rounded-2xl font-black uppercase italic tracking-widest shadow-xl border border-primary/10 bg-secondary hover:bg-secondary/80 hover:scale-[1.02] transition-all">
                            {flipping ? "Tossing Master..." : "Flip High-Value"}
                         </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <ToolExpertSection
              title="Studio Dice Lab · 3D Physics Edition"
              description="The Studio Dice Lab has been re-engineered for immersive randomization. By combining the Web Crypto API's hardware-backed entropy with high-performance 3D CSS physics, we deliver a premium randomization suite that is both cryptographically secure and visually stunning."
              transparency="Randomization Protocol: Every result in Dice Lab is generated using window.crypto.getRandomValues() before the animation sequence begins. The 3D dice rotations, coin tossed momentum, and odometer digit scrolling are perfectly synced representations of the secure underlying data bits. Your privacy is maintained as all entropy calculations happen locally in your browser's hardened sandbox."
              limitations="While our 3D physics engine is designed for hardware acceleration (using GPU compositing), extremely low-end legacy devices without 'preserve-3d' support may fall back to simplified 2D representations. For maximum performance, we limit the simultaneous dice forge to 12 artifacts."
              accent="amber"
            />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default DiceLab;
