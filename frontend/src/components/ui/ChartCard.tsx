import React, { ReactNode } from 'react';
interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  className = ''
}) => {
  return <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        {title}
      </h3>
      <div className="w-full h-full">{children}</div>
    </div>;
};
export default ChartCard;