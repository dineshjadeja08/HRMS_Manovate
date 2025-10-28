import React, { useState, useEffect } from 'react';
import { performanceService } from '../services/performanceService';
import type { TrainingCourse, TrainingEnrollment } from '../services/performanceService';
import { useAuth } from '../contexts/AuthContext';
import PrimaryButton from '../components/UI/PrimaryButton';
import StatusBadge from '../components/UI/StatusBadge';
import { AcademicCapIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const TrainingPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<TrainingEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, enrollmentsData] = await Promise.all([
        performanceService.getAllCourses(),
        user?.employee_id
          ? performanceService.getEmployeeEnrollments(user.employee_id)
          : Promise.resolve([]),
      ]);
      setCourses(coursesData);
      setMyEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Failed to load training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    if (!user?.employee_id) {
      alert('Employee profile not found');
      return;
    }

    try {
      setEnrolling(true);
      await performanceService.enrollInCourse({
        employee_id: user.employee_id,
        course_id: courseId,
      });
      await loadData();
    } catch (error: any) {
      console.error('Failed to enroll:', error);
      alert(error.response?.data?.detail || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const isEnrolled = (courseId: number) => {
    return myEnrollments.some((e) => e.course_id === courseId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-600">Loading training courses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-800">Training & Development</h1>
        <p className="text-slate-500 mt-1">Enroll in courses to enhance your skills</p>
      </div>

      {/* My Enrollments */}
      {myEnrollments.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">My Enrollments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {enrollment.course?.name}
                  </h3>
                  <StatusBadge status={enrollment.status} />
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  {enrollment.course?.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    {enrollment.course?.duration_hours}h
                  </div>
                  <div className="text-xs">
                    Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                  </div>
                </div>
                {enrollment.completion_date && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    Completed: {new Date(enrollment.completion_date).toLocaleDateString()}
                    {enrollment.score && ` - Score: ${enrollment.score}%`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Courses */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Available Courses</h2>

        {courses.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No training courses available at this time
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary-100 rounded-full p-3">
                    <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">{course.name}</h3>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {course.description || 'No description available'}
                </p>

                <div className="space-y-2 mb-4">
                  {course.duration_hours && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <ClockIcon className="h-4 w-4" />
                      <span>{course.duration_hours} hours</span>
                    </div>
                  )}
                  {course.instructor && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <UserGroupIcon className="h-4 w-4" />
                      <span>{course.instructor}</span>
                    </div>
                  )}
                  {course.max_participants && (
                    <div className="text-xs text-slate-500">
                      Max participants: {course.max_participants}
                    </div>
                  )}
                </div>

                {isEnrolled(course.id) ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 text-slate-500 rounded-md cursor-not-allowed"
                  >
                    Already Enrolled
                  </button>
                ) : (
                  <PrimaryButton
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrolling}
                    className="w-full"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </PrimaryButton>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingPage;
