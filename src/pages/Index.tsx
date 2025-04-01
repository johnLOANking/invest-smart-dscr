
import React from 'react';
import CalculatorForm from '@/components/Calculator/CalculatorForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-calculator-primary text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            DSCR Loan Calculator
          </h1>
          <p className="text-center mt-2 text-gray-100">
            Evaluate your investment property's financial viability
          </p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <CalculatorForm />
        
        <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">About DSCR Loans</h2>
          <p className="text-gray-700 mb-4">
            Debt Service Coverage Ratio (DSCR) loans are specialized mortgage products designed for real estate investors. 
            Unlike traditional mortgages that focus on the borrower's personal income, DSCR loans primarily evaluate the 
            property's ability to generate income relative to its expenses.
          </p>
          <p className="text-gray-700 mb-4">
            The DSCR is calculated by dividing the property's gross rental income by its total debt service (mortgage payment, 
            taxes, insurance, and HOA fees). Lenders typically look for a DSCR of 1.25 or higher, indicating that the property 
            generates 25% more income than needed to cover its expenses.
          </p>
          <p className="text-gray-700">
            Use this calculator to determine if your investment property qualifies for a DSCR loan and to estimate your 
            potential financing options.
          </p>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>DSCR Calculator &copy; {new Date().getFullYear()}</p>
          <p className="text-gray-400 text-sm mt-2">
            This calculator is for informational purposes only and does not guarantee loan approval.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
