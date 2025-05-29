import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";

const AddSchedulePopup = ({ onClose, onSave }) => {
    const { toast } = useToast();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        doctor_id: "",
        startTime: "8",
        endTime: "17",
        days: {
            M: false,
            T: false,
            W: false,
            Th: false,
            F: false,
            St: false,
            Sn: false
        }
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

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

    const formatScheduleDays = () => {
        const dayOrder = ['M', 'T', 'W', 'Th', 'F', 'St', 'Sn'];
        return dayOrder.filter(day => formData.days[day]).join('');
    };

    const formatTimeSlot = () => {
        return `${formData.startTime}-${formData.endTime}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const schedString = formatScheduleDays();
        if (!schedString) {
            toast({
                title: "Error",
                description: "Please select at least one working day",
                variant: "error"
            });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase
                .from('doctor_schedule')
                .insert({
                    doctor_id: formData.doctor_id,
                    time_slots: formatTimeSlot(),
                    sched: schedString
                });

            if (error) throw error;

            toast({
                title: "Success",
                description: "Doctor schedule has been added successfully",
                variant: "success"
            });

            onSave();
            onClose();
        } catch (error) {
            console.error('Error adding schedule:', error);
            toast({
                title: "Error",
                description: error.message,
                variant: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDayToggle = (day) => {
        setFormData(prev => ({
            ...prev,
            days: {
                ...prev.days,
                [day]: !prev.days[day]
            }
        }));
    };

    const timeOptions = Array.from({ length: 24 }, (_, i) => ({
        value: String(i),
        label: i === 0 ? "12:00 AM" :
            i < 12 ? `${i}:00 AM` :
                i === 12 ? "12:00 PM" :
                    `${i - 12}:00 PM`
    }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add Doctor Schedule</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Doctor Selection */}
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

                    {/* Working Days */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Working Days
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.days.M}
                                    onChange={() => handleDayToggle('M')}
                                    className="rounded border-gray-300 text-[#1e5631] focus:ring-[#1e5631]"
                                />
                                <span className="text-sm">Monday</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.days.T}
                                    onChange={() => handleDayToggle('T')}
                                    className="rounded border-gray-300 text-[#1e5631] focus:ring-[#1e5631]"
                                />
                                <span className="text-sm">Tuesday</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.days.W}
                                    onChange={() => handleDayToggle('W')}
                                    className="rounded border-gray-300 text-[#1e5631] focus:ring-[#1e5631]"
                                />
                                <span className="text-sm">Wednesday</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.days.Th}
                                    onChange={() => handleDayToggle('Th')}
                                    className="rounded border-gray-300 text-[#1e5631] focus:ring-[#1e5631]"
                                />
                                <span className="text-sm">Thursday</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.days.F}
                                    onChange={() => handleDayToggle('F')}
                                    className="rounded border-gray-300 text-[#1e5631] focus:ring-[#1e5631]"
                                />
                                <span className="text-sm">Friday</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.days.St}
                                    onChange={() => handleDayToggle('St')}
                                    className="rounded border-gray-300 text-[#1e5631] focus:ring-[#1e5631]"
                                />
                                <span className="text-sm">Saturday</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.days.Sn}
                                    onChange={() => handleDayToggle('Sn')}
                                    className="rounded border-gray-300 text-[#1e5631] focus:ring-[#1e5631]"
                                />
                                <span className="text-sm">Sunday</span>
                            </label>
                        </div>
                    </div>

                    {/* Time Slots */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time
                            </label>
                            <select
                                value={formData.startTime}
                                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm"
                                required
                            >
                                {timeOptions.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time
                            </label>
                            <select
                                value={formData.endTime}
                                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1e5631] focus:ring-[#1e5631] sm:text-sm"
                                required
                            >
                                {timeOptions.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Schedule Preview:</span><br />
                            Days: {formatScheduleDays() || 'No days selected'}<br />
                            Time: {formatTimeSlot()}
                        </p>
                    </div>

                    {/* Action Buttons */}
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
                            {loading ? "Adding..." : "Add Schedule"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSchedulePopup; 