export interface Student {
  id: string;
  name: string;
  registerNumber: string;
  roomNumber: string;
  year: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  roomNumber: string;
  timestamp: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  registerNumber: string;
  roomNumber: string;
  year: string;
  role: 'student' | 'admin';
}
