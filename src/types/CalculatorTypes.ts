
// State Data Types
export interface StateData {
  taxes: number;
  insurance: number;
}

export interface TaxInsuranceData {
  defaults: {
    taxes: {
      percentage: number;
    };
    insurance: {
      percentage: number;
    };
  };
  stateData: {
    [key: string]: StateData;
  };
}

// Interest Rate Types
export interface InterestRateInfo {
  type: string;
  term: number;
  rate: number;
}

export interface InterestRatesData {
  rates: InterestRateInfo[];
}

// DSCR Message Types
export interface DscrMessage {
  min: number;
  max: number;
  message: string;
}

export interface DscrMessagesData {
  dscrMessages: DscrMessage[];
}

// Calculator Form Types
export interface CalculatorInputs {
  isRefi: boolean;
  propertyState: string;
  propertyValue: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  loanAmount: number;
  numberOfUnits: number;
  rentalIncomeMethod: 'total' | 'perUnit';
  totalRentalIncome: number;
  unitIncomes: number[];
  interestRate: number;
  termYears: number;
  isInterestOnly: boolean;
  taxesPercent: number;
  taxesAmount: number;
  insurancePercent: number;
  insuranceAmount: number;
  hoaFees: number;
}

// Calculator Results Types
export interface CalculatorResults {
  dscr: number;
  dscrMessage: string;
  monthlyMortgagePayment: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  totalMonthlyExpenses: number;
  grossRentalIncome: number;
}

// URL Parameter Type
export interface UrlParams extends Partial<CalculatorInputs> {
  [key: string]: any;
}
