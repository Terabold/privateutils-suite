import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, RefreshCw, Hash, Play, Download, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import { toast } from "sonner";
import { bufferToWave } from "@/utils/audioUtils";

const MORSE_MAP: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
  "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
  '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
  ' ': '/',
  '\n': '/'
};

const CHAR_LIMIT = 500;

const REVERSE_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);

const MorseCodeMaster = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [text, setText] = useState("");
  const [morse, setMorse] = useState("");
  const [direction, setDirection] = useState<"text-to-morse" | "morse-to-text">("text-to-morse");
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isTapping, setIsTapping] = useState(false);

  // Audio state
  const [playbackStatus, setPlaybackStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [playProgress, setPlayProgress] = useState(0);

  // Audio engine refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeOscillator = useRef<OscillatorNode | null>(null);
  const activeGain = useRef<GainNode | null>(null);

  // Playback controller refs
  const playbackStartTimeRef = useRef<number>(0);
  const playbackOffsetRef = useRef<number>(0);
  const playbackSequenceRef = useRef<{ time: number, dur: number, type: string }[]>([]);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackRemainingTimeRef = useRef<number>(0);
  const playbackTotalDurationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tapStartRef = useRef<number>(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleTextChange = (val: string) => {
    setText(val);
    if (direction === "text-to-morse") {
      const translated = val.toUpperCase().split('').map(char => MORSE_MAP[char] || char).join(' ');
      setMorse(translated);
    }
  };

  const handleMorseChange = (val: string) => {
    setMorse(val);
    if (direction === "morse-to-text") {
      const translated = val.split(' ').map(symbol => REVERSE_MORSE[symbol] || symbol).join('');
      setText(translated);
    }
  };

  const swapDirection = () => {
    setDirection(prev => prev === "text-to-morse" ? "morse-to-text" : "text-to-morse");
  };

  const copy = async () => {
    const content = direction === "text-to-morse" ? morse : text;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const stopPlayback = () => {
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    setPlaybackStatus('idle');
    setPlayProgress(0);
    playbackOffsetRef.current = 0;
  };

  const playMorse = (startFromOffset = 0) => {
    if (morse.length > 2000) {
      toast.error("Sequence too dense for hardware driver. Please shorten master.");
      return;
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;

    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.connect(ctx.destination);
    }

    const dot = 0.12;

    // Build sequence
    if (startFromOffset === 0) {
      let currentTime = 0;
      const seq: { time: number, dur: number, type: string }[] = [];
      morse.split('').forEach(char => {
        if (char === '.' || char === '-') {
          const dur = char === '.' ? dot : dot * 3;
          seq.push({ time: currentTime, dur, type: char });
          currentTime += dur + dot;
        } else if (char === ' ') {
          currentTime += dot;
        } else if (char === '/') {
          currentTime += dot * 4;
        }
      });
      playbackSequenceRef.current = seq;
    }

    setPlaybackStatus('playing');
    const startTime = ctx.currentTime;
    playbackStartTimeRef.current = startTime;

    const remainingSeq = playbackSequenceRef.current.filter(s => s.time >= startFromOffset);

    remainingSeq.forEach(item => {
      const itemTime = startTime + (item.time - startFromOffset);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, itemTime);
      gain.gain.setValueAtTime(0, itemTime);
      gain.gain.linearRampToValueAtTime(0.12, itemTime + 0.01);
      gain.gain.setValueAtTime(0.12, itemTime + item.dur);
      gain.gain.linearRampToValueAtTime(0, itemTime + item.dur + 0.01);

      osc.connect(gain);
      gain.connect(analyserRef.current!);

      osc.start(itemTime);
      osc.stop(itemTime + item.dur + 0.02);
    });

    const totalDuration = playbackSequenceRef.current[playbackSequenceRef.current.length - 1]?.time + 0.5 || 1;
    playbackTotalDurationRef.current = totalDuration;
    playbackRemainingTimeRef.current = totalDuration - startFromOffset;

    playbackTimerRef.current = setTimeout(() => {
      setPlaybackStatus('idle');
      playbackOffsetRef.current = 0;
    }, playbackRemainingTimeRef.current * 1000);
  };

  const pausePlayback = async () => {
    if (playbackStatus !== 'playing') return;
    const ctx = audioCtxRef.current;
    if (ctx) {
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
      const elapsed = ctx.currentTime - playbackStartTimeRef.current;
      playbackRemainingTimeRef.current = Math.max(0, playbackTotalDurationRef.current - elapsed);
      await ctx.suspend();
      setPlaybackStatus('paused');
    }
  };

  const resumePlayback = async () => {
    if (playbackStatus !== 'paused') return;
    const ctx = audioCtxRef.current;
    if (ctx) {
      await ctx.resume();
      setPlaybackStatus('playing');
      const startTime = ctx.currentTime;
      playbackStartTimeRef.current = startTime - (playbackTotalDurationRef.current - playbackRemainingTimeRef.current);
      
      playbackTimerRef.current = setTimeout(() => {
        setPlaybackStatus('idle');
        playbackOffsetRef.current = 0;
      }, playbackRemainingTimeRef.current * 1000);
    }
  };

  const drawOscilloscope = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      if (!analyserRef.current) return;
      analyserRef.current.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f59e0b'; // primary amber
      ctx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  }, []);

  useEffect(() => {
    if (playbackStatus === 'playing') drawOscilloscope();
  }, [playbackStatus, drawOscilloscope]);

  const downloadMorseAudio = async () => {
    if (!morse) return;
    if (morse.length > 2000) {
      toast.error("Artifact density limit breached. Please subset the message.");
      return;
    }

    setIsExporting(true);
    toast.info("Generating Audio Artifact...");

    try {
      const dot = 0.12;
      const sampleRate = 44100;

      // Calculate total duration
      let totalTime = 0;
      morse.split('').forEach(char => {
        if (char === '.') totalTime += dot + dot;
        else if (char === '-') totalTime += (dot * 3) + dot;
        else if (char === ' ') totalTime += dot;
        else if (char === '/') totalTime += dot * 4;
      });

      const offlineCtx = new OfflineAudioContext(1, sampleRate * (totalTime + 0.5), sampleRate);
      let renderTime = 0;

      morse.split('').forEach(char => {
        if (char === '.' || char === '-') {
          const osc = offlineCtx.createOscillator();
          const gain = offlineCtx.createGain();
          const dur = char === '.' ? dot : dot * 3;

          osc.type = "sine";
          osc.frequency.setValueAtTime(600, renderTime);

          gain.gain.setValueAtTime(0, renderTime);
          gain.gain.linearRampToValueAtTime(0.12, renderTime + 0.005);
          gain.gain.setValueAtTime(0.12, renderTime + dur);
          gain.gain.linearRampToValueAtTime(0, renderTime + dur + 0.005);

          osc.connect(gain);
          gain.connect(offlineCtx.destination);

          osc.start(renderTime);
          osc.stop(renderTime + dur + 0.01);
          renderTime += dur + dot;
        } else if (char === ' ') {
          renderTime += dot;
        } else if (char === '/') {
          renderTime += dot * 4;
        }
      });

      const buffer = await offlineCtx.startRendering();
      const wavBlob = bufferToWave(buffer, buffer.length);
      const url = URL.createObjectURL(wavBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `morse_signal_${Date.now()}.wav`;
      link.click();
      toast.success("Morse WAV Artifact Exported");
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      toast.error("Export failure occurred.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (direction !== "morse-to-text") setDirection("morse-to-text");

    setIsTapping(true);
    tapStartRef.current = Date.now();
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioCtxRef.current;
    if (activeOscillator.current) {
      activeOscillator.current.stop();
      activeOscillator.current.disconnect();
    }

    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.connect(ctx.destination);
      drawOscilloscope();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);

    osc.connect(gain);
    gain.connect(analyserRef.current);
    osc.start();

    activeOscillator.current = osc;
    activeGain.current = gain;
  };

  const handlePointerUp = () => {
    setIsTapping(false);
    const duration = Date.now() - tapStartRef.current;

    if (activeGain.current && audioCtxRef.current) {
      activeGain.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.01);
      activeOscillator.current?.stop(audioCtxRef.current.currentTime + 0.02);
    }

    const symbol = duration < 180 ? "." : "-";
    const newVal = morse + symbol;
    setMorse(newVal);

    // Auto-spacing timeouts
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => {
      setMorse(m => m + " ");
      tapTimeoutRef.current = setTimeout(() => {
        setMorse(m => m.trimEnd() + " / ");
      }, 1000);
    }, 450);

    // Live update text
    const translated = newVal.split(' ').map(s => REVERSE_MORSE[s] || s).join('');
    setText(translated);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 ">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-6 grow overflow-visible">
          <div className="flex flex-col gap-6">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60 shadow-2xl">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                  Morse Code <span className="text-primary italic">Studio</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  Text & Morse Translator · Web Audio Beeps · Zero Logs
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start overflow-visible">
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

                <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-card p-4 lg:p-6 border-2 border-primary/5">
                  <CardContent className="p-0 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 opacity-60 italic">
                          {direction === "text-to-morse" ? "Input Text" : "Input Morse"}
                        </p>
                        <textarea
                          value={direction === "text-to-morse" ? text : morse}
                          maxLength={CHAR_LIMIT}
                          onChange={(e) => direction === "text-to-morse" ? handleTextChange(e.target.value) : handleMorseChange(e.target.value)}
                          placeholder={direction === "text-to-morse" ? "Enter plaintext here..." : "Enter morse symbols (. - /) here..."}
                          className="w-full h-32 bg-background/20 border border-primary/10 rounded-xl p-4 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all custom-scrollbar uppercase relative"
                        />
                        <div className="flex justify-end pr-2 mt-1">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${(direction === "text-to-morse" ? text : morse).length >= CHAR_LIMIT ? 'text-primary' : 'opacity-20'}`}>
                            {(direction === "text-to-morse" ? text : morse).length} / {CHAR_LIMIT}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={swapDirection}
                        className="h-12 w-12 rounded-2xl border-primary/20 hover:bg-primary/20 shrink-0"
                      >
                        <RefreshCw className="h-5 w-5" />
                      </Button>
                      <div className="flex-1 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1 opacity-60 italic">
                          {direction === "text-to-morse" ? "Morse Output" : "Text Output"}
                        </p>
                        <div className="w-full h-32 bg-background/20 border border-primary/10 rounded-xl p-4 text-sm font-medium overflow-y-auto custom-scrollbar break-all shadow-inner">
                          {direction === "text-to-morse" ? morse : text}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-primary/5">
                      <Button
                        onClick={copy}
                        className="gap-3 h-12 px-8 font-black text-xs rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase italic border border-primary/20"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied" : "Copy Artifact"}
                      </Button>
                      <Button
                        onClick={() => {
                          if (playbackStatus === 'playing') pausePlayback();
                          else if (playbackStatus === 'paused') resumePlayback();
                          else playMorse(0);
                        }}
                        disabled={!morse}
                        variant="secondary"
                        className="gap-3 h-12 px-8 font-black text-xs rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase italic border border-primary/10 relative overflow-hidden group/play min-w-[170px]"
                      >
                        <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover/play:translate-y-0 transition-transform duration-300" />
                        {playbackStatus === 'playing' ? <Hash className="h-3.5 w-3.5 relative z-10" /> : <Play className="h-3.5 w-3.5 relative z-10" />}
                        <span className="relative z-10">
                          {playbackStatus === 'playing' ? "Pause Transmission" : playbackStatus === 'paused' ? "Resume Signal" : "Play Beeps"}
                        </span>
                      </Button>
                      {playbackStatus !== 'idle' && (
                        <Button
                          onClick={stopPlayback}
                          variant="outline"
                          className="h-12 w-12 rounded-2xl border-primary/20 hover:bg-primary/5 shadow-xl animate-in zoom-in-95"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        onClick={downloadMorseAudio}
                        disabled={!morse || isExporting}
                        className="gap-3 h-12 px-8 font-black text-xs rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase italic border border-primary/20 bg-primary text-primary-foreground"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {isExporting ? "Rendering..." : "Download WAV"}
                      </Button>
                    </div>

                    <div className="space-y-4 pt-6 mt-6 border-t border-primary/5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Radio className="h-4 w-4 text-primary" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Signal Command Center</h3>
                        </div>
                        {playbackStatus === 'playing' && (
                          <div className="flex gap-1">
                            <div className="h-1 w-4 bg-primary animate-pulse" />
                            <div className="h-1 w-4 bg-primary/40" />
                            <div className="h-1 w-4 bg-primary/10" />
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative h-32 rounded-3xl overflow-hidden border border-primary/10 bg-black/40 group/key">
                          <canvas
                            ref={canvasRef}
                            width={400}
                            height={128}
                            className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
                          />
                          <button
                            onPointerDown={handlePointerDown}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={() => isTapping && handlePointerUp()}
                            className={`absolute inset-0 flex flex-col items-center justify-center gap-3 select-none touch-none transition-all
                                        ${isTapping
                                ? 'bg-primary/20 scale-[0.98]'
                                : 'hover:bg-black/20'}
                                    `}
                          >
                            <div className={`h-12 w-12 rounded-full border-2 flex items-center justify-center transition-all ${isTapping ? 'bg-white border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'border-primary/40'}`}>
                              <div className={`h-3 w-3 rounded-full ${isTapping ? 'bg-primary' : 'bg-primary/40'}`} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] italic ${isTapping ? 'text-white' : 'text-primary'}`}>
                              {isTapping ? "TRANS-LINK ACTIVE" : "MANUAL SIGNAL KEY"}
                            </span>
                          </button>
                        </div>
                        <div className="bg-black/20 rounded-3xl border border-primary/5 p-6 flex flex-col justify-center gap-4 relative overflow-hidden h-32">
                          <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Play className="h-16 w-16" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Translation Protocol</p>
                            <p className="text-[18px] font-black text-white italic tracking-tight italic">
                              {direction === "text-to-morse" ? "Alpha to Studio-Pulse" : "Pulse-Stream to Text"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Live Encryption: Active</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl bg-card border-2 border-primary/5">
                  <div className="bg-primary/5 p-5 border-b border-primary/10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Morse Guide</h3>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      <div className="flex justify-between p-2 bg-background/20 rounded-lg border border-primary/5"><span>A</span> <span className="text-primary">.-</span></div>
                      <div className="flex justify-between p-2 bg-background/20 rounded-lg border border-primary/5"><span>B</span> <span className="text-primary">-...</span></div>
                      <div className="flex justify-between p-2 bg-background/20 rounded-lg border border-primary/5"><span>C</span> <span className="text-primary">-.-.</span></div>
                      <div className="flex justify-between p-2 bg-background/20 rounded-lg border border-primary/5"><span>D</span> <span className="text-primary">-..</span></div>
                      <div className="flex justify-between p-2 bg-background/20 rounded-lg border border-primary/5"><span>E</span> <span className="text-primary">.</span></div>
                      <div className="flex justify-between p-2 bg-background/20 rounded-lg border border-primary/5"><span>/</span> <span className="text-primary">Word Gap</span></div>
                    </div>
                    <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic leading-relaxed">
                      International Standard · Zero Server Calls
                    </p>
                  </CardContent>
                </Card>
              </aside>
            </div>

            <ToolExpertSection
              title="Morse Code Studio"
              accent="rose"
              overview="The Morse Code Studio is a high-fidelity communications translation workbench designed for radio enthusiasts, survivalists, and cryptographic analysts. I engineered this laboratory to provide a surgical path for mapping plaintext to International Morse Code artifacts (and vice versa) without the security risks of 'on-the-fly' translators that can log your tactical messages and harvest your phonetic data for metadata analysis."
              steps={[
                "Stage your 'Plaintext' or 'Pulse-Stream' into the Command Center workspace.",
                "Toggle the 'Translation Protocol' to set your target transformation path.",
                "Monitor the 'Signal Command Center' (Oscilloscope) to visualize the acoustic bitstream.",
                "Utilize the 'Manual Signal Key' to practice tactile transmission in real-time.",
                "Export your localized Morse code as a high-fidelity WAV artifact or copy the sanitized string."
              ]}
              technicalImplementation="I architected this studio using the Web Audio API OscillatorNode and GainNode for precision signal generation. The engine utilizes an OfflineAudioContext for high-speed bitstream rendering during export. By implementing a local MORSE_MAP dictionary and an asychronous Sequence-to-Buffer Pipeline, we ensure that your acoustic artifacts are generated with microsecond timing accuracy without any network round-trips."
              privacyGuarantee="The Security \u0026 Privacy model for the Morse Lab is built on Phonetic Isolation. Your messages—whether tactile or textual—exist strictly within your browser's private application state. At no point are your signal patterns transmitted to a remote server. The tool is entirely air-gapped, ensuring that your private communication artifacts remain strictly confidential and off the cloud."
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

export default MorseCodeMaster;
