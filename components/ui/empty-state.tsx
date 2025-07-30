import { FileQuestion } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = <FileQuestion className="w-12 h-12 text-gray-400" />,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <Card className="w-full p-12 bg-white border-gray-200 shadow-md">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-4 text-gray-900">
          {title}
        </h3>
        <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md">
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