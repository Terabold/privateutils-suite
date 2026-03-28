import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

const Navbar = ({ darkMode, onToggleDark }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <span className="text-lg font-semibold tracking-tight text-foreground">
          LocalTools
        </span>
        <Button variant="ghost" size="icon" onClick={onToggleDark} aria-label="Toggle dark mode">
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
