import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Download, Play, Pause, Music, Zap, CloudUpload, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";

import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

const ReverseAudio = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [processing, setProcessing] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
    const analyser = ctx.createAnalyser();

    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(ctx.destination);

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceCreatedRef.current = true;
  }, []);

  const drawVisualizer = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current || !audioRef.current || audioRef.current.paused) return;
    const canvas = canvasRef.current;
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
        const index = Math.floor(i * step) + j;
        if (index >= data.length) break;
        const datum = data[index];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      const barHeight = Math.max(1, (max - min) * amp * 0.8);
      ctx.fillStyle = "rgba(139, 92, 246, 0.7)";
      ctx.beginPath();
      ctx.roundRect(i, amp - barHeight / 2, barWidth, barHeight, 1);
      ctx.fill();
    }
  }, [audioBuffer]);

  // Resource Cleanup Engine (Prevent Memory Leaks)
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [objectUrl, processedUrl]);

  useEffect(() => {
    if (audioBuffer) drawStaticWaveform();
  }, [audioBuffer, drawStaticWaveform]);

  const handleFile = async (f: File | undefined) => {
    if (!f) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);

    setFile(f);
    setProcessedUrl(null);
    const url = URL.createObjectURL(f);
    setObjectUrl(url);

    try {
      const arrayBuffer = await f.arrayBuffer();
      const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = await tempCtx.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      await tempCtx.close();
      toast.success("Audio Artifact Staged");
    } catch (e) {
      toast.error("Failed to decode audio master.");
    }

    sourceCreatedRef.current = false;
  };

  usePasteFile(handleFile);

  const processReverse = async () => {
    if (!audioBuffer || !file) return;
    setProcessing(true);
    toast.info("Flipping Phase Matrix...");

    try {
      const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const reversedBuffer = tempCtx.createBuffer(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        const reversedChannelData = reversedBuffer.getChannelData(i);
        for (let j = 0; j < audioBuffer.length; j++) {
          reversedChannelData[j] = channelData[audioBuffer.length - 1 - j];
        }
      }

      const wavBlob = bufferToWave(reversedBuffer, reversedBuffer.length);
      const url = URL.createObjectURL(wavBlob);
      setProcessedUrl(url);
      toast.success("Temporal Inversion Complete");
      await tempCtx.close();
    } catch (e) {
      console.error(e);
      toast.error("Audio processing failed.");
    } finally {
      setProcessing(false);
    }
  };

  const bufferToWave = (abuf: AudioBuffer, len: number) => {
    const numOfChan = abuf.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i, sample, offset = 0, pos = 0;

    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(abuf.sampleRate);
    setUint32(abuf.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (i = 0; i < abuf.numberOfChannels; i++) channels.push(abuf.getChannelData(i));

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF);
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }
    return new Blob([buffer], { type: "audio/wav" });
  };

  const handlePlay = () => {
    if (!audioRef.current) return;
    ensureAudioGraph();
    audioCtxRef.current?.resume().catch(() => { });

    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
      isPlayingRef.current = true;
      startPlayheadLoop();
      drawVisualizer();
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
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-audio transition-all duration-500 overflow-x-hidden">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-12 grow">
          <div className="flex flex-col gap-10">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60 shadow-2xl">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                  Reverse <span className="text-primary italic">Audio</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  Temporal Phase Inversion Studio • Native Buffer Flipping
                </p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <div className="flex min-[1600px]:hidden justify-center mb-8 w-full">
              <AdBox height={250} label="300x250 AD" className="w-full max-w-[400px]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="lg:col-span-8 space-y-8">
                {!file ? (
                  <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[400px] flex flex-col items-center justify-center relative bg-card rounded-2xl shadow-inner p-10 select-none">
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                      onClick={() => !processing && inputRef.current?.click()}
                      className="relative w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer py-32 bg-background/40 hover:border-primary/40 hover:bg-primary/5 shadow-inner"
                    >
                      <div className="h-24 w-24 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                        <Music className="h-12 w-12 text-primary" />
                      </div>
                      <div className="px-6 space-y-1">
                        <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Artifact</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Drag master or click</p>
                        <p className="mt-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-20 text-center">MP3, WAV, OGG Support • Bit-Level Reversion</p>
                      </div>
                      <input ref={inputRef} type="file" className="hidden" accept="audio/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                    </div>
                  </Card>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <Card className="glass-morphism border-primary/10 p-0 rounded-2xl shadow-2xl bg-card group relative overflow-hidden">
                      <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Music className="h-4 w-4 text-primary" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Wave Stage</h3>
                        </div>
                      </div>
                      <CardContent className="p-10">
                        <div className="space-y-10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                                <Music className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-muted-foreground">Acoustic Status</p>
                                <p className="text-2xl font-black italic tracking-tight text-primary uppercase">Ready for Inversion</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-20 text-foreground">Active Source</p>
                              <p className="text-xs font-black text-foreground truncate max-w-[200px] italic">{file.name}</p>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-primary/10 flex flex-col items-center gap-6">
                            <div
                              className="w-full h-48 bg-background/40 rounded-2xl border border-border/50 shadow-inner flex items-center justify-center overflow-hidden relative group/waveform cursor-pointer"
                              onClick={(e) => {
                                if (!audioBuffer) return;
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = (e.clientX - rect.left) / rect.width;
                                const t = x * audioBuffer.duration;
                                if (audioRef.current) audioRef.current.currentTime = t;
                                setCurrentTime(t);
                              }}
                            >
                              <canvas ref={staticCanvasRef} className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" />
                              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />
                              {audioBuffer && (
                                <div
                                  className="absolute top-0 bottom-0 w-[3px] bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] z-50 pointer-events-none"
                                  style={{ left: `${(currentTime / audioBuffer.duration) * 100}%` }}
                                />
                              )}
                            </div>

                            <div className="w-full flex items-center justify-between gap-6 px-2">
                              <div className="flex items-center gap-5">
                                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border border-primary/20 hover:bg-primary/5 group" onClick={resetPlayback}>
                                  <RotateCcw className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                </Button>
                                <button onClick={handlePlay} className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform shadow-xl">
                                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
                                </button>
                              </div>

                              <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-20 text-muted-foreground">Temporal Registry</p>
                                <code className="text-sm font-black text-foreground font-mono">
                                  {currentTime.toFixed(2)}s <span className="opacity-20 mx-1">/</span> {audioBuffer ? audioBuffer.duration.toFixed(2) : "0.00"}s
                                </code>
                              </div>
                            </div>

                            <audio ref={audioRef} src={objectUrl || ""} className="hidden" />
                          </div>
                        </div>
                      </CardContent>

                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Button
                          onClick={() => { setFile(null); setAudioBuffer(null); setObjectUrl(null); setProcessedUrl(null); }}
                          variant="destructive"
                          size="sm"
                          className="h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                          Reset Stage
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </div>

              <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl bg-card">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center gap-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Inversion Logic</h3>
                  </div>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">Engineering Data</p>
                      <div className="p-4 rounded-2xl bg-background/40 border border-white/5 space-y-1">
                        <p className="text-[9px] font-bold text-foreground">Engine: <span className="text-primary font-mono uppercase">Temporal Flip</span></p>
                        <p className="text-[9px] font-bold text-foreground">Buffer: <span className="text-primary font-mono uppercase">Full Array</span></p>
                      </div>
                    </div>

                    {processedUrl ? (
                      <Button asChild className="w-full gap-3 h-20 text-lg font-black rounded-2xl shadow-xl hover:scale-[1.01] transition-all uppercase italic">
                        <a href={processedUrl} download={`reversed_${file?.name}`}>
                          <Download className="h-6 w-6" /> Download Artifact
                        </a>
                      </Button>
                    ) : (
                      <Button
                        onClick={processReverse}
                        disabled={!file || processing}
                        className="w-full gap-3 h-16 text-lg font-black rounded-2xl shadow-xl hover:scale-[1.01] transition-all uppercase italic"
                      >
                        <RefreshCw className={`h-6 w-6 ${processing ? "animate-spin" : ""}`} />
                        {processing ? "Inverting..." : "Reverse Audio"}
                      </Button>
                    )}
                    <p className="text-[9px] text-center mt-4 text-muted-foreground font-black uppercase tracking-widest opacity-40 italic leading-relaxed">
                      Flips the temporal phase of the audio buffer. Zero server interaction.
                    </p>
                  </CardContent>
                </Card>

                <div className="px-6">

                </div>
              </aside>
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Temporal Audio Inversion Studio"
              description="The Reverse Audio tool is a specialized signal processing utility designed to flip the temporal phase of audio buffers, creating the 'backmasking' effect used in creative sound design and phonetic analysis."
              transparency="Our processor uses the browser's Web Audio API 'AudioBuffer' system. We read your file into a local TypedArray, reverse the samples mathematically, and re-encode them into a WAV artifact directly in your browser's thread. No audio data ever touches a remote server—your private recordings and creative masters remain on your device at all times."
              limitations="While the tool is extremely fast for standard clips, reversing very long audio files (10+ minutes) can be RAM-intensive as it requires loading the entire uncompressed buffer into memory. For the best experience with large files, ensure your browser has sufficient memory headroom."
              accent="indigo"
            />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />

      {/* Mobile Sticky Anchor Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex min-[1600px]:hidden justify-center bg-black/80 backdrop-blur-sm border-t border-white/10 py-2 h-[66px] overflow-hidden">
        <AdBox height={50} label="320x50 ANCHOR AD" className="w-full" />
      </div>
    </div>
  );
};

export default ReverseAudio;
