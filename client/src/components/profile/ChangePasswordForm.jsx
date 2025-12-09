import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";

const ChangePasswordForm = ({ onClose }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate passwords match
            if (formData.newPassword !== formData.confirmPassword) {
                throw new Error("New passwords do not match");
            }

            // Validate password length
            if (formData.newPassword.length < 6) {
                throw new Error("Password must be at least 6 characters long");
            }

            // Verify current password by attempting to sign in
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("No active session found");
            }

            // Verify current password
            const { error: verifyError } = await supabase.auth.signInWithPassword({
                email: session.user.email,
                password: formData.currentPassword
            });

            if (verifyError) {
                throw new Error("Current password is incorrect");
            }

            // Update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: formData.newPassword
            });

            if (updateError) {
                throw updateError;
            }

            toast({
                title: "Success",
                description: "Your password has been successfully updated.",
                variant: "success"
            });

            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Change Password</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                            Current Password
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm"
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm"
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-[#1e5631] text-white rounded-md hover:bg-[#143e22] disabled:opacity-50"
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordForm;