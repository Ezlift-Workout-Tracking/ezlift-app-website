import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PricingPlan } from "@/lib/pricing";

interface PricingCardProps {
  plan: PricingPlan;
  isSelected: boolean;
  onSelect: () => void;
}

export function PricingCard({ plan, isSelected, onSelect }: PricingCardProps) {
  return (
    <Card className={cn(
      "relative p-6 flex flex-col h-full overflow-hidden transition-all duration-300",
      isSelected && "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
    )}>
      {plan.savings && (
        <div className="absolute -right-12 top-7 rotate-45 bg-brand-primary px-12 py-1 text-xs font-semibold text-white">
          {plan.savings}
        </div>
      )}
      <div className="min-h-[48px] flex items-center"> {/* Fixed height container for title */}
        <h3 className="text-2xl font-bold">{plan.name}</h3>
      </div>
      <div className="mt-4 mb-6">
        <span className="text-4xl font-bold">{plan.price}</span>
        <span className="text-muted-foreground">/{plan.period}</span>
      </div>
      <p className="text-muted-foreground mb-6 min-h-[48px]"> {/* Fixed height container for description */}
        {plan.description}
      </p>
      <div className="space-y-4 flex-grow">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm text-left">{feature.text}</span>
          </div>
        ))}
      </div>
      <Button 
        onClick={onSelect}
        className="w-full mt-8" 
        variant={isSelected ? "default" : "outline"}
      >
        Select Plan
      </Button>
    </Card>
  );
}