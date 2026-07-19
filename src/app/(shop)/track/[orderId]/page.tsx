"use client";

import { use } from "react";
import { Check, Package, Truck, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TrackingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);

  // In a real app, fetch tracking info based on orderId
  // Dummy data
  const trackingData = {
    orderNumber: orderId === "0" ? "ORD-123456" : `ORD-${orderId}`,
    status: "shipped", // "placed", "confirmed", "shipped", "delivered"
    expectedDelivery: "22 July, 2026",
    timeline: [
      { id: "placed", label: "Order Placed", date: "19 July, 10:30 AM", icon: Package, completed: true },
      { id: "confirmed", label: "Order Confirmed", date: "19 July, 11:15 AM", icon: Check, completed: true },
      { id: "shipped", label: "Shipped", date: "20 July, 09:00 AM", icon: Truck, completed: true },
      { id: "delivered", label: "Out for Delivery", date: "Pending", icon: Home, completed: false },
    ],
  };

  const getStatusIndex = (status: string) => {
    return trackingData.timeline.findIndex(item => item.id === status);
  };
  
  const currentStatusIndex = getStatusIndex(trackingData.status);

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center min-h-[70vh]">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2 text-center">Track Order</h1>
        <p className="text-muted-foreground text-center mb-12">
          Tracking ID: <span className="font-bold text-foreground">{trackingData.orderNumber}</span>
        </p>

        <div className="bg-card p-8 rounded-3xl shadow-gum border border-border">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 z-0 hidden md:block"></div>
            
            <div className="space-y-12">
              {trackingData.timeline.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = step.completed || index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                
                return (
                  <div key={step.id} className="relative z-10 flex items-start gap-6">
                    <div className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-4 border-card bg-background relative",
                      isCompleted ? "bg-primary text-primary-foreground border-primary/20" : "bg-muted text-muted-foreground border-transparent"
                    )}>
                      <Icon className="h-6 w-6" />
                      {isCompleted && index < trackingData.timeline.length - 1 && (
                        <div className="absolute top-16 bottom-[-3rem] w-1 bg-primary left-1/2 -translate-x-1/2 md:hidden"></div>
                      )}
                    </div>
                    
                    <div className="pt-3 pb-8 md:pb-0">
                      <h3 className={cn(
                        "font-heading font-bold text-xl",
                        isCompleted ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.label}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{step.date}</p>
                      
                      {isCurrent && (
                        <p className="mt-2 text-sm text-primary font-medium bg-primary/10 inline-block px-3 py-1 rounded-full">
                          Current Status
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border flex justify-between items-center bg-background rounded-2xl p-6">
            <div>
              <p className="text-sm text-muted-foreground">Expected Delivery</p>
              <p className="font-heading font-bold text-xl text-foreground">{trackingData.expectedDelivery}</p>
            </div>
            <Truck className="h-10 w-10 text-primary opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
