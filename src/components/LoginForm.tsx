import React, { useState } from 'react';
import { User, Lock, UserPlus, Shield } from 'lucide-react';
import { findStudent, addStudent, setCurrentUser } from '../utils/storage';
import { Student, User as UserType } from '../types';

interface LoginFormProps {
  onLogin: (user: UserType) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>('login');
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    roomNumber: '',
    year: '',
    adminPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'admin') {
        // Simple admin password check (in production, use proper authentication)
        if (formData.adminPassword === 'admin123') {
          const adminUser: UserType = {
            id: 'admin',
            name: 'Administrator',
            registerNumber: 'ADMIN',
            roomNumber: 'N/A',
            year: 'N/A',
            role: 'admin'
          };
          setCurrentUser(adminUser);
          onLogin(adminUser);
        } else {
          setError('Invalid admin password');
        }
      } else if (mode === 'register') {
        // Register new student
        const existingStudent = findStudent(formData.registerNumber);
        if (existingStudent) {
          setError('Student with this register number already exists');
          return;
        }

        const newStudent: Student = {
          id: Date.now().toString(),
          name: formData.name.trim(),
          registerNumber: formData.registerNumber.trim(),
          roomNumber: formData.roomNumber.trim(),
          year: formData.year,
          createdAt: new Date().toISOString()
        };

        addStudent(newStudent);
        
        const user: UserType = {
          ...newStudent,
          role: 'student'
        };
        
        setCurrentUser(user);
        onLogin(user);
      } else {
        // Login existing student
        const student = findStudent(formData.registerNumber);
        if (!student) {
          setError('Student not found. Please register first.');
          return;
        }

        const user: UserType = {
          ...student,
          role: 'student'
        };
        
        setCurrentUser(user);
        onLogin(user);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Hostel Attendance</h2>
          <p className="mt-2 text-gray-600">Track your hostel attendance easily</p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              mode === 'login'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              mode === 'register'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('admin');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              mode === 'admin'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Admin
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {mode === 'admin' ? (
            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  id="adminPassword"
                  name="adminPassword"
                  type="password"
                  required
                  value={formData.adminPassword}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter admin password"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Default: admin123</p>
            </div>
          ) : (
            <>
              {mode === 'register' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="registerNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Register Number
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="registerNumber"
                    name="registerNumber"
                    type="text"
                    required
                    value={formData.registerNumber}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter register number"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Room Number
                      </label>
                      <input
                        id="roomNumber"
                        name="roomNumber"
                        type="text"
                        required
                        value={formData.roomNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Room no."
                      />
                    </div>
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                        Year
                      </label>
                      <select
                        id="year"
                        name="year"
                        required
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      >
                        <option value="">Select</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-green-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'register' ? (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Register
                  </>
                ) : mode === 'admin' ? (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Login as Admin
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5 mr-2" />
                    Login
                  </>
                )}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};