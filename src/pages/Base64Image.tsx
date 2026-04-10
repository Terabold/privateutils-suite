import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Image as ImageIcon, FileCode, Zap, Trash2, ShieldCheck, FileStack, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

const Base64Image = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [base64, setBase64] = useState("");
  const [preview, setPreview] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("");

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setBase64(result);
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  usePasteFile(handleFile);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(base64);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 ">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-6 grow overflow-visible">
          <div className="flex flex-col gap-6">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60 shadow-2xl">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                  Base64 Image <span className="text-primary italic">Converter</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  Image to Data URL • Real-time Preview • Local Conversion
                </p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-visible">
              <div className="space-y-8">
                <Card
                  className="glass-morphism border-primary/20 rounded-2xl shadow-xl bg-primary/5 border-2 border-dashed flex flex-col group hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('base64-file-input')?.click()}
                >
                  <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center gap-3 w-full relative z-20">
                    <Activity className="h-4 w-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Studio Workbench</h3>
                  </div>

                  <div className={`flex flex-col items-center justify-center w-full relative ${base64 ? "py-4 pt-4 pb-4" : "py-12 p-12"}`}>
                    <label htmlFor="base64-file-input" className="sr-only">Upload Image for Base64 Encoding</label>
                    <input
                      id="base64-file-input"
                      name="base64-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                        e.target.value = "";
                      }}
                    />

                    {base64 ? (
                      <div className="flex items-center justify-between w-full px-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-5">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-none mb-1 italic">Active Artifact</p>
                            <p className="text-xs font-black text-foreground uppercase tracking-tighter truncate max-w-[200px]">{fileName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="hidden md:flex flex-col items-end opacity-40">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] leading-none mb-1 italic">Swap Mode Active</p>
                            <p className="text-[9px] font-black uppercase tracking-widest">Click or Ctrl+V to Exchange</p>
                          </div>
                          <div className="h-10 w-[1px] bg-white/5" />
                          <KbdShortcut />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-6">
                        <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-125 transition-transform duration-500 shadow-inner border border-primary/20">
                          <FileStack className="h-10 w-10" />
                        </div>
                        <div className="text-center group-hover:scale-105 transition-transform duration-500 mt-6">
                          <h2 className="text-2xl font-black uppercase tracking-widest mb-1 italic text-shadow-glow">Deploy Hub</h2>
                          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 font-black">Click to Browse · Ctrl+V to paste artifact</p>
                          <KbdShortcut />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {base64 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-500">
                    {/* Preview */}
                    <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-card overflow-hidden">
                      <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ImageIcon className="h-4 w-4 text-primary" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Preview</h3>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setBase64(""); setPreview(""); setFileName(""); }} className="h-10 w-10 text-destructive hover:bg-destructive/10 bg-destructive/5 border border-destructive/10 rounded-xl">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-8 flex items-center justify-center bg-background/40 min-h-[400px]">
                        <img src={preview} alt="Preview" className="max-h-[250px] object-contain rounded-2xl shadow-2xl border border-white/5" />
                      </CardContent>
                    </Card>

                    {/* Code */}
                    <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-card overflow-hidden">
                      <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileCode className="h-4 w-4 text-primary" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Base64 String</h3>
                        </div>
                        <Button
                          onClick={copy}
                          className={`gap-2 h-10 px-5 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all duration-300 ${copied ? "bg-green-600 hover:bg-green-700 shadow-green-600/20" : "bg-primary text-primary-foreground border border-primary/20 hover:scale-[1.05]"}`}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {copied ? "Copied" : "Copy Artifact"}
                        </Button>
                      </div>
                      <CardContent className="p-0">
                        <textarea
                          readOnly
                          value={base64}
                          className="w-full h-[400px] bg-background/20 p-8 text-[11px] font-mono text-foreground/70 border-none resize-none focus:outline-none custom-scrollbar break-all leading-relaxed shadow-inner"
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl border-2 border-primary/5 bg-card">
                  <div className="bg-primary/10 p-5 border-b border-primary/10 flex items-center gap-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Artifact Metrics</h3>
                  </div>
                  <CardContent className="p-8 space-y-8">
                    {fileName && (
                      <div className="bg-background/20 p-5 rounded-2xl border border-primary/10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 leading-none">Source Label</p>
                        <p className="text-xs font-bold truncate text-primary">{fileName}</p>
                      </div>
                    )}
                    <div className="bg-background/20 p-5 rounded-2xl border border-primary/10">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 leading-none">String Weight</p>
                      <p className="text-3xl font-black italic tracking-tighter text-primary">{(base64.length / 1024).toFixed(1)} KB</p>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] group">
                        <div className="h-8 w-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 transition-transform group-hover:scale-110">
                          <Zap className="h-4 w-4" />
                        </div>
                        <span>Bit-Perfect Mapping</span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] group">
                        <div className="h-8 w-8 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <span>Encrypted Local Hub</span>
                      </div>
                    </div>

                  </CardContent>
                </Card>

                <div className="px-8 py-2">
                  <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic leading-relaxed">
                    Transform images into CSS/JS-ready data strings instantly. No server processing. No data leaks.
                  </p>
                </div>
              </aside>
            </div>

            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Base64 Image Converter"
              description="The Base64 Image Encoder is a specialized front-end utility that allows you to instantly convert standard image files (like JPG, PNG, GIF, or WebP) into portable Base64 Data URLs without relying on a remote server."
              transparency="This encoder leverages the native HTML5 FileReader API, meaning the entire image-to-text transformation happens strictly within the private confines of your local browser session. It's 100% secure for private design assets."
              limitations="However, please understand that Base64 encoding generally increases file size by about 33%. While embedding small icons is efficient, encoding massive high-resolution photographs can severely degrade website performance and may cause your browser tab to stall."
              accent="orange"
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

export default Base64Image;
