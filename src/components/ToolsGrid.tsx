import { Volume2, Type, Pipette, Video, Layers, Layout, Scissors, Music, ShieldX, ImageIcon, ShieldCheck, Wrench, Sparkles, Camera, Code, QrCode, Zap } from "lucide-react";
import ToolCard from "./ToolCard";

const tools = [
  {
    title: "Universal Media Converter",
    description: "The ultimate tool to convert video and image formats using WebAssembly engine",
    icon: <Video className="h-5 w-5" />,
    to: "/universal-media-converter",
    category: "Video Studio",
    tags: ["ULTIMATE", "WASM"]
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
    title: "Batch Image Studio",
    description: "Apply borders, dynamic shadows, and watermarks to many images at once",
    icon: <Layers className="h-5 w-5" />,
    to: "/batch-image-studio",
    category: "Image Studio",
    tags: ["BATCH", "RESIZE"]
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
    title: "Frame & GIF Studio",
    description: "Extract high-res PNG frames and render optimized GIFs from any video",
    icon: <Camera className="h-5 w-5" />,
    to: "/frame-gif-studio",
    category: "Video Studio",
    tags: ["EXTRACT", "GIF"]
  },
  {
    title: "JSON Forge",
    description: "Professional data architect for formatting, minifying and validating JSON",
    icon: <Code className="h-5 w-5" />,
    to: "/json-forge",
    category: "Utility Belt",
    tags: ["DEV", "JSON"]
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
    title: "PII Scrubber",
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
];

const categoryConfig: Record<string, { icon: any, gradient: string }> = {
  "Video Studio": { icon: Video, gradient: "from-blue-500 to-indigo-500" },
  "Image Studio": { icon: ImageIcon, gradient: "from-orange-500 to-rose-500" },
  "Audio Lab": { icon: Music, gradient: "from-emerald-500 to-teal-500" },
  "Privacy Belt": { icon: ShieldCheck, gradient: "from-red-500 to-amber-500" },
  "Utility Belt": { icon: Wrench, gradient: "from-slate-400 to-slate-600" }
};

const ToolsGrid = () => {
  const categories = Array.from(new Set(tools.map(t => t.category)));

  return (
    <div className="space-y-32 relative">
      {categories.map(category => {
        const config = categoryConfig[category] || { icon: Sparkles, gradient: "from-primary to-accent" };
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
                <div className="h-1 w-24 bg-gradient-to-r from-primary/50 to-transparent rounded-full mt-2" />
              </div>
              <div className="h-[1px] grow bg-border/40 opacity-20" />
            </div>
            
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {tools
                .filter(t => t.category === category)
                .map((tool) => (
                  <div key={tool.to} className="relative group/card-wrapper w-full h-full">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-primary/20 to-accent/10 rounded-[1.5rem] opacity-0 group-hover/card-wrapper:opacity-100 blur-2xl transition-all duration-700 -z-10 group-hover/card-wrapper:scale-110" />
                    <ToolCard {...tool} />
                    <div className="absolute top-4 right-4 flex gap-1.5 pointer-events-none z-50">
                      {tool.tags.map(tag => (
                         <span key={tag} className="text-[10px] bg-primary/20 text-primary font-black px-2 py-0.5 rounded-lg border border-primary/20 shadow-xl opacity-0 translate-y-2 group-hover/card-wrapper:opacity-100 group-hover/card-wrapper:translate-y-0 transition-all duration-500 uppercase tracking-widest whitespace-nowrap backdrop-blur-md">
                           {tag}
                         </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ToolsGrid;
