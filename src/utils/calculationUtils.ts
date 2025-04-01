import { CalculatorInputs, CalculatorResults } from '../types/CalculatorTypes';
import { getDscrMessage } from './apiUtils';

/**
 * Calculate monthly mortgage payment
 */
export const calculateMonthlyPayment = (
  loanAmount: number,
  interestRate: number,
  termYears: number,
  isInterestOnly: boolean
): number => {
  if (loanAmount <= 0 || interestRate <= 0 || termYears <= 0) {
    return 0;
  }
  
  // For interest-only loans, just calculate the monthly interest
  if (isInterestOnly) {
    return (loanAmount * (interestRate / 100)) / 12;
  }
  
  // For standard loans, use amortization formula
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = termYears * 12;
  
  // Calculate monthly payment using the amortization formula
  const paymentAmount = 
    loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
    (Math.pow(1 + monthlyRate, totalPayments) - 1);
  
  return paymentAmount;
};

/**
 * Calculate monthly taxes based on annual tax percentage or amount
 */
export const calculateMonthlyTaxes = (
  propertyValue: number,
  taxesPercent: number,
  taxesAmount: number
): number => {
  // If tax amount is directly specified, use it
  if (taxesAmount > 0) {
    return taxesAmount / 12;
  }
  
  // Otherwise calculate based on percentage
  return (propertyValue * (taxesPercent / 100)) / 12;
};

/**
 * Calculate monthly insurance based on annual insurance percentage or amount
 */
export const calculateMonthlyInsurance = (
  propertyValue: number,
  insurancePercent: number,
  insuranceAmount: number
): number => {
  // If insurance amount is directly specified, use it
  if (insuranceAmount > 0) {
    return insuranceAmount / 12;
  }
  
  // Otherwise calculate based on percentage
  return (propertyValue * (insurancePercent / 100)) / 12;
};

/**
 * Calculate total rental income
 */
export const calculateTotalRentalIncome = (
  rentalIncomeMethod: 'total' | 'perUnit',
  totalRentalIncome: number,
  unitIncomes: number[]
): number => {
  if (rentalIncomeMethod === 'total') {
    return totalRentalIncome;
  } else {
    // Sum up all unit incomes
    return unitIncomes.reduce((sum, income) => sum + income, 0);
  }
};

/**
 * Calculate DSCR value
 */
export const calculateDSCR = (grossRentalIncome: number, totalExpenses: number): number => {
  if (totalExpenses <= 0) {
    return 0;
  }
  
  return grossRentalIncome / totalExpenses;
};

/**
 * Calculate all results
 */
export const calculateResults = async (inputs: CalculatorInputs): Promise<CalculatorResults> => {
  // Calculate monthly payment
  const monthlyMortgagePayment = calculateMonthlyPayment(
    inputs.loanAmount,
    inputs.interestRate,
    inputs.termYears,
    inputs.isInterestOnly
  );
  
  // Calculate monthly taxes
  const monthlyTaxes = calculateMonthlyTaxes(
    inputs.propertyValue,
    inputs.taxesPercent,
    inputs.taxesAmount
  );
  
  // Calculate monthly insurance
  const monthlyInsurance = calculateMonthlyInsurance(
    inputs.propertyValue,
    inputs.insurancePercent,
    inputs.insuranceAmount
  );
  
  // Use HOA fees directly
  const monthlyHOA = inputs.hoaFees;
  
  // Calculate total monthly expenses
  const totalMonthlyExpenses = monthlyMortgagePayment + monthlyTaxes + monthlyInsurance + monthlyHOA;
  
  // Calculate gross rental income
  const grossRentalIncome = calculateTotalRentalIncome(
    inputs.rentalIncomeMethod,
    inputs.totalRentalIncome,
    inputs.unitIncomes
  );
  
  // Calculate DSCR
  const dscr = calculateDSCR(grossRentalIncome, totalMonthlyExpenses);
  
  // Get appropriate DSCR message
  const dscrMessage = await getDscrMessage(dscr);
  
  return {
    dscr,
    dscrMessage,
    monthlyMortgagePayment,
    monthlyTaxes,
    monthlyInsurance,
    monthlyHOA,
    totalMonthlyExpenses,
    grossRentalIncome
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (percentage: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(percentage / 100);
};
