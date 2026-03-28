import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const ImageColorExtractor = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [color, setColor] = useState<{ hex: string; rgb: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (imgSrc) URL.revokeObjectURL(imgSrc);
    setFile(f);
    setColor(null);
    const url = URL.createObjectURL(f);
    setImgSrc(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleImageLoad = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
  };

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d")!;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    setColor({ hex, rgb: `rgb(${r}, ${g}, ${b})` });
    setCopied(false);
  };

  const copyHex = async () => {
    if (!color) return;
    await navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      <main className="container mx-auto max-w-2xl px-4 py-10">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6 gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Tools
          </Button>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">Image Color Extractor</h1>
        <p className="mt-1 text-muted-foreground">Click anywhere on an image to extract the exact pixel color.</p>

        <Card className="mt-8">
          <CardContent className="p-6">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !imgSrc && inputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center transition-colors ${!imgSrc ? "cursor-pointer py-12 hover:border-primary/40" : "p-2"}`}
            >
              {imgSrc ? (
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Uploaded"
                  crossOrigin="anonymous"
                  onLoad={handleImageLoad}
                  onClick={handleClick}
                  className="max-h-96 w-full cursor-crosshair rounded object-contain"
                />
              ) : (
                <>
                  <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Drop an image here or click to browse</p>
                  <p className="mt-1 text-xs text-muted-foreground">Accepts any image format</p>
                </>
              )}
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {imgSrc && (
              <Button variant="ghost" size="sm" className="mt-2 text-xs text-muted-foreground" onClick={() => inputRef.current?.click()}>
                Choose a different image
              </Button>
            )}
          </CardContent>
        </Card>

        {color && (
          <Card className="mt-4">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-14 w-14 shrink-0 rounded-md border" style={{ backgroundColor: color.hex }} />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">{color.hex}</p>
                <p className="text-xs text-muted-foreground">{color.rgb}</p>
              </div>
              <Button size="sm" variant="secondary" className="gap-1.5" onClick={copyHex}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy HEX"}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ImageColorExtractor;
