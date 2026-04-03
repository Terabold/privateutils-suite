import { Volume2, Type, Pipette, Video, Layers, Layout, Scissors, Music, ShieldX, ImageIcon, ShieldCheck, Wrench, Sparkles, Camera, Code, QrCode, Zap, ClipboardCopy, KeyRound, Binary, Clock, SearchCode, FileText, Palette, Fingerprint, Ruler, FileJson, FileStack, Monitor, RefreshCw, Database } from "lucide-react";
import ToolCard from "./ToolCard";
import { Button } from "@/components/ui/button";

export const tools = [
  {
    title: "Universal Media Converter",
    description: "The ultimate tool to convert video and image formats using Native Browser engines",
    icon: <Video className="h-5 w-5" />,
    to: "/universal-media-converter",
    category: "Video Studio",
    tags: ["ULTIMATE", "NATIVE"]
  },
  {
    title: "YouTube Verify",
    description: "Preview overlays & live page simulations to ensure your thumbnails aren't covered",
    icon: <Layout className="h-5 w-5" />,
    to: "/youtube-thumbnail-hub",
    category: "Video Studio",
    tags: ["SAFE-ZONES", "SIM"]
  },
  {
    title: "3D Perspective Tilt",
    description: "Create angled thumbnails and cinematic perspective mockups with 1:1 export",
    icon: <Layers className="h-5 w-5" />,
    to: "/perspective-tilter",
    category: "Image Studio",
    tags: ["3D", "WYSIWYG"]
  },

  {
    title: "Privacy Scrubber",
    description: "Absolute metadata destruction: strip GPS, camera info, and device ID from photos",
    icon: <ShieldX className="h-5 w-5" />,
    to: "/metadata-scrubber",
    category: "Privacy Belt",
    tags: ["EXIF", "SCRUB"]
  },
  {
    title: "Sprite Studio (Slicer)",
    description: "Interactive multi-box image splitter & sprite extractor with accurate edge logic",
    icon: <Scissors className="h-5 w-5" />,
    to: "/sprite-studio",
    category: "Image Studio",
    tags: ["SPRITES", "ZIP"]
  },
  {
    title: "Audio Trimmer",
    description: "Local high-fidelity waveform clipping and sample slicing for your audio assets",
    icon: <Music className="h-5 w-5" />,
    to: "/audio-trimmer",
    category: "Audio Lab",
    tags: ["TRIM", "WAV"]
  },
  {
    title: "Universal Volume Booster",
    description: "Directly adjust volume levels of your audio assets and video sound streams",
    icon: <Volume2 className="h-5 w-5" />,
    to: "/universal-volume-booster",
    category: "Audio Lab",
    tags: ["GAIN", "MP4"]
  },
  {
    title: "Pixel Extractor",
    description: "Extract professional color palettes and hex codes with right-click pan support",
    icon: <Pipette className="h-5 w-5" />,
    to: "/image-color-extractor",
    category: "Image Studio",
    tags: ["DESIGN", "PRO"]
  },
  {
    title: "Video to GIF",
    description: "Render high-quality, optimized GIFs from any video artifact with precise range control",
    icon: <RefreshCw className="h-5 w-5" />,
    to: "/video-to-gif",
    category: "Video Studio",
    tags: ["GIF", "NATIVE"]
  },
  {
    title: "Frame Extractor",
    description: "Capture high-resolution PNG instances and lossless frames from any video stream",
    icon: <Camera className="h-5 w-5" />,
    to: "/frame-extractor",
    category: "Video Studio",
    tags: ["PNG", "EXTRACT"]
  },
  {
    title: "Aspect Studio",
    description: "Professional aspect ratio remapping for social media with Pad and Crop modes",
    icon: <Monitor className="h-5 w-5" />,
    to: "/video-aspect-studio",
    category: "Video Studio",
    tags: ["RESIZE", "PRO"]
  },
  {
    title: "JSON Studio",
    description: "Professional JSON architect: structural validation, deep formatting, and schema-grade architecture",
    icon: <FileJson className="h-5 w-5" />,
    to: "/json-studio",
    category: "Utility Belt",
    tags: ["DEV", "JSON", "PRO"]
  },
  {
    title: "Data Transformer",
    description: "Universal data translation: bi-directional CSV and JSON conversion with smart header parsing",
    icon: <Database className="h-5 w-5" />,
    to: "/data-transformer",
    category: "Utility Belt",
    tags: ["CONVERT", "CSV", "JSON"]
  },
  {
    title: "Secure QR Forge",
    description: "Privacy-first local QR generator for links and sensitive data artifacts",
    icon: <QrCode className="h-5 w-5" />,
    to: "/qr-forge",
    category: "Privacy Belt",
    tags: ["SECURE", "QR"]
  },
  {
    title: "PII Masker",
    description: "Forensic image redaction: physically blur and destroy sensitive information",
    icon: <ShieldX className="h-5 w-5" />,
    to: "/pii-masker",
    category: "Privacy Belt",
    tags: ["REDACT", "BLUR"]
  },
  {
    title: "SVG Optimizer",
    description: "High-efficiency vector minifier to purge metadata and reduce file size",
    icon: <Zap className="h-5 w-5" />,
    to: "/svg-optimizer",
    category: "Image Studio",
    tags: ["SVG", "FAST"]
  },
  {
    title: "Text Case Formatter",
    description: "Professional case transformations for code or content lists",
    icon: <Type className="h-5 w-5" />,
    to: "/text-case-formatter",
    category: "Utility Belt",
    tags: ["QUICK"]
  },
  {
    title: "Quick Clipboard Hub",
    description: "Instant clipboard-to-disk extraction: paste any artifact to download it immediately",
    icon: <ClipboardCopy className="h-5 w-5" />,
    to: "/quick-clipboard",
    category: "Utility Belt",
    tags: ["EXTRACT", "ZAP"]
  },
  {
    title: "JWT Decoder",
    description: "Instantly decode and inspect JWT tokens: header, payload, expiry, and claims — no server",
    icon: <KeyRound className="h-5 w-5" />,
    to: "/jwt-decoder",
    category: "Utility Belt",
    tags: ["DEV", "AUTH"]
  },
  {
    title: "Encode / Decode",
    description: "Convert between Base64, URL encoding, HTML entities, and Hex in one place",
    icon: <Binary className="h-5 w-5" />,
    to: "/encoder-decoder",
    category: "Utility Belt",
    tags: ["BASE64", "HEX"]
  },
  {
    title: "Timestamp Converter",
    description: "Transform Unix timestamps, ISO 8601, and human dates across every format and timezone",
    icon: <Clock className="h-5 w-5" />,
    to: "/timestamp-converter",
    category: "Utility Belt",
    tags: ["UNIX", "ISO"]
  },
  {
    title: "Regex Playground",
    description: "Live regex testing with match highlighting, flag toggles, 8 presets, and a cheat sheet",
    icon: <SearchCode className="h-5 w-5" />,
    to: "/regex-playground",
    category: "Utility Belt",
    tags: ["DEV", "LIVE"]
  },
  {
    title: "Lorem Ipsum Generator",
    description: "Generate professional placeholder text in Classic, Buzzword, or Hipster styles",
    icon: <FileText className="h-5 w-5" />,
    to: "/lorem-generator",
    category: "Utility Belt",
    tags: ["CONTENT", "DEV"]
  },
  {
    title: "Secure Password Generator",
    description: "Hardware-backed high-entropy password generator with instant audit and local-only logic",
    icon: <ShieldCheck className="h-5 w-5" />,
    to: "/password-generator",
    category: "Utility Belt",
    tags: ["SECURE", "PRIVACY"]
  },
  {
    title: "Palette Studio",
    description: "Professional color harmony engine: generate Monochromatic, Analogous, and Triadic palettes",
    icon: <Palette className="h-5 w-5" />,
    to: "/palette-studio",
    category: "Image Studio",
    tags: ["DESIGN", "COLOR"]
  },
  {
    title: "Hash Lab",
    description: "Multi-algorithm cryptographic checksums: SHA-256, SHA-512, and MD5 fingerprints",
    icon: <Fingerprint className="h-5 w-5" />,
    to: "/hash-lab",
    category: "Privacy Belt",
    tags: ["CRYPTO", "SECURE"]
  },
  {
    title: "Unit Converter",
    description: "Fast, high-precision measurement transformation across every global standard",
    icon: <Ruler className="h-5 w-5" />,
    to: "/unit-converter",
    category: "Utility Belt",
    tags: ["QUICK", "MATH"]
  },
  {
    title: "Base64 Image Encoder",
    description: "Direct image-to-memory-string conversion for developers and creative artifact logic",
    icon: <FileStack className="h-5 w-5" />,
    to: "/base64-image",
    category: "Image Studio",
    tags: ["EXTRACT", "DEV"]
  },
  {
    title: "Reverse Audio",
    description: "Temporal phase inversion: flip your audio buffers backward with zero-latency local processing",
    icon: <RefreshCw className="h-5 w-5" />,
    to: "/reverse-audio",
    category: "Audio Lab",
    tags: ["FLIP", "WAV"]
  },
  {
    title: "Binary to Audio",
    description: "Experimental data-bending: interpret any raw file bitstream as audio PCM data",
    icon: <Binary className="h-5 w-5" />,
    to: "/binary-to-audio",
    category: "Audio Lab",
    tags: ["GLITCH", "PCM"]
  },
  {
    title: "Audio Mono/Stereo",
    description: "Professional channel remapping: convert Mono to pseudo-Stereo or mix Stereo to Mono",
    icon: <Layers className="h-5 w-5" />,
    to: "/audio-mono-stereo",
    category: "Audio Lab",
    tags: ["CHANNELS", "PRO"]
  },
  {
    title: "Bass Booster EQ",
    description: "Deep frequency enhancement: surgical low-end amplification using low-shelf filtering",
    icon: <Zap className="h-5 w-5" />,
    to: "/audio-bass-booster",
    category: "Audio Lab",
    tags: ["EQ", "BASS"]
  },
  {
    title: "Image Compressor",
    description: "High-speed local image optimization: reduce file size by up to 90% without quality loss",
    icon: <Zap className="h-5 w-5" />,
    to: "/image-compressor",
    category: "Image Studio",
    tags: ["COMPRESS", "WEB"]
  },
];

