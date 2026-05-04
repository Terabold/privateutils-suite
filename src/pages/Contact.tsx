import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";
import SponsorSidebars from "@/components/SponsorSidebars";
import StickyAnchorAd from "@/components/StickyAnchorAd";

const Contact = () => {
  const [darkMode, setDarkMode] = useState(() =>
    (typeof document !== "undefined" && document.documentElement.classList.contains("dark"))
  );

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500">
      

      <div className="flex justify-center items-start w-full relative">
        {/* SponsorSidebars position="left" removed */}

        <main className="container mx-auto max-w-[800px] px-6 py-12 grow">
          <div className="flex flex-col gap-12">
            <header className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Link to="/">
                <button className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:opacity-70 transition-all group">
                  <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                  Back to Hub
                </button>
              </Link>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter font-display uppercase italic text-foreground text-shadow-glow">
                Contact <span className="text-primary italic">Support</span>
              </h1>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-2xl">
                Need technical assistance or have a security disclosure? We are here to help keep your local workspace running smoothly.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <div className="p-8 rounded-[2rem] bg-muted/30 border border-primary/10 flex flex-col items-center text-center gap-6 hover-glow transition-all duration-500">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                  <Mail className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Support Email</h3>
                  <p className="text-sm text-muted-foreground font-medium mb-6">General inquiries and technical support.</p>
                  <a href="mailto:hello@privateutils.com" className="text-lg font-black text-primary hover:underline underline-offset-8">
                    hello@privateutils.com
                  </a>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-muted/30 border border-primary/10 flex flex-col items-center text-center gap-6 hover-glow transition-all duration-500">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Project Support</h3>
                  <p className="text-sm text-muted-foreground font-medium mb-6">Help keep this 100% private suite alive.</p>
                  <a href="https://ko-fi.com/privateutils" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:opacity-70 transition-all">
                    Show your support
                  </a>
                </div>
              </div>
            </div>

            <section className="p-10 rounded-[3rem] bg-primary/5 border border-primary/10 space-y-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-black uppercase tracking-tighter">Privacy Notice</h2>
              </div>
              <p className="text-muted-foreground font-medium leading-relaxed">
                When you contact us via email, we only use your email address to respond to your inquiry. We do not maintain any persistent database of user contacts, and we never sell your contact information to third parties. Our "No-Egress" commitment extends to our core services, while our email support follows standard secure professional communication protocols.
              </p>
            </section>
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>

      <Footer />
      <StickyAnchorAd />
    </div>
  );
};

export default Contact;
