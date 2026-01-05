import React from 'react';
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor?: string;
  textColor?: string;
  iconBgColor?: string;
}
const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  bgColor = 'bg-white dark:bg-gray-800',
  textColor = 'text-gray-800 dark:text-white',
  iconBgColor = 'bg-blue-500'
}) => {
  return <div className={`${bgColor} rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center">
        <div className={`${iconBgColor} p-3 rounded-xl text-white mr-4 flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
        </div>
      </div>
    </div>;
};
export default StatsCard;