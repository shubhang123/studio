"use client";

import type { NumberSelectorProps } from '@/types';
import { Button } from './ui/button';
import { Minus, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

export default function NumberSelector({ value, onChange, min, max, disabled }: NumberSelectorProps) {
  const handleIncrement = () => {
    if (disabled) return;
    const newValue = Math.min(max, (value ?? -1) + 1);
    onChange(newValue);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const newValue = Math.max(min, (value ?? 1) - 1);
    onChange(newValue);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const num = e.target.value === '' ? null : Number(e.target.value);
    if (num === null) {
      onChange(null);
    } else if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={disabled || value === min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={value ?? ''}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className="text-center font-code text-lg"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={disabled || value === max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
