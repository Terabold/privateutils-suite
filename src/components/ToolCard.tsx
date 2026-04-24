import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  gradient?: string;
  themeClass?: string;
}

const ToolCard = ({ title, description, icon, to, gradient = "from-primary to-accent", themeClass }: ToolCardProps) => {
  return (
    <Link to={to} className={`group/card-link block h-full select-none cursor-pointer ${themeClass}`}>
      <motion.div
        whileHover={{ 
          y: -8,
          scale: 1.02,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        whileTap={{ scale: 0.98 }}
        className="h-full"
      >
        <Card className={`h-full border-border/50 bg-white/5 dark:bg-zinc-900/60 hover:bg-white/10 dark:hover:bg-zinc-800/80 transition-theme rounded-xl overflow-hidden relative z-30 group-hover/card-link:border-primary/50 group-hover/card-link:shadow-glow opacity-95 hover:opacity-100 dark:backdrop-blur-md border dark:border-white/20 dark:ring-1 dark:ring-white/5`}>
          <CardHeader className="pt-8 pb-6 px-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-lg shadow-black/20 group-hover/card-link:scale-110 transition-transform duration-500`}>
                <div className="h-5 w-5 flex items-center justify-center">
                  {icon}
                </div>
              </div>
              <CardTitle className="text-lg font-black uppercase tracking-tight font-display text-foreground group-hover/card-link:text-[hsl(var(--primary))] group-hover/card-link:text-shadow-glow transition-all duration-300 line-clamp-2 min-h-[2.5rem] flex items-center">
                {title}
              </CardTitle>
            </div>
            <CardDescription className="text-sm font-medium leading-relaxed opacity-80 italic group-hover/card-link:opacity-100 transition-opacity line-clamp-2 min-h-[2.8rem]">
              {description}
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    </Link>
  );
};

export default ToolCard;
