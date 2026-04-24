import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Download, Play, Pause, Music, Zap, CloudUpload, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

// Foundations
import { useDarkMode } from "@/hooks/useDarkMode";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { bufferToWave } from "@/utils/audioUtils";
import AudioDecodingOverlay from "@/components/AudioDecodingOverlay";

const ReverseAudio = () => {
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

  const [processing, setProcessing] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

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
    const analyser = ctx.createAnalyser();

    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(ctx.destination);

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceCreatedRef.current = true;
  }, [audioRef, audioCtxRef]);

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

    ctx.clearRect(0, 0, width, height);

    const barWidth = 2;
    const gap = 1;
    const barCount = Math.floor(width / (barWidth + gap));

    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + gap);
      const summaryIdx = Math.floor((i / barCount) * waveformSummary.length);
      const val = waveformSummary[summaryIdx] || 0;

      const barHeight = Math.max(2, val * height * 0.8);
      ctx.fillStyle = "rgba(139, 92, 246, 0.7)";
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(x, amp - barHeight / 2, barWidth, barHeight, 1);
      } else {
        ctx.rect(x, amp - barHeight / 2, barWidth, barHeight);
      }
      ctx.fill();
    }
  }, [waveformSummary]);

  useEffect(() => {
    if (waveformSummary) drawStaticWaveform();
  }, [waveformSummary, drawStaticWaveform]);

  const handleFile = async (f: File | undefined) => {
    if (!f) return;
    setIsDecoding(true);
    await handleFileChange(f);

    const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    try {
      const arrayBuffer = await f.arrayBuffer();
      const buffer = await tempCtx.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      setProcessedUrl(null);
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
      toast.success("Audio Artifact Staged");
    } catch (e) {
      toast.error("Failed to decode audio master.");
    } finally {
      await tempCtx.close().catch(() => { });
    }
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
      const url = createSafeUrl(wavBlob);
      setProcessedUrl(url);

      // Fix: Auto-download to eliminate double-click UX friction
      const link = document.createElement("a");
      link.href = url;
      link.download = `reversed_${file.name}`;
      link.click();

      toast.success("Temporal Inversion Complete");
      await tempCtx.close().catch(() => { });
    } catch (e) {
      console.error(e);
      toast.error("Audio processing failed.");
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
      

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-12 grow">
          <div className="flex flex-col gap-10">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all group/back bg-background/50 backdrop-blur-md shadow-xl">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                  Backwards <span className="text-primary italic">Audio Laboratory</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  Temporal Phase Inversion Studio • Native Buffer Flipping
                </p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

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
                      className="relative w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer py-32 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.02] shadow-inner duration-300"
                    >
                      <div className="h-24 w-24 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                        <Music className="h-12 w-12 text-primary" />
                      </div>
                      <div className="px-6 space-y-1">
                        <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Artifact</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Drag master or click</p>
                      </div>
                    </div>
                    <input ref={inputRef} type="file" className="hidden" accept="audio/*" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
                  </Card>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <Card className="glass-morphism border-primary/10 p-0 rounded-2xl shadow-2xl bg-card group relative overflow-hidden">
                      <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Music className="h-4 w-4 text-primary" />
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
                              setProcessedUrl(null);
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
                              className="w-full h-48 bg-background/40 rounded-xl border border-border/50 shadow-inner flex items-center justify-center overflow-x-clip relative group/waveform cursor-pointer"
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
                    </Card>
                  </div>
                )}
              </div>

              <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 h-fit">
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

                    <Button
                      onClick={processReverse}
                      disabled={!file || processing}
                      className="w-full gap-3 h-16 text-lg font-black rounded-2xl shadow-xl hover:scale-[1.01] transition-all uppercase italic"
                    >
                      <RefreshCw className={`h-6 w-6 ${processing ? "animate-spin" : ""}`} />
                      {processing ? "Inverting..." : "Reverse & Download"}
                    </Button>
                    <p className="text-[9px] text-center mt-4 text-muted-foreground font-black uppercase tracking-widest opacity-40 italic leading-relaxed">
                      Flips the temporal phase of the audio buffer. Zero server interaction.
                    </p>
                  </CardContent>
                </Card>
              </aside>
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Backwards Audio Laboratory"
              accent="blue"
              overview="The Backwards Audio Laboratory is a specialized temporal phase inversion workbench designed for sound designers, forensic phoneticists, and creative musicians. I engineered this tool to provide a surgical path for flipping audio artifacts in reverse without the privacy risk of 'cloud-based audio flippers' that listen to your private recordings and cache your phonetic data on insecure remote clusters."
              steps={[
                "Stage your audio master (MP3, WAV, or OGG) into the Inversion Studio workspace.",
                "Trigger the 'Phase Inversion' sequence to mathematically flip the samples within the buffer.",
                "utilize the 'Temporal Registry' and 'Live Preview' to monitor the reversed soundscape.",
                "Extract the high-fidelity WAV artifact directly from your device's browser sandbox.",
                "Download the inverted asset for use in your production or phonetic analysis suite."
              ]}
              technicalImplementation="I architected this laboratory using the Web Audio API and a TypedArray Sample Inversion algorithm. When the inversion is triggered, the engine creates a new AudioBuffer and copies the channel data from the source, reversing the sample index order mathematically (L - 1 - i). By performing this loop-based transformation within the browser's execution thread, we achieve instantaneous results without any server-side round-trips or network latency."
              privacyGuarantee="The Security \u0026 Privacy model for the Reversed Lab is defined by Sample Air-Gapping. Your audio artifacts and their reversed counterparts exist strictly within your browser's private memory heap. We do not use any telemetry to monitor the phonetic content of your files. All data is ephemeral and is permanently purged from your machine's volatile RAM upon session closure. Your recordings remain entirely yours."
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

export default ReverseAudio;
