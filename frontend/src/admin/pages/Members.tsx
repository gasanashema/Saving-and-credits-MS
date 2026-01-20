import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  UserIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import Modal from "../../components/ui/Modal";
import { toast } from "sonner";
import { Member, MemberSavings } from "../../types/memberTypes";
import useAllMembers from "../../hooks/useAllMembers";
import useMemberSavings from "../../hooks/useMemberSavings";
import server from "../../utils/server";

interface SavingType {
  value: number;
  name: string;
  amount: number;
}

const Members: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { members, loading: membersLoading, error: membersError, refresh } = useAllMembers();
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [newMember, setNewMember] = useState({
    nid: "",
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",
    balance: 0,
    role: "member", // Default role
  });
  const [errors, setErrors] = useState({
    nid: "",
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",

    balance: "",
  });
  // Add this line for savings data state
  const [savingsData, setSavingsData] = useState<MemberSavings[]>([]);
  const [savingTypes, setSavingTypes] = useState<SavingType[]>([]);
  const [numberOfShares, setNumberOfShares] = useState(1);
  const [selectedSavingType, setSelectedSavingType] = useState<number | "">("");

  // Update the useEffect to use the data from useMemberSavings hook
  const { savings } = useMemberSavings(selectedMember?.id.toString());

  useEffect(() => {
    setMembersList(members);
  }, [members]);

  useEffect(() => {
    const fetchSavingTypes = async () => {
      try {
        const response = await server.get("/saving/type/list");
        setSavingTypes(response.data);
      } catch (error) {
        console.error("Error fetching saving types:", error);
      }
    };
    fetchSavingTypes();
  }, []);

  useEffect(() => {
    const fetchSavingTypes = async () => {
      try {
        const response = await server.get("/saving/type/list");
        setSavingTypes(response.data);
      } catch (error) {
        console.error("Error fetching saving types:", error);
      }
    };
    fetchSavingTypes();
  }, []);

  useEffect(() => {
    if (selectedMember && savings) {
      setSavingsData(savings);
    }
  }, [selectedMember, savings]);

  const handleViewDetails = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewMember({
      ...newMember,
      [name]: value,
    });
    // Clear the error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      ...errors,
    };
    
    // Validate firstName
    if (!newMember.firstName.trim()) {
      newErrors.firstName = t("firstNameRequired");
      isValid = false;
    }
    // Validate lastName
    if (!newMember.lastName.trim()) {
      newErrors.lastName = t("lastNameRequired");
      isValid = false;
    }
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newMember.email.trim()) {
      newErrors.email = t("emailRequired");
      isValid = false;
    } else if (!emailRegex.test(newMember.email)) {
      newErrors.email = t("invalidEmail");
      isValid = false;
    }

    // Member-specific validations
    if (newMember.role === 'member') {
       // Validate nid
        if (!newMember.nid.trim()) {
          newErrors.nid = "National ID is required";
          isValid = false;
        } else if (newMember.nid.length !== 16) {
          newErrors.nid = "National ID must be 16 digits";
          isValid = false;
        }
        // Validate telephone (required)
        if (!newMember.telephone.trim()) {
          newErrors.telephone = "Phone number is required";
          isValid = false;
        } else if (!/^\+?[0-9]{10,15}$/.test(newMember.telephone)) {
          newErrors.telephone = t("invalidPhone");
          isValid = false;
        }
        // Validate balance
        // for members, balance is calculated from shares, so we don't validate the raw balance field anymore
        if (!selectedSavingType) {
             newErrors.balance = "Please select a share type"; // Reuse balance error field for simplicity or add new error field
             isValid = false; 
        }
    } else {
        // Clear member errors if switching to admin
        newErrors.nid = "";
        newErrors.telephone = "";
        newErrors.balance = "";
    }

    setErrors(newErrors);
    return isValid;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    try {
      await server.post('/members', {
        nid: newMember.nid,
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        telephone: newMember.telephone,
        email: newMember.email,

        // balance: Number(newMember.balance),
        role: newMember.role,
        stId: selectedSavingType,
        numberOfShares,
      });
      
      // Reset form
      setNewMember({
        nid: "",
        firstName: "",
        lastName: "",
        email: "",
        telephone: "",

        balance: 0,
        role: "member",
      });
      setNumberOfShares(1);
      setSelectedSavingType("");
      
      // Close modal
      setIsAddModalOpen(false);

      // Refresh members list
      refresh();

      // Show success message
      toast.success("Member added successfully!");
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast.error(error.response?.data?.error || 'Failed to add member');
    }
  };
  const itemsPerPage = 8;
  // Filter members based on search term
  const filteredMembers = membersList.filter(
    (member) =>
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.telephone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Calculate pagination
  const indexOfLastMember = currentPage * itemsPerPage;
  const indexOfFirstMember = indexOfLastMember - itemsPerPage;
  const currentMembers = filteredMembers.slice(
    indexOfFirstMember,
    indexOfLastMember
  );
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t("members")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("manageMembersDescription")}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          {t("addMember")}
        </button>
      </div>
      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchMembers")}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      {/* Members Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("memberName")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("email")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("phone")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("balance")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentMembers.map((member) => (
                <motion.tr
                  key={member.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-300 font-medium">
                          {member.firstName[0]}
                          {member.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.firstName} {member.lastName}
                        </div>
                        {member.telephone && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {member.telephone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {member.telephone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(member.balance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(member)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {t("viewDetails")}
                    </button>
                  </td>
                </motion.tr>
              ))}
              {currentMembers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    {t("noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t("showing")}{" "}
                <span className="font-medium">{indexOfFirstMember + 1}</span>{" "}
                {t("to")}{" "}
                <span className="font-medium">
                  {indexOfLastMember > filteredMembers.length
                    ? filteredMembers.length
                    : indexOfLastMember}
                </span>{" "}
                {t("of")}{" "}
                <span className="font-medium">{filteredMembers.length}</span>{" "}
                {t("results")}
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                    currentPage === 1
                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === page
                        ? "z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    } text-sm font-medium`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                    currentPage === totalPages
                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      {/* Member Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedMember && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="absolute inset-0 z-[60] overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                }}
                className="inline-block align-bottom absolute bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              >
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="px-6 pt-5 pb-6">
                  <div className="flex items-center">
                    <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                        {selectedMember.firstName} {selectedMember.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedMember.email}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedMember.telephone && (
                          <span className="mr-3">
                            {selectedMember.telephone}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                            {t("totalSavings")}
                          </p>
                          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(selectedMember.balance)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4">
                      <div className="flex items-center">
                        <BanknotesIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                            {t("activeLoans")}
                          </p>
                          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                            {formatCurrency(1200)} {/* Mock data */}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
                      {t("savingsHistory")}
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {t("date")}
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {t("amount")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                          {savingsData.length > 0 ? (
                            savingsData.map((saving) => (
                              <tr key={saving.sav_id}>
                                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(saving.date).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 text-sm text-right text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(
                                    saving.shareValue * saving.numberOfShares
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={2}
                                className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                              >
                                {t("noData")}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-white dark:bg-gray-800 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t("close")}
                  </button>
                  <button
                    type="button"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t("editMember")}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Add New Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t("addNewMember")}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Role Selection */}
            
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role *
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="member"
                    checked={newMember.role === 'member'}
                    onChange={handleInputChange}
                    className="form-radio h-4 w-4 text-emerald-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Member</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={newMember.role === 'admin'}
                    onChange={handleInputChange}
                    className="form-radio h-4 w-4 text-emerald-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Admin</span>
                </label>
              </div>
            </div>

            {newMember.role === 'member' && (
             <div>
              <label
                htmlFor="nid"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                National ID *
              </label>
              <input
                type="text"
                id="nid"
                name="nid"
                value={newMember.nid}
                onChange={handleInputChange}
                maxLength={16}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter 16-digit National ID"
              />
              {errors.nid && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.nid}
                </p>
              )}
             </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t("firstName")} *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={newMember.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t("enterFirstName")}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t("lastName")} *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={newMember.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t("enterLastName")}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.lastName}
                  </p>
                )}
              </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t("email")} *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={newMember.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t("enterEmail")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            
            {newMember.role === 'member' && (
            <>
              <div>
                <label
                  htmlFor="telephone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t("phoneNumber")} *
                </label>
                <input
                  type="text"
                  id="telephone"
                  name="telephone"
                  value={newMember.telephone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t("enterPhoneNumber")}
                />
                {errors.telephone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.telephone}
                  </p>
                )}
              </div>
              <div>
                 <label
                  htmlFor="savingType"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Share Type *
                </label>
                <select
                  id="savingType"
                  value={selectedSavingType}
                  onChange={(e) => setSelectedSavingType(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Share Type</option>
                  {savingTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="numberOfShares"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Number of Shares *
                </label>
                 <input
                    type="number"
                    id="numberOfShares"
                    value={numberOfShares}
                    onChange={(e) => setNumberOfShares(Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {selectedSavingType && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Total Value: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                        (savingTypes.find(t => t.value === selectedSavingType)?.amount || 0) * numberOfShares
                      )}
                    </p>
                  )}
              </div>
            </>
            )}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {t("addMember")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Members;
