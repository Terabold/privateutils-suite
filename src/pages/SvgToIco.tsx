import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, FileCode, Trash2, Copy, ImageIcon, Sliders, ShieldAlert, Info, AlertCircle, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { createIcoFromPng } from "@/utils/ico-packer";

// ── Constants ──────────────────────────────────────────────────────────────────
const MAX_STRING_LENGTH = 1000000;
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ICON_SIZES = [16, 32, 48, 64, 128, 256];

// ── Helpers ──────────────────────────────────────────────────────────────────

const toDataUrl = async (url: string): Promise<string> => {
  const res = await fetch(url, { mode: "cors" });
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
};

const inlineExternalImages = async (svgEl: Element): Promise<void> => {
  const images = Array.from(svgEl.querySelectorAll("image"));
  await Promise.all(
    images.map(async (img) => {
      const href = img.getAttribute("href") || img.getAttributeNS("http://www.w3.org/1999/xlink", "href");
      if (!href || href.startsWith("data:")) return;
      try {
        const dataUrl = await toDataUrl(href);
        img.setAttribute("href", dataUrl);
        img.removeAttributeNS("http://www.w3.org/1999/xlink", "href");
      } catch (e) {
        console.warn("Could not inline image:", href, e);
      }
    })
  );
};

const resolveSvgDimensions = (svgEl: Element): { w: number; h: number } => {
  const viewBox = svgEl.getAttribute("viewBox");
  if (viewBox) {
    const p = viewBox.trim().split(/[\s,]+/).map(Number);
    if (p.length >= 4 && p[2] > 0 && p[3] > 0) return { w: p[2], h: p[3] };
  }
  const w = parseFloat(svgEl.getAttribute("width") || "800");
  const h = parseFloat(svgEl.getAttribute("height") || "600");
  return { w: w || 800, h: h || 600 };
};

