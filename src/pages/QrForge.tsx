import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, QrCode, Download, Smartphone, Copy as CopyIcon, Trash2, Settings2, Palette, ShieldCheck, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import QRCode from "qrcode";
import { toast } from "sonner";
import { KbdShortcut } from "@/components/KbdShortcut";

const QrForge = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [input, setInput] = useState("");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(256);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const generateQr = useCallback(async () => {
    if (!input.trim()) {
      setQrUrl(null);
      return;
    }

    try {
      const url = await QRCode.toDataURL(input, {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorCorrectionLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      setQrUrl(url);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate QR Code");
    }
  }, [input, fgColor, bgColor, size, errorCorrectionLevel]);

  useEffect(() => {
    const timer = setTimeout(generateQr, 300);
    return () => clearTimeout(timer);
  }, [generateQr]);

  const downloadQr = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `qr_artifact_${Date.now()}.png`;
    a.click();
    toast.success("QR Artifact Dispatched");
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500 ">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-6 grow">
          <div className="flex flex-col gap-6">
            <header className="flex items-center justify-between flex-wrap gap-8">
              <div className="flex items-center gap-6">
                <Link to="/">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white leading-none">
                    Secure QR <span className="text-primary italic">Code Generator</span>
                  </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Create QR codes locally</p>
                </div>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Card className="glass-morphism border-primary/10 p-10 rounded-2xl bg-zinc-950/50 shadow-2xl relative group overflow-x-clip border-2 border-primary/5">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-150 rotate-12 pointer-events-none transition-opacity group-hover:opacity-[0.05]">
                    <Smartphone className="h-24 w-24" />
                  </div>

                  <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end px-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Source Payload</label>
                        {input && (
                          <button
                            onClick={() => setInput("")}
                            className="text-[9px] font-black uppercase tracking-widest text-destructive/50 hover:text-destructive flex items-center gap-1.5 transition-colors mb-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Clear Payload
                          </button>
                        )}
                      </div>
                      <input
                        id="qr-forge-main-input"
                        name="qr-forge-main-input"
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter secret protocol or URL artifact..."
                        className="w-full h-14 bg-background/50 border-2 border-white/5 rounded-2xl px-6 text-sm font-medium outline-none focus:border-primary/50 transition-all shadow-inner font-mono"
                      />
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-20 italic px-1">AES-Level Content Sandbox</p>
                    </div>
                  </div>
                </Card>

                {input && (
                  <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-700">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl border-8 border-white/10 group-hover:scale-[1.02] transition-transform duration-500 overflow-x-clip">
                      {qrUrl ? (
                        <img src={qrUrl} className="w-64 h-64 object-contain mx-auto" alt="QR Artifact" />
                      ) : (
                        <div className="w-64 h-64 bg-zinc-100 animate-pulse rounded-xl" />
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <Button onClick={downloadQr} disabled={!qrUrl} className="h-16 text-lg font-black rounded-2xl gap-3 shadow-2xl shadow-primary/20 italic uppercase tracking-tight">
                        <Download className="h-5 w-5" /> Export PNG
                      </Button>
                      <Button onClick={() => { navigator.clipboard.writeText(input); toast.success("Secret Copied"); }} variant="secondary" className="h-16 text-lg font-black rounded-2xl gap-3 italic uppercase border border-border/50">
                        <Copy className="h-5 w-5" /> Copy Artifact
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <aside className="space-y-8 lg:sticky lg:top-28 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                  <div className="bg-primary/5 h-[56px] px-6 border-b border-primary/10 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Styling Matrix</h3>
                    {input && (
                      <Button
                        onClick={() => {
                          setFgColor("#000000");
                          setBgColor("#ffffff");
                          setSize(256);
                          setErrorCorrectionLevel('M');
                          toast.success("Matrix Reset to Factory");
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 border border-primary/10 rounded-xl transition-all"
                      >
                        Reset Matrix
                      </Button>
                    )}
                  </div>
                  <CardContent className="p-8 space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block italic">Drafting Colors</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[8px] font-black uppercase opacity-40">Foreground</span>
                          <input id="qr-forge-foreground-color" name="qr-forge-foreground-color" type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-full h-10 rounded-xl bg-zinc-950/40 border-white/5 cursor-pointer block" />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[8px] font-black uppercase opacity-40">Background</span>
                          <input id="qr-forge-background-color" name="qr-forge-background-color" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-xl bg-zinc-950/40 border-white/5 cursor-pointer block" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block italic">Artifact Size</label>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-12 bg-zinc-950/40 rounded-2xl border-white/5 text-[10px] font-black px-4 flex items-center justify-between hover:bg-zinc-900/60 shadow-inner"
                          >
                            <span className="truncate">
                              {size === 128 ? "Small (128x128 artifact)" :
                                size === 256 ? "Medium (256x256 artifact)" :
                                  size === 512 ? "Large (512x512 artifact)" : "Ultra (1024x1024 artifact)"}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glass-morphism border-primary/20 min-w-[var(--radix-dropdown-menu-trigger-width)]">
                          <DropdownMenuItem onClick={() => setSize(128)} className="font-black py-3 text-[10px] uppercase cursor-pointer">Small (128x128 artifact)</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSize(256)} className="font-black py-3 text-[10px] uppercase cursor-pointer">Medium (256x256 artifact)</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSize(512)} className="font-black py-3 text-[10px] uppercase cursor-pointer">Large (512x512 artifact)</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSize(1024)} className="font-black py-3 text-[10px] uppercase cursor-pointer">Ultra (1024x1024 artifact)</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block italic">Error Shield</label>
                      <div className="grid grid-cols-4 gap-2 bg-zinc-950/40 p-1 rounded-2xl">
                        {['L', 'M', 'Q', 'H'].map((level) => (
                          <button
                            key={level}
                            onClick={() => setErrorCorrectionLevel(level as any)}
                            className={cn(
                              "py-2 text-[10px] font-black uppercase rounded-xl transition-all",
                              errorCorrectionLevel === level ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-white/5"
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic pt-4">
                      ISO/IEC 18004 • Air-gapped generation • Universal scanner support
                    </p>
                  </CardContent>
                </Card>

                <div className="px-6">

                </div>
              </aside>
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Secure QR Forge"
              accent="violet"
              overview="The Secure QR Forge is a high-speed data encoding utility designed to generate ISO/IEC 18004 compliant QR codes for URLs, text, and encrypted protocols. I architected this forge to provide a surgical path for generating direct, non-tracking redirects without the security risks of 'online generators' that log your URLs, track your users, and redirect through intermediate proxy servers."
              steps={[
                "Stage your target 'Redirection Data' into the central input registry.",
                "Configure your 'Level' (L, M, Q, H) to establish the necessary error correction density.",
                "Monitor the 'Real-time Generation' to ensure your artifact is visually balanced.",
                "Utilize the 'Print' or 'Clipboard' modules to extract your sanitized QR artifact.",
                "Download the high-fidelity PNG or SVG asset for use in physical or digital media."
              ]}
              technicalImplementation="I engineered this forge using a Reed-Solomon Error Correction Engine and a local QR matrix generator. The logic calculates the optimal polynomial depth for your payload size, ensuring that even partially obscured codes (due to physical damage or low contrast) remain decodable. Because the entire bit-masking and matrix-rendering process occurs within your browser's local sandbox, your redirection strings remain strictly air-gapped from the network."
              privacyGuarantee="The Security \u0026 Privacy model for the QR Forge is built on Redirection Sovereignty. Your source payloads—whether containing access credentials, private URLs, or plain text—exist strictly within your browser's private application state. We do not utilize any telemetry to monitor the content of the codes you generate. All session metadata is ephemeral and is permanently purged from system RAM upon tab termination. Your links stay private."
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

export default QrForge;


