import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useAtomValue } from "jotai";
import { SHOCKWAVE_THEMES, shockwaveThemeAtom } from "@/store/shockwave";
import type { Editor } from "@tiptap/react";
import type { AiEditStatus } from "@/hooks/use-ai-edit";

export const SHOCKWAVE_HOST_ATTR = "data-shockwave-host";

interface AiShockwaveProps {
  editor: Editor;
  status: AiEditStatus;
}

interface Wave {
  id: number;
  host: HTMLElement;
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

  useEffect(() => {
    const prev = prevStatus.current;
    prevStatus.current = status;
    if (prev !== "streaming" || status !== "review") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (editor.isDestroyed) return;

    const host = editor.view.dom.closest<HTMLElement>(`[${SHOCKWAVE_HOST_ATTR}]`);
    if (!host) return;

    const box = host.getBoundingClientRect();
    const caret = editor.view.coordsAtPos(editor.state.selection.head);
    const x = caret.left - box.left;
    const y = caret.bottom - box.top;
    const reach = Math.hypot(
      Math.max(x, box.width - x),
      Math.max(y, box.height - y),
    );
    setWave({ id: nextId.current++, host, x, y, size: reach * 2 });
  }, [status, editor]);

  if (!wave) return null;

  const style = {
    "--sx": `${wave.x}px`,
    "--sy": `${wave.y}px`,
    "--sd": `${wave.size}px`,
    ...(colors && {
      "--shock-a": `color-mix(in srgb, ${colors[0]} 14%, transparent)`,
      "--shock-b": `color-mix(in srgb, ${colors[1]} 16%, transparent)`,
    }),
  } as CSSProperties;

  return createPortal(
    <div className="ai-shockwave" aria-hidden>
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
            scale="1.2"
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