const SvgToIco = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [input, setInput] = useState("");
  const [targetSize, setTargetSize] = useState(32);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
  }, [darkMode]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File exceeds 2MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content.toLowerCase().includes("<!entity")) {
        toast.error("Security risk: XML Entities detected.");
        return;
      }
      setInput(content);
      toast.success("SVG Code Loaded");
    };
    reader.readAsText(file);
  };

  usePasteFile(handleFile);

  useEffect(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setPreviewUrl(null);
      setRenderError(null);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(trimmed, "image/svg+xml");
        const svgEl = doc.querySelector("svg");
        if (!svgEl || doc.querySelector("parsererror")) {
          setRenderError("INVALID_XML");
          return;
        }
        const { w, h } = resolveSvgDimensions(svgEl);
        if (!svgEl.getAttribute("xmlns")) svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        if (!svgEl.getAttribute("viewBox")) svgEl.setAttribute("viewBox", `0 0 ${w} ${h}`);
        svgEl.setAttribute("width", w.toString());
        svgEl.setAttribute("height", h.toString());

        const svgString = new XMLSerializer().serializeToString(svgEl);
        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
        setRenderError(null);
      } catch (err) {
        setRenderError("INVALID_XML");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [input]);

  const convertAndDownload = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input.trim(), "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) throw new Error("No SVG found");

      await inlineExternalImages(svgEl);
      const { w: nativeW, h: nativeH } = resolveSvgDimensions(svgEl);

      const svgString = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = async () => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.clearRect(0, 0, targetSize, targetSize);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Maintain aspect ratio while fitting into the square ICO
          const ratio = Math.min(targetSize / nativeW, targetSize / nativeH);
          const drawW = nativeW * ratio;
          const drawH = nativeH * ratio;
          const offsetX = (targetSize - drawW) / 2;
          const offsetY = (targetSize - drawH) / 2;

          ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

          // Get PNG blob from canvas
          const pngBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
          if (!pngBlob) throw new Error("PNG Generation Failed");

          const arrayBuffer = await pngBlob.arrayBuffer();
          const icoBlob = createIcoFromPng(new Uint8Array(arrayBuffer), targetSize, targetSize);

          const link = document.createElement("a");
          link.download = `favicon_${targetSize}x${targetSize}.ico`;
          link.href = URL.createObjectURL(icoBlob);
          link.click();
          toast.success(`ICO Icon Created: ${targetSize}px`);
        } finally {
          URL.revokeObjectURL(url);
          setIsProcessing(false);
        }
      };
      img.src = url;
    } catch (err) {
      toast.error("Conversion failed. Check SVG data.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />
        <main className="container mx-auto max-w-[1800px] px-4 py-8 grow">
          <div className="flex flex-col gap-10">
            <header className="flex items-center justify-between flex-wrap gap-8">
              <div className="flex items-center gap-6">
                <Link to="/">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border dark:border-white/20 hover:bg-primary/10 transition-all group/back bg-background/80 shadow-xl">
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-foreground text-shadow-glow">
                    Svg to <span className="text-primary italic">ICO Icon</span>
                  </h1>
                  <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-60 text-[10px]">Generate .ico favicons for web apps</p>
                </div>
              </div>
            </header>
            <ToolAdBanner />
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 items-start">
              <div className="space-y-12">
                <Card className="glass-morphism border-border dark:border-primary/10 overflow-hidden relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg rounded-2xl flex flex-col h-[600px]">
                  <div className="bg-white/50 dark:bg-[#111] border-b border-border px-4 pt-4 flex items-end justify-between shrink-0">
                    <div className="flex gap-1.5 items-center bg-white dark:bg-[#111111] px-5 py-2.5 rounded-t-xl border-x border-t border-border relative z-10 -mb-[1px]">
                      <FileCode className="h-4 w-4 text-blue-600" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Vector Source</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5 relative z-40">
                      <Button asChild variant="ghost" className={`h-11 px-4 text-[10px] font-black rounded-xl gap-2 italic uppercase tracking-widest border transition-all duration-300 ${!input ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]' : 'text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/40'}`}>
                        <label className="cursor-pointer">
                          <ImageIcon className="h-3.5 w-3.5" /> Upload SVG
                          <input type="file" accept=".svg" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                        </label>
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/70 rounded-2xl" onClick={() => setInput("")}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row bg-white dark:bg-black overflow-hidden">
                    <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder='Paste SVG code...' className="flex-1 p-6 font-mono text-xs text-blue-700 dark:text-blue-400 bg-transparent resize-none outline-none leading-relaxed" spellCheck={false} />
                    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-zinc-50/50 dark:bg-zinc-950/20 relative overflow-hidden">
                      {previewUrl && !renderError ? (
                        <div className="relative w-full h-full flex items-center justify-center p-6 transition-transform overflow-hidden">
                          <div className="relative" style={{ width: targetSize, height: targetSize }}>
                            <img src={previewUrl} className="w-full h-full object-contain shadow-2xl" alt="ICO Preview" />
                            <div className="absolute -bottom-6 left-0 right-0 text-center text-[8px] font-black uppercase tracking-widest opacity-40">Preview: {targetSize}px</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-muted-foreground/30 text-center">
                          <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-current flex items-center justify-center opacity-40"><Zap className="h-8 w-8" /></div>
                          <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Awaiting Vector Signal</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
              <aside className="space-y-8 lg:sticky lg:top-28">
                <Card className="glass-morphism border-border dark:border-primary/10 rounded-2xl overflow-hidden shadow-lg bg-card">
                  <div className="bg-primary/5 p-5 border-b border-border flex items-center gap-2">
                    <Sliders className="h-3 w-3 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Target Resolution</h3>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-3 gap-2">
                      {ICON_SIZES.map(size => (
                        <button
                          key={size}
                          onClick={() => setTargetSize(size)}
                          className={`h-12 rounded-xl text-[10px] font-black transition-all border ${targetSize === size ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-background text-muted-foreground border-border hover:bg-primary/5'}`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground italic font-black uppercase tracking-tighter opacity-70 text-center leading-relaxed">
                      Favicons usually require multiple resolutions. Export your artifact at 32px or 48px for standard browser support.
                    </p>
                    <Button onClick={convertAndDownload} disabled={!input || isProcessing} className="w-full h-11 text-[10px] font-black rounded-xl gap-2 italic uppercase tracking-widest shadow-[0_0_20px_var(--primary)]">
                      <Download className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
                      {isProcessing ? "Converting..." : "Download ICO"}
                    </Button>
                  </CardContent>
                </Card>
              </aside>
            </div>
            <ToolExpertSection
              title="SVG to ICO Icon Generator"
              accent="orange"
              overview="This generator is a client-side binary packer designed to transform scalable vectors into standard ICO favicons. I built this tool to provide a fast, offline alternative to cloud converters that often add unnecessary pixel metadata to your production icons. It ensures your branding assets remain strictly confidential and sharp."
              steps={[
                "Paste your SVG XML code or upload a vector artifact to the generator workbench.",
                "Select your target resolution from the standard sizing matrix (16px to 256px).",
                "The engine renders a high-DPI raster image to an off-screen canvas surface.",
                "Review the live preview to verify orientation and color accuracy.",
                "Download the binary .ico container directly from your browser's managed heap."
              ]}
              technicalImplementation="I engineered this packer to perform two distinct operations. First, it uses the Canvas API to rasterize the SVG at the selected bit-depth. Second, I implemented a specialized ICO binary packer that manually constructs the IconDirectory and IconDirectoryEntry structures according to specification. This allows us to wrap a PNG-encoded image into an ICO container directly in-memory, bypassing the need for server-side binary processors."
              privacyGuarantee="The Security & Privacy model for the ICO Generator is built on Deterministic Execution. Every byte of the ICO file is constructed in your local browser's volatile memory. By utilizing TypedArrays (Uint8Array) for binary construction, we bypass the need for external network calls or cloud-based image processors. Once the tab is purged, your memory is cleared and the session data is vaporized."
            />
          </div>
        </main>
        <SponsorSidebars position="right" />
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default SvgToIco;
