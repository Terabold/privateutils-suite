import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Scissors, Play, Pause, Download, Music, Trash2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";

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
      drawWaveform(buffer);
      toast.success("Audio decoded successfully");
    } catch (error) {
      toast.error("Failed to decode audio. Please use WAV, MP3 or OGG.");
    }
  };

  const drawWaveform = (buffer: AudioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, amp);

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.lineTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }

    ctx.strokeStyle = "#8b5cf6"; // Primary color
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const playPreview = () => {
    if (!audioBuffer || !audioCtxRef.current) return;
    
    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    const source = audioCtxRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtxRef.current.destination);
    
    const startOffset = range[0];
    const durationToPlay = range[1] - range[0];
    
    source.start(0, startOffset, durationToPlay);
    sourceNodeRef.current = source;
    setIsPlaying(true);
    
    source.onended = () => setIsPlaying(false);
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
        for (let j = 0; j < length; j++) {
          trimmedData[j] = channelData[startSample + j];
        }
      }

      // Convert to WAV locally
      const wavBlob = audioBufferToWav(trimmedBuffer);
      const url = URL.createObjectURL(wavBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `trimmed_${fileName.split('.')[0]}.wav`;
      link.click();
      toast.success("Trimmed audio exported as WAV");
    } catch (e) {
      toast.error("Export failed");
    } finally {
      setProcessing(false);
    }
  };

  // Helper to encode AudioBuffer to WAV
  const audioBufferToWav = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels = [];
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for(let i = 0; i < buffer.numberOfChannels; i++)
      channels.push(buffer.getChannelData(i));

    while(pos < length) {
      for(let i = 0; i < numOfChan; i++) {         // interleave channels
        let sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF);     // scale to 16-bit signed
        view.setInt16(pos, sample, true);          // write 16-bit sample
        pos += 2;
      }
      offset++;                                     // next source sample
    }

    return new Blob([bufferArray], { type: "audio/wav" });

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
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
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border border-border/50 hover:bg-primary/5 group/back transition-all">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic">
                  Audio <span className="text-primary italic">Trimmer</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Local High-Fidelity Waveform Clipping</p>
              </div>
            </div>
            
            {audioBuffer && (
               <Button onClick={() => { setAudioBuffer(null); setFileName(""); }} variant="ghost" size="sm" className="gap-2 h-10 px-5 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-xl transition-all">
                  <Trash2 className="h-3.5 w-3.5" /> Clear Audio
               </Button>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
            <div className="space-y-8">
              <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[400px] flex flex-col items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner p-10">
                {audioBuffer ? (
                  <div className="w-full space-y-10">
                    <div className="relative h-48 w-full bg-background/50 rounded-xl border border-border/50 overflow-hidden shadow-inner">
                       <canvas ref={canvasRef} width={1000} height={200} className="w-full h-full opacity-60" />
                       
                       {/* Selection Overlay */}
                       <div 
                         className="absolute top-0 bottom-0 bg-primary/20 border-x-2 border-primary shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                         style={{ 
                            left: `${(range[0] / duration) * 100}%`, 
                            right: `${100 - (range[1] / duration) * 100}%` 
                         }}
                       />
                    </div>

                    <div className="flex items-center justify-center gap-6">
                       <Button 
                         variant="outline" 
                         size="icon" 
                         className="h-20 w-20 rounded-full border-2 border-primary/20 hover:border-primary hover:bg-primary/10 transition-all group"
                         onClick={playPreview}
                       >
                         {isPlaying ? <Pause className="h-8 w-8 text-primary" /> : <Play className="h-8 w-8 text-primary fill-primary" />}
                       </Button>
                    </div>

                    <div className="p-8 bg-muted/20 rounded-xl border border-border/50 space-y-6">
                       <div className="flex justify-between items-center px-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Clipping Range</span>
                          <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-lg">
                             {range[0].toFixed(1)}s - {range[1].toFixed(1)}s
                          </span>
                       </div>
                       <Slider 
                         value={range} 
                         min={0} 
                         max={duration} 
                         step={0.1} 
                         onValueChange={setRange} 
                         className="py-4"
                       />
                       <div className="flex justify-between text-[10px] uppercase font-black opacity-30 px-1">
                          <span>00:00</span>
                          <span>{Math.floor(duration/60).toString().padStart(2,'0')}:{(Math.floor(duration)%60).toString().padStart(2,'0')}</span>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => inputRef.current?.click()}
                    className="cursor-pointer group flex flex-col items-center justify-center p-20 w-full border-2 border-dashed border-primary/20 rounded-2xl bg-background/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner">
                       <Music className="h-12 w-12 text-primary" />
                    </div>
                    <p className="text-2xl font-black uppercase tracking-tighter">Load Audio Source</p>
                    <p className="text-[10px] mt-2 font-black uppercase tracking-widest opacity-40">MP3, WAV, or OGG Supported • 100% Private</p>
                  </div>
                )}
                <input ref={inputRef} type="file" className="hidden" accept="audio/*" onChange={(e) => handleFile(e.target.files?.[0])} />
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted/40 p-10 rounded-xl border border-border/50 studio-gradient">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-primary">
                      <Scissors className="h-4 w-4" /> Lossless Logic
                   </h4>
                   <p className="text-[11px] text-muted-foreground leading-relaxed italic font-medium opacity-80">
                     Our **Local Sandbox** decodes the audio into 32-bit floating point buffers for the highest precision clipping available in a browser.
                   </p>
                </div>
                <div className="bg-primary/5 p-10 rounded-xl border border-primary/10">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-primary font-black">Architecture</h4>
                   <p className="text-[11px] text-muted-foreground leading-relaxed italic font-medium opacity-80">
                     All processing happens via the **Web Audio API**. Your audio never touches a server, making it safe for confidential recordings.
                   </p>
                </div>
              </div>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-primary/5 p-5 border-b border-primary/10">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Export Parameters</h3>
                </div>
                <CardContent className="p-8 space-y-12">
                   <div className="space-y-6">
                      <div className="p-5 bg-background/50 rounded-xl border border-border/50 space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Source</span>
                            <span className="text-[10px] font-black truncate max-w-[150px]">{fileName || "None"}</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Duration</span>
                            <span className="text-[10px] font-black">{duration.toFixed(2)}s</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Format</span>
                            <span className="text-[10px] font-black text-primary">LPCM WAV</span>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                            <SlidersHorizontal className="h-3 w-3" /> Manual Bounds
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase opacity-60">Start (s)</label>
                               <input 
                                 type="number" 
                                 value={range[0]} 
                                 onChange={(e) => setRange([parseFloat(e.target.value) || 0, range[1]])}
                                 className="w-full bg-muted/40 border border-border/50 rounded-lg p-3 text-xs font-black font-mono outline-none focus:border-primary/50 transition-colors"
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase opacity-60">End (s)</label>
                               <input 
                                 type="number" 
                                 value={range[1]} 
                                 onChange={(e) => setRange([range[0], parseFloat(e.target.value) || duration])}
                                 className="w-full bg-muted/40 border border-border/50 rounded-lg p-3 text-xs font-black font-mono outline-none focus:border-primary/50 transition-colors"
                               />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="pt-6">
                      <Button 
                        onClick={downloadTrimmed} 
                        disabled={!audioBuffer || processing} 
                        className="w-full gap-3 h-16 text-lg font-black rounded-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic"
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
