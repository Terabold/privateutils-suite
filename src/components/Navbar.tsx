import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdPlaceholder from "./AdPlaceholder";

interface NavbarProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

const Navbar = ({ darkMode, onToggleDark }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-50 border-b glass-morphism">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-2 group cursor-pointer select-none">
          <div className="h-2 w-8 bg-primary rounded-full group-hover:w-12 transition-all duration-500" />
          <span className="text-xl font-black tracking-tight text-foreground font-display uppercase italic">
            Local<span className="text-primary not-italic">Tools</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onToggleDark} aria-label="Toggle dark mode" className="rounded-2xl hover:bg-primary/10 transition-colors h-10 w-10">
            {darkMode ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
