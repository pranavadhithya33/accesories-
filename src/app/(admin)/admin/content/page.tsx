"use client";

import { useEffect, useState } from "react";
import { Save, AlertTriangle, MessageCircle, Type, Video, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/db/supabase";

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [settings, setSettings] = useState({
    contact: { whatsapp: "" },
    hero_banner: { title: "", subtitle: "" },
    usp_strip: ["", "", "", "", ""],
    store_info: { name: "" }
  });

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (data && !error) {
        const newSettings = { ...settings };
        data.forEach(item => {
          if (item.key === 'contact') newSettings.contact = item.value;
          if (item.key === 'hero_banner') newSettings.hero_banner = item.value;
          if (item.key === 'usp_strip') {
            // pad with empty strings if less than 5
            const usps = item.value || [];
            newSettings.usp_strip = [...usps, ...Array(5).fill("")].slice(0, 5);
          }
          if (item.key === 'store_info') newSettings.store_info = item.value;
        });
        setSettings(newSettings);
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleUspChange = (index: number, value: string) => {
    const newUsps = [...settings.usp_strip];
    newUsps[index] = value;
    setSettings({ ...settings, usp_strip: newUsps });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Clean empty USPs
      const cleanUsps = settings.usp_strip.filter(u => u.trim() !== "");

      // Update one by one for simplicity
      await supabase.from("site_settings").upsert({ key: "contact", value: settings.contact }, { onConflict: "key" });
      await supabase.from("site_settings").upsert({ key: "hero_banner", value: settings.hero_banner }, { onConflict: "key" });
      await supabase.from("site_settings").upsert({ key: "usp_strip", value: cleanUsps }, { onConflict: "key" });
      await supabase.from("site_settings").upsert({ key: "store_info", value: settings.store_info }, { onConflict: "key" });

      alert("Settings saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-foreground">Content Management</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Store Settings */}
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
          <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" /> Store Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input 
                value={settings.store_info.name} 
                onChange={e => setSettings({...settings, store_info: { name: e.target.value }})} 
                placeholder="BubbleGum Accessories" 
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Number (include country code)</Label>
              <Input 
                value={settings.contact.whatsapp} 
                onChange={e => setSettings({...settings, contact: { whatsapp: e.target.value }})} 
                placeholder="917397189222" 
              />
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
          <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" /> Hero Banner
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Main Title</Label>
              <Input 
                value={settings.hero_banner.title} 
                onChange={e => setSettings({...settings, hero_banner: { ...settings.hero_banner, title: e.target.value }})} 
                className="font-bold text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={settings.hero_banner.subtitle}
                onChange={e => setSettings({...settings, hero_banner: { ...settings.hero_banner, subtitle: e.target.value }})}
              />
            </div>
          </div>
        </div>

        {/* USP Strip */}
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
          <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" /> USP Strip (Scrolling Text)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Add up to 5 highlights (e.g., Free Shipping, Premium Quality). Leave empty to ignore.</p>
          
          <div className="space-y-3">
            {settings.usp_strip.map((usp, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-bold text-muted-foreground w-6">{i + 1}.</span>
                <Input 
                  value={usp} 
                  onChange={e => handleUspChange(i, e.target.value)} 
                  placeholder={`USP item ${i + 1}`} 
                />
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={saving} className="w-full rounded-full font-bold bg-primary hover:bg-primary/90 py-6 text-lg">
          <Save className="mr-2 h-5 w-5" /> {saving ? "Saving Changes..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
