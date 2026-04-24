import React, { Suspense, lazy, useEffect } from "react";
import { preloadFFmpeg } from "@/lib/ffmpegSingleton";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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

const queryClient = new QueryClient();

// --- SSR-AWARE LAZY HELPER ---
// Uses Vite's glob import to force synchronous loading on the server, while keeping code-splitting on the client.
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
    <div className={`min-h-screen flex flex-col bg-background transition-theme duration-700 ${themeClass}`}>
      {children}
    </div>
  );
};

  const App = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Global search and category state
    const params = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
    const [searchQuery, setSearchQuery] = React.useState(() => (location.pathname === "/" ? params.get("search") ?? "" : ""));
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(() => (location.pathname === "/" ? params.get("category") ?? null : null));

    // Sync state when on home page
    React.useEffect(() => {
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
      } else if (cat) {
        navigate(`/?category=${encodeURIComponent(cat)}`);
      }
    }, [navigate, location.pathname, location.search]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ScrollToTop />
        <RedirectHandler />
        <SEOHead />
        <ErrorBoundary>
          <ThemeOrchestrator>
            <Navbar 
              darkMode={undefined as any} 
              onToggleDark={undefined as any} 
              searchQuery={searchQuery}
              setSearchQuery={handleSetSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleSetCategory}
            />
            <main className="flex-grow flex flex-col">
              <Suspense fallback={<LoadingArtifact />}>
                <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <Index 
                        searchQuery={searchQuery}
                        setSearchQuery={handleSetSearchQuery}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={handleSetCategory}
                      />
                    </motion.div>
                  } />
                  <Route path="/universal-volume-booster" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Volume Booster"><UniversalVolumeBooster /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/text-case-formatter" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Text Case Formatter"><TextCaseFormatter /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/image-color-extractor" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Image Color Extractor"><ImageColorExtractor /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/universal-media-converter" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Media Converter"><UniversalMediaConverter /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/image-compressor" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Image Compressor"><ImageCompressor /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/perspective-tilter" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="3D Image Tilt"><PerspectiveTilter /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/youtube-thumbnail-hub" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="YouTube Thumbnail Hub"><YouTubeThumbnailHub /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/sprite-studio" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Sprite Studio"><SpriteStudio /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/audio-trimmer" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Audio Trimmer"><AudioTrimmer /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/metadata-scrubber" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Metadata Scrubber"><MetadataScrubber /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/video-to-gif" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Video to GIF"><VideoToGif /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/frame-extractor" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Frame Extractor"><FrameExtractor /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/video-aspect-studio" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Video Aspect Studio"><VideoAspectStudio /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/json-studio" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="JSON Formatter"><JsonForge /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/data-transformer" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Data Transformer"><CsvJsonForge /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/qr-forge" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="QR Forge"><QrForge /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/pii-masker" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="PII Masker"><PiiMasker /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/svg-optimizer" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="SVG Optimizer"><SvgOptimizer /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/svg-to-image" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="SVG to Image"><SvgToImage /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/image-to-pdf" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Image to PDF"><ImageToPdf /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/text-diff-checker" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Text Diff Checker"><TextDiffChecker /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/quick-clipboard" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Quick Clipboard"><QuickClipboardHub /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/clipboard" element={<Navigate to="/quick-clipboard" replace />} />
                  <Route path="/jwt-decoder" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="JWT Decoder"><JwtDecoder /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/encoder-decoder" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Encoder / Decoder"><EncoderDecoder /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/timestamp-converter" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Timestamp Converter"><TimestampConverter /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/regex-playground" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Regex Playground"><RegexPlayground /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/lorem-generator" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Lorem Generator"><LoremGenerator /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/password-generator" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Password Generator"><PasswordGenerator /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/palette-studio" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Palette Studio"><ColorPaletteGenerator /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/hash-lab" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Hash Lab"><HashLab /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/unit-converter" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Unit Converter"><UnitConverter /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/base64-image" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Image to Base64"><Base64Image /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/reverse-audio" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Reverse Audio"><ReverseAudio /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/binary-to-audio" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Binary to Audio"><BinaryToAudio /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/audio-mono-stereo" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Audio Mono / Stereo"><AudioMonoStereo /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/audio-bass-booster" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Audio Bass Booster"><BassBooster /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/privacy" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <PrivacyPolicy />
                    </motion.div>
                  } />
                  <Route path="/terms" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <TermsOfUse />
                    </motion.div>
                  } />
                  <Route path="/morse-code-master" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Morse Code Master"><MorseCodeMaster /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/slug-forge" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Slug Forge"><SlugForge /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/whitespace-scrubber" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Whitespace Scrubber"><WhitespaceScrubber /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/svg-to-ico" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="SVG to ICO"><SvgToIco /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/dice-lab" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <ErrorBoundary toolName="Dice Lab"><DiceLab /></ErrorBoundary>
                    </motion.div>
                  } />
                  <Route path="/security-architecture" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <SecurityArchitecture />
                    </motion.div>
                  } />
                  <Route path="/technical-architecture" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <TechnicalArchitecture />
                    </motion.div>
                  } />
                  <Route path="/about" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <AboutProject />
                    </motion.div>
                  } />
                  <Route path="/contact" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <Contact />
                    </motion.div>
                  } />
                  <Route path="/insights" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <Insights />
                    </motion.div>
                  } />
                  <Route path="/faq" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="page-motion-wrapper"
                    >
                      <Faq />
                    </motion.div>
                  } />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/word-counter" element={<WordCounter />} />
            </Routes>
              </AnimatePresence>
            </Suspense>
            </main>
          </ThemeOrchestrator>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

