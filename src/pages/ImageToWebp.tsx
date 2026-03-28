import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Download, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const ImageToWebp = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [webpUrl, setWebpUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    if (webpUrl) URL.revokeObjectURL(webpUrl);
    setWebpUrl(null);

    const url = URL.createObjectURL(f);
    setPreview(url);

    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) setWebpUrl(URL.createObjectURL(blob));
        },
        "image/webp",
        0.9
      );
    };
    img.src = url;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const download = () => {
    if (!webpUrl || !file) return;
    const a = document.createElement("a");
    a.href = webpUrl;
    a.download = file.name.replace(/\.[^.]+$/, "") + ".webp";
    a.click();
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

        <h1 className="text-2xl font-bold tracking-tight text-foreground">Image to WebP Converter</h1>
        <p className="mt-1 text-muted-foreground">Convert JPG or PNG images to WebP format instantly in your browser.</p>

        <Card className="mt-8">
          <CardContent className="p-6">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-12 text-center transition-colors hover:border-primary/40"
            >
              <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
              {file ? (
                <p className="text-sm font-medium text-foreground">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">Drop a JPG or PNG here or click to browse</p>
                  <p className="mt-1 text-xs text-muted-foreground">Accepts .jpg, .jpeg, .png</p>
                </>
              )}
              <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
          </CardContent>
        </Card>

        {preview && (
          <Card className="mt-4">
            <CardContent className="p-6">
              <img src={preview} alt="Preview" className="mx-auto max-h-64 rounded-md object-contain" />
              {webpUrl && (
                <Button className="mt-4 w-full gap-2" onClick={download}>
                  <Download className="h-4 w-4" /> Download WebP
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ImageToWebp;
