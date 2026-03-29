import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
}

const ToolCard = ({ title, description, icon, to }: ToolCardProps) => {
  return (
    <Link to={to} className="group/card-link block h-full select-none cursor-pointer">
      <Card className="h-full border-border/50 bg-white/5 dark:bg-zinc-900 hover:bg-white/10 dark:hover:bg-zinc-800 transition-all duration-300 rounded-xl overflow-hidden relative z-30 group-hover/card-link:border-primary/50 group-hover/card-link:shadow-2xl group-hover/card-link:shadow-primary/10">
        <CardHeader className="p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover/card-link:scale-110 transition-transform duration-500">
            {icon}
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tight font-display mb-3 text-foreground group-hover/card-link:text-primary transition-colors">
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
