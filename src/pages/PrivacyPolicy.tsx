import React from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { ShieldCheck, Lock, Eye, Cookie, Info, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return true;
  });

  React.useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/30">
      <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />
      
      <main className="container mx-auto max-w-4xl px-6 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          {/* Header */}
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group mb-8">
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <header className="space-y-6 text-center md:text-left">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
              <ShieldCheck className="h-3 w-3" />
              Privacy-First Architecture
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground italic uppercase">
              Privacy <span className="not-italic text-primary">Policy</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
              Last Updated: April 5, 2026. Your privacy is not a feature; it is our foundation. 
              Review how PrivateUtils handles data with total transparency.
            </p>
          </header>

          <hr className="border-white/5" />

          {/* Core Philosophy Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-foreground font-bold italic uppercase tracking-tight">
                <Lock className="h-5 w-5 text-primary" />
                Zero-Upload Policy
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                PrivateUtils operates on a "Client-Side Only" architecture. This means 100% of your file processing, 
                media conversion, and data scrubbing happens <strong>on your device</strong> using WebAssembly and Native Browser APIs. 
                Your files never touch our servers because we don't have any servers that store user data.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-foreground font-bold italic uppercase tracking-tight">
                <Eye className="h-5 w-5 text-primary" />
                No Data Tracking
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We do not track your individual tool usage, your IP address (beyond standard server logs for site security), 
                or your identity. We do not use analytics packages that profile your behavior.
              </p>
            </div>
          </section>

          {/* AdSense Disclosure (Mandatory) */}
          <section className="bg-muted/30 border border-white/5 rounded-2xl p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-3 text-foreground font-black italic uppercase tracking-tighter text-xl">
              <Cookie className="h-6 w-6 text-primary" />
              Advertising Disclosure
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                To keep these professional tools free for the community, PrivateUtils uses Google AdSense to serve advertisements. 
                Google uses cookies to serve ads based on a user's prior visits to our website or other websites.
              </p>
              <ul className="list-none space-y-4 pl-0">
                <li className="flex items-start gap-3">
                   <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                   <span>Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to your sites and/or other sites on the Internet.</span>
                </li>
                <li className="flex items-start gap-3">
                   <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                   <span>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Ads Settings</a>.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Final Details */}
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-3 italic uppercase italic">
                <Info className="h-5 w-5 text-primary" />
                Contact and Support
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at: <br />
                <span className="text-primary font-bold">hello@privateutils.com</span>
              </p>
            </div>
          </section>

          <footer className="pt-12 text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground/50 border-t border-white/5">
             © 2026 PrivateUtils — Absolute Privacy Architecture
          </footer>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
