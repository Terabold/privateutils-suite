import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, Download, RotateCcw, CloudUpload, Scissors, RefreshCw, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

// Foundations
import { useDarkMode } from "@/hooks/useDarkMode";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { bufferToWave } from "@/utils/audioUtils";
import { getFFmpeg } from "@/lib/ffmpegSingleton";
import { fetchFile } from "@ffmpeg/util";
import AudioDecodingOverlay from "@/components/AudioDecodingOverlay";

const AudioTrimmer = () => {
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

  const [range, setRange] = useState([0, 100]); // Start/End in seconds
  const [duration, setDuration] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformSummary, setWaveformSummary] = useState<Float32Array | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const playheadAnimationRef = useRef<number | null>(null);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
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

    ctx.beginPath();
    ctx.moveTo(0, amp);
    ctx.lineTo(width, amp);
    ctx.strokeStyle = "rgba(139, 92, 246, 0.1)";
    ctx.stroke();

    const barWidth = 2;
    const gap = 1;
    const barCount = Math.floor(width / (barWidth + gap));

    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + gap);
      // Map bar index to summary data index
      const summaryIdx = Math.floor((i / barCount) * waveformSummary.length);
      const val = waveformSummary[summaryIdx] || 0;

      const barHeight = Math.max(2, val * height * 0.8);
      const gradient = ctx.createLinearGradient(0, amp - barHeight / 2, 0, amp + barHeight / 2);
      gradient.addColorStop(0, "#7c3aed");
      gradient.addColorStop(0.5, "#a78bfa");
      gradient.addColorStop(1, "#7c3aed");

      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.9;
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(x, amp - barHeight / 2, barWidth, barHeight, 1);
      } else {
        ctx.rect(x, amp - barHeight / 2, barWidth, barHeight);
      }
      ctx.fill();
    }
  }, [waveformSummary]);

  useEffect(() => {
    if (waveformSummary) drawWaveform();
  }, [waveformSummary, drawWaveform]);

  const handleFile = async (f: File | undefined) => {
    if (!f) return;
    setIsDecoding(true);
    await handleFileChange(f);

    const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    try {
      const arrayBuffer = await f.arrayBuffer();
      const buffer = await tempCtx.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      setDuration(buffer.duration);

      // Fix: Default to full duration for large sessions
      setRange([0, buffer.duration]);

      // Fix: Pre-calculate waveform summary via Heuristic Sub-sampling (95% faster)
      const data = buffer.getChannelData(0);
      const summaryPoints = 2000;
      const step = Math.ceil(data.length / summaryPoints);
      const skip = Math.max(1, Math.floor(step / 500)); // Heuristic: Sample 500 peaks per bar max
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
      setCurrentTime(0);
      toast.success("Audio Artifact Staged");
    } catch (e) {
      toast.error("Failed to decode audio master.");
    } finally {
      await tempCtx.close().catch(() => { });
      setIsDecoding(false);
    }
  };

  usePasteFile(handleFile);

  const startPlayheadLoop = () => {
    if (playheadAnimationRef.current) cancelAnimationFrame(playheadAnimationRef.current);
    const update = () => {
      if (audioRef.current && isPlayingRef.current) {
        const t = audioRef.current.currentTime;
        if (t >= range[1]) {
          audioRef.current.pause();
          audioRef.current.currentTime = range[0];
          setCurrentTime(range[0]);
          setIsPlaying(false);
          isPlayingRef.current = false;
          return;
        }
        setCurrentTime(t);
        playheadAnimationRef.current = requestAnimationFrame(update);
      }
    };
    playheadAnimationRef.current = requestAnimationFrame(update);
  };

  const handlePlay = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      if (audioRef.current.currentTime < range[0] || audioRef.current.currentTime >= range[1]) {
        audioRef.current.currentTime = range[0];
      }
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

  const resetPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = range[0];
      setCurrentTime(range[0]);
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  };

  const downloadTrimmed = async (format: "mp3" | "wav" = "mp3") => {
    if (!audioBuffer || !file) return;
    setProcessing(true);
    toast.info("Slicing Samples...");

    let url = "";
    try {
      const startSample = Math.floor(range[0] * audioBuffer.sampleRate);
      const endSample = Math.floor(range[1] * audioBuffer.sampleRate);
      const length = endSample - startSample;

      const trimmedBuffer = new AudioContext().createBuffer(
        audioBuffer.numberOfChannels,
        length,
        audioBuffer.sampleRate
      );

      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        const trimmedData = trimmedBuffer.getChannelData(i);
        trimmedData.set(channelData.subarray(startSample, endSample));
      }

      if (format === "mp3") {
        toast.info("Compressing with FFmpeg Engine...");
        const ffmpeg = await getFFmpeg();
        if (!ffmpeg) throw new Error("FFmpeg not available");

        const wavBlob = bufferToWave(trimmedBuffer, trimmedBuffer.length);
        await ffmpeg.writeFile('input.wav', new Uint8Array(await wavBlob.arrayBuffer()));
        await ffmpeg.exec(['-i', 'input.wav', '-c:a', 'libmp3lame', '-b:a', '192k', 'output.mp3']);
        const data = await ffmpeg.readFile('output.mp3');
        const mp3Blob = new Blob([data as any], { type: 'audio/mpeg' });
        url = createSafeUrl(mp3Blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `trimmed_${file.name.split('.')[0]}.mp3`;
        link.click();
        toast.success("Compressed MP3 Exported");
      } else {
        const wavBlob = bufferToWave(trimmedBuffer, trimmedBuffer.length);
        url = createSafeUrl(wavBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `trimmed_${file.name.split('.')[0] || 'audio'}.wav`;
        link.click();
        toast.success("High-Fidelity WAV Exported");
      }
    } catch (e) {
      console.error(e);
      toast.error("Export failed. Memory limit reached?");
    } finally {
      setProcessing(false);
      // Fix Bug #9: Delay revocation to prevent race condition on Safari/Mobile
      if (url) {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 ">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-6 grow">
          <div className="flex flex-col gap-6">
            <header className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60 shadow-2xl">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white leading-tight">
                  Precision <span className="text-primary italic">Audio Trimmer</span>
                </h1>
                <p className="text-muted-foreground mt-1 font-black uppercase tracking-[0.2em] opacity-40 text-[9px]">
                  High-Precision Local Audio Partitioning • Lossless Wave Slicing
                </p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="lg:col-span-8 space-y-8">
                {isDecoding ? (
                  <AudioDecodingOverlay fileName={file?.name} />
                ) : !file ? (
                  <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[320px] flex flex-col items-center justify-center relative bg-card rounded-2xl shadow-inner p-6 select-none">
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                      onClick={() => !processing && inputRef.current?.click()}
                      className="relative w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer py-20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.02] shadow-inner duration-300"
                    >
                      <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                        <Scissors className="h-12 w-12 text-primary" />
                      </div>
                      <div className="px-6 space-y-1">
                        <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Artifact</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Drag master or click</p>
                        <KbdShortcut />
                      </div>
                    </div>
                    <input ref={inputRef} type="file" className="hidden" accept="audio/*" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
                  </Card>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <Card className="glass-morphism border-primary/10 p-0 rounded-2xl shadow-2xl bg-card group relative overflow-hidden">
                      <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Scissors className="h-3.5 w-3.5 text-primary" />
                          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Studio Workbench</h3>
                        </div>
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
                      </div>
                      <CardContent className="p-6 space-y-6">
                        <div
                          className="relative h-48 w-full bg-background/50 rounded-2xl border border-border/50 shadow-inner group/waveform cursor-pointer select-none overflow-hidden"
                          onMouseDown={(e) => {
                            if (!audioBuffer) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = (e.clientX - rect.left) / rect.width;
                            const clickTime = x * duration;

                            const leftEdgePos = range[0] / duration;
                            const rightEdgePos = range[1] / duration;
                            const edgeThreshold = 0.02;

                            if (Math.abs(x - leftEdgePos) < edgeThreshold) {
                              const onMove = (ev: MouseEvent) => {
                                const mx = Math.max(0, Math.min((ev.clientX - rect.left) / rect.width, 1));
                                const t = mx * duration;
                                setRange(prev => [Math.min(t, prev[1] - 0.05), prev[1]]);
                              };
                              const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                              window.addEventListener('mousemove', onMove);
                              window.addEventListener('mouseup', onUp);
                            } else if (Math.abs(x - rightEdgePos) < edgeThreshold) {
                              const onMove = (ev: MouseEvent) => {
                                const mx = Math.max(0, Math.min((ev.clientX - rect.left) / rect.width, 1));
                                const t = mx * duration;
                                setRange(prev => [prev[0], Math.max(t, prev[0] + 0.05)]);
                              };
                              const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                              window.addEventListener('mousemove', onMove);
                              window.addEventListener('mouseup', onUp);
                            } else {
                              const newTime = Math.max(0, Math.min(clickTime, duration));
                              if (audioRef.current) audioRef.current.currentTime = newTime;
                              setCurrentTime(newTime);
                              const onMove = (ev: MouseEvent) => {
                                const mx = Math.max(0, Math.min((ev.clientX - rect.left) / rect.width, 1));
                                const t = mx * duration;
                                if (audioRef.current) audioRef.current.currentTime = t;
                                setCurrentTime(t);
                              };
                              const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                              window.addEventListener('mousemove', onMove);
                              window.addEventListener('mouseup', onUp);
                            }
                          }}
                        >
                          <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />

                          <div className="absolute top-0 bottom-0 left-0 bg-black/60 pointer-events-none" style={{ width: `${(range[0] / duration) * 100}%` }} />
                          <div className="absolute top-0 bottom-0 right-0 bg-black/60 pointer-events-none" style={{ width: `${((duration - range[1]) / duration) * 100}%` }} />

                          <div className="absolute top-0 bottom-0 bg-emerald-500/10 pointer-events-none border-x border-emerald-500/30"
                            style={{ left: `${(range[0] / duration) * 100}%`, width: `${((range[1] - range[0]) / duration) * 100}%` }} />

                          <div className="absolute top-0 bottom-0 w-[1px] bg-emerald-500 pointer-events-none z-30" style={{ left: `${(range[0] / duration) * 100}%` }}>
                            <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl border border-white/30">
                              <div className="w-[1px] h-4 bg-white/60" />
                            </div>
                          </div>

                          <div className="absolute top-0 bottom-0 w-[1px] bg-emerald-500 pointer-events-none z-30" style={{ left: `${(range[1] / duration) * 100}%` }}>
                            <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl border border-white/30">
                              <div className="w-[1px] h-4 bg-white/60" />
                            </div>
                          </div>

                          <div className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-50 pointer-events-none"
                            style={{ left: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Start</label>
                              <input
                                type="number" step="0.01" value={range[0].toFixed(2)}
                                onChange={(e) => {
                                  const t = parseFloat(e.target.value) || 0;
                                  setRange([Math.min(t, range[1] - 0.05), range[1]]);
                                }}
                                className="w-24 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 text-sm font-black font-mono outline-none focus:border-emerald-500 transition-colors text-emerald-500"
                              />
                            </div>
                            <span className="text-muted-foreground/30 text-xs">—</span>
                            <div className="flex items-center gap-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">End</label>
                              <input
                                type="number" step="0.01" value={range[1].toFixed(2)}
                                onChange={(e) => {
                                  const t = parseFloat(e.target.value) || duration;
                                  setRange([range[0], Math.max(t, range[0] + 0.05)]);
                                }}
                                className="w-24 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 text-sm font-black font-mono outline-none focus:border-emerald-500 transition-colors text-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border border-primary/20 hover:bg-primary/5 transition-all group" onClick={resetPlayback}>
                              <RotateCcw className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                            </Button>
                            <button onClick={handlePlay} className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform shadow-xl">
                              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
                            </button>
                          </div>
                        </div>
                        <audio ref={audioRef} src={objectUrl || ""} className="hidden" />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl bg-card">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center gap-3">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Export Parameters</h3>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="p-4 bg-background/50 rounded-2xl border border-border/50 space-y-3 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Duration Scan</span>
                        <span className="text-[11px] font-black font-mono text-foreground">{duration.toFixed(2)}s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Trim Length</span>
                        <span className="text-[11px] font-black font-mono text-primary">{(range[1] - range[0]).toFixed(2)}s</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={() => downloadTrimmed("mp3")}
                        disabled={!audioBuffer || processing}
                        className="w-full gap-3 h-14 text-base font-black rounded-2xl shadow-xl hover:scale-[1.01] transition-all uppercase italic"
                      >
                        <Download className="h-6 w-6" />
                        {processing ? "Slicing..." : "Export MP3 (Compact)"}
                      </Button>
                      <Button
                        onClick={() => downloadTrimmed("wav")}
                        variant="outline"
                        disabled={!audioBuffer || processing}
                        className="w-full gap-3 h-12 text-xs font-black rounded-xl hover:scale-[1.01] transition-all uppercase italic opacity-60 hover:opacity-100"
                      >
                        Export Lossless WAV
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
            <ToolExpertSection
              title="Precision Audio Trimmer"
              description="The Audio Trimmer is a high-precision, client-side utility engineered for safe and fast audio partitioning. Unlike traditional web-based converters that require you to wait while your media uploads to a remote cloud server—compromising both speed and privacy—this tool parses and slices your audio files entirely within the secure sandbox of your local browser."
              transparency="By leveraging the Web Audio API, the trimmer decodes your MP3, WAV, or OGG files into a raw 32-bit float array. Your private data is never transmitted over the internet."
              limitations="However, processing exceptionally large audio files (such as multi-hour recordings) is not ideal for client-side tools. Browsers enforce strict RAM limits. We recommend using desktop tools for files larger than 100MB."
              accent="blue"
            />
          </div>
        </main>
        <SponsorSidebars position="right" />
      </div>
      <Footer />
    </div>
  );
};

export default AudioTrimmer;
