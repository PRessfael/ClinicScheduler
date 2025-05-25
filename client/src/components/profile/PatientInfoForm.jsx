import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const PatientInfoForm = () => {
    const { user } = useAuth();
    const [location, setLocation] = useLocation();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        age: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPatientData = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('patients')
                    .select('first_name, last_name, age')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (data) {
                    setFormData({
                        firstName: data.first_name || "",
                        lastName: data.last_name || "",
                        age: data.age?.toString() || "",
                    });
                }
            } catch (error) {
                console.error('Error fetching patient data:', error);
            }
        };

        fetchPatientData();
    }, [user]);

    const generatePatientId = () => {
        const timestamp = Date.now().toString().slice(-3);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `P${timestamp}${random}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check if patient record exists
            const { data: existingPatient } = await supabase
                .from('patients')
                .select('patient_id')
                .eq('user_id', user.id)
                .maybeSingle();

            let result;
            if (existingPatient) {
                // Update existing patient
                result = await supabase
                    .from('patients')
                    .update({
                        first_name: formData.firstName.trim(),
                        last_name: formData.lastName.trim(),
                        age: parseInt(formData.age)
                    })
                    .eq('patient_id', existingPatient.patient_id);
            } else {
                // Create new patient
                const newPatientId = generatePatientId();
                result = await supabase
                    .from('patients')
                    .insert({
                        patient_id: newPatientId,
                        user_id: user.id,
                        first_name: formData.firstName.trim(),
                        last_name: formData.lastName.trim(),
                        age: parseInt(formData.age)
                    });
            }

            if (result.error) throw result.error;

            toast({
                title: "Success",
                description: existingPatient
                    ? "Your profile has been updated successfully."
                    : "Your patient profile has been created successfully.",
                variant: "success"
            });

            // Redirect to user dashboard after successful update
            setTimeout(() => {
                setLocation("/user/dashboard");
            }, 2000);
        } catch (error) {
            console.error('Error updating patient data:', error);
            toast({
                title: "Error",
                description: error.message,
                variant: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-[#1e5631] py-6">
                <h2 className="text-center text-2xl font-bold text-white">Complete Your Profile</h2>
            </div>
            <div className="p-6">
                <p className="text-gray-600 mb-6 text-center">
                    Please provide your personal information to complete your registration.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            First Name
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            autoComplete="given-name"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            autoComplete="family-name"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                            Age
                        </label>
                        <input
                            type="number"
                            id="age"
                            name="age"
                            autoComplete="off"
                            value={formData.age}
                            onChange={handleChange}
                            min="0"
                            max="150"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4caf50] hover:bg-[#087f23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e5631] disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                "Complete Profile"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientInfoForm; 