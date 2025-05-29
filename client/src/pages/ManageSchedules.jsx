import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";
import DoctorAvailabilityTable from "@/components/ui/DoctorAvailabilityTable";

const ManageSchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [newSchedule, setNewSchedule] = useState({
        doctor_id: "",
        sched: "",
        time_slots: ""
    });

    const DAYS = [
        { key: 'M', label: 'Mon' },
        { key: 'T', label: 'Tue' },
        { key: 'W', label: 'Wed' },
        { key: 'Th', label: 'Thu' },
        { key: 'F', label: 'Fri' },
        { key: 'St', label: 'Sat' },
        { key: 'Sn', label: 'Sun' }
    ];

    const fetchDoctors = async () => {
        try {
            const { data, error } = await supabase
                .from('doctors')
                .select('doctor_id, name, specialty')
                .order('name');

            if (error) throw error;
            setDoctors(data || []);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load doctors list."
            });
        }
    };

    const fetchSchedules = async () => {
        try {
            const { data, error } = await supabase
                .from('doctor_schedule')
                .select(`
          schedule_id,
          doctor_id,
          time_slots,
          sched,
          doctors (
            name,
            specialty
          )
        `)
                .order('doctor_id');

            if (error) throw error;
            setSchedules(data || []);
        } catch (error) {
            console.error('Error fetching schedules:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load schedules."
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
        fetchSchedules();
    }, []);

    const handleSaveSchedule = async (schedule) => {
        try {
            const { error } = await supabase
                .from('doctor_schedule')
                .upsert({
                    schedule_id: schedule.schedule_id,
                    doctor_id: schedule.doctor_id,
                    sched: schedule.sched,
                    time_slots: schedule.time_slots
                });

            if (error) throw error;

            toast({
                title: "Success",
                description: "Schedule saved successfully."
            });

            fetchSchedules();
            setEditingSchedule(null);
        } catch (error) {
            console.error('Error saving schedule:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save schedule."
            });
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;

        try {
            const { error } = await supabase
                .from('doctor_schedule')
                .delete()
                .eq('schedule_id', scheduleId);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Schedule deleted successfully."
            });

            fetchSchedules();
        } catch (error) {
            console.error('Error deleting schedule:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete schedule."
            });
        }
    };

    const validateSchedule = (schedule) => {
        if (!schedule.doctor_id) return "Please select a doctor";
        if (!schedule.sched) return "Please select working days";
        if (!schedule.time_slots) return "Please enter time slots";

        const [start, end] = schedule.time_slots.split('-').map(Number);
        if (isNaN(start) || isNaN(end) || start >= end || start < 0 || end > 24) {
            return "Invalid time slot format. Use 24-hour format (e.g., 8-16)";
        }

        return null;
    };

    const handleAddSchedule = async () => {
        const error = validateSchedule(newSchedule);
        if (error) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: error
            });
            return;
        }

        try {
            const { error: saveError } = await supabase
                .from('doctor_schedule')
                .insert(newSchedule);

            if (saveError) throw saveError;

            toast({
                title: "Success",
                description: "New schedule added successfully."
            });

            setNewSchedule({
                doctor_id: "",
                sched: "",
                time_slots: ""
            });
            fetchSchedules();
        } catch (error) {
            console.error('Error adding schedule:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to add schedule."
            });
        }
    };

    const formatWeekdays = (schedString) => {
        let formattedDays = [];
        let i = 0;
        while (i < schedString.length) {
            // Check for two-character days first
            if (i + 1 < schedString.length) {
                const twoCharDay = schedString.substring(i, i + 2);
                if (twoCharDay === 'Th' || twoCharDay === 'St' || twoCharDay === 'Sn') {
                    const dayObj = DAYS.find(d => d.key === twoCharDay);
                    if (dayObj) {
                        formattedDays.push(dayObj.label);
                        i += 2;
                        continue;
                    }
                }
            }
            // Handle single-character days
            const dayObj = DAYS.find(d => d.key === schedString[i]);
            if (dayObj) {
                formattedDays.push(dayObj.label);
            }
            i++;
        }
        return formattedDays.join(', ');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e5631]"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Manage Doctor Schedules</h2>
                <Link href="/admin/dashboard">
                    <a className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                        Back to Dashboard
                    </a>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                {/* Add New Schedule Form */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Doctor
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631]"
                                value={newSchedule.doctor_id}
                                onChange={(e) => setNewSchedule({ ...newSchedule, doctor_id: e.target.value })}
                            >
                                <option value="">Select Doctor</option>
                                {doctors.map((doctor) => (
                                    <option key={doctor.doctor_id} value={doctor.doctor_id}>
                                        {doctor.name} ({doctor.specialty})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Working Days
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {DAYS.map((day) => (
                                    <button
                                        key={day.key}
                                        type="button"
                                        className={`px-3 py-1 rounded ${newSchedule.sched.includes(day.key)
                                            ? "bg-[#1e5631] text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
                                        onClick={() => {
                                            const updatedDays = newSchedule.sched.includes(day.key)
                                                ? newSchedule.sched.replace(day.key, '')
                                                : newSchedule.sched + day.key;
                                            setNewSchedule({ ...newSchedule, sched: updatedDays });
                                        }}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Time Slots (24h format)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., 8-16"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e5631]"
                                value={newSchedule.time_slots}
                                onChange={(e) => setNewSchedule({ ...newSchedule, time_slots: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        className="mt-4 bg-[#1e5631] text-white px-4 py-2 rounded hover:bg-[#0d401d]"
                        onClick={handleAddSchedule}
                    >
                        Add Schedule
                    </button>
                </div>

                {/* Schedules Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Doctor Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Specialty
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Working Days
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time Slots
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {schedules.map((schedule) => (
                                <tr key={schedule.schedule_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {schedule.doctors?.name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {schedule.doctors?.specialty || 'Not specified'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {editingSchedule?.schedule_id === schedule.schedule_id ? (
                                            <div className="flex flex-wrap gap-2">
                                                {DAYS.map((day) => (
                                                    <button
                                                        key={day.key}
                                                        type="button"
                                                        className={`px-2 py-1 rounded text-xs ${editingSchedule.sched.includes(day.key)
                                                            ? "bg-[#1e5631] text-white"
                                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                            }`}
                                                        onClick={() => {
                                                            const updatedDays = editingSchedule.sched.includes(day.key)
                                                                ? editingSchedule.sched.replace(day.key, '')
                                                                : editingSchedule.sched + day.key;
                                                            setEditingSchedule({ ...editingSchedule, sched: updatedDays });
                                                        }}
                                                    >
                                                        {day.label}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            formatWeekdays(schedule.sched)
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {editingSchedule?.schedule_id === schedule.schedule_id ? (
                                            <input
                                                type="text"
                                                className="w-24 px-2 py-1 border border-gray-300 rounded"
                                                value={editingSchedule.time_slots}
                                                onChange={(e) => setEditingSchedule({
                                                    ...editingSchedule,
                                                    time_slots: e.target.value
                                                })}
                                                placeholder="e.g., 8-16"
                                            />
                                        ) : (
                                            schedule.time_slots
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {editingSchedule?.schedule_id === schedule.schedule_id ? (
                                            <div className="space-x-2">
                                                <button
                                                    className="text-green-600 hover:text-green-800"
                                                    onClick={() => handleSaveSchedule(editingSchedule)}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className="text-gray-600 hover:text-gray-800"
                                                    onClick={() => setEditingSchedule(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-x-2">
                                                <button
                                                    className="text-blue-600 hover:text-blue-800"
                                                    onClick={() => setEditingSchedule({ ...schedule })}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-800"
                                                    onClick={() => handleDeleteSchedule(schedule.schedule_id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Doctor Availability Section */}
            <div className="mt-8">
                <DoctorAvailabilityTable />
            </div>
        </div>
    );
};

export default ManageSchedules; 