"use client";

import { useState } from "react";
import { Button } from "./button";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ClearAnswersDialog({
  scenarioId,
}: {
  scenarioId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClear = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/webapp/api/answers/clear-scenario/${scenarioId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to clear answers");
        return;
      }

      toast.success("Answers cleared! Refreshing...");
      setOpen(false);

      // Refresh page to show cleared state
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error("Error clearing answers:", error);
      toast.error("Failed to clear answers");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-destructive hover:text-destructive"
      >
        Clear Answers
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 shadow-lg max-w-sm w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold">Clear All Answers?</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          This will delete all your answers and points for this scenario. This
          action cannot be undone.
        </p>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={isLoading}
          >
            {isLoading ? "Clearing..." : "Clear Answers"}
          </Button>
        </div>
      </div>
    </div>
  );
}
