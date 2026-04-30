import React, { Suspense, lazy, useEffect } from "react";
import { preloadFFmpeg } from "@/lib/ffmpegSingleton";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import ScrollToTop from "./components/ScrollToTop";
import SEOHead from "./components/SEOHead";
import RedirectHandler from "./components/RedirectHandler";
import ErrorBoundary from "./components/ErrorBoundary";
import { tools } from "./components/ToolsGrid";
import { categoryConfig } from "./config/categories";
import Navbar from "./components/Navbar";
import PageTransition from "./components/PageTransition";
import GlobalControlHelp from "./components/GlobalControlHelp";

const queryClient = new QueryClient();

// SSR-safe AnimatePresence: framer-motion's AnimatePresence with mode="wait" returns null
// during renderToString because useLayoutEffect is a no-op in SSR, causing the entire Routes
// tree to be skipped. This wrapper bypasses animation on the server so pages render correctly.
const SSRAnimatePresence = import.meta.env.SSR
  ? ({ children }: { children: React.ReactNode }) => <>{children}</>
  : ({ children }: { children: React.ReactNode }) => <AnimatePresence mode="wait">{children}</AnimatePresence>;

// --- SSR-AWARE LAZY HELPER ---
const eagerPages = import.meta.env.SSR ? import.meta.glob('./pages/*.tsx', { eager: true }) : {};

const ssrLazy = (filename: string, importFn: () => Promise<any>) => {
  if (import.meta.env.SSR) {
    const module = eagerPages[`./pages/${filename}`] as any;
    return module ? module.default : () => null;
  }
  return lazy(importFn);
};

