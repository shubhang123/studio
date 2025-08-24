"use client";

import { useEffect, useRef } from 'react';
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
  onChange: (value: number | null) => void;
  min: number;
  max: number;
  disabled?: boolean;
}

export function CarouselSelector({ value, onChange, min, max, disabled }: CarouselSelectorProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      const selectedValue = numbers[api.selectedScrollSnap()];
      onChange(selectedValue);
    };

    api.on('select', handleSelect);

    // Set initial position
    if (value !== null && numbers.includes(value)) {
      api.scrollTo(numbers.indexOf(value), true);
    } else {
      api.scrollTo(0, true);
    }

    return () => {
      api.off('select', handleSelect);
    };
  }, [api, value, numbers, onChange]);
  
  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: 'center',
        loop: false,
      }}
      className="w-full max-w-xs mx-auto"
    >
      <CarouselContent>
        {numbers.map((num, index) => (
          <CarouselItem key={index} className="basis-1/5">
            <div className="p-1">
              <Card className={cn(
                  "border-transparent",
                  value === num ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              )}>
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
