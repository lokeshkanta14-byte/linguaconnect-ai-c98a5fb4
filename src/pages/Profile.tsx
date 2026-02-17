import { ArrowLeft, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold font-display">Profile</h1>
      </div>

      <div className="flex flex-col items-center pt-8 px-4">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold font-display">AK</AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-card">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <h2 className="mt-4 text-xl font-bold font-display">Arun Kumar</h2>
        <p className="text-sm text-muted-foreground">Online</p>
      </div>

      <div className="px-4 mt-8 space-y-4">
        {[
          { label: "Display Name", value: "Arun Kumar" },
          { label: "Email", value: "arun@email.com" },
          { label: "Phone", value: "+91 98765 43210" },
          { label: "Preferred Language", value: "English" },
          { label: "Bio", value: "Multilingual traveler & tech enthusiast 🌍" },
        ].map((field) => (
          <div key={field.label} className="bg-card rounded-xl p-4 shadow-soft">
            <p className="text-xs font-medium text-muted-foreground mb-1">{field.label}</p>
            <p className="text-sm font-medium">{field.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
