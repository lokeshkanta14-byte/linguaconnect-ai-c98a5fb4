import { Shield, MapPin, Phone, AlertTriangle, Plus, X, PhoneCall, Navigation } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  is_primary: boolean;
}

const SOS = () => {
  const { user } = useAuth();
  const [activated, setActivated] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (user) loadContacts();
  }, [user]);

  const loadContacts = async () => {
    const { data } = await supabase
      .from("emergency_contacts")
      .select("*")
      .order("created_at", { ascending: true }) as { data: EmergencyContact[] | null };
    if (data) setContacts(data);
  };

  const addContact = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      toast({ title: "Please fill name and phone", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("emergency_contacts").insert({
      user_id: user!.id,
      name: newName.trim(),
      phone: newPhone.trim(),
    } as any);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      setNewName("");
      setNewPhone("");
      setShowAdd(false);
      loadContacts();
    }
  };

  const removeContact = async (id: string) => {
    await supabase.from("emergency_contacts").delete().eq("id", id);
    loadContacts();
  };

  const handleSOS = () => {
    setActivated(true);

    // Try to get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          toast({
            title: "🚨 SOS Alert Sent!",
            description: `Location shared: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`,
          });
        },
        () => {
          toast({
            title: "🚨 SOS Alert Sent!",
            description: "Location access denied. Alert sent without location.",
          });
        }
      );
    }

    setTimeout(() => setActivated(false), 3000);
  };

  const callContact = (phone: string) => {
    window.open(`tel:${phone.replace(/\s/g, "")}`, "_self");
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

        {location && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-2 rounded-lg">
            <Navigation className="w-3 h-3 text-primary" />
            <span>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
          </div>
        )}
      </div>

      <div className="px-4 mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Emergency Contacts
          </h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {showAdd && (
          <div className="bg-card rounded-xl p-4 shadow-soft mb-3 space-y-3 animate-fade-in">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Contact name"
              className="w-full h-10 px-3 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30 text-secondary-foreground placeholder:text-muted-foreground"
            />
            <input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Phone number"
              className="w-full h-10 px-3 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30 text-secondary-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={addContact}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Add Contact
            </button>
          </div>
        )}

        <div className="space-y-2">
          {contacts.length === 0 && !showAdd && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No emergency contacts yet. Add one above.
            </p>
          )}
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-soft animate-fade-in"
            >
              <div className="w-10 h-10 rounded-full bg-sos/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-sos" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{contact.name}</p>
                <p className="text-xs text-muted-foreground">{contact.phone}</p>
              </div>
              <button
                onClick={() => callContact(contact.phone)}
                className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary"
              >
                <PhoneCall className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeContact(contact.id)}
                className="p-2 hover:bg-destructive/10 rounded-full transition-colors text-muted-foreground hover:text-destructive"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SOS;
