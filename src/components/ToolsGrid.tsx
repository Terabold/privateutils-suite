import { Volume2 } from "lucide-react";
import ToolCard from "./ToolCard";

const ToolsGrid = () => {
  return (
    <section className="pb-20">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ToolCard
          title="MP3 Volume Booster"
          description="Increase the volume of audio files directly in your browser"
          icon={<Volume2 className="h-5 w-5" />}
          to="/mp3-volume-booster"
        />
      </div>
    </section>
  );
};

export default ToolsGrid;
