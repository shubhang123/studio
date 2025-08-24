
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
  onChange: (value: number | null) => void;
  min: number;
  max: number;
  disabled?: boolean;
}

export function CarouselSelector({ value, onChange, min, max, disabled }: CarouselSelectorProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  const handleItemClick = (index: number) => {
    if (api && !disabled) {
      api.scrollTo(index);
    }
  };

  React.useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      const selectedValue = numbers[api.selectedScrollSnap()];
      onChange(selectedValue);
    };

    api.on('select', handleSelect);

    return () => {
      api.off('select', handleSelect);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  React.useEffect(() => {
    if (api) {
        if (value !== null && numbers.includes(value)) {
            const index = numbers.indexOf(value);
            if (api.selectedScrollSnap() !== index) {
                api.scrollTo(index, true);
            }
        } else if (value === null) {
            if (api.selectedScrollSnap() !== 0) {
                api.scrollTo(0, true);
            }
        }
    }
  }, [api, value, numbers]);

  
  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: 'center',
        loop: false,
      }}
      className="w-full max-w-sm mx-auto"
    >
      <CarouselContent>
        {numbers.map((num, index) => (
          <CarouselItem key={index} className="basis-1/5 cursor-pointer" onClick={() => handleItemClick(index)}>
            <div className="p-1">
              <Card className={cn(
                  "border-transparent transition-colors",
                  value === num ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
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
