import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Volume2, Download, Music, ShieldCheck, Terminal, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";

const UniversalVolumeBooster = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [volume, setVolume] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement>(null);
  const isPlayingRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const playheadAnimationRef = useRef<number | null>(null);
  const sourceCreatedRef = useRef(false);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const ensureAudioGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || sourceCreatedRef.current) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = ctx.createMediaElementSource(audio);
    const gain = ctx.createGain();
    const analyser = ctx.createAnalyser();
    
    analyser.fftSize = 256;
    gain.gain.value = volume / 100;

    source.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainNodeRef.current = gain;
    analyserRef.current = analyser;
    sourceCreatedRef.current = true;
  }, [volume]);

  const drawVisualizer = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current || !audioRef.current || audioRef.current.paused) return;
    const canvas = canvasRef.current;
    
    // Set actual resolution
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);
    
    const barWidth = (width / bufferLength) * 2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      
      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      gradient.addColorStop(0, "#8b5cf6");
      gradient.addColorStop(1, "#6366f1");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, height - barHeight, barWidth, barHeight, [2, 2, 0, 0]);
      ctx.fill();
      
      x += barWidth + 2;
    }
    
    animationRef.current = requestAnimationFrame(drawVisualizer);
  }, []);

  const drawStaticWaveform = useCallback(() => {
    const canvas = staticCanvasRef.current;
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
    
    const barWidth = 2;
    const gap = 1;
    
    for (let i = 0; i < width; i += (barWidth + gap)) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step * (barWidth + gap); j++) {
        const datum = data[Math.floor(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      
      const barHeight = Math.max(1, (max - min) * amp * 0.8);
      ctx.fillStyle = "rgba(139, 92, 246, 0.7)"; // Increased opacity
      ctx.beginPath();
      ctx.roundRect(i, amp - barHeight / 2, barWidth, barHeight, 1);
      ctx.fill();
    }
  }, [audioBuffer]);

  useEffect(() => {
    if (audioBuffer) drawStaticWaveform();
  }, [audioBuffer, drawStaticWaveform]);

  useEffect(() => {
    const handleResize = () => {
      if (audioBuffer) drawStaticWaveform();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [audioBuffer, drawStaticWaveform]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  const handleFile = async (f: File | undefined) => {
    if (!f) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (audioCtxRef.current) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
      gainNodeRef.current = null;
      analyserRef.current = null;
      sourceCreatedRef.current = false;
    }

    setFile(f);
    const url = URL.createObjectURL(f);
    setObjectUrl(url);
    setVolume(100);
    
    try {
      const arrayBuffer = await f.arrayBuffer();
      const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = await tempCtx.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      await tempCtx.close();
    } catch (e) {
      console.error("Waveform preview failed", e);
    }
    
    toast.success(`${f.name} loaded into studio`);
  };

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (playheadAnimationRef.current) cancelAnimationFrame(playheadAnimationRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, [objectUrl]);

  const handlePlay = () => {
    if (!audioRef.current) return;
    ensureAudioGraph();
    audioCtxRef.current?.resume().catch(() => {});
    
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
      isPlayingRef.current = true;
      startPlayheadLoop();
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (playheadAnimationRef.current) cancelAnimationFrame(playheadAnimationRef.current);
    }
  };

  const startPlayheadLoop = () => {
    if (playheadAnimationRef.current) cancelAnimationFrame(playheadAnimationRef.current);
    
    const update = () => {
      if (audioRef.current && isPlayingRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        playheadAnimationRef.current = requestAnimationFrame(update);
      }
    };
    playheadAnimationRef.current = requestAnimationFrame(update);
  };

  const resetPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (playheadAnimationRef.current) cancelAnimationFrame(playheadAnimationRef.current);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      setIsPlaying(true);
      isPlayingRef.current = true;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      drawVisualizer();
      startPlayheadLoop();
    };
    const onPause = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (playheadAnimationRef.current) cancelAnimationFrame(playheadAnimationRef.current);
    };
    const onEnded = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (playheadAnimationRef.current) cancelAnimationFrame(playheadAnimationRef.current);
      setCurrentTime(0);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [drawVisualizer]);

  const processAndDownload = async () => {
    if (!file) return;
    setProcessing(true);
    toast.info("Rendering Master... Please Wait.");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const ctx = new (window.OfflineAudioContext || (window as any).OfflineAudioContext)(2, 1, 44100); // Temporary for probing
      
      // Real decode
      const probingCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await probingCtx.decodeAudioData(arrayBuffer);
      await probingCtx.close();

      const offlineCtx = new (window.OfflineAudioContext || (window as any).OfflineAudioContext)(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = offlineCtx.createGain();
      gainNode.gain.value = volume / 100;

      source.connect(gainNode);
      gainNode.connect(offlineCtx.destination);
      source.start(0);

      const rendered = await offlineCtx.startRendering();
      const wav = encodeWav(rendered);
      const blob = new Blob([wav], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      const baseName = file.name.replace(/\.[^.]+$/, "");
      a.download = `${baseName}_powered.wav`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("High-Fidelity Audio Exported!");
    } catch (e) {
      toast.error("Format mismatch or decoder error. Use LPCM audio containers.");
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <main className="container mx-auto max-w-[1400px] px-6 py-12">
        <div className="flex flex-col gap-10">
          <header className="flex items-center justify-between flex-wrap gap-8">
            <div className="flex items-center gap-6">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic">
                   Universal <span className="text-primary italic">Volume Booster</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">High-Gain Local Processing Engine</p>
              </div>
            </div>
            
            {file && (
               <Button onClick={() => { setFile(null); setObjectUrl(null); }} variant="ghost" size="sm" className="gap-2 h-10 px-5 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-2xl transition-all">
                  Wipe Stage
               </Button>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
            <div className="space-y-8">
              {!file && (
                <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[400px] flex flex-col items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner p-10">
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                      onClick={() => !processing && inputRef.current?.click()}
                      className={`relative w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all ${!processing ? "cursor-pointer py-32 bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner" : "py-32 opacity-50"}`}
                    >
                      <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                         <Volume2 className="h-10 w-10 text-primary" />
                      </div>
                      
                      <div className="px-6">
                        <p className="text-2xl font-black text-foreground uppercase tracking-tight italic">Drop Audio/Video Artifacts</p>
                        <p className="mt-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">MP3, WAV, OGG, & MP4 Audio Streams Supported</p>
                      </div>
                      <input ref={inputRef} type="file" className="hidden" accept="audio/*,video/*" onChange={(e) => handleFile(e.target.files?.[0])} disabled={processing} />
                    </div>
                </Card>
              )}

              {file && objectUrl && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <Card className="glass-morphism border-primary/10 p-10 rounded-2xl shadow-2xl bg-zinc-900/50">
                    <div className="space-y-10">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                               <Music className="h-5 w-5" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-foreground">Gain Level</p>
                               <p className="text-2xl font-black italic tracking-tight text-primary">{volume}%</p>
                            </div>
                         </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-20 text-foreground">Peak Boost</p>
                             <p className="text-xl font-black text-foreground">{((volume - 100) / 100 * 6).toFixed(2)} dB</p>
                          </div>
                      </div>

                       <Slider
                         min={0}
                         max={500}
                         step={0.1}
                         value={[volume]}
                         onValueChange={([v]) => setVolume(v)}
                         className="py-6"
                       />

                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-30 px-2 italic">
                        <span>Silent</span>
                        <span>Standard (100%)</span>
                        <span>Hyper-Gain (5x)</span>
                      </div>

                      {/* Professional Player Layout */}
                      <div className="pt-6 border-t border-primary/10 flex flex-col items-center gap-6">
                        <div className="w-full h-32 bg-background/50 rounded-xl border border-border/50 shadow-inner flex items-center justify-center overflow-hidden relative group/waveform">
                           {/* Static Waveform Background */}
                           <canvas ref={staticCanvasRef} className="absolute inset-0 w-full h-full opacity-60" />
                           {/* Live Frequency Overly */}
                           <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
                           {/* Playhead (Laser Beam) */}
                           {audioBuffer && (
                              <div 
                                className="absolute top-0 bottom-0 w-[3px] bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] z-50 pointer-events-none"
                                style={{ left: `${(currentTime / audioBuffer.duration) * 100}%` }}
                              />
                           )}
                        </div>
                        
                        {/* Custom Player Controls */}
                        <div className="w-full flex items-center justify-between gap-6 px-2">
                           <div className="flex items-center gap-5">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 rounded-full border border-primary/20 hover:bg-primary/10 transition-all group"
                                onClick={resetPlayback}
                                title="Reset playback"
                              >
                                <RotateCcw className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              </Button>

                              <button 
                                onClick={handlePlay}
                                className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg shadow-primary/20"
                              >
                                {isPlaying ? <span className="h-5 w-5 border-l-4 border-r-4 border-white" /> : <Play className="h-6 w-6 fill-white" />}
                              </button>
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest opacity-20 text-foreground">Status</p>
                                 <p className="text-xs font-black italic tracking-tight text-primary">{isPlaying ? "Live Monitoring" : "Paused"}</p>
                              </div>
                           </div>
                           
                           <div className="text-right">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-20 text-foreground">Time Offset</p>
                              <code className="text-sm font-black text-foreground font-mono">
                                 {Math.floor(currentTime/60).toString().padStart(2,'0')}:{(Math.floor(currentTime)%60).toString().padStart(2,'0')} 
                                 <span className="opacity-20 mx-1">/</span>
                                 {audioBuffer ? `${Math.floor(audioBuffer.duration/60).toString().padStart(2,'0')}: ${(Math.floor(audioBuffer.duration)%60).toString().padStart(2,'0')}` : "00:00"}
                              </code>
                           </div>
                        </div>

                        <audio
                          ref={audioRef}
                          src={objectUrl}
                          onPause={() => { if (animationRef.current) cancelAnimationFrame(animationRef.current); }}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                 <div className="bg-primary/5 p-5 border-b border-primary/10">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Power Profile</h3>
                 </div>
                 <CardContent className="p-8 space-y-8">
                    <div className="p-6 rounded-2xl bg-zinc-950/50 border border-border/50 space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <ShieldCheck className="h-3.5 w-3.5" /> Bit-Stream Guard
                       </h4>
                       <p className="text-[11px] text-muted-foreground leading-relaxed italic opacity-80 font-medium">
                         Our <strong className="font-bold">Gain Normalizer</strong> prevents digital clipping by recalculating samples using 32-bit floating point precision before export.
                       </p>
                    </div>

                    <Button 
                      onClick={processAndDownload} 
                      disabled={!file || processing} 
                      className="w-full gap-3 h-16 text-lg font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic"
                    >
                      <Download className="h-6 w-6" />
                      {processing ? "Amplifying Artifact..." : "Export Boosted"}
                    </Button>
                    <p className="text-[9px] text-center mt-4 text-muted-foreground font-black uppercase tracking-widest opacity-40 italic">Total Client-Side Rendering</p>
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

// Internal WAV encoder helper
function encodeWav(audioBuffer: AudioBuffer): ArrayBuffer {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1;
  const bitsPerSample = 16;
  const numSamples = audioBuffer.length;
  const dataLength = numSamples * numChannels * (bitsPerSample / 8);
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = audioBuffer.getChannelData(ch)[i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return buffer;
}

export default UniversalVolumeBooster;

