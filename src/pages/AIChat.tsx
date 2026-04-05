import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Camera, Image, X, FileText, Paperclip, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

type DocAttachment = {
  name: string;
  content: string; // extracted text content
};

type Msg = {
  role: "user" | "assistant";
  content: string | ContentPart[];
  doc?: DocAttachment; // local-only, for UI display
};

const AI_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const getMsgText = (msg: Msg): string => {
  if (typeof msg.content === "string") return msg.content;
  return msg.content
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
};

const getMsgImage = (msg: Msg): string | null => {
  if (typeof msg.content === "string") return null;
  const img = msg.content.find((p) => p.type === "image_url");
  if (img && img.type === "image_url") return img.image_url.url;
  return null;
};

const TEXT_EXTENSIONS = ["txt", "csv", "json", "md", "xml", "yaml", "yml", "toml", "log"];
const DOC_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json,.ppt,.pptx,.md,.xml";
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });

const AIChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [docAttachment, setDocAttachment] = useState<DocAttachment | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [lastTopic, setLastTopic] = useState<string | null>(null);
  const [welcomeShown, setWelcomeShown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // Load last topic on mount
  useEffect(() => {
    const loadMemory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("ai_chat_memory" as any)
        .select("last_topic")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data && (data as any).last_topic) {
        const topic = (data as any).last_topic as string;
        setLastTopic(topic);
        // Show welcome-back message once
        setMessages([{
          role: "assistant",
          content: `Welcome back! 👋 Previously you asked about **${topic}**. Would you like to continue that discussion or start a new topic?`
        }]);
        setWelcomeShown(true);
      }
    };
    loadMemory();
  }, []);

  // Handle mobile keyboard visibility
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const offset = window.innerHeight - vv.height;
      setKeyboardOffset(offset > 100 ? offset : 0);
    };
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, keyboardOffset]);

  // Save topic after each user message
  const saveTopic = useCallback(async (topic: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Upsert
    const { data: existing } = await supabase
      .from("ai_chat_memory" as any)
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) {
      await supabase
        .from("ai_chat_memory" as any)
        .update({ last_topic: topic, updated_at: new Date().toISOString() } as any)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("ai_chat_memory" as any)
        .insert({ user_id: user.id, last_topic: topic } as any);
    }
  }, []);

  const openCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      }, 100);
    } catch {
      toast({ title: "Camera not available", variant: "destructive" });
    }
  }, []);

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    setImagePreview(canvas.toDataURL("image/jpeg", 0.8));
    closeCamera();
  }, [closeCamera]);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large (max 5MB)", variant: "destructive" });
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDocPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_DOC_SIZE) {
      toast({ title: "File too large (max 10MB)", variant: "destructive" });
      e.target.value = "";
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    try {
      if (TEXT_EXTENSIONS.includes(ext)) {
        const text = await readFileAsText(file);
        setDocAttachment({ name: file.name, content: text.slice(0, 50000) });
      } else {
        // For binary docs (PDF, DOCX, etc.), read as base64 for image_url approach
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setDocAttachment({ name: file.name, content: reader.result });
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      toast({ title: "Could not read file", variant: "destructive" });
    }
    e.target.value = "";
  };

  const send = async () => {
    const text = input.trim();
    if ((!text && !imagePreview && !docAttachment) || isLoading) return;

    let userContent: string | ContentPart[];
    let msgDoc: DocAttachment | undefined;

    if (docAttachment) {
      const parts: ContentPart[] = [];
      const isBase64 = docAttachment.content.startsWith("data:");
      if (isBase64) {
        // Binary doc — send as image_url (Gemini handles PDFs this way)
        parts.push({ type: "text", text: text || `Analyze this document: ${docAttachment.name}` });
        parts.push({ type: "image_url", image_url: { url: docAttachment.content } });
      } else {
        // Text-based doc — embed content as text
        const docPrompt = text
          ? `${text}\n\n--- Document: ${docAttachment.name} ---\n${docAttachment.content}`
          : `Analyze this document: ${docAttachment.name}\n\n${docAttachment.content}`;
        parts.push({ type: "text", text: docPrompt });
      }
      userContent = parts;
      msgDoc = docAttachment;
    } else if (imagePreview) {
      const parts: ContentPart[] = [];
      if (text) parts.push({ type: "text", text });
      else parts.push({ type: "text", text: "What's in this image?" });
      parts.push({ type: "image_url", image_url: { url: imagePreview } });
      userContent = parts;
    } else {
      userContent = text;
    }

    const userMsg: Msg = { role: "user", content: userContent, doc: msgDoc };
    setInput("");
    setImagePreview(null);
    setDocAttachment(null);
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Save topic from user text
    const userText = typeof userContent === "string" ? userContent : userContent.filter((p): p is {type:"text";text:string} => p.type === "text").map(p => p.text).join(" ");
    if (userText && userText.length > 2) {
      // Use first 100 chars as topic summary
      saveTopic(userText.slice(0, 100));
    }

    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      // For context history, strip images from older messages to save bandwidth
      const allMessages = [...messages, userMsg].slice(-10).map((m, i, arr) => {
        if (i === arr.length - 1) return m; // keep latest with image
        if (typeof m.content === "string") return m;
        // Strip images from older messages, keep text
        const textParts = m.content.filter((p) => p.type === "text");
        return { ...m, content: textParts.length === 1 ? textParts[0].text : textParts };
      });

      const resp = await fetch(AI_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        toast({ title: err.error || "Failed to get response", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const contentType = resp.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        // Non-streaming response (image editing)
        const data = await resp.json();
        const choice = data.choices?.[0]?.message;
        const textContent = choice?.content || "";
        const images = choice?.images as Array<{ type: string; image_url: { url: string } }> | undefined;
        
        if (images && images.length > 0) {
          const imgUrl = images[0].image_url.url;
          const parts: ContentPart[] = [];
          if (textContent) parts.push({ type: "text", text: textContent });
          parts.push({ type: "image_url", image_url: { url: imgUrl } });
          setMessages((prev) => [...prev, { role: "assistant", content: parts }]);
        } else if (textContent) {
          upsert(textContent);
        }
      } else {
        // Streaming response (text chat)
        if (!resp.body) {
          toast({ title: "Failed to get response", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
            try {
              const parsed = JSON.parse(json);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) upsert(content);
            } catch {}
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Connection error", variant: "destructive" });
    }

    setIsLoading(false);
  };

  const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (showCamera) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <video ref={videoRef} autoPlay playsInline muted className="flex-1 object-cover" />
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8">
          <button onClick={closeCamera} className="p-3 bg-destructive rounded-full text-destructive-foreground">
            <X className="w-6 h-6" />
          </button>
          <button onClick={capturePhoto} className="w-16 h-16 rounded-full border-4 border-white bg-white/20 active:bg-white/50 transition-colors" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 glass px-2 py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/")} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar className="w-9 h-9 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold truncate">AI Assistant</h2>
            <p className="text-[11px] text-primary font-medium">
              {isLoading ? "Typing..." : "Online"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-3 py-4 pb-28 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 py-20">
            <Sparkles className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Ask me anything in any language</p>
            <p className="text-xs">Send text, images, or documents — I can analyze them all</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const text = getMsgText(msg);
          const image = getMsgImage(msg);
          return (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-2.5`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border rounded-bl-md"
                }`}
              >
                {msg.doc && (
                  <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-secondary/50">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-xs font-medium truncate">{msg.doc.name}</span>
                  </div>
                )}
                {image && (
                  <img src={image} alt={msg.role === "assistant" ? "AI edited image" : "Shared"} className="rounded-lg mb-2 max-h-64 w-auto object-cover cursor-pointer" onClick={() => image && window.open(image, '_blank')} />
                )}
                {text && <p className="text-sm whitespace-pre-wrap leading-relaxed">{text}</p>}
                <p className={`text-[10px] mt-1 text-right ${msg.role === "user" ? "opacity-60" : "text-muted-foreground"}`}>
                  {formatTime()}
                </p>
              </div>
            </div>
          );
        })}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start mb-2.5">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Attachment Preview */}
      {(imagePreview || docAttachment) && (
        <div className="fixed left-0 right-0 z-40 px-3 py-2 transition-all duration-150" style={{ bottom: `${keyboardOffset + 56}px` }}>
          <div className="max-w-3xl mx-auto flex items-start gap-2 bg-card border border-border rounded-xl p-2">
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
            )}
            {docAttachment && !imagePreview && (
              <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {docAttachment ? docAttachment.name : "Image attached"}
              </p>
              <p className="text-[10px] text-muted-foreground">Add a message or send directly</p>
            </div>
            <button onClick={() => { setImagePreview(null); setDocAttachment(null); }} className="p-1 hover:bg-secondary rounded-full">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFilePick} />
      <input ref={docRef} type="file" accept={DOC_ACCEPT} className="hidden" onChange={handleDocPick} />
      <div className="fixed left-0 right-0 z-40 glass transition-all duration-150" style={{ bottom: `${keyboardOffset}px`, paddingBottom: keyboardOffset > 0 ? '8px' : 'env(safe-area-inset-bottom, 8px)' }}>
        <div className="flex items-end gap-1.5 px-3 py-2 max-w-3xl mx-auto">
          {/* Plus menu toggle for attachments */}
          <div className="relative">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className={`p-2.5 rounded-full transition-all ${showAttachMenu ? 'bg-primary text-primary-foreground rotate-45' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
            >
              <Plus className="w-5 h-5" />
            </button>
            {showAttachMenu && (
              <div className="absolute bottom-12 left-0 flex gap-1 bg-card border border-border rounded-xl p-1.5 shadow-lg animate-fade-in">
                <button
                  onClick={() => { openCamera(); setShowAttachMenu(false); }}
                  className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                  title="Camera"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  onClick={() => { fileRef.current?.click(); setShowAttachMenu(false); }}
                  className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                  title="Photo"
                >
                  <Image className="w-5 h-5" />
                </button>
                <button
                  onClick={() => { docRef.current?.click(); setShowAttachMenu(false); }}
                  className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                  title="Document"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 flex items-end bg-card rounded-2xl px-3 py-1.5 border border-border min-w-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              onFocus={() => setShowAttachMenu(false)}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent text-sm py-1.5 outline-none text-card-foreground placeholder:text-muted-foreground w-full"
            />
          </div>
          <button
            onClick={send}
            disabled={(!input.trim() && !imagePreview && !docAttachment) || isLoading}
            className="p-2.5 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
