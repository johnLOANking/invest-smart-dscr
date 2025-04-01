
import React, { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { HomeIcon, Building2, DollarSign, Calculator } from 'lucide-react';
import CurrencyInput from '@/components/ui/CurrencyInput';
import PercentageInput from '@/components/ui/PercentageInput';
import AdvancedOptions from '@/components/Calculator/AdvancedOptions';
import ResultsDisplay from '@/components/Calculator/ResultsDisplay';
import { CalculatorInputs, CalculatorResults } from '@/types/CalculatorTypes';
import { calculateResults } from '@/utils/calculationUtils';
import { getStateRates, getDefaultInterestRate } from '@/utils/apiUtils';
import { generateShareableUrl, parseUrlParams } from '@/utils/urlUtils';

// US States Array
const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" }
];

const CalculatorForm: React.FC = () => {
  const isMobile = useIsMobile();
  
  // Initialize default values
  const DEFAULT_INPUTS: CalculatorInputs = {
    isRefi: false,
    propertyState: "CA",
    propertyValue: 0,
    downPaymentPercent: 25,
    downPaymentAmount: 0,
    loanAmount: 0,
    numberOfUnits: 1,
    rentalIncomeMethod: 'total',
    totalRentalIncome: 0,
    unitIncomes: Array(10).fill(0),
    interestRate: 6.125,
    termYears: 30,
    isInterestOnly: false,
    taxesPercent: 1.25,
    taxesAmount: 0,
    insurancePercent: 0.35,
    insuranceAmount: 0,
    hoaFees: 0
  };
  
  // Form state
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  
  // Toggle states for UI
  const [useDownPaymentAmount, setUseDownPaymentAmount] = useState(false);
  const [showTaxesAmount, setShowTaxesAmount] = useState(false);
  const [showInsuranceAmount, setShowInsuranceAmount] = useState(false);
  
  // Results state
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [shareableUrl, setShareableUrl] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Load data from URL parameters on mount
  useEffect(() => {
    const urlParams = parseUrlParams();
    if (Object.keys(urlParams).length > 0) {
      // Merge URL params with default inputs
      const mergedInputs = { ...DEFAULT_INPUTS };
      
      // Apply each URL param to the inputs
      Object.entries(urlParams).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'unitIncomes' && Array.isArray(value)) {
            mergedInputs.unitIncomes = [...DEFAULT_INPUTS.unitIncomes];
            value.forEach((income, index) => {
              if (index < mergedInputs.unitIncomes.length) {
                mergedInputs.unitIncomes[index] = income;
              }
            });
          } else if (key in mergedInputs) {
            // @ts-ignore: Dynamic access
            mergedInputs[key] = value;
          }
        }
      });
      
      setInputs(mergedInputs);
      
      // Set appropriate UI toggles based on URL params
      if (urlParams.taxesAmount && urlParams.taxesAmount > 0) {
        setShowTaxesAmount(true);
      }
      
      if (urlParams.insuranceAmount && urlParams.insuranceAmount > 0) {
        setShowInsuranceAmount(true);
      }
      
      // Automatically calculate results if we have URL params
      setTimeout(() => {
        handleCalculate();
      }, 500);
    } else {
      // Just load default interest rate and state rates
      loadInitialRates();
    }
  }, []);
  
  // Load default interest rate and tax/insurance rates
  const loadInitialRates = async () => {
    try {
      // Get default interest rate
      const defaultRate = await getDefaultInterestRate();
      
      // Get default state rates (using CA as default)
      const stateRates = await getStateRates("CA");
      
      // Update inputs with fetched rates
      setInputs(prevInputs => ({
        ...prevInputs,
        interestRate: defaultRate,
        taxesPercent: stateRates.taxes,
        insurancePercent: stateRates.insurance
      }));
    } catch (error) {
      console.error("Error loading initial rates:", error);
    }
  };
  
  // Handle property state change
  const handleStateChange = useCallback(async (stateCode: string) => {
    try {
      const stateRates = await getStateRates(stateCode);
      
      setInputs(prevInputs => ({
        ...prevInputs,
        propertyState: stateCode,
        // Only update percentages if not using direct amounts
        taxesPercent: !showTaxesAmount ? stateRates.taxes : prevInputs.taxesPercent,
        insurancePercent: !showInsuranceAmount ? stateRates.insurance : prevInputs.insurancePercent
      }));
    } catch (error) {
      console.error("Error getting state rates:", error);
    }
  }, [showTaxesAmount, showInsuranceAmount]);
  
  // Update loan amount when property value or down payment changes
  useEffect(() => {
    if (useDownPaymentAmount) {
      // Calculate loan amount from property value and down payment amount
      const newLoanAmount = Math.max(0, inputs.propertyValue - inputs.downPaymentAmount);
      
      // Calculate down payment percentage
      const newDownPaymentPercent = inputs.propertyValue > 0 
        ? (inputs.downPaymentAmount / inputs.propertyValue) * 100 
        : 0;
      
      setInputs(prev => ({
        ...prev,
        loanAmount: newLoanAmount,
        downPaymentPercent: newDownPaymentPercent
      }));
    } else {
      // Calculate down payment amount from percentage
      const newDownPaymentAmount = inputs.propertyValue * (inputs.downPaymentPercent / 100);
      
      // Calculate loan amount
      const newLoanAmount = Math.max(0, inputs.propertyValue - newDownPaymentAmount);
      
      setInputs(prev => ({
        ...prev,
        downPaymentAmount: newDownPaymentAmount,
        loanAmount: newLoanAmount
      }));
    }
  }, [
    inputs.propertyValue, 
    inputs.downPaymentPercent, 
    inputs.downPaymentAmount, 
    useDownPaymentAmount
  ]);
  
  // Generate unit inputs based on number of units
  const renderUnitIncomeInputs = () => {
    const unitInputs = [];
    
    for (let i = 0; i < inputs.numberOfUnits; i++) {
      unitInputs.push(
        <div key={`unit-${i}`} className="space-y-2">
          <Label htmlFor={`unit-income-${i}`}>Unit {i + 1} Monthly Rent</Label>
          <CurrencyInput
            id={`unit-income-${i}`}
            value={inputs.unitIncomes[i] || 0}
            onChange={(value) => {
              const newUnitIncomes = [...inputs.unitIncomes];
              newUnitIncomes[i] = value;
              setInputs(prev => ({
                ...prev,
                unitIncomes: newUnitIncomes
              }));
            }}
          />
        </div>
      );
    }
    
    return unitInputs;
  };
  
  // Handle calculate button click
  const handleCalculate = async () => {
    setIsCalculating(true);
    
    try {
      // Calculate results
      const calculatedResults = await calculateResults(inputs);
      setResults(calculatedResults);
      
      // Generate shareable URL
      const url = generateShareableUrl(inputs);
      setShareableUrl(url);
    } catch (error) {
      console.error("Error calculating results:", error);
    } finally {
      setIsCalculating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Main Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-6 w-6" />
              <span>DSCR Loan Calculator</span>
            </CardTitle>
            <CardDescription>
              Evaluate your investment property's financial viability
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {/* Loan Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Loan Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Loan Purpose */}
                  <div className="space-y-2">
                    <Label>Loan Purpose</Label>
                    <Tabs 
                      defaultValue={inputs.isRefi ? "refinance" : "purchase"}
                      onValueChange={(value) => {
                        setInputs(prev => ({
                          ...prev,
                          isRefi: value === "refinance"
                        }));
                      }}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="purchase" className="flex items-center">
                          <HomeIcon className="mr-2 h-4 w-4" />
                          Purchase
                        </TabsTrigger>
                        <TabsTrigger value="refinance" className="flex items-center">
                          <Building2 className="mr-2 h-4 w-4" />
                          Refinance
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  {/* Property State */}
                  <div className="space-y-2">
                    <Label htmlFor="propertyState">Property State</Label>
                    <Select
                      value={inputs.propertyState}
                      onValueChange={handleStateChange}
                    >
                      <SelectTrigger id="propertyState">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(state => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.name} ({state.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Property Value Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Value</h3>
                
                <div className="space-y-4">
                  {/* Property Value */}
                  <div className="space-y-2">
                    <Label htmlFor="propertyValue">
                      {inputs.isRefi ? "Appraised Value" : "Purchase Price"}
                    </Label>
                    <CurrencyInput
                      id="propertyValue"
                      value={inputs.propertyValue}
                      onChange={(value) => {
                        setInputs(prev => ({
                          ...prev,
                          propertyValue: value
                        }));
                      }}
                      placeholder="0"
                    />
                  </div>
                  
                  {/* Down Payment / Equity */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="downPayment">
                        {inputs.isRefi ? "Equity" : "Down Payment"}
                      </Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Amount</span>
                        <Switch
                          id="useDownPaymentAmount"
                          checked={useDownPaymentAmount}
                          onCheckedChange={setUseDownPaymentAmount}
                          size="sm"
                        />
                      </div>
                    </div>
                    
                    {useDownPaymentAmount ? (
                      <div className="space-y-1">
                        <CurrencyInput
                          id="downPaymentAmount"
                          value={inputs.downPaymentAmount}
                          onChange={(value) => {
                            setInputs(prev => ({
                              ...prev,
                              downPaymentAmount: value
                            }));
                          }}
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500">
                          {inputs.downPaymentPercent > 0 && `Percentage: ${inputs.downPaymentPercent.toFixed(2)}%`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <PercentageInput
                          id="downPaymentPercent"
                          value={inputs.downPaymentPercent}
                          onChange={(value) => {
                            setInputs(prev => ({
                              ...prev,
                              downPaymentPercent: value
                            }));
                          }}
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500">
                          {inputs.downPaymentAmount > 0 && `Amount: ${new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                          }).format(inputs.downPaymentAmount)}`}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Base Loan Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">Base Loan Amount</Label>
                    <CurrencyInput
                      id="loanAmount"
                      value={inputs.loanAmount}
                      onChange={(value) => {
                        setInputs(prev => ({
                          ...prev,
                          loanAmount: value
                        }));
                      }}
                      placeholder="0"
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
              
              {/* Rental Income Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rental Income</h3>
                
                <div className="space-y-4">
                  {/* Number of Units */}
                  <div className="space-y-2">
                    <Label htmlFor="numberOfUnits">Number of Units</Label>
                    <Select
                      value={inputs.numberOfUnits.toString()}
                      onValueChange={(value) => {
                        setInputs(prev => ({
                          ...prev,
                          numberOfUnits: parseInt(value)
                        }));
                      }}
                    >
                      <SelectTrigger id="numberOfUnits">
                        <SelectValue placeholder="Select Number of Units" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Unit' : 'Units'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Income Entry Method (show only if units > 1) */}
                  {inputs.numberOfUnits > 1 && (
                    <div className="space-y-2">
                      <Label>Income Entry Method</Label>
                      <Tabs 
                        defaultValue={inputs.rentalIncomeMethod}
                        onValueChange={(value: 'total' | 'perUnit') => {
                          setInputs(prev => ({
                            ...prev,
                            rentalIncomeMethod: value
                          }));
                        }}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="total">Total Income</TabsTrigger>
                          <TabsTrigger value="perUnit">Per Unit</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  )}
                  
                  {/* Rental Income Fields */}
                  {inputs.rentalIncomeMethod === 'total' || inputs.numberOfUnits === 1 ? (
                    <div className="space-y-2">
                      <Label htmlFor="totalRentalIncome">Monthly Rental Income</Label>
                      <CurrencyInput
                        id="totalRentalIncome"
                        value={inputs.totalRentalIncome}
                        onChange={(value) => {
                          setInputs(prev => ({
                            ...prev,
                            totalRentalIncome: value
                          }));
                        }}
                        placeholder="0"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {renderUnitIncomeInputs()}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Advanced Options */}
              <AdvancedOptions
                interestRate={inputs.interestRate}
                setInterestRate={(value) => setInputs(prev => ({ ...prev, interestRate: value }))}
                termYears={inputs.termYears}
                setTermYears={(value) => setInputs(prev => ({ ...prev, termYears: value }))}
                isInterestOnly={inputs.isInterestOnly}
                setIsInterestOnly={(value) => setInputs(prev => ({ ...prev, isInterestOnly: value }))}
                taxesPercent={inputs.taxesPercent}
                setTaxesPercent={(value) => setInputs(prev => ({ ...prev, taxesPercent: value }))}
                taxesAmount={inputs.taxesAmount}
                setTaxesAmount={(value) => setInputs(prev => ({ ...prev, taxesAmount: value }))}
                insurancePercent={inputs.insurancePercent}
                setInsurancePercent={(value) => setInputs(prev => ({ ...prev, insurancePercent: value }))}
                insuranceAmount={inputs.insuranceAmount}
                setInsuranceAmount={(value) => setInputs(prev => ({ ...prev, insuranceAmount: value }))}
                hoaFees={inputs.hoaFees}
                setHoaFees={(value) => setInputs(prev => ({ ...prev, hoaFees: value }))}
                showTaxesAmount={showTaxesAmount}
                setShowTaxesAmount={setShowTaxesAmount}
                showInsuranceAmount={showInsuranceAmount}
                setShowInsuranceAmount={setShowInsuranceAmount}
                propertyValue={inputs.propertyValue}
              />
              
              {/* Calculate Button */}
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full md:w-auto"
                  size="lg"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculate DSCR
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Results Section */}
        {results && (
          <ResultsDisplay 
            results={results} 
            shareableUrl={shareableUrl} 
          />
        )}
      </div>
    </div>
  );
};

export default CalculatorForm;
