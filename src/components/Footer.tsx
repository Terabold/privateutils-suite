import AdBox from "./AdBox";
import { Link } from "react-router-dom";
import { Heart, Coffee, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-20 border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center mb-10 w-full">
          <AdBox adFormat="horizontal" width="60%" height={90} label="DYNAMIC BANNER AD" className="w-full md:w-[60%] max-w-full h-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <div className="group flex items-center justify-center md:justify-start gap-2 mb-4 cursor-pointer select-none">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground text-[10px]">
                P
              </div>
              <span className="text-lg font-black tracking-tight text-foreground font-display uppercase italic transition-all duration-300 group-hover:text-shadow-glow flex items-center">
                Private<span className="not-italic text-primary ml-1">Utils</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium, 100% private browser-based utilities.
              The most secure way to process media and data—completely offline on your device.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href="mailto:hello@privateutils.com" className="text-xs font-bold text-primary hover:underline transition-all">
                hello@privateutils.com
              </a>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black tracking-widest uppercase">
                v1.0
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground">Tools</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li><a href="/" className="hover:text-primary transition-colors font-medium">Browse All</a></li>
              <li><a href="/universal-media-converter" className="hover:text-primary transition-colors font-medium">Media Converter</a></li>
              <li><a href="/perspective-tilter" className="hover:text-primary transition-colors font-medium">Perspective Tilter</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground">Privacy Architecture</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li><Link to="/security-architecture" className="hover:text-primary transition-colors font-medium">Security Deep-Dive</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors font-medium">Technical FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors font-medium">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* ── Support the Project (Tip Jar) ─────────────────────────────────── */}
        <div className="mt-16 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* Icon badge */}
          <div className="shrink-0 h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
            <Heart className="h-6 w-6 text-primary" strokeWidth={2.5} />
          </div>

          {/* Copy */}
          <div className="flex flex-col gap-1 text-center md:text-left grow">
            <p className="text-base font-black tracking-tight uppercase text-foreground">
              Support the Project
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              PrivateUtils is free, ad-light, and tracking-free — kept alive by people who value privacy.
              If it saved you time, a coffee goes a long way.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              id="footer-kofi-btn"
              href="https://ko-fi.com/privateutils"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest px-5 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all duration-200 shadow-md shadow-primary/25 whitespace-nowrap"
            >
              <Coffee className="h-4 w-4" />
              Buy Me a Coffee
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
            <a
              id="footer-github-btn"
              href="https://github.com/Terabold/privateutils-suite"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-foreground font-black text-xs uppercase tracking-widest px-5 py-3 rounded-xl active:scale-95 transition-all duration-200 whitespace-nowrap"
            >
              Star on GitHub
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs tracking-widest font-semibold pb-20 md:pb-8">
          <p className="text-muted-foreground">© 2026 PRIVATEUTILS</p>
          <div className="flex items-center gap-6 text-foreground/70">
            <Link to="/privacy" className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</Link>
            <div className="h-1 w-1 rounded-full bg-border" />
            <Link to="/terms" className="hover:text-primary cursor-pointer transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
