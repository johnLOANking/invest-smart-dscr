import { TaxInsuranceData, InterestRatesData, DscrMessagesData } from '../types/CalculatorTypes';

// API URLs
const TAX_INS_URL = 'https://raw.githubusercontent.com/johnLOANking/reference/refs/heads/main/Tax_ins.json';
const RATES_URL = 'https://raw.githubusercontent.com/johnLOANking/reference/refs/heads/main/rates.json';
const DSCR_MESSAGES_URL = 'https://raw.githubusercontent.com/johnLOANking/reference/refs/heads/main/dscr/result_messages.json';

// Cache for API responses
const apiCache: Record<string, any> = {};

/**
 * Generic function to fetch data from API with caching
 */
const fetchData = async <T>(url: string, cacheName: string): Promise<T> => {
  // Return cached data if available
  if (apiCache[cacheName]) {
    return apiCache[cacheName] as T;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    apiCache[cacheName] = data; // Cache the data
    return data as T;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
};

/**
 * Fetch tax and insurance rates
 */
export const fetchTaxInsuranceRates = (): Promise<TaxInsuranceData> => {
  return fetchData<TaxInsuranceData>(TAX_INS_URL, 'taxInsurance');
};

/**
 * Fetch interest rates
 */
export const fetchInterestRates = (): Promise<InterestRatesData> => {
  return fetchData<InterestRatesData>(RATES_URL, 'interestRates');
};

/**
 * Fetch DSCR result messages
 */
export const fetchDscrMessages = (): Promise<DscrMessagesData> => {
  return fetchData<DscrMessagesData>(DSCR_MESSAGES_URL, 'dscrMessages');
};

/**
 * Get tax and insurance rates for a specific state
 */
export const getStateRates = async (stateCode: string): Promise<{taxes: number, insurance: number}> => {
  try {
    const data = await fetchTaxInsuranceRates();
    
    // If state data exists, return it
    if (data.stateData[stateCode]) {
      return {
        taxes: data.stateData[stateCode].taxes,
        insurance: data.stateData[stateCode].insurance
      };
    }
    
    // Otherwise return default values
    return {
      taxes: data.defaults.taxes.percentage,
      insurance: data.defaults.insurance.percentage
    };
  } catch (error) {
    console.error('Error getting state rates:', error);
    // Return fallback values if API call fails
    return { taxes: 1.25, insurance: 0.35 };
  }
};

/**
 * Get default interest rate
 */
export const getDefaultInterestRate = async (): Promise<number> => {
  try {
    const data = await fetchInterestRates();
    
    // Find 30-year DSCR investment property rate
    const defaultRate = data.rates.find(
      rate => rate.type === 'dsceInvestmentProperty' && rate.term === 30
    );
    
    return defaultRate?.rate || 6.125; // Return found rate or default to 6.125%
  } catch (error) {
    console.error('Error getting default interest rate:', error);
    return 6.125; // Return fallback value if API call fails
  }
};

/**
 * Get appropriate DSCR message based on calculated DSCR value
 */
export const getDscrMessage = async (dscrValue: number): Promise<string> => {
  try {
    const data = await fetchDscrMessages();
    
    // Find appropriate message based on DSCR value
    const message = data.dscrMessages.find(
      msg => dscrValue >= msg.min && dscrValue <= msg.max
    );
    
    return message?.message || 'No message available for this DSCR value';
  } catch (error) {
    console.error('Error getting DSCR message:', error);
    
    // Return fallback messages if API call fails
    if (dscrValue >= 1.25) {
      return 'Your ratios are as good as they get, you are in great shape to qualify';
    } else if (dscrValue >= 1.0) {
      return 'You meet the requirements for most loans';
    } else if (dscrValue >= 0.75) {
      return 'Your rent does not cover your payment, but we may still be able to qualify you for this loan (rates are likely going to be higher due to negative cash flow)';
    } else {
      return 'Your rent is significantly below your mortgage payment. There is a slight chance we can still proceed, contact our office to discuss details';
    }
  }
};
