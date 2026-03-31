"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  function handleDownload() {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const link = document.createElement("a");
      link.download = "titos-courts-qr-code.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="p-5 bg-white rounded-2xl border-2 border-stone-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] relative"
      >
        {/* Corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-amber-400 rounded-tl-md" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-amber-400 rounded-tr-md" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-amber-400 rounded-bl-md" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-amber-400 rounded-br-md" />
        <QRCode value={value} size={size} />
      </div>
      <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2 rounded-xl">
        <Download size={14} />
        Save QR Code
      </Button>
    </div>
  );
}
