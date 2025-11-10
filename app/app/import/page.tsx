import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Import - EZLift",
  description: "Import your workout data",
};

export default function ImportPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Import Data</h1>
      <p className="text-muted-foreground">Import your workout data from CSV files.</p>
    </div>
  );
}



