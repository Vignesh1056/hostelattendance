import { Student, AttendanceRecord, User } from '../types';

const STUDENTS_KEY = 'hostel_students';
const ATTENDANCE_KEY = 'hostel_attendance';
const CURRENT_USER_KEY = 'current_user';

// Student management
export const getStudents = (): Student[] => {
  const stored = localStorage.getItem(STUDENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addStudent = (student: Student): void => {
  const students = getStudents();
  students.push(student);
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
};

export const findStudent = (registerNumber: string): Student | null => {
  const students = getStudents();
  return students.find(s => s.registerNumber.toLowerCase() === registerNumber.toLowerCase()) || null;
};

// Attendance management
export const getAttendanceRecords = (): AttendanceRecord[] => {
  const stored = localStorage.getItem(ATTENDANCE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addAttendanceRecord = (record: AttendanceRecord): void => {
  const records = getAttendanceRecords();
  records.push(record);
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
};

export const getTodayAttendance = (): AttendanceRecord[] => {
  const records = getAttendanceRecords();
  const today = new Date().toDateString();
  return records.filter(r => new Date(r.timestamp).toDateString() === today);
};

export const isAlreadyMarkedToday = (registerNumber: string): boolean => {
  const todayRecords = getTodayAttendance();
  return todayRecords.some(r => r.registerNumber === registerNumber);
};

// User session management
export const setCurrentUser = (user: User): void => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};