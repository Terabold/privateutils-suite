import React, { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

interface AdBoxProps {
  width?: number | string;
  height?: number | string;
  label?: string;
  className?: string;
  isSticky?: boolean;
  adFormat?: "auto" | "horizontal" | "vertical" | "rectangle" | "fluid";
}

const AdBox = ({ width, height, label = "AD SPACE", className, isSticky, adFormat }: AdBoxProps) => {
  // Vite מזהה אוטומטית: true כשאתה על המחשב שלך, false כשהאתר באוויר
  const isLocalDev = import.meta.env.DEV;
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // טוען את המודעה של גוגל רק כשהאתר חי באוויר
    if (!isLocalDev && containerRef.current && !initialized.current) {
      const timer = setTimeout(() => {
        // Check if container is actually visible and has width to prevent "availableWidth=0" AdSense crash
        if (containerRef.current && containerRef.current.offsetWidth > 0) {
          try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            initialized.current = true;
          } catch (e) {
            console.error("AdSense error", e);
          }
        }
      }, 200); // 200ms delay to allow responsive layouts to settle
      
      return () => clearTimeout(timer);
    }
  }, [isLocalDev]);

  const styleParams = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  // מצב 1: פיתוח מקומי (מה שאתה רואה עכשיו על המחשב/בטלפון בבית)
  if (isLocalDev) {
    return (
      <div
        className={cn(
          "bg-black text-white flex items-center justify-center font-bold text-xs uppercase tracking-[0.2em] border border-white/10 shrink-0",
          isSticky && "sticky top-24",
          className
        )}
        style={styleParams}
      >
        {label}
      </div>
    );
  }

  // מצב 2: פרודקשן (מה שהמשתמשים יראו כשהאתר יהיה באוויר)
  // Ensure we use horizontal format for sticky setups to avoid massive 300x250 blocks on mobile
  const finalAdFormat = adFormat || (isSticky || (height && Number(height) <= 90) ? "horizontal" : "auto");

  return (
    <div
      className={cn(
        "bg-transparent flex items-center justify-center shrink-0 overflow-hidden",
        isSticky && "sticky top-24",
        className
      )}
      ref={containerRef}
      style={{ 
        minHeight: styleParams.height || '100px', 
        minWidth: width ? styleParams.width : '250px',
        width: '100%' 
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ 
          display: "block", 
          minHeight: styleParams.height || '100px', 
          minWidth: width ? styleParams.width : '250px',
          width: "100%" 
        }}
        data-ad-client="ca-pub-8938339685834274" 
        data-ad-slot="3087709280"               /* PrivacySuite_Sidebars Ad Unit */
        data-ad-format={finalAdFormat}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBox;