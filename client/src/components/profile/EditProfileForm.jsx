import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";

const EditProfileForm = ({ userDetails, onClose, onUpdate }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        username: userDetails?.username || "",
        phone: userDetails?.phone || "",
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
            // First update the auth metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    username: formData.username,
                    display_name: formData.username
                }
            });

            if (authError) throw authError;

            // Then update the public users table
            const { error: dbError } = await supabase
                .from('users')
                .update({
                    username: formData.username,
                    phone: formData.phone || null,
                })
                .eq('id', userDetails.id);

            if (dbError) {
                // If database update fails, revert auth metadata
                await supabase.auth.updateUser({
                    data: {
                        username: userDetails.username,
                        display_name: userDetails.username
                    }
                });
                throw dbError;
            }

            toast({
                title: "Success",
                description: "Your profile has been successfully updated.",
                variant: "success"
            });

            onUpdate({
                username: formData.username,
                phone: formData.phone || null
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
                <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Profile</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone Number (Optional)
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm"
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
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileForm; 