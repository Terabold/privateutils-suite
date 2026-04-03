import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function nowUnix() {
  return Math.floor(Date.now() / 1000);
}

function toIso(date: Date) {
  return date.toISOString();
}

function toHuman(date: Date, timezone: string) {
  return date.toLocaleString("en-US", {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}

function parseInput(val: string): Date | null {
  if (!val.trim()) return null;
  // Try unix timestamp (seconds or ms)
  const num = Number(val.trim());
  if (!isNaN(num) && num > 0) {
    // Detect ms vs seconds: Unix seconds are < ~9999999999, ms are bigger
    const ts = num > 9999999999 ? num : num * 1000;
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }
  // Try ISO / natural date string
  const d = new Date(val.trim());
  return isNaN(d.getTime()) ? null : d;
}

function relativeTime(date: Date) {
  const diff = Math.floor((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diff);
  const past = diff < 0;
  if (abs < 60) return `${abs}s ${past ? "ago" : "from now"}`;
  if (abs < 3600) return `${Math.floor(abs / 60)}m ${past ? "ago" : "from now"}`;
  if (abs < 86400) return `${Math.floor(abs / 3600)}h ${past ? "ago" : "from now"}`;
  if (abs < 86400 * 30) return `${Math.floor(abs / 86400)}d ${past ? "ago" : "from now"}`;
  if (abs < 86400 * 365) return `${Math.floor(abs / 2592000)}mo ${past ? "ago" : "from now"}`;
  return `${Math.floor(abs / 31536000)}y ${past ? "ago" : "from now"}`;
}

const TimestampConverter = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [input, setInput] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const date = parseInput(input);
  const now = new Date();

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const CopyBtn = ({ val, id }: { val: string; id: string }) => (
    <button
      onClick={() => copy(val, id)}
      className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all ml-2 opacity-0 group-hover:opacity-100 shadow-sm"
    >
      {copiedKey === id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );

  const rows: { label: string; value: string; id: string }[] = date
    ? [
        { label: "Unix (seconds)", value: String(Math.floor(date.getTime() / 1000)), id: "unix_s" },
        { label: "Unix (milliseconds)", value: String(date.getTime()), id: "unix_ms" },
        { label: "ISO 8601", value: toIso(date), id: "iso" },
        { label: "RFC 2822", value: date.toUTCString(), id: "rfc" },
        { label: "Human Readable", value: toHuman(date, timezone), id: "human" },
        { label: "Day of Year", value: String(Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000)), id: "doy" },
        { label: "Week Number", value: String(Math.ceil(((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(date.getFullYear(), 0, 1).getDay() + 1) / 7)), id: "week" },
        { label: "Quarter", value: `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`, id: "quarter" },
        { label: "Relative", value: relativeTime(date), id: "rel" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground theme-utility transition-colors duration-500 overflow-x-hidden">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <div className="flex justify-center items-start w-full relative">
        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-left-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
        </aside>

        <main className="container mx-auto max-w-[1400px] px-6 py-12 grow">
        <div className="flex flex-col gap-10">
          <header className="flex items-center gap-6">
            <Link to="/">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow">
                Timestamp <span className="text-primary italic">Converter</span>
              </h1>
              <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                Unix · ISO · Human · Relative — Every Format Instantly
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-muted/5 p-8">
                <CardContent className="p-0 space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Input (Unix, ISO, or any date string)</p>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g. 1716239022 or 2024-05-20T12:00:00Z"
                        className="w-full bg-muted/10 border border-border/30 rounded-xl px-4 h-12 text-sm font-mono focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Timezone</p>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="bg-muted/10 border border-border/30 rounded-xl px-4 h-12 text-sm font-mono focus:outline-none focus:border-primary/40 text-foreground"
                      >
                        {TIMEZONES.map(tz => (
                          <option key={tz} value={tz} className="bg-background">{tz}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="gap-2 rounded-2xl h-10 text-xs font-black uppercase tracking-widest border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 shadow-lg shadow-primary/5"
                      onClick={() => setInput(String(nowUnix()))}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Now (Unix)
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 rounded-2xl h-10 text-xs font-black uppercase tracking-widest border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 shadow-lg shadow-primary/5"
                      onClick={() => setInput(now.toISOString())}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Now (ISO)
                    </Button>
                    {input && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setInput("")}
                        className="h-10 px-3 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-2xl"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {date && (
                <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-muted/5 overflow-hidden">
                  <div className="bg-primary/5 h-[56px] px-6 border-b border-primary/10 flex items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">All Formats</h3>
                  </div>
                  <CardContent className="p-0">
                    {rows.map((row, i) => (
                      <div
                        key={row.id}
                        className={`group flex items-center justify-between gap-4 px-6 py-1.5 ${i !== rows.length - 1 ? "border-b border-white/5" : ""} hover:bg-primary/5 transition-colors`}
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 w-40 shrink-0">{row.label}</p>
                        <p className="text-sm font-mono text-foreground/80 flex-1 break-all">{row.value}</p>
                        <CopyBtn val={row.value} id={row.id} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {!date && input && (
                <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                  Could not parse that input. Try a Unix timestamp, ISO 8601 string, or a natural date like "Jan 1, 2025".
                </div>
              )}

              <div className="flex justify-center">
                <AdPlaceholder format="banner" className="opacity-50 grayscale hover:grayscale-0 transition-all" />
              </div>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-primary/5 h-[56px] px-6 border-b border-primary/10 flex items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Clock</h3>
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="bg-muted/5 p-4 rounded-2xl border border-border/50">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Current Unix</p>
                    <p className="text-xl font-black italic font-mono tracking-tighter">{nowUnix()}</p>
                  </div>
                  <div className="bg-muted/5 p-4 rounded-2xl border border-border/50">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Current ISO</p>
                    <p className="text-xs font-mono break-all">{now.toISOString()}</p>
                  </div>
                  {date && (
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Parsed Input</p>
                      <p className="text-sm font-bold">{relativeTime(date)}</p>
                    </div>
                  )}
                  <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic">
                    All conversions are local · Zero uploads
                  </p>
                </CardContent>
              </Card>

              <div className="px-6">
                <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 transition-all border-border/50" />
              </div>
            </aside>
          </div>
        </div>
        </main>

        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-right-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all border-border/50" />
        </aside>
      </div>
      <Footer />
    </div>
  );
};

export default TimestampConverter;
