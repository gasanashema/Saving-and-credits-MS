import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import useLoanPackages from '../../hooks/useLoanPackages';
import server from '../../utils/server';
import { LoanPackage } from '../../types/loanTypes';
import { toast } from 'sonner';

const LoanPackages: React.FC = () => {
  const { packages, loading, error, refresh } = useLoanPackages();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<LoanPackage | null>(null);
  
  const [formData, setFormData] = useState<Partial<LoanPackage>>({
    name: '',
    min_savings: 0,
    max_loan_amount: 0,
    min_membership_months: 3,
    loan_multiplier: 3.0,
    repayment_duration_months: 12,
    interest_rate: 18,
    description: '',
    status: 'active'
  });

  const handleEdit = (pkg: LoanPackage) => {
    setEditingPackage(pkg);
    setFormData(pkg);
    setIsModalOpen(true);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPackage) {
        await server.put(`/loans/packages/${editingPackage.id}`, formData);
        toast.success('Package updated successfully');
      } else {
        await server.post('/loans/packages', formData);
        toast.success('Package created successfully');
      }
      setIsModalOpen(false);
      setEditingPackage(null);
      setFormData({
        name: '',
        min_savings: 0,
        max_loan_amount: 0,
        min_membership_months: 3,
        loan_multiplier: 3.0,
        repayment_duration_months: 12,
        interest_rate: 18,
        description: '',
        status: 'active'
      });
      refresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save package');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading packages...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loan Packages</h1>
           <p className="text-gray-500 dark:text-gray-400">Manage loan configurations and eligibility rules.</p>
        </div>
        <button
          onClick={() => {
            setEditingPackage(null);
            setFormData({
                name: '',
                min_savings: 0,
                max_loan_amount: 0,
                min_membership_months: 3,
                loan_multiplier: 3.0,
                repayment_duration_months: 12,
                interest_rate: 18,
                description: '',
                status: 'active'
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <motion.div 
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{pkg.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${pkg.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {pkg.status}
                    </span>
                  </div>
                  <button onClick={() => handleEdit(pkg)} className="text-gray-400 hover:text-blue-500">
                    <PencilIcon className="h-5 w-5" />
                  </button>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                 <div className="flex justify-between">
                    <span>Min Savings:</span>
                    <span className="font-semibold">{(pkg.min_savings || 0).toLocaleString()} RWF</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Max Loan Amount:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{(pkg.max_loan_amount || 0).toLocaleString()} RWF</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Min Membership:</span>
                    <span className="font-semibold">{pkg.min_membership_months} months</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Multiplier:</span>
                    <span className="font-semibold">{pkg.loan_multiplier}x</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="font-semibold">{pkg.interest_rate}%</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-semibold">{pkg.repayment_duration_months} months</span>
                 </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    {pkg.description || "No description provided."}
                </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingPackage ? 'Edit Loan Package' : 'Create Loan Package'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Package Name</label>
                  <input 
                     type="text" required 
                     value={formData.name} 
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Savings (RWF)</label>
                    <input 
                        type="number" required 
                        value={formData.min_savings} 
                        onChange={e => setFormData({...formData, min_savings: Number(e.target.value)})}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Loan Amount (RWF)</label>
                    <input 
                        type="number" required 
                        value={formData.max_loan_amount} 
                        onChange={e => setFormData({...formData, max_loan_amount: Number(e.target.value)})}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Multiplier</label>
                    <input 
                        type="number" step="0.1" required 
                        value={formData.loan_multiplier} 
                        onChange={e => setFormData({...formData, loan_multiplier: Number(e.target.value)})}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Rate (%)</label>
                    <input 
                        type="number" step="0.1" required 
                        value={formData.interest_rate} 
                        onChange={e => setFormData({...formData, interest_rate: Number(e.target.value)})}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (Months)</label>
                     <input 
                        type="number" required 
                        value={formData.repayment_duration_months} 
                        onChange={e => setFormData({...formData, repayment_duration_months: Number(e.target.value)})}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                     />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Membership (Months)</label>
                    <input 
                        type="number" required 
                        value={formData.min_membership_months} 
                        onChange={e => setFormData({...formData, min_membership_months: Number(e.target.value)})}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea 
                     rows={3}
                     value={formData.description} 
                     onChange={e => setFormData({...formData, description: e.target.value})}
                     className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                     value={formData.status}
                     onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                     className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                     <option value="active">Active</option>
                     <option value="inactive">Inactive</option>
                  </select>
               </div>

               <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Package</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanPackages;
