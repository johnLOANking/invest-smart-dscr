
import { CalculatorInputs, UrlParams } from '../types/CalculatorTypes';

/**
 * Generate a shareable URL with calculator inputs
 */
export const generateShareableUrl = (inputs: CalculatorInputs): string => {
  const url = new URL(window.location.href);
  
  // Clear existing params
  url.search = '';
  
  // Add basic params
  url.searchParams.set('isRefi', inputs.isRefi.toString());
  url.searchParams.set('propertyValue', inputs.propertyValue.toString());
  url.searchParams.set('loanAmount', inputs.loanAmount.toString());
  url.searchParams.set('numberOfUnits', inputs.numberOfUnits.toString());
  url.searchParams.set('rentalIncomeMethod', inputs.rentalIncomeMethod);
  url.searchParams.set('totalRentalIncome', inputs.totalRentalIncome.toString());
  
  // Add unit incomes if using per-unit method
  if (inputs.rentalIncomeMethod === 'perUnit' && inputs.unitIncomes.length > 0) {
    inputs.unitIncomes.forEach((income, index) => {
      if (income > 0) {
        url.searchParams.set(`unitIncome${index}`, income.toString());
      }
    });
  }
  
  // Add loan terms
  url.searchParams.set('interestRate', inputs.interestRate.toString());
  url.searchParams.set('termYears', inputs.termYears.toString());
  url.searchParams.set('isInterestOnly', inputs.isInterestOnly.toString());
  
  // Add expenses
  url.searchParams.set('taxesPercent', inputs.taxesPercent.toString());
  url.searchParams.set('insurancePercent', inputs.insurancePercent.toString());
  url.searchParams.set('hoaFees', inputs.hoaFees.toString());
  
  // Add state
  url.searchParams.set('propertyState', inputs.propertyState);
  
  return url.toString();
};

/**
 * Parse URL parameters into calculator inputs
 */
export const parseUrlParams = (): UrlParams => {
  const params = new URLSearchParams(window.location.search);
  const urlParams: UrlParams = {};
  
  // Helper function to parse boolean values
  const parseBoolean = (value: string | null): boolean | undefined => {
    if (value === null) return undefined;
    return value.toLowerCase() === 'true';
  };
  
  // Helper function to parse number values
  const parseNumber = (value: string | null): number | undefined => {
    if (value === null) return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  };
  
  // Parse parameters
  urlParams.isRefi = parseBoolean(params.get('isRefi'));
  urlParams.propertyValue = parseNumber(params.get('propertyValue'));
  urlParams.loanAmount = parseNumber(params.get('loanAmount'));
  urlParams.numberOfUnits = parseNumber(params.get('numberOfUnits'));
  
  const rentalIncomeMethod = params.get('rentalIncomeMethod');
  if (rentalIncomeMethod === 'total' || rentalIncomeMethod === 'perUnit') {
    urlParams.rentalIncomeMethod = rentalIncomeMethod;
  }
  
  urlParams.totalRentalIncome = parseNumber(params.get('totalRentalIncome'));
  
  // Parse unit incomes
  const unitIncomes: number[] = [];
  for (let i = 0; i < 10; i++) {
    const unitIncome = parseNumber(params.get(`unitIncome${i}`));
    if (unitIncome !== undefined) {
      unitIncomes[i] = unitIncome;
    }
  }
  
  if (unitIncomes.length > 0) {
    urlParams.unitIncomes = unitIncomes;
  }
  
  // Parse loan terms
  urlParams.interestRate = parseNumber(params.get('interestRate'));
  urlParams.termYears = parseNumber(params.get('termYears'));
  urlParams.isInterestOnly = parseBoolean(params.get('isInterestOnly'));
  
  // Parse expenses
  urlParams.taxesPercent = parseNumber(params.get('taxesPercent'));
  urlParams.insurancePercent = parseNumber(params.get('insurancePercent'));
  urlParams.hoaFees = parseNumber(params.get('hoaFees'));
  
  // Parse state
  const propertyState = params.get('propertyState');
  if (propertyState) {
    urlParams.propertyState = propertyState;
  }
  
  return urlParams;
};
