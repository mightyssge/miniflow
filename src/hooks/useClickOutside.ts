import { useEffect, type RefObject } from "react";

// Cambiamos HTMLElement por T que extiende de HTMLElement o null
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>, 
  handler: () => void, 
  active: boolean = true
) {
  useEffect(() => {
    if (!active) return;

    const listener = (event: MouseEvent | KeyboardEvent) => {
      // TypeScript ahora está feliz porque validamos que ref.current no sea null
      if (event instanceof MouseEvent) {
        if (!ref.current || ref.current.contains(event.target as Node)) return;
        handler();
      }
      
      if (event instanceof KeyboardEvent && event.key === "Escape") {
        handler();
      }
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("keydown", listener);
    };
  }, [ref, handler, active]);
}