import { Metadata } from "next";

export const metadata: Metadata = {
  title: "History - EZLift",
  description: "View your workout history",
};

export default function HistoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Workout History</h1>
      <p className="text-muted-foreground">Your workout history will appear here.</p>
    </div>
  );
}



