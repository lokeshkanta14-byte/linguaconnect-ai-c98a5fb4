import { useState, useCallback, useMemo } from "react";
import { Check, Copy } from "lucide-react";

type Segment =
  | { type: "text"; value: string }
  | { type: "code"; lang: string; value: string };

const parseSegments = (text: string): Segment[] => {
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "code", lang: match[1] || "text", value: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const AIChatMessage = ({ text }: { text: string }) => {
  const segments = useMemo(() => parseSegments(text), [text]);

  if (segments.length === 1 && segments[0].type === "text") {
    return <p className="text-sm whitespace-pre-wrap leading-relaxed">{text}</p>;
  }

  return (
    <div className="text-sm leading-relaxed space-y-2">
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <p key={i} className="whitespace-pre-wrap">{seg.value}</p>
        ) : (
          <div key={i} className="relative rounded-lg overflow-hidden border border-border bg-muted/50">
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/80 border-b border-border">
              <span className="text-[11px] text-muted-foreground font-mono">{seg.lang}</span>
              <CopyButton text={seg.value} />
            </div>
            <pre className="overflow-x-auto p-3 text-xs font-mono">
              <code>{seg.value}</code>
            </pre>
          </div>
        )
      )}
    </div>
  );
};

export default AIChatMessage;