"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SEL =
  'a,button,[role="button"],input,select,textarea,label,.btn-velvet,.btn-primary,.chip,.chip-glass';

export default function CursorDot() {
  // не рендерим на тач-устройствах
  if (typeof window !== "undefined") {
    const isTouch = window.matchMedia?.("(hover: none), (pointer: coarse)")?.matches;
    if (isTouch) return null as any;
  }

  const elRef = useRef<HTMLDivElement | null>(null);
  const downRef = useRef(false);

  useEffect(() => {
    const el = document.createElement("div");
    el.className = "ba-cursor --hide";
    document.body.appendChild(el);
    elRef.current = el;

    document.documentElement.classList.add("body-cursor-none");

    let raf = 0;
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const setPos = (x: number, y: number) => {
      pos.x = x; pos.y = y;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.left = pos.x + "px";
        el.style.top = pos.y + "px";
      });
    };

    const onMove = (e: MouseEvent) => {
      el.classList.remove("--hide");
      setPos(e.clientX, e.clientY);

      const target = e.target as HTMLElement | null;
      const isInteractive = !!target?.closest(INTERACTIVE_SEL);
      el.classList.toggle("--link", isInteractive);
    };

    const onEnter = () => el.classList.remove("--hide");
    const onLeave = () => el.classList.add("--hide");

    const onDown = () => {
      downRef.current = true;
      el.classList.add("--down");
    };
    const onUp = () => {
      downRef.current = false;
      el.classList.remove("--down");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseenter", onEnter, { passive: true });
    window.addEventListener("mouseleave", onLeave, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });

    // не мешаем нативному курсору внутри contenteditable (если нужно)
    const restoreOnEditable = (e: Event) => {
      const t = e.target as HTMLElement | null;
      const editable = t?.closest("[contenteditable='true']");
      document.documentElement.classList.toggle("body-cursor-none", !editable);
    };
    window.addEventListener("focusin", restoreOnEditable);
    window.addEventListener("focusout", restoreOnEditable);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("focusin", restoreOnEditable);
      window.removeEventListener("focusout", restoreOnEditable);
      document.documentElement.classList.remove("body-cursor-none");
      el.remove();
    };
  }, []);

  return null;
}
