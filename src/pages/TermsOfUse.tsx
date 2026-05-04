import React from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { ShieldAlert, CheckCircle, Scale, Hammer, Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const TermsOfUse = () => {
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
               <Scale className="h-3 w-3" />
               Standard Legal Terms
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground italic uppercase italic">
              Terms of <span className="not-italic text-primary">Use</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed italic">
              Effective Date: April 5, 2026. By using PrivateUtils, you agree to the standard terms of a professional-grade browser-based utility suite.
            </p>
          </header>

          <hr className="border-white/5" />

          {/* Core Terms Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-foreground font-bold italic uppercase tracking-tight">
                <CheckCircle className="h-5 w-5 text-primary" />
                Fair-Use Guidelines
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                PrivateUtils is built for personal and professional use. We do not restrict your usage, 
                as all processing happens within your local environment. However, we ask that you do not reverse-engineer, 
                scrape, or attempt to redistribute our internal codebase or brand assets without explicit written permission.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-foreground font-bold italic uppercase tracking-tight">
                <ShieldAlert className="h-5 w-5 text-primary" />
                No Warranty (As-Is Basis)
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This software is provided "as is," without warranty of any kind, express or implied, 
                including but not limited to the warranties of merchantability, fitness for a particular purpose 
                and non-infringement. In no event shall the authors be liable for any claim, damages 
                or other liability.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="bg-muted/30 border border-white/5 rounded-2xl p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-3 text-foreground font-black italic uppercase tracking-tighter text-xl italic uppercase">
              <Hammer className="h-6 w-6 text-primary" />
              Ownership & Branding
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                All "PrivateUtils" branding, logos, custom animations, and UI designs are the intellectual property of the project. 
                You are encouraged to share links to the suite and create content (videos, articles) showcasing the tools, 
                but you may not claim the software as your own.
              </p>
            </div>
          </section>

          {/* Contact Details */}
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-3 italic uppercase italic">
                <Mail className="h-5 w-5 text-primary" />
                Contact
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For questions regarding these terms, reach us at: <br />
                <span className="text-primary font-bold">hello@privateutils.com</span>
              </p>
            </div>
          </section>

          <footer className="pt-12 text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground/50 border-t border-white/5">
             © 2026 PrivateUtils — Professional Standard Licenses
          </footer>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfUse;
