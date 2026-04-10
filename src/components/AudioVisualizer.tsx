import React, { useRef, useEffect, useCallback } from "react";

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  className?: string;
  gradientColors?: [string, string];
}

/**
 * Standardized High-Density Audio Visualizer.
 * Fixes DPR scale accumulation (#1) and orientation-change scaling issues (#3).
 */
export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyser,
  isPlaying,
  className,
  gradientColors = ["#8b5cf6", "#6366f1"],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const draw = useCallback(() => {
    if (!analyser || !canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Fix Bug #3: Re-scale if EITHER width or height changes
    if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    }

    // Fix Bug #1: Reset transform before scaling to prevent accumulation
    // We use setTransform(1,0,0,1,0,0) to reset then scale(dpr, dpr)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    const barWidth = (width / bufferLength) * 2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      gradient.addColorStop(0, gradientColors[0]);
      gradient.addColorStop(1, gradientColors[1]);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      // roundRect is a modern API, fallback if needed (though suite targets modern browsers)
      if ((ctx as any).roundRect) {
         (ctx as any).roundRect(x, height - barHeight, barWidth, barHeight, [2, 2, 0, 0]);
      } else {
         ctx.rect(x, height - barHeight, barWidth, barHeight);
      }
      ctx.fill();
      x += barWidth + 2;
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [analyser, isPlaying, gradientColors]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, draw]);

  return <canvas ref={canvasRef} className={className} />;
};
