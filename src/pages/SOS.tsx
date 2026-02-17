import { Shield, MapPin, Phone, AlertTriangle } from "lucide-react";
import { useState } from "react";

const emergencyContacts = [
  { name: "Priya Sharma", phone: "+91 98765 43210" },
  { name: "Rahul Verma", phone: "+91 87654 32109" },
  { name: "Mom", phone: "+91 99887 76655" },
];

const SOS = () => {
  const [activated, setActivated] = useState(false);

  const handleSOS = () => {
    setActivated(true);
    setTimeout(() => setActivated(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 glass px-4 py-3">
        <h1 className="text-xl font-bold font-display flex items-center gap-2">
          <Shield className="w-5 h-5 text-sos" />
          Emergency SOS
        </h1>
      </div>

      <div className="flex flex-col items-center pt-10 px-6">
        <button
          onClick={handleSOS}
          className={`w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 shadow-card ${
            activated
              ? "bg-sos text-sos-foreground scale-95 animate-pulse-soft"
              : "bg-sos/10 text-sos hover:bg-sos hover:text-sos-foreground hover:scale-105"
          }`}
        >
          <AlertTriangle className="w-10 h-10" />
          <span className="text-sm font-bold uppercase tracking-wider">
            {activated ? "Sent!" : "SOS"}
          </span>
        </button>
        <p className="text-sm text-muted-foreground mt-4 text-center max-w-xs">
          Tap the button to instantly share your location with emergency contacts
        </p>
      </div>

      <div className="px-4 mt-10">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Emergency Contacts
        </h2>
        <div className="space-y-2">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.name}
              className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-soft animate-fade-in"
            >
              <div className="w-10 h-10 rounded-full bg-sos/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-sos" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{contact.name}</p>
                <p className="text-xs text-muted-foreground">{contact.phone}</p>
              </div>
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SOS;
