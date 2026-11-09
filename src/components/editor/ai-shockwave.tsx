import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useAtomValue } from "jotai";
import { SHOCKWAVE_THEMES, shockwaveThemeAtom } from "@/store/shockwave";
import type { Editor } from "@tiptap/react";
import type { AiEditStatus } from "@/hooks/use-ai-edit";
import { useIsMobile } from "@/hooks/use-is-mobile";

export const SHOCKWAVE_HOST_ATTR = "data-shockwave-host";

interface AiShockwaveProps {
  editor: Editor;
  status: AiEditStatus;
}

interface Wave {
  id: number;
  host: HTMLElement;
  page: boolean;
  x: number;
  y: number;
  size: number;
}

const BEND_MAP =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'>" +
      "<defs>" +
      "<linearGradient id='x' x1='0' x2='1' y1='0' y2='0'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#f00'/></linearGradient>" +
      "<linearGradient id='y' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#0f0'/></linearGradient>" +
      "</defs>" +
      "<rect width='100' height='100' fill='url(#x)'/>" +
      "<rect width='100' height='100' fill='url(#y)' style='mix-blend-mode:screen'/>" +
      "</svg>",
  );

export function AiShockwave({ editor, status }: AiShockwaveProps) {
  const [wave, setWave] = useState<Wave | null>(null);
  const themeId = useAtomValue(shockwaveThemeAtom);
  const colors = SHOCKWAVE_THEMES.find((t) => t.value === themeId)?.colors;
  const prevStatus = useRef<AiEditStatus>(status);
  const nextId = useRef(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const prev = prevStatus.current;
    prevStatus.current = status;
    if (prev !== "streaming" || status !== "review") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (editor.isDestroyed) return;

    const modal = isMobile
      ? null
      : document.querySelector<HTMLElement>(`[${SHOCKWAVE_HOST_ATTR}]`);
    const host = modal ?? document.body;
    const box = modal
      ? modal.getBoundingClientRect()
      : new DOMRect(0, 0, window.innerWidth, window.innerHeight);
    const x = box.width / 2;
    const y = box.height;
    const size = Math.hypot(x, y) * 2;
    setWave({ id: nextId.current++, host, page: !modal, x, y, size });
  }, [status, editor, isMobile]);

  if (!wave) return null;

  const style = {
    "--sx": `${wave.x}px`,
    "--sy": `${wave.y}px`,
    "--sd": `${wave.size}px`,
    ...(colors && {
      "--shock-a": `color-mix(in srgb, ${colors[0]} 22%, transparent)`,
      "--shock-b": `color-mix(in srgb, ${colors[1]} 24%, transparent)`,
    }),
  } as CSSProperties;

  return createPortal(
    <div
      className={wave.page ? "ai-shockwave ai-shockwave-page" : "ai-shockwave"}
      aria-hidden
    >
      <svg width="0" height="0" className="absolute">
        <filter
          id="ai-shockwave-bend"
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feImage href={BEND_MAP} width="100%" height="100%" result="map" preserveAspectRatio="none" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <div
        key={wave.id}
        className="ai-shockwave-ring"
        style={style}
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) setWave(null);
        }}
      >
        <div className="ai-shockwave-bend" />
        <div className="ai-shockwave-halo" />
      </div>
    </div>,
    wave.host,
  );
}
