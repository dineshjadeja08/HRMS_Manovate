import api from './api';

export interface PerformanceReview {
  id: number;
  employee_id: number;
  reviewer_id: number;
  review_period_start: string;
  review_period_end: string;
  overall_rating?: number;
  comments?: string;
  status: string;
  created_at: string;
  employee?: any;
  reviewer?: any;
}

export interface TrainingCourse {
  id: number;
  name: string;
  description?: string;
  duration_hours?: number;
  instructor?: string;
  max_participants?: number;
  is_active: boolean;
  created_at: string;
}

export interface TrainingEnrollment {
  id: number;
  employee_id: number;
  course_id: number;
  enrollment_date: string;
  completion_date?: string;
  status: string;
  score?: number;
  certificate_url?: string;
  created_at: string;
  course?: TrainingCourse;
}

export const performanceService = {
  // Performance Reviews
  createReview: async (data: {
    employee_id: number;
    reviewer_id: number;
    review_period_start: string;
    review_period_end: string;
  }): Promise<PerformanceReview> => {
    const response = await api.post('/performance/reviews', data);
    return response.data;
  },

  submitFeedback: async (reviewId: number, data: {
    overall_rating?: number;
    comments?: string;
  }): Promise<PerformanceReview> => {
    const response = await api.post(`/performance/reviews/${reviewId}/feedback`, data);
    return response.data;
  },

  getManagerReviews: async (managerId: number): Promise<PerformanceReview[]> => {
    const response = await api.get(`/performance/reviews/manager/${managerId}`);
    return response.data;
  },

  // Training Courses
  getAllCourses: async (): Promise<TrainingCourse[]> => {
    const response = await api.get('/performance/training/courses');
    return response.data;
  },

  createCourse: async (data: Partial<TrainingCourse>): Promise<TrainingCourse> => {
    const response = await api.post('/performance/training/courses', data);
    return response.data;
  },

  // Training Enrollments
  enrollInCourse: async (data: {
    employee_id: number;
    course_id: number;
  }): Promise<TrainingEnrollment> => {
    const response = await api.post('/performance/training/enrollments', data);
    return response.data;
  },

  getEmployeeEnrollments: async (employeeId: number): Promise<TrainingEnrollment[]> => {
    const response = await api.get(`/performance/training/enrollments/${employeeId}`);
    return response.data;
  },
};
