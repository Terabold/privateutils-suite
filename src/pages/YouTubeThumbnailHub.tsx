import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Check, Youtube, CloudUpload, Type, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import ToolBottomDescription from '@/components/ToolBottomDescription';

import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";
import ControlHint from "@/components/ControlHint";
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
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1280&h=720&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558494949-ef0101551d4?q=80&w=1280&h=720&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1280&h=720&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1280&h=720&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1280&h=720&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1280&h=720&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1280&h=720&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1280&h=720&auto=format&fit=crop"
];

const YouTubeThumbnailHub = () => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
    }
    return true;
  });
  const [image, setImage] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<'watch' | 'home' | 'search'>('watch');
  const [ytTheme, setYtTheme] = useState<'dark' | 'light'>(darkMode ? 'dark' : 'light');
  const [title, setTitle] = useState("I coded a private AI cluster for $500");

  const inputRef = useRef<HTMLInputElement>(null);

  // Simulation Stage Refs (standard HTML refs)
  const watchRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setYtTheme(next ? 'dark' : 'light');
  }, [darkMode]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  usePasteFile(handleFile);

  const getOtherTitle = (i: number) => RANDOM_TITLES[i % RANDOM_TITLES.length];
  const getOtherThumb = (i: number) => RANDOM_THUMBNAILS[i % RANDOM_THUMBNAILS.length];

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300 ">
      

      <div className="flex justify-center items-start w-full relative">
        {/* SponsorSidebars position="left" removed */}

        <main className="container mx-auto max-w-[1240px] px-6 py-6 grow">
          <div className="flex flex-col gap-6">
            <header className="flex items-center justify-between flex-wrap gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-6">
                <Link to="/">
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all group/back bg-background/50 backdrop-blur-md shadow-xl">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                    YouTube Thumbnail <span className="text-primary italic">Hub</span>
                  </h1>
                  <p className="text-muted-foreground mt-1 font-black uppercase tracking-[0.2em] opacity-40 text-[9px]">Pixel-Perfect Platform Simulation Hub</p>
                </div>
              </div>

              <Button
                onClick={() => inputRef.current?.click()}
                variant="outline"
                className="h-12 px-6 rounded-xl border border-primary/20 bg-background text-foreground font-black uppercase italic shadow-2xl gap-3 hover:bg-primary hover:text-white transition-all duration-300"
              >
                <CloudUpload className="h-5 w-5" />
                {image ? "Swap Artifact" : "Load Artifact"}
              </Button>
            </header>

            <div className="p-4 rounded-2xl bg-card border border-white/10 flex flex-wrap items-center gap-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 inline-flex w-full">
              <div className="flex flex-col gap-1 flex-1 min-w-[300px]">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-primary px-1 opacity-60 italic">Simulation Video Title</label>
                <div className="relative group">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                  <input
                    id="youtube-title-input"
                    name="youtube-title-input"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter simulation title..."
                    className="w-full h-11 pl-12 pr-6 rounded-xl bg-background/40 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none text-sm font-black tracking-tight"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 px-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-primary opacity-60 italic">Layout Mode</label>
                  <ControlHint
                    label="Layout mode"
                    title="Layout Mode"
                    description="Preview the thumbnail in different YouTube discovery contexts."
                    rows={[
                      { label: "Watch", description: "Main video page with recommendations beside the player." },
                      { label: "Home", description: "Homepage card view where title and channel compete for attention." },
                      { label: "Search", description: "Search result layout with smaller, scan-heavy thumbnails." },
                    ]}
                  />
                </div>
                <div className="flex bg-background/40 p-1 rounded-xl border border-white/10 h-11">
                  {(['watch', 'home', 'search'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setLayoutMode(m)}
                      className={`px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${layoutMode === m ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {m === 'watch' ? 'Watch' : m === 'home' ? 'Home' : 'Search'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 px-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-primary opacity-60 italic">Simulation Theme</label>
                  <ControlHint
                    label="Simulation theme"
                    title="Simulation Theme"
                    description="Check thumbnail contrast against common YouTube UI themes."
                    rows={[
                      { label: "Dark", description: "Best for spotting weak dark edges and low-contrast text." },
                      { label: "Light", description: "Best for testing white backgrounds and pale artwork." },
                    ]}
                  />
                </div>
                <div className="flex bg-background/40 p-1 rounded-xl border border-white/10 h-11">
                  <button
                    onClick={() => setYtTheme('dark')}
                    className={`flex items-center justify-center gap-2 px-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${ytTheme === 'dark' ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-400"}`}
                  >
                    <Youtube className="h-3 w-3" /> Dark
                  </button>
                  <button
                    onClick={() => setYtTheme('light')}
                    className={`flex items-center justify-center gap-2 px-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${ytTheme === 'light' ? "bg-white text-zinc-900 shadow-lg" : "text-zinc-500 hover:text-zinc-400"}`}
                  >
                    <Youtube className="h-3 w-3 text-red-600" /> Light
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

            {!image ? (
              <div className="min-h-[500px] flex items-center justify-center animate-in fade-in zoom-in duration-300">
                <Card
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                  className="relative w-full max-w-4xl aspect-video flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 text-center transition-all duration-300 cursor-pointer bg-primary/5 hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.02] shadow-inner group/upload"
                >
                  <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover/upload:scale-110 transition-transform duration-300">
                    <CloudUpload className="h-10 w-10 text-primary group-hover/dropzone:animate-bounce" />
                  </div>
                  <div className="px-6 space-y-2">
                    <p className="text-4xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Hub Artifact</p>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40 italic">Drag thumbnail or click to browse</p>
                    <KbdShortcut />
                  </div>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col gap-12">
                <AnimatePresence mode="wait">
                  {layoutMode === 'watch' && (
                    <motion.div
                      key="watch"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div ref={watchRef} className={`grid grid-cols-1 xl:grid-cols-12 gap-10 p-8 rounded-2xl transition-all duration-300 shadow-2xl ${ytTheme === 'dark' ? 'bg-[#0f0f0f] border border-white/5 text-white' : 'bg-[#f9f9f9] border border-zinc-200 text-black'}`}>
                        <div className="xl:col-span-8 space-y-6">
                          <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 group select-none">
                            <img
                              crossOrigin="anonymous"
                              src={image}
                              className="w-full h-full object-cover"
                              alt="Hub Preview"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1280&h=720&auto=format&fit=crop';
                              }}
                            />
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center gap-4">
                                <Play className="h-6 w-6 text-white fill-white shrink-0" />
                                <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-600 w-[45%]" />
                                </div>
                                <span className="text-[11px] font-bold text-white font-mono">10:24 / 23:15</span>
                              </div>
                            </div>
                            <div className="absolute top-4 left-4 flex items-center justify-center gap-2 bg-primary px-4 py-1.5 rounded-full shadow-lg z-20 border border-white/10 whitespace-nowrap w-max min-w-fit badge-wrap-fix">
                              <Star className="h-3.5 w-3.5 text-white fill-white shrink-0" />
                              <span className="text-[9px] font-black text-white uppercase tracking-tighter leading-none italic whitespace-nowrap">YOUR VIDEO</span>
                            </div>
                            <div className="absolute bottom-3 right-3 bg-black/90 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm border border-white/10">23:15</div>
                          </div>
                          <div className="space-y-4">
                            <h2 className={`text-2xl font-black tracking-tighter leading-tight italic font-display pr-4 overflow-visible ${ytTheme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{title}</h2>
                            <div className="flex flex-wrap items-center justify-between gap-6">
                              <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-full border ${ytTheme === 'dark' ? 'bg-[#272727] border-white/5' : 'bg-zinc-200 border-zinc-300'}`} />
                                <div>
                                  <p className={`font-black text-base leading-none uppercase tracking-tighter ${ytTheme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>PrivateUtils Labs</p>
                                  <p className={`text-[9px] mt-1 uppercase font-black tracking-widest ${ytTheme === 'dark' ? 'text-white/60' : 'text-zinc-500'}`}>1.2M subscribers</p>
                                </div>
                                <Button className={`rounded-full font-black text-xs h-10 px-6 ml-4 hover:opacity-90 uppercase tracking-widest transition-all ${ytTheme === 'dark' ? "bg-white text-black" : "bg-zinc-900 text-white"}`}>Subscribe</Button>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`h-10 px-6 rounded-full border flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest ${ytTheme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-zinc-100 border-zinc-200 text-zinc-600'}`}>
                                  <Check className="h-4 w-4" /> 254K
                                </div>
                                <div className={`h-10 px-8 rounded-full border flex items-center justify-center text-[9px] font-black uppercase tracking-widest ${ytTheme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-zinc-100 border-zinc-200 text-zinc-600'}`}>Share</div>
                                <div className={`h-10 w-10 rounded-full border flex items-center justify-center text-sm font-black ${ytTheme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-zinc-100 border-zinc-200 text-zinc-600'}`}>...</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="xl:col-span-4 space-y-4 relative">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className={`flex gap-2 group cursor-pointer border-t py-3 first:border-0 first:pt-0 ${ytTheme === 'dark' ? 'border-white/5' : 'border-zinc-200'}`}>
                              <div className={`w-[168px] aspect-[16/9] rounded-2xl overflow-hidden shrink-0 relative border ${ytTheme === 'dark' ? 'bg-[#272727] border-white/5' : 'bg-zinc-100 border-zinc-200'}`}>
                                <img
                                  crossOrigin="anonymous"
                                  src={i === 1 ? (image || "") : getOtherThumb(i)}
                                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1280&h=720&auto=format&fit=crop';
                                  }}
                                />
                                <div className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-black px-1 rounded-sm text-white">10:24</div>
                                {i === 1 && (
                                  <div className="absolute top-1.5 left-1.5 bg-primary p-0.5 rounded-full shadow-lg border border-white/10 z-20">
                                    <Star className="h-2.5 w-2.5 text-white fill-white shrink-0" />
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1 py-0.5 overflow-hidden">
                                <h4 className={`text-sm font-black leading-snug line-clamp-2 pr-4 overflow-visible transition-colors duration-300 ${ytTheme === 'dark' ? 'text-white/90 group-hover:text-primary' : 'text-zinc-900 group-hover:text-primary'}`}>{i === 1 ? title : getOtherTitle(i)}</h4>
                                <p className={`text-[9px] mt-1 font-black uppercase tracking-widest ${ytTheme === 'dark' ? 'text-white/40' : 'text-zinc-500'}`}>{i === 1 ? 'PrivateUtils Labs' : `Casual YouTuber ${i}`}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {layoutMode === 'home' && (
                    <motion.div
                      key="home"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div ref={homeRef} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-12 p-8 rounded-2xl transition-all duration-300 shadow-2xl ${ytTheme === 'dark' ? 'bg-[#0f0f0f] border border-white/5 text-white' : 'bg-[#f9f9f9] border border-zinc-200 text-black'}`}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                          <div key={i} className={`flex flex-col gap-3 group cursor-pointer transition-all duration-300 h-fit ${i === 1 ? 'order-first' : ''}`}>
                            <div className={`relative aspect-[16/9] w-full rounded-xl overflow-hidden border shadow-lg transition-all duration-300 ${ytTheme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-zinc-100 border-zinc-200'}`}>
                              <img
                                crossOrigin="anonymous"
                                src={i === 1 ? (image || "") : getOtherThumb(i)}
                                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1280&h=720&auto=format&fit=crop';
                                }}
                              />
                              {i === 1 && (
                                <div className="absolute top-2 left-2 flex items-center justify-center gap-1.5 bg-primary px-3 py-1 rounded-full shadow-lg border border-white/10 z-20 whitespace-nowrap w-max min-w-fit badge-wrap-fix">
                                  <Star className="h-2.5 w-2.5 text-white fill-white shrink-0" />
                                  <span className="text-[9px] font-black text-white uppercase tracking-tighter leading-none italic whitespace-nowrap">YOUR VIDEO</span>
                                </div>
                              )}
                              <div className="absolute bottom-2 right-2 bg-black/90 text-white text-[11px] font-black px-1.5 py-0.5 rounded-sm">15:30</div>
                            </div>
                            <div className="flex gap-3 px-1 mt-1">
                              <div className={`h-9 w-9 rounded-full shrink-0 mt-1 border ${ytTheme === 'dark' ? 'bg-zinc-800 border-white/5' : 'bg-zinc-200 border-zinc-300'}`} />
                              <div className="space-y-1">
                                <h3 className={`text-[15px] font-black leading-tight line-clamp-2 tracking-tighter pr-4 overflow-visible transition-colors duration-300 ${i === 1 ? 'text-primary' : (ytTheme === 'dark' ? 'text-white' : 'text-zinc-900')}`}>{i === 1 ? title : getOtherTitle(i)}</h3>
                                <p className={`text-[9px] mt-1 uppercase font-black tracking-widest ${ytTheme === 'dark' ? 'text-white/40' : 'text-zinc-500'}`}>{i === 1 ? 'PrivateUtils Labs' : `YouTuber ${i}`}</p>
                                <p className={`text-[9px] uppercase font-black tracking-widest ${ytTheme === 'dark' ? 'text-white/40' : 'text-zinc-500'}`}>1.2M views • 2 hours ago</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {layoutMode === 'search' && (
                    <motion.div
                      key="search"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div ref={searchRef} className={`max-w-[1240px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-12 p-8 rounded-2xl transition-all duration-300 shadow-2xl ${ytTheme === 'dark' ? 'bg-[#0f0f0f] border border-white/5 text-white' : 'bg-[#f9f9f9] border border-zinc-200 text-black'}`}>
                        <div className="space-y-6">
                          {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className={`flex flex-col sm:flex-row gap-6 group cursor-pointer transition-all duration-300 ${i === 1 ? 'order-first' : ''}`}>
                              <div className={`w-full sm:w-[360px] aspect-[16/9] rounded-xl overflow-hidden shrink-0 relative border shadow-xl transition-all duration-300 ${ytTheme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-zinc-100 border-zinc-200'}`}>
                                <img
                                  crossOrigin="anonymous"
                                  src={i === 1 ? (image || "") : getOtherThumb(i)}
                                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1280&h=720&auto=format&fit=crop';
                                  }}
                                />
                                {i === 1 && (
                                  <div className="absolute top-3 left-3 flex items-center justify-center gap-2 bg-primary px-4 py-1.5 rounded-full shadow-lg border border-white/10 z-20 whitespace-nowrap w-max min-w-fit badge-wrap-fix">
                                    <Star className="h-3.5 w-3.5 text-white fill-white shrink-0" />
                                    <span className="text-[9px] font-black text-white uppercase tracking-tighter leading-none italic whitespace-nowrap">YOUR VIDEO</span>
                                  </div>
                                )}
                                <div className="absolute bottom-2 right-2 bg-black/90 text-white text-[12px] font-black px-1.5 py-0.5 rounded-sm">12:45</div>
                              </div>
                              <div className="flex-1 py-1 space-y-2">
                                <h3 className={`text-xl font-black leading-tight line-clamp-2 italic tracking-tighter pr-4 overflow-visible transition-colors duration-300 ${i === 1 ? 'text-primary' : (ytTheme === 'dark' ? 'text-white' : 'text-zinc-900')}`}>{i === 1 ? title : getOtherTitle(i)}</h3>
                                <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest ${ytTheme === 'dark' ? 'text-white/40' : 'text-zinc-500'}`}>
                                  <span>{i === 1 ? '1.2M views' : `${Math.floor(Math.random() * 500) + 10}K views`}</span>
                                  <span>•</span>
                                  <span>{i === 1 ? '2 hours ago' : `${i} days ago`}</span>
                                </div>
                                <div className="flex items-center gap-3 py-2">
                                  <div className={`h-6 w-6 rounded-full border ${ytTheme === 'dark' ? 'bg-zinc-800 border-white/5' : 'bg-zinc-200 border-zinc-300'}`} />
                                  <span className={`text-[12px] font-black uppercase tracking-tighter transition-colors duration-300 ${i === 1 ? 'text-primary' : (ytTheme === 'dark' ? 'text-white/60 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900')}`}>{i === 1 ? 'PrivateUtils Labs' : `Channel AI ${i}`}</span>
                                </div>
                                <p className={`text-[12px] line-clamp-2 italic leading-relaxed ${ytTheme === 'dark' ? 'text-white/30' : 'text-zinc-500'}`}>Learn how to use state-of-the-art encryption protocols and local-first data processing to ensure your information never leaves your hardware...</p>
                                <div className="flex gap-2 pt-1">
                                  <span className="text-[9px] bg-primary/10 px-2 py-0.5 rounded uppercase font-black tracking-widest text-primary border border-primary/20">Artifact</span>
                                  <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-black tracking-widest border ${ytTheme === 'dark' ? 'bg-white/5 text-white/40 border-white/10' : 'bg-zinc-100 text-zinc-400 border-zinc-200'}`}>4K</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <aside className="hidden xl:flex flex-col gap-6 sticky top-24 h-fit">

                        </aside>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* SEO & Tool Guide Section */}
            <ToolBottomDescription toolId="/youtube-thumbnail-hub" />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
      <StickyAnchorAd />
      <input ref={inputRef} id="youtube-local-upload-input" name="youtube-local-upload-input" type="file" className="hidden" accept="image/*" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
};

export default YouTubeThumbnailHub;
