import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import server from '../../utils/server';
import { BackendLoan, LoanPaymentDetails } from '../../types/loanTypes';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const AdminLoanDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [loan, setLoan] = useState<BackendLoan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentDetails, setPaymentDetails] = useState<LoanPaymentDetails | null>(null);

    useEffect(() => {
        const fetchLoan = async () => {
            try {
                setLoading(true);
                // Assuming same endpoint works for admin if they have rights, or a specific admin endpoint
                // We access the specific loan details endpoint
                const response = await server.get(`/loans/details/${id}`);
                setLoan(response.data);

                try {
                    const paymentsRes = await server.get(`/loans/payments/${id}`);
                    setPaymentDetails(paymentsRes.data);
                } catch (e) {
                    console.log("No payments info", e);
                }

            } catch (err) {
                console.error("Error fetching loan:", err);
                setError("Failed to load loan details");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchLoan();
    }, [id]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(value);

    if (loading) return <div className="p-8 text-center">{t('loading')}</div>;
    if (error || !loan) return <div className="p-8 text-center text-red-500">{error || "Loan not found"}</div>;

    const amount = Number(loan.amount ?? 0);
    const amountToPay = Number(loan.amountToPay ?? loan.amountTopay ?? 0);
    const payed = Number(loan.payedAmount ?? 0);
    const progress = amountToPay > 0 ? Math.round((payed / amountToPay) * 100) : 0;
    const status = (loan.status === 'approved' ? 'active' : loan.status) || 'pending';

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
                <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loan #{loan.loanId}</h1>
                        <p className="text-gray-500">Member: {loan.firstName} {loan.lastName} (#{loan.memberId})</p>
                        <p className="text-gray-400 text-sm">{new Date(loan.requestDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${status === 'active' ? 'bg-green-100 text-green-800' :
                        status === 'rejected' ? 'bg-red-100 text-red-800' :
                            status === 'paid' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                        }`}>
                        {status}
                    </span>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(amount)}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Amount to Pay</p>
                            <p className="text-2xl font-bold text-purple-600">{formatCurrency(amountToPay)}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Paid Amount</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(payed)}</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Repayment Progress</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Details</h3>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Purpose</dt>
                                    <dd className="font-medium text-gray-900 dark:text-white">{loan.re?.split(':')[0] || 'N/A'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Duration</dt>
                                    <dd className="font-medium text-gray-900 dark:text-white">{loan.duration || 'N/A'} Months</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Interest Rate</dt>
                                    <dd className="font-medium text-gray-900 dark:text-white">{loan.rate ? `${loan.rate}%` : 'N/A'}</dd>
                                </div>
                            </dl>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Notes</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap">{loan.re || "No additional notes."}</p>
                        </div>
                    </div>

                    {paymentDetails && paymentDetails.payments.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment History</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recorder</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {paymentDetails.payments.map((p) => (
                                            <tr key={p.pay_id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.pay_date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">{formatCurrency(p.amount)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.recorder_name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminLoanDetail;
