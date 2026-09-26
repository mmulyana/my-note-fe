import { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { IconLink } from "@tabler/icons-react";
import {
  hostOf,
  labelOf,
  type LinkCardAttrs,
  type LinkCardState,
} from "./extensions/link-card";

export function LinkCardView({ node, selected }: ReactNodeViewProps) {
  const a = node.attrs as LinkCardAttrs;
  const state: LinkCardState = a.state ?? "ready";
  const loading = state === "loading";

  const [imageBroken, setImageBroken] = useState(false);
  const [faviconBroken, setFaviconBroken] = useState(false);

  const site = a.siteName || hostOf(a.url);

  return (
    <NodeViewWrapper
      className="rich-link-card-wrap"
      data-drag-handle
      data-selected={selected ? "true" : undefined}
    >
      <a
        className="rich-link-card"
        data-type="link-card"
        data-state={loading ? "loading" : undefined}
        href={a.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        // inside the editor a click should select the card, not navigate;
        // ctrl/cmd-click still opens it, as elsewhere in the app
        onClick={(e) => {
          if (!e.metaKey && !e.ctrlKey) e.preventDefault();
        }}
      >
        <span className="rich-link-card-body">
          <span className="rich-link-card-title">
            {loading ? labelOf(a.url) : a.title || labelOf(a.url)}
          </span>
          {!loading && a.description ? (
            <span className="rich-link-card-desc">{a.description}</span>
          ) : null}
          <span className="rich-link-card-foot">
            {a.favicon && !faviconBroken ? (
              <img
                className="rich-link-card-favicon"
                src={a.favicon}
                alt=""
                onError={() => setFaviconBroken(true)}
              />
            ) : (
              <IconLink
                className="rich-link-card-favicon"
                size={14}
                stroke={1.8}
              />
            )}
            <span className="rich-link-card-site">{site}</span>
          </span>
        </span>

        {a.image && !imageBroken ? (
          <span className="rich-link-card-thumb">
            <img
              src={a.image}
              alt=""
              loading="lazy"
              onError={() => setImageBroken(true)}
            />
          </span>
        ) : null}
      </a>
    </NodeViewWrapper>
  );
}
