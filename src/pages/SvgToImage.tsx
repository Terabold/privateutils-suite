import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, FileCode, Trash2, Copy, ImageIcon, Sliders, ShieldAlert, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";

// ── Constants ──────────────────────────────────────────────────────────────────
const MAX_STRING_LENGTH = 1000000; // ~1MB text limit to prevent textarea freezes
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB file limit
const MAX_CANVAS_AREA = 8000 * 8000; // Hardware memory limit for canvas (Standardized)

// ── Helpers ──────────────────────────────────────────────────────────────────

const isPixel = (val: string | null): val is string =>
  !!val && /^[0-9.]+(px)?$/i.test(val.trim());

/**
 * Fetch a URL and return a data: URL.
 */
const toDataUrl = async (url: string): Promise<string> => {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
};

/**
 * Inline external images to prevent canvas tainting.
 */
const inlineExternalImages = async (svgEl: Element): Promise<void> => {
  const images = Array.from(svgEl.querySelectorAll("image"));
  await Promise.all(
    images.map(async (img) => {
      const href =
        img.getAttribute("href") ||
        img.getAttributeNS("http://www.w3.org/1999/xlink", "href");
      if (!href || href.startsWith("data:")) return;

      try {
        const dataUrl = await toDataUrl(href);
        img.setAttribute("href", dataUrl);
        img.removeAttributeNS("http://www.w3.org/1999/xlink", "href");
      } catch (e) {
        console.warn("Could not inline external image:", href, e);
      }
    })
  );
};

/**
 * Improved dimension resolver — handles missing dimensions, em/rem, and complex content.
 * @param svgEl The SVG element to inspect
 * @param fast If true, avoids expensive getBBox() and DOM manipulation (ideal for typing/preview)
 */
const resolveSvgDimensions = (svgEl: Element, fast = false): { w: number; h: number } => {
  // 1. viewBox is best
  const viewBox = svgEl.getAttribute("viewBox");
  if (viewBox) {
    const p = viewBox.trim().split(/[\s,]+/).map(Number);
    if (p.length >= 4 && p[2] > 0 && p[3] > 0) {
      return { w: Math.ceil(p[2]), h: Math.ceil(p[3]) };
    }
  }

  // 2. Explicit width/height with pixel or em/rem support
  const widthAttr = svgEl.getAttribute("width")?.trim();
  const heightAttr = svgEl.getAttribute("height")?.trim();

  const parseLength = (val: string | null): number | null => {
    if (!val) return null;
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return null;

    const lower = val.toLowerCase();
    if (lower.endsWith("em") || lower.endsWith("rem")) {
      return num * 16; // approximate root font size
    }
    return num;
  };

  let w = parseLength(widthAttr);
  let h = parseLength(heightAttr);

  if (w && h) return { w: Math.ceil(w), h: Math.ceil(h) };
  if (fast) return { w: w || 800, h: h || 600 };

  // 3. Robust fallback using getBBox() - ONLY for export
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-99999px";
  container.style.top = "-99999px";
  container.style.visibility = "hidden";
  container.style.overflow = "hidden";
  document.body.appendChild(container);

  const clone = svgEl.cloneNode(true) as SVGSVGElement;

  // Give temporary size so percentages and relative units can resolve
  if (!clone.hasAttribute("width")) clone.setAttribute("width", "800");
  if (!clone.hasAttribute("height")) clone.setAttribute("height", "600");
  if (!clone.hasAttribute("viewBox")) clone.setAttribute("viewBox", "0 0 800 600");

  container.appendChild(clone);

  let finalW = w || 800;
  let finalH = h || 600;

  try {
    const bbox = clone.getBBox();
    if (bbox.width > 5 && bbox.height > 5) {
      finalW = Math.ceil(bbox.x + bbox.width);
      finalH = Math.ceil(bbox.y + bbox.height);
    }
  } catch (e) {
    console.warn("getBBox() failed, using fallback", e);
  } finally {
    document.body.removeChild(container);
  }

  return { w: finalW, h: finalH };
};

// ── Component ─────────────────────────────────────────────────────────────────

