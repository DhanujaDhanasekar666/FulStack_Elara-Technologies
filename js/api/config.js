// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';

const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
    UPDATE_DETAILS: `${API_BASE_URL}/auth/updatedetails`,
    UPDATE_PASSWORD: `${API_BASE_URL}/auth/updatepassword`,
    
    // User endpoints
    USERS: `${API_BASE_URL}/users`,
    USER_STATS: `${API_BASE_URL}/users/stats`,
    
    // Project endpoints
    PROJECTS: `${API_BASE_URL}/projects`,
    
    // Task endpoints
    TASKS: `${API_BASE_URL}/tasks`,
    
    // Leave endpoints
    LEAVES: `${API_BASE_URL}/leaves`,
    
    // Payroll endpoints
    PAYROLL: `${API_BASE_URL}/payroll`,
    PAYROLL_STATS: `${API_BASE_URL}/payroll/stats`,
    
    // Health check
    HEALTH: `${API_BASE_URL}/health`
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Make globally available
window.API_ENDPOINTS = API_ENDPOINTS;
window.getAuthHeaders = getAuthHeaders;




