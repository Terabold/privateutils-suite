import { useMemo } from "react";
import { Volume2, Type, Pipette, Video, Layers, Layout, Scissors, Music, ShieldX, ImageIcon, ShieldCheck, Wrench, Sparkles, Camera, Code, QrCode, Zap, ClipboardCopy, KeyRound, Binary, Clock, SearchCode, FileText, Palette, Fingerprint, Ruler, FileJson, FileStack, Monitor, RefreshCw, Database, Split, Radio, Hash, Eraser, Dices, Terminal, Dices as DiceIcon } from "lucide-react";
import ToolCard from "./ToolCard";
import { Button } from "@/components/ui/button";
import toolsMetadata from "@/data/toolsMetadata.json";
import { searchTools } from "@/lib/search";

const toolsData = [
  {
    title: "Media Converter",
    description: "Convert video and audio formats in your browser with zero server-side processing.",
    icon: <Video className="h-5 w-5" />,
    to: "/universal-media-converter",
    category: "Video Studio",
    tags: ["ULTIMATE", "NATIVE"]
  },
  {
    title: "YouTube Thumbnail Preview",
    description: "Simulate and verify how your thumbnails look on a realistic YouTube interface.",
    icon: <Layout className="h-5 w-5" />,
    to: "/youtube-thumbnail-hub",
    category: "Video Studio",
    tags: ["SAFE-ZONES", "SIM"]
  },
  {
    title: "3D Image Tilt",
    description: "Apply 3D perspective and professional angled tilts to any image instantly.",
    icon: <Layers className="h-5 w-5" />,
    to: "/perspective-tilter",
    category: "Image Studio",
    tags: ["3D", "WYSIWYG"]
  },
  {
    title: "Remove Photo Metadata",
    description: "Strip EXIF data like GPS and camera info from your photos locally for total security.",
    icon: <ShieldX className="h-5 w-5" />,
    to: "/metadata-scrubber",
    category: "Privacy Belt",
    tags: ["EXIF", "SCRUB"]
  },
  {
    title: "Split Image (Sprites)",
    description: "Slice images into a precise grid and export them as a ZIP file buffer instantly.",
    icon: <Scissors className="h-5 w-5" />,
    to: "/sprite-studio",
    category: "Image Studio",
    tags: ["SPRITES", "ZIP"]
  },
  {
    title: "Trim Audio",
    description: "Cut and clip audio files to a specific timeframe with local-first precision editing.",
    icon: <Music className="h-5 w-5" />,
    to: "/audio-trimmer",
    category: "Audio Lab",
    tags: ["TRIM", "WAV"]
  },
  {
    title: "Volume Booster",
    description: "Amplify or reduce volume for media files with high-fidelity gain control.",
    icon: <Volume2 className="h-5 w-5" />,
    to: "/universal-volume-booster",
    category: "Audio Lab",
    tags: ["GAIN", "MP4"]
  },
  {
    title: "Get Image Colors",
    description: "Extract color palettes from images and copy hex codes for brand-matching design.",
    icon: <Pipette className="h-5 w-5" />,
    to: "/image-color-extractor",
    category: "Image Studio",
    tags: ["DESIGN", "PRO"]
  },
  {
    title: "Video to GIF",
    description: "Create optimized GIFs from video clips. Fully client-side conversion for total privacy.",
    icon: <RefreshCw className="h-5 w-5" />,
    to: "/video-to-gif",
    category: "Video Studio",
    tags: ["GIF", "NATIVE"]
  },
  {
    title: "Save Video Frames",
    description: "Extract high-fidelity PNG snapshots from any local video file instantly.",
    icon: <Camera className="h-5 w-5" />,
    to: "/frame-extractor",
    category: "Video Studio",
    tags: ["PNG", "EXTRACT"]
  },
  {
    title: "Change Aspect Ratio",
    description: "Resize videos to any aspect ratio with padding or cropping",
    icon: <Monitor className="h-5 w-5" />,
    to: "/video-aspect-studio",
    category: "Video Studio",
    tags: ["RESIZE", "PRO"]
  },
  {
    title: "JSON Formatter",
    description: "Validate and format complex JSON structures with high-fidelity syntax highlighting.",
    icon: <FileJson className="h-5 w-5" />,
    to: "/json-studio",
    category: "Dev Toolbox",
    tags: ["DEV", "JSON", "PRO"]
  },
  {
    title: "CSV / JSON Converter",
    description: "Convert between CSV and JSON formats instantly. Handles complex nested data structures.",
    icon: <Database className="h-5 w-5" />,
    to: "/data-transformer",
    category: "Dev Toolbox",
    tags: ["CONVERT", "CSV", "JSON"]
  },
  {
    title: "QR Code Generator",
    description: "Create custom QR codes fully offline with high-density encoding and error correction.",
    icon: <QrCode className="h-5 w-5" />,
    to: "/qr-forge",
    category: "Privacy Belt",
    tags: ["SECURE", "QR"]
  },
  {
    title: "Blur/Redact Image",
    description: "Mask sensitive PII, credentials, or faces from images before sharing for maximum privacy.",
    icon: <ShieldX className="h-5 w-5" />,
    to: "/pii-masker",
    category: "Privacy Belt",
    tags: ["REDACT", "BLUR"]
  },
  {
    title: "Minify SVG",
    description: "Optimize SVG files by removing unnecessary markup for faster web rendering speeds.",
    icon: <Zap className="h-5 w-5" />,
    to: "/svg-optimizer",
    category: "Image Studio",
    tags: ["SVG", "FAST"]
  },
  {
    title: "SVG to Image",
    description: "Convert SVG files to PNG or JPG with high-fidelity rasterization for all assets.",
    icon: <ImageIcon className="h-5 w-5" />,
    to: "/svg-to-image",
    category: "Image Studio",
    tags: ["RASTER", "PNG"]
  },
  {
    "title": "SVG to ICO Icon",
    "description": "Convert SVG files into valid .ico icons. Perfect for high-quality website favicons.",
    "icon": <Sparkles className="h-5 w-5" />,
    "to": "/svg-to-ico",
    "category": "Image Studio",
    "tags": ["FAVICON", "ICO"]
  },
  {
    title: "Image to PDF",
    description: "Merge multiple images into a single PDF file with local-first secure compilation.",
    icon: <FileStack className="h-5 w-5" />,
    to: "/image-to-pdf",
    category: "Image Studio",
    tags: ["PDF", "COMPILE"]
  },
  {
    title: "Change Text Case",
    description: "Convert text between camelCase, snake_case, and more for technical documentation.",
    icon: <Type className="h-5 w-5" />,
    to: "/text-case-formatter",
    category: "Text Studio",
    tags: ["QUICK"]
  },
  {
    title: "Clipboard to File",
    description: "Paste and download clipboard content as a file. Extract binary assets from your buffer.",
    icon: <ClipboardCopy className="h-5 w-5" />,
    to: "/quick-clipboard",
    category: "Quick Utils",
    tags: ["EXTRACT", "ZAP"]
  },
  {
    title: "Compare Text",
    description: "Check differences between text blocks with instant additions and removals highlighting.",
    icon: <Split className="h-5 w-5" />,
    to: "/text-diff-checker",
    category: "Text Studio",
    tags: ["COMPARE", "PRO"]
  },
  {
    title: "JWT Decoder",
    description: "Inspect JWT headers and payloads securely on your device without leaking tokens.",
    icon: <KeyRound className="h-5 w-5" />,
    to: "/jwt-decoder",
    category: "Dev Toolbox",
    tags: ["DEV", "AUTH"]
  },
  {
    title: "Encoder / Decoder",
    description: "Convert text between Base64, URL, HTML, and Hex using comprehensive local tools.",
    icon: <Binary className="h-5 w-5" />,
    to: "/encoder-decoder",
    category: "Dev Toolbox",
    tags: ["BASE64", "HEX"]
  },
  {
    title: "Timestamp Converter",
    description: "Convert Unix timestamps to readable dates with support for multiple time formats.",
    icon: <Clock className="h-5 w-5" />,
    to: "/timestamp-converter",
    category: "Dev Toolbox",
    tags: ["UNIX", "ISO"]
  },
  {
    title: "Test Regex",
    description: "Validate regular expressions with live highlighting against custom test strings.",
    icon: <SearchCode className="h-5 w-5" />,
    to: "/regex-playground",
    category: "Dev Toolbox",
    tags: ["DEV", "LIVE"]
  },
  {
    title: "Lorem Ipsum Generator",
    description: "Generate placeholder text for your designs with custom paragraph and sentence counts.",
    icon: <FileText className="h-5 w-5" />,
    to: "/lorem-generator",
    category: "Text Studio",
    tags: ["CONTENT", "DEV"]
  },
  {
    title: "Password Generator",
    description: "Create secure random passwords locally. Fully offline generation for maximum privacy.",
    icon: <ShieldCheck className="h-5 w-5" />,
    to: "/password-generator",
    category: "Privacy Belt",
    tags: ["SECURE", "PRIVACY"]
  },
  {
    title: "Generate Color Palettes",
    description: "Create brand schemes like Monochromatic and Triadic for UI designers and developers.",
    icon: <Palette className="h-5 w-5" />,
    to: "/palette-studio",
    category: "Image Studio",
    tags: ["DESIGN", "COLOR"]
  },
  {
    title: "Hash Generator",
    description: "Create SHA-256, SHA-512, or MD5 hashes locally for verified cryptographic integrity.",
    icon: <Fingerprint className="h-5 w-5" />,
    to: "/hash-lab",
    category: "Privacy Belt",
    tags: ["CRYPTO", "SECURE"]
  },
  {
    title: "Unit Converter",
    description: "Convert weight, area, and speed measurements with high-precision engineering tools.",
    icon: <Ruler className="h-5 w-5" />,
    to: "/unit-converter",
    category: "Quick Utils",
    tags: ["QUICK", "MATH"]
  },
  {
    title: "Image to Base64",
    description: "Convert images to Base64 strings for CSS and code without external dependencies.",
    icon: <FileStack className="h-5 w-5" />,
    to: "/base64-image",
    category: "Image Studio",
    tags: ["EXTRACT", "DEV"]
  },
  {
    title: "Reverse Audio",
    description: "Play audio files backwards for sound design and experimental media production.",
    icon: <RefreshCw className="h-5 w-5" />,
    to: "/reverse-audio",
    category: "Audio Lab",
    tags: ["FLIP", "WAV"]
  },
  {
    title: "Convert Data to Audio",
    description: "Turn raw file bytes into experimental audio and explore acoustic digital fingerprints.",
    icon: <Binary className="h-5 w-5" />,
    to: "/binary-to-audio",
    category: "Audio Lab",
    tags: ["GLITCH", "PCM"]
  },
  {
    title: "Channel Converter",
    description: "Change audio between Mono and Stereo with surgical control over spatial fields.",
    icon: <Layers className="h-5 w-5" />,
    to: "/audio-mono-stereo",
    category: "Audio Lab",
    tags: ["CHANNELS", "PRO"]
  },
  {
    title: "Boost Bass",
    description: "Increase low-end frequencies with pro-grade reconstruction for high-fidelity output.",
    icon: <Zap className="h-5 w-5" />,
    to: "/audio-bass-booster",
    category: "Audio Lab",
    tags: ["EQ", "BASS"]
  },
  {
    title: "Image Compressor",
    description: "Reduce image file size locally with secure optimization for privacy-conscious users.",
    icon: <Zap className="h-5 w-5" />,
    to: "/image-compressor",
    category: "Image Studio",
    tags: ["COMPRESS", "WEB"]
  },
  {
    title: "Morse Code Translator",
    description: "Translate text to Morse code with live audio synthesis and visual transmission signals.",
    icon: <Radio className="h-5 w-5" />,
    to: "/morse-code-master",
    category: "Text Studio",
    tags: ["TRANS", "AUDIO"]
  },
  {
    title: "URL Slug Generator",
    description: "Create clean, SEO-friendly slugs from text for technical content distribution.",
    icon: <Hash className="h-5 w-5" />,
    to: "/slug-forge",
    category: "Dev Toolbox",
    tags: ["SEO", "URL"]
  },
  {
    title: "Clean Text",
    description: "Remove hidden characters and whitespace from messy documentation and code files.",
    icon: <Eraser className="h-5 w-5" />,
    to: "/whitespace-scrubber",
    category: "Text Studio",
    tags: ["CLEAN", "TEXT"]
  },
  {
    title: "Dice Roller",
    description: "Secure physics-based randomization for games and security with dice and coin flips.",
    icon: <Dices className="h-5 w-5" />,
    to: "/dice-lab",
    category: "Quick Utils",
    tags: ["SECURE", "ROLL"]
  },
];


