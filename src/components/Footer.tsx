import AdBox from "./AdBox";
import { Link } from "react-router-dom";

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
            <h3 className="font-semibold text-foreground">Privacy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All processing happens in your browser using WebAssembly. No cookies, no tracking, no uploads.
            </p>
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
