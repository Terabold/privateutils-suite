import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Volume2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const Mp3VolumeBooster = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [volume, setVolume] = useState(150);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (f: File | undefined) => {
    if (f) setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const processAndDownload = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new AudioContext();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const offlineCtx = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = offlineCtx.createGain();
      gainNode.gain.value = volume / 100;

      source.connect(gainNode);
      gainNode.connect(offlineCtx.destination);
      source.start(0);

      const rendered = await offlineCtx.startRendering();

      // Encode as WAV
      const wav = encodeWav(rendered);
      const blob = new Blob([wav], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      const baseName = file.name.replace(/\.[^.]+$/, "");
      a.download = `${baseName}_boosted.wav`;
      a.click();
      URL.revokeObjectURL(url);
      await audioCtx.close();
    } catch {
      alert("Failed to process this audio file. Please try a different file.");
    } finally {
      setProcessing(false);
    }
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

        <h1 className="text-2xl font-bold tracking-tight text-foreground">MP3 Volume Booster</h1>
        <p className="mt-1 text-muted-foreground">
          Increase the volume of your audio files entirely in the browser.
        </p>

        {/* Upload area */}
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
                  <p className="text-sm font-medium text-foreground">
                    Drop an audio file here or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Supports MP3, WAV, OGG, FLAC, and more
                  </p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          </CardContent>
        </Card>

        {/* Volume slider */}
        {file && (
          <Card className="mt-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Volume2 className="h-4 w-4" /> Volume
                </div>
                <span className="text-sm font-semibold text-primary">{volume}%</span>
              </div>
              <Slider
                className="mt-4"
                min={100}
                max={300}
                step={5}
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>100%</span>
                <span>300%</span>
              </div>

              <Button
                className="mt-6 w-full gap-2"
                onClick={processAndDownload}
                disabled={processing}
              >
                <Download className="h-4 w-4" />
                {processing ? "Processing…" : "Process & Download"}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

function encodeWav(audioBuffer: AudioBuffer): ArrayBuffer {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitsPerSample = 16;

  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  const numSamples = audioBuffer.length;
  const dataLength = numSamples * numChannels * (bitsPerSample / 8);
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return buffer;
}

export default Mp3VolumeBooster;
