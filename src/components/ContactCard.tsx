import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface ContactCardProps {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
  language?: string;
}

const ContactCard = ({ id, name, lastMessage, time, unread, online, language }: ContactCardProps) => {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <Link
      to={`/chat/${id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors duration-150 animate-fade-in"
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold font-display">
            {initials}
          </AvatarFallback>
        </Avatar>
        {online && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-online border-2 border-background" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm truncate">{name}</h3>
          <span className="text-[11px] text-muted-foreground flex-shrink-0">{time}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-muted-foreground truncate">{lastMessage}</p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {language && (
              <span className="text-[9px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                {language}
              </span>
            )}
            {unread && unread > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                {unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ContactCard;
