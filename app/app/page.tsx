'use client';

import { useUserDataState } from "@/hooks/useUserDataState";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";
import { TrainingVolumeCard } from "@/components/dashboard/TrainingVolumeCard";
import { PersonalRecordsCard } from "@/components/dashboard/PersonalRecordsCard";
import { RecentWorkoutsCard } from "@/components/dashboard/RecentWorkoutsCard";
import { ProgressChartCard } from "@/components/dashboard/ProgressChartCard";
import { ActiveProgramCard } from "@/components/dashboard/ActiveProgramCard";

export default function DashboardPage() {
  const { state } = useUserDataState();

  return (
    <DashboardShell>
      {/* Dashboard Cards Grid */}
      {state === 'new' ? (
        // Empty state for new users
        <EmptyDashboard />
      ) : (
        // Dashboard grid for existing users (or while loading)
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Story 1.4: Training Volume Card */}
          <TrainingVolumeCard />
          
          {/* Story 1.5: Personal Records Card */}
          <PersonalRecordsCard />
          
          {/* Placeholder skeletons for cards (to be replaced by actual cards in Stories 1.6-1.8) */}
          <RecentWorkoutsCard />  {/* Story 1.6: Recent Workouts Card */}
          <ProgressChartCard />  {/* Story 1.7: Progress Chart Card */}
          
          {/* Story 1.8: Active Program Card - Full-width */}
          <ActiveProgramCard />
        </div>
      )}
    </DashboardShell>
  );
} 
