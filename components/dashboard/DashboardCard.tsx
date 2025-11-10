'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useMemo } from 'react';

interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  cardType?: string;
  analyticsProps?: Record<string, any>;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;  // For cards that span full width (md:col-span-2)
}

/**
 * Shared dashboard card wrapper for consistent header/containers and states.
 *
 * Notes:
 * - Loading and error states are handled here for consistency.
 * - Empty-state rendering can remain inside children when selectors must stay visible.
 */
export function DashboardCard({
  title,
  description,
  icon,
  isLoading,
  isError,
  errorMessage,
  cardType,
  analyticsProps,
  children,
  className,
  fullWidth,
}: DashboardCardProps) {
  // Centralized "Card Viewed" analytics
  const derivedType = useMemo(() => {
    if (cardType && cardType.trim().length > 0) return cardType;
    return title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, '_');
  }, [cardType, title]);

  const metaJson = useMemo(() => JSON.stringify(analyticsProps || {}), [analyticsProps]);

  useEffect(() => {
    console.log('[Analytics] Dashboard Card Viewed', {
      cardType: derivedType,
      ...(analyticsProps || {}),
      timestamp: new Date().toISOString(),
    });
  }, [derivedType, metaJson]);

  const cardClassName = fullWidth ? `md:col-span-2 ${className || ''}` : className;

  if (isLoading) {
    return (
      <Card className={cardClassName}>
        <CardHeader className="p-4 pb-2">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={cardClassName}>
        <CardHeader className="p-4 pb-2">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-center py-12">
            <p className="text-sm text-destructive">{errorMessage || 'Something went wrong'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClassName}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className={icon ? 'flex items-center gap-2 !text-card-title' : '!text-card-title'}>
          {icon}
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="p-4 pt-0">{children}</CardContent>
    </Card>
  );
}

export default DashboardCard;
