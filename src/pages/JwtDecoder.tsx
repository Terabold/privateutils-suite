import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Key, ShieldCheck, AlertTriangle, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import StickyAnchorAd from "@/components/StickyAnchorAd";
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
  <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap break-all text-foreground/80 bg-background/20 p-4 rounded-xl border border-border/40 shadow-inner">
    {JSON.stringify(data, null, 2)}
  </pre>
);

const JwtDecoder = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [token, setToken] = useState("");
  const [result, setResult] = useState<ReturnType<typeof parseJwt> | null>(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const secsLeft = exp ? exp - now : null;
  const timeLeft =
    secsLeft !== null && secsLeft > 0
      ? secsLeft > 3600
        ? `${Math.floor(secsLeft / 3600)}h ${Math.floor((secsLeft % 3600) / 60)}m left`
        : `${Math.floor(secsLeft / 60)}m ${secsLeft % 60}s left`
      : null;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 ">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-6 grow overflow-visible">
          <div className="flex flex-col gap-6">
            <header className="flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border border-white/20 hover:bg-primary/20 transition-all group/back bg-black/60 shadow-2xl">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter font-display uppercase italic text-shadow-glow text-white">
                  JWT <span className="text-primary italic">Decoder</span>
                </h1>
                <p className="text-muted-foreground mt-1 font-black uppercase tracking-[0.2em] opacity-40 text-[9px]">
                  Inspect • Decode • Validate — 100% Local
                </p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <div className="flex min-[1600px]:hidden justify-center mb-8 w-full">
              <AdBox adFormat="horizontal" height={250} label="300x250 AD" className="w-full max-w-[400px]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start overflow-visible">
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-card overflow-hidden">
                  <div className="bg-primary/5 px-5 h-[60px] border-b border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="h-4 w-4 text-primary" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Studio Workbench</h3>
                    </div>
                    {token && (
                      <Button
                        onClick={() => { setToken(""); setResult(null); setError(""); }}
                        variant="destructive"
                        size="sm"
                        className="h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Asset</span>
                      </Button>
                    )}
                  </div>
                  <CardContent className="p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 border border-primary/10 rounded-2xl transition-all"
                        onClick={() => decode(EXAMPLE_JWT)}
                      >
                        Load Example
                      </Button>
                    </div>
                    <textarea
                      value={token}
                      onChange={(e) => decode(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
                      className="min-h-[120px] w-full resize-none bg-background/20 border border-border/30 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 font-mono leading-relaxed custom-scrollbar break-all shadow-inner"
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
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Expiry Banner */}
                    {exp && (
                      <div className={`flex items-center gap-3 p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest ${isExpired ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
                        <Clock className="h-4 w-4 shrink-0" />
                        {isExpired
                          ? `Token expired on ${formatDate(exp)}`
                          : `Valid · expires ${formatDate(exp)} (${timeLeft ?? "soon"})`}
                      </div>
                    )}

                    {/* 3-Panel Compact Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Header */}
                      <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-card overflow-hidden">
                        <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Key className="h-3 w-3 text-primary" />
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Header</h3>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-primary hover:bg-primary/10" onClick={() => copy(JSON.stringify(result.header, null, 2), "header")}>
                            {copiedKey === "header" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                        <CardContent className="p-4">
                          <JsonBlock data={result.header} />
                        </CardContent>
                      </Card>

                      {/* Payload */}
                      <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-card overflow-hidden">
                        <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3 text-primary" />
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Payload</h3>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-primary hover:bg-primary/10" onClick={() => copy(JSON.stringify(result.payload, null, 2), "payload")}>
                            {copiedKey === "payload" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                        <CardContent className="p-4">
                          <JsonBlock data={result.payload} />
                        </CardContent>
                      </Card>

                      {/* Signature */}
                      <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-card overflow-hidden">
                        <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Key className="h-3 w-3 text-primary" />
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Signature</h3>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-primary hover:bg-primary/10" onClick={() => copy(result.signature, "sig")}>
                            {copiedKey === "sig" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                        <CardContent className="p-4">
                          <p className="text-[10px] font-mono break-all text-foreground/60 bg-background/20 p-3 rounded-xl border border-border/40 shadow-inner h-full min-h-[100px]">{result.signature}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>

              <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl bg-card border-2 border-primary/5">
                  <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Token Stats</h3>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    {result ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-background/20 p-4 rounded-2xl border border-border/50">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none italic">Algorithm</p>
                            <p className="text-lg font-black italic tracking-tighter text-primary">{result.header.alg ?? "—"}</p>
                          </div>
                          <div className="bg-background/20 p-4 rounded-2xl border border-border/50">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none italic">Type</p>
                            <p className="text-lg font-black italic tracking-tighter text-primary">{result.header.typ ?? "—"}</p>
                          </div>
                        </div>
                        {iat && (
                          <div className="bg-background/20 p-4 rounded-2xl border border-border/50">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none italic">Issued At</p>
                            <p className="text-[11px] font-black italic">{formatDate(iat)}</p>
                          </div>
                        )}
                        {exp && (
                          <div className={`p-4 rounded-2xl border ${isExpired ? "bg-destructive/5 border-destructive/20" : "bg-emerald-500/5 border-emerald-500/20"}`}>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none italic">Expires</p>
                            <p className="text-[11px] font-black italic">{formatDate(exp)}</p>
                            <p className={`text-[9px] font-black uppercase mt-1 ${isExpired ? "text-destructive" : "text-emerald-400"}`}>
                              {isExpired ? "⚠ EXPIRED" : `✓ ${timeLeft ?? "Valid"}`}
                            </p>
                          </div>
                        )}
                        <div className="bg-background/20 p-4 rounded-2xl border border-border/50">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none italic">Claims</p>
                          <p className="text-3xl font-black italic tracking-tighter text-primary">{Object.keys(result.payload).length}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic py-8 leading-relaxed">Paste a JWT to inspect its bitstream architecture</p>
                    )}
                    <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic leading-relaxed">
                      Local decode only · Signature not verified
                    </p>
                  </CardContent>
                </Card>
              </aside>
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Universal JWT Decoder"
              description="The Universal JWT Decoder is a specialized diagnostic utility for developers to inspect the Header, Payload, and Signature components of JSON Web Tokens without compromising security."
              transparency="Unlike online debuggers that may log your tokens (including sensitive claims or secrets) in their database, this tool decodes your JWT entirely within your browser's local sandbox. No data is sent over the network, ensuring your internal development tokens remain strictly private."
              limitations="This tool is a decoder, not a validator. While it can display the contents of a token and check its expiration status, it does not verify the cryptographic signature against a public or private key. For production-level verification, always use a trusted library in your backend environment."
              accent="indigo"
            />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default JwtDecoder;
