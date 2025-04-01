
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  className,
  ...props
}) => {
  // State to hold the formatted display value
  const [displayValue, setDisplayValue] = useState<string>('');

  // Format the value as currency whenever it changes
  useEffect(() => {
    if (value === 0 && displayValue === '') {
      return; // Don't format empty input
    }
    
    const formatted = formatAsCurrency(value);
    setDisplayValue(formatted);
  }, [value]);

  // Format a number as currency (without the onChange handler)
  const formatAsCurrency = (num: number): string => {
    // Remove currency formatting for empty or zero values
    if (num === 0 || isNaN(num)) {
      return '';
    }
    
    // Format as currency
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Remove non-numeric characters
    const numericValue = inputValue.replace(/[^0-9.]/g, '');
    
    // Convert to number
    const newValue = numericValue ? parseFloat(numericValue) : 0;
    
    // Update the parent component
    onChange(newValue);
    
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
    setDisplayValue(formatAsCurrency(value));
    
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
        className={cn("pl-6", className)}
        {...props}
      />
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
        $
      </span>
    </div>
  );
};

export default CurrencyInput;
