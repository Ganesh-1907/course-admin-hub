// API Service for Course Management Backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Store token in localStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const setUserData = (userData: any) => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

export const getUserData = () => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

// API Request Helper
const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  requiresAuth: boolean = true
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth token if required
  if (requiresAuth) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API Error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return await response.json();
};

// ==================== ADMIN AUTHENTICATION ====================

export const adminLogin = async (email: string, password: string) => {
  const response = await apiRequest(
    '/admin/auth/login',
    'POST',
    { email, password },
    false
  );
  
  if (response.data?.token) {
    setAuthToken(response.data.token);
    setUserData(response.data.admin);
  }
  
  return response;
};

export const adminLogout = async () => {
  try {
    await apiRequest('/admin/auth/logout', 'POST');
  } finally {
    removeAuthToken();
  }
};

export const getAdminProfile = async () => {
  return await apiRequest('/admin/auth/profile', 'GET');
};

export const updateAdminProfile = async (data: {
  name?: string;
  phone?: string;
  department?: string;
}) => {
  return await apiRequest('/admin/auth/profile', 'PUT', data);
};

export const changeAdminPassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  return await apiRequest('/admin/auth/change-password', 'PUT', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
};

// ==================== COURSES MANAGEMENT ====================

export const createCourse = async (courseData: any) => {
  return await apiRequest('/admin/courses', 'POST', courseData);
};

export const getAllCourses = async (page = 1, limit = 10, filters?: any) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.search) params.append('search', filters.search);
  if (filters?.serviceType) params.append('serviceType', filters.serviceType);

  return await apiRequest(`/admin/courses?${params.toString()}`, 'GET');
};

export const getCourseById = async (courseId: string) => {
  return await apiRequest(`/admin/courses/${courseId}`, 'GET');
};

export const updateCourse = async (courseId: string, courseData: any) => {
  return await apiRequest(`/admin/courses/${courseId}`, 'PUT', courseData);
};

export const deleteCourse = async (courseId: string) => {
  return await apiRequest(`/admin/courses/${courseId}`, 'DELETE');
};

export const activateCourse = async (courseId: string) => {
  return await apiRequest(`/admin/courses/${courseId}/activate`, 'PATCH');
};

export const deactivateCourse = async (courseId: string) => {
  return await apiRequest(`/admin/courses/${courseId}/deactivate`, 'PATCH');
};

export const importCourses = async (file: File) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/admin/courses/import`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API Error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return await response.json();
};

// ==================== REGISTRATIONS MANAGEMENT ====================

export const getAllRegistrations = async (
  page = 1,
  limit = 10,
  filters?: any
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.courseId) params.append('courseId', filters.courseId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
  if (filters?.search) params.append('search', filters.search);

  return await apiRequest(`/admin/registrations?${params.toString()}`, 'GET');
};

export const getRegistrationDetail = async (registrationId: string) => {
  return await apiRequest(
    `/admin/registrations/detail/${registrationId}`,
    'GET'
  );
};

export const updateRegistrationStatus = async (
  registrationId: string,
  status: string,
  notes?: string
) => {
  return await apiRequest(
    `/admin/registrations/${registrationId}/status`,
    'PATCH',
    { status, notes }
  );
};

export const cancelRegistration = async (
  registrationId: string,
  reason?: string
) => {
  return await apiRequest(
    `/admin/registrations/${registrationId}/cancel`,
    'PATCH',
    { reason }
  );
};

export const issueCertificate = async (
  registrationId: string,
  certificateUrl: string,
  certificateName: string
) => {
  return await apiRequest(
    `/admin/registrations/${registrationId}/certificate`,
    'POST',
    { certificateUrl, certificateName }
  );
};

export const getPaymentDetails = async (registrationId: string) => {
  return await apiRequest(
    `/admin/registrations/${registrationId}/payment`,
    'GET'
  );
};

export const getDashboardStats = async () => {
  return await apiRequest(
    '/admin/registrations/dashboard/statistics',
    'GET'
  );
};

// ==================== PUBLIC COURSES (No Auth Required) ====================

export const getPublicCourses = async (page = 1, limit = 10, filters?: any) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.search) params.append('search', filters.search);
  if (filters?.serviceType) params.append('serviceType', filters.serviceType);

  return await apiRequest(
    `/user/courses?${params.toString()}`,
    'GET',
    undefined,
    false
  );
};

export const searchCourses = async (query: string, page = 1, limit = 10) => {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    limit: limit.toString(),
  });

  return await apiRequest(
    `/user/courses/search?${params.toString()}`,
    'GET',
    undefined,
    false
  );
};

export const getCoursesByType = async (
  serviceType: string,
  page = 1,
  limit = 10
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return await apiRequest(
    `/user/courses/type/${serviceType}?${params.toString()}`,
    'GET',
    undefined,
    false
  );
};

export const getPublicCourseDetails = async (courseId: string) => {
  return await apiRequest(
    `/user/courses/${courseId}`,
    'GET',
    undefined,
    false
  );
};

export const getCourseReviews = async (courseId: string, page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return await apiRequest(
    `/user/courses/${courseId}/reviews?${params.toString()}`,
    'GET',
    undefined,
    false
  );
};

// ==================== USER AUTHENTICATION ====================

export const userRegister = async (userData: {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}) => {
  const response = await apiRequest(
    '/user/auth/register',
    'POST',
    userData,
    false
  );

  if (response.data?.token) {
    setAuthToken(response.data.token);
    setUserData(response.data.participant);
  }

  return response;
};

export const userLogin = async (email: string, password: string) => {
  const response = await apiRequest(
    '/user/auth/login',
    'POST',
    { email, password },
    false
  );

  if (response.data?.token) {
    setAuthToken(response.data.token);
    setUserData(response.data.participant);
  }

  return response;
};

export const getUserProfile = async () => {
  return await apiRequest('/user/auth/profile', 'GET');
};

export const updateUserProfile = async (data: any) => {
  return await apiRequest('/user/auth/profile', 'PUT', data);
};

export const changeUserPassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  return await apiRequest('/user/auth/change-password', 'PUT', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
};

// ==================== USER REGISTRATIONS ====================

export const registerForCourse = async (courseId: string) => {
  return await apiRequest('/user/registrations', 'POST', { courseId });
};

export const getUserRegistrations = async (page = 1, limit = 10, status?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) params.append('status', status);

  return await apiRequest(
    `/user/registrations?${params.toString()}`,
    'GET'
  );
};

export const getUserRegistrationDetail = async (registrationId: string) => {
  return await apiRequest(`/user/registrations/${registrationId}`, 'GET');
};

export const processPayment = async (
  registrationId: string,
  paymentData: {
    paymentMode: string;
    paymentId: string;
    amountPaid: number;
  }
) => {
  return await apiRequest(
    `/user/registrations/${registrationId}/payment`,
    'POST',
    paymentData
  );
};

export const submitReview = async (
  registrationId: string,
  rating: number,
  review: string
) => {
  return await apiRequest(
    `/user/registrations/${registrationId}/review`,
    'POST',
    { rating, review }
  );
};

export const cancelUserRegistration = async (
  registrationId: string,
  reason: string
) => {
  return await apiRequest(
    `/user/registrations/${registrationId}/cancel`,
    'PATCH',
    { reason }
  );
};

export const downloadCertificate = async (registrationId: string) => {
  return await apiRequest(
    `/user/registrations/${registrationId}/certificate`,
    'GET'
  );
};

// ==================== HEALTH CHECK ====================

export const checkApiHealth = async () => {
  return await apiRequest('/health', 'GET', undefined, false);
};
