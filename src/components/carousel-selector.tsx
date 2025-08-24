
"use client";

import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';

interface CarouselSelectorProps {
  value: number | null;
  onValueChange: (value: number | null) => void;
  min: number;
  max: number;
  disabled?: boolean;
}

export function CarouselSelector({ value, onValueChange, min, max, disabled }: CarouselSelectorProps) {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  const initialIndex = value !== null ? numbers.indexOf(value) : 0;

  return (
    <Carousel
      opts={{
        align: 'center',
        loop: false,
        startIndex: initialIndex,
      }}
      className="w-full max-w-sm mx-auto"
    >
      <CarouselContent>
        {numbers.map((num, index) => (
          <CarouselItem key={index} className="basis-1/5">
             <div className="p-1">
              <Card 
                className={cn(
                  "border-transparent transition-colors",
                  value === num ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground",
                  !disabled && "cursor-pointer"
                )}
                onClick={() => !disabled && onValueChange(num)}
              >
                <CardContent className="flex items-center justify-center p-3 md:p-6">
                  <span className="text-2xl font-semibold font-code">{num}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious disabled={disabled} />
      <CarouselNext disabled={disabled} />
    </Carousel>
  );
}