export type { Tool } from "@/types/tool";
import { Tool } from "@/types/tool";

export const tools = toolsData.map(tool => {
  const meta = toolsMetadata.find(m => m.to === tool.to);
  return {
    ...tool,
    seoTitle: meta?.seoTitle || `${tool.title} | Client-Sided Coding & Media Tools`,
    seoDescription: meta?.seoDescription || tool.description
  } as Tool;
});

import { categoryConfig } from "@/config/categories";

interface ToolsGridProps {
  searchQuery?: string;
  selectedCategory?: string | null;
  onClearFilters?: () => void;
}

const ToolsGrid = ({ searchQuery = "", selectedCategory = null, onClearFilters }: ToolsGridProps) => {
  const filteredTools = useMemo(() => {
    // 1. Filter by category first if selected
    const categoryMatched = selectedCategory 
      ? tools.filter(t => t.category === selectedCategory)
      : tools;

    // 2. Apply Fuzzy Search to the remaining toolset
    if (!searchQuery.trim()) return categoryMatched;
    
    return searchTools(categoryMatched, searchQuery);
  }, [searchQuery, selectedCategory]);

  const isFiltering = searchQuery.length > 0 || selectedCategory !== null;
  const categories = Array.from(new Set(filteredTools.map(t => t.category))) as string[];

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
    <div className="space-y-32 relative">
      {isFiltering ? (
        <section id="search-results" className="animate-in fade-in duration-700">
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
            <section key={category} id={category.replace(/\s+/g, '-').toLowerCase()} className="animate-in fade-in duration-700">
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
