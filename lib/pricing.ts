export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  highlight?: boolean;
  savings?: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "Forever",
    description: "Perfect for getting started with your fitness journey",
    features: [
      { text: "Create up to 4 workout programs", included: true },
      { text: "Unlimited workout tracking", included: true },
      { text: "Access to 3 months of workout history", included: true },
      { text: "Basic analytics and progress tracking", included: true },
    ],
  },
  {
    name: "Monthly",
    price: "$2.99",
    period: "Month",
    description: "Perfect for lifters who want flexibility and access to all features",
    features: [
      { text: "Get 15 minutes of coaching from our very own personal trainer", included: true },
      { text: "Scan your hand written workouts. Start tracking them right away", included: true },
      { text: "Create unlimited workout programs", included: true },
      { text: "Access to unlimited workout history", included: true },
      { text: "Advanced analytics with detailed charts and insights", included: true },
      { text: "Add your own custom exercises", included: true },
      { text: "24/7 priority support from our team", included: true },
    ],
  },
  {
    name: "Annual",
    price: "$22.99",
    period: "Year",
    description: "Everything in Monthly with more savings - best value for dedicated lifters!",
    features: [
      { text: "All Monthly PRO features included", included: true },
      { text: "Save over 35% compared to monthly", included: true },
      { text: "Priority access to new features", included: true },
    ],
    savings: "Save 35%",
  },
  {
    name: "Lifetime",
    price: "$79.99",
    period: "One-time",
    description: "Get PRO benefits for life at an incredible price - pay once, lift forever!",
    features: [
      { text: "All PRO features, forever", included: true },
      { text: "Never pay a subscription again", included: true },
      { text: "Lifetime access to all future updates", included: true },
    ],
  },
];