export const categoryConfig: Record<string, { icon: any, gradient: string, themeClass: string, tagColor: string }> = {
  "Video Studio": { icon: Video, gradient: "from-blue-600 to-indigo-500", themeClass: "theme-video", tagColor: "#3b82f6" },
  "Image Studio": { icon: ImageIcon, gradient: "from-orange-500 to-rose-500", themeClass: "theme-image", tagColor: "#f97316" },
  "Audio Lab": { icon: Music, gradient: "from-emerald-500 to-teal-500", themeClass: "theme-audio", tagColor: "#10b981" },
  "Privacy Belt": { icon: ShieldCheck, gradient: "from-violet-500 to-fuchsia-400", themeClass: "theme-privacy", tagColor: "#8b5cf6" },
  "Utility Belt": { icon: Wrench, gradient: "from-amber-400 to-yellow-600", themeClass: "theme-utility", tagColor: "#f59e0b" }
};

interface ToolsGridProps {
  searchQuery?: string;
  selectedCategory?: string | null;
  onClearFilters?: () => void;
}

const ToolsGrid = ({ searchQuery = "", selectedCategory = null, onClearFilters }: ToolsGridProps) => {
  const filteredTools = tools.filter(tool => {
    const matchesQuery =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory ? tool.category === selectedCategory : true;

    return matchesQuery && matchesCategory;
  });

  const isFiltering = searchQuery.length > 0 || selectedCategory !== null;
  const categories = Array.from(new Set(filteredTools.map(t => t.category)));

  if (filteredTools.length === 0) {
    return (
      <div className="py-32 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="h-24 w-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-10 border border-primary/20 shadow-2xl">
          <Zap className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-4">No artifacts found</h3>
        <p className="text-muted-foreground font-medium mb-10 max-w-md mx-auto opacity-60 italic">Your search criteria didn't match any of our local processing tools.</p>
        <Button onClick={onClearFilters} variant="outline" className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs border-primary/20 hover:bg-primary/5 transition-all">
          Clear Calibration
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-32 relative">
      {isFiltering ? (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center gap-6 mb-16 px-2">
            <div className={`p-4 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-black/20`}>
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div className="flex flex-col">
              <h2 className={`text-4xl md:text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
                Search <span className="opacity-80 font-display">Results</span>
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-primary/50 to-transparent rounded-full mt-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <div key={tool.to} className="relative group/card-wrapper w-full h-full animate-in zoom-in-95 duration-500">
                <div className={`absolute -inset-1 bg-gradient-to-tr ${categoryConfig[tool.category]?.gradient || "from-primary/20 to-accent/10"} opacity-0 group-hover/card-wrapper:opacity-50 blur-2xl transition-all duration-700 -z-10 group-hover/card-wrapper:scale-110`} />
                <ToolCard {...tool} gradient={categoryConfig[tool.category]?.gradient} themeClass={categoryConfig[tool.category]?.themeClass} />
                <div className="absolute top-4 right-4 flex gap-1.5 pointer-events-none z-50">
                  {tool.tags.map(tag => {
                    const tagColor = categoryConfig[tool.category]?.tagColor || '#a78bfa';
                    return (
                      <span
                        key={tag}
                        className="text-[10px] font-black px-2 py-0.5 rounded-2xl shadow-xl opacity-0 translate-y-2 group-hover/card-wrapper:opacity-100 group-hover/card-wrapper:translate-y-0 transition-all duration-500 uppercase tracking-widest whitespace-nowrap backdrop-blur-md"
                        style={{ color: tagColor, backgroundColor: `${tagColor}15`, borderWidth: 1, borderStyle: 'solid', borderColor: `${tagColor}30` }}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        categories.map(category => {
          const config = categoryConfig[category] || { icon: Sparkles, gradient: "from-primary to-accent", themeClass: "", tagColor: "#a78bfa" };
          const Icon = config.icon;

          return (
            <section key={category} className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="flex items-center gap-6 mb-16 px-2">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${config.gradient} shadow-lg shadow-black/20`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className={`text-4xl md:text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                    {category.split(' ')[0]} <span className="opacity-80 font-display">{category.split(' ')[1]}</span>
                  </h2>
                  <div className={`h-1 w-24 bg-gradient-to-r ${config.gradient} opacity-50 rounded-full mt-2`} />
                </div>
                <div className="h-[1px] grow bg-border/40 opacity-20" />
              </div>

              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {tools
                  .filter(t => t.category === category)
                  .map((tool) => (
                    <div key={tool.to} className="relative group/card-wrapper w-full h-full">
                      <div className={`absolute -inset-1 bg-gradient-to-tr ${config.gradient} opacity-0 group-hover/card-wrapper:opacity-50 blur-2xl transition-all duration-700 -z-10 group-hover/card-wrapper:scale-110`} />
                      <ToolCard {...tool} gradient={config.gradient} themeClass={config.themeClass} />
                      <div className="absolute top-4 right-4 flex gap-1.5 pointer-events-none z-50">
                        {tool.tags.map(tag => {
                          const tagColor = config.tagColor;
                          return (
                            <span
                              key={tag}
                              className="text-[10px] font-black px-2 py-0.5 rounded-2xl shadow-xl opacity-0 translate-y-2 group-hover/card-wrapper:opacity-100 group-hover/card-wrapper:translate-y-0 transition-all duration-500 uppercase tracking-widest whitespace-nowrap backdrop-blur-md"
                              style={{ color: tagColor, backgroundColor: `${tagColor}15`, borderWidth: 1, borderStyle: 'solid', borderColor: `${tagColor}30` }}
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
};

export default ToolsGrid;
