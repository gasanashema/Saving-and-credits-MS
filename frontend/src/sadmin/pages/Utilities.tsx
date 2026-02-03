import React, { useState } from "react";
import LoanPackagesTab from "../components/utilities/LoanPackagesTab";
import PenaltyTypesTab from "../components/utilities/PenaltyTypesTab";
import SavingTypesTab from "../components/utilities/SavingTypesTab";

const Utilities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"loans" | "penalties" | "savings">(
    "loans",
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          System Utilities
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage global configurations and types.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("loans")}
            className={`${
              activeTab === "loans"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Loan Packages
          </button>
          <button
            onClick={() => setActiveTab("penalties")}
            className={`${
              activeTab === "penalties"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Penalty Types
          </button>
          <button
            onClick={() => setActiveTab("savings")}
            className={`${
              activeTab === "savings"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Saving Types
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === "loans" && <LoanPackagesTab />}
        {activeTab === "penalties" && <PenaltyTypesTab />}
        {activeTab === "savings" && <SavingTypesTab />}
      </div>
    </div>
  );
};

export default Utilities;
