"use client";
import { useState, useEffect } from "react";

/** Retorna true apenas em dispositivos com ponteiro preciso (mouse/trackpad).
 *  Em touch (mobile/tablet) retorna false, evitando autoFocus que sobe o teclado. */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    setIsDesktop(window.matchMedia("(pointer: fine)").matches);
  }, []);
  return isDesktop;
}
