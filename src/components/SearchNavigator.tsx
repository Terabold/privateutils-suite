import { Search, X, Video, ImageIcon, Music, ShieldCheck, Wrench, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchNavigatorProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  categories: string[];
}

const categoryIcons: Record<string, any> = {
  "Video Studio": Video,
  "Image Studio": ImageIcon,
  "Audio Lab": Music,
  "Privacy Belt": ShieldCheck,
  "Utility Belt": Wrench,
};

const SearchNavigator = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
}: SearchNavigatorProps) => {
  return (
    <div className="sticky top-20 z-40 py-6 px-2 bg-background/80 backdrop-blur-xl border-b border-primary/5 transition-theme">
      <div className="container mx-auto max-w-[1400px] flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
          {/* Search Input */}
          <div className="relative w-full max-w-xl group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              type="text"
              id="category-search"
              name="category-search"
              aria-label="Search local tools"
              placeholder="Search 15+ local tools (e.g. 'PNG', 'Boost', 'QR')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-14 pr-12 text-lg font-medium bg-zinc-950/50 border-primary/10 rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all placeholder:text-muted-foreground/40 shadow-inner"
            />
            {searchQuery && (
              <button
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Category Hub */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              id="btn-all-tools"
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={`h-11 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${
                selectedCategory === null ? "shadow-lg shadow-primary/20" : "border-primary/10 hover:bg-primary/5"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              All Tools
            </Button>
            {categories.map((category) => {
              const Icon = categoryIcons[category] || Sparkles;
              const isActive = selectedCategory === category;
              return (
                <Button
                  id={`btn-cat-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  key={category}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`h-11 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${
                    isActive ? "shadow-lg shadow-primary/20" : "border-primary/10 hover:bg-primary/5"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 mr-2" />
                  {category}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchNavigator;

