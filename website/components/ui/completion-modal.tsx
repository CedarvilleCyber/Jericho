import { Button } from "./button";
import { CheckCircle2, X } from "lucide-react";

export default function CompletionModal({
  scenarioName,
  totalPoints,
  onDismiss,
}: {
  scenarioName: string;
  totalPoints: number;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-8 shadow-lg max-w-md w-full mx-4 text-center relative">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />

        <h2 className="text-3xl font-bold mb-2">Scenario Complete!</h2>

        <p className="text-muted-foreground mb-6">
          You&apos;ve successfully completed <strong>{scenarioName}</strong>
        </p>

        <div className="bg-muted p-4 rounded mb-6">
          <p className="text-sm text-muted-foreground mb-1">Total Points Earned</p>
          <p className="text-4xl font-bold text-green-500">{totalPoints}</p>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Great work! Keep practicing to improve your skills.
        </p>

        <div className="flex gap-3">
          <Button
            onClick={() => window.location.href = "/webapp/leaderboard"}
            className="w-full"
            variant="default"
          >
            View Leaderboard
          </Button>
          <Button
            onClick={() => window.location.href = "/"}
            className="w-full"
            variant="outline"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
