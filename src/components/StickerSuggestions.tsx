import { useMemo } from "react";

interface StickerSuggestionsProps {
  text: string;
  onSend: (sticker: string) => void;
}

const stickerMap: { keywords: string[]; stickers: string[] }[] = [
  { keywords: ["hi", "hello", "hey", "hola", "sup", "yo"], stickers: ["👋", "🙋", "🤗", "✌️"] },
  { keywords: ["thank", "thanks", "thx", "tysm"], stickers: ["🙏", "💖", "🫶", "😊"] },
  { keywords: ["good morning", "morning", "gm"], stickers: ["☀️", "🌅", "🌻", "☕"] },
  { keywords: ["good night", "night", "gn", "sleep"], stickers: ["🌙", "😴", "💤", "🌃"] },
  { keywords: ["congrats", "congratulations", "well done", "bravo"], stickers: ["🎉", "🥳", "🏆", "👏"] },
  { keywords: ["sorry", "apologize", "apology", "my bad"], stickers: ["😔", "🥺", "💐", "🙇"] },
  { keywords: ["love", "luv", "ilu", "miss you"], stickers: ["❤️", "😍", "💕", "🥰"] },
  { keywords: ["lol", "haha", "lmao", "funny", "laugh", "😂"], stickers: ["😂", "🤣", "😆", "💀"] },
  { keywords: ["sad", "cry", "upset", "depressed"], stickers: ["😢", "😭", "🥲", "💔"] },
  { keywords: ["angry", "mad", "furious"], stickers: ["😡", "🤬", "💢", "😤"] },
  { keywords: ["ok", "okay", "sure", "yes", "yep", "yeah"], stickers: ["👍", "✅", "👌", "🤙"] },
  { keywords: ["no", "nah", "nope"], stickers: ["👎", "🙅", "❌", "🚫"] },
  { keywords: ["bye", "goodbye", "see you", "cya", "later"], stickers: ["👋", "✨", "🫡", "💫"] },
  { keywords: ["happy", "joy", "excited", "yay"], stickers: ["😄", "🥳", "✨", "🎊"] },
  { keywords: ["food", "eat", "hungry", "lunch", "dinner"], stickers: ["🍕", "🍔", "😋", "🍽️"] },
  { keywords: ["birthday", "bday"], stickers: ["🎂", "🎈", "🎁", "🥳"] },
];

const StickerSuggestions = ({ text, onSend }: StickerSuggestionsProps) => {
  const suggestions = useMemo(() => {
    const lower = text.toLowerCase().trim();
    if (lower.length < 2) return [];
    
    for (const entry of stickerMap) {
      if (entry.keywords.some((kw) => lower.includes(kw))) {
        return entry.stickers;
      }
    }
    return [];
  }, [text]);

  if (suggestions.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 animate-fade-in">
      {suggestions.map((sticker, i) => (
        <button
          key={i}
          onClick={() => onSend(sticker)}
          className="text-2xl hover:scale-125 active:scale-95 transition-transform p-1 rounded-lg hover:bg-secondary/80"
        >
          {sticker}
        </button>
      ))}
    </div>
  );
};

export default StickerSuggestions;
