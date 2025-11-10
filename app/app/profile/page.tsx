import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - EZLift",
  description: "Manage your profile",
};

export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      <p className="text-muted-foreground">Manage your profile settings here.</p>
    </div>
  );
}



