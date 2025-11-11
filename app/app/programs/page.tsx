import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programs - EZLift",
  description: "Manage your workout programs",
};

export default function ProgramsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Programs</h1>
      <p className="text-muted-foreground">Your workout programs will appear here.</p>
    </div>
  );
}



