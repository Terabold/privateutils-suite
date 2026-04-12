import React, { Suspense, lazy, useEffect } from "react";
import { preloadFFmpeg } from "@/lib/ffmpegSingleton";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
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
    <div className={`min-h-screen bg-background transition-theme duration-700 ${themeClass}`}>
      {children}
    </div>
  );
};

const App = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = setTimeout(preloadFFmpeg, 2000);
      return () => clearTimeout(t);
    }
  }, []);

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
            <Suspense fallback={<LoadingArtifact />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/universal-volume-booster" element={<UniversalVolumeBooster />} />
                <Route path="/text-case-formatter" element={<TextCaseFormatter />} />
                <Route path="/image-color-extractor" element={<ImageColorExtractor />} />
                <Route path="/universal-media-converter" element={<UniversalMediaConverter />} />
                <Route path="/image-compressor" element={<ImageCompressor />} />
                <Route path="/perspective-tilter" element={<PerspectiveTilter />} />
                <Route path="/youtube-thumbnail-hub" element={<YouTubeThumbnailHub />} />
                <Route path="/sprite-studio" element={<SpriteStudio />} />
                <Route path="/audio-trimmer" element={<AudioTrimmer />} />
                <Route path="/metadata-scrubber" element={<MetadataScrubber />} />
                <Route path="/video-to-gif" element={<VideoToGif />} />
                <Route path="/frame-extractor" element={<FrameExtractor />} />
                <Route path="/video-aspect-studio" element={<VideoAspectStudio />} />
                <Route path="/json-studio" element={<JsonForge />} />
                <Route path="/data-transformer" element={<CsvJsonForge />} />
                <Route path="/qr-forge" element={<QrForge />} />
                <Route path="/pii-masker" element={<PiiMasker />} />
                <Route path="/svg-optimizer" element={<SvgOptimizer />} />
                <Route path="/svg-to-image" element={<SvgToImage />} />
                <Route path="/image-to-pdf" element={<ImageToPdf />} />
                <Route path="/text-diff-checker" element={<TextDiffChecker />} />
                <Route path="/quick-clipboard" element={<QuickClipboardHub />} />
                <Route path="/clipboard" element={<Navigate to="/quick-clipboard" replace />} />
                <Route path="/jwt-decoder" element={<JwtDecoder />} />
                <Route path="/encoder-decoder" element={<EncoderDecoder />} />
                <Route path="/timestamp-converter" element={<TimestampConverter />} />
                <Route path="/regex-playground" element={<RegexPlayground />} />
                <Route path="/lorem-generator" element={<LoremGenerator />} />
                <Route path="/password-generator" element={<PasswordGenerator />} />
                <Route path="/palette-studio" element={<ColorPaletteGenerator />} />
                <Route path="/hash-lab" element={<HashLab />} />
                <Route path="/unit-converter" element={<UnitConverter />} />
                <Route path="/base64-image" element={<Base64Image />} />
                <Route path="/reverse-audio" element={<ReverseAudio />} />
                <Route path="/binary-to-audio" element={<BinaryToAudio />} />
                <Route path="/audio-mono-stereo" element={<AudioMonoStereo />} />
                <Route path="/audio-bass-booster" element={<BassBooster />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfUse />} />
                <Route path="/morse-code-master" element={<MorseCodeMaster />} />
                <Route path="/slug-forge" element={<SlugForge />} />
                <Route path="/whitespace-scrubber" element={<WhitespaceScrubber />} />
                <Route path="/svg-to-ico" element={<SvgToIco />} />
                <Route path="/dice-lab" element={<DiceLab />} />
                <Route path="/security-architecture" element={<SecurityArchitecture />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ThemeOrchestrator>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

