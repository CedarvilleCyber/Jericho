'use client';

import { useState } from 'react';
import Image from "next/image";
import NotFound from "@/public/not-found.svg";

export default function TopologyImage({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative flex-1 flex items-center justify-center p-4">
      <div className="relative w-full h-full rounded-lg border border-border shadow-lg overflow-hidden bg-muted/50 backdrop-blur-sm">
        <Image
          src={imageError || !src ? NotFound : src}
          alt={alt}
          fill
          className="object-contain p-4"
          onError={() => setImageError(true)}
        />
      </div>
    </div>
  );
}
