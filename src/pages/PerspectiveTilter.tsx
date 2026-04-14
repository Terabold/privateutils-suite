import { useState, useCallback, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, CloudUpload, Eye, EyeOff, RefreshCw, Scale, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

const PerspectiveTilter = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [image, setImage] = useState<string | null>(null);
  const [rotateY, setRotateY] = useState(-15);
  const [rotateX, setRotateX] = useState(20);
  const [perspective, setPerspective] = useState(1000);
  const [scale, setScale] = useState(1);
  const [percentX, setPercentX] = useState(50);
  const [percentY, setPercentY] = useState(50);

  const [renderWidth, setRenderWidth] = useState(1920);
  const [renderHeight, setRenderHeight] = useState(1080);
  const [nativeWidth, setNativeWidth] = useState(1920);
  const [nativeHeight, setNativeHeight] = useState(1080);
  const [scalingMode, setScalingMode] = useState<"contain" | "cover" | "fill">("contain");

  const [borderWidth, setBorderWidth] = useState(2);
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [borderRadius, setBorderRadius] = useState(12);
  const [stageColor, setStageColor] = useState("#00000000");
  const [shadowBlur, setShadowBlur] = useState(40);
  const [shadowColor, setShadowColor] = useState("rgba(0,0,0,0.4)");
  const [enableShadow, setEnableShadow] = useState(false);
  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(20);

  const [dragMode, setDragMode] = useState<"pan" | "resize-br" | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startState, setStartState] = useState({ px: 50, py: 50, w: 1920, h: 1080 });

  const [processing, setProcessing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleMouseDown = (e: React.MouseEvent, mode: "pan" | "resize-br") => {
    if (!image) return;
    e.stopPropagation();
    setDragMode(mode);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartState({ px: percentX, py: percentY, w: renderWidth, h: renderHeight });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragMode || !stageRef.current) return;
    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;

    if (dragMode === "pan") {
      setPercentX(startState.px + (dx / stageRef.current.clientWidth) * 100);
      setPercentY(startState.py + (dy / stageRef.current.clientHeight) * 100);
    } else if (dragMode === "resize-br") {
      setRenderWidth(Math.max(10, Math.round(startState.w + dx * 3)));
      setRenderHeight(Math.max(10, Math.round(startState.h + dy * 3)));
    }
  };

  const handleMouseUp = () => setDragMode(null);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setNativeWidth(img.width);
        setNativeHeight(img.height);
        setRenderWidth(Math.round(img.width * 1.25));
        setRenderHeight(Math.round(img.height * 1.25));
        setImage(url);
        resetTilt();
      };
    };
    reader.readAsDataURL(f);
  };

  usePasteFile(handleFile);

  const resetTilt = () => {
    setRotateY(0);
    setRotateX(0);
    setPerspective(1000);
    setScale(0.7);
    setPercentX(50);
    setPercentY(50);
  };

  const download = async () => {
    if (!image || !stageRef.current) return;
    setProcessing(true);

    try {
      // We calculate a scale multiplier to export the responsive DOM at the upscaled output resolution.
      const scaleMultiplier = renderWidth / stageRef.current.offsetWidth;

      const dataUrl = await toPng(stageRef.current, {
        pixelRatio: scaleMultiplier,
        cacheBust: true,
        backgroundColor: 'rgba(0,0,0,0)',
        style: {
          // Reset any visual scale and ensure it's captured at native aspect ratio
          transform: 'scale(1)',
          transformOrigin: 'top left',
          background: stageColor === "#00000000" ? 'transparent' : stageColor,
        },
      });

      const link = document.createElement("a");
      link.download = `localtools-3d-tilt-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      setProcessing(false);
      toast.success("3D Artifact Captured Successfully");
    } catch (err) {
      console.error("Capture Error:", err);
      setProcessing(false);
      toast.error("Render Engine Error. Please try a smaller dimension.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1400px] px-6 py-6 grow">
          <div className="flex flex-col gap-6">
            <header className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Link to="/">
                  <Button aria-label="Go back to home" variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow">
                    3D Perspective <span className="text-primary italic">Tilter</span>
                  </h1>
                  <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">3D Transformation & Depth Engine</p>
                </div>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start">
              {/* Main Stage */}
              <div className="flex flex-col gap-8">
                <Card className={`glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 ${!image ? 'hover:border-primary/30 p-10' : ''}`}>
                  {!image ? (
                    <div
                      onClick={() => inputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFile(e.dataTransfer.files[0]); }}
                      className="relative w-full aspect-video flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all duration-300 cursor-pointer bg-primary/5 hover:border-primary/40 hover:bg-primary/10 hover:scale-[1.02] shadow-inner group"
                    >
                      <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                        <CloudUpload className="h-10 w-10 text-primary" />
                      </div>
                      <div className="px-6 space-y-1">
                        <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Hub Artifact</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">or click to browse</p>
                        <KbdShortcut />
                        <p className="mt-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-20">PNG, JPG, SVG, WEBP ARE SUPPORTED</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      ref={stageRef}
                      className="w-full aspect-video relative flex items-center justify-center select-none bg-muted/5 rounded-2xl border-2 border-border/20 overflow-visible transition-all hover:bg-muted/10 studio-gradient-dark shadow-2xl"
                      style={{
                        background: stageColor,
                        padding: '10%', // Internal "Safe Zone" improved
                      }}
                    >
                      <div
                        className="w-full h-full preserve-3d flex items-center justify-center"
                        style={{
                          perspective: `${perspective}px`,
                          left: `${percentX}%`,
                          top: `${percentY}%`,
                          position: 'absolute',
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div
                          className="preserve-3d flex items-center justify-center p-4"
                          style={{
                            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
                            // Ensure this rotated container doesn't clip its own shadow
                            overflow: 'visible'
                          }}
                        >
                          <div
                            className="transition-all duration-300"
                            style={{
                              boxShadow: enableShadow ? `0px ${shadowBlur / 2}px ${shadowBlur}px rgba(0,0,0, 0.5)` : 'none',
                              border: `${borderWidth}px ${borderStyle} ${borderColor}`,
                              borderRadius: `${borderRadius}px`,
                              // overflow: 'hidden' is critical if the user has borderRadius
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'transparent'
                            }}
                          >
                            <img
                              onLoad={() => setProcessing(false)}
                              src={image}
                              alt="Tilting Artifact"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                display: 'block'
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Interactive Dimension Label */}
                      <div className="absolute -top-12 left-0 px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-2xl transition-opacity animate-in fade-in duration-1000">
                        {renderWidth} × {renderHeight} <span className="text-primary opacity-60 ml-2">Final Output Preview</span>
                      </div>
                    </div>
                  )}
                  {image && (
                    <div className="absolute top-6 right-6 z-50 flex gap-2">
                      {/* Floating buttons removed as they are now in the Calibration sidebar header */}
                    </div>
                  )}
                  <input
                    ref={inputRef}
                    type="file"
                    id="tilter-upload-input"
                    name="tilter-upload-input"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      handleFile(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </Card>
              </div>

              {/* Settings Sidebar */}
              <aside className="space-y-8 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                  <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center justify-between gap-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Capture Calibration</h3>
                    {image && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Button
                          onClick={() => inputRef.current?.click()}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:bg-primary/10 rounded-lg group"
                          title="Change Image"
                        >
                          <RefreshCw className="h-3 w-3 mr-1 opacity-60 group-hover:opacity-100 transition-all" />
                          Change
                        </Button>
                        <Button
                          onClick={resetTilt}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[8px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-lg group"
                          title="Reset Tilt"
                        >
                          <RotateCcw className="h-3 w-3 mr-1 opacity-60 group-hover:opacity-100 group-hover:rotate-[-120deg] transition-all" />
                          Reset
                        </Button>
                        <div className="w-[1px] h-3 bg-primary/20 mx-0.5" />
                        <Button
                          onClick={() => setImage(null)}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[8px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 rounded-lg group"
                          title="Delete Artifact"
                        >
                          <Trash2 className="h-3 w-3 mr-1 opacity-60 group-hover:opacity-100" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-shadow-none">
                      {/* Left Column: Dimensions & Rotations */}
                      <div className="space-y-3">
                        <div className="space-y-2 pb-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary leading-none block mb-1.5 italic">Output Resolution</label>
                          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3 flex items-center justify-between shadow-inner">
                            <div className="space-y-1">
                              <p className="text-[8px] font-black uppercase opacity-40 text-muted-foreground">Target Extraction</p>
                              <p className="text-sm font-display font-black italic tracking-tight">{renderWidth} × {renderHeight}</p>
                            </div>
                            <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center">
                              <Scale className="h-4 w-4 text-primary opacity-60" />
                            </div>
                          </div>
                          <p className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest leading-tight">
                            Auto-upscaled (+25%) for safety.
                          </p>
                        </div>

                        <div className="space-y-3 border-t border-primary/5 pt-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 leading-none block">Pitch & Yaw</label>
                          <div>
                            <div className="flex justify-between items-end w-full mb-1 gap-4">
                              <label htmlFor="tilter-pitch-slider" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 whitespace-nowrap cursor-pointer">Pitch (X)</label>
                              <span className="text-primary text-[10px] font-black">{rotateX}°</span>
                            </div>
                            <Slider id="tilter-pitch-slider" name="tilter-pitch-slider" min={-90} max={90} step={1} value={[rotateX]} onValueChange={([v]) => setRotateX(v)} className="py-1" />
                          </div>

                          <div>
                            <div className="flex justify-between items-end w-full mb-1 gap-4">
                              <label htmlFor="tilter-yaw-slider" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 whitespace-nowrap cursor-pointer">Yaw (Y)</label>
                              <span className="text-primary text-[10px] font-black">{rotateY}°</span>
                            </div>
                            <Slider id="tilter-yaw-slider" name="tilter-yaw-slider" min={-90} max={90} step={1} value={[rotateY]} onValueChange={([v]) => setRotateY(v)} className="py-1" />
                          </div>
                        </div>

                        <div className="space-y-3 border-t border-primary/5 pt-1.5">
                          <div className="flex justify-between items-end w-full mb-1 gap-4">
                            <label htmlFor="tilter-radius-slider" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 whitespace-nowrap text-primary/60 cursor-pointer">Border Radius</label>
                            <span className="text-primary text-[10px] font-black">{borderRadius}px</span>
                          </div>
                          <Slider id="tilter-radius-slider" name="tilter-radius-slider" min={0} max={200} step={1} value={[borderRadius]} onValueChange={([v]) => setBorderRadius(v)} className="py-1" />
                        </div>
                      </div>

                      {/* Right Column: Zoom, Fit & Shadow */}
                      <div className="space-y-3">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary leading-none block italic">Perspective & Fit</label>
                          <div>
                            <div className="flex justify-between items-end w-full mb-1 gap-4">
                              <label htmlFor="tilter-zoom-slider" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 whitespace-nowrap cursor-pointer">Zoom</label>
                              <span className="text-primary text-[10px] font-black">{scale.toFixed(2)}x</span>
                            </div>
                            <Slider id="tilter-zoom-slider" name="tilter-zoom-slider" min={0.1} max={3} step={0.01} value={[scale]} onValueChange={([v]) => setScale(v)} className="py-1" />
                          </div>

                          <div>
                            <div className="flex justify-between items-end w-full mb-1 gap-4">
                              <label htmlFor="tilter-depth-slider" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 whitespace-nowrap cursor-pointer">Depth</label>
                              <span className="text-primary text-[10px] font-black">{perspective}px</span>
                            </div>
                            <Slider id="tilter-depth-slider" name="tilter-depth-slider" min={200} max={2000} step={1} value={[perspective]} onValueChange={([v]) => setPerspective(v)} className="py-1" />
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-primary/5 pt-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none block">Fit Mode</label>
                          <div className="grid grid-cols-3 gap-2">
                            {["contain", "cover", "fill"].map((m) => (
                              <button
                                key={m}
                                onClick={() => setScalingMode(m as any)}
                                className={`py-1 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${scalingMode === m ? "bg-primary border-primary text-white shadow-lg" : "border-border/50 hover:bg-primary/5 text-muted-foreground"}`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Shadows */}
                        <div className="space-y-3 border-t border-primary/5 pt-1.5">
                          <div className="flex justify-between items-center bg-primary/5 p-2 rounded-xl border border-primary/10">
                            <div className="space-y-0.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary leading-none">Enable Shadow</label>
                              <p className="text-[8px] text-muted-foreground font-black uppercase opacity-40">Shadow Engine</p>
                            </div>
                            <Switch
                              id="tilter-shadow-toggle"
                              name="tilter-shadow-toggle"
                              checked={enableShadow}
                              onCheckedChange={setEnableShadow}
                              className="data-[state=checked]:bg-primary scale-90"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-end w-full mb-0.5 gap-4">
                              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 whitespace-nowrap">Shadow Blur</label>
                              <span className="text-primary text-[10px] font-black">{shadowBlur}px</span>
                            </div>
                            <Slider id="tilter-blur-slider" name="tilter-blur-slider" min={0} max={300} step={1} value={[shadowBlur]} onValueChange={([v]) => setShadowBlur(v)} disabled={!enableShadow} className="py-1" />
                          </div>
                        </div>
                      </div>

                      {/* Custom Stage Color Picker */}
                      <div className="col-span-1 md:col-span-2 pt-2 mt-0.5 border-t border-border/10">
                        <label htmlFor="tilter-color-input" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic block mb-2 cursor-pointer">Stage Canvas Color</label>
                        <div className="flex gap-4">
                          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 flex-1">
                            {["#00000000", "#18181b", "#ffffff", "#f97316", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e", "#14b8a6"].map(c => (
                              <button
                                key={c}
                                onClick={() => setStageColor(c)}
                                title={c}
                                className={`h-10 rounded-xl border-2 transition-all hover:scale-105 ${stageColor === c ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-lg' : 'border-border/10'}`}
                                style={{ background: c === "#00000000" ? 'repeating-conic-gradient(#80808033 0% 25%, transparent 0% 50%) 50% / 10px 10px' : c }}
                              />
                            ))}
                          </div>
                          <div className="flex flex-col gap-2 w-32 justify-center pl-4 border-l border-border/10">
                            <Input
                              id="tilter-color-input"
                              name="tilter-color-input"
                              value={stageColor === "#00000000" ? "Alpha" : stageColor}
                              onChange={(e) => setStageColor(e.target.value)}
                              placeholder="#HEX"
                              className="text-xs font-black uppercase font-mono h-10 border-primary/20 text-center"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-border/20">
                      <Button onClick={download} disabled={!image || processing} className="w-full h-14 text-md font-black rounded-2xl gap-3 shadow-[0_0_30px_rgba(249,115,22,0.3)] italic uppercase tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all">
                        {processing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                        Extract Projection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="3D Perspective Studio"
              accent="emerald"
              overview="This tilter is a high-fidelity 3D transformation engine designed for digital architects and presentation designers. I built this tool to provide a browser-native path for generating depth-oriented UI mockups—eliminating the need for heavy desktop design software or privacy-compromising SaaS 'mockup generators' that often store your unreleased product shots."
              steps={[
                "Upload your flat UI artifact or application screenshot to the 3D studio stage.",
                "Adjust the 'Pitch' and 'Yaw' sliders to establish the target angular orientation.",
                "Calibrate the 'Perspective Depth' to simulate the focal distance and lens distortion.",
                "Enable the 'Shadow Engine' to anchor your artifact with a realistic ambient occlusion field.",
                "Extract the localized projection artifact directly from your device's hardware-accelerated GPU compositor."
              ]}
              technicalImplementation="I architected this engine using the CSS3 Transform-3D matrix specification, which offloads the intensive rotation math to the local GPU. The capture phase utilizes a specialized DOM-to-PNG engine that reconciles the 3D transformation matrix during the rasterization process. By calculating a recursive pixel-ratio multiplier based on the target dimensions, we ensure that the resulting artifact maintains sharp edges and high fidelity even at 4K production resolutions."
              privacyGuarantee="The Security & Privacy guarantee for this studio is absolute: zero-upload transformation. All 3D math and final pixel rasterization occur within your browser's secure sandbox. We do not utilize any cloud-side rendering farms. Since the engine is powered by your local hardware, your sensitive product designs remain entirely offline and are purged from the volatile memory upon closing the session."
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

export default PerspectiveTilter;
