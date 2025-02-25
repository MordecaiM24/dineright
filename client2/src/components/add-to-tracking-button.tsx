import { useState } from "react";
import { MenuItem, TrackedItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AddToTrackingButtonProps {
  item: MenuItem;
  hall: string;
  category: string;
}

export default function AddToTrackingButton({
  item,
  hall,
  category,
}: AddToTrackingButtonProps) {
  const [added, setAdded] = useState(false);
  const { toast } = useToast();

  const addToTracking = () => {
    const today = new Date().toISOString().split("T")[0];
    const trackedItem: TrackedItem = {
      ...item,
      id: `${item.item}-${Date.now()}`,
      timestamp: Date.now(),
      hall,
      category,
    };

    // Get current tracking data
    let trackingData = localStorage.getItem("trackingData");
    let parsedData = trackingData ? JSON.parse(trackingData) : {};

    // Add item to today's tracking
    if (!parsedData[today]) {
      parsedData[today] = [];
    }

    parsedData[today].push(trackedItem);

    // Save back to localStorage
    localStorage.setItem("trackingData", JSON.stringify(parsedData));

    // Update UI
    setAdded(true);
    toast({
      title: "Added to Tracking",
      description: `${item.item} has been added to today's tracking.`,
      duration: 3000,
    });

    // Reset after a delay
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <Button
      variant={added ? "default" : "destructive"}
      className="w-full"
      onClick={addToTracking}
    >
      {added ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added to Tracking
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Add to Today's Meals
        </>
      )}
    </Button>
  );
}
