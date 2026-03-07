import { useState, useRef, useCallback } from "react";
import { Send, Mic, Paperclip, Sparkles, X, Square } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AttachmentMenu from "./AttachmentMenu";
import StickerSuggestions from "./StickerSuggestions";

interface ChatInputProps {
  onSend: (message: string) => void;
  onSendAudio?: (audioUrl: string) => void;
  onSendImage?: (imageUrl: string) => void;
  onSendLocation?: () => void;
}

const ChatInput = ({ onSend, onSendAudio, onSendImage, onSendLocation }: ChatInputProps) => {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        onSendAudio?.(audioUrl);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      toast({ title: "Microphone access denied", description: "Please allow microphone access.", variant: "destructive" });
    }
  }, [onSendAudio]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
    setRecordingTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
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

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const imageUrl = canvas.toDataURL("image/jpeg", 0.8);
    onSendImage?.(imageUrl);
    closeCamera();
  }, [onSendImage]);

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

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

  if (isRecording) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 glass safe-bottom">
        <div className="flex items-center gap-3 px-3 py-3 max-w-3xl mx-auto">
          <button onClick={cancelRecording} className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm font-medium text-foreground">Recording {formatTime(recordingTime)}</span>
          </div>
          <button onClick={stopRecording} className="p-2.5 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass safe-bottom relative">
      <AttachmentMenu
        open={showAttach}
        onClose={() => setShowAttach(false)}
        onSendImage={(url) => onSendImage?.(url)}
        onSendLocation={() => onSendLocation?.()}
        onOpenCamera={openCamera}
      />
      <div className="flex items-end gap-2 px-3 py-2 max-w-3xl mx-auto">
        <button onClick={() => setShowAttach(!showAttach)} className="p-2.5 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/10">
          <Paperclip className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-end bg-card rounded-2xl px-3 py-1.5 border border-border">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm py-1.5 outline-none text-card-foreground placeholder:text-muted-foreground"
          />
          <button className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
        {text.trim() ? (
          <button onClick={handleSend} className="p-2.5 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity">
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={startRecording} className="p-2.5 text-primary hover:bg-primary/10 rounded-full transition-colors">
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
