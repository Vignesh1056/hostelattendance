import React, { useState, useRef, useEffect } from 'react';
import { Layout } from './Layout';
import { QrCode, Camera, CheckCircle, XCircle, Calendar, Clock } from 'lucide-react';
import { getCurrentUser, addAttendanceRecord, isAlreadyMarkedToday, getTodayAttendance } from '../utils/storage';
import { AttendanceRecord } from '../types';
import { format } from 'date-fns';
import jsQR from 'jsqr';

interface StudentDashboardProps {
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onLogout }) => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const user = getCurrentUser();

  useEffect(() => {
    if (user) {
      setAttendanceMarked(isAlreadyMarkedToday(user.registerNumber));
    }
  }, [user]);

  const startScanning = async () => {
    if (!user) return;

    try {
      setScanning(true);
      setScanResult(null);
      setMessage('');

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start QR code detection
      startQRDetection();
    } catch (error) {
      console.error('Error starting scanner:', error);
      setMessage('Unable to access camera. Please check permissions.');
      setScanResult('error');
      setScanning(false);
    }
  };

  const startQRDetection = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    intervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            handleScanResult(code.data);
          }
        }
      }
    }, 300);
  };

  const stopScanning = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setScanning(false);
  };

  const handleScanResult = (data: string) => {
    if (!user) return;

    try {
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'attendance') {
        if (isAlreadyMarkedToday(user.registerNumber)) {
          setMessage('Attendance already marked for today!');
          setScanResult('error');
        } else {
          const attendanceRecord: AttendanceRecord = {
            id: Date.now().toString(),
            studentId: user.id,
            studentName: user.name,
            registerNumber: user.registerNumber,
            roomNumber: user.roomNumber,
            timestamp: new Date().toISOString(),
            date: new Date().toDateString()
          };

          addAttendanceRecord(attendanceRecord);
          setAttendanceMarked(true);
          setMessage('Attendance marked successfully!');
          setScanResult('success');
        }
      } else {
        setMessage('Invalid QR code. Please scan the attendance QR.');
        setScanResult('error');
      }
    } catch {
      setMessage('Invalid QR code format.');
      setScanResult('error');
    }

    stopScanning();
  };

  const todayAttendance = getTodayAttendance();
  const currentTime = new Date();

  return (
    <Layout title="Student Dashboard" onLogout={onLogout}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Student Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{user?.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                <span>Register: {user?.registerNumber}</span>
                <span>Room: {user?.roomNumber}</span>
                <span>Year: {user?.year}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Status */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
            attendanceMarked ? 'border-green-500' : 'border-yellow-500'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Today's Status</h3>
                <p className={`text-sm font-medium ${
                  attendanceMarked ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {attendanceMarked ? 'Attendance Marked' : 'Not Marked'}
                </p>
              </div>
              {attendanceMarked ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <Clock className="w-8 h-8 text-yellow-500" />
              )}
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {format(currentTime, 'EEEE, MMMM do, yyyy')}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Total</h3>
              <div className="text-3xl font-bold text-blue-600">{todayAttendance.length}</div>
              <p className="text-sm text-gray-600">Students Present</p>
            </div>
          </div>
        </div>

        {/* QR Scanner */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Mark Attendance</h3>
          
          {!scanning ? (
            <div className="text-center">
              <div className="mb-6">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900">Ready to Scan</h4>
                <p className="text-gray-600">Tap the button below to scan the attendance QR code</p>
              </div>
              
              <button
                onClick={startScanning}
                disabled={attendanceMarked}
                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  attendanceMarked
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <Camera className="w-5 h-5 mr-2" />
                {attendanceMarked ? 'Already Marked Today' : 'Start Scanning'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  playsInline
                  muted
                  autoPlay
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg animate-pulse" />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 mb-4">Point your camera at the QR code</p>
                <button
                  onClick={stopScanning}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Cancel Scan
                </button>
              </div>
            </div>
          )}

          {/* Scan Result */}
          {scanResult && (
            <div className={`mt-6 p-4 rounded-lg flex items-center ${
              scanResult === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {scanResult === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 mr-2" />
              )}
              {message}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
