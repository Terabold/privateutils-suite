import React, { Suspense, lazy, useEffect } from "react";
import { preloadFFmpeg } from "@/lib/ffmpegSingleton";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

// --- LAZY-LOADED CORE ARTIFACTS ---
const Index = lazy(() => import("./pages/Index.tsx"));
const UniversalVolumeBooster = lazy(() => import("./pages/UniversalVolumeBooster.tsx"));
const TextCaseFormatter = lazy(() => import("./pages/TextCaseFormatter.tsx"));
const ImageColorExtractor = lazy(() => import("./pages/ImageColorExtractor.tsx"));
const UniversalMediaConverter = lazy(() => import("./pages/UniversalMediaConverter.tsx"));
const ImageCompressor = lazy(() => import("./pages/ImageCompressor.tsx"));
const PerspectiveTilter = lazy(() => import("./pages/PerspectiveTilter.tsx"));
const YouTubeThumbnailHub = lazy(() => import("./pages/YouTubeThumbnailHub.tsx"));
const SpriteStudio = lazy(() => import("./pages/SpriteStudio.tsx"));
const MetadataScrubber = lazy(() => import("./pages/MetadataScrubber.tsx"));
const AudioTrimmer = lazy(() => import("./pages/AudioTrimmer.tsx"));
const VideoToGif = lazy(() => import("./pages/VideoToGif.tsx"));
const FrameExtractor = lazy(() => import("./pages/FrameExtractor.tsx"));
const VideoAspectStudio = lazy(() => import("./pages/VideoAspectStudio.tsx"));
const JsonForge = lazy(() => import("./pages/JsonForge.tsx"));
const CsvJsonForge = lazy(() => import("./pages/CsvJsonForge.tsx"));
const QrForge = lazy(() => import("./pages/QrForge.tsx"));
const PiiMasker = lazy(() => import("./pages/PiiMasker.tsx"));
const SvgOptimizer = lazy(() => import("./pages/SvgOptimizer.tsx"));
const SvgToImage = lazy(() => import("./pages/SvgToImage.tsx"));
const ImageToPdf = lazy(() => import("./pages/ImageToPdf.tsx"));
const TextDiffChecker = lazy(() => import("./pages/TextDiffChecker.tsx"));
const QuickClipboardHub = lazy(() => import("./pages/QuickClipboardHub.tsx"));
const JwtDecoder = lazy(() => import("./pages/JwtDecoder.tsx"));
const EncoderDecoder = lazy(() => import("./pages/EncoderDecoder.tsx"));
const TimestampConverter = lazy(() => import("./pages/TimestampConverter.tsx"));
const RegexPlayground = lazy(() => import("./pages/RegexPlayground.tsx"));
const LoremGenerator = lazy(() => import("./pages/LoremGenerator.tsx"));
const PasswordGenerator = lazy(() => import("./pages/PasswordGenerator.tsx"));
const ColorPaletteGenerator = lazy(() => import("./pages/ColorPaletteGenerator.tsx"));
const HashLab = lazy(() => import("./pages/HashLab.tsx"));
const UnitConverter = lazy(() => import("./pages/UnitConverter.tsx"));
const Base64Image = lazy(() => import("./pages/Base64Image"));
const ReverseAudio = lazy(() => import("./pages/ReverseAudio"));
const BinaryToAudio = lazy(() => import("./pages/BinaryToAudio"));
const AudioMonoStereo = lazy(() => import("./pages/AudioMonoStereo"));
const BassBooster = lazy(() => import("./pages/BassBooster"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const MorseCodeMaster = lazy(() => import("./pages/MorseCodeMaster.tsx"));
const SlugForge = lazy(() => import("./pages/SlugForge.tsx"));
const WhitespaceScrubber = lazy(() => import("./pages/WhitespaceScrubber.tsx"));
const DiceLab = lazy(() => import("./pages/DiceLab.tsx"));
const NotFound = lazy(() => import("./pages/NotFound"));

// --- LOADING FALLBACK ARTIFACT ---
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

import { tools } from "./components/ToolsGrid";
import { categoryConfig } from "./config/categories";
import { useLocation } from "react-router-dom";

// --- THEME ORCHESTRATOR (Automatic Styling) ---
const ThemeOrchestrator = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  const themeClass = React.useMemo(() => {
    if (location.pathname === "/") return "theme-all";
    const tool = tools.find(t => t.to === location.pathname);
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
    const t = setTimeout(preloadFFmpeg, 2000); // start loading 2s after app mount
    return () => clearTimeout(t);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
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
                <Route path="/dice-lab" element={<DiceLab />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ThemeOrchestrator>
        </ErrorBoundary>
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
