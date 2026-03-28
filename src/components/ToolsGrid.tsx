import { Volume2, Image, Type, Pipette } from "lucide-react";
import ToolCard from "./ToolCard";

const tools = [
  {
    title: "MP3 Volume Booster",
    description: "Increase or decrease the volume of audio files directly in your browser",
    icon: <Volume2 className="h-5 w-5" />,
    to: "/mp3-volume-booster",
  },
  {
    title: "Image to WebP Converter",
    description: "Convert JPG and PNG images to the modern WebP format instantly",
    icon: <Image className="h-5 w-5" />,
    to: "/image-to-webp",
  },
  {
    title: "Text Case Formatter",
    description: "Quickly change text between uppercase, lowercase, title case, and more",
    icon: <Type className="h-5 w-5" />,
    to: "/text-case-formatter",
  },
  {
    title: "Image Color Extractor",
    description: "Pick any pixel from an image and get its HEX and RGB color codes",
    icon: <Pipette className="h-5 w-5" />,
    to: "/image-color-extractor",
  },
];

const ToolsGrid = () => {
  return (
    <section className="pb-20">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.to} {...tool} />
        ))}
      </div>
    </section>
  );
};

export default ToolsGrid;
