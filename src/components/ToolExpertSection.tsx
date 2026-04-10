import React from 'react';
import { ShieldCheck, Info, Zap, AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolExpertSectionProps {
  title: string;
  description: string;
  transparency: string;
  limitations: string;
  className?: string;
  accent?: 'purple' | 'blue' | 'emerald' | 'orange' | 'rose' | 'amber' | 'cyan' | 'indigo' | 'violet' | 'fuchsia' | 'sky';
}

const ToolExpertSection = ({
  title,
  description,
  transparency,
  limitations,
  className,
  accent = 'purple'
}: ToolExpertSectionProps) => {
  const accentColors = {
    purple: 'from-purple-500/20 to-indigo-500/10 border-purple-500/20 text-purple-400 border-l-purple-500',
    blue: 'from-blue-500/20 to-cyan-500/10 border-blue-500/20 text-blue-400 border-l-blue-500',
    emerald: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-400 border-l-emerald-500',
    orange: 'from-orange-500/20 to-amber-500/10 border-orange-500/20 text-orange-400 border-l-orange-500',
    rose: 'from-rose-500/20 to-pink-500/10 border-rose-500/20 text-rose-400 border-l-rose-500',
    amber: 'from-amber-500/20 to-yellow-500/10 border-amber-500/20 text-amber-400 border-l-amber-500',
    cyan: 'from-cyan-500/20 to-sky-500/10 border-cyan-500/20 text-cyan-400 border-l-cyan-500',
    indigo: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/20 text-indigo-400 border-l-indigo-500',
    violet: 'from-violet-500/20 to-purple-500/10 border-violet-500/20 text-violet-400 border-l-violet-500',
    fuchsia: 'from-fuchsia-500/20 to-pink-500/10 border-fuchsia-500/20 text-fuchsia-400 border-l-fuchsia-500',
    sky: 'from-sky-500/20 to-blue-500/10 border-sky-500/20 text-sky-400 border-l-sky-500',
  };

  const accentColor = accentColors[accent] || accentColors.purple;

  return (
    <section className={cn("mt-24 pt-16 border-t border-primary/10 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000", className)}>
      <div className={cn(
        "relative rounded-[2.5rem] p-10 md:p-16 border bg-gradient-to-br overflow-hidden shadow-2xl transition-all hover:scale-[1.005] group/section",
        accentColor
      )}>
        {/* Background Decorative Elements */}
        <div className="absolute -top-24 -right-24 h-96 w-96 bg-primary/5 rounded-full blur-3xl opacity-50 group-hover/section:bg-primary/20 transition-all duration-700" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 bg-primary/5 rounded-full blur-3xl opacity-50 group-hover/section:bg-primary/20 transition-all duration-1000" />
        <div className="absolute top-12 right-12 opacity-[0.03] group-hover/section:opacity-[0.07] transition-all duration-700 pointer-events-none select-none">
          <HelpCircle className="h-96 w-96 rotate-12" />
        </div>

        <div className="relative z-10 space-y-12">
          <header className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="px-4 py-1.5 rounded-full bg-primary/20 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary italic shadow-lg shadow-primary/10">
                The Privacy Expert&apos;s Insight
              </div>
              <ShieldCheck className="h-5 w-5 text-primary animate-pulse" />
            </div>

            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground font-display leading-[0.9] italic text-shadow-glow">
              About {title}
            </h2>
          </header>

          <div className="grid grid-cols-1 gap-10">
            <div className="space-y-8 max-w-4xl">
              <p className="text-xl md:text-2xl text-muted-foreground/90 font-medium leading-[1.4] tracking-tight">
                {description}
              </p>

              <div className={cn(
                "bg-background/60 backdrop-blur-xl border-l-[6px] p-8 md:p-10 rounded-r-3xl shadow-2xl relative overflow-hidden group/card transition-all hover:translate-x-1",
                accentColor
              )}>
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover/card:opacity-25 transition-opacity">
                  <Zap className="h-24 w-24" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-widest text-foreground mb-4 font-display flex items-center gap-3">
                  <Info className="h-6 w-6 text-primary" /> Transparency Report
                </h3>
                <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
                  {transparency}
                </p>
              </div>

              <div className="space-y-6 border-t border-foreground/5 pt-10">
                <h3 className="text-xl font-black uppercase tracking-widest text-primary font-display flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6" /> Performance Boundaries
                </h3>
                <p className="text-lg text-muted-foreground/80 font-medium leading-relaxed italic">
                  {limitations}
                </p>
              </div>
            </div>
          </div>

          <footer className="pt-10 flex flex-wrap gap-6 items-center border-t border-foreground/5">
            <div className="flex -space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-zinc-800 flex items-center justify-center overflow-hidden shadow-lg">
                  <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/80" />
                </div>
              ))}
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              Verified Secure · Client-Side Only · <span className="text-primary/70 italic underline decoration-wavy underline-offset-4">Encrypted Locally</span>
            </p>
          </footer>
        </div>
      </div>
    </section>
  );
};

export default ToolExpertSection;
