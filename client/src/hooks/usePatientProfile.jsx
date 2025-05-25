import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useLocation } from 'wouter';

export const usePatientProfile = () => {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const [patientProfile, setPatientProfile] = useState(null);
    const [hasPatientProfile, setHasPatientProfile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkPatientProfile = async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) {
                throw error;
            }

            // Update states based on profile existence and completeness
            setPatientProfile(data);
            setHasPatientProfile(!!data);
            setError(null);
        } catch (err) {
            console.error('Error checking patient profile:', err);
            setError(err.message);
            setHasPatientProfile(false);
            setPatientProfile(null);
        } finally {
            setIsLoading(false);
        }
    };

    const redirectToPatientForm = () => {
        setLocation('/complete-profile');
    };

    useEffect(() => {
        checkPatientProfile();
    }, [user]);

    return {
        patientProfile,
        hasPatientProfile,
        isLoading,
        error,
        redirectToPatientForm,
        refreshProfile: checkPatientProfile
    };
}; 