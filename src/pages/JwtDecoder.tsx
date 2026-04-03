import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Key, ShieldCheck, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

function base64UrlDecode(str: string): string {
  // Pad base64url string and convert to standard base64
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  const base64 = pad ? padded + "=".repeat(4 - pad) : padded;
  try {
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return atob(base64);
  }
}

function parseJwt(token: string) {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT: must have 3 parts separated by dots");
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  return { header, payload, signature: parts[2], raw: parts };
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

const EXAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const JsonBlock = ({ data }: { data: object }) => (
  <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap break-all text-foreground/80 bg-muted/20 p-4 rounded-xl border border-border/40">
    {JSON.stringify(data, null, 2)}
  </pre>
);

const JwtDecoder = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [token, setToken] = useState("");
  const [result, setResult] = useState<ReturnType<typeof parseJwt> | null>(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const decode = useCallback((val: string) => {
    setToken(val);
    if (!val.trim()) { setResult(null); setError(""); return; }
    try {
      setResult(parseJwt(val));
      setError("");
    } catch (e: any) {
      setResult(null);
      setError(e.message || "Failed to decode token");
    }
  }, []);

  const handleFile = async (f: File | undefined) => {
    if (!f) return;
    const text = await f.text();
    decode(text);
  };

  usePasteFile(handleFile);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const exp = result?.payload?.exp as number | undefined;
  const iat = result?.payload?.iat as number | undefined;
  const isExpired = exp ? Date.now() / 1000 > exp : false;

  const now = Math.floor(Date.now() / 1000);
  const secsLeft = exp ? exp - now : null;
  const timeLeft =
    secsLeft !== null && secsLeft > 0
      ? secsLeft > 3600
        ? `${Math.floor(secsLeft / 3600)}h ${Math.floor((secsLeft % 3600) / 60)}m left`
        : `${Math.floor(secsLeft / 60)}m ${secsLeft % 60}s left`
      : null;

  return (
    <div className="min-h-screen bg-background text-foreground theme-utility transition-colors duration-500">
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
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow leading-none">
                JWT <span className="text-primary italic">Decoder</span>
              </h1>
              <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[9px]">
                Inspect • Decode • Validate — 100% Local
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-muted/5 p-8">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Paste Your JWT</p>
                      <KbdShortcut />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 border border-primary/10 rounded-2xl"
                      onClick={() => decode(EXAMPLE_JWT)}
                    >
                      Load Example
                    </Button>
                  </div>
                  <textarea
                    value={token}
                    onChange={(e) => decode(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
                    className="min-h-[120px] w-full resize-none bg-transparent border border-border/30 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 font-mono leading-relaxed custom-scrollbar break-all"
                  />
                  {error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}
                </CardContent>
              </Card>

              {result && (
                <div className="space-y-4">
                  {/* Expiry Banner */}
                  {exp && (
                    <div className={`flex items-center gap-3 p-4 rounded-2xl border font-medium text-sm ${isExpired ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
                      <Clock className="h-4 w-4 shrink-0" />
                      {isExpired
                        ? `Token expired on ${formatDate(exp)}`
                        : `Valid · expires ${formatDate(exp)} (${timeLeft ?? "soon"})`}
                    </div>
                  )}

                  {/* Header */}
                  <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-muted/5">
                    <div className="bg-blue-500/10 p-5 border-b border-blue-500/10 flex items-center justify-between rounded-t-2xl">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Key className="h-3.5 w-3.5 text-blue-400" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Header</h3>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500/10 text-blue-400 border border-blue-500/10" onClick={() => copy(JSON.stringify(result.header, null, 2), "header")}>
                        {copiedKey === "header" ? <><Check className="h-3 w-3 mr-1" />Copied</> : <><Copy className="h-3 w-3 mr-1" />Copy</>}
                      </Button>
                    </div>
                    <CardContent className="p-6">
                      <JsonBlock data={result.header} />
                    </CardContent>
                  </Card>

                  {/* Payload */}
                  <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-muted/5">
                    <div className="bg-violet-500/10 p-5 border-b border-violet-500/10 flex items-center justify-between rounded-t-2xl">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
                          <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Payload</h3>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-violet-500/10 text-violet-400 border border-violet-500/10" onClick={() => copy(JSON.stringify(result.payload, null, 2), "payload")}>
                        {copiedKey === "payload" ? <><Check className="h-3 w-3 mr-1" />Copied</> : <><Copy className="h-3 w-3 mr-1" />Copy</>}
                      </Button>
                    </div>
                    <CardContent className="p-6">
                      <JsonBlock data={result.payload} />
                    </CardContent>
                  </Card>

                  {/* Signature */}
                  <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-muted/5">
                    <div className="bg-amber-500/10 p-5 border-b border-amber-500/10 flex items-center justify-between rounded-t-2xl">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <Key className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Signature</h3>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-500/10 hover:text-amber-300 text-amber-400 border border-amber-500/10" onClick={() => copy(result.signature, "sig")}>
                        {copiedKey === "sig" ? <><Check className="h-3 w-3 mr-1" />Copied</> : <><Copy className="h-3 w-3 mr-1" />Copy</>}
                      </Button>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-xs font-mono break-all text-foreground/60 bg-muted/20 p-4 rounded-xl border border-border/40">{result.signature}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="flex justify-center">
                <AdPlaceholder format="banner" className="opacity-50 grayscale hover:grayscale-0 transition-all" />
              </div>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl studio-gradient border-border/20">
                <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Token Stats</h3>
                  {token && (
                    <Button onClick={() => { setToken(""); setResult(null); setError(""); }} variant="ghost" size="sm" className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-2xl transition-all">
                      Reset
                    </Button>
                  )}
                </div>
                <CardContent className="p-8 space-y-6">
                  {result ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/5 p-4 rounded-2xl border border-border/50">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Algorithm</p>
                          <p className="text-lg font-black italic tracking-tighter">{result.header.alg ?? "—"}</p>
                        </div>
                        <div className="bg-muted/5 p-4 rounded-2xl border border-border/50">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Type</p>
                          <p className="text-lg font-black italic tracking-tighter">{result.header.typ ?? "—"}</p>
                        </div>
                      </div>
                      {iat && (
                        <div className="bg-muted/5 p-4 rounded-2xl border border-border/50">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Issued At</p>
                          <p className="text-xs font-bold">{formatDate(iat)}</p>
                        </div>
                      )}
                      {exp && (
                        <div className={`p-4 rounded-2xl border ${isExpired ? "bg-destructive/5 border-destructive/20" : "bg-emerald-500/5 border-emerald-500/20"}`}>
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Expires</p>
                          <p className="text-xs font-bold">{formatDate(exp)}</p>
                          <p className={`text-[9px] font-black uppercase mt-1 ${isExpired ? "text-destructive" : "text-emerald-400"}`}>
                            {isExpired ? "⚠ EXPIRED" : `✓ ${timeLeft ?? "Valid"}`}
                          </p>
                        </div>
                      )}
                      <div className="bg-muted/5 p-4 rounded-2xl border border-border/50">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Claims</p>
                        <p className="text-2xl font-black italic tracking-tighter">{Object.keys(result.payload).length}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic py-8">Paste a JWT to inspect</p>
                  )}
                  <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic">
                    Local decode only · Signature not verified
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

export default JwtDecoder;
