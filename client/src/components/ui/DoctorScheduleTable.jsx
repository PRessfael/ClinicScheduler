import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "wouter";

const DoctorScheduleTable = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatWeekdays = (schedString) => {
        const dayMap = {
            'M': 'Monday',
            'T': 'Tuesday',
            'W': 'Wednesday',
            'Th': 'Thursday',
            'F': 'Friday',
            'St': 'Saturday',
            'Sn': 'Sunday'
        };

        let formattedDays = [];
        let i = 0;
        while (i < schedString.length) {
            if (i + 1 < schedString.length &&
                (schedString.substring(i, i + 2) === 'Th' ||
                    schedString.substring(i, i + 2) === 'St' ||
                    schedString.substring(i, i + 2) === 'Sn')) {
                formattedDays.push(dayMap[schedString.substring(i, i + 2)]);
                i += 2;
            } else {
                formattedDays.push(dayMap[schedString[i]]);
                i++;
            }
        }
        return formattedDays.join(', ');
    };

    const formatTimeSlot = (timeSlot) => {
        if (!timeSlot) return 'Not set';
        const [start, end] = timeSlot.split('-').map(Number);
        const formatHour = (hour) => {
            const period = hour >= 12 ? 'PM' : 'AM';
            const formattedHour = hour > 12 ? hour - 12 : hour;
            return `${formattedHour}:00 ${period}`;
        };
        return `${formatHour(start)} - ${formatHour(end)}`;
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
            console.error('Error fetching doctor schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e5631]"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Doctor Schedules</h2>
                <Link href="/manage-schedules">
                    <a className="bg-[#1e5631] text-white px-4 py-2 rounded hover:bg-[#0d401d]">
                        Manage Schedules
                    </a>
                </Link>
            </div>
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
                                    {formatWeekdays(schedule.sched)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatTimeSlot(schedule.time_slots)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DoctorScheduleTable; 