import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SearchX, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Non-existent route:", location.pathname);
    document.title = "404 - Forge Not Found | PrivateUtils";
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 font-sans selection:bg-primary/30 selection:text-white">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 overflow-x-clip pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 text-center space-y-10 max-w-xl"
      >
        {/* Hardware Error Icon */}
        <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 animate-pulse pointer-events-none" />
            <div className="h-28 w-28 rounded-2xl bg-card border-2 border-primary/20 flex items-center justify-center shadow-2xl relative overflow-hidden group/container">
               <ShieldAlert className="h-12 w-12 text-primary" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover/container:opacity-100 transition-opacity pointer-events-none rounded-2xl" />
            </div>
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border-2 border-background shadow-lg pointer-events-none">
                ERR: 404
            </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground italic uppercase italic select-none">
            Forge <span className="not-italic text-primary">Offline</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-sm mx-auto">
            The requested module at <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono text-[11px] font-black">{location.pathname}</code> does not exist in our hardware manifest.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="h-14 px-8 rounded-2xl font-black italic uppercase tracking-tighter shadow-2xl hover:scale-105 transition-all w-full sm:w-auto">
            <Link to="/" className="flex items-center gap-3">
              <ArrowLeft className="h-4 w-4" />
              Return to Control Panel
            </Link>
          </Button>
          
          <Button variant="outline" asChild size="lg" className="h-14 px-8 rounded-2xl font-black italic uppercase tracking-tighter border-white/5 bg-white/5 hover:bg-white/10 w-full sm:w-auto">
            <Link to="/contact" className="flex items-center gap-3">
              <SearchX className="h-4 w-4" />
              Report Issue
            </Link>
          </Button>
        </div>

        <div className="pt-8 text-[10px] uppercase font-black tracking-[0.4em] text-muted-foreground/30 select-none">
            PrivateUtils Studio — Secure Forge Node v1.0.4
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
