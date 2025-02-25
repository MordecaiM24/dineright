import { useState, useEffect } from "react";
import { TrackedItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar } from "lucide-react";
import MacroPieChart from "./macro-pie-chart";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TrackingView() {
  const [trackingData, setTrackingData] = useState<
    Record<string, TrackedItem[]>
  >({});
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Load tracking data from localStorage
    const loadTrackingData = () => {
      const data = localStorage.getItem("trackingData");
      if (data) {
        setTrackingData(JSON.parse(data));
      }
      setLoading(false);
    };

    loadTrackingData();
    setSelectedDate(today);

    // Setup interval to reload data periodically
    const interval = setInterval(loadTrackingData, 5000);

    return () => clearInterval(interval);
  }, [today]);

  // Calculate total nutrition for selected date
  const calculateTotals = () => {
    const items = trackingData[selectedDate] || [];

    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sodium: 0,
      fiber: 0,
    };

    items.forEach((item) => {
      totals.calories += item.nutrition.Calories;
      totals.protein += item.nutrition.Protein;
      totals.carbs += item.nutrition["Total Carbohydrate"];
      totals.fat += item.nutrition["Total Fat"];
      totals.sodium += item.nutrition.Sodium;
      totals.fiber += item.nutrition.Fiber;
    });

    // Calculate percentages for pie chart
    const proteinCals = totals.protein * 4;
    const carbCals = totals.carbs * 4;
    const fatCals = totals.fat * 9;
    const totalCals = proteinCals + carbCals + fatCals;

    const proteinPercent =
      totalCals > 0 ? Math.round((proteinCals / totalCals) * 100) : 0;
    const carbPercent =
      totalCals > 0 ? Math.round((carbCals / totalCals) * 100) : 0;
    const fatPercent =
      totalCals > 0 ? Math.round((fatCals / totalCals) * 100) : 0;

    return {
      ...totals,
      proteinPercent,
      carbPercent,
      fatPercent,
    };
  };

  const removeItem = (itemId: string) => {
    // Create new tracking data without the item
    const updatedItems = (trackingData[selectedDate] || []).filter(
      (item) => item.id !== itemId
    );

    const updatedTrackingData = {
      ...trackingData,
      [selectedDate]: updatedItems,
    };

    // Update state and localStorage
    setTrackingData(updatedTrackingData);
    localStorage.setItem("trackingData", JSON.stringify(updatedTrackingData));

    toast({
      title: "Item Removed",
      description: "The item has been removed from your tracking.",
      duration: 3000,
    });
  };

  const clearDay = () => {
    const updatedTrackingData = { ...trackingData };
    delete updatedTrackingData[selectedDate];

    // Update state and localStorage
    setTrackingData(updatedTrackingData);
    localStorage.setItem("trackingData", JSON.stringify(updatedTrackingData));

    toast({
      title: "Day Cleared",
      description: `All items for ${selectedDate} have been cleared.`,
      duration: 3000,
    });
  };

  // Get available dates from tracking data
  const availableDates = Object.keys(trackingData).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const totals = calculateTotals();
  const hasItems = trackingData[selectedDate]?.length > 0;

  return (
    <div className="pb-16 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-medium">Meal Tracking</h2>

        <div className="flex items-center gap-4">
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1 border rounded-md bg-white dark:bg-zinc-800"
          >
            {availableDates.length > 0 ? (
              availableDates.map((date) => (
                <option key={date} value={date}>
                  {date === today ? `Today (${date})` : date}
                </option>
              ))
            ) : (
              <option value={today}>Today ({today})</option>
            )}
          </select>

          {hasItems && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear Day
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear Day</DialogTitle>
                  <DialogDescription>
                    This will remove all tracked items for {selectedDate}. This
                    action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <Button variant="destructive" onClick={clearDay}>
                    Yes, Clear Day
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-zinc-500">Loading tracking data...</p>
        </div>
      ) : hasItems ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                      <div className="text-sm text-zinc-500">Calories</div>
                      <div className="text-2xl font-semibold mt-1">
                        {Math.round(totals.calories)}
                      </div>
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                      <div className="text-sm text-zinc-500">Protein</div>
                      <div className="text-2xl font-semibold mt-1">
                        {Math.round(totals.protein)}g
                      </div>
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                      <div className="text-sm text-zinc-500">Carbs</div>
                      <div className="text-2xl font-semibold mt-1">
                        {Math.round(totals.carbs)}g
                      </div>
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                      <div className="text-sm text-zinc-500">Fat</div>
                      <div className="text-2xl font-semibold mt-1">
                        {Math.round(totals.fat)}g
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                      <div className="text-sm text-zinc-500">Fiber</div>
                      <div className="text-xl font-semibold mt-1">
                        {Math.round(totals.fiber)}g
                      </div>
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                      <div className="text-sm text-zinc-500">Sodium</div>
                      <div className="text-xl font-semibold mt-1">
                        {Math.round(totals.sodium)}mg
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center">
                  <h3 className="font-medium mb-2">Macro Breakdown</h3>
                  <div className="h-48 w-48">
                    <MacroPieChart
                      protein={totals.proteinPercent}
                      carbs={totals.carbPercent}
                      fat={totals.fatPercent}
                      showLabels
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="font-medium mb-4">
              Tracked Items ({trackingData[selectedDate]?.length || 0})
            </h3>

            <div className="space-y-3">
              {trackingData[selectedDate]?.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium">{item.item}</h4>
                    <div className="text-sm text-zinc-500">
                      From {item.hall} • {item.category}
                    </div>
                    <div className="text-sm mt-1">
                      <span className="font-medium">
                        {item.nutrition.Calories} cal
                      </span>{" "}
                      • P: {item.nutrition.Protein}g • C:{" "}
                      {item.nutrition["Total Carbohydrate"]}g • F:{" "}
                      {item.nutrition["Total Fat"]}g
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-zinc-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="inline-block p-6 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-4">
            <Calendar className="h-12 w-12 text-zinc-400 mx-auto" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            No tracked items for {selectedDate}
          </h3>
          <p className="text-zinc-500 max-w-md mx-auto">
            Browse the dining hall menus and add items to your daily tracking to
            see nutrition totals and macro breakdowns.
          </p>
        </div>
      )}
    </div>
  );
}
