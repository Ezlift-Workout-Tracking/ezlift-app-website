'use client';

/**
 * Active Program Card Component
 * Story 1.8: Displays user's active program with next workout info
 * 
 * Features:
 * - Shows active program name and next workout
 * - Edit access gated by user data state (new vs existing users)
 * - Different empty states for new vs existing users
 * - Analytics tracking for all interactions
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Edit, Eye, Play, Dumbbell } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRoutines } from '@/hooks/useRoutines';
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs';
import { useUserDataState } from '@/hooks/useUserDataState';
import { findActiveRoutine, getNextWorkout, getCurrentWeek, getMobileAppLink } from '@/lib/utils/program-utils';

function EmptyProgramStateNew() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Dumbbell className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Create your first program to get started</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Build a custom training program tailored to your goals
      </p>
      <div className="flex gap-3">
        <Button asChild className="bg-brand-orange hover:bg-brand-orange/90">
          <a href="/app/programs/create">Create Program</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/app/programs">Browse Programs</a>
        </Button>
      </div>
    </div>
  );
}

function EmptyProgramStateExisting() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Dumbbell className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Your programs from mobile will appear here</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Open the mobile app to create or sync programs
      </p>
      <Button asChild className="bg-brand-orange hover:bg-brand-orange/90">
        <a href={getMobileAppLink()} target="_blank" rel="noopener noreferrer">
          Download Mobile App
        </a>
      </Button>
    </div>
  );
}

function ReadOnlyProgramDialog({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Program editing on mobile only</DialogTitle>
          <DialogDescription>
            Editing programs on web is coming soon! For now, use the mobile app 
            to edit your routines.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button asChild className="bg-brand-orange hover:bg-brand-orange/90">
            <a href={getMobileAppLink()} target="_blank" rel="noopener noreferrer">
              Download App
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ActiveProgramCard() {
  const router = useRouter();
  const { state: userState } = useUserDataState();
  const { data: routines = [], isLoading: routinesLoading, error: routinesError } = useRoutines();
  const { data: workoutLogs = [], isLoading: logsLoading, error: logsError } = useWorkoutLogs(50);
  const [showReadOnlyDialog, setShowReadOnlyDialog] = useState(false);

  // Determine active routine based on actual training history
  const activeRoutine = findActiveRoutine(routines, workoutLogs);
  const nextWorkoutInfo = activeRoutine ? getNextWorkout(activeRoutine, workoutLogs) : null;
  const weekInfo = activeRoutine ? getCurrentWeek(activeRoutine, workoutLogs) : null;
  
  const isLoading = routinesLoading || logsLoading;
  const error = routinesError || logsError;

  // Track analytics on mount
  useEffect(() => {
    console.log('[Analytics] Dashboard Card Viewed', {
      cardType: 'program',
      hasData: !!activeRoutine,
      hasActiveProgram: !!activeRoutine,
    });
  }, [activeRoutine]);

  const handleViewProgram = () => {
    if (!activeRoutine) return;
    
    console.log('[Analytics] Dashboard Card Clicked', {
      action: 'view_program',
      programId: activeRoutine.id,
    });
    
    router.push(`/app/programs/${activeRoutine.id}`);
  };

  const handleEditProgram = () => {
    if (!activeRoutine) return;

    // Check user data state for edit access
    if (userState === 'new') {
      // New user: Allow edit
      console.log('[Analytics] Dashboard Card Clicked', {
        action: 'edit_program',
        allowed: true,
        programId: activeRoutine.id,
      });
      
      router.push(`/app/programs/${activeRoutine.id}/edit`);
    } else {
      // Existing user or unknown: Block edit
      console.log('[Analytics] Dashboard Card Clicked', {
        action: 'edit_program_blocked',
        allowed: false,
        userState,
      });
      
      setShowReadOnlyDialog(true);
    }
  };

  const handleStartWorkout = () => {
    console.log('[Analytics] Dashboard Card Clicked', {
      action: 'start_workout_mobile',
      programId: activeRoutine?.id,
    });
  };

  if (isLoading || error) {
    return (
      <DashboardCard
        title="Active Program"
        description="Your current training plan"
        icon={<Dumbbell className="h-5 w-5 text-brand-blue" />}
        cardType="program"
        isLoading={isLoading}
        isError={!!error}
        errorMessage="Failed to load programs"
        fullWidth
        analyticsProps={{
          hasData: !!activeRoutine,
          hasActiveProgram: !!activeRoutine,
        }}
      >
        {/* Body hidden during loading/error */}
      </DashboardCard>
    );
  }

  // Empty states
  if (!activeRoutine) {
    return (
      <DashboardCard
        title="Active Program"
        description="Your current training plan"
        icon={<Dumbbell className="h-5 w-5 text-brand-blue" />}
        cardType="program"
        fullWidth
        analyticsProps={{
          hasData: false,
          hasActiveProgram: false,
        }}
      >
        {userState === 'new' ? (
          <EmptyProgramStateNew />
        ) : (
          <EmptyProgramStateExisting />
        )}
      </DashboardCard>
    );
  }

  // Active program display
  return (
    <>
      <DashboardCard
        title="Active Program"
        description="Your current training plan"
        icon={<Dumbbell className="h-5 w-5 text-brand-blue" />}
        cardType="program"
        fullWidth
        analyticsProps={{
          hasData: true,
          hasActiveProgram: true,
          programId: activeRoutine.id,
        }}
      >
        <div className="space-y-4">
          {/* Program Title */}
          <div>
            <h3 className="text-xl font-bold text-text-primary">
              {activeRoutine.title}
              {weekInfo && (
                <span className="text-base font-normal text-text-secondary ml-2">
                  - Week {weekInfo.current} of {weekInfo.total}
                </span>
              )}
            </h3>
            {activeRoutine.description && (
              <p className="text-sm text-text-secondary mt-1">
                {activeRoutine.description}
              </p>
            )}
          </div>

          {/* Next Workout Info */}
          {nextWorkoutInfo && (
            <div className="flex items-center gap-2 text-text-secondary">
              <Calendar className="h-4 w-4" />
              <span className="text-base">
                Next workout: <span className="font-medium text-text-primary">{nextWorkoutInfo.workout.title}</span>
                {' - '}
                <span className="font-medium">{nextWorkoutInfo.dayLabel}</span>
                {nextWorkoutInfo.fullDate && ` (${nextWorkoutInfo.fullDate})`}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleViewProgram}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Program
            </Button>
            
            <Button
              variant={userState === 'new' ? 'default' : 'outline'}
              onClick={handleEditProgram}
              className={userState === 'new' ? 'bg-brand-blue hover:bg-brand-blue/90' : ''}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Program
            </Button>
            
            <Button
              variant="ghost"
              asChild
              onClick={handleStartWorkout}
              className="text-brand-blue hover:text-brand-blue/90 hover:bg-brand-blue/10"
            >
              <a href={getMobileAppLink()} target="_blank" rel="noopener noreferrer">
                <Play className="h-4 w-4 mr-2" />
                Start Workout on Mobile
              </a>
            </Button>
          </div>
        </div>
      </DashboardCard>

      {/* Read-Only Dialog */}
      <ReadOnlyProgramDialog 
        isOpen={showReadOnlyDialog}
        onClose={() => setShowReadOnlyDialog(false)}
      />
    </>
  );
}

export default ActiveProgramCard;

