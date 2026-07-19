"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface VariantSwatchesProps {
  colors?: { name: string; hex: string }[];
  materials?: string[];
  wattages?: string[];
  onSelect: (type: string, value: string) => void;
}

export function VariantSwatches({ colors, materials, wattages, onSelect }: VariantSwatchesProps) {
  const [selectedColor, setSelectedColor] = useState(colors?.[0]?.name);
  const [selectedMaterial, setSelectedMaterial] = useState(materials?.[0]);
  const [selectedWattage, setSelectedWattage] = useState(wattages?.[0]);

  const handleSelectColor = (name: string) => {
    setSelectedColor(name);
    onSelect("color", name);
  };

  const handleSelectMaterial = (mat: string) => {
    setSelectedMaterial(mat);
    onSelect("material", mat);
  };

  const handleSelectWattage = (w: string) => {
    setSelectedWattage(w);
    onSelect("wattage", w);
  };

  return (
    <div className="space-y-6">
      {colors && colors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3">Color: <span className="text-muted-foreground font-normal">{selectedColor}</span></h4>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => handleSelectColor(color.name)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 focus:outline-none transition-transform hover:scale-110",
                  selectedColor === color.name ? "border-primary scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {materials && materials.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3">Material</h4>
          <div className="flex flex-wrap gap-2">
            {materials.map((mat) => (
              <button
                key={mat}
                onClick={() => handleSelectMaterial(mat)}
                className={cn(
                  "px-4 py-2 rounded-full border text-sm font-medium transition-colors",
                  selectedMaterial === mat 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-card text-foreground border-border hover:border-primary"
                )}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>
      )}

      {wattages && wattages.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3">Wattage</h4>
          <div className="flex flex-wrap gap-2">
            {wattages.map((w) => (
              <button
                key={w}
                onClick={() => handleSelectWattage(w)}
                className={cn(
                  "px-4 py-2 rounded-full border text-sm font-medium transition-colors",
                  selectedWattage === w 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-card text-foreground border-border hover:border-primary"
                )}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
