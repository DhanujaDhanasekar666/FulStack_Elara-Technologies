// Data Service for all other API calls

const dataService = {
    // Users
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await window.apiService.get(`${window.API_ENDPOINTS.USERS}${queryString ? '?' + queryString : ''}`);
    },

    async getUser(id) {
        return await window.apiService.get(`${window.API_ENDPOINTS.USERS}/${id}`);
    },

    async createUser(userData) {
        return await window.apiService.post(window.API_ENDPOINTS.USERS, userData);
    },

    async updateUser(id, userData) {
        return await window.apiService.put(`${window.API_ENDPOINTS.USERS}/${id}`, userData);
    },

    async deleteUser(id) {
        return await window.apiService.delete(`${window.API_ENDPOINTS.USERS}/${id}`);
    },

    async getUserStats() {
        return await window.apiService.get(window.API_ENDPOINTS.USER_STATS);
    },

    // Projects
    async getProjects(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await window.apiService.get(`${window.API_ENDPOINTS.PROJECTS}${queryString ? '?' + queryString : ''}`);
    },

    async getProject(id) {
        return await window.apiService.get(`${window.API_ENDPOINTS.PROJECTS}/${id}`);
    },

    async createProject(projectData) {
        return await window.apiService.post(window.API_ENDPOINTS.PROJECTS, projectData);
    },

    async updateProject(id, projectData) {
        return await window.apiService.put(`${window.API_ENDPOINTS.PROJECTS}/${id}`, projectData);
    },

    async deleteProject(id) {
        return await window.apiService.delete(`${window.API_ENDPOINTS.PROJECTS}/${id}`);
    },

    // Tasks
    async getTasks(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await window.apiService.get(`${window.API_ENDPOINTS.TASKS}${queryString ? '?' + queryString : ''}`);
    },

    async getTask(id) {
        return await window.apiService.get(`${window.API_ENDPOINTS.TASKS}/${id}`);
    },

    async createTask(taskData) {
        return await window.apiService.post(window.API_ENDPOINTS.TASKS, taskData);
    },

    async updateTask(id, taskData) {
        return await window.apiService.put(`${window.API_ENDPOINTS.TASKS}/${id}`, taskData);
    },

    async deleteTask(id) {
        return await window.apiService.delete(`${window.API_ENDPOINTS.TASKS}/${id}`);
    },

    async addTaskComment(id, comment) {
        return await window.apiService.post(`${window.API_ENDPOINTS.TASKS}/${id}/comments`, { comment });
    },

    // Leaves
    async getLeaves(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await window.apiService.get(`${window.API_ENDPOINTS.LEAVES}${queryString ? '?' + queryString : ''}`);
    },

    async getLeave(id) {
        return await window.apiService.get(`${window.API_ENDPOINTS.LEAVES}/${id}`);
    },

    async createLeave(leaveData) {
        return await window.apiService.post(window.API_ENDPOINTS.LEAVES, leaveData);
    },

    async updateLeaveStatus(id, status, rejectionReason = null) {
        return await window.apiService.put(`${window.API_ENDPOINTS.LEAVES}/${id}/status`, { status, rejectionReason });
    },

    async deleteLeave(id) {
        return await window.apiService.delete(`${window.API_ENDPOINTS.LEAVES}/${id}`);
    },

    // Payroll
    async getPayrolls(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await window.apiService.get(`${window.API_ENDPOINTS.PAYROLL}${queryString ? '?' + queryString : ''}`);
    },

    async getPayroll(id) {
        return await window.apiService.get(`${window.API_ENDPOINTS.PAYROLL}/${id}`);
    },

    async createPayroll(payrollData) {
        return await window.apiService.post(window.API_ENDPOINTS.PAYROLL, payrollData);
    },

    async updatePayroll(id, payrollData) {
        return await window.apiService.put(`${window.API_ENDPOINTS.PAYROLL}/${id}`, payrollData);
    },

    async processPayroll(id) {
        return await window.apiService.put(`${window.API_ENDPOINTS.PAYROLL}/${id}/process`);
    },

    async getPayrollStats(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await window.apiService.get(`${window.API_ENDPOINTS.PAYROLL_STATS}${queryString ? '?' + queryString : ''}`);
    },

    // Employees
    async getEmployees(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await window.apiService.get(`/api/v1/employees${queryString ? '?' + queryString : ''}`);
    },

    async createEmployee(employeeData) {
        return await window.apiService.post('/api/v1/employees', employeeData);
    },

    async updateEmployee(id, employeeData) {
        return await window.apiService.put(`/api/v1/employees/${id}`, employeeData);
    },

    async deleteEmployee(id) {
        return await window.apiService.delete(`/api/v1/employees/${id}`);
    },

    // Attendance
    async getAttendance(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await window.apiService.get(`/api/v1/attendance${queryString ? '?' + queryString : ''}`);
    },

    async createAttendance(attendanceData) {
        return await window.apiService.post('/api/v1/attendance', attendanceData);
    },

    async updateAttendance(id, attendanceData) {
        return await window.apiService.put(`/api/v1/attendance/${id}`, attendanceData);
    },

    // Leave Requests
    async createLeaveRequest(leaveData) {
        return await window.apiService.post(window.API_ENDPOINTS.LEAVES, leaveData);
    },

    async updateLeaveRequest(id, updates) {
        return await window.apiService.put(`${window.API_ENDPOINTS.LEAVES}/${id}`, updates);
    },

    // Disciplinary
    async getDisciplinary(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await window.apiService.get(`/api/v1/disciplinary${queryString ? '?' + queryString : ''}`);
    },

    async createDisciplinary(disciplinaryData) {
        return await window.apiService.post('/api/v1/disciplinary', disciplinaryData);
    },

    async updateDisciplinary(id, disciplinaryData) {
        return await window.apiService.put(`/api/v1/disciplinary/${id}`, disciplinaryData);
    }
};

// Make globally available
window.dataService = dataService;

