import React, { useState, useEffect } from "react";
import { MenuItem, TrackedItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TrackMealButtonProps {
  item: MenuItem;
  hall: string;
  category: string;
  mini?: boolean;
}

export default function TrackMealButton({
  item,
  hall,
  category,
  mini = false,
}: TrackMealButtonProps) {
  const [added, setAdded] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [servings, setServings] = useState(1);
  const [trackedItemId, setTrackedItemId] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if item is already tracked today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const trackingData = localStorage.getItem("trackingData");

    if (trackingData) {
      const parsedData = JSON.parse(trackingData);
      const todaysItems = parsedData[today] || [];

      // Check if this item is already in today's tracking
      const existingItem = todaysItems.find(
        (trackedItem: TrackedItem) =>
          trackedItem.item === item.item &&
          trackedItem.hall === hall &&
          trackedItem.category === category
      );

      if (existingItem) {
        setAdded(true);
        setTrackedItemId(existingItem.id);
        setServings(existingItem.servings || 1);
      } else {
        setAdded(false);
        setTrackedItemId(null);
      }
    }
  }, [item, hall, category]);

  const handleButtonClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setIsDrawerOpen(true);
  };

  const saveTracking = () => {
    const today = new Date().toISOString().split("T")[0];
    const trackingData = localStorage.getItem("trackingData");
    const parsedData = trackingData ? JSON.parse(trackingData) : {};

    if (!parsedData[today]) {
      parsedData[today] = [];
    }

    if (added && trackedItemId) {
      parsedData[today] = parsedData[today].map((trackedItem: TrackedItem) => {
        if (trackedItem.id === trackedItemId) {
          return { ...trackedItem, servings };
        }
        return trackedItem;
      });

      toast({
        title: "Updated Tracking",
        description: `${item.item} servings updated to ${servings}.`,
        duration: 3000,
      });
    } else {
      // Add new item
      const trackedItem: TrackedItem = {
        ...item,
        id: `${item.item}-${Date.now()}`,
        timestamp: Date.now(),
        hall,
        category,
        servings,
      };

      parsedData[today].push(trackedItem);
      setTrackedItemId(trackedItem.id);
      setAdded(true);

      toast({
        title: "Added to Tracking",
        description: `${item.item} (${servings} servings) added to today's tracking.`,
        duration: 3000,
      });
    }

    localStorage.setItem("trackingData", JSON.stringify(parsedData));
    setIsDrawerOpen(false);
  };

  const deleteTracking = () => {
    if (!trackedItemId) return;

    const today = new Date().toISOString().split("T")[0];
    const trackingData = localStorage.getItem("trackingData");

    if (trackingData) {
      const parsedData = JSON.parse(trackingData);

      if (parsedData[today]) {
        parsedData[today] = parsedData[today].filter(
          (trackedItem: TrackedItem) => trackedItem.id !== trackedItemId
        );

        localStorage.setItem("trackingData", JSON.stringify(parsedData));

        setAdded(false);
        setTrackedItemId(null);

        toast({
          title: "Removed from Tracking",
          description: `${item.item} has been removed from today's tracking.`,
          duration: 3000,
        });
      }
    }

    setIsDrawerOpen(false);
  };

  if (mini) {
    return (
      <>
        <Button
          variant={added ? "outline" : "default"}
          className="w-8 h-8 flex items-center justify-center"
          onClick={(e) => handleButtonClick(e)}
        >
          {added ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
        <ServingsDrawer
          open={isDrawerOpen}
          setOpen={setIsDrawerOpen}
          servings={servings}
          setServings={setServings}
          isEditing={added}
          onSave={saveTracking}
          onDelete={deleteTracking}
          itemName={item.item}
          servingSize={item.nutrition["Serving Size"]}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant={added ? "outline" : "default"}
        className="w-full"
        onClick={(e) => handleButtonClick(e)}
      >
        {added ? (
          <>
            <Edit className="mr-2 h-4 w-4" />
            Edit Tracking
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add to Today&apos;s Meals
          </>
        )}
      </Button>
      <ServingsDrawer
        open={isDrawerOpen}
        setOpen={setIsDrawerOpen}
        servings={servings}
        setServings={setServings}
        isEditing={added}
        onSave={saveTracking}
        onDelete={deleteTracking}
        itemName={item.item}
        servingSize={item.nutrition["Serving Size"]}
      />
    </>
  );
}

interface ServingsDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  servings: number;
  setServings: (servings: number) => void;
  isEditing: boolean;
  onSave: (e?: React.MouseEvent) => void;
  onDelete: (e?: React.MouseEvent) => void;
  itemName: string;
  servingSize: string;
}

function ServingsDrawer({
  open,
  setOpen,
  servings,
  setServings,
  isEditing,
  onSave,
  onDelete,
  itemName,
}: ServingsDrawerProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setServings(Number(e.target.value));
  };

  const handleOpenChange = (isOpen: boolean, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setOpen(isOpen);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="w-full flex flex-col items-center justify-center">
          <DrawerHeader>
            <DrawerTitle>{isEditing ? "Edit Item" : "Add Item"}</DrawerTitle>
            <DrawerDescription>
              {isEditing
                ? `Update or remove ${itemName} from your tracking`
                : `How many servings of ${itemName} did you have?`}
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col space-y-2 w-full max-w-xs">
            <Label htmlFor="servings">Servings</Label>
            <Input
              id="servings"
              type="number"
              min="0.25"
              step="0.25"
              value={servings}
              onChange={handleInputChange}
            />
          </div>
          <DrawerFooter className="flex flex-row justify-end space-x-2">
            {isEditing && (
              <Button variant="destructive" onClick={onDelete}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <Button onClick={onSave}>Save</Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
