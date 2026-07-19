"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, CartItem as CartItemType } from "@/lib/store/cart";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <div className="flex gap-4 p-4 bg-card rounded-2xl shadow-sm border border-border">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted/20">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Image</div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <div>
            <h3 className="font-heading font-medium text-foreground">{item.name}</h3>
            {item.variant && (
              <p className="text-sm text-muted-foreground mt-1">{item.variant}</p>
            )}
          </div>
          <p className="font-bold">₹{item.price * item.quantity}</p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3 bg-background rounded-full px-2 py-1 border border-border">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:text-accent hover:bg-accent/10"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:text-accent hover:bg-accent/10"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
