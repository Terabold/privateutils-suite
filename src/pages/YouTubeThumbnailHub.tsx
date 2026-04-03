import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Play, Check, Youtube, CloudUpload, Type, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

const RANDOM_TITLES = [
  "I Spent 100 Days in a Secret Underground Bunker",
  "World's Most Expensive Stealth Setup Tour (2024)",
  "Why Everyone is Leaving Silicon Valley Right Now",
  "How to Build a Private AI Cluster for $500",
  "The Rise and Fall of the Great Encryption Wars",
  "10 Privacy Settings You MUST Turn Off Today",
  "Testing the World's most Secure Hard Drive",
  "Can You Survive 24 Hours with ZERO Digital Footprint?",
  "Exploring the Abandoned Servers of a Tech Giant",
  "Cybersecurity Experts reacting to Movie Hacks",
  "Stop using Google Chrome! (Do this instead)",
  "Evolution of the Most Popular Programming Languages",
  "Is your Smart Home spying on you? (SHOCKING)",
  "I Coded a Bot that Trade Stocks for Me",
  "Life in a World without Personal Privacy"
];

const RANDOM_THUMBNAILS = [
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558494949-ef01091551d4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop"
];

const YouTubeThumbnailHub = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [image, setImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'watch' | 'home' | 'search'>('watch');
  const [ytTheme, setYtTheme] = useState<'dark' | 'light'>(darkMode ? 'dark' : 'light');
  const [title, setTitle] = useState("I coded a private AI cluster for $500");
  
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  usePasteFile(handleFile);

  const downloadScreenshot = async () => {
    if (!image || !stageRef.current || !canvasRef.current) return;
    setProcessing(true);

    const stage = stageRef.current;
    const rect = stage.getBoundingClientRect();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = rect.width;
    canvas.height = rect.height;

    const bg = ytTheme === 'dark' ? '#0f0f0f' : '#ffffff';
    const text = ytTheme === 'dark' ? '#ffffff' : '#0f0f0f';

    const svgMarkup = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="
            width: ${rect.width}px;
            height: ${rect.height}px;
            position: relative;
            background: ${bg};
            color: ${text};
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            font-family: sans-serif;
          ">
            ${stage.innerHTML}
          </div>
        </foreignObject>
      </svg>
    `.replace(/class="[^"]*"/g, "");

    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
    const tempImg = new Image();
    tempImg.crossOrigin = "anonymous";
    tempImg.src = svgUrl;

    tempImg.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempImg, 0, 0);
      const link = document.createElement("a");
      link.download = `youtube-${layoutMode}-${ytTheme}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setProcessing(false);
    };
  };

  const getOtherTitle = (i: number) => RANDOM_TITLES[i % RANDOM_TITLES.length];
  const getOtherThumb = (i: number) => RANDOM_THUMBNAILS[i % RANDOM_THUMBNAILS.length];

  return (
    <div className="min-h-screen bg-background text-foreground theme-video transition-all duration-300">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <div className="flex justify-center items-start w-full relative">
        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-left-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
        </aside>

        <main className="container mx-auto max-w-[1400px] px-6 py-12 grow">
        <div className="flex flex-col gap-10">
          <header className="flex flex-col gap-8">
            <div className="flex items-center justify-between flex-wrap gap-8">
              <div className="flex items-center gap-6">
                <Link to="/">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-border hover:bg-muted transition-all group/back">
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow leading-none">
                    Thumbnail <span className="text-primary italic">Hub</span>
                  </h1>
                  <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Pixel-Perfect Platform Simulation Hub</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                  {image && (
                    <Button 
                      onClick={downloadScreenshot} 
                      disabled={processing} 
                      className="gap-3 h-14 px-8 font-black text-lg shadow-xl shadow-primary/10 rounded-2xl uppercase italic group/btn overflow-hidden relative active:scale-95 transition-all"
                    >
                      <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                      <Download className="h-5 w-5 relative z-10" />
                      <span className="relative z-10">{processing ? "Baking..." : "Export Preview"}</span>
                    </Button>
                  )}
                  <Button 
                    onClick={() => inputRef.current?.click()} 
                    variant="outline" 
                    className="h-14 px-8 rounded-2xl border-border bg-muted/50 text-foreground font-bold uppercase italic gap-3 hover:bg-foreground hover:text-background transition-all duration-300"
                  >
                    <CloudUpload className="h-5 w-5" />
                    {image ? "Swap Artifact" : "Load Artifact"}
                  </Button>
               </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border flex flex-wrap items-center gap-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 inline-flex w-full">
               <div className="flex flex-col gap-1 flex-1 min-w-[300px]">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary px-1 opacity-60">Mock Video Title</label>
                  <div className="relative group">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter simulation title..."
                      className="w-full h-11 pl-12 pr-6 rounded-xl bg-secondary border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none text-sm font-bold tracking-tight"
                    />
                  </div>
               </div>

               <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary px-1 opacity-60">Layout Mode</label>
                  <div className="flex bg-secondary p-1 rounded-xl border border-border h-11">
                    {(['watch', 'home', 'search'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setLayoutMode(m)}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${layoutMode === m ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {m === 'watch' ? 'Watch' : m === 'home' ? 'Home' : 'Search'}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary px-1 opacity-60">Simulation Theme</label>
                  <div className="flex bg-secondary p-1 rounded-xl border border-border h-11">
                      <button 
                        onClick={() => setYtTheme('dark')}
                        className={`flex items-center justify-center gap-2 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${ytTheme === 'dark' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-400'}`}
                      >
                        <Youtube className="h-3 w-3" /> Dark
                      </button>
                      <button 
                        onClick={() => setYtTheme('light')}
                        className={`flex items-center justify-center gap-2 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${ytTheme === 'light' ? 'bg-white text-zinc-900 shadow-lg' : 'text-zinc-500 hover:text-zinc-400'}`}
                      >
                        <Youtube className="h-3 w-3 text-red-600" /> Light
                      </button>
                  </div>
               </div>
            </div>
          </header>

          {!image ? (
              <div className="min-h-[500px] flex items-center justify-center animate-in fade-in zoom-in duration-300">
                <Card 
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                  className="w-full max-w-4xl aspect-video flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-border text-center transition-all cursor-pointer bg-card hover:border-primary/40 hover:bg-primary/5 shadow-xl group relative overflow-hidden"
                >
                  <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <CloudUpload className="h-10 w-10 text-primary" />
                  </div>
                  <div className="px-6 space-y-2">
                    <p className="text-4xl font-bold text-foreground tracking-tighter italic leading-none">Deploy Hub Artifact</p>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-40">Drag thumbnail or click to browse</p>
                    <KbdShortcut />
                  </div>
                </Card>
             </div>
          ) : (
            <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-10 duration-300">
               
               {layoutMode === 'watch' && (
                 <div className={`grid grid-cols-1 xl:grid-cols-12 gap-10 p-8 rounded-[2.5rem] transition-all duration-300 ${ytTheme === 'dark' ? 'bg-[#0f0f0f] border border-white/5' : 'bg-[#f9f9f9] border border-zinc-200 shadow-2xl'}`}>
                    <div className="xl:col-span-9 space-y-6">
                       <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl border border-white/5 group select-none">
                         <img src={image} className="w-full h-full object-cover" alt="Hub Preview" />
                         <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-4">
                               <Play className="h-6 w-6 text-white fill-white" />
                               <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-600 w-[45%]" />
                               </div>
                               <span className="text-[11px] font-bold text-white font-mono">10:24 / 23:15</span>
                            </div>
                         </div>
                         <div className="absolute top-4 left-4 flex items-center gap-2 bg-primary px-3 py-1.5 rounded-full shadow-lg">
                           <Star className="h-3 w-3 text-white fill-white" />
                           <span className="text-[9px] font-bold text-white uppercase tracking-widest leading-none">YOUR VIDEO</span>
                         </div>
                         <div className="absolute bottom-3 right-3 bg-black/90 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm border border-white/10">23:15</div>
                       </div>
                       <div className="space-y-4">
                          <h2 className={`text-2xl font-bold tracking-tighter leading-tight italic font-display ${ytTheme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{title}</h2>
                          <div className="flex flex-wrap items-center justify-between gap-6">
                             <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-full border ${ytTheme === 'dark' ? 'bg-[#272727] border-white/5' : 'bg-zinc-200 border-zinc-300'}`} />
                                <div>
                                   <p className={`font-bold text-base leading-none uppercase tracking-tighter ${ytTheme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Privacy Suite Labs</p>
                                   <p className={`text-[10px] mt-1 uppercase font-bold tracking-widest ${ytTheme === 'dark' ? 'text-white/60' : 'text-zinc-500'}`}>1.2M subscribers</p>
                                </div>
                                <Button className={`rounded-full font-bold text-xs h-10 px-6 ml-4 hover:opacity-90 uppercase tracking-widest transition-all ${ytTheme === 'dark' ? 'bg-white text-black' : 'bg-zinc-900 text-white'}`}>Subscribe</Button>
                             </div>
                             <div className="flex items-center gap-2">
                                <div className={`h-10 px-6 rounded-full border flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest ${ytTheme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-zinc-100 border-zinc-200 text-zinc-600'}`}>
                                   <Check className="h-4 w-4" /> 254K
                                </div>
                                <div className={`h-10 px-8 rounded-full border flex items-center justify-center text-[10px] font-bold uppercase tracking-widest ${ytTheme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-zinc-100 border-zinc-200 text-zinc-600'}`}>Share</div>
                                <div className={`h-10 w-10 rounded-full border flex items-center justify-center text-sm font-bold ${ytTheme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-zinc-100 border-zinc-200 text-zinc-600'}`}>...</div>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="xl:col-span-3 space-y-4 relative">
                       <AdPlaceholder format="rectangle" className="mb-4 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all border-white/10" />
                       {[1,2,3,4,5,6].map((i) => (
                         <div key={i} className={`flex gap-3 group cursor-pointer border-t py-3 first:border-0 first:pt-0 ${ytTheme === 'dark' ? 'border-white/5' : 'border-zinc-200'}`}>
                            <div className={`w-40 aspect-video rounded-lg overflow-hidden shrink-0 relative border ${ytTheme === 'dark' ? 'bg-[#272727] border-white/5' : 'bg-zinc-100 border-zinc-200'}`}>
                               <img src={i === 1 ? (image || "") : getOtherThumb(i)} className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105" />
                               <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-bold px-1 rounded-sm text-white">10:24</div>
                               {i === 1 && (
                                <div className="absolute top-1 left-1 bg-primary p-0.5 rounded-full shadow-lg ring-1 ring-white/20">
                                  <Star className="h-2 w-2 text-white fill-white" />
                                </div>
                               )}
                            </div>
                            <div className="space-y-1 overflow-hidden">
                               <h4 className={`text-[12px] font-bold leading-tight line-clamp-2 italic tracking-tighter transition-colors duration-300 ${ytTheme === 'dark' ? 'text-white/90 group-hover:text-primary font-bold' : 'text-zinc-900 group-hover:text-primary font-bold'}`}>{i === 1 ? title : getOtherTitle(i)}</h4>
                               <p className={`text-[10px] uppercase font-bold tracking-widest ${ytTheme === 'dark' ? 'text-white/40' : 'text-zinc-500'}`}>{i === 1 ? 'Privacy Suite Labs' : `Casual YouTuber ${i}`}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {layoutMode === 'home' && (
                 <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8 rounded-[2.5rem] transition-all duration-300 ${ytTheme === 'dark' ? 'bg-[#0f0f0f] border border-white/5' : 'bg-[#f9f9f9] border border-zinc-200 shadow-2xl'}`}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                      <div key={i} className={`flex flex-col gap-3 group cursor-pointer transition-all duration-300 ${i === 1 ? 'order-first' : ''}`}>
                         <div className={`relative aspect-video w-full rounded-xl overflow-hidden border shadow-lg transition-all duration-300 ${ytTheme === 'dark' ? 'bg-[#272727] border-white/5' : 'bg-zinc-100 border-zinc-200'}`}>
                            <img src={i === 1 ? (image || "") : getOtherThumb(i)} className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105" />
                            {i === 1 && (
                              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-primary px-2.5 py-1 rounded-full shadow-lg ring-1 ring-white/20 animate-pulse z-10">
                                <Star className="h-2.5 w-2.5 text-white fill-white" />
                                <span className="text-[8px] font-bold text-white uppercase tracking-widest leading-none">YOUR VIDEO</span>
                              </div>
                            )}
                            <div className="absolute bottom-2 right-2 bg-black/90 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">15:30</div>
                         </div>
                         <div className="flex gap-3 px-1 mt-1">
                            <div className={`h-9 w-9 rounded-full shrink-0 mt-1 border ${ytTheme === 'dark' ? 'bg-[#272727] border-white/5' : 'bg-zinc-200 border-zinc-300'}`} />
                            <div className="space-y-1">
                               <h3 className={`text-[15px] font-bold leading-tight line-clamp-2 tracking-tighter transition-colors duration-300 ${i === 1 ? 'text-primary' : (ytTheme === 'dark' ? 'text-white group-hover:text-primary font-bold' : 'text-zinc-900 group-hover:text-primary font-bold')}`}>{i === 1 ? title : getOtherTitle(i)}</h3>
                               <p className={`text-[11px] mt-1 uppercase font-bold ${ytTheme === 'dark' ? 'text-white/40' : 'text-zinc-500'}`}>{i === 1 ? 'Privacy Suite Labs' : `YouTuber ${i}`}</p>
                               <p className={`text-[11px] uppercase font-bold ${ytTheme === 'dark' ? 'text-white/40' : 'text-zinc-500'}`}>1.2M views • 2 hours ago</p>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
               )}

               {layoutMode === 'search' && (
                 <div className={`max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-12 p-8 rounded-[2.5rem] transition-all duration-300 ${ytTheme === 'dark' ? 'bg-[#0f0f0f] border border-white/5' : 'bg-[#f9f9f9] border border-zinc-200 shadow-2xl'}`}>
                    <div className="space-y-6">
                        {[1,2,3,4,5,6].map(i => (
                          <div key={i} className={`flex flex-col sm:flex-row gap-6 group cursor-pointer transition-all duration-300 ${i === 1 ? 'order-first' : ''}`}>
                             <div className={`w-full sm:w-[360px] aspect-video rounded-xl overflow-hidden shrink-0 relative border shadow-xl transition-all duration-300 ${ytTheme === 'dark' ? 'bg-[#272727] border-white/5' : 'bg-zinc-100 border-zinc-200'}`}>
                                <img src={i === 1 ? (image || "") : getOtherThumb(i)} className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105" />
                                {i === 1 && (
                                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-primary px-3 py-1.5 rounded-full shadow-lg ring-1 ring-white/20 animate-pulse z-10">
                                    <Star className="h-3 w-3 text-white fill-white" />
                                    <span className="text-[9px] font-bold text-white uppercase tracking-widest leading-none">YOUR VIDEO</span>
                                  </div>
                                )}
                                <div className="absolute bottom-2 right-2 bg-black/90 text-white text-[12px] font-bold px-1.5 py-0.5 rounded-sm">12:45</div>
                             </div>
                             <div className="flex-1 py-1 space-y-2">
                                <h3 className={`text-xl font-bold leading-tight line-clamp-2 italic tracking-tighter group-hover:text-primary transition-colors duration-300 ${i === 1 ? 'text-primary font-bold' : (ytTheme === 'dark' ? 'text-white' : 'text-zinc-900')}`}>{i === 1 ? title : getOtherTitle(i)}</h3>
                                <div className={`flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest ${ytTheme === 'dark' ? 'text-white/40' : 'text-zinc-500'}`}>
                                   <span>{i === 1 ? '1.2M views' : `${Math.floor(Math.random() * 500) + 10}K views`}</span>
                                   <span>•</span>
                                   <span>{i === 1 ? '2 hours ago' : `${i} days ago`}</span>
                                </div>
                                <div className="flex items-center gap-3 py-2">
                                   <div className={`h-6 w-6 rounded-full border ${ytTheme === 'dark' ? 'bg-[#272727] border-white/5' : 'bg-zinc-200 border-zinc-300'}`} />
                                   <span className={`text-[12px] font-bold uppercase tracking-tighter transition-colors duration-300 ${i === 1 ? 'text-primary opacity-100 font-bold' : (ytTheme === 'dark' ? 'text-white/60 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900')}`}>{i === 1 ? 'Privacy Suite Labs' : `Channel AI ${i}`}</span>
                                </div>
                                <p className={`text-[12px] line-clamp-2 italic leading-relaxed ${ytTheme === 'dark' ? 'text-white/30' : 'text-zinc-500'}`}>Learn how to use state-of-the-art encryption protocols and local-first data processing to ensure your information never leaves your hardware...</p>
                                <div className="flex gap-2 pt-1">
                                   <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded uppercase font-bold tracking-widest text-primary border border-primary/20">Artifact</span>
                                   <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest border ${ytTheme === 'dark' ? 'bg-white/5 text-white/40 border-white/10' : 'bg-zinc-100 text-zinc-400 border-zinc-200'}`}>4K</span>
                                </div>
                             </div>
                          </div>
                         ))}
                    </div>
                    <aside className="hidden xl:flex flex-col gap-6 sticky top-24 h-fit">
                       <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all border-border shadow-2xl" />
                    </aside>
                 </div>
               )}

               <div ref={stageRef} className="hidden">
                  <div style={{ width: '1280px', height: '720px', background: ytTheme === 'dark' ? '#0f0f0f' : '#ffffff', color: ytTheme === 'dark' ? '#ffffff' : '#0f0f0f', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={image || ""} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <h2 style={{ position: 'absolute', bottom: '80px', left: '40px', right: '40px', fontSize: '64px', fontWeight: '700', fontStyle: 'italic', color: '#ffffff', textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>{title}</h2>
                  </div>
               </div>
            </div>
          )}
        </div>
        </main>

        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-right-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
        </aside>
      </div>
      <Footer />
      <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default YouTubeThumbnailHub;
