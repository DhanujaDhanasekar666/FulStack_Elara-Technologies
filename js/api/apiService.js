// Generic API Service - Production Ready

class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api/v1';
        this.timeout = 10000; // 10 seconds
    }

    /**
     * Make HTTP request with proper error handling
     */
    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(window.getAuthHeaders ? window.getAuthHeaders() : {}),
                ...options.headers
            },
            ...options
        };

        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        config.signal = controller.signal;

        try {
            console.log(`🌐 API ${config.method} ${url}`);
            
            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            // Handle different response types
            let data;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            console.log(`✅ API ${config.method} ${url} - Success`);
            return data;

        } catch (error) {
            if (error.name === 'AbortError') {
                console.error(`⏰ API ${config.method} ${url} - Timeout`);
                throw new Error('Request timeout');
            }
            console.error(`❌ API ${config.method} ${url} - Error:`, error.message);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        let url = endpoint;
        
        // Add query parameters
        if (Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams(params);
            url += `?${searchParams.toString()}`;
        }
        
        return this.request(url, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * PATCH request
     */
    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * Upload file
     */
    async upload(endpoint, formData) {
        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type for FormData, let browser set it
                ...(window.getAuthHeaders ? window.getAuthHeaders() : {}),
                'Content-Type': undefined
            }
        });
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await this.get('/health');
            console.log('✅ API Health Check - OK');
            return response;
        } catch (error) {
            console.error('❌ API Health Check - Failed:', error.message);
            throw error;
        }
    }

    /**
     * Set base URL
     */
    setBaseURL(url) {
        this.baseURL = url;
        console.log('🔧 API Base URL updated:', url);
    }

    /**
     * Set timeout
     */
    setTimeout(ms) {
        this.timeout = ms;
        console.log('⏰ API Timeout updated:', ms);
    }
}

// Export singleton instance
const apiService = new ApiService();
window.apiService = apiService;