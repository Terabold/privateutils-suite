import { Volume2, Type, Pipette, Video, Layers, Layout, Scissors, Music, ShieldX, ImageIcon, ShieldCheck, Wrench, Sparkles, Camera, Code, QrCode, Zap, ClipboardCopy, KeyRound, Binary, Clock, SearchCode, FileText, Palette, Fingerprint, Ruler, FileJson, FileStack, Monitor, RefreshCw, Database, Split, Radio, Hash, Eraser, Dices, Terminal, Dices as DiceIcon } from "lucide-react";
import ToolCard from "./ToolCard";
import { Button } from "@/components/ui/button";
import toolsMetadata from "@/data/toolsMetadata.json";

const toolsData = [
  {
    title: "Universal Media Converter",
    description: "Multi-format video and audio translation engine using native browser processing",
    icon: <Video className="h-5 w-5" />,
    to: "/universal-media-converter",
    category: "Video Studio",
    tags: ["ULTIMATE", "NATIVE"]
  },
  {
    title: "YouTube Thumbnail Studio",
    description: "Simulate live YouTube page layouts with overlays and safe-zone validation",
    icon: <Layout className="h-5 w-5" />,
    to: "/youtube-thumbnail-hub",
    category: "Video Studio",
    tags: ["SAFE-ZONES", "SIM"]
  },
  {
    title: "Perspective Tilt Hub",
    description: "Create angled image transformations and cinematic perspective mockups",
    icon: <Layers className="h-5 w-5" />,
    to: "/perspective-tilter",
    category: "Image Studio",
    tags: ["3D", "WYSIWYG"]
  },
  {
    title: "Metadata Scrubbing Studio",
    description: "Absolute EXIF destruction: strip GPS, camera info, and device ID from photos",
    icon: <ShieldX className="h-5 w-5" />,
    to: "/metadata-scrubber",
    category: "Privacy Belt",
    tags: ["EXIF", "SCRUB"]
  },
  {
    title: "Sprite Studio & Slicer",
    description: "Interactive multi-box image splitter and sprite sheet extractor",
    icon: <Scissors className="h-5 w-5" />,
    to: "/sprite-studio",
    category: "Image Studio",
    tags: ["SPRITES", "ZIP"]
  },
  {
    title: "Precise Audio Studio",
    description: "Precision waveform clipping and sample slicing for local audio assets",
    icon: <Music className="h-5 w-5" />,
    to: "/audio-trimmer",
    category: "Audio Lab",
    tags: ["TRIM", "WAV"]
  },
  {
    title: "Signal Volume Engine",
    description: "Non-destructive gain adjustment for audio files and video sound streams",
    icon: <Volume2 className="h-5 w-5" />,
    to: "/universal-volume-booster",
    category: "Audio Lab",
    tags: ["GAIN", "MP4"]
  },
  {
    title: "Color Palette Lab",
    description: "Extract professional color palettes and hex codes with precision sampling",
    icon: <Pipette className="h-5 w-5" />,
    to: "/image-color-extractor",
    category: "Image Studio",
    tags: ["DESIGN", "PRO"]
  },
  {
    title: "High-Fidelity GIF Engine",
    description: "Render optimized high-quality GIFs from any video with range control",
    icon: <RefreshCw className="h-5 w-5" />,
    to: "/video-to-gif",
    category: "Video Studio",
    tags: ["GIF", "NATIVE"]
  },
  {
    title: "High-Precision Frame Studio",
    description: "Capture lossless PNG frames and high-resolution instances from video streams",
    icon: <Camera className="h-5 w-5" />,
    to: "/frame-extractor",
    category: "Video Studio",
    tags: ["PNG", "EXTRACT"]
  },
  {
    title: "Aspect Ratio Hub",
    description: "Multi-platform aspect ratio remapping with Pad and Crop scaling modes",
    icon: <Monitor className="h-5 w-5" />,
    to: "/video-aspect-studio",
    category: "Video Studio",
    tags: ["RESIZE", "PRO"]
  },
  {
    title: "JSON Studio",
    description: "Professional JSON architect: structural validation and schema-grade formatting",
    icon: <FileJson className="h-5 w-5" />,
    to: "/json-studio",
    category: "Dev Toolbox",
    tags: ["DEV", "JSON", "PRO"]
  },
  {
    title: "Data Transformer Hub",
    description: "Bi-directional text data translation with smart column-to-object parsing",
    icon: <Database className="h-5 w-5" />,
    to: "/data-transformer",
    category: "Dev Toolbox",
    tags: ["CONVERT", "CSV", "JSON"]
  },
  {
    title: "Privacy QR Studio",
    description: "Air-gapped local QR encoding for links and sensitive data artifacts",
    icon: <QrCode className="h-5 w-5" />,
    to: "/qr-forge",
    category: "Privacy Belt",
    tags: ["SECURE", "QR"]
  },
  {
    title: "PII Masking Studio",
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
    title: "SVG to Image Converter",
    description: "High-precision vector-to-raster rendering for PNG and JPG formats",
    icon: <ImageIcon className="h-5 w-5" />,
    to: "/svg-to-image",
    category: "Image Studio",
    tags: ["RASTER", "PNG"]
  },
  {
    title: "Image to PDF Compiler",
    description: "Merge multiple JPG, PNG, or WebP images into a single sorted PDF document",
    icon: <FileStack className="h-5 w-5" />,
    to: "/image-to-pdf",
    category: "Image Studio",
    tags: ["PDF", "COMPILE"]
  },
  {
    title: "Text Case Formatter",
    description: "Professional case transformations for code or content lists",
    icon: <Type className="h-5 w-5" />,
    to: "/text-case-formatter",
    category: "Text Studio",
    tags: ["QUICK"]
  },
  {
    title: "Quick Clipboard Hub",
    description: "Instant clipboard-to-disk extraction: paste any artifact to download it immediately",
    icon: <ClipboardCopy className="h-5 w-5" />,
    to: "/quick-clipboard",
    category: "Quick Utils",
    tags: ["EXTRACT", "ZAP"]
  },
  {
    title: "Text Diff Checker",
    description: "Professional-grade content comparison: visualize additions and deletions side-by-side",
    icon: <Split className="h-5 w-5" />,
    to: "/text-diff-checker",
    category: "Text Studio",
    tags: ["COMPARE", "PRO"]
  },
  {
    title: "JWT Decoder & Inspector",
    description: "Inspect header, payload, and claims for JWT tokens on the local thread",
    icon: <KeyRound className="h-5 w-5" />,
    to: "/jwt-decoder",
    category: "Dev Toolbox",
    tags: ["DEV", "AUTH"]
  },
  {
    title: "Universal Encoder & Decoder",
    description: "Translate between Base64, URL encoding, HTML entities, and Hex bitstreams",
    icon: <Binary className="h-5 w-5" />,
    to: "/encoder-decoder",
    category: "Dev Toolbox",
    tags: ["BASE64", "HEX"]
  },
  {
    title: "Epoch Timestamp Engine",
    description: "Transform Unix epoch, ISO 8601, and human dates across timezones",
    icon: <Clock className="h-5 w-5" />,
    to: "/timestamp-converter",
    category: "Dev Toolbox",
    tags: ["UNIX", "ISO"]
  },
  {
    title: "Regular Expression Studio",
    description: "Live regex testing with match highlighting, flag toggles, 8 presets, and a cheat sheet",
    icon: <SearchCode className="h-5 w-5" />,
    to: "/regex-playground",
    category: "Dev Toolbox",
    tags: ["DEV", "LIVE"]
  },
  {
    title: "Lorem Ipsum Generator",
    description: "Generate professional placeholder text in Classic, Buzzword, or Hipster styles",
    icon: <FileText className="h-5 w-5" />,
    to: "/lorem-generator",
    category: "Text Studio",
    tags: ["CONTENT", "DEV"]
  },
  {
    title: "Privacy Password Studio",
    description: "High-entropy random string generation using browser-native cryptography",
    icon: <ShieldCheck className="h-5 w-5" />,
    to: "/password-generator",
    category: "Privacy Belt",
    tags: ["SECURE", "PRIVACY"]
  },
  {
    title: "Color Palette Studio",
    description: "Professional color harmony engine: generate Monochromatic and Triadic palettes",
    icon: <Palette className="h-5 w-5" />,
    to: "/palette-studio",
    category: "Image Studio",
    tags: ["DESIGN", "COLOR"]
  },
  {
    title: "Privacy Hash Lab",
    description: "Local multi-algorithm hashing: SHA-256, SHA-512, and MD5 fingerprinting",
    icon: <Fingerprint className="h-5 w-5" />,
    to: "/hash-lab",
    category: "Privacy Belt",
    tags: ["CRYPTO", "SECURE"]
  },
  {
    title: "Universal Unit Hub",
    description: "Fast high-precision measurement conversion for global engineering standards",
    icon: <Ruler className="h-5 w-5" />,
    to: "/unit-converter",
    category: "Quick Utils",
    tags: ["QUICK", "MATH"]
  },
  {
    title: "Image to Base64 Hub",
    description: "Direct image-to-memory-string conversion for developers and creative assets",
    icon: <FileStack className="h-5 w-5" />,
    to: "/base64-image",
    category: "Image Studio",
    tags: ["EXTRACT", "DEV"]
  },
  {
    title: "Audio Reverser",
    description: "Temporal phase inversion: flip audio buffers backward with zero local latency",
    icon: <RefreshCw className="h-5 w-5" />,
    to: "/reverse-audio",
    category: "Audio Lab",
    tags: ["FLIP", "WAV"]
  },
  {
    title: "Binary Bitstream to Audio",
    description: "Experimental data-bending: interpret raw file bitstreams as audio PCM buffers",
    icon: <Binary className="h-5 w-5" />,
    to: "/binary-to-audio",
    category: "Audio Lab",
    tags: ["GLITCH", "PCM"]
  },
  {
    title: "Audio Channel Mapper",
    description: "Channel remapping: convert Mono to pseudo-Stereo or mix Stereo to Mono",
    icon: <Layers className="h-5 w-5" />,
    to: "/audio-mono-stereo",
    category: "Audio Lab",
    tags: ["CHANNELS", "PRO"]
  },
  {
    title: "Audio Bass Booster",
    description: "Frequency enhancement: surgical low-end amplification using low-shelf filters",
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
  {
    title: "Morse Code Studio",
    description: "Translate text to Morse code and back with real-time web audio beeps",
    icon: <Radio className="h-5 w-5" />,
    to: "/morse-code-master",
    category: "Text Studio",
    tags: ["TRANS", "AUDIO"]
  },
  {
    title: "URL Slug Studio",
    description: "URL-friendly slug generation from titles with high-fidelity sanitization",
    icon: <Hash className="h-5 w-5" />,
    to: "/slug-forge",
    category: "Dev Toolbox",
    tags: ["SEO", "URL"]
  },
  {
    title: "Clean Code Hub",
    description: "Fast ghost-character removal and text sanitization for messy artifacts",
    icon: <Eraser className="h-5 w-5" />,
    to: "/whitespace-scrubber",
    category: "Text Studio",
    tags: ["CLEAN", "TEXT"]
  },
  {
    title: "Dice Lab & Entropy Generator",
    description: "Secure high-entropy random generation for dice, coins, and range-based RNG",
    icon: <Dices className="h-5 w-5" />,
    to: "/dice-lab",
    category: "Quick Utils",
    tags: ["SECURE", "ROLL"]
  },
];

export const tools = toolsData.map(tool => {
  const meta = toolsMetadata.find(m => m.to === tool.to);
  return {
    ...tool,
    seoTitle: meta?.seoTitle || `${tool.title} | Client-Sided Coding & Media Tools`,
    seoDescription: meta?.seoDescription || tool.description
  };
});

import { categoryConfig } from "@/config/categories";

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
        <Button onClick={onClearFilters} variant="outline" className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs border-primary/20 bg-primary/5 hover:bg-primary/20 dark:bg-white/5 dark:hover:bg-white/10 transition-all">
          Clear Calibration
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-32 relative min-h-[800px]">
      {isFiltering ? (
        <section id="search-results" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
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
                <div className="absolute top-3 right-3 flex gap-1.5 pointer-events-none z-50">
                  {tool.tags.map(tag => {
                    const tagColor = categoryConfig[tool.category]?.tagColor || '#a78bfa';
                    return (
                      <span
                        key={tag}
                        className="text-[10px] font-black px-2 py-0.5 rounded-2xl shadow-xl opacity-0 translate-y-1 group-hover/card-wrapper:opacity-100 group-hover/card-wrapper:translate-y-0 transition-all duration-500 uppercase tracking-widest whitespace-nowrap backdrop-blur-md"
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
            <section key={category} id={category.replace(/\s+/g, '-').toLowerCase()} className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="flex items-center gap-6 mb-10 px-2">
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
                      <div className="absolute top-3 right-3 flex gap-1.5 pointer-events-none z-50">
                        {tool.tags.map(tag => {
                          const tagColor = config.tagColor;
                          return (
                            <span
                              key={tag}
                              className="text-[10px] font-black px-2 py-0.5 rounded-2xl shadow-xl opacity-0 translate-y-1 group-hover/card-wrapper:opacity-100 group-hover/card-wrapper:translate-y-0 transition-all duration-500 uppercase tracking-widest whitespace-nowrap backdrop-blur-md"
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