// --- ARTIFACT IMPORTS ---
const Index = ssrLazy("Index.tsx", () => import("./pages/Index.tsx"));
const UniversalVolumeBooster = ssrLazy("UniversalVolumeBooster.tsx", () => import("./pages/UniversalVolumeBooster.tsx"));
const TextCaseFormatter = ssrLazy("TextCaseFormatter.tsx", () => import("./pages/TextCaseFormatter.tsx"));
const ImageColorExtractor = ssrLazy("ImageColorExtractor.tsx", () => import("./pages/ImageColorExtractor.tsx"));
const UniversalMediaConverter = ssrLazy("UniversalMediaConverter.tsx", () => import("./pages/UniversalMediaConverter.tsx"));
const ImageCompressor = ssrLazy("ImageCompressor.tsx", () => import("./pages/ImageCompressor.tsx"));
const PerspectiveTilter = ssrLazy("PerspectiveTilter.tsx", () => import("./pages/PerspectiveTilter.tsx"));
const YouTubeThumbnailHub = ssrLazy("YouTubeThumbnailHub.tsx", () => import("./pages/YouTubeThumbnailHub.tsx"));
const SpriteStudio = ssrLazy("SpriteStudio.tsx", () => import("./pages/SpriteStudio.tsx"));
const MetadataScrubber = ssrLazy("MetadataScrubber.tsx", () => import("./pages/MetadataScrubber.tsx"));
const AudioTrimmer = ssrLazy("AudioTrimmer.tsx", () => import("./pages/AudioTrimmer.tsx"));
const VideoToGif = ssrLazy("VideoToGif.tsx", () => import("./pages/VideoToGif.tsx"));
const FrameExtractor = ssrLazy("FrameExtractor.tsx", () => import("./pages/FrameExtractor.tsx"));
const VideoAspectStudio = ssrLazy("VideoAspectStudio.tsx", () => import("./pages/VideoAspectStudio.tsx"));
const JsonForge = ssrLazy("JsonForge.tsx", () => import("./pages/JsonForge.tsx"));
const CsvJsonForge = ssrLazy("CsvJsonForge.tsx", () => import("./pages/CsvJsonForge.tsx"));
const QrForge = ssrLazy("QrForge.tsx", () => import("./pages/QrForge.tsx"));
const PiiMasker = ssrLazy("PiiMasker.tsx", () => import("./pages/PiiMasker.tsx"));
const SvgOptimizer = ssrLazy("SvgOptimizer.tsx", () => import("./pages/SvgOptimizer.tsx"));
const SvgToImage = ssrLazy("SvgToImage.tsx", () => import("./pages/SvgToImage.tsx"));
const ImageToPdf = ssrLazy("ImageToPdf.tsx", () => import("./pages/ImageToPdf.tsx"));
const TextDiffChecker = ssrLazy("TextDiffChecker.tsx", () => import("./pages/TextDiffChecker.tsx"));
const QuickClipboardHub = ssrLazy("QuickClipboardHub.tsx", () => import("./pages/QuickClipboardHub.tsx"));
const JwtDecoder = ssrLazy("JwtDecoder.tsx", () => import("./pages/JwtDecoder.tsx"));
const EncoderDecoder = ssrLazy("EncoderDecoder.tsx", () => import("./pages/EncoderDecoder.tsx"));
const TimestampConverter = ssrLazy("TimestampConverter.tsx", () => import("./pages/TimestampConverter.tsx"));
const RegexPlayground = ssrLazy("RegexPlayground.tsx", () => import("./pages/RegexPlayground.tsx"));
const LoremGenerator = ssrLazy("LoremGenerator.tsx", () => import("./pages/LoremGenerator.tsx"));
const PasswordGenerator = ssrLazy("PasswordGenerator.tsx", () => import("./pages/PasswordGenerator.tsx"));
const ColorPaletteGenerator = ssrLazy("ColorPaletteGenerator.tsx", () => import("./pages/ColorPaletteGenerator.tsx"));
const HashLab = ssrLazy("HashLab.tsx", () => import("./pages/HashLab.tsx"));
const UnitConverter = ssrLazy("UnitConverter.tsx", () => import("./pages/UnitConverter.tsx"));
const Base64Image = ssrLazy("Base64Image.tsx", () => import("./pages/Base64Image.tsx"));
const ReverseAudio = ssrLazy("ReverseAudio.tsx", () => import("./pages/ReverseAudio.tsx"));
const BinaryToAudio = ssrLazy("BinaryToAudio.tsx", () => import("./pages/BinaryToAudio.tsx"));
const AudioMonoStereo = ssrLazy("AudioMonoStereo.tsx", () => import("./pages/AudioMonoStereo.tsx"));
const BassBooster = ssrLazy("BassBooster.tsx", () => import("./pages/BassBooster.tsx"));
const PrivacyPolicy = ssrLazy("PrivacyPolicy.tsx", () => import("./pages/PrivacyPolicy.tsx"));
const TermsOfUse = ssrLazy("TermsOfUse.tsx", () => import("./pages/TermsOfUse.tsx"));
const MorseCodeMaster = ssrLazy("MorseCodeMaster.tsx", () => import("./pages/MorseCodeMaster.tsx"));
const SlugForge = ssrLazy("SlugForge.tsx", () => import("./pages/SlugForge.tsx"));
const WhitespaceScrubber = ssrLazy("WhitespaceScrubber.tsx", () => import("./pages/WhitespaceScrubber.tsx"));
const SvgToIco = ssrLazy("SvgToIco.tsx", () => import("./pages/SvgToIco.tsx"));
const DiceLab = ssrLazy("DiceLab.tsx", () => import("./pages/DiceLab.tsx"));
const SecurityArchitecture = ssrLazy("SecurityArchitecture.tsx", () => import("./pages/SecurityArchitecture.tsx"));
const Faq = ssrLazy("Faq.tsx", () => import("./pages/Faq.tsx"));
const AboutProject = ssrLazy("AboutProject.tsx", () => import("./pages/AboutProject.tsx"));
const TechnicalArchitecture = ssrLazy("TechnicalArchitecture.tsx", () => import("./pages/TechnicalArchitecture.tsx"));
const Contact = ssrLazy("Contact.tsx", () => import("./pages/Contact.tsx"));
const Insights = ssrLazy("Insights.tsx", () => import("./pages/Insights.tsx"));
const NotFound = ssrLazy("NotFound.tsx", () => import("./pages/NotFound.tsx"));

