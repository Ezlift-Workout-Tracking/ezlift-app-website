"use client";

import { useState } from "react";
import { ScrollAnimation } from "@/components/animations/ScrollAnimation";
import { PricingCard } from "@/components/cards/PricingCard";
import { pricingPlans } from "@/lib/pricing";
import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/lib/constants";

export function Pricing() {
  // Default to Annual plan (index 2: Free, Monthly, Annual, Lifetime)
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(2);

  return (
    <section id="pricing" className="py-24 scroll-mt-16">
      <div className="container px-4 mx-auto text-center">
        <ScrollAnimation delay={0}>
          <h2 className="text-3xl font-bold mb-4">
            Start Lifting Smarter – No Limits, No Ads
          </h2>
          <p className="text-xl text-muted-foreground mb-16 max-w-2xl mx-auto">
            Start free with unlimited tracking for up to 4 workout programs. Upgrade to PRO to create unlimited programs, unlock advanced analytics, coaching, and more. Cancel anytime within 30 days for a full refund!
          </p>
        </ScrollAnimation>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <ScrollAnimation key={index} delay={index * 2}>
              <PricingCard 
                plan={plan}
                isSelected={selectedPlanIndex === index}
                onSelect={() => setSelectedPlanIndex(index)}
              />
            </ScrollAnimation>
          ))}
        </div>

        <ScrollAnimation delay={8}>
          <div className="mt-16 flex flex-col items-center gap-6">
            <h3 className="text-2xl font-semibold">Download the App</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={BRAND.links.appStore}
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform hover:scale-105 duration-300"
                aria-label="Download on the App Store"
              >
                <Image
                  src="/app-store-badge.svg"
                  alt="Download on the App Store"
                  width={160}
                  height={48}
                  className="h-[48px] w-auto"
                />
              </Link>
              <Link
                href={BRAND.links.playStore}
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform hover:scale-105 duration-300"
                aria-label="Get it on Google Play"
              >
                <Image
                  src="/play-store-badge.svg"
                  alt="Get it on Google Play"
                  width={160}
                  height={48}
                  className="h-[48px] w-auto"
                />
              </Link>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}