import React from 'react';
interface BadgeProps {
  status: 'pending' | 'approved' | 'rejected';
  label?: string;
}
const Badge: React.FC<BadgeProps> = ({
  status,
  label
}) => {
  const statusConfig = {
    pending: {
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-800 dark:text-yellow-300',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    approved: {
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-800 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    rejected: {
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-800 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  };
  const config = statusConfig[status];
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
      {label || status}
    </span>;
};
export default Badge;