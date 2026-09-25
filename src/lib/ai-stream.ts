import { ApiError, BASE_URL, refreshAccessToken } from "./api-client";
import { getToken } from "./auth";
import { urls } from "./urls";

export type AiAction = "ask" | "rewrite" | "shorten" | "fix_grammar";

export interface AiStreamRequest {
  action: AiAction;
  prompt?: string;
  selection?: string;
}

async function openStream(
  body: AiStreamRequest,
  signal: AbortSignal,
  canRetry = true,
): Promise<Response> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${urls.AiStream}`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401 && canRetry && (await refreshAccessToken())) {
    return openStream(body, signal, false);
  }
  return res;
}

async function toApiError(res: Response): Promise<ApiError> {
  const data = await res.json().catch(() => null);
  const message =
    data && typeof data === "object" && "message" in data
      ? String(data.message)
      : res.statusText;
  return new ApiError(message || "Request failed", res.status, data);
}

function parseEvent(block: string): { event: string; data: string } {
  let event = "message";
  const data: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
  }
  return { event, data: data.join("\n") };
}

export async function streamAi(
  body: AiStreamRequest,
  onDelta: (text: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const res = await openStream(body, signal);
  if (!res.ok) throw await toApiError(res);
  if (!res.body) throw new Error("Streaming is not supported");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) throw new Error("Connection lost");

      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const { event, data } = parseEvent(buffer.slice(0, sep));
        buffer = buffer.slice(sep + 2);

        if (event === "delta") {
          onDelta((JSON.parse(data) as { text: string }).text);
        } else if (event === "error") {
          throw new Error((JSON.parse(data) as { message: string }).message);
        } else if (event === "done") {
          return;
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}
