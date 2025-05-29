import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import EditProfileForm from "@/components/profile/EditProfileForm";

const Profile = () => {
    const { user } = useAuth();
    const [userDetails, setUserDetails] = useState(null);
    const [patientDetails, setPatientDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // First get the auth user
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    throw new Error('No authenticated session');
                }

                // Then get the user details
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', session.user.email)
                    .single();

                if (error) {
                    throw error;
                }

                // If user is a patient (user_type = 'user'), get patient details
                if (data.user_type === 'user') {
                    const { data: patientData, error: patientError } = await supabase
                        .from('patients')
                        .select('*')
                        .eq('user_id', data.id)
                        .single();

                    if (!patientError && patientData) {
                        setPatientDetails(patientData);
                    }
                }
                // If user is a doctor, get additional doctor details
                else if (data.user_type === 'doctor') {
                    const { data: doctorData, error: doctorError } = await supabase
                        .from('doctors')
                        .select('*')
                        .eq('user_id', data.id)
                        .single();

                    if (!doctorError && doctorData) {
                        data.doctorDetails = doctorData;
                    }
                }

                setUserDetails(data);
            } catch (error) {
                console.error('Error fetching user details:', error.message);
                // Set default values if there's an error
                setUserDetails({
                    username: user.username,
                    email: user.email,
                    user_type: user.user_type,
                    created_at: new Date().toISOString()
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [user]);

    const handleUpdateProfile = (updatedData) => {
        setUserDetails(prev => ({
            ...prev,
            ...updatedData
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e5631]"></div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUserTypeDisplay = (type) => {
        switch (type) {
            case 'admin':
                return 'Administrator';
            case 'doctor':
                return 'Doctor';
            case 'user':
                return 'Patient';
            default:
                return type;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h1>
            <div className="grid grid-cols-1 gap-6">
                {/* Account Information Box */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700">Account Details</h2>
                                <div className="mt-2 space-y-2">
                                    <div>
                                        <span className="text-gray-600 font-medium">Username:</span>
                                        <span className="ml-2 text-gray-800">{userDetails?.username}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Email:</span>
                                        <span className="ml-2 text-gray-800">{userDetails?.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Role:</span>
                                        <span className="ml-2 text-gray-800">
                                            {getUserTypeDisplay(userDetails?.user_type)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Phone:</span>
                                        <span className="ml-2 text-gray-800">
                                            {userDetails?.phone || 'Not provided'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700">Account Status</h2>
                                <div className="mt-2">
                                    <div>
                                        <span className="text-gray-600 font-medium">Member Since:</span>
                                        <span className="ml-2 text-gray-800">
                                            {formatDate(userDetails?.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700">Actions</h2>
                                <div className="mt-4 space-y-2">
                                    <button
                                        onClick={() => setShowEditForm(true)}
                                        className="w-full bg-[#1e5631] text-white px-4 py-2 rounded-md hover:bg-[#143e22] transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                    <button className="w-full border border-[#1e5631] text-[#1e5631] px-4 py-2 rounded-md hover:bg-[#f0f9f1] transition-colors">
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patient Information Box - Only shown for patients */}
                {userDetails?.user_type === 'user' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Patient Information</h2>
                        {patientDetails ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-gray-600 font-medium">Patient ID:</span>
                                        <span className="ml-2 text-gray-800">{patientDetails.patient_id}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">First Name:</span>
                                        <span className="ml-2 text-gray-800">{patientDetails.first_name || 'Not provided'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Last Name:</span>
                                        <span className="ml-2 text-gray-800">{patientDetails.last_name || 'Not provided'}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-gray-600 font-medium">Age:</span>
                                        <span className="ml-2 text-gray-800">{patientDetails.age || 'Not provided'}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500 text-center py-4">
                                No patient information available. Please complete your patient profile.
                            </div>
                        )}
                    </div>
                )}
            </div>
            {showEditForm && (
                <EditProfileForm
                    userDetails={userDetails}
                    onClose={() => setShowEditForm(false)}
                    onUpdate={handleUpdateProfile}
                />
            )}
        </div>
    );
};

export default Profile; 