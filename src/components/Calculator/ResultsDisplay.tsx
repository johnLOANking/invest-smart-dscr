
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calculator, 
  Clipboard, 
  Check, 
  Share2, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { formatCurrency } from '@/utils/calculationUtils';
import { CalculatorResults } from '@/types/CalculatorTypes';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/components/ui/use-toast';

interface ResultsDisplayProps {
  results: CalculatorResults | null;
  shareableUrl: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, shareableUrl }) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [showDetails, setShowDetails] = useState(!isMobile);
  const [copySuccess, setCopySuccess] = useState(false);

  // Don't render if no results
  if (!results) {
    return null;
  }

  // Get color based on DSCR value
  const getDscrColor = (dscr: number) => {
    if (dscr >= 1.25) return 'text-calculator-success';
    if (dscr >= 1.0) return 'text-calculator-primary';
    if (dscr >= 0.75) return 'text-calculator-warning';
    return 'text-calculator-danger';
  };

  // Copy URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableUrl).then(
      () => {
        setCopySuccess(true);
        toast({
          title: "Link Copied!",
          description: "The shareable link has been copied to your clipboard."
        });
        
        // Reset the success icon after 2 seconds
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      },
      () => {
        toast({
          title: "Copy Failed",
          description: "Failed to copy the link to your clipboard.",
          variant: "destructive"
        });
      }
    );
  };

  return (
    <Card className="border-2">
      <CardHeader className="bg-gray-50 rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-xl">
            <Calculator className="mr-2 h-5 w-5" />
            Results
          </CardTitle>
          <div className={`text-2xl font-bold ${getDscrColor(results.dscr)}`}>
            DSCR: {results.dscr.toFixed(2)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          <p className="text-gray-700">{results.dscrMessage}</p>
          
          {/* Toggle Button for Mobile */}
          {isMobile && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center justify-center"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show Details
                </>
              )}
            </Button>
          )}
          
          {/* Detailed breakdown */}
          {showDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Monthly Expenses</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Mortgage Payment:</span>
                      <span>{formatCurrency(results.monthlyMortgagePayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Property Taxes:</span>
                      <span>{formatCurrency(results.monthlyTaxes)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Insurance:</span>
                      <span>{formatCurrency(results.monthlyInsurance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HOA Fees:</span>
                      <span>{formatCurrency(results.monthlyHOA)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                      <span>Total Monthly Expenses:</span>
                      <span>{formatCurrency(results.totalMonthlyExpenses)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Rental Income</h3>
                  <div className="flex justify-between">
                    <span>Gross Monthly Rental Income:</span>
                    <span>{formatCurrency(results.grossRentalIncome)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>DSCR Calculation:</span>
                    <span>
                      {formatCurrency(results.grossRentalIncome)} ÷ {formatCurrency(results.totalMonthlyExpenses)} = {results.dscr.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Share URL */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="shareableUrl" className="text-sm font-medium">
                    Shareable Link
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      id="shareableUrl"
                      value={shareableUrl}
                      readOnly
                      className="flex-1 font-mono text-xs"
                    />
                    <Button 
                      size="icon" 
                      onClick={copyToClipboard} 
                      variant="outline"
                      className="shrink-0"
                    >
                      {copySuccess ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 rounded-b-lg flex justify-between">
        <div className="w-full flex flex-wrap justify-between items-center gap-2">
          <div className={`text-lg font-medium ${getDscrColor(results.dscr)}`}>
            {results.dscr >= 1.0 ? 'Qualified ✓' : 'Needs Review'}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={copyToClipboard}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Results
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ResultsDisplay;
