import { Music } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AudioDecodingOverlayProps {
  fileName?: string;
}

export const AudioDecodingOverlay = ({ fileName }: AudioDecodingOverlayProps) => {
  return (
    <Card className="glass-morphism border-primary/20 min-h-[500px] flex flex-col items-center justify-center bg-card rounded-2xl shadow-inner p-10 select-none">
      <div className="relative">
        <div className="h-32 w-32 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <Music className="h-12 w-12 text-primary absolute inset-0 m-auto animate-bounce" />
      </div>
      <div className="mt-12 text-center space-y-4">
        <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter italic text-shadow-glow">
          Analyzing Bitstream
        </h3>
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">
          Reconstructing Acoustic Geometry {fileName ? `• ${fileName}` : ""}
        </p>
        <div className="flex gap-2 justify-center pt-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </Card>
  );
};

export default AudioDecodingOverlay;
