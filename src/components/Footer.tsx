import AdPlaceholder from "./AdPlaceholder";

const Footer = () => {
  return (
    <footer className="mt-20 border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center mb-10">
           <AdPlaceholder format="banner" className="mb-8" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground text-xs">
                L
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground font-display">
                Local<span className="text-primary">Tools</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              100% private, client-side tools. Your files never leave your computer. 
              The most secure way to process media and data.
            </p>
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
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          <p>© 2026 LOCALTOOLS STUDIO</p>
          <div className="flex gap-6">
            <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
