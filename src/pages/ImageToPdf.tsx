import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  FileStack,
  Trash2,
  Plus,
  Repeat,
  ArrowRightCircle,
  Download,
  LayoutGrid,
  FileUp,
  RefreshCw,
  Home,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
// Dynamic import for jspdf to reduce initial bundle size
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  return jsPDF;
};
import { motion, AnimatePresence, Reorder } from "framer-motion";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: string;
}

const ImageToPdf = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFaulted, setIsFaulted] = useState(false);
  const [livePreview, setLivePreview] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState("converted_images");
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "fit">("a4");
  const [showGallery, setShowGallery] = useState(false);

  const toggleDark = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setDarkMode(isDark);
  };

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(2, 11),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB"
    }));

    setImages(prev => [...prev, ...newImages]);
    toast.success(`${newImages.length} artifacts staged`);

    // Fix: Clear input value so the same file can be selected again
    e.target.value = '';
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const handleSwap = () => setImages(prev => [...prev].reverse());

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newImages.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      setImages(newImages);
    }
  };

  // Live Preview Engine
  useEffect(() => {
    if (!livePreview || images.length === 0) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const jsPDF = await loadJsPDF();
        const pdf = new jsPDF({
          orientation: "p",
          unit: "mm",
          format: pageSize === "fit" ? "a4" : pageSize,
          compress: true
        });

        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const imgData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(img.file);
          });

          if (i > 0) pdf.addPage();

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const imgProps = pdf.getImageProperties(imgData);
          const ratio = imgProps.width / imgProps.height;

          let width = pageWidth;
          let height = pageWidth / ratio;

          if (height > pageHeight) {
            height = pageHeight;
            width = pageHeight * ratio;
          }

          const x = (pageWidth - width) / 2;
          const y = (pageHeight - height) / 2;
          pdf.addImage(imgData, "JPEG", x, y, width, height, undefined, 'MEDIUM');
        }

        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);

        setPreviewUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch (err) {
        console.error("Discovery Pass Fault:", err);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [images, pageSize, livePreview]);

  const generateAndDownload = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    const pdfToast = toast.loading("Synthesizing final high-fidelity artifact...");

    try {
      const jsPDF = await loadJsPDF();
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: pageSize === "fit" ? "a4" : pageSize,
        compress: true
      });

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(img.file);
        });

        if (i > 0) pdf.addPage();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const ratio = imgProps.width / imgProps.height;

        let width = pageWidth;
        let height = pageWidth / ratio;

        if (height > pageHeight) {
          height = pageHeight;
          width = pageHeight * ratio;
        }

        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;
        pdf.addImage(imgData, "JPEG", x, y, width, height, undefined, 'MEDIUM');
      }

      pdf.save(`${pdfName || "converted"}.pdf`);
      toast.dismiss(pdfToast);
      toast.success("PDF exported successfully");
    } catch (err) {
      console.error(err);
      toast.dismiss(pdfToast);
      setIsFaulted(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const reinitializeEngine = () => {
    setIsFaulted(false);
    setImages([]);
    setPreviewUrl(null);
    toast.success("Engine Resynthesized");
  };

  if (isFaulted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="h-24 w-24 bg-destructive/10 rounded-2xl flex items-center justify-center mb-10 shadow-2xl border-2 border-destructive/20 animate-pulse">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <div className="max-w-xl space-y-6">
          <h2 className="text-5xl font-black text-foreground uppercase tracking-tighter italic text-shadow-glow">
            Pipeline <span className="text-destructive italic">Fault</span>
          </h2>
          <p className="text-sm font-black text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60">
            The Image to PDF architect encountered a critical runtime error. This usually occurs during heavy client-side processing or browser context loss.
          </p>
          <div className="pt-10 flex flex-wrap justify-center gap-6">
            <Button
              onClick={reinitializeEngine}
              className="h-16 px-10 gap-3 text-sm font-black rounded-2xl uppercase italic shadow-2xl shadow-destructive/20 bg-destructive hover:bg-destructive/90 transition-all active:scale-95 text-white"
            >
              <RefreshCw className="h-5 w-5" /> Re-Initialize Engine
            </Button>
            <Link to="/">
              <Button
                variant="outline"
                className="h-16 px-10 gap-3 text-sm font-black rounded-2xl uppercase italic border-border hover:bg-white/5 transition-all active:scale-95"
              >
                <Home className="h-5 w-5" /> Return to Forge
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 overflow-x-clip">
      

      <div className="flex justify-center items-start w-full relative px-4 overflow-x-clip">
        <SponsorSidebars position="left" className="shrink-0" />

        <main className="container mx-auto max-w-[1300px] px-6 py-10 grow overflow-visible min-w-0">
          <div className="w-full flex flex-col gap-6">
            {/* ── HEADER ── */}
            <header className="flex items-center justify-between flex-wrap gap-4 mb-1 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-6">
                <Link to="/">
                  <Button aria-label="Go back to home" variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border hover:bg-primary/20 transition-all group/back bg-background/80 shadow-xl border-2">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-shadow-glow leading-none">
                    Image to <span className="text-primary italic">PDF Compiler</span>
                  </h1>
                  <p className="text-muted-foreground mt-1 font-black uppercase tracking-[0.35em] opacity-40 text-[8px] ml-1">
                    Secure Multi-Page Artifact Compiler
                  </p>
                </div>
              </div>
            </header>

            {/* ── SETTINGS BAR (Horizontal - High Density) ── */}
            <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl bg-card border-2 border-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="p-4 flex items-center justify-between gap-6 lg:flex-nowrap flex-wrap">
                {/* 1. PDF Filename (Namespace) */}
                <div className="flex items-center gap-4 min-w-0 flex-grow max-w-[450px]">
                  <div className="shrink-0 pl-2 lg:block hidden">
                    <Label htmlFor="pdf-namespace-input" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none cursor-pointer">Namespace</Label>
                    <p className="text-[8px] font-black text-muted-foreground uppercase opacity-40 leading-none mt-1.5 whitespace-nowrap">Output Identity</p>
                  </div>
                  <div className="relative flex-1 min-w-[120px]">
                    <Input
                      id="pdf-namespace-input"
                      name="pdf-namespace-input"
                      value={pdfName}
                      onChange={(e) => setPdfName(e.target.value)}
                      className="bg-black/40 h-11 pr-14 font-black uppercase tracking-tighter border-primary/20 focus:border-primary/50 transition-all rounded-xl text-[clamp(10px,1vw,13px)]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-primary opacity-30">.PDF</span>
                  </div>
                </div>

                <div className="h-10 w-px bg-white/10 hidden lg:block" />

                {/* 2. Page Size Selection */}
                <div className="flex items-center gap-4 shrink-0 min-w-0">
                  <div className="lg:block hidden shrink-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Format</p>
                    <p className="text-[8px] font-black text-muted-foreground uppercase opacity-40 leading-none mt-1.5">Spatial Layout</p>
                  </div>
                  <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-primary/10">
                    {[
                      { id: "a4", label: "A4" },
                      { id: "letter", label: "LTR" }
                    ].map((page) => (
                      <Button
                        key={page.id}
                        variant={pageSize === page.id ? "default" : "outline"}
                        className={`h-9 px-4 text-[clamp(10px,1vw,12px)] font-black uppercase tracking-widest rounded-lg transition-all border-0 shadow-none
                          ${pageSize === page.id
                            ? 'bg-primary text-white shadow-glow shadow-primary/20'
                            : 'bg-transparent text-muted-foreground hover:bg-white/5 hover:text-white'}`}
                        onClick={() => setPageSize(page.id as any)}
                        id={`btn-pdf-size-${page.id}`}
                      >
                        {page.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="h-10 w-px bg-white/10 hidden lg:block" />

                {/* 3. Management Actions */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Actions</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase opacity-60 leading-none mt-1.5">Registry</p>
                  </div>
                  <div className="flex gap-2">
                    <Button aria-label="Clear all artifacts" variant="outline" size="icon" onClick={() => setImages([])} disabled={images.length === 0} className="h-10 w-10 rounded-xl border-border/50 text-destructive hover:bg-destructive/10 transition-all shadow-sm">
                      <Trash2 className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                </div>

                <div className="h-10 w-px bg-white/10 hidden lg:block" />

                {/* 4. Export Action */}
                <div className="flex-grow max-w-[280px] min-w-[140px]">
                  <Button
                    onClick={generateAndDownload}
                    disabled={images.length === 0 || isProcessing}
                    className="h-10 w-full rounded-xl font-black uppercase italic tracking-widest shadow-glow shadow-primary/20 text-[clamp(10px,1vw,13px)] group relative overflow-hidden active:scale-95 transition-all bg-primary text-white hover:opacity-90"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2 animate-pulse">
                        <RefreshCw className="h-4 w-4 animate-spin" /> Compiling...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" /> Export Master
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ── HYBRID WORKSPACE (Leveled & Calibrated) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-6 items-stretch animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Management Column (Strict 3-Row Limit) */}
              <div className="flex flex-col gap-6 h-full">
                <Card className="glass-morphism border-dashed border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.05] transition-all duration-300 cursor-pointer relative group overflow-hidden h-[80px] flex items-center justify-center rounded-2xl shrink-0">
                  <input
                    type="file"
                    id="pdf-upload-input"
                    name="pdf-upload-input"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center gap-4 px-6">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow shadow-primary/20 text-primary ring-1 ring-primary/20 shrink-0">
                      <Plus className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-black uppercase tracking-tighter text-primary italic leading-none">Deploy Artifacts</p>
                      <p className="text-[7px] text-muted-foreground uppercase mt-1.5 font-black tracking-[0.2em] opacity-40">DRAG MASTER OR CLICK</p>
                    </div>
                  </div>
                </Card>

                {/* Artifact Registry Thumbs (Strictly Enforced 3x2 Grid) */}
                <div className="h-[440px] glass-morphism border-primary/20 rounded-2xl flex flex-col group transition-all shadow-2xl relative border-2 border-primary/10 overflow-hidden">
                  <header
                    onClick={() => setShowGallery(true)}
                    className="h-[50px] px-5 flex items-center justify-between shrink-0 border-b border-primary/10 cursor-pointer hover:bg-primary/10 transition-all bg-muted/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic leading-none">
                        Active Stack ({images.length})
                      </h3>
                    </div>
                    <Maximize2 className="h-3.5 w-3.5 text-primary opacity-30 group-hover:opacity-100 transition-all" />
                  </header>

                  <div className="flex-1 min-h-0 relative p-5 bg-muted/10 overflow-y-auto custom-scrollbar">
                    {images.length === 0 ? (
                      <div
                        onClick={() => setShowGallery(true)}
                        className="h-full flex flex-col items-center justify-center opacity-20 text-center px-10 grayscale cursor-pointer"
                      >
                        <FileStack className="h-10 w-10 mb-4 stroke-1" />
                        <p className="text-[9px] font-black uppercase tracking-widest italic opacity-60 leading-relaxed max-w-[140px]">Laboratory Sequence Engine Idle</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 h-auto content-start">
                        <AnimatePresence mode="popLayout" initial={false}>
                          {images.map((img, index) => (
                            <motion.div
                              key={img.id}
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="relative aspect-video rounded-xl overflow-hidden border border-primary/20 bg-card shadow-xl group/thumb hover:border-primary/60 transition-all shrink-0"
                            >
                              <img src={img.preview} className="h-full w-full object-cover" alt="Artifact" />

                              {/* Centered Delete Action */}
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/thumb:opacity-100 transition-all flex items-center justify-center">
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(img.id);
                                  }}
                                  className="h-9 w-9 rounded-full bg-destructive flex items-center justify-center text-white scale-75 group-hover/thumb:scale-100 transition-all cursor-pointer hover:bg-destructive shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </div>
                              </div>

                              <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-background/90 rounded text-[8px] font-black text-primary border border-primary/20 uppercase tracking-tighter shadow-2xl">
                                #{index + 1}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  <footer
                    onClick={() => setShowGallery(true)}
                    className="h-[50px] border-t border-primary/10 cursor-pointer hover:bg-primary/10 transition-all text-center flex items-center justify-center gap-3 bg-muted/20"
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/30 italic group-hover:text-primary transition-colors">Forensic Sequence Registry</p>
                  </footer>
                </div>
              </div>

              {/* Discovery Preview Lab (Leveled with Sidebar) */}
              <div className="w-full flex flex-col h-[544px] overflow-hidden">
                <Card className="flex-1 glass-morphism border-primary/20 rounded-2xl overflow-hidden relative shadow-2xl border-2 border-primary/10 group/preview">
                  {!previewUrl ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-muted/5">
                      <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 border border-primary/20 group-hover/preview:scale-110 transition-transform shadow-glow shadow-primary/20">
                        <FileStack className="h-6 w-6 text-primary/40" />
                      </div>
                      <h2 className="text-xl font-black text-primary/10 uppercase tracking-[0.5em] italic mb-3">Serialization Engine Ready</h2>
                      <p className="text-[9px] font-black text-primary/5 uppercase tracking-[0.4em] leading-relaxed max-w-sm italic">
                        Awaiting artifact sequence for PDF compilation.
                      </p>
                    </div>
                  ) : (
                    <iframe src={previewUrl} className="w-full h-full border-none opacity-95 transition-opacity duration-1000" title="PDF Preview" />
                  )}
                </Card>
              </div>
            </div>

            <ToolExpertSection
              title="Image to PDF Compiler"
              accent="orange"
              overview="This compiler is a secure, multi-page artifact synthesizer designed for sensitive document handling and portfolio construction. I built this tool to provide a 'Zero-Cloud' alternative to common online PDF converters that often scan and index your private identification documents or proprietary design assets for their own internal datasets."
              steps={[
                "Stage your image artifacts (JPG, PNG, or WebP) in the 'Forensic Registry' workspace.",
                "Calibrate the document sequence by dragging the masters into the target order.",
                "Select the output spatial layout (A4 or Letter) to match your distribution requirements.",
                "The 'Serialization Engine' generates a high-fidelity PDF stream directly in your browser's heap memory.",
                "Export the final synthesized artifact to your local disk without a single byte ever hitting a remote server."
              ]}
              technicalImplementation="I architected the compiler core using the jsPDF library, specifically configured for client-side stream synthesis. The engine performs a multi-pass serialization: it scales each artifact to the target page dimensions while maintaining the original aspect ratio via coordinate transform matrices. We utilize the browser's native Canvas API for data serialization, injecting the resulting binary into the PDF object model locally. Our 'Discovery Pass' utilizes low-priority task scheduling to ensure the UI remains responsive during assembly."
              privacyGuarantee="The Security & Privacy model for the PDF Compiler is absolute: Zero-Network Surface Area. Your private images and the resulting PDF documents exist only within the Browser Sandbox Lifecycle. We utilize localized Blob URLs for temporary artifact staging, which are purged once the session is terminated. Since the entire compilation logic is strictly offline, your sensitive documents are never exposed to external listeners."
            />
          </div>

          {/* ── ARTIFACT REGISTRY OVERLAY (Manual Drag-to-Swap Console) ── */}
          <Dialog open={showGallery} onOpenChange={setShowGallery} modal={false}>
            <DialogContent className="max-w-[1300px] h-[85vh] glass-morphism p-0 overflow-hidden rounded-2xl flex flex-col bg-card border-2 border-primary/10 z-[9999] [&>button]:hidden studio-gradient backdrop-blur-3xl shadow-2xl">
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-background/40 shrink-0 backdrop-blur-3xl">
                <div className="flex items-center gap-8">
                  <div className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-[0_0_40px_rgba(249,115,22,0.2)] ring-2 ring-primary/40">
                    <FileStack className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter italic text-primary leading-none">Forensic Registry</h2>
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/40 mt-3 italic">Drag Masters to Calibrate Sequence • {images.length} Masters Staged</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex bg-background/60 p-2 rounded-xl border border-primary/20 shadow-inner">
                    <Button variant="ghost" onClick={handleSwap} disabled={images.length < 2} className="rounded-xl h-14 px-10 text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-all italic">
                      Invert Chain
                    </Button>
                    <Button variant="ghost" onClick={() => setImages([])} disabled={images.length === 0} className="rounded-xl h-14 px-10 text-[11px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all italic">
                      Purge Registry
                    </Button>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setShowGallery(false)} className="rounded-2xl h-16 w-16 border-primary/40 hover:bg-primary/20 text-primary transition-all bg-background/60 shadow-glow shadow-primary/10">
                    <Plus className="h-8 w-8 rotate-45" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-transparent">
                {images.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 py-40">
                    <FileStack className="h-32 w-32 mb-10 stroke-1 text-primary animate-pulse" />
                    <p className="text-3xl font-black uppercase tracking-[0.6em] italic text-primary">No artifacts detected</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 content-start pb-20">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {images.map((img, index) => (
                        <motion.div
                          key={img.id}
                          layout
                          className="flex flex-col gap-4 relative"
                        >
                          <div className="group/item relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted/10 shadow-2xl hover:border-primary/50 transition-all duration-300">
                            <img src={img.preview} className="h-full w-full object-cover select-none pointer-events-none" alt="Artifact" />

                            {/* Centered Overlay Action */}
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/item:opacity-100 transition-all flex items-center justify-center pointer-events-none group-active/item:hidden">
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-16 w-16 rounded-full shadow-[0_0_40px_rgba(239,68,68,0.5)] transform scale-75 group-hover/item:scale-100 transition-all pointer-events-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(img.id);
                                }}
                              >
                                <Trash2 className="h-8 w-8" />
                              </Button>
                            </div>

                          </div>

                          <div className="flex flex-col gap-1 px-1">
                            <div className="flex items-center justify-between gap-2">
                              {/* New Precision Move Buttons */}
                              <div className="flex items-center bg-muted/40 border border-primary/10 rounded-lg p-0.5">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => moveImage(index, 'up')}
                                  disabled={index === 0}
                                  className="h-6 w-6 rounded-md hover:bg-primary/20 text-primary/40 disabled:opacity-0 transition-opacity"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic px-2">#{index + 1}</span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => moveImage(index, 'down')}
                                  disabled={index === images.length - 1}
                                  className="h-6 w-6 rounded-md hover:bg-primary/20 text-primary/40 disabled:opacity-0 transition-opacity"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                              <span className="text-[9px] font-black text-primary/30 uppercase tracking-widest leading-none shrink-0 truncate max-w-[80px]">{img.size}</span>
                            </div>
                            <p className="text-[8px] font-black text-primary/10 uppercase tracking-[0.1em] truncate italic px-1">{img.name}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <div className="p-8 bg-orange-100/50 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-primary/20 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-primary/40 italic px-12 shrink-0">
                <div className="flex items-center gap-10">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-primary tracking-[0.3em] opacity-80">FORENSIC REGISTRY CIPHER ACTIVE</span>
                  </div>
                  <div className="h-4 w-px bg-primary/10" />
                  <p className="opacity-40">Chain Identifier: {pdfName}.pdf</p>
                </div>
                <p className="opacity-20 tracking-[0.3em]">Catalyst Laboratory Console • v4.0.0-Orange</p>
              </div>
            </DialogContent>
          </Dialog>

          <div className="max-w-[1240px] w-full mt-10">
            <ToolExpertSection
              title="Image to PDF Assembler"
              accent="orange"
              overview="This high-density PDF Assembler was engineered for document architects and administrative professionals who require a private path for compiling image artifacts into secure PDF containers. I built this tool to eliminate the privacy vacuum where users are forced to upload sensitive identification documents, receipts, or project blueprints to cloud-based 'PDF converters' that scrape your metadata and OCR your content for data mining."
              steps={[
                "Stage your image assets (JPG, PNG, WebP) into the Forensic Workspace.",
                "Adjust the stacking order and orientation of each page using the 'Precision Move' modules.",
                "Configure the output schema: Select 'Portrait' or 'Landscape' and define the PDF identifier.",
                "The background engine initiates a localized 'Bake' sequence, reconciling the image resolutions to the target document scale.",
                "Extract the localized PDF artifact directly from your device's browser sandbox."
              ]}
              technicalImplementation="I architected this assembler using a localized jspdf instances, which performs the binary PDF construction entirely within the browser's V8 execution context. The engine utilizes intelligent asset scaling to ensure that high-resolution source images do not lead to unwieldy document weights, while maintaining 1:1 fidelity for forensic legibility. By bypassing server-side rendering entirely, we eliminate the need for network-bound data transmission, ensuring that the PDF construction remains a zero-gravity, offline process."
              privacyGuarantee="The Security \u0026 Privacy model for the PDF Lab is centered on Local Sandbox Sovereignty. At no point are your source images or the final PDF bi-product transmitted across the web. The assembly process occurs strictly within your browser's private application state. Once the 'Bake' sequence is complete and you close the session, all volatile data—including the sensitive identify artifacts and Blueprints—is purged from the machine's peripheral RAM."
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

export default ImageToPdf;