const LoadingArtifact = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-6 animate-pulse">
      <div className="h-16 w-16 bg-primary/10 rounded-2xl border-2 border-dashed border-primary/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-xl font-black tracking-tighter uppercase italic text-foreground opacity-80">Loading Forge Artifact...</p>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-2">Allocating Native Memory</p>
      </div>
    </div>
  </div>
);

const WordCounter = lazy(() => import("./pages/WordCounter"));

const ThemeOrchestrator = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const themeClass = React.useMemo(() => {
    const normalizedPath = location.pathname === "/" ? "/" : location.pathname.replace(/\/$/, "");
    if (normalizedPath === "/") return "theme-all";
    const tool = tools.find(t => t.to === normalizedPath);
    if (tool && tool.category && categoryConfig[tool.category]) {
      return categoryConfig[tool.category].themeClass;
    }
    return "theme-all";
  }, [location.pathname]);

  return (
    <div className={`h-screen w-full flex flex-col bg-background transition-theme duration-700 overflow-hidden ${themeClass}`}>
      {children}
    </div>
  );
};

import { useDarkMode } from "@/hooks/useDarkMode";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDark } = useDarkMode();

  // Global search and category state
  const params = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [searchQuery, setSearchQuery] = React.useState(() => (location.pathname === "/" ? params.get("search") ?? "" : ""));
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(() => (location.pathname === "/" ? params.get("category") ?? null : null));

  // Sync state when on home page
  useEffect(() => {
    if (location.pathname === "/") {
      setSearchQuery(params.get("search") ?? "");
      const cat = params.get("category");
      setSelectedCategory(cat === "All" ? null : cat);
    }
  }, [location.pathname, params]);

  const handleSetSearchQuery = React.useCallback((q: string) => {
    setSearchQuery(q);
    if (location.pathname === "/") {
      const p = new URLSearchParams(location.search);
      if (q) p.set("search", q); else p.delete("search");
      navigate(`/?${p.toString()}`, { replace: true });
    } else if (q) {
      navigate(`/?search=${encodeURIComponent(q)}`);
    }
  }, [navigate, location.pathname, location.search]);

  const handleSetCategory = React.useCallback((cat: string | null) => {
    setSelectedCategory(cat);
    if (location.pathname === "/") {
      const p = new URLSearchParams(location.search);
      if (cat) p.set("category", cat); else p.delete("category");
      navigate(`/?${p.toString()}`, { replace: true });
    }
  }, [navigate, location.pathname, location.search]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GlobalControlHelp />
        <ScrollToTop />
        <RedirectHandler />
        <SEOHead />
        <ErrorBoundary>
          <ThemeOrchestrator>
            <Navbar 
              darkMode={darkMode}
              onToggleDark={toggleDark}
              searchQuery={searchQuery}
              setSearchQuery={handleSetSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleSetCategory}
            />
            <main id="app-main-scroll" className="flex-grow overflow-y-auto overflow-x-hidden relative scroll-smooth">
              <Suspense fallback={<LoadingArtifact />}>
                <SSRAnimatePresence>
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={
                      <PageTransition>
                        <Index 
                          searchQuery={searchQuery}
                          setSearchQuery={handleSetSearchQuery}
                          selectedCategory={selectedCategory}
                          setSelectedCategory={handleSetCategory}
                        />
                      </PageTransition>
                    } />
                    
                    {/* Tool Routes */}
                    <Route path="/universal-volume-booster" element={<PageTransition><ErrorBoundary toolName="Volume Booster"><UniversalVolumeBooster /></ErrorBoundary></PageTransition>} />
                    <Route path="/text-case-formatter" element={<PageTransition><ErrorBoundary toolName="Text Case"><TextCaseFormatter /></ErrorBoundary></PageTransition>} />
                    <Route path="/image-color-extractor" element={<PageTransition><ErrorBoundary toolName="Image Colors"><ImageColorExtractor /></ErrorBoundary></PageTransition>} />
                    <Route path="/universal-media-converter" element={<PageTransition><ErrorBoundary toolName="Media Converter"><UniversalMediaConverter /></ErrorBoundary></PageTransition>} />
                    <Route path="/image-compressor" element={<PageTransition><ErrorBoundary toolName="Image Compressor"><ImageCompressor /></ErrorBoundary></PageTransition>} />
                    <Route path="/perspective-tilter" element={<PageTransition><ErrorBoundary toolName="Perspective Tilt"><PerspectiveTilter /></ErrorBoundary></PageTransition>} />
                    <Route path="/youtube-thumbnail-hub" element={<PageTransition><ErrorBoundary toolName="YouTube Thumbnail"><YouTubeThumbnailHub /></ErrorBoundary></PageTransition>} />
                    <Route path="/sprite-studio" element={<PageTransition><ErrorBoundary toolName="Sprite Studio"><SpriteStudio /></ErrorBoundary></PageTransition>} />
                    <Route path="/metadata-scrubber" element={<PageTransition><ErrorBoundary toolName="Metadata Scrubber"><MetadataScrubber /></ErrorBoundary></PageTransition>} />
                    <Route path="/audio-trimmer" element={<PageTransition><ErrorBoundary toolName="Audio Trimmer"><AudioTrimmer /></ErrorBoundary></PageTransition>} />
                    <Route path="/video-to-gif" element={<PageTransition><ErrorBoundary toolName="Video to GIF"><VideoToGif /></ErrorBoundary></PageTransition>} />
                    <Route path="/frame-extractor" element={<PageTransition><ErrorBoundary toolName="Frame Extractor"><FrameExtractor /></ErrorBoundary></PageTransition>} />
                    <Route path="/video-aspect-studio" element={<PageTransition><ErrorBoundary toolName="Video Aspect"><VideoAspectStudio /></ErrorBoundary></PageTransition>} />
                    <Route path="/json-studio" element={<PageTransition><ErrorBoundary toolName="JSON Studio"><JsonForge /></ErrorBoundary></PageTransition>} />
                    <Route path="/data-transformer" element={<PageTransition><ErrorBoundary toolName="Data Transformer"><CsvJsonForge /></ErrorBoundary></PageTransition>} />
                    <Route path="/qr-forge" element={<PageTransition><ErrorBoundary toolName="QR Forge"><QrForge /></ErrorBoundary></PageTransition>} />
                    <Route path="/pii-masker" element={<PageTransition><ErrorBoundary toolName="PII Masker"><PiiMasker /></ErrorBoundary></PageTransition>} />
                    <Route path="/svg-optimizer" element={<PageTransition><ErrorBoundary toolName="SVG Optimizer"><SvgOptimizer /></ErrorBoundary></PageTransition>} />
                    <Route path="/svg-to-image" element={<PageTransition><ErrorBoundary toolName="SVG to Image"><SvgToImage /></ErrorBoundary></PageTransition>} />
                    <Route path="/image-to-pdf" element={<PageTransition><ErrorBoundary toolName="Image to PDF"><ImageToPdf /></ErrorBoundary></PageTransition>} />
                    <Route path="/text-diff-checker" element={<PageTransition><ErrorBoundary toolName="Text Diff"><TextDiffChecker /></ErrorBoundary></PageTransition>} />
                    <Route path="/quick-clipboard" element={<PageTransition><ErrorBoundary toolName="Quick Clipboard"><QuickClipboardHub /></ErrorBoundary></PageTransition>} />
                    <Route path="/jwt-decoder" element={<PageTransition><ErrorBoundary toolName="JWT Decoder"><JwtDecoder /></ErrorBoundary></PageTransition>} />
                    <Route path="/encoder-decoder" element={<PageTransition><ErrorBoundary toolName="Encoder/Decoder"><EncoderDecoder /></ErrorBoundary></PageTransition>} />
                    <Route path="/timestamp-converter" element={<PageTransition><ErrorBoundary toolName="Timestamp Converter"><TimestampConverter /></ErrorBoundary></PageTransition>} />
                    <Route path="/regex-playground" element={<PageTransition><ErrorBoundary toolName="Regex Playground"><RegexPlayground /></ErrorBoundary></PageTransition>} />
                    <Route path="/lorem-generator" element={<PageTransition><ErrorBoundary toolName="Lorem Generator"><LoremGenerator /></ErrorBoundary></PageTransition>} />
                    <Route path="/password-generator" element={<PageTransition><ErrorBoundary toolName="Password Generator"><PasswordGenerator /></ErrorBoundary></PageTransition>} />
                    <Route path="/palette-studio" element={<PageTransition><ErrorBoundary toolName="Palette Studio"><ColorPaletteGenerator /></ErrorBoundary></PageTransition>} />
                    <Route path="/hash-lab" element={<PageTransition><ErrorBoundary toolName="Hash Lab"><HashLab /></ErrorBoundary></PageTransition>} />
                    <Route path="/unit-converter" element={<PageTransition><ErrorBoundary toolName="Unit Converter"><UnitConverter /></ErrorBoundary></PageTransition>} />
                    <Route path="/base64-image" element={<PageTransition><ErrorBoundary toolName="Base64 Image"><Base64Image /></ErrorBoundary></PageTransition>} />
                    <Route path="/reverse-audio" element={<PageTransition><ErrorBoundary toolName="Reverse Audio"><ReverseAudio /></ErrorBoundary></PageTransition>} />
                    <Route path="/binary-to-audio" element={<PageTransition><ErrorBoundary toolName="Binary to Audio"><BinaryToAudio /></ErrorBoundary></PageTransition>} />
                    <Route path="/audio-mono-stereo" element={<PageTransition><ErrorBoundary toolName="Mono/Stereo"><AudioMonoStereo /></ErrorBoundary></PageTransition>} />
                    <Route path="/audio-bass-booster" element={<PageTransition><ErrorBoundary toolName="Bass Booster"><BassBooster /></ErrorBoundary></PageTransition>} />
                    <Route path="/morse-code-master" element={<PageTransition><ErrorBoundary toolName="Morse Code"><MorseCodeMaster /></ErrorBoundary></PageTransition>} />
                    <Route path="/slug-forge" element={<PageTransition><ErrorBoundary toolName="Slug Forge"><SlugForge /></ErrorBoundary></PageTransition>} />
                    <Route path="/whitespace-scrubber" element={<PageTransition><ErrorBoundary toolName="Whitespace Scrubber"><WhitespaceScrubber /></ErrorBoundary></PageTransition>} />
                    <Route path="/svg-to-ico" element={<PageTransition><ErrorBoundary toolName="SVG to ICO"><SvgToIco /></ErrorBoundary></PageTransition>} />
                    <Route path="/dice-lab" element={<PageTransition><ErrorBoundary toolName="Dice Lab"><DiceLab /></ErrorBoundary></PageTransition>} />
                    <Route path="/word-counter" element={<PageTransition><ErrorBoundary toolName="Word Counter"><WordCounter /></ErrorBoundary></PageTransition>} />

                    {/* Info Pages */}
                    <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
                    <Route path="/terms" element={<PageTransition><TermsOfUse /></PageTransition>} />
                    <Route path="/security-architecture" element={<PageTransition><SecurityArchitecture /></PageTransition>} />
                    <Route path="/faq" element={<PageTransition><Faq /></PageTransition>} />
                    <Route path="/about" element={<PageTransition><AboutProject /></PageTransition>} />
                    <Route path="/technical-architecture" element={<PageTransition><TechnicalArchitecture /></PageTransition>} />
                    <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
                    <Route path="/insights" element={<PageTransition><Insights /></PageTransition>} />
                    
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </SSRAnimatePresence>
              </Suspense>
            </main>
          </ThemeOrchestrator>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
