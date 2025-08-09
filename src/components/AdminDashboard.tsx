import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { QrCode, Users, Calendar, RefreshCw, Download } from 'lucide-react';
import { generateQRCode, generateAttendanceQR } from '../utils/qrCode';
import { getStudents, getAttendanceRecords, getTodayAttendance } from '../utils/storage';
import { Student, AttendanceRecord } from '../types';
import { format } from 'date-fns';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    generateNewQR();
  }, []);

  const loadData = () => {
    setStudents(getStudents());
    setAttendanceRecords(getAttendanceRecords());
    setTodayAttendance(getTodayAttendance());
  };

  const generateNewQR = async () => {
    setLoading(true);
    try {
      const qrData = generateAttendanceQR();
      const qrUrl = await generateQRCode(qrData);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadAttendanceReport = () => {
    const csvContent = [
      ['Date', 'Name', 'Register Number', 'Room Number', 'Time'],
      ...attendanceRecords.map(record => [
        format(new Date(record.timestamp), 'yyyy-MM-dd'),
        record.studentName,
        record.registerNumber,
        record.roomNumber,
        format(new Date(record.timestamp), 'HH:mm:ss')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hostel-attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Admin Dashboard" onLogout={onLogout}>
      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">{students.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today Present</p>
                <p className="text-3xl font-bold text-green-600">{todayAttendance.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-3xl font-bold text-yellow-600">{attendanceRecords.length}</p>
              </div>
              <QrCode className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* QR Code Generator */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Attendance QR Code</h3>
            <button
              onClick={generateNewQR}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Generate New
            </button>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="flex-shrink-0">
              {qrCodeUrl ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <img
                    src={qrCodeUrl}
                    alt="Attendance QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center lg:text-left">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Instructions</h4>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• Display this QR code for students to scan</li>
                <li>• Students use their mobile devices to scan and mark attendance</li>
                <li>• QR code is valid for today's attendance</li>
                <li>• Generate a new QR code daily for security</li>
              </ul>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-blue-800 text-sm">
                <strong>Note:</strong> Each student can mark attendance only once per day
              </div>
            </div>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Today's Attendance</h3>
            <div className="flex space-x-2">
              <button
                onClick={loadData}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={downloadAttendanceReport}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {todayAttendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Register No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Room</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todayAttendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{record.studentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.registerNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.roomNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(new Date(record.timestamp), 'hh:mm a')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No attendance yet</h4>
              <p className="text-gray-600">Students will appear here once they mark attendance</p>
            </div>
          )}
        </div>

        {/* All Students */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">All Registered Students</h3>
          
          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Register No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Room</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Year</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{student.registerNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{student.roomNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{student.year}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(new Date(student.createdAt), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No students registered</h4>
              <p className="text-gray-600">Students will appear here once they register</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};