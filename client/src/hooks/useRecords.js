import { useState } from 'react';

// Mock records data - in a real app this would come from an API
const MOCK_RECORDS = [
  {
    id: 1,
    date: 'Aug 15, 2023',
    type: { label: 'Office Visit', className: 'bg-green-100 text-green-800' },
    provider: 'Dr. Johnson',
    description: 'Annual wellness check-up'
  },
  {
    id: 2,
    date: 'Jul 22, 2023',
    type: { label: 'Lab Test', className: 'bg-blue-100 text-blue-800' },
    provider: 'University Lab',
    description: 'Complete blood count (CBC)'
  },
  {
    id: 3,
    date: 'Jun 10, 2023',
    type: { label: 'Vaccination', className: 'bg-yellow-100 text-yellow-800' },
    provider: 'Nurse Davis',
    description: 'Influenza vaccine'
  },
  {
    id: 4,
    date: 'May 05, 2023',
    type: { label: 'Counseling', className: 'bg-purple-100 text-purple-800' },
    provider: 'Dr. Williams',
    description: 'Mental health assessment'
  },
  {
    id: 5,
    date: 'Apr 12, 2023',
    type: { label: 'Urgent Care', className: 'bg-red-100 text-red-800' },
    provider: 'Dr. Smith',
    description: 'Acute respiratory infection'
  }
];

export function useRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [recordType, setRecordType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentTab, setCurrentTab] = useState('medical-history');
  const [uploadFormData, setUploadFormData] = useState({
    files: [],
    documentType: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Get filtered and sorted records
  const getFilteredRecords = () => {
    let filtered = [...MOCK_RECORDS];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.description.toLowerCase().includes(term) ||
        record.provider.toLowerCase().includes(term) ||
        record.type.label.toLowerCase().includes(term)
      );
    }
    
    if (recordType !== 'all') {
      filtered = filtered.filter(record => {
        if (recordType === 'visits') return record.type.label === 'Office Visit' || record.type.label === 'Urgent Care';
        if (recordType === 'tests') return record.type.label === 'Lab Test';
        if (recordType === 'procedures') return record.type.label === 'Vaccination' || record.type.label === 'Counseling';
        return true;
      });
    }
    
    // Sort records
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return filtered;
  };
  
  // Handle file upload
  const handleFileChange = (files) => {
    setUploadFormData({
      ...uploadFormData,
      files: Array.from(files)
    });
  };
  
  // Submit document upload
  const submitDocumentUpload = () => {
    const errors = {};
    
    if (uploadFormData.files.length === 0) errors.files = 'Please select at least one file';
    if (!uploadFormData.documentType) errors.documentType = 'Please select a document type';
    if (!uploadFormData.description.trim()) errors.description = 'Please provide a description';
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      // In a real app, we would submit to an API here
      alert(`${uploadFormData.files.length} file(s) uploaded successfully.`);
      
      // Reset form
      setUploadFormData({
        files: [],
        documentType: '',
        description: ''
      });
      
      return true;
    }
    
    return false;
  };

  return {
    searchTerm,
    setSearchTerm,
    recordType,
    setRecordType,
    sortOrder,
    setSortOrder,
    currentTab,
    setCurrentTab,
    uploadFormData,
    setUploadFormData,
    formErrors,
    getFilteredRecords,
    handleFileChange,
    submitDocumentUpload
  };
}
