import { FileQuestion } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = <FileQuestion className="w-12 h-12 text-muted-foreground" />,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <Card className="w-full p-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground mb-6">
          {description}
        </p>
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
    </Card>
  );
}