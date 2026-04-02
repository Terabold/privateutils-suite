import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, Download, RotateCcw, CloudUpload, Scissors, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

const AudioTrimmer = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [range, setRange] = useState([0, 100]); // Start/End in seconds
  const [duration, setDuration] = useState(0);
  const [processing, setProcessing] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isPlayingRef = useRef(false);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const buffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      setDuration(buffer.duration);
      setRange([0, Math.min(buffer.duration, 30)]); // Default 30s or full
      setCurrentTime(0);
      toast.success("Audio decoded successfully");
    } catch (error) {
      toast.error("Failed to decode audio. Please use WAV, MP3 or OGG.");
    }
  };

  usePasteFile(handleFile);

  useEffect(() => {
    if (audioBuffer) {
      drawWaveform();
    }
  }, [audioBuffer]);

  useEffect(() => {
    const handleResize = () => {
      if (audioBuffer) drawWaveform();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [audioBuffer]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.moveTo(0, amp);
    ctx.lineTo(width, amp);
    ctx.strokeStyle = "rgba(139, 92, 246, 0.1)";
    ctx.stroke();

    const barWidth = 2;
    const gap = 1;

    for (let i = 0; i < width; i += (barWidth + gap)) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step * (barWidth + gap); j++) {
        const index = Math.floor(i * step) + j;
        if (index >= data.length) break;
        const datum = data[index];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      const barHeight = Math.max(1, (max - min) * amp * 0.8);
      const gradient = ctx.createLinearGradient(0, amp - barHeight / 2, 0, amp + barHeight / 2);
      gradient.addColorStop(0, "#7c3aed");
      gradient.addColorStop(0.5, "#a78bfa");
      gradient.addColorStop(1, "#7c3aed");

      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.9;
      const y = amp - barHeight / 2;
      ctx.beginPath();
      ctx.roundRect(i, y, barWidth, barHeight, 1);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  };

  const playPreview = () => {
    if (!audioBuffer || !audioCtxRef.current) return;

    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    const source = audioCtxRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtxRef.current.destination);

    let startOffset = currentTime;
    if (startOffset < range[0] - 0.01 || startOffset > range[1] + 0.01) {
      startOffset = range[0];
    }

    const durationToPlay = range[1] - startOffset;
    if (durationToPlay <= 0) return;

    source.start(0, startOffset, durationToPlay);
    sourceNodeRef.current = source;
    startTimeRef.current = audioCtxRef.current.currentTime - startOffset;
    setIsPlaying(true);
    isPlayingRef.current = true;

    const updateProgress = () => {
      if (!audioCtxRef.current) return;
      const current = audioCtxRef.current.currentTime - startTimeRef.current;
      if (current >= range[1]) {
        setIsPlaying(false);
        setCurrentTime(range[0]);
        return;
      }
      setCurrentTime(current);
      if (sourceNodeRef.current === source && isPlayingRef.current) {
        requestAnimationFrame(updateProgress);
      }
    };

    requestAnimationFrame(updateProgress);

    source.onended = () => {
      if (sourceNodeRef.current === source) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        if (audioCtxRef.current && (audioCtxRef.current.currentTime - startTimeRef.current) >= range[1] - 0.05) {
          setCurrentTime(range[0]);
        }
      }
    };
  };

  const resetPlayback = () => {
    sourceNodeRef.current?.stop();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentTime(range[0]);
  };

  const downloadTrimmed = async () => {
    if (!audioBuffer || !audioCtxRef.current) return;
    setProcessing(true);

    try {
      const startSample = Math.floor(range[0] * audioBuffer.sampleRate);
      const endSample = Math.floor(range[1] * audioBuffer.sampleRate);
      const length = endSample - startSample;

      const trimmedBuffer = audioCtxRef.current.createBuffer(
        audioBuffer.numberOfChannels,
        length,
        audioBuffer.sampleRate
      );

      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        const trimmedData = trimmedBuffer.getChannelData(i);
        trimmedData.set(channelData.subarray(startSample, endSample));
      }

      const wavBlob = audioBufferToWav(trimmedBuffer);
      const url = URL.createObjectURL(wavBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `trimmed_${fileName.split('.')[0] || 'audio'}.wav`;
      link.click();
      toast.success("Trimmed audio exported as WAV");
    } catch (e) {
      toast.error("Export failed");
    } finally {
      setProcessing(false);
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels = [];
    let offset = 0;
    let pos = 0;

    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };

    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);

    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);

    setUint32(0x61746164);
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++)
      channels.push(buffer.getChannelData(i));

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF);
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([bufferArray], { type: "audio/wav" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-audio transition-all duration-500 overflow-x-hidden">
      <style>{`
        input[type="number"].emerald-arrows::-webkit-inner-spin-button, 
        input[type="number"].emerald-arrows::-webkit-outer-spin-button {
          filter: sepia(1) hue-rotate(100deg) saturate(3) brightness(0.8);
        }
      `}</style>
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <main className="container mx-auto max-w-[1400px] px-6 py-12">
        <div className="flex flex-col gap-10">
          <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <Link to="/">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow leading-none">
                Audio <span className="text-primary italic">Trimmer</span>
              </h1>
              <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[9px]">High-Precision Local Audio Partitioning</p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="lg:col-span-8 space-y-8">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl transition-all duration-700 hover:border-primary/30 group relative">
                <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Scissors className="h-4 w-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Wave Stage</h3>
                  </div>
                </div>
                <CardContent className="p-10">
                  {!audioBuffer ? (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                      onClick={() => inputRef.current?.click()}
                      className="relative w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center cursor-pointer py-32 bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner"
                    >
                      <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                        <CloudUpload className="h-10 w-10 text-primary" />
                      </div>
                      <div className="px-6 space-y-1">
                        <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Artifact</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Drag master or click</p>
                        <KbdShortcut />
                        <p className="mt-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-20">MP3, WAV, or OGG Files Supported</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full space-y-6">
                      <div
                        className="relative h-64 w-full bg-background/50 rounded-2xl border border-border/50 shadow-inner group/waveform cursor-pointer select-none"
                        onMouseDown={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = (e.clientX - rect.left) / rect.width;
                          const clickTime = x * duration;

                          // Check if clicking near left or right trim edge
                          const leftEdgePos = range[0] / duration;
                          const rightEdgePos = range[1] / duration;
                          const edgeThreshold = 0.02; // ~2% of width for better hit area

                          if (Math.abs(x - leftEdgePos) < edgeThreshold) {
                            // Drag left trim handle
                            const onMove = (ev: MouseEvent) => {
                              const mx = Math.max(0, Math.min((ev.clientX - rect.left) / rect.width, 1));
                              const t = mx * duration;
                              setRange(prev => [Math.min(t, prev[1] - 0.05), prev[1]]);
                              setCurrentTime(prev => t > prev ? t : prev); // Only move playhead if handle crosses it
                            };
                            const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                            window.addEventListener('mousemove', onMove);
                            window.addEventListener('mouseup', onUp);
                          } else if (Math.abs(x - rightEdgePos) < edgeThreshold) {
                            // Drag right trim handle
                            const onMove = (ev: MouseEvent) => {
                              const mx = Math.max(0, Math.min((ev.clientX - rect.left) / rect.width, 1));
                              const t = mx * duration;
                              setRange(prev => [prev[0], Math.max(t, prev[0] + 0.05)]);
                              setCurrentTime(prev => t < prev ? t : prev); // Only move playhead if handle crosses it
                            };
                            const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                            window.addEventListener('mousemove', onMove);
                            window.addEventListener('mouseup', onUp);
                          } else {
                            // Click to seek playhead
                            const newTime = Math.max(0, Math.min(clickTime, duration));
                            setCurrentTime(newTime);
                            const onMove = (ev: MouseEvent) => {
                              const mx = (ev.clientX - rect.left) / rect.width;
                              setCurrentTime(Math.max(0, Math.min(mx * duration, duration)));
                            };
                            const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                            window.addEventListener('mousemove', onMove);
                            window.addEventListener('mouseup', onUp);
                          }
                        }}
                      >
                        <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />

                        {/* Dimmed regions outside trim range */}
                        <div className="absolute top-0 bottom-0 left-0 bg-black/60 pointer-events-none" style={{ width: `${(range[0] / duration) * 100}%` }} />
                        <div className="absolute top-0 bottom-0 right-0 bg-black/60 pointer-events-none" style={{ width: `${((duration - range[1]) / duration) * 100}%` }} />

                        {/* Green highlight for trim range */}
                        <div className="absolute top-0 bottom-0 bg-emerald-500/10 pointer-events-none border-x border-emerald-500/30"
                          style={{ left: `${(range[0] / duration) * 100}%`, width: `${((range[1] - range[0]) / duration) * 100}%` }} />

                        {/* Left trim handle */}
                        <div
                          className="absolute top-0 bottom-0 w-[1px] bg-emerald-500 cursor-col-resize z-30 shadow-glow"
                          style={{ left: `${(range[0] / duration) * 100}%` }}
                        >
                          <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl border border-white/30 hover:scale-110 active:scale-95 transition-all">
                            <div className="w-[1px] h-4 bg-white/60" />
                          </div>
                        </div>

                        {/* Right trim handle */}
                        <div
                          className="absolute top-0 bottom-0 w-[1px] bg-emerald-500 cursor-col-resize z-30 shadow-glow"
                          style={{ left: `${(range[1] / duration) * 100}%` }}
                        >
                          <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl border border-white/30 hover:scale-110 active:scale-95 transition-all">
                            <div className="w-[1px] h-4 bg-white/60" />
                          </div>
                        </div>

                        {/* Playhead */}
                        {audioBuffer && (
                          <div
                            className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-50 pointer-events-none"
                            style={{ left: `${(currentTime / duration) * 100}%` }}
                          />
                        )}
                      </div>

                      {/* Compact controls row */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Start</label>
                            <input
                              type="number" step="0.01" value={range[0].toFixed(2)}
                              onChange={(e) => setRange([Math.min(parseFloat(e.target.value) || 0, range[1]), range[1]])}
                              className="w-24 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm font-black font-mono outline-none focus:border-emerald-500 transition-colors text-emerald-500"
                            />
                          </div>
                          <span className="text-muted-foreground/30 text-xs">—</span>
                          <div className="flex items-center gap-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">End</label>
                            <input
                              type="number" step="0.1" value={range[1].toFixed(2)}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value) || duration;
                                setRange([range[0], Math.max(v, range[0])]);
                                if (currentTime > v) setCurrentTime(v);
                              }}
                              className="w-24 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm font-black font-mono outline-none focus:border-emerald-500 transition-colors text-emerald-500 emerald-arrows"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline" size="icon"
                              className="h-16 w-16 rounded-2xl border border-primary/20 hover:bg-primary/5 transition-all group"
                              onClick={resetPlayback} title="Reset to Start"
                            >
                              <RotateCcw className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Button>
                            <button
                              onClick={playPreview}
                              className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform shadow-xl shadow-primary/20 relative group overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <input ref={inputRef} type="file" className="hidden" accept="audio/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                  
                  {/* Reset Button (Integrated into Workbench) */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button 
                      onClick={() => { setAudioBuffer(null); setFileName(""); }} 
                      variant="destructive" 
                      size="sm" 
                      className="h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                      Reset Stage
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic px-4">32-bit precision • Web Audio API sandbox • Zero server interaction</p>
            </div>

            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center gap-3">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Export Parameters</h3>
                </div>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-6">
                    <div className="p-6 bg-background/50 rounded-2xl border border-border/50 space-y-4 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Source Mass</span>
                        <span className="text-[11px] font-black truncate max-w-[150px] italic text-primary">{fileName || "None"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Duration Scan</span>
                        <span className="text-[11px] font-black font-mono text-foreground">{duration.toFixed(2)}s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Binary Forge</span>
                        <span className="text-[11px] font-black text-primary italic">LPCM WAV</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button
                      onClick={downloadTrimmed}
                      disabled={!audioBuffer || processing}
                      className="w-full gap-3 h-16 text-lg font-black rounded-2xl shadow-xl shadow-primary/10 hover:bg-primary hover:text-primary-foreground hover:scale-[1.01] active:scale-[0.99] transition-all uppercase italic"
                    >
                      <Download className="h-6 w-6" />
                      {processing ? "Slicing Samples..." : "Export Trimmed"}
                    </Button>
                    <p className="text-[9px] text-center mt-4 text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40 italic">
                      Direct-to-Disk High-Fidelity Export
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="px-6">
                <AdPlaceholder format="rectangle" className="opacity-40 grayscale group-hover:grayscale-0 transition-all" />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AudioTrimmer;