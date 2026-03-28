import { Link } from "react-router-dom";
import { Volume2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
}

const ToolCard = ({ title, description, icon, to }: ToolCardProps) => {
  return (
    <Link to={to}>
      <Card className="group cursor-pointer transition-colors hover:border-primary/40">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default ToolCard;
