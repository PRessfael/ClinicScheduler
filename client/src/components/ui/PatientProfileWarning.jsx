import { usePatientProfile } from '@/hooks/usePatientProfile';

const PatientProfileWarning = () => {
    const { redirectToPatientForm } = usePatientProfile();

    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-yellow-700">
                        <span className="font-bold">Warning:</span> Your account is not connected to a patient profile.
                    </p>
                    <p className="text-sm text-yellow-600 mt-1">
                        To access all features, please complete your patient profile.
                    </p>
                </div>
                <button
                    onClick={redirectToPatientForm}
                    className="ml-4 bg-yellow-100 px-4 py-2 rounded-md text-yellow-800 hover:bg-yellow-200 transition-colors font-medium"
                >
                    Complete Profile
                </button>
            </div>
        </div>
    );
};

export default PatientProfileWarning; 