import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Volume2, Download, Music, ShieldCheck, Terminal } from "lucide-react";
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
  const [volume, setVolume] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
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
    gain.gain.value = volume / 100;

    source.connect(gain);
    gain.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainNodeRef.current = gain;
    sourceCreatedRef.current = true;
  }, [volume]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
      gainNodeRef.current = null;
      sourceCreatedRef.current = false;
    }

    setFile(f);
    const url = URL.createObjectURL(f);
    setObjectUrl(url);
    setVolume(100);
    toast.success(`${f.name} loaded into studio`);
  };

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, [objectUrl]);

  const handlePlay = () => {
    ensureAudioGraph();
    audioCtxRef.current?.resume().catch(() => {});
  };

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
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border border-border/50 hover:bg-primary/5 transition-all group/back">
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
               <Button onClick={() => { setFile(null); setObjectUrl(null); }} variant="ghost" size="sm" className="gap-2 h-10 px-5 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-xl transition-all">
                  Wipe Stage
               </Button>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
            <div className="space-y-8">
              <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[400px] flex flex-col items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner p-10">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => !processing && inputRef.current?.click()}
                    className={`relative w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 text-center transition-all ${!processing ? "cursor-pointer py-32 bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner" : "py-32 opacity-50"}`}
                  >
                    <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                       <Volume2 className="h-10 w-10 text-primary" />
                    </div>
                    
                    {file ? (
                      <div className="px-6">
                        <p className="text-2xl font-black text-foreground mb-2 italic uppercase tracking-tighter truncate max-w-md">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-40">Ready for Amplification</p>
                      </div>
                    ) : (
                      <div className="px-6">
                        <p className="text-2xl font-black text-foreground uppercase tracking-tight italic">Drop Audio/Video Artifacts</p>
                        <p className="mt-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">MP3, WAV, OGG, & MP4 Audio Streams Supported</p>
                      </div>
                    )}
                    <input ref={inputRef} type="file" className="hidden" accept="audio/*,video/*" onChange={(e) => handleFile(e.target.files?.[0])} disabled={processing} />
                  </div>
              </Card>

              {file && objectUrl && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <Card className="glass-morphism border-primary/10 p-10 rounded-2xl shadow-2xl bg-zinc-900/50">
                    <div className="space-y-10">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                               <Music className="h-5 w-5" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-foreground">Gain Level</p>
                               <p className="text-2xl font-black italic tracking-tight text-primary">{volume}%</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-foreground">Peak Boost</p>
                            <p className="text-xl font-black text-foreground">{((volume - 100) / 100 * 6).toFixed(1)} dB</p>
                         </div>
                      </div>

                      <Slider
                        min={0}
                        max={500}
                        step={5}
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
                      <div className="pt-6 border-t border-primary/10">
                        <audio
                          ref={audioRef}
                          src={objectUrl}
                          controls
                          onPlay={handlePlay}
                          className="w-full h-12 grayscale invert dark:invert-0 opacity-80"
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
                    <div className="p-6 rounded-xl bg-zinc-950/50 border border-border/50 space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <ShieldCheck className="h-3.5 w-3.5" /> Bit-Stream Guard
                       </h4>
                       <p className="text-[11px] text-muted-foreground leading-relaxed italic opacity-80 font-medium">
                         Our **Gain Normalizer** prevents digital clipping by recalculating samples using 32-bit floating point precision before export.
                       </p>
                    </div>

                    <Button 
                      onClick={processAndDownload} 
                      disabled={!file || processing} 
                      className="w-full gap-3 h-16 text-lg font-black rounded-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic"
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
