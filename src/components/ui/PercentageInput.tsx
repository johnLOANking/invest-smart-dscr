
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PercentageInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const PercentageInput: React.FC<PercentageInputProps> = ({
  value,
  onChange,
  className,
  ...props
}) => {
  // State to hold the formatted display value
  const [displayValue, setDisplayValue] = useState<string>('');

  // Format the value as percentage whenever it changes
  useEffect(() => {
    if (value === 0 && displayValue === '') {
      return; // Don't format empty input
    }
    
    const formatted = formatAsPercentage(value);
    setDisplayValue(formatted);
  }, [value]);

  // Format a number as percentage (without the onChange handler)
  const formatAsPercentage = (num: number): string => {
    // Remove percentage formatting for empty or zero values
    if (num === 0 || isNaN(num)) {
      return '';
    }
    
    // Format as percentage
    return num.toString();
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Remove non-numeric characters
    const numericValue = inputValue.replace(/[^0-9.]/g, '');
    
    // Convert to number
    const newValue = numericValue ? parseFloat(numericValue) : 0;
    
    // Cap the maximum percentage (optional)
    const cappedValue = Math.min(newValue, 100);
    
    // Update the parent component
    onChange(cappedValue);
    
    // If the user is clearing the input, also clear the display value
    if (inputValue === '') {
      setDisplayValue('');
    }
  };

  // Handle focus to show raw number
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Show the raw number when focused
    if (value > 0) {
      setDisplayValue(value.toString());
    } else {
      setDisplayValue('');
    }
    
    // Select all text when focused
    e.target.select();
    
    // Call the original onFocus if provided
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  // Handle blur to reformat
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Reformat when leaving the field
    setDisplayValue(formatAsPercentage(value));
    
    // Call the original onBlur if provided
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn("pr-6", className)}
        {...props}
      />
      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
        %
      </span>
    </div>
  );
};

export default PercentageInput;
