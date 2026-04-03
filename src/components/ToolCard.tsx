import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
      <Card className={`h-full border-border/50 bg-white/5 dark:bg-zinc-900 hover:bg-white/10 dark:hover:bg-zinc-800 transition-all duration-300 rounded-2xl overflow-hidden relative z-30 group-hover/card-link:border-primary/50 group-hover/card-link:shadow-glow opacity-95 hover:opacity-100`}>
        <CardHeader className="p-8">
          <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-black/20 group-hover/card-link:scale-110 transition-transform duration-500`}>
            {icon}
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tight font-display mb-3 text-foreground group-hover/card-link:text-[hsl(var(--primary))] group-hover/card-link:text-shadow-glow transition-all duration-300">
            {title}
          </CardTitle>
          <CardDescription className="text-sm font-medium leading-relaxed opacity-60 italic group-hover/card-link:opacity-100 transition-opacity">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default ToolCard;
