import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import DeleteWarning from "./DeleteWarning";

const DoctorAvailabilityTable = ({ doctorId }) => {
    const { toast } = useToast();
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddingAvailability, setIsAddingAvailability] = useState(false);
    const [editingAvailability, setEditingAvailability] = useState(null);
    const [deletingAvailability, setDeletingAvailability] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        doctor_id: doctorId || "",
        from_date: "",
        to_date: ""
    });

    useEffect(() => {
        if (!doctorId) {
            fetchDoctors();
        }
        fetchAvailabilities();
    }, [doctorId]);

    const fetchDoctors = async () => {
        try {
            const { data, error } = await supabase
                .from('doctors')
                .select('doctor_id, name')
                .order('name');

            if (error) throw error;
            setDoctors(data || []);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            toast({
                title: "Error",
                description: "Failed to load doctors list",
                variant: "error"
            });
        }
    };

    const fetchAvailabilities = async () => {
        try {
            let query = supabase
                .from('doctor_availability')
                .select(`
                    availability_id,
                    doctor_id,
                    from_date,
                    to_date,
                    doctors (
                        name
                    )
                `)
                .order('from_date', { ascending: true });

            // If doctorId is provided, filter for that doctor only
            if (doctorId) {
                query = query.eq('doctor_id', doctorId);
            }

            const { data, error } = await query;

            if (error) throw error;
            setAvailabilities(data || []);
        } catch (error) {
            console.error('Error fetching availabilities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (availability) => {
        setEditingAvailability(availability);
        setFormData({
            doctor_id: availability.doctor_id,
            from_date: availability.from_date,
            to_date: availability.to_date || ""
        });
        setIsAddingAvailability(true);
    };

    const handleDelete = async () => {
        if (!deletingAvailability) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('doctor_availability')
                .delete()
                .eq('availability_id', deletingAvailability.availability_id);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Unavailability period has been deleted",
                variant: "success"
            });

            fetchAvailabilities();
        } catch (error) {
            console.error('Error deleting availability:', error);
            toast({
                title: "Error",
                description: error.message,
                variant: "error"
            });
        } finally {
            setLoading(false);
            setDeletingAvailability(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let error;
            if (editingAvailability) {
                // Update existing record
                ({ error } = await supabase
                    .from('doctor_availability')
                    .update({
                        doctor_id: doctorId || formData.doctor_id,
                        from_date: formData.from_date,
                        to_date: formData.to_date || null
                    })
                    .eq('availability_id', editingAvailability.availability_id));
            } else {
                // Insert new record
                ({ error } = await supabase
                    .from('doctor_availability')
                    .insert({
                        doctor_id: doctorId || formData.doctor_id,
                        from_date: formData.from_date,
                        to_date: formData.to_date || null
                    }));
            }

            if (error) throw error;

            toast({
                title: "Success",
                description: editingAvailability
                    ? "Doctor unavailability period has been updated"
                    : "Doctor unavailability period has been added",
                variant: "success"
            });

            fetchAvailabilities();
            handleCancel();
        } catch (error) {
            console.error('Error saving availability:', error);
            toast({
                title: "Error",
                description: error.message,
                variant: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsAddingAvailability(false);
        setEditingAvailability(null);
        setFormData({ doctor_id: doctorId || "", from_date: "", to_date: "" });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Ongoing';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusDisplay = (fromDate, toDate) => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison

        const startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);

        if (!toDate) {
            return {
                label: "Indefinite Leave",
                className: "bg-red-100 text-red-800"
            };
        }

        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of day for accurate comparison

        if (currentDate >= startDate && currentDate <= endDate) {
            return {
                label: "Ongoing",
                className: "bg-red-100 text-red-800"
            };
        } else if (currentDate < startDate) {
            return {
                label: "Upcoming",
                className: "bg-yellow-100 text-yellow-800"
            };
        } else {
            return {
                label: "Concluded",
                className: "bg-gray-100 text-gray-800"
            };
        }
    };

    if (loading && !isAddingAvailability) {
        return (
            <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e5631]"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                    {doctorId ? "My Unavailability Periods" : "Doctor Unavailability Periods"}
                </h2>
                {!isAddingAvailability && (
                    <button
                        onClick={() => setIsAddingAvailability(true)}
                        className="bg-[#1e5631] text-white px-4 py-2 rounded hover:bg-[#0d401d]"
                    >
                        Add Unavailability Period
                    </button>
                )}
            </div>

            {isAddingAvailability ? (
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!doctorId && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Doctor
                                </label>
                                <select
                                    value={formData.doctor_id}
                                    onChange={(e) => setFormData(prev => ({ ...prev, doctor_id: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm"
                                    required
                                >
                                    <option value="">Select a doctor</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.doctor_id} value={doctor.doctor_id}>
                                            {doctor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.from_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, from_date: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    To Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={formData.to_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, to_date: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm"
                                    min={formData.from_date}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-[#1e5631] text-white rounded-md hover:bg-[#143e22] disabled:opacity-50"
                            >
                                {loading ? "Saving..." : editingAvailability ? "Update Period" : "Add Period"}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {!doctorId && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Doctor Name
                                    </th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    From Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    To Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {availabilities.map((availability) => (
                                <tr key={availability.availability_id} className="hover:bg-gray-50">
                                    {!doctorId && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {availability.doctors?.name || 'Unknown'}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(availability.from_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(availability.to_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {(() => {
                                            const status = getStatusDisplay(availability.from_date, availability.to_date);
                                            return (
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleEdit(availability)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeletingAvailability(availability)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {deletingAvailability && (
                <DeleteWarning
                    message={`Are you sure you want to delete this unavailability period${!doctorId ? ` for ${deletingAvailability.doctors?.name}` : ''}?`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeletingAvailability(null)}
                />
            )}
        </div>
    );
};

export default DoctorAvailabilityTable; 