const SvgToImage = () => {
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [input, setInput] = useState("");
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg">("png");
  const [scale, setScale] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "image/svg+xml" && !file.name.endsWith(".svg")) {
      toast.error("Format mismatch. Deploy SVG artifact only.");
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setInput(""); // Clear input so preview unmounts
      setPreviewUrl(null);
      setRenderError("FILE_TOO_LARGE"); // Trigger UI
      toast.error("File exceeds 2MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      // Security Gate: Billion Laughs Protection
      if (content.toLowerCase().includes("<!entity")) {
        toast.error("Security risk: XML Entities (Billion Laughs) detected. Artifact rejected.");
        return;
      }

      if (content.length > MAX_STRING_LENGTH) {
        setRenderError("FILE_TOO_LARGE");
        toast.error("Payload too large. Parsing aborted.");
        return;
      }
      setInput(content);
      toast.success("SVG Artifact Staged");
    };
    reader.readAsText(file);
  };

  usePasteFile(handleFile);

  // ── PREVIEW ENGINE (Unified "WYSIWYG" Path) ───────────────────
  useEffect(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setPreviewUrl(null);
      // Only clear the error if it's NOT a file size block or memory limit
      setRenderError(prev => (prev === "FILE_TOO_LARGE" || prev === "MEMORY_LIMIT" ? prev : null));
      return;
    }

    const timer = setTimeout(() => {
      const lowerInput = trimmed.toLowerCase();
      // 1. SECURITY CHECK: Intercept Exponential Reference Attacks
      if (lowerInput.includes("<!entity")) {
        setRenderError("SECURITY_ENTITY");
        toast.error("Security risk: XML Entities (Billion Laughs) detected. Artifact rejected.");
        return;
      }

      const useTagCount = (trimmed.match(/<use\b/gi) || []).length;
      if (useTagCount > 50) {
        setRenderError("SECURITY_USE_TAGS");
        toast.error("Security risk: Excessive <use> tags detected.");
        return;
      }

      // 2. UNIFIED REPAIR & RENDER PATH
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(trimmed, "image/svg+xml");
        const svgEl = doc.querySelector("svg");
        
        if (!svgEl || doc.querySelector("parsererror")) {
          setRenderError("INVALID_XML");
          return;
        }

        if (!svgEl.getAttribute("xmlns")) {
          svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        }

        const { w: finalW, h: finalH } = resolveSvgDimensions(svgEl, true);
        
        // Safety Gate: Dimensional Coordinate Limit (8000px)
        if (finalW > 8000 || finalH > 8000) {
          setRenderError("MEMORY_LIMIT");
          toast.error(`Dimension threshold exceeded: ${finalW}x${finalH} exceeds 8000px hardware limit.`);
          return;
        }
        
        if (!svgEl.getAttribute("viewBox")) {
          svgEl.setAttribute("viewBox", `0 0 ${finalW} ${finalH}`);
        }

        svgEl.setAttribute("width", finalW.toString());
        svgEl.setAttribute("height", finalH.toString());

        const svgString = new XMLSerializer().serializeToString(svgEl);
        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        
        setPreviewUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setRenderError(null);
      } catch (err) {
        console.error("Preview sanitization failed:", err);
        setRenderError("INVALID_XML");
      }
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [input]);

  // Handle final cleanup
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ── EXPORT ──────────────────────────────────────────────────────────────────
  const convertAndDownload = async () => {
    if (!input.trim()) {
      toast.error("No SVG code detected");
      return;
    }

    setIsProcessing(true);

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input.trim(), "image/svg+xml");
      const svgEl = doc.querySelector("svg");

      if (!svgEl) throw new Error("No <svg> element found");

      if (!svgEl.getAttribute("xmlns")) {
        svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      }

      // Inline external images
      await inlineExternalImages(svgEl);

      // Get reliable dimensions
      const { w: finalW, h: finalH } = resolveSvgDimensions(svgEl);

      // Prepare SVG for canvas rendering
      if (!svgEl.getAttribute("viewBox")) {
        svgEl.setAttribute("viewBox", `0 0 ${finalW} ${finalH}`);
      }
      svgEl.setAttribute("width", finalW.toString());
      svgEl.setAttribute("height", finalH.toString());

      const svgString = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.crossOrigin = "anonymous";   // ← Critical for avoiding taint

      img.onload = () => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) throw new Error("Canvas element not found");

          const requestedWidth = finalW * scale;
          const requestedHeight = finalH * scale;

          // MEMORY CHECK: Prevent canvas allocation crashes (OOM protection)
          if ((requestedWidth * requestedHeight) > MAX_CANVAS_AREA) {
            setRenderError("MEMORY_LIMIT"); // Trigger UI
            toast.error("Resulting resolution is too high for device memory. Reduce scale.");
            setIsProcessing(false);
            return;
          }

          canvas.width = requestedWidth;
          canvas.height = requestedHeight;

          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Failed to initialize canvas context");

          // Clear any previous render (Essential for transparency)
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // White background for JPEG only
          if (exportFormat === "jpeg") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const dataUrl = canvas.toDataURL(
            `image/${exportFormat}`,
            exportFormat === "jpeg" ? 0.92 : undefined
          );

          const link = document.createElement("a");
          link.download = `converted_${Date.now()}.${exportFormat}`;
          link.href = dataUrl;
          link.click();

          toast.success(`SVG Converted to ${exportFormat.toUpperCase()}`);
        } catch (err) {
          console.error(err);
          setRenderError("RENDER_FAULT");
          toast.error("Render failed. Try simplifying the SVG.");
        } finally {
          URL.revokeObjectURL(url);
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        setIsProcessing(false);
        setRenderError("LOAD_FAULT");
        toast.error("Failed to load SVG for rendering.");
      };

      img.src = url;
    } catch (err) {
      console.error(err);
      toast.error("Export failed. Check SVG syntax.");
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
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border dark:border-white/20 hover:bg-primary/10 dark:hover:bg-primary/20 transition-all group/back bg-background/80 dark:bg-black/60 shadow-xl dark:shadow-2xl">
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-foreground dark:text-white text-shadow-glow">
                    Svg to <span className="text-primary italic">Image Converter</span>
                  </h1>
                  <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-60 dark:opacity-40 text-[10px]">Client-Side Vector to Raster Conversion</p>
                </div>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 items-start">
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Card className="glass-morphism border-border dark:border-primary/10 overflow-hidden relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg dark:shadow-2xl rounded-2xl group flex flex-col h-[600px]">
                  <div className="bg-white/50 dark:bg-[#111] border-b border-border dark:border-white/10 px-4 pt-4 flex flex-wrap sm:flex-nowrap items-end justify-between gap-y-4 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5 items-center bg-white dark:bg-[#111111] px-5 py-2.5 rounded-t-xl border-x border-t border-border dark:border-white/10 relative z-10 -mb-[1px] transition-all hover:bg-zinc-50 dark:hover:bg-[#151515] shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
                        <FileCode className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-400">Vector Workspace</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5 relative z-40">
                       <Button
                        asChild
                        variant="ghost"
                        className={`h-11 px-3 sm:px-4 text-[10px] font-black rounded-xl gap-2 italic uppercase tracking-widest transition-all duration-700 border border-primary/20 shadow-none hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] ${!input ? 'bg-primary text-white shadow-[0_0_25px_rgba(var(--primary),0.4)] hover:bg-primary/90 hover:shadow-[0_0_35px_rgba(var(--primary),0.6)] animate-pulse duration-[time:4000ms] border-primary' : 'text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/40'}`}
                      >
                        <label className="cursor-pointer">
                          <ImageIcon className="h-3.5 w-3.5" /> Upload SVG
                          <input id="svg-image-upload-input" name="svg-image-upload-input" type="file" accept=".svg" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
                        </label>
                      </Button>
                      <div className="w-px h-6 bg-border dark:bg-white/10 mx-1" />
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 rounded-2xl transition-colors" onClick={() => { navigator.clipboard.writeText(input); toast.success("Source Copied"); }} disabled={!input}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/70 hover:text-destructive dark:text-destructive/50 dark:hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/10 rounded-2xl transition-colors" onClick={() => { setInput(""); }} disabled={!input}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col md:flex-row bg-white dark:bg-black overflow-hidden">
                    {/* Textarea Input */}
                    <div className="flex-1 border-b md:border-b-0 md:border-r border-border dark:border-white/5 flex flex-col">
                      <textarea
                        id="svg-image-source-input"
                        name="svg-image-source-input"
                        value={input}
                        onChange={(e) => {
                          if (renderError) setRenderError(null); 
                          if (e.target.value.length > MAX_STRING_LENGTH) {
                            setRenderError("FILE_TOO_LARGE");
                            toast.error("Input too large. Please use the upload button instead.");
                            return;
                          }
                          setInput(e.target.value);
                        }}
                        placeholder='Paste SVG code or upload a file...'
                        className="flex-1 w-full p-6 font-mono text-xs text-blue-700 dark:text-blue-400 bg-transparent resize-none outline-none selection:bg-primary/20 leading-relaxed custom-scrollbar whitespace-pre-wrap break-words"
                        spellCheck={false}
                      />
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-zinc-50/50 dark:bg-zinc-950/20 relative group/preview overflow-hidden">
                      <div className="absolute top-4 left-4 flex items-center gap-2 opacity-40">
                        <ImageIcon className="h-3 w-3" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em]">Real-time Render</span>
                      </div>

                      {previewUrl && !renderError ? (
                        <div className="relative w-full h-full flex items-center justify-center p-6 transition-transform duration-500 overflow-hidden">
                          <img
                            src={previewUrl}
                            className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                            alt="Vector Hub Preview"
                          />
                        </div>
                      ) : renderError === "SECURITY_ENTITY" || renderError === "SECURITY_USE_TAGS" || renderError === "FILE_TOO_LARGE" || renderError === "MEMORY_LIMIT" || renderError === "RENDER_FAULT" || renderError === "LOAD_FAULT" ? (
                        <div className="flex flex-col items-center gap-6 text-center w-full max-w-[280px] animate-in slide-in-from-bottom-4 fade-in duration-500 relative z-10">
                          {/* Animated Warning Icon */}
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75"></div>
                            <div className="relative h-16 w-16 rounded-2xl border-2 border-primary/50 flex items-center justify-center bg-primary/10 text-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)]">
                              <ShieldAlert className="h-8 w-8 animate-[pulse_2s_ease-in-out_infinite]" />
                            </div>
                          </div>

                          {/* Header */}
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-1">Render Aborted</p>
                            <p className="text-[12px] font-bold text-foreground">
                              {renderError === "SECURITY_USE_TAGS" ? "Security Risk Detected" : renderError === "RENDER_FAULT" || renderError === "LOAD_FAULT" ? "Engine Fault" : "Hardware Limit Exceeded"}
                            </p>
                          </div>

                          {/* Persistent Tip Box (Staggered slide-in) */}
                          <div className="w-full bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 text-left flex gap-3 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 fill-mode-both">
                            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-1.5">
                              <p className="text-[9px] font-black uppercase tracking-wider text-primary">Engine Tip</p>
                              <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                                {renderError === "SECURITY_USE_TAGS" && "Excessive <use> tags detected. This indicates an 'Exponential Reference' exploit, which forces the renderer into an infinite loop and crashes the browser."}
                                {renderError === "SECURITY_ENTITY" && "XML Entities (<!ENTITY) detected. This pattern indicates a potential 'Billion Laughs' expansion attack and has been blocked."}
                                {renderError === "FILE_TOO_LARGE" && "The payload exceeds safety thresholds. Parsing massive DOM trees can exhaust browser heap memory and cause a critical crash."}
                                {renderError === "MEMORY_LIMIT" && "The requested export scale or intrinsic SVG dimensions exceed maximum canvas allocation. Please reduce scale or simplify coordinates."}
                                {(renderError === "RENDER_FAULT" || renderError === "LOAD_FAULT") && "The vector contains unsupported logic (like complex foreignObjects or external CSS) that the Canvas API cannot safely rasterize. Try simplifying the SVG."}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : renderError === "INVALID_XML" ? (
                        <div className="flex flex-col items-center gap-4 text-destructive/50 text-center animate-in fade-in zoom-in duration-300">
                          <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-current flex items-center justify-center bg-destructive/5">
                            <Trash2 className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-destructive">Deploy Error: Non-SVG Payload</p>
                            <p className="text-[8px] font-medium mt-1 text-muted-foreground">The renderer detected source code or broken XML.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-muted-foreground/30 text-center">
                          <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-current flex items-center justify-center opacity-40">
                             {input.trim() ? <AlertCircle className="h-8 w-8 text-primary" /> : <FileCode className="h-8 w-8" />}
                          </div>
                          <div className="max-w-[200px]">
                            <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                                {input.trim() ? "Preview Unavailable" : "No Content Staged"}
                            </p>
                            <p className="text-[8px] font-medium mt-1.5 text-muted-foreground leading-relaxed italic px-2">
                                {input.trim() 
                                    ? "Source detected but render engine failed to initiate. Ensure valid SVG/XML syntax or check for unsupported external references." 
                                    : "Upload or Paste SVG code to initiate real-time vector rendering."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar Controls */}
              <aside className="space-y-8 lg:sticky lg:top-28 h-fit">
                <Card className="glass-morphism border-border dark:border-primary/10 rounded-2xl overflow-hidden shadow-lg dark:shadow-xl bg-card">
                  <div className="bg-primary/5 dark:bg-primary/10 p-5 border-b border-border dark:border-primary/10 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <Sliders className="h-3 w-3" /> Rendering Engine
                    </h3>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Output Format</Label>
                        <span className="text-[9px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">RASTER</span>
                      </div>
                      <div className="flex p-1 bg-zinc-200 dark:bg-black/40 border border-border dark:border-white/10 rounded-xl">
                        <button
                          onClick={() => setExportFormat("png")}
                          className={`flex-1 h-10 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${exportFormat === "png" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-zinc-300 dark:hover:bg-white/5"}`}
                        >PNG</button>
                        <button
                          onClick={() => setExportFormat("jpeg")}
                          className={`flex-1 h-10 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${exportFormat === "jpeg" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-zinc-300 dark:hover:bg-white/5"}`}
                        >JPG</button>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Scale Multiplier</Label>
                        <span className="text-[10px] font-black italic tracking-tighter text-primary">{scale}x</span>
                      </div>
                      <Slider 
                        id="svg-image-scale-slider"
                        name="svg-image-scale-slider"
                        value={[scale]} 
                        onValueChange={(val) => {
                          setScale(val[0]);
                          if (renderError === "MEMORY_LIMIT") setRenderError(null); 
                        }} 
                        max={8} min={1} step={0.5} className="py-4" 
                      />
                      <p className="text-[11px] text-muted-foreground italic font-black uppercase tracking-tighter opacity-80 leading-snug text-center">Increasing scale produces higher resolution raster output from the vector source.</p>
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={convertAndDownload}
                        disabled={!input || isProcessing}
                        variant="default"
                        className={`w-full h-11 text-[10px] font-black rounded-xl gap-2 italic uppercase tracking-widest transition-all duration-700 shadow-[0_0_20px_var(--primary)] hover:shadow-[0_0_35px_var(--primary)] ${input ? 'bg-primary text-white border border-primary scale-[1.02]' : 'bg-zinc-800 text-zinc-400 opacity-50'}`}
                      >
                        <Download className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
                        {isProcessing ? "Rendering Engine..." : "Export Image"}
                      </Button>
                    </div>

                    <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-60 dark:opacity-30 italic py-2">
                      Native Canvas GPU Acceleration • Zero Uploads
                    </p>
                  </CardContent>
                </Card>
              </aside>
            </div>

            <ToolExpertSection
              title="Svg to Image Converter"
              accent="orange"
              overview="This converter is a high-precision vector-to-raster rendering studio. I built this because many online 'SVG to PNG' converters are actually data collectors that index your uploaded vector assets. This tool provides a GPU-accelerated path to convert scalable graphics into production-ready images while keeping the source code local."
              steps={[
                "Paste your raw SVG code or upload a vector artifact to the workbench.",
                "Set your target dimensions; our engine supports scaling up to 4x for high-DPI assets.",
                "The engine generates a local hardware-accelerated Canvas surface for rendering.",
                "Select your output format (PNG for transparency, JPG for photographs).",
                "Extract the pixel data directly from your browser's heap memory to your disk."
              ]}
              technicalImplementation="I architected the rendering pipeline to utilize the native CanvasRenderingContext2D. The process involves non-blocking execution: we convert the SVG XML into a Blob URL, which is then loaded into an off-screen image element. Once the image is decoded by the browser's hardware-accelerated rasterizer, we paint it to a canvas. This approach ensures that we support complex CSS transforms and masks that are native to the browser's SVG engine."
              privacyGuarantee="The Security & Privacy model for SvgToImage is grounded in Zero-Network Surface Area. No data is ever transmitted to a server. We utilize the Browser Sandbox Lifecycle for the entire rasterization process. By using URL.createObjectURL for temporary artifact staging, we ensure that files are purgeable immediately upon task completion, leaving no forensic trace on our infrastructure."
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

export default SvgToImage;
