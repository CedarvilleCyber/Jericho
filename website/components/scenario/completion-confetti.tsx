"use client";

import Confetti from "react-confetti";
import { useEffect, useRef, useState } from "react";

export default function CompletionConfetti({
  active,
}: {
  active: boolean;
}) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const wasActiveRef = useRef(active);

  useEffect(() => {
    function updateViewport() {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    }

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (!wasActiveRef.current && active) {
      setShowConfetti(true);
      const timeoutId = window.setTimeout(() => setShowConfetti(false), 6000);
      wasActiveRef.current = true;
      return () => window.clearTimeout(timeoutId);
    }

    wasActiveRef.current = active;
  }, [active]);

  if (!showConfetti || viewport.width === 0 || viewport.height === 0) {
    return null;
  }

  return (
    <Confetti
      width={viewport.width}
      height={viewport.height}
      numberOfPieces={260}
      recycle={false}
      className="pointer-events-none fixed inset-0 z-100"
    />
  );
}