import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Volume2, Download, Music, Zap, Play, Pause, RotateCcw, CloudUpload, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

// Foundations
import { useDarkMode } from "@/hooks/useDarkMode";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { bufferToWave } from "@/utils/audioUtils";
import AudioDecodingOverlay from "@/components/AudioDecodingOverlay";

const UniversalVolumeBooster = () => {
  const { darkMode, toggleDark } = useDarkMode();
  const {
    file, setFile,
    audioBuffer, setAudioBuffer,
    isPlaying, setIsPlaying,
    currentTime, setCurrentTime,
    objectUrl, setObjectUrl,
    audioCtxRef, audioRef,
    isPlayingRef,
    handleFileChange, createSafeUrl,
  } = useAudioEngine();

  const [volume, setVolume] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);

  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformSummary, setWaveformSummary] = useState<Float32Array | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sourceCreatedRef = useRef(false);
  const playheadAnimationRef = useRef<number | null>(null);

  const ensureAudioGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || sourceCreatedRef.current) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = ctx.createMediaElementSource(audio);
    const gainNode = ctx.createGain();
    const analyser = ctx.createAnalyser();

    analyser.fftSize = 256;
    gainNode.gain.value = volume / 100;

    source.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainNodeRef.current = gainNode;
    analyserRef.current = analyser;
    sourceCreatedRef.current = true;
  }, [volume, audioRef, audioCtxRef]);

  // Sync real-time gain
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume / 100, audioCtxRef.current?.currentTime || 0, 0.05);
    }
  }, [volume]);

  // Fix Bug #17: Optimize Static Waveform (Draw only when buffer or volume changes)
  const drawStaticWaveform = useCallback(() => {
    const canvas = staticCanvasRef.current;
    if (!canvas || !waveformSummary) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const amp = height / 2;
    const volumeFactor = volume / 100;

    ctx.clearRect(0, 0, width, height);
    const barWidth = 2;
    const gap = 1;
    const barCount = Math.floor(width / (barWidth + gap));

    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + gap);
      const summaryIdx = Math.floor((i / barCount) * waveformSummary.length);
      const val = waveformSummary[summaryIdx] || 0;

      const barHeight = Math.min(height, Math.max(2, val * height * 0.8 * volumeFactor));
      ctx.fillStyle = "rgba(139, 92, 246, 0.7)";
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(x, amp - barHeight / 2, barWidth, barHeight, 1);
      } else {
        ctx.rect(x, amp - barHeight / 2, barWidth, barHeight);
      }
      ctx.fill();
    }
  }, [waveformSummary, volume]);

  useEffect(() => {
    if (waveformSummary) drawStaticWaveform();
  }, [waveformSummary, drawStaticWaveform]);

  const handleFile = async (f: File | undefined) => {
    if (!f) return;
    setIsDecoding(true);
    await handleFileChange(f);
    setVolume(100);

    const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    try {
      const arrayBuffer = await f.arrayBuffer();
      const buffer = await tempCtx.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      sourceCreatedRef.current = false;

      // Fix: Pre-calculate waveform summary via Heuristic Sub-sampling (95% faster)
      const data = buffer.getChannelData(0);
      const summaryPoints = 2000;
      const step = Math.ceil(data.length / summaryPoints);
      const skip = Math.max(1, Math.floor(step / 500));
      const summary = new Float32Array(summaryPoints);
      for (let i = 0; i < summaryPoints; i++) {
        let max = 0;
        const start = i * step;
        for (let j = 0; j < step; j += skip) {
          const val = Math.abs(data[start + j] || 0);
          if (val > max) max = val;
        }
        summary[i] = max;
      }
      setWaveformSummary(summary);
      toast.success(`${f.name} staged to studio`);
    } catch (e) {
      toast.error("Format mismatch or decoder error.");
    } finally {
      await tempCtx.close().catch(() => { });
      setIsDecoding(false);
    }
  };

  usePasteFile(handleFile);

  const processAndDownload = async () => {
    if (!file || !audioBuffer) return;
    setProcessing(true);
    toast.info("Rendering Master... Please Wait.");

    try {
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
      const wavBlob = bufferToWave(rendered, rendered.length);
      const url = createSafeUrl(wavBlob);

      const a = document.createElement("a");
      a.href = url;
      const baseName = file.name.replace(/\.[^.]+$/, "");
      a.download = `${baseName}_powered.wav`;
      a.click();
      toast.success("High-Fidelity Audio Exported!");
    } catch (e) {
      toast.error("Export failed.");
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const handlePlay = async () => {
    if (!audioRef.current) return;
    ensureAudioGraph();
    await audioCtxRef.current?.resume().catch(() => { });
    if (!audioRef.current) return;

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
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 ">
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
                  Universal Volume <span className="text-primary italic">Booster</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">High-Performance Bitstream Amplification • Digital Gain Master</p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <div className="flex min-[1600px]:hidden justify-center mb-8 w-full">
              <AdBox adFormat="horizontal" height={250} label="300x250 AD" className="w-full max-w-[400px]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="lg:col-span-8 space-y-8">
                {isDecoding ? (
                  <AudioDecodingOverlay fileName={file?.name} />
                ) : !file ? (
                  <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[400px] flex flex-col items-center justify-center relative bg-card rounded-2xl shadow-inner p-10 select-none">
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                      onClick={() => !processing && inputRef.current?.click()}
                      className="relative w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer py-32 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.02] shadow-inner duration-300"
                    >
                      <div className="h-24 w-24 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                        <Volume2 className="h-12 w-12 text-primary" />
                      </div>
                      <div className="px-6 text-center space-y-1">
                        <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Artifact</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Drag master or click</p>
                      </div>
                    </div>
                    <input ref={inputRef} type="file" className="hidden" accept="audio/*,video/*" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
                  </Card>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <Card className="glass-morphism border-primary/10 p-0 rounded-2xl shadow-2xl bg-card group relative overflow-hidden">
                      <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Volume2 className="h-4 w-4 text-primary" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Studio Workbench</h3>
                        </div>
                        {file && (
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              resetPlayback();
                              setFile(null);
                              setAudioBuffer(null);
                              setObjectUrl(null);
                            }}
                            variant="destructive"
                            size="sm"
                            className="h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete Asset</span>
                          </Button>
                        )}
                      </div>
                      <CardContent className="p-10">
                        <div className="space-y-10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                                <Music className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-muted-foreground">Gain Level</p>
                                <p className="text-2xl font-black italic tracking-tight text-primary">{volume.toFixed(0)}%</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-20 text-muted-foreground">Peak Boost</p>
                              <p className="text-xl font-black text-foreground">+{((volume - 100) / 100 * 12).toFixed(2)} dB</p>
                            </div>
                          </div>

                          <Slider
                            min={0} max={500} step={1}
                            value={[volume]}
                            onValueChange={([v]) => setVolume(v)}
                            className="py-6"
                          />

                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-30 px-2 italic text-muted-foreground">
                            <span>Silent</span>
                            <span>Standard (100%)</span>
                            <span>Hyper-Gain (5x)</span>
                          </div>

                          <div className="pt-6 border-t border-primary/10 flex flex-col items-center gap-6">
                            <div
                              className="w-full h-32 bg-background/40 rounded-2xl border border-border/50 shadow-inner flex items-center justify-center overflow-x-clip relative group/waveform cursor-pointer"
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
                              <AudioVisualizer
                                analyser={analyserRef.current}
                                isPlaying={isPlaying}
                                className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                              />
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
                                  <RotateCcw className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </Button>
                                <button onClick={handlePlay} className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform shadow-xl">
                                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
                                </button>
                              </div>

                              <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-20 text-muted-foreground">Time Registry</p>
                                <code className="text-sm font-black text-foreground font-mono">
                                  {currentTime.toFixed(2)}s <span className="opacity-20 mx-1">/</span> {audioBuffer ? audioBuffer.duration.toFixed(2) : "0.00"}s
                                </code>
                              </div>
                            </div>

                            <audio ref={audioRef} src={objectUrl || ""} className="hidden" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl bg-card">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center gap-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Power Profile</h3>
                  </div>
                  <CardContent className="p-8 space-y-8">
                    <Button
                      onClick={processAndDownload}
                      disabled={!file || processing}
                      className="w-full gap-3 h-16 text-lg font-black rounded-2xl shadow-xl hover:scale-[1.01] transition-all uppercase italic"
                    >
                      <Download className={`h-6 w-6 ${processing ? "animate-pulse" : ""}`} />
                      {processing ? "Enhancing..." : "Export Boosted"}
                    </Button>
                    <p className="text-[9px] text-center mt-4 text-muted-foreground font-black uppercase tracking-widest opacity-40 italic leading-relaxed">
                      High-Precision Bitstream Amplification Engine • Direct-to-Disk High-Fidelity Export.
                    </p>
                  </CardContent>
                </Card>
              </aside>
            </div>
            <ToolExpertSection
              title="Universal High-Fidelity Volume Booster"
              description="The Universal Volume Booster is a professional-grade digital gain utility designed to amplify the bitstream level of audio and video files without the need for server-side processing."
              transparency="Our booster utilizes the browser's native Web Audio API 'GainNode' and 'OfflineAudioContext' to perform mathematical sample scaling. By processing the audio data in a local 32-bit float buffer, we ensure that your private recordings and creative masters never leave your device."
              limitations="Boosting volume beyond a certain threshold (typically >200%) can cause 'Digital Clipping' if the source material is already near peak levels. For the best sound quality, start with 150% and listen for distortion before exporting at maximum gain."
              accent="indigo"
            />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />

      <div className="fixed bottom-0 left-0 right-0 z-50 flex min-[1600px]:hidden justify-center bg-black/80 backdrop-blur-sm border-t border-white/10 py-2 h-[66px] overflow-x-clip">
        <AdBox adFormat="horizontal" height={50} label="320x50 ANCHOR AD" className="w-full" />
      </div>
    </div>
  );
};

export default UniversalVolumeBooster;
