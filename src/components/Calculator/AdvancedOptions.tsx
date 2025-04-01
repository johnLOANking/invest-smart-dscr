
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import CurrencyInput from '@/components/ui/CurrencyInput';
import PercentageInput from '@/components/ui/PercentageInput';
import { CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdvancedOptionsProps {
  interestRate: number;
  setInterestRate: (value: number) => void;
  termYears: number;
  setTermYears: (value: number) => void;
  isInterestOnly: boolean;
  setIsInterestOnly: (value: boolean) => void;
  taxesPercent: number;
  setTaxesPercent: (value: number) => void;
  taxesAmount: number;
  setTaxesAmount: (value: number) => void;
  insurancePercent: number;
  setInsurancePercent: (value: number) => void;
  insuranceAmount: number;
  setInsuranceAmount: (value: number) => void;
  hoaFees: number;
  setHoaFees: (value: number) => void;
  showTaxesAmount: boolean;
  setShowTaxesAmount: (value: boolean) => void;
  showInsuranceAmount: boolean;
  setShowInsuranceAmount: (value: boolean) => void;
  propertyValue: number;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  interestRate,
  setInterestRate,
  termYears,
  setTermYears,
  isInterestOnly,
  setIsInterestOnly,
  taxesPercent,
  setTaxesPercent,
  taxesAmount,
  setTaxesAmount,
  insurancePercent,
  setInsurancePercent,
  insuranceAmount,
  setInsuranceAmount,
  hoaFees,
  setHoaFees,
  showTaxesAmount,
  setShowTaxesAmount,
  showInsuranceAmount,
  setShowInsuranceAmount,
  propertyValue
}) => {
  const isMobile = useIsMobile();
  
  // Calculate annual taxes and insurance for display
  const annualTaxesAmount = taxesPercent > 0 ? (propertyValue * taxesPercent / 100) : 0;
  const annualInsuranceAmount = insurancePercent > 0 ? (propertyValue * insurancePercent / 100) : 0;

  // Show as either a card content (desktop) or accordion (mobile)
  if (!isMobile) {
    return (
      <CardContent className="p-6">
        {renderContent()}
      </CardContent>
    );
  }
  
  return (
    <Accordion type="single" collapsible defaultValue="closed" className="w-full">
      <AccordionItem value="advanced-options">
        <AccordionTrigger className="py-4">
          Advanced Options
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          {renderContent()}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
  
  function renderContent() {
    return (
      <div className="space-y-6">
        {/* Loan Terms Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Loan Terms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate</Label>
              <PercentageInput
                id="interestRate"
                value={interestRate}
                onChange={setInterestRate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="termYears">Term (years)</Label>
              <Select
                value={termYears.toString()}
                onValueChange={(value) => setTermYears(parseInt(value))}
              >
                <SelectTrigger id="termYears">
                  <SelectValue placeholder="Select Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 years</SelectItem>
                  <SelectItem value="15">15 years</SelectItem>
                  <SelectItem value="20">20 years</SelectItem>
                  <SelectItem value="25">25 years</SelectItem>
                  <SelectItem value="30">30 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2 flex items-center space-x-2">
              <Switch
                id="isInterestOnly"
                checked={isInterestOnly}
                onCheckedChange={setIsInterestOnly}
              />
              <Label htmlFor="isInterestOnly">Interest Only Payment</Label>
            </div>
          </div>
        </div>
        
        {/* Property Expenses Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Property Expenses</h3>
          <div className="space-y-4">
            {/* Property Taxes */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="taxesPercent">Annual Property Taxes</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Amount</span>
                  <Switch
                    id="showTaxesAmount"
                    checked={showTaxesAmount}
                    onCheckedChange={setShowTaxesAmount}
                    size="sm"
                  />
                </div>
              </div>
              
              {showTaxesAmount ? (
                <CurrencyInput
                  id="taxesAmount"
                  value={taxesAmount}
                  onChange={setTaxesAmount}
                  placeholder="Annual Tax Amount"
                />
              ) : (
                <div className="space-y-1">
                  <PercentageInput
                    id="taxesPercent"
                    value={taxesPercent}
                    onChange={setTaxesPercent}
                    placeholder="Property Tax Rate"
                  />
                  <p className="text-xs text-gray-500">
                    {annualTaxesAmount > 0 && `Annual Amount: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0
                    }).format(annualTaxesAmount)}`}
                  </p>
                </div>
              )}
            </div>
            
            {/* Property Insurance */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="insurancePercent">Annual Insurance</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Amount</span>
                  <Switch
                    id="showInsuranceAmount"
                    checked={showInsuranceAmount}
                    onCheckedChange={setShowInsuranceAmount}
                    size="sm"
                  />
                </div>
              </div>
              
              {showInsuranceAmount ? (
                <CurrencyInput
                  id="insuranceAmount"
                  value={insuranceAmount}
                  onChange={setInsuranceAmount}
                  placeholder="Annual Insurance Amount"
                />
              ) : (
                <div className="space-y-1">
                  <PercentageInput
                    id="insurancePercent"
                    value={insurancePercent}
                    onChange={setInsurancePercent}
                    placeholder="Insurance Rate"
                  />
                  <p className="text-xs text-gray-500">
                    {annualInsuranceAmount > 0 && `Annual Amount: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0
                    }).format(annualInsuranceAmount)}`}
                  </p>
                </div>
              )}
            </div>
            
            {/* HOA Fees */}
            <div className="space-y-2">
              <Label htmlFor="hoaFees">Monthly HOA Fees</Label>
              <CurrencyInput
                id="hoaFees"
                value={hoaFees}
                onChange={setHoaFees}
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default AdvancedOptions;
