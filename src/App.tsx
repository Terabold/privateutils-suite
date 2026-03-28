import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Mp3VolumeBooster from "./pages/Mp3VolumeBooster.tsx";
import ImageToWebp from "./pages/ImageToWebp.tsx";
import TextCaseFormatter from "./pages/TextCaseFormatter.tsx";
import ImageColorExtractor from "./pages/ImageColorExtractor.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/mp3-volume-booster" element={<Mp3VolumeBooster />} />
          <Route path="/image-to-webp" element={<ImageToWebp />} />
          <Route path="/text-case-formatter" element={<TextCaseFormatter />} />
          <Route path="/image-color-extractor" element={<ImageColorExtractor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
