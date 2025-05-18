import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useRecords() {
  const [records, setRecords] = useState([]);
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

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data, error } = await supabase
          .from('patient_records')
          .select('*')
          .order('record_id', { ascending: true });

        if (error) throw error;

        setRecords(data);
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    };

    fetchRecords();
  }, []);

  const getFilteredRecords = () => {
    let filtered = [...records];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.diagnosis.toLowerCase().includes(term) ||
        record.treatment.toLowerCase().includes(term)
      );
    }

    if (recordType !== 'all') {
      filtered = filtered.filter(record => {
        if (recordType === 'visits') return record.diagnosis.includes('Visit');
        if (recordType === 'tests') return record.diagnosis.includes('Test');
        if (recordType === 'procedures') return record.diagnosis.includes('Procedure');
        return true;
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const handleFileChange = (files) => {
    setUploadFormData({
      ...uploadFormData,
      files: Array.from(files)
    });
  };

  const submitDocumentUpload = () => {
    const errors = {};

    if (uploadFormData.files.length === 0) errors.files = 'Please select at least one file';
    if (!uploadFormData.documentType) errors.documentType = 'Please select a document type';
    if (!uploadFormData.description.trim()) errors.description = 'Please provide a description';

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      alert(`${uploadFormData.files.length} file(s) uploaded successfully.`);

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
    records,
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
