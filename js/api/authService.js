// Authentication Service - Production Ready

class AuthService {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = null;
        
        // Try to restore user from localStorage
        try {
            const storedUser = localStorage.getItem('apiUser');
            if (storedUser) {
                this.user = JSON.parse(storedUser);
            }
        } catch (error) {
            console.warn('Failed to restore user from localStorage:', error);
        }
    }

    /**
     * Login user with API
     */
    async login(email, password) {
        try {
            console.log('🔐 API Login attempt:', { email });
            
            const response = await window.apiService.post(window.API_ENDPOINTS.LOGIN, {
                email,
                password
            });

            if (response && response.success) {
                // Store token
                if (response.token) {
                    this.token = response.token;
                    localStorage.setItem('token', this.token);
                }

                // Store user
                if (response.user) {
                    this.user = response.user;
                    localStorage.setItem('apiUser', JSON.stringify(this.user));
                }

                console.log('✅ API Login successful:', this.user);
                return response;
            } else {
                throw new Error(response?.message || 'Login failed');
            }
        } catch (error) {
            console.error('❌ API Login failed:', error);
            throw error;
        }
    }

    /**
     * Register new user
     */
    async register(userData) {
        try {
            console.log('📝 API Register attempt:', { email: userData.email });
            
            const response = await window.apiService.post(window.API_ENDPOINTS.REGISTER, userData);

            if (response && response.success) {
                // Store token
                if (response.token) {
                    this.token = response.token;
                    localStorage.setItem('token', this.token);
                }

                // Store user
                if (response.user) {
                    this.user = response.user;
                    localStorage.setItem('apiUser', JSON.stringify(this.user));
                }

                console.log('✅ API Register successful:', this.user);
                return response;
            } else {
                throw new Error(response?.message || 'Registration failed');
            }
        } catch (error) {
            console.error('❌ API Register failed:', error);
            throw error;
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            console.log('🚪 API Logout attempt');
            
            // Call logout endpoint if token exists
            if (this.token) {
                await window.apiService.post(window.API_ENDPOINTS.LOGOUT);
            }
        } catch (error) {
            console.warn('API Logout failed (continuing anyway):', error);
        } finally {
            // Clear local state regardless of API call result
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('apiUser');
            
            console.log('✅ API Logout complete');
        }
    }

    /**
     * Get current user profile
     */
    async getMe() {
        try {
            if (!this.token) {
                throw new Error('No authentication token');
            }

            const response = await window.apiService.get(window.API_ENDPOINTS.ME);
            
            if (response && response.success && response.user) {
                this.user = response.user;
                localStorage.setItem('apiUser', JSON.stringify(this.user));
                return response.user;
            } else {
                throw new Error('Failed to get user profile');
            }
        } catch (error) {
            console.error('❌ Failed to get user profile:', error);
            throw error;
        }
    }

    /**
     * Update user details
     */
    async updateDetails(userData) {
        try {
            const response = await window.apiService.put(window.API_ENDPOINTS.UPDATE_DETAILS, userData);
            
            if (response && response.success && response.user) {
                this.user = response.user;
                localStorage.setItem('apiUser', JSON.stringify(this.user));
                return response.user;
            } else {
                throw new Error('Failed to update user details');
            }
        } catch (error) {
            console.error('❌ Failed to update user details:', error);
            throw error;
        }
    }

    /**
     * Update user password
     */
    async updatePassword(currentPassword, newPassword) {
        try {
            const response = await window.apiService.put(window.API_ENDPOINTS.UPDATE_PASSWORD, {
                currentPassword,
                newPassword
            });
            
            if (response && response.success) {
                return response;
            } else {
                throw new Error('Failed to update password');
            }
        } catch (error) {
            console.error('❌ Failed to update password:', error);
            throw error;
        }
    }

    /**
     * Get stored user (from localStorage)
     */
    getStoredUser() {
        return this.user;
    }

    /**
     * Get stored token
     */
    getStoredToken() {
        return this.token;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!(this.token && this.user);
    }

    /**
     * Get auth headers for API requests
     */
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        };
    }
}

// Export singleton instance
const authService = new AuthService();
window.authService = authService;