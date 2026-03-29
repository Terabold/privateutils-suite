import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import UniversalVolumeBooster from "./pages/UniversalVolumeBooster.tsx";
import TextCaseFormatter from "./pages/TextCaseFormatter.tsx";
import ImageColorExtractor from "./pages/ImageColorExtractor.tsx";
import UniversalMediaConverter from "./pages/UniversalMediaConverter.tsx";
import PerspectiveTilter from "./pages/PerspectiveTilter.tsx";
import YouTubeThumbnailHub from "./pages/YouTubeThumbnailHub.tsx";
import BatchImageStudio from "./pages/BatchImageStudio.tsx";
import SpriteStudio from "./pages/SpriteStudio.tsx";
import MetadataScrubber from "./pages/MetadataScrubber.tsx";
import AudioTrimmer from "./pages/AudioTrimmer.tsx";
import FrameGifStudio from "./pages/FrameGifStudio.tsx";
import JsonForge from "./pages/JsonForge.tsx";
import QrForge from "./pages/QrForge.tsx";
import PiiMasker from "./pages/PiiMasker.tsx";
import SvgOptimizer from "./pages/SvgOptimizer.tsx";
import NotFound from "./pages/NotFound.tsx";

import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/universal-volume-booster" element={<UniversalVolumeBooster />} />
          <Route path="/text-case-formatter" element={<TextCaseFormatter />} />
          <Route path="/image-color-extractor" element={<ImageColorExtractor />} />
          <Route path="/universal-media-converter" element={<UniversalMediaConverter />} />
          <Route path="/perspective-tilter" element={<PerspectiveTilter />} />
          <Route path="/youtube-thumbnail-hub" element={<YouTubeThumbnailHub />} />
          <Route path="/batch-image-studio" element={<BatchImageStudio />} />
          <Route path="/sprite-studio" element={<SpriteStudio />} />
          <Route path="/audio-trimmer" element={<AudioTrimmer />} />
          <Route path="/metadata-scrubber" element={<MetadataScrubber />} />
          <Route path="/frame-gif-studio" element={<FrameGifStudio />} />
          <Route path="/json-forge" element={<JsonForge />} />
          <Route path="/qr-forge" element={<QrForge />} />
          <Route path="/pii-masker" element={<PiiMasker />} />
          <Route path="/svg-optimizer" element={<SvgOptimizer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
