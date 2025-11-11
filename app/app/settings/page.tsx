import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - EZLift",
  description: "Application settings",
};

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <p className="text-muted-foreground">Application settings will appear here.</p>
    </div>
  );
}



