import { Shield, MapPin, Phone, Plus, X, PhoneCall, Navigation, Vibrate, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import useShakeSOS from "@/hooks/useShakeSOS";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  is_primary: boolean;
}

const SOS = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [alertsSent, setAlertsSent] = useState<{ time: string; location: string }[]>([]);
  const [shakeEnabled, setShakeEnabled] = useState(true);

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

  const callContact = (phone: string) => {
    window.open(`tel:${phone.replace(/\s/g, "")}`, "_self");
  };

  const triggerSilentSOS = useCallback(() => {
    if (!user || contacts.length === 0) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
          const now = new Date().toLocaleTimeString();

          // Send SOS messages to all emergency contacts via SMS link
          contacts.forEach((contact) => {
            const message = encodeURIComponent(
              `🚨 EMERGENCY ALERT\n\nThe user may be in danger.\n\nCurrent location:\n${mapsLink}\n\nPlease check immediately.`
            );
            // Open SMS intent silently by creating hidden links
            const smsLink = `sms:${contact.phone.replace(/\s/g, "")}?body=${message}`;
            const a = document.createElement("a");
            a.href = smsLink;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          });

          setAlertsSent((prev) => [
            { time: now, location: mapsLink },
            ...prev,
          ]);
        },
        () => {
          // Location denied — still attempt alert without coordinates
          const now = new Date().toLocaleTimeString();
          contacts.forEach((contact) => {
            const message = encodeURIComponent(
              `🚨 EMERGENCY ALERT\n\nThe user may be in danger.\nLocation unavailable.\n\nPlease check immediately.`
            );
            const smsLink = `sms:${contact.phone.replace(/\s/g, "")}?body=${message}`;
            const a = document.createElement("a");
            a.href = smsLink;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          });

          setAlertsSent((prev) => [
            { time: now, location: "Location unavailable" },
            ...prev,
          ]);
        }
      );
    }
  }, [user, contacts]);

  // Shake detection hook
  useShakeSOS({
    threshold: 25,
    requiredShakes: 3,
    timeWindow: 5000,
    onShakeDetected: triggerSilentSOS,
    enabled: shakeEnabled,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 glass px-4 py-3">
        <h1 className="text-xl font-bold font-display flex items-center gap-2">
          <Shield className="w-5 h-5 text-sos" />
          Emergency SOS
        </h1>
      </div>

      {/* Shake instruction */}
      <div className="flex flex-col items-center pt-8 px-6">
        <div className="w-28 h-28 rounded-full bg-sos/10 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-sos/30">
          <Vibrate className="w-8 h-8 text-sos" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-sos">Shake × 3</span>
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center max-w-xs">
          Shake your phone <strong>3 times within 5 seconds</strong> to silently send an emergency alert with your location to all contacts below.
        </p>
        <button
          onClick={() => setShakeEnabled((v) => !v)}
          className={`mt-3 text-xs px-4 py-1.5 rounded-full font-medium transition-colors ${
            shakeEnabled
              ? "bg-sos/10 text-sos"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {shakeEnabled ? "Shake SOS Active" : "Shake SOS Disabled"}
        </button>

        {/* Manual trigger for testing */}
        <button
          onClick={triggerSilentSOS}
          className="mt-3 text-[11px] text-muted-foreground underline"
        >
          Test SOS manually
        </button>
      </div>

      {/* Sent alerts log */}
      {alertsSent.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Alert History
          </h2>
          <div className="space-y-2">
            {alertsSent.map((alert, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-destructive/10 rounded-xl border border-destructive/20 animate-fade-in"
              >
                <CheckCircle2 className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-destructive">🚨 SOS Alert Sent — {alert.time}</p>
                  {alert.location !== "Location unavailable" ? (
                    <a
                      href={alert.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-primary underline truncate block"
                    >
                      {alert.location}
                    </a>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">Location unavailable</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      <div className="px-4 mt-8">
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
