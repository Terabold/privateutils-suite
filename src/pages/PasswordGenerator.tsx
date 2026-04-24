import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, RefreshCw, ShieldCheck, ShieldAlert, Eye, EyeOff, Hash, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import ToolAdBanner from "@/components/ToolAdBanner";
import StickyAnchorAd from "@/components/StickyAnchorAd";

const CHARS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-="
};

function generatePassword(length: number, options: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }) {
  let charset = "";
  if (options.upper) charset += CHARS.upper;
  if (options.lower) charset += CHARS.lower;
  if (options.numbers) charset += CHARS.numbers;
  if (options.symbols) charset += CHARS.symbols;

  if (!charset) return "";

  let password = "";
  const crypto = window.crypto || (window as any).msCrypto;
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  return password;
}

function calculateStrength(password: string) {
  let score = 0;
  if (!password) return 0;
  if (password.length > 8) score += 1;
  if (password.length > 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(5, score);
}

const PasswordGenerator = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [length, setLength] = useState(16);
  const [quantity, setQuantity] = useState(1);
  const [options, setOptions] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const [passwords, setPasswords] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const generate = useCallback(() => {
    // Safety Gate: 500 quantity cap, 512 length cap
    const safeQty = Math.min(500, quantity);
    const safeLen = Math.min(512, length);
    const results = Array.from({ length: safeQty }, () => generatePassword(safeLen, options));
    setPasswords(results);
  }, [length, quantity, options]);

  useEffect(() => {
    generate();
  }, [generate]);

  const copy = async (text?: string) => {
    const target = text || passwords.join("\n");
    await navigator.clipboard.writeText(target);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const strength = passwords.length > 0 ? calculateStrength(passwords[0]) : 0;
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong", "Unbreakable"];
  const strengthColors = ["bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-emerald-500", "bg-emerald-400 font-bold"];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1240px] px-6 py-6 grow">
          <div className="flex flex-col gap-6">
            <header className="flex items-center gap-6">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow">
                  Secure Password <span className="text-primary italic">Architect</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">
                  High-Entropy Generator · 100% Client-Side · No Logs
                </p>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <ToolAdBanner />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

                {/* Output Display */}
                <Card className="glass-morphism border-primary/10 rounded-2xl shadow-2xl bg-muted/5 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <ShieldCheck className="h-32 w-32" />
                  </div>
                  <CardContent className="p-0 space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Generated Password</p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)} className="h-7 w-7 rounded-xl border border-border/30">
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={generate} className="h-7 w-7 rounded-xl border border-border/30 text-primary">
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className={`w-full h-[200px] flex flex-col items-center gap-2 bg-zinc-950/40 border border-border/30 rounded-2xl p-4 overflow-y-auto custom-scrollbar transition-all ${!showPassword ? 'blur-md select-none' : ''}`}>
                        {passwords.length > 0 ? passwords.map((p, i) => (
                          <div key={i} className="font-mono text-sm md:text-base tracking-wider break-all text-center selection:bg-primary/30 py-2 border-b border-white/5 last:border-0 w-full shrink-0">
                            {p}
                          </div>
                        )) : "••••••••••••••••"}
                      </div>
                      {!showPassword && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button variant="link" onClick={() => setShowPassword(true)} className="text-primary font-black uppercase tracking-widest text-[10px]">Show Passwords</Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Strength: <span className="text-foreground">{strengthLabels[strength]}</span></p>
                        <p className="text-[10px] font-mono opacity-40">{Math.round((strength / 5) * 100)}%</p>
                      </div>
                      <div className="h-2 w-full bg-muted/20 rounded-full flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`h-full flex-1 rounded-full transition-all duration-500 ${i < strength ? strengthColors[strength - 1] : 'bg-transparent'}`} />
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => copy()}
                      disabled={passwords.length === 0}
                      className={`w-full gap-3 h-16 text-lg font-bold rounded-2xl shadow-xl transition-all duration-300 ${copied ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:scale-[1.01]'}`}
                    >
                      {copied ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                      {copied ? (passwords.length > 1 ? "All Passwords Copied!" : "Password Copied!") : (passwords.length > 1 ? `Copy all ${passwords.length} Passwords` : "Copy to Clipboard")}
                    </Button>
                  </CardContent>
                </Card>

                {/* Configuration */}
                <Card className="glass-morphism border-primary/10 rounded-2xl shadow-xl bg-muted/5 p-6">
                  <CardContent className="p-0 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Length: <span className="text-primary text-sm font-black">{length}</span></p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Quantity: <span className="text-primary text-sm font-black">{quantity}</span></p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <input
                            id="password-length-slider"
                            name="password-length-slider"
                            type="range"
                            min="4"
                            max="64"
                            value={length}
                            onChange={(e) => setLength(parseInt(e.target.value))}
                            className="w-full accent-primary h-2 bg-muted/30 rounded-full appearance-none cursor-pointer"
                          />
                          <p className="text-[8px] font-black opacity-20 uppercase tracking-widest text-center">Length Optimizer</p>
                        </div>
                        <div className="space-y-2">
                          <input
                            id="password-quantity-slider"
                            name="password-quantity-slider"
                            type="range"
                            min="1"
                            max="500"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
                            className="w-full accent-primary h-2 bg-muted/30 rounded-full appearance-none cursor-pointer"
                          />
                          <p className="text-[8px] font-black opacity-20 uppercase tracking-widest text-center">Bulk Dispatch (Max 500)</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'upper', label: 'Uppercase', icon: <Type className="h-3 w-3" />, chars: 'A-Z' },
                        { key: 'lower', label: 'Lowercase', icon: <Type className="h-3 w-3" />, chars: 'a-z' },
                        { key: 'numbers', label: 'Numbers', icon: <Hash className="h-3 w-3" />, chars: '0-9' },
                        { key: 'symbols', label: 'Symbols', icon: <span className="text-[10px] font-bold">#%&</span>, chars: '!@#$' }
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setOptions(prev => ({ ...prev, [opt.key]: !(prev as any)[opt.key] }))}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${(options as any)[opt.key]
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-muted/5 border-border/30 text-muted-foreground opacity-50 grayscale'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center border ${(options as any)[opt.key] ? 'border-primary/20 bg-primary/20' : 'border-border/30 bg-muted/20'}`}>
                              {opt.icon}
                            </div>
                            <div className="text-left">
                              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{opt.label}</p>
                              <p className="text-[9px] opacity-40 font-mono">{opt.chars}</p>
                            </div>
                          </div>
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${(options as any)[opt.key] ? 'border-primary bg-primary' : 'border-border/30'}`}>
                            {(options as any)[opt.key] && <Check className="h-3 w-3 text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center">

                </div>
              </div>

              {/* Sidebar Stats */}
              <aside className="space-y-6 lg:sticky lg:top-28 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl">
                  <div className="bg-primary/5 p-5 border-b border-primary/10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Security Audit</h3>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <div className="bg-muted/5 p-4 rounded-xl border border-border/50">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Entropy</p>
                      <p className="text-2xl font-black italic tracking-tighter">~{Math.round(length * Math.log2(Object.values(options).filter(Boolean).length * 20))} bits</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span>Local Crypto API</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span>Memory Only</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest opacity-30">
                        <ShieldAlert className="h-4 w-4" />
                        <span>Never Uploaded</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <p className="text-[9px] leading-relaxed text-muted-foreground/60 italic font-medium">
                        Uses browser's hardware-backed crypto.getRandomValues() for cryptographically strong randomness.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="px-6">

                </div>
              </aside>
            </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Secure Password Architect"
              accent="rose"
              overview="The Password Architect is a high-entropy cryptographic utility designed to generate unpredictable, secure strings for critical account protection. I built this tool to eliminate the dependency on 'cloud-based' password generators which often log the IP address, timestamp, and metadata of the passwords they dispense."
              steps={[
                "Select the character types you want to include (Uppercase, Lowercase, Numbers, Symbols).",
                "Adjust the 'Length Optimizer' to achieve the target bits of entropy for your security model.",
                "Choose a 'Bulk Dispatch' quantity if you are rotating secrets for multiple service accounts.",
                "Verify the 'Security Audit' to confirm the entropy strength of your configuration.",
                "Copy the generated results directly to your secure password manager or local vault."
              ]}
              technicalImplementation="I engineered the generator core using the browser's hardware-backed Web Crypto API—specifically the 'crypto.getRandomValues()' method. This ensures that the seed for your randomness is cryptographically strong and gathered from systemic noise sources. By avoiding pseudo-random functions like Math.random(), I ensure that each character in your password has an equal probability distribution across the entire selected charset."
              privacyGuarantee="The Security & Privacy model for the Architect is founded on Zero-Log Entropy. All password generation and strength auditing occur exclusively within your machine's volatile RAM. No data is stored, transmitted, or cached. Your sensitive secrets are mathematically isolated from the network, ensuring that the generated output never touches a persistent storage medium or external server."
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

export default PasswordGenerator;
