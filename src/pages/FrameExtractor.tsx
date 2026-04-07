import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Download, Trash2, CloudUpload, Play, Pause, ChevronLeft, ChevronRight, Maximize2, Undo2, Activity } from "lucide-react";
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
import VideoTimeline from "@/components/VideoTimeline";
import JSZip from "jszip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, Eye, FileArchive, Check, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";

interface CapturedFrame {
  id: string;
  url: string;
  time: number;
}

const FrameExtractor = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [frames, setFrames] = useState<CapturedFrame[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Smooth Playhead Logic
  const [displayTime, setDisplayTime] = useState(0);
  const rAFRef = useRef<number>();

  // Resource Cleanup Engine (Prevent Memory Leaks)
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const framesRef = useRef<CapturedFrame[]>([]);
  useEffect(() => {
    framesRef.current = frames;
  }, [frames]);

  // Handle frame revocation on unmount
  useEffect(() => {
    return () => {
      // Use the latest ref to revoke all blobs that were created
      framesRef.current.forEach(f => URL.revokeObjectURL(f.url));
    };
  }, []); // Only on unmount

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => {
        toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const undoLastFrame = () => {
    if (frames.length === 0) return;
    const last = frames[0];
    setFrames(prev => prev.slice(1));
    URL.revokeObjectURL(last.url);
    toast.info("Last capture removed.");
  };

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFile(f);
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
    setFrames([]);
    setCurrentTime(0);
    setDisplayTime(0);
    toast.success("Ready for Instance Capture");
  };

  usePasteFile(handleFile);

  // requestAnimationFrame loop for smooth timer/playhead
  useEffect(() => {
    const update = () => {
      if (videoRef.current && !videoRef.current.paused) {
        setDisplayTime(videoRef.current.currentTime);
      }
      rAFRef.current = window.requestAnimationFrame(update);
    };
    rAFRef.current = window.requestAnimationFrame(update);
    return () => {
      if (rAFRef.current) window.cancelAnimationFrame(rAFRef.current);
    };
  }, []);

  // Sync when prop-based currentTime changes (seeks)
  useEffect(() => {
    setDisplayTime(currentTime);
  }, [currentTime]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!file) return;
      if (e.key.toLowerCase() === "f") {
        captureFrame();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [file]);

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video || !file) return;

    setProcessing(true);

    const time = video.currentTime;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not get canvas context");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          setProcessing(false);
          toast.error("Capture failure.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const id = Math.random().toString(36).substr(2, 9);
        setFrames(prev => [{ id, url, time }, ...prev]);
        setProcessing(false);
        toast.success("Moment Captured!");
      }, "image/png");
    } catch (e) {
      toast.error("Frame extraction error.");
      setProcessing(false);
    }
  };

  const copyToClipboard = async (frame: CapturedFrame) => {
    try {
      const response = await fetch(frame.url);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      setCopiedId(frame.id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy image.");
    }
  };

  const downloadAllAsZip = async () => {
    if (frames.length === 0) return;
    const zip = new JSZip();
    const folder = zip.folder("captured_frames");

    for (const frame of frames) {
      const response = await fetch(frame.url);
      const blob = await response.blob();
      folder?.file(`frame_${frame.time.toFixed(2)}.png`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `captured_frames_${new Date().getTime()}.zip`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("ZIP Artifact Generated!");
  };

  const removeFrame = (id: string) => {
    setFrames(prev => {
      const f = prev.find(x => x.id === id);
      if (f) URL.revokeObjectURL(f.url);
      return prev.filter(x => x.id !== id);
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-video transition-all duration-300 ">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="grow container mx-auto max-w-[1240px] px-6 py-12">
          <div className="flex flex-col gap-10">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60 shadow-2xl">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                  Frame <span className="text-primary italic">Extractor</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  High-Resolution Instance Recovery Studio • Precision Frame Export
                </p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <div className="flex min-[1600px]:hidden justify-center mb-8 w-full">
              <AdBox adFormat="horizontal" height={250} label="300x250 AD" className="w-full max-w-[400px]" />
            </div>

            <motion.div layout className={`flex flex-col lg:flex-row items-start w-full gap-8 ${!file ? 'justify-center' : 'justify-start'}`}>
              <motion.div
                layout
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`glass-morphism border-primary/20 rounded-2xl bg-black/40 shadow-2xl relative overflow-hidden group/card min-h-[500px] flex flex-col w-full ${!file ? 'max-w-3xl' : 'lg:w-[55%]'}`}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {!file ? (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full flex-1 flex flex-col p-10 min-h-[500px]"
                    >
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                        onClick={() => inputRef.current?.click()}
                        className="relative w-full h-full flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer bg-background/40 hover:border-primary/40 hover:bg-primary/5 shadow-inner"
                      >
                        <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                          <CloudUpload className="h-10 w-10 text-primary" />
                        </div>
                        <div className="px-6 space-y-1">
                          <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Artifact</p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40 italic">Drag master or click</p>
                        </div>
                        <label htmlFor="frame-upload-input" className="sr-only">Upload Video for Extraction</label>
                        <input id="frame-upload-input" name="frame-upload-input" ref={inputRef} type="file" className="hidden" accept="video/*" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
                      </div>
                    </motion.div>
                  ) : (<motion.div
                    key="editor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full"
                  >
                    {!isFullscreen && (
                      <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-primary" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Video Preview</h3>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFile(null);
                            setVideoUrl(null);
                            setFrames([]);
                            setCurrentTime(0);
                          }}
                          variant="destructive"
                          size="sm"
                          className="h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                          Delete File
                        </Button>
                      </div>
                    )}
                    <CardContent className={`flex flex-col items-center w-full ${isFullscreen ? 'p-0' : 'p-6 space-y-6'}`}>
                      <div ref={containerRef} className={cn(
                        "w-full rounded-2xl overflow-x-clip shadow-2xl relative border-2 border-primary/10 bg-black aspect-video flex items-center justify-center studio-gradient focus-within:ring-2 focus-within:ring-primary/20 group/video",
                        isFullscreen && "rounded-none border-0"
                      )}>
                        <video
                          ref={videoRef}
                          src={videoUrl!}
                          className="w-full h-full object-contain bg-black cursor-pointer shadow-2xl relative z-10"
                          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                          onClick={() => {
                            if (videoRef.current?.paused) {
                              videoRef.current.play();
                              setIsPlaying(true);
                            } else {
                              videoRef.current?.pause();
                              setIsPlaying(false);
                            }
                          }}
                          crossOrigin="anonymous"
                        />

                        {/* Hover Play/Pause Indicator */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                          <div className="h-20 w-20 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-2xl opacity-0 scale-50 group-hover/video:opacity-100 group-hover/video:scale-100 transition-all duration-200 ease-out">
                            {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10 fill-current ml-2" />}
                          </div>
                        </div>

                      </div>

                      {!isFullscreen && (
                        <div className="w-full glass-morphism border-primary/10 bg-primary/5 p-4 md:p-6 rounded-2xl space-y-4 shadow-2xl studio-gradient border-border/20">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex bg-background/40 p-1.5 rounded-xl border border-white/5 backdrop-blur-md shrink-0 shadow-inner">
                                <Button variant="ghost" size="icon" onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 0.0333) }} className="h-10 w-10 text-muted-foreground hover:text-primary transition-colors">
                                  <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                  onClick={() => {
                                    if (videoRef.current?.paused) {
                                      videoRef.current.play();
                                      setIsPlaying(true);
                                    } else {
                                      videoRef.current?.pause();
                                      setIsPlaying(false);
                                    }
                                  }}
                                  className="h-10 w-14 bg-primary text-primary-foreground rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all mx-1.5"
                                >
                                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 0.0333) }} className="h-10 w-10 text-muted-foreground hover:text-primary transition-colors">
                                  <ChevronRight className="h-5 w-5" />
                                </Button>
                              </div>

                              <Button
                                onClick={captureFrame}
                                disabled={processing}
                                className="flex-1 max-w-[200px] h-11 rounded-xl bg-secondary text-secondary-foreground font-bold italic uppercase tracking-tighter shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all gap-3 border-b-2 active:border-b-0 active:translate-y-0.5 relative overflow-x-clip group/btn px-4"
                              >
                                <Camera className={`h-4 w-4 relative z-10 ${processing ? "animate-spin" : ""}`} />
                                <span className="relative z-10">Capture Instance</span>
                                <span className="absolute right-3 opacity-40 text-[8px] font-black border border-white/20 px-1.5 py-0.5 rounded-md group-hover/btn:opacity-100 transition-opacity">F</span>
                              </Button>

                              <div className="hidden sm:flex items-center gap-2 shrink-0 bg-background/40 px-3 py-2 rounded-xl border border-white/5 shadow-inner">
                                <span className="text-lg font-bold italic tracking-tighter text-primary font-mono">{displayTime.toFixed(3)}s</span>
                              </div>
                            </div>

                            <div className="w-full">
                              <VideoTimeline
                                videoRef={videoRef}
                                src={videoUrl}
                                currentTime={currentTime}
                                duration={duration}
                                onSeek={(t) => {
                                  if (videoRef.current) videoRef.current.currentTime = t;
                                  setCurrentTime(t);
                                }}
                                showRange={false}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <AnimatePresence mode="popLayout">
                {file && (
                  <motion.div
                    layout
                    key="sidebar"
                    initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full lg:w-[45%] space-y-6"
                  >
                    <Card className="w-full rounded-2xl overflow-x-clip shadow-2xl relative border border-white/5 bg-card max-h-[38vh] aspect-video flex items-center justify-center group/latest">
                      {frames.length > 0 ? (
                        <div className="relative w-full h-full animate-in fade-in zoom-in-95 duration-500">
                          <img
                            src={frames[0].url}
                            className="w-full h-full object-contain"
                            alt="Latest Capture"
                          />
                          <div className="absolute top-4 left-4 px-3 py-1 bg-background/60 rounded-full border border-white/10 backdrop-blur-md">
                            <span className="text-[10px] font-bold text-primary italic tracking-widest uppercase">Latest Capture • {frames[0].time.toFixed(3)}s</span>
                          </div>

                          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover/latest:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                            <div className="flex gap-4">
                              <Button
                                onClick={() => copyToClipboard(frames[0])}
                                className="h-12 px-6 rounded-xl bg-white text-black hover:bg-white/90 font-bold gap-2"
                              >
                                {copiedId === frames[0].id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                Copy image
                              </Button>
                              <Button
                                onClick={() => {
                                  const a = document.createElement("a");
                                  a.href = frames[0].url;
                                  a.download = `frame_capture_${frames[0].time.toFixed(2)}.png`;
                                  a.click();
                                }}
                                variant="outline"
                                className="h-12 px-6 rounded-xl border-white/20 bg-background/40 text-foreground hover:bg-card font-bold gap-2 transition-all shadow-xl"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-20">
                          <Camera className="h-16 w-16 stroke-[1]" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No instances recovered yet</p>
                        </div>
                      )}
                    </Card>

                    {frames.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-right-4 duration-500">
                        <Button
                          onClick={() => copyToClipboard(frames[0])}
                          variant="outline"
                          className="h-14 rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold uppercase italic tracking-tighter gap-3"
                        >
                          {copiedId === frames[0].id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          Capture to Clipboard
                        </Button>
                        <Button
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = frames[0].url;
                            a.download = `frame_capture_${frames[0].time.toFixed(2)}.png`;
                            a.click();
                          }}
                          className="h-14 rounded-2xl bg-primary text-primary-foreground font-bold uppercase italic tracking-tighter gap-3"
                        >
                          <Download className="h-4 w-4" />
                          Export Artifact
                        </Button>
                      </div>
                    )}

                    <div
                      onClick={() => setShowGallery(true)}
                      className="bg-background/40 rounded-2xl border border-border/50 p-4 min-h-[160px] relative overflow-x-clip group studio-gradient shadow-2xl cursor-pointer hover:border-primary/40 transition-all flex flex-col"
                    >
                      <header className="mb-3 flex items-center justify-between px-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary italic">Capture History</h4>
                          {frames.length > 0 && (
                            <Button
                              onClick={(e) => { e.stopPropagation(); undoLastFrame(); }}
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                              title="Undo Last Capture"
                            >
                              <Undo2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <Eye className="h-3 w-3 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                      </header>

                      {frames.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 opacity-20">
                          <p className="text-[9px] font-bold uppercase tracking-widest italic">Snapshots will build a history here</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2 flex-1 auto-rows-fr">
                          {frames.slice(0, 8).map((frame) => (
                            <div key={frame.id} className="relative rounded-2xl overflow-x-clip border border-white/5 opacity-80 hover:opacity-100 transition-opacity shadow-sm bg-background/40">
                              <img src={frame.url} className="w-full h-full object-cover aspect-video" alt="History Thumb" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* GALLERY MODAL */}
            <Dialog modal={false} open={showGallery} onOpenChange={setShowGallery}>
              <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0 glass-morphism border-primary/20 bg-card transition-all overflow-x-clip studio-gradient shadow-[0_0_100px_rgba(0,0,0,0.8)] theme-video outline-none rounded-2xl z-[200] top-[5vh] translate-y-0">
                <DialogHeader className="p-10 border-b border-white/5 shrink-0 bg-background/40 backdrop-blur-3xl rounded-t-[40px]">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-1">
                      <DialogTitle className="text-5xl font-bold italic tracking-tighter uppercase text-shadow-glow">Capture <span className="text-primary italic">Registry</span></DialogTitle>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60 italic leading-none">Recovered Temporal Sandbox • {frames.length} Active Artifacts</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        onClick={downloadAllAsZip}
                        disabled={frames.length === 0}
                        className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-bold italic uppercase tracking-tighter gap-4 shadow-2xl shadow-primary/20 hover:scale-105 transition-all border-b-4 border-black/20"
                      >
                        <FileArchive className="h-6 w-6" />
                        Download ZIP
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setShowGallery(false)}
                        className="h-14 px-6 text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-white/10 transition-all rounded-xl"
                      >
                        Back to Studio
                      </Button>
                    </div>
                  </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-background/20">
                  {frames.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20">
                      <Camera className="h-32 w-32 stroke-[1] animate-pulse" />
                      <div className="space-y-2">
                        <p className="text-2xl font-bold uppercase tracking-[0.4em] italic">Registry Null</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 italic">Capture an instance to build history</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {frames.map((frame) => (
                        <Card key={frame.id} className="relative group/card overflow-x-clip bg-card border border-white/5 hover:border-primary/50 transition-all shadow-2xl rounded-2xl flex flex-col h-full hover:scale-[1.02] duration-300">
                          <div className="aspect-video relative overflow-x-clip shrink-0">
                            <img src={frame.url} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" alt={`Capture at ${frame.time}s`} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover/card:opacity-100 transition-opacity" />

                            <div className="absolute top-4 left-4 px-3 py-1 bg-background/60 rounded-2xl border border-white/10 backdrop-blur-md">
                              <span className="text-[10px] font-bold text-primary italic tracking-widest">{frame.time.toFixed(3)}s</span>
                            </div>
                          </div>

                          <div className="p-4 flex gap-2 bg-background/40 backdrop-blur-sm border-t border-white/5">
                            <Button
                              onClick={() => copyToClipboard(frame)}
                              variant="ghost"
                              className="flex-1 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-foreground font-bold text-[9px] uppercase tracking-widest gap-2"
                            >
                              {copiedId === frame.id ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3 text-primary" />}
                              Copy
                            </Button>
                            <Button
                              onClick={() => {
                                const a = document.createElement("a");
                                a.href = frame.url;
                                a.download = `capture_${frame.time.toFixed(2)}.png`;
                                a.click();
                              }}
                              className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 hover:bg-card transition-all group/dl shadow-inner border border-white/5"
                            >
                              <Download className="h-4 w-4 group-hover/dl:scale-110 transition-transform" />
                            </Button>
                            <Button
                              onClick={() => removeFrame(frame.id)}
                              className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 hover:bg-destructive hover:text-destructive-foreground transition-all group/del shadow-inner border border-white/5"
                            >
                              <Trash2 className="h-4 w-4 group-hover/del:scale-110 transition-transform" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Global Frame Extractor"
              description="The Frame Extractor is a high-performance temporal capture engine designed to recover high-resolution PNG artifacts from any video stream with millisecond precision."
              transparency="Using your device's hardware-accelerated canvas API, we render and capture video frames directly in your local browser sandbox. This ensures that your private video masters—whether they're family memories or unreleased professional footage—never touch a remote server."
              limitations="Capturing hundreds of high-resolution 4K frames can consume significant system memory (RAM). While the tool includes a Resource Cleanup Engine, we recommend closing other intensive browser tabs during large extraction sessions to prevent 'Out of Memory' stutters."
              accent="blue"
            />

            <footer className="pt-20 border-t border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="glass-morphism border-primary/10 p-6 rounded-2xl bg-primary/5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-4 italic">Precision Engine</p>
                  <p className="text-11px] leading-relaxed opacity-60">Utilize Arrow Keys (left/right) for precision frame-stepping and <span className="text-primary font-bold">F</span> for instant capture. Captured moments are exported as lossless 8-bit PNG artifacts.</p>
                </Card>
                <div className="md:col-span-2">

                </div>
              </div>
            </footer>
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />

      {/* Mobile Sticky Anchor Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex min-[1600px]:hidden justify-center bg-black/80 backdrop-blur-sm border-t border-white/10 py-2 h-[66px] overflow-x-clip">
        <AdBox adFormat="horizontal" height={50} label="320x50 ANCHOR AD" className="w-full" />
      </div>
    </div>
  );
};

export default FrameExtractor;
