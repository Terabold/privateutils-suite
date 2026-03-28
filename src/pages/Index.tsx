import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ToolsGrid from "@/components/ToolsGrid";

const Index = () => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />
      <main className="container mx-auto px-4">
        <HeroSection />
        <ToolsGrid />
      </main>
    </div>
  );
};

export default Index;
