// Main application - Direct JavaScript (no modules)

// ============================================================================
// ENHANCED LOGGER - Production Ready
// ============================================================================
class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
    }
    
    log(type, message, data = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            type,
            message,
            data
        };
        
        this.logs.push(entry);
        
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${emoji} [${type.toUpperCase()}]`, message, data || '');
    }
    
    error(message, data) { this.log('error', message, data); }
    success(message, data) { this.log('success', message, data); }
    info(message, data) { this.log('info', message, data); }
    warn(message, data) { this.log('warning', message, data); }
    
    getLogs() { return this.logs; }
    
    exportLogs() {
        console.table(this.logs);
        return JSON.stringify(this.logs, null, 2);
    }
    
    clear() {
        this.logs = [];
        this.info('Logs cleared');
    }
}

// ============================================================================
// AUTHENTICATION MANAGER
// ============================================================================
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.isDemo = true;
        
        // Try to restore session
        this.restoreSession();
    }

    restoreSession() {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
                this.currentRole = this.currentUser.role;
                logger.info('Session restored', this.currentUser);
            }
        } catch (error) {
            logger.warn('Failed to restore session:', error);
        }
    }

    getSampleUser(role, username = null) {
        // Convert username to display name (e.g., john.smith -> John Smith)
        const displayName = username ? 
            username.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') :
            this.getDefaultName(role);
            
        const email = username ? `${username}.${role}@elara.tech` : `${role}@elaratech.com`;
        
        const departments = {
            ceo: 'Executive',
            admin: 'IT',
            hr: 'Human Resources',
            manager: 'Engineering',
            employee: 'Engineering'
        };
        
        const positions = {
            ceo: 'Chief Executive Officer',
            admin: 'System Administrator',
            hr: 'HR Manager',
            manager: 'Project Manager',
            employee: 'Software Engineer'
        };
        
        return {
            id: Math.floor(Math.random() * 1000) + 1,
            email: email,
            name: displayName,
            role: role,
            department: departments[role] || 'General',
            position: positions[role] || 'Employee',
            username: username || role
        };
    }
    
    getDefaultName(role) {
        const defaultNames = {
            ceo: 'Alex Johnson',
            admin: 'IT Admin',
            hr: 'Sarah Williams',
            manager: 'Michael Brown',
            employee: 'John Doe'
        };
        
        return defaultNames[role] || 'User';
    }

    async login(email, password) {
        logger.info('Login attempt', { email });
        
        if (!email || !password) {
            throw new Error('Please enter email and password');
        }

        // Generate email candidates to try (original + swapped domain)
        const emailCandidates = [email];
        if (typeof email === 'string') {
            if (email.endsWith('@elara.tech')) emailCandidates.push(email.replace('@elara.tech', '@elaratech.com'));
            if (email.endsWith('@elaratech.com')) emailCandidates.push(email.replace('@elaratech.com', '@elara.tech'));
        }

        // Try both authentication methods with proper fallback
        const methods = [
            { name: 'demo', fn: this.demoApiLogin.bind(this) },
            { name: 'real', fn: this.realApiLogin.bind(this) }
        ];

        let lastError = null;
        for (const candidate of emailCandidates) {
            for (const method of methods) {
                try {
                    logger.info(`Attempting ${method.name} login...`, { candidate });
                    const response = await method.fn(candidate, password);
                    if (response && response.success && response.token) {
                        this.storeAuthData(response, method.name);
                        logger.success(`${method.name} login successful`);
                        return response.user;
                    }
                } catch (err) {
                    lastError = err;
                    logger.warn(`${method.name} login failed`, err.message);
                }
            }
        }

        throw new Error(lastError?.message || 'Login failed. Please check your credentials.');
    }

    async realApiLogin(email, password) {
        try {
            const response = await window.apiService.post('/auth/login', { email, password });
            if (!response || !response.success) {
                throw new Error(response?.error || 'Real API login failed');
            }
            return response;
        } catch (err) {
            // If using elara.tech, retry with elaratech.com for backward compatibility
            if (typeof email === 'string' && email.endsWith('@elara.tech')) {
                const fallbackEmail = email.replace('@elara.tech', '@elaratech.com');
                const response = await window.apiService.post('/auth/login', { email: fallbackEmail, password });
                if (!response || !response.success) {
                    throw new Error(response?.error || 'Real API login failed');
                }
                return response;
            }
            throw err;
        }
    }

    async demoApiLogin(email, password) {
        try {
            const response = await window.apiService.post('/auth/demo/login', { email, password });
            if (!response || !response.success) {
                throw new Error(response?.error || 'Demo API login failed');
            }
            return response;
        } catch (err) {
            if (typeof email === 'string' && email.endsWith('@elara.tech')) {
                const fallbackEmail = email.replace('@elara.tech', '@elaratech.com');
                const response = await window.apiService.post('/auth/demo/login', { email: fallbackEmail, password });
                if (!response || !response.success) {
                    throw new Error(response?.error || 'Demo API login failed');
                }
                return response;
            }
            throw err;
        }
    }

    storeAuthData(response, authMethod) {
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('username', response.user.name || response.user.username || 'User');
        localStorage.setItem('authMethod', authMethod);
        
        // Update current state
        this.currentUser = response.user;
        this.currentRole = response.user.role;
        this.currentUsername = response.user.name || response.user.username || 'User';
        
        logger.success('Authentication data stored', { 
            email: response.user.email, 
            user: this.currentUsername, 
            role: this.currentRole,
            method: authMethod,
            token: response.token.substring(0, 20) + '...'
        });
    }

    async logout() {
        logger.info('Logging out');
        
        this.currentUser = null;
        this.currentRole = null;
        this.currentUsername = null;
        
        // Clear all authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        localStorage.removeItem('authMethod');
        localStorage.removeItem('apiUser');
        
        logger.success('Logout complete - all auth data cleared');
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentRole() {
        return this.currentRole;
    }

    setRole(role) {
        logger.info('Setting role:', role);
        this.currentRole = role;
    }

    getUserMenuItems() {
        const items = menuItems[this.currentRole] || menuItems.employee || [];
        logger.info('Getting menu items for role:', this.currentRole, items);
        return items;
    }

    isAuthenticated() {
        return !!(this.currentUser && this.currentRole);
    }
}

// ============================================================================
// DASHBOARD MANAGER
// ============================================================================
class DashboardManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.currentContent = null;
        logger.info('DashboardManager initialized');
    }

    updateUI() {
        try {
            const currentUser = this.authManager.getCurrentUser();
            const currentRole = this.authManager.getCurrentRole();

            if (!currentUser || !currentRole) {
                throw new Error('No user or role available');
            }

            logger.info('Updating dashboard UI', { user: currentUser.name, role: currentRole });

            // Update dashboard title
            const titleElement = document.getElementById('dashboardTitle');
            if (titleElement) {
                titleElement.textContent = `${currentRole.toUpperCase()} Dashboard`;
            }
            
            // Update user info
            const userNameElement = document.getElementById('userName');
            const userRoleElement = document.getElementById('userRole');
            const userAvatarElement = document.getElementById('userAvatar');

            if (userNameElement) userNameElement.textContent = currentUser.name;
            if (userRoleElement) userRoleElement.textContent = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
            if (userAvatarElement) {
                const initials = currentUser.name.split(' ').map(n => n[0]).join('');
                userAvatarElement.textContent = initials;
            }
            
            // Update sidebar menu
            this.updateSidebarMenu();
            
            // Update notifications
            this.updateNotifications();
            
            // Update mini calendar
            this.updateMiniCalendar();

            logger.success('Dashboard UI updated successfully');
        } catch (error) {
            logger.error('Failed to update dashboard UI:', error);
            throw error;
        }
    }

    updateSidebarMenu() {
        const sidebarMenu = document.getElementById('sidebarMenu');
        if (!sidebarMenu) {
            logger.warn('Sidebar menu element not found');
            return;
        }

        sidebarMenu.innerHTML = '';
        
        const menuItemsList = this.authManager.getUserMenuItems();
        logger.info('Loading menu items', { count: menuItemsList.length });
        
        menuItemsList.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.innerHTML = `<i class="${item.icon}"></i> ${item.name}`;
            a.dataset.page = item.id;
            
            a.addEventListener('click', async (e) => {
                e.preventDefault();
                logger.info('Menu item clicked:', item.id);
                
                await this.loadContent(item.id);
                
                // Update active state
                document.querySelectorAll('.sidebar-menu a').forEach(link => {
                    link.classList.remove('active');
                });
                a.classList.add('active');
            });
            
            li.appendChild(a);
            sidebarMenu.appendChild(li);
        });
        
        // Set home menu item as active
        const homeLink = sidebarMenu.querySelector('a[data-page="home"]');
        if (homeLink) {
            homeLink.classList.add('active');
        }

        logger.success('Sidebar menu updated');
    }

    updateNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        if (!notificationsList) return;

        notificationsList.innerHTML = '';
        
        const recentNotifications = sampleData.announcements.slice(0, 3);
        
        recentNotifications.forEach(announcement => {
            const div = document.createElement('div');
            div.className = `notification-item ${announcement.type || ''} ${announcement.priority || ''}`;
            div.style.padding = '0.75rem';
            div.style.borderBottom = '1px solid var(--border-color)';
            div.style.borderRadius = '6px';
            div.style.marginBottom = '0.5rem';
            
            // Add special styling for event notifications
            if (announcement.type === 'event') {
                div.style.borderLeft = '4px solid var(--accent-primary)';
                div.style.background = 'var(--primary-light)';
                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                        <h4 style="margin: 0; color: var(--accent-primary); font-size: 0.9rem;">
                            <i class="fas fa-calendar-alt"></i> ${announcement.title}
                        </h4>
                        <span style="background: var(--accent-primary); color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.6rem; font-weight: 600;">
                            ${announcement.priority?.toUpperCase() || 'EVENT'}
                        </span>
                    </div>
                    <p style="font-size: 0.8rem; margin-bottom: 0.3rem; color: var(--text-muted);">${announcement.content.substring(0, 80)}...</p>
                    <small style="color: var(--accent-primary); font-size: 0.7rem;">
                        <i class="fas fa-clock"></i> ${announcement.date}
                        ${announcement.eventDate ? `<br><i class="fas fa-calendar"></i> Event: ${announcement.eventDate} at ${announcement.eventTime}` : ''}
                    </small>
                `;
            } else {
                div.innerHTML = `
                    <h4 style="margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.9rem;">${announcement.title}</h4>
                    <p style="font-size: 0.8rem; margin-bottom: 0.3rem; color: var(--text-muted);">${announcement.content.substring(0, 50)}...</p>
                    <small style="color: var(--accent-primary); font-size: 0.7rem;">${announcement.date}</small>
                `;
            }
            
            notificationsList.appendChild(div);
        });

        logger.success('Notifications updated');
    }

    updateMiniCalendar() {
        const miniCalendar = document.getElementById('miniCalendar');
        if (!miniCalendar) return;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        
        const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
        
        miniCalendar.innerHTML = `
            <div class="mini-calendar-header">
                <h4>${monthNames[currentMonth]} ${currentYear}</h4>
            </div>
            <div class="mini-calendar-weekdays">
                ${dayNames.map(day => `<div class="mini-weekday">${day}</div>`).join('')}
            </div>
            <div class="mini-calendar-dates" id="miniCalendarDates">
            </div>
            <div class="mini-calendar-today">
                <div class="today-info">
                    <span class="today-day">${today.getDate()}</span>
                    <span class="today-month">${monthNames[currentMonth].substring(0, 3)}</span>
                </div>
            </div>
        `;
        
        const calendarDates = document.getElementById('miniCalendarDates');
        
        if (!calendarDates) {
            logger.error('miniCalendarDates element not found!');
            return;
        }
        
        logger.info('Calendar dates container found, adding dates...');
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'mini-date empty';
            calendarDates.appendChild(emptyCell);
            logger.info(`Added empty cell ${i}`);
        }
        
        // Add cells for each day of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateCell = document.createElement('div');
            dateCell.className = 'mini-date';
            dateCell.textContent = day;
            
            // Check if today
            if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                dateCell.classList.add('today');
                logger.info(`Today is: ${day}`);
            }
            
            // Add click handler
            dateCell.addEventListener('click', () => {
                logger.info(`Selected date: ${day}/${currentMonth + 1}/${currentYear}`);
            });
            
            calendarDates.appendChild(dateCell);
        }
        
        logger.info(`Total dates added: ${calendarDates.children.length}`);
        logger.info('Calendar grid should now be 7 columns wide');
        
        // Force a reflow to ensure CSS is applied
        setTimeout(() => {
            const computedStyle = window.getComputedStyle(calendarDates);
            logger.info(`Grid template columns: ${computedStyle.gridTemplateColumns}`);
            logger.info(`Display: ${computedStyle.display}`);
        }, 100);

        logger.success('Mini calendar updated');
    }

    // Quick Actions removed - functionality moved to main content areas

    // Quick Actions functionality removed

    updateSidebarVisibility(page) {
        const notificationsCard = document.getElementById('notificationsCard');
        const calendarCard = document.getElementById('calendarCard');
        
        if (notificationsCard && calendarCard) {
            if (page === 'home' || !page) {
                // Show notifications and calendar only on home page
                notificationsCard.style.display = 'block';
                calendarCard.style.display = 'block';
                logger.info('Sidebar cards shown for home page');
            } else {
                // Hide notifications and calendar on other pages
                notificationsCard.style.display = 'none';
                calendarCard.style.display = 'none';
                logger.info('Sidebar cards hidden for page:', page);
            }
        }
    }

    async loadContent(page) {
        try {
            logger.info('Loading content:', page);
            
            // Update sidebar visibility based on current page
            this.updateSidebarVisibility(page);
            
            const currentUser = this.authManager.getCurrentUser();
            const currentRole = this.authManager.getCurrentRole();

            if (!currentUser || !currentRole) {
                throw new Error('User not authenticated');
            }

            this.currentContent = page;

            switch(page) {
                case 'home':
                    await this.loadHomeContent(currentUser);
                    break;
                case 'employees':
                    this.loadEmployeesContent();
                    break;
                case 'projects':
                    this.loadProjectsContent();
                    break;
                case 'tasks':
                    this.loadTasksContent();
                    break;
                case 'leaves':
                    this.loadLeavesContent();
                    break;
                case 'attendance':
                    this.loadAttendanceContent();
                    break;
                case 'payroll':
                    this.loadPayrollContent();
                    break;
                case 'reports':
                    this.loadReportsContent();
                    break;
                case 'calendar':
                    this.loadFullCalendarContent();
                    break;
                case 'notifications':
                    this.loadNotificationsContent();
                    break;
                case 'overview':
                    this.loadCompanyOverviewContent();
                    break;
                default:
                    this.loadDefaultContent(page);
            }

            logger.success('Content loaded:', page);
        } catch (error) {
            logger.error('Failed to load content:', error);
            this.showErrorContent(page, error);
        }
    }

    async loadHomeContent(currentUser) {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        // Fetch real-time data from database
        const employeeCount = await this.getRealEmployeeCount();
        const projectCount = await this.getRealProjectCount();
        const taskCount = await this.getRealTaskCount();
        const leaveCount = await this.getRealLeaveCount();
        
        // Fetch recent activities
        const recentActivities = await this.getRecentActivities();

        mainContent.innerHTML = `
            <div class="welcome-section">
                <h2>Welcome back, ${currentUser.name}!</h2>
                <p>Here's your dashboard overview for today.</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-users fa-2x"></i>
                    <div class="stat-value">${employeeCount}</div>
                    <div class="stat-label">Total Employees</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-project-diagram fa-2x"></i>
                    <div class="stat-value">${projectCount}</div>
                    <div class="stat-label">Active Projects</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-tasks fa-2x"></i>
                    <div class="stat-value">${taskCount}</div>
                    <div class="stat-label">Pending Tasks</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-calendar-check fa-2x"></i>
                    <div class="stat-value">${leaveCount}</div>
                    <div class="stat-label">Leave Requests</div>
                </div>
            </div>
            
            <div class="recent-activity">
                <h3>Recent Activity</h3>
                <div class="activity-list">
                    ${recentActivities.map(activity => `
                        <div class="activity-item">
                            <i class="${activity.icon}"></i>
                            <span>${activity.message}</span>
                            <small>${activity.timeAgo}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async loadEmployeesContent() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        try {
            // Fetch employees from database
            const employees = await this.fetchEmployees();
            
            mainContent.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">Employee Management</h3>
                    <button class="btn btn-primary" onclick="showAddEmployeeModal()">
                        <i class="fas fa-plus"></i> Add Employee
                    </button>
                </div>
                <div class="employee-controls">
                    <div class="search-filter-bar">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" id="employeeSearch" placeholder="Search employees..." onkeyup="filterEmployees()">
                        </div>
                        <div class="filter-controls">
                            <select id="departmentFilter" onchange="filterEmployees()">
                                <option value="">All Departments</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Sales">Sales</option>
                                <option value="Human Resources">Human Resources</option>
                                <option value="Finance">Finance</option>
                                <option value="Operations">Operations</option>
                                <option value="Executive">Executive</option>
                                <option value="Administration">Administration</option>
                            </select>
                            <select id="statusFilter" onchange="filterEmployees()">
                                <option value="">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="On Leave">On Leave</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="employeeTableBody">
                            ${employees.map(emp => {
                                const currentUserRole = localStorage.getItem('userRole') || 'employee';
                                const targetUserRole = emp.role || 'employee';
                                const canEdit = canManageUser(currentUserRole, targetUserRole, 'edit');
                                const canDelete = canManageUser(currentUserRole, targetUserRole, 'delete');
                                
                                return `
                                <tr data-employee-id="${emp._id}">
                                    <td>${emp.employeeId || 'N/A'}</td>
                                    <td>
                                        <div class="employee-name-cell">
                                            ${emp.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td>${emp.department || 'N/A'}</td>
                                    <td><span class="role-badge role-${targetUserRole}">${targetUserRole.toUpperCase()}</span></td>
                                    <td><span class="status-badge status-${(emp.status || 'active').toLowerCase()}">${emp.status || 'Active'}</span></td>
                                    <td class="actions">
                                        <button class="btn-action btn-primary" onclick="viewEmployee('${emp._id}')" title="View Details">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        ${canEdit ? `
                                            <button class="btn-action btn-success" onclick="editEmployee('${emp._id}')" title="Edit Employee">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        ` : `
                                            <button class="btn-action btn-secondary disabled" title="Cannot edit ${targetUserRole}" disabled>
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        `}
                                        ${canDelete ? `
                                            <button class="btn-action btn-danger" onclick="deleteEmployee('${emp._id}', '${emp.name}')" title="Delete Employee">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        ` : `
                                            <button class="btn-action btn-secondary disabled" title="Cannot delete ${targetUserRole}" disabled>
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        `}
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            // Store employees globally for filtering
            window.allEmployees = employees;
            
            logger.success('Employee management loaded with ' + employees.length + ' employees');
            
        } catch (error) {
            logger.error('Failed to load employees:', error);
            mainContent.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">Employee Management</h3>
                    <button class="btn btn-primary" onclick="showAddEmployeeModal()">
                        <i class="fas fa-plus"></i> Add Employee
                    </button>
                </div>
                <div class="error-container">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <h3>Failed to Load Employees</h3>
                    <p>Unable to fetch employee data. Please check your connection and try again.</p>
                    <button class="btn btn-primary" onclick="dashboardManager.loadEmployeesContent()">
                        <i class="fas fa-retry"></i> Retry
                    </button>
                </div>
            `;
        }
    }

    async fetchEmployees() {
        const token = localStorage.getItem('token');
        
        // Prefer real API when token exists; fallback to demo; finally to local/sample
        if (token) {
            try {
                logger.info('Fetching employees from real MongoDB API');
                const response = await window.apiService.get('/users', { t: Date.now() });
                if (response && response.data) {
                    const employees = Array.isArray(response.data) ? response.data : [response.data];
                    window.allEmployees = employees;
                    logger.success('Fetched employees from MongoDB API:', employees.length);
                    return employees;
                }
            } catch (error) {
                logger.warn('Real API fetch failed, trying demo:', error.message);
            }
        }
        try {
            logger.info('Fetching employees from demo API');
            const response = await window.apiService.get('/users/demo', { t: Date.now() });
            if (response && response.data) {
                const employees = Array.isArray(response.data) ? response.data : [response.data];
                window.allEmployees = employees;
                logger.success('Fetched employees from demo API:', employees.length);
                return employees;
            }
        } catch (error) {
            logger.warn('Demo API fetch failed:', error.message);
        }
        
        // Use local employees if available, otherwise fallback to sample data
        if (window.allEmployees && window.allEmployees.length > 0) {
            logger.info('Using local employees:', window.allEmployees.length);
            return window.allEmployees;
        }
        
        // Fallback to sample data if no local data
        const employees = sampleData.employees || [];
        window.allEmployees = employees;
        logger.info('Using sample data:', employees.length);
        return employees;
    }

    // Helper functions for real-time dashboard stats
    async getRealEmployeeCount() {
        try {
            const employees = await this.fetchEmployees();
            return employees.length;
        } catch (error) {
            logger.warn('Failed to get employee count:', error.message);
            return window.allEmployees?.length || sampleData.employees.length;
        }
    }

    async getRealProjectCount() {
        try {
            const response = await window.apiService.get('/projects');
            if (response && response.data) {
                const projects = Array.isArray(response.data) ? response.data : [response.data];
                return projects.length;
            }
        } catch (error) {
            logger.warn('Failed to get project count:', error.message);
        }
        return sampleData.projects.length;
    }

    async getRealTaskCount() {
        try {
            const response = await window.apiService.get('/tasks');
            if (response && response.data) {
                const tasks = Array.isArray(response.data) ? response.data : [response.data];
                return tasks.filter(task => task.status === 'pending').length;
            }
        } catch (error) {
            logger.warn('Failed to get task count:', error.message);
        }
        return sampleData.tasks.filter(task => task.status === 'pending').length;
    }

    async getRealLeaveCount() {
        try {
            const response = await window.apiService.get('/leaves');
            if (response && response.data) {
                const leaves = Array.isArray(response.data) ? response.data : [response.data];
                return leaves.filter(leave => leave.status === 'pending').length;
            }
        } catch (error) {
            logger.warn('Failed to get leave count:', error.message);
        }
        return sampleData.leaveRequests.filter(leave => leave.status === 'pending').length;
    }

    async getRecentActivities() {
        try {
            logger.info('Fetching recent activities...');
            
            // Fetch recent data from APIs
            const [employees, projects, payrolls] = await Promise.all([
                this.fetchEmployees(),
                this.fetchProjects(),
                this.fetchPayrolls()
            ]);
            
            const activities = [];
            
            // Get recent employees (last 3)
            const recentEmployees = employees
                .filter(emp => emp.createdAt || emp._id)
                .sort((a, b) => {
                    const dateA = new Date(a.createdAt || a._id);
                    const dateB = new Date(b.createdAt || b._id);
                    return dateB - dateA;
                })
                .slice(0, 2);
            
            recentEmployees.forEach(emp => {
                const role = emp.role || 'employee';
                const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
                activities.push({
                    icon: 'fas fa-user-plus',
                    message: `New ${roleDisplay} ${emp.name} joined the team`,
                    timeAgo: this.getTimeAgo(emp.createdAt || emp._id),
                    timestamp: new Date(emp.createdAt || emp._id)
                });
            });
            
            // Get recent projects (last 1)
            const recentProjects = projects
                .filter(proj => proj.createdAt || proj._id)
                .sort((a, b) => {
                    const dateA = new Date(a.createdAt || a._id);
                    const dateB = new Date(b.createdAt || b._id);
                    return dateB - dateA;
                })
                .slice(0, 1);
            
            recentProjects.forEach(proj => {
                activities.push({
                    icon: 'fas fa-project-diagram',
                    message: `New project "${proj.name}" created`,
                    timeAgo: this.getTimeAgo(proj.createdAt || proj._id),
                    timestamp: new Date(proj.createdAt || proj._id)
                });
            });
            
            // Sort all activities by timestamp (most recent first)
            activities.sort((a, b) => b.timestamp - a.timestamp);
            
            // Return top 3 activities only
            const topActivities = activities.slice(0, 3);
            
            // If no real activities, return sample activities
            if (topActivities.length === 0) {
                return [
                    {
                        icon: 'fas fa-user-plus',
                        message: 'New Manager John Smith joined the team',
                        timeAgo: '2 hours ago'
                    },
                    {
                        icon: 'fas fa-project-diagram',
                        message: 'New project "Website Redesign" created',
                        timeAgo: '4 hours ago'
                    },
                    {
                        icon: 'fas fa-user-plus',
                        message: 'New Employee Jane Doe joined the team',
                        timeAgo: '1 day ago'
                    }
                ];
            }
            
            logger.success('Fetched recent activities:', topActivities.length);
            return topActivities;
            
        } catch (error) {
            logger.warn('Failed to fetch recent activities:', error.message);
            
            // Return sample activities as fallback
            return [
                {
                    icon: 'fas fa-user-plus',
                    message: 'New Manager John Smith joined the team',
                    timeAgo: '2 hours ago'
                },
                {
                    icon: 'fas fa-project-diagram',
                    message: 'New project "Website Redesign" created',
                    timeAgo: '4 hours ago'
                },
                {
                    icon: 'fas fa-user-plus',
                    message: 'New Employee Jane Doe joined the team',
                    timeAgo: '1 day ago'
                }
            ];
        }
    }

    getTimeAgo(dateString) {
        if (!dateString) return 'Recently';
        
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            const months = Math.floor(diffInSeconds / 2592000);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        }
    }

    async loadProjectsContent() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        // Show loading state
        mainContent.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">Project Management</h3>
                <button class="btn btn-primary" onclick="showAddProjectModal()">
                    <i class="fas fa-plus"></i> Add Project
                </button>
            </div>
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading projects...</p>
            </div>
        `;

        try {
            // Fetch projects from API
            const projects = await this.fetchProjects();
            
            // Render projects table
            this.renderProjectsTable(projects);
            
        } catch (error) {
            logger.error('Failed to load projects:', error);
            this.showProjectsError(error);
        }
    }

    async fetchProjects() {
        try {
            logger.info('Fetching projects from API...');
            const response = await window.apiService.get('/projects');
            
            if (response && response.data) {
                const projects = Array.isArray(response.data) ? response.data : [response.data];
                logger.success('Fetched projects from API:', projects.length);
                return projects;
            }
        } catch (error) {
            logger.warn('API fetch failed, using sample data:', error.message);
        }
        
        // Fallback to sample data
        return sampleData.projects || [];
    }

    renderProjectsTable(projects) {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">Project Management</h3>
                <button class="btn btn-primary" onclick="showAddProjectModal()">
                    <i class="fas fa-plus"></i> Add Project
                </button>
            </div>
            
            <div class="project-controls">
                <div class="search-filter-bar">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="projectSearch" placeholder="Search projects..." onkeyup="filterProjects()">
                    </div>
                    <div class="filter-controls">
                        <select id="departmentFilter" onchange="filterProjects()">
                            <option value="">All Departments</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales">Sales</option>
                            <option value="Human Resources">Human Resources</option>
                            <option value="Finance">Finance</option>
                            <option value="Operations">Operations</option>
                        </select>
                        <select id="statusFilter" onchange="filterProjects()">
                            <option value="">All Status</option>
                            <option value="Planning">Planning</option>
                            <option value="In Progress">In Progress</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Progress</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="projectTableBody">
                        ${projects.map(project => this.renderProjectRow(project)).join('')}
                    </tbody>
                </table>
            </div>
            
            ${projects.length === 0 ? `
                <div class="empty-state">
                    <i class="fas fa-project-diagram"></i>
                    <h3>No Projects Found</h3>
                    <p>Start by creating your first project.</p>
                    <button class="btn btn-primary" onclick="showAddProjectModal()">
                        <i class="fas fa-plus"></i> Add Project
                    </button>
                </div>
            ` : ''}
        `;

        // Store projects globally for filtering
        window.allProjects = projects;
    }

    renderProjectRow(project) {
        const projectId = project._id || project.id;
        const statusClass = (project.status || 'Planning').toLowerCase().replace(/\s+/g, '-');
        
        return `
            <tr data-project-id="${projectId}">
                <td>${projectId.slice(-6)}</td>
                <td>
                    <div class="project-name-cell">
                        <strong>${project.name || 'Unnamed Project'}</strong>
                        ${project.description ? `<small>${project.description.substring(0, 50)}${project.description.length > 50 ? '...' : ''}</small>` : ''}
                    </div>
                </td>
                <td>${project.department || 'N/A'}</td>
                <td><span class="status-badge status-${statusClass}">${project.status || 'Planning'}</span></td>
                <td><span class="priority-badge priority-${(project.priority || 'Medium').toLowerCase()}">${project.priority || 'Medium'}</span></td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
                        <span class="progress-text">${project.progress || 0}%</span>
                    </div>
                </td>
                <td class="actions">
                    <button class="btn-action btn-primary" onclick="viewProject('${projectId}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-success" onclick="editProject('${projectId}')" title="Edit Project">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-danger" onclick="deleteProject('${projectId}', '${project.name}')" title="Delete Project">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    showProjectsError(error) {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to Load Projects</h3>
                <p>Unable to fetch projects. Please check your connection and try again.</p>
                <button class="btn btn-primary" onclick="dashboardManager.loadProjectsContent()">
                    <i class="fas fa-refresh"></i> Retry
                </button>
            </div>
        `;
    }

    loadTasksContent() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">Task Management</h3>
                <button class="btn btn-primary" onclick="alert('Add Task (Backend integration needed)')">
                    <i class="fas fa-plus"></i> Add Task
                </button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Assignee</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sampleData.tasks.map(task => `
                            <tr>
                                <td>${task.id}</td>
                                <td>${task.title}</td>
                                <td>${task.assignee}</td>
                                <td>${task.dueDate}</td>
                                <td><span class="status status-${task.status.toLowerCase()}">${task.status}</span></td>
                                <td><span class="priority priority-${task.priority.toLowerCase()}">${task.priority}</span></td>
                                <td class="actions">
                                    <button class="btn-action btn-primary" onclick="alert('View Task: ${task.title}')" title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-action btn-success" onclick="alert('Edit Task: ${task.title}')" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-action btn-danger" onclick="alert('Delete Task: ${task.title}')" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    loadLeavesContent() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">Leave Management</h3>
                <button class="btn btn-primary" onclick="alert('Request Leave (Backend integration needed)')">
                    <i class="fas fa-plus"></i> Request Leave
                </button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Employee</th>
                            <th>Type</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Days</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sampleData.leaveRequests.map(leave => `
                            <tr>
                                <td>${leave.id}</td>
                                <td>${leave.employee}</td>
                                <td>${leave.type}</td>
                                <td>${leave.startDate}</td>
                                <td>${leave.endDate}</td>
                                <td>${leave.days}</td>
                                <td><span class="status status-${leave.status}">${leave.status}</span></td>
                                <td class="actions">
                                    <button class="btn-action btn-primary" onclick="alert('View Leave: ${leave.employee}')" title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    ${leave.status === 'pending' ? `
                                        <button class="btn-action btn-success" onclick="alert('Approve Leave: ${leave.employee}')" title="Approve">
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button class="btn-action btn-danger" onclick="alert('Reject Leave: ${leave.employee}')" title="Reject">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    loadAttendanceContent() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        const attendanceData = [
            { id: 1, employee: "John Doe", date: "2024-01-15", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "Present", hours: "9.0" },
            { id: 2, employee: "Jane Smith", date: "2024-01-15", checkIn: "08:45 AM", checkOut: "05:45 PM", status: "Present", hours: "9.0" },
            { id: 3, employee: "Mike Johnson", date: "2024-01-15", checkIn: "09:30 AM", checkOut: "06:30 PM", status: "Late", hours: "9.0" },
            { id: 4, employee: "Emily Davis", date: "2024-01-15", checkIn: "-", checkOut: "-", status: "Absent", hours: "0" }
        ];

        mainContent.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">Attendance Tracking</h3>
                <button class="btn btn-primary" onclick="alert('Mark Attendance (Backend integration needed)')">
                    <i class="fas fa-plus"></i> Mark Attendance
                </button>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-user-check fa-2x"></i>
                    <div class="stat-value">${attendanceData.filter(a => a.status === 'Present' || a.status === 'Late').length}</div>
                    <div class="stat-label">Present</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-user-times fa-2x"></i>
                    <div class="stat-value">${attendanceData.filter(a => a.status === 'Absent').length}</div>
                    <div class="stat-label">Absent</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-user-clock fa-2x"></i>
                    <div class="stat-value">${attendanceData.filter(a => a.status === 'Late').length}</div>
                    <div class="stat-label">Late</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-percentage fa-2x"></i>
                    <div class="stat-value">${Math.round((attendanceData.filter(a => a.status === 'Present' || a.status === 'Late').length / attendanceData.length) * 100)}%</div>
                    <div class="stat-label">Attendance Rate</div>
                </div>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Employee</th>
                            <th>Date</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Hours</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${attendanceData.map(att => `
                            <tr>
                                <td>${att.id}</td>
                                <td>${att.employee}</td>
                                <td>${att.date}</td>
                                <td>${att.checkIn}</td>
                                <td>${att.checkOut}</td>
                                <td>${att.hours}h</td>
                                <td><span class="status ${att.status === 'Present' ? 'status-approved' : att.status === 'Absent' ? 'status-rejected' : 'status-pending'}">${att.status}</span></td>
                                <td class="actions">
                                    <button class="btn-action btn-primary" onclick="alert('View Attendance: ${att.employee}')" title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-action btn-success" onclick="alert('Edit Attendance: ${att.employee}')" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    async loadPayrollContent() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        // Show loading state
        mainContent.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">Payroll Management</h3>
                <button class="btn btn-primary" onclick="showProcessPayrollModal()">
                    <i class="fas fa-calculator"></i> Process Payroll
                </button>
            </div>
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading payroll records...</p>
            </div>
        `;

        try {
            // Fetch payroll records and employees from API
            const [payrolls, employees] = await Promise.all([
                this.fetchPayrolls(),
                this.fetchEmployees()
            ]);
            
            // Render payroll table
            this.renderPayrollTable(payrolls, employees);
            
        } catch (error) {
            logger.error('Failed to load payroll:', error);
            this.showPayrollError(error);
        }
    }

    async fetchPayrolls() {
        try {
            logger.info('Fetching payroll records from API...');
            const response = await window.apiService.get('/payroll');
            
            if (response && response.data) {
                const payrolls = Array.isArray(response.data) ? response.data : [response.data];
                logger.success('Fetched payroll records from API:', payrolls.length);
                return payrolls;
            }
        } catch (error) {
            logger.warn('API fetch failed, using sample data:', error.message);
        }
        
        // Fallback to sample data
        return sampleData.payroll || [];
    }

    renderPayrollTable(payrolls, employees) {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">Payroll Management</h3>
                <button class="btn btn-primary" onclick="showProcessPayrollModal()">
                    <i class="fas fa-calculator"></i> Process Payroll
                </button>
            </div>
            
            <div class="payroll-controls">
                <div class="search-filter-bar">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="payrollSearch" placeholder="Search payroll records..." onkeyup="filterPayrolls()">
                    </div>
                    <div class="filter-controls">
                        <select id="employeeFilter" onchange="filterPayrolls()">
                            <option value="">All Employees</option>
                            ${employees.map(emp => `
                                <option value="${emp._id || emp.id}">${emp.name}</option>
                            `).join('')}
                        </select>
                        <select id="statusFilter" onchange="filterPayrolls()">
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Processed">Processed</option>
                            <option value="Paid">Paid</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <select id="monthFilter" onchange="filterPayrolls()">
                            <option value="">All Months</option>
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Base Salary</th>
                            <th>Bonus</th>
                            <th>Deductions</th>
                            <th>Net Pay</th>
                            <th>Period</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="payrollTableBody">
                        ${payrolls.map(payroll => this.renderPayrollRow(payroll)).join('')}
                    </tbody>
                </table>
            </div>
            
            ${payrolls.length === 0 ? `
                <div class="empty-state">
                    <i class="fas fa-money-bill-wave"></i>
                    <h3>No Payroll Records Found</h3>
                    <p>Start by processing payroll for your employees.</p>
                    <button class="btn btn-primary" onclick="showProcessPayrollModal()">
                        <i class="fas fa-calculator"></i> Process Payroll
                    </button>
                </div>
            ` : ''}
        `;

        // Store payrolls and employees globally for filtering
        window.allPayrolls = payrolls;
        window.allEmployees = employees;
    }

    renderPayrollRow(payroll) {
        const payrollId = payroll._id || payroll.id;
        const employee = payroll.employee || {};
        const employeeName = employee.name || payroll.employeeName || 'Unknown Employee';
        const department = employee.department || payroll.department || 'N/A';
        const statusClass = (payroll.status || 'Pending').toLowerCase();
        
        const baseSalary = payroll.salary?.baseSalary || payroll.baseSalary || 0;
        const bonus = payroll.salary?.bonus || payroll.bonus || 0;
        // Handle deductions possibly being an object with components
        const rawDeductions = payroll.salary?.deductions ?? payroll.deductions ?? 0;
        const deductions = typeof rawDeductions === 'object' && rawDeductions !== null
            ? (
                (Number(rawDeductions.tax) || 0) +
                (Number(rawDeductions.insurance) || 0) +
                (Number(rawDeductions.providentFund) || 0) +
                (Number(rawDeductions.loan) || 0) +
                (Number(rawDeductions.other) || 0)
              )
            : (Number(rawDeductions) || 0);
        const netPay = payroll.salary?.netPay || payroll.netPay || (baseSalary + bonus - deductions);
        
        const period = payroll.period ? 
            `${this.getMonthName(payroll.period.month)} ${payroll.period.year}` : 
            (payroll.periodString || 'N/A');

        return `
            <tr data-payroll-id="${payrollId}">
                <td>${payrollId.slice(-6)}</td>
                <td>
                    <div class="employee-name-cell">
                        <strong>${employeeName}</strong>
                        <small>${employee.email || ''}</small>
                    </div>
                </td>
                <td>${department}</td>
                <td>₹${baseSalary.toLocaleString()}</td>
                <td>₹${bonus.toLocaleString()}</td>
                <td>₹${deductions.toLocaleString()}</td>
                <td><strong>₹${netPay.toLocaleString()}</strong></td>
                <td>${period}</td>
                <td><span class="status-badge status-${statusClass}">${payroll.status || 'Pending'}</span></td>
                <td class="actions">
                    <button class="btn-action btn-primary" onclick="viewPayroll('${payrollId}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-success" onclick="editPayroll('${payrollId}')" title="Edit Payroll">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-danger" onclick="deletePayroll('${payrollId}', '${employeeName}')" title="Delete Payroll">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    getMonthName(monthNumber) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthNumber - 1] || 'Unknown';
    }

    showPayrollError(error) {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to Load Payroll</h3>
                <p>Unable to fetch payroll records. Please check your connection and try again.</p>
                <button class="btn btn-primary" onclick="dashboardManager.loadPayrollContent()">
                    <i class="fas fa-refresh"></i> Retry
                </button>
            </div>
        `;
    }

    loadReportsContent() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">Reports & Analytics</h3>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-chart-line fa-2x"></i>
                    <div class="stat-value">95%</div>
                    <div class="stat-label">Employee Satisfaction</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-chart-bar fa-2x"></i>
                    <div class="stat-value">87%</div>
                    <div class="stat-label">Project Success Rate</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-clock fa-2x"></i>
                    <div class="stat-value">92%</div>
                    <div class="stat-label">Attendance Rate</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-dollar-sign fa-2x"></i>
                    <div class="stat-value">$2.1M</div>
                    <div class="stat-label">Total Payroll</div>
                </div>
            </div>
            <p style="text-align: center; margin-top: 2rem; color: var(--text-muted);">
                Detailed reports and analytics dashboard (Backend integration needed)
            </p>
        `;
    }

    loadDefaultContent(page) {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="content-card">
                    <h3>${page.charAt(0).toUpperCase() + page.slice(1)}</h3>
                    <p>This section is under development.</p>
                    <p>Available features will be added soon.</p>
                </div>
            `;
        }
    }

    loadFullCalendarContent() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        mainContent.innerHTML = `
            <div class="full-calendar-container">
                <div class="calendar-header">
                    <h2 class="calendar-title">
                        <i class="fas fa-calendar-alt"></i>
                        Company Calendar
                    </h2>
                    <div class="calendar-controls">
                        <button class="btn btn-secondary" id="prevMonth">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <h3 id="currentMonthYear">${monthNames[currentMonth]} ${currentYear}</h3>
                        <button class="btn btn-secondary" id="nextMonth">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <button class="btn btn-primary" id="addEventBtn">
                            <i class="fas fa-plus"></i> Add Event
                        </button>
                    </div>
                </div>
                
                <div class="full-calendar-grid">
                    <div class="calendar-weekdays">
                        <div class="weekday">Sunday</div>
                        <div class="weekday">Monday</div>
                        <div class="weekday">Tuesday</div>
                        <div class="weekday">Wednesday</div>
                        <div class="weekday">Thursday</div>
                        <div class="weekday">Friday</div>
                        <div class="weekday">Saturday</div>
                    </div>
                    <div class="calendar-dates" id="fullCalendarDates">
                        <!-- Calendar dates will be populated here -->
                    </div>
                </div>
                
                <div class="calendar-events">
                    <h4><i class="fas fa-list"></i> Upcoming Events</h4>
                    <div class="events-list">
                        ${sampleData.calendarEvents.map(event => `
                            <div class="event-item">
                                <div class="event-date">
                                    <span class="event-day">${new Date(event.date).getDate()}</span>
                                    <span class="event-month">${monthNames[new Date(event.date).getMonth()].substring(0, 3)}</span>
                                </div>
                                <div class="event-details">
                                    <h5>${event.title}</h5>
                                    <p>${event.description || 'No description available'}</p>
                                </div>
                                <div class="event-type ${event.type || 'meeting'}">
                                    ${event.type || 'Meeting'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this.populateFullCalendar(currentMonth, currentYear);
        this.initializeCalendarControls();
    }

    loadNotificationsContent() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="notifications-container">
                <div class="notifications-header">
                    <h2 class="notifications-title">
                        <i class="fas fa-bell"></i>
                        All Notifications
                    </h2>
                    <div class="notifications-controls">
                        <button class="btn btn-secondary" id="markAllReadBtn">
                            <i class="fas fa-check-double"></i> Mark All Read
                        </button>
                        <button class="btn btn-primary" id="filterNotificationsBtn">
                            <i class="fas fa-filter"></i> Filter
                        </button>
                    </div>
                </div>
                
                <div class="notifications-stats">
                    <div class="stat-item">
                        <span class="stat-number">${sampleData.announcements.length}</span>
                        <span class="stat-label">Total Notifications</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${sampleData.announcements.filter(n => n.type === 'event').length}</span>
                        <span class="stat-label">Event Notifications</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${sampleData.announcements.filter(n => n.priority === 'high').length}</span>
                        <span class="stat-label">High Priority</span>
                    </div>
                </div>
                
                <div class="notifications-list" id="allNotificationsList">
                    <!-- All notifications will be populated here -->
                </div>
            </div>
        `;
        
        this.populateAllNotifications();
        this.initializeNotificationControls();
    }

    populateAllNotifications() {
        const notificationsList = document.getElementById('allNotificationsList');
        if (!notificationsList) return;

        notificationsList.innerHTML = '';
        
        // Sort notifications by date (newest first)
        const sortedNotifications = [...sampleData.announcements].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        if (sortedNotifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="no-notifications">
                    <i class="fas fa-bell-slash fa-3x"></i>
                    <h3>No Notifications</h3>
                    <p>You're all caught up! No notifications to display.</p>
                </div>
            `;
            return;
        }
        
        sortedNotifications.forEach((notification, index) => {
            const notificationCard = document.createElement('div');
            notificationCard.className = `notification-card ${notification.type || ''} ${notification.priority || ''}`;
            
            // Calculate time ago
            const notificationDate = new Date(notification.date);
            const now = new Date();
            const diffTime = Math.abs(now - notificationDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const timeAgo = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
            
            if (notification.type === 'event') {
                notificationCard.innerHTML = `
                    <div class="notification-content">
                        <div class="notification-header">
                            <div class="notification-icon event">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <div class="notification-meta">
                                <h4>${notification.title}</h4>
                                <span class="notification-badge ${notification.priority || 'medium'}">
                                    ${notification.priority?.toUpperCase() || 'EVENT'}
                                </span>
                            </div>
                            <div class="notification-time">
                                <span>${timeAgo}</span>
                                <small>${notification.date}</small>
                            </div>
                        </div>
                        <div class="notification-body">
                            <p>${notification.content}</p>
                            ${notification.eventDate ? `
                                <div class="event-details">
                                    <i class="fas fa-calendar"></i> 
                                    <strong>Event Date:</strong> ${notification.eventDate} at ${notification.eventTime}
                                </div>
                            ` : ''}
                        </div>
                        <div class="notification-actions">
                            <button class="btn-sm btn-primary" onclick="viewEventDetails(${notification.id})">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            <button class="btn-sm btn-secondary" onclick="markAsRead(${notification.id})">
                                <i class="fas fa-check"></i> Mark Read
                            </button>
                        </div>
                    </div>
                `;
            } else {
                notificationCard.innerHTML = `
                    <div class="notification-content">
                        <div class="notification-header">
                            <div class="notification-icon ${notification.priority || 'medium'}">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <div class="notification-meta">
                                <h4>${notification.title}</h4>
                                <span class="notification-badge ${notification.priority || 'medium'}">
                                    ${notification.priority?.toUpperCase() || 'INFO'}
                                </span>
                            </div>
                            <div class="notification-time">
                                <span>${timeAgo}</span>
                                <small>${notification.date}</small>
                            </div>
                        </div>
                        <div class="notification-body">
                            <p>${notification.content}</p>
                        </div>
                        <div class="notification-actions">
                            <button class="btn-sm btn-secondary" onclick="markAsRead(${notification.id})">
                                <i class="fas fa-check"></i> Mark Read
                            </button>
                        </div>
                    </div>
                `;
            }
            
            notificationsList.appendChild(notificationCard);
        });
        
        logger.success('All notifications populated');
    }

    initializeNotificationControls() {
        const markAllReadBtn = document.getElementById('markAllReadBtn');
        const filterBtn = document.getElementById('filterNotificationsBtn');
        
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                alert('Mark All Read functionality - would mark all notifications as read');
                logger.info('Mark all read clicked');
            });
        }
        
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                alert('Filter functionality - would show filter options');
                logger.info('Filter notifications clicked');
            });
        }
        
        logger.success('Notification controls initialized');
    }

    async loadCompanyOverviewContent() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        // Show loading state
        mainContent.innerHTML = `
            <div class="overview-container">
                <div class="overview-header">
                    <h2 class="overview-title">
                        <i class="fas fa-chart-line"></i>
                        Company Overview & Analytics
                    </h2>
                    <div class="overview-controls">
                        <button class="btn btn-secondary" id="exportDataBtn" disabled>
                            <i class="fas fa-download"></i> Export Data
                        </button>
                        <button class="btn btn-primary" id="refreshChartsBtn" disabled>
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                </div>
                
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Loading company analytics...</p>
                </div>
            </div>
        `;

        try {
            // Fetch real data from database
            const overviewData = await this.fetchCompanyOverview();
            
            if (!overviewData) {
                throw new Error('Failed to fetch company data');
            }

            // Render the page with real data
            mainContent.innerHTML = `
                <div class="overview-container">
                    <div class="overview-header">
                        <h2 class="overview-title">
                            <i class="fas fa-chart-line"></i>
                            Company Overview & Analytics
                        </h2>
                        <div class="overview-controls">
                            <button class="btn btn-secondary" id="exportDataBtn">
                                <i class="fas fa-download"></i> Export Data
                            </button>
                            <button class="btn btn-primary" id="refreshChartsBtn">
                                <i class="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                    </div>
                    
                    <!-- Key Metrics Cards -->
                    <div class="metrics-grid">
                        <div class="metric-card revenue">
                            <div class="metric-icon">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                            <div class="metric-info">
                                <h3>$${(overviewData.payroll.monthlyRevenue / 1000).toFixed(0)}K</h3>
                                <p>Monthly Revenue</p>
                                <span class="metric-change positive">Real-time</span>
                            </div>
                        </div>
                        <div class="metric-card projects">
                            <div class="metric-icon">
                                <i class="fas fa-project-diagram"></i>
                            </div>
                            <div class="metric-info">
                                <h3>${overviewData.projects.active}</h3>
                                <p>Active Projects</p>
                                <span class="metric-change ${overviewData.projects.completionRate > 70 ? 'positive' : 'negative'}">${overviewData.projects.completionRate}% Complete</span>
                            </div>
                        </div>
                        <div class="metric-card employees">
                            <div class="metric-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="metric-info">
                                <h3>${overviewData.employees.total}</h3>
                                <p>Team Members</p>
                                <span class="metric-change positive">+${overviewData.employees.newThisMonth} this month</span>
                            </div>
                        </div>
                        <div class="metric-card satisfaction">
                            <div class="metric-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="metric-info">
                                <h3>${overviewData.attendance.percentage}%</h3>
                                <p>Attendance Rate</p>
                                <span class="metric-change ${overviewData.attendance.percentage > 85 ? 'positive' : 'negative'}">Live Data</span>
                            </div>
                        </div>
                    </div>
                
                <!-- Charts Grid -->
                <div class="charts-grid">
                    <!-- Revenue Growth Chart -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3><i class="fas fa-chart-area"></i> Revenue Growth</h3>
                            <span class="chart-period">Last 10 Months</span>
                        </div>
                        <canvas id="revenueChart"></canvas>
                    </div>
                    
                    <!-- Project Status Chart -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3><i class="fas fa-tasks"></i> Project Status</h3>
                            <span class="chart-period">Current Distribution</span>
                        </div>
                        <canvas id="projectStatusChart"></canvas>
                    </div>
                    
                    <!-- Employee Performance Chart -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3><i class="fas fa-user-check"></i> Employee Metrics</h3>
                            <span class="chart-period">Performance Indicators</span>
                        </div>
                        <canvas id="employeeMetricsChart"></canvas>
                    </div>
                    
                    <!-- Budget Allocation Chart -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3><i class="fas fa-chart-pie"></i> Budget Allocation</h3>
                            <span class="chart-period">Department Wise</span>
                        </div>
                        <canvas id="budgetChart"></canvas>
                    </div>
                    
                    <!-- Company Growth Timeline -->
                    <div class="chart-container large">
                        <div class="chart-header">
                            <h3><i class="fas fa-trending-up"></i> Company Growth Timeline</h3>
                            <span class="chart-period">Quarterly Progress</span>
                        </div>
                        <canvas id="growthChart"></canvas>
                    </div>
                    
                    <!-- Task Completion Rate -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3><i class="fas fa-check-circle"></i> Task Completion</h3>
                            <span class="chart-period">Weekly Performance</span>
                        </div>
                        <canvas id="taskChart"></canvas>
                    </div>
                    
                    <!-- Customer Satisfaction Trend -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3><i class="fas fa-smile"></i> Customer Satisfaction</h3>
                            <span class="chart-period">Monthly Trend</span>
                        </div>
                        <canvas id="satisfactionChart"></canvas>
                    </div>
                    
                    <!-- Technology Stack -->
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3><i class="fas fa-code"></i> Technology Stack</h3>
                            <span class="chart-period">Usage Statistics</span>
                        </div>
                        <canvas id="techStackChart"></canvas>
                    </div>
                </div>
            </div>
        `;
        
            await this.initializeRealCharts();
            this.initializeOverviewControls();
            
        } catch (error) {
            logger.error('Failed to load company overview:', error);
            mainContent.innerHTML = `
                <div class="overview-container">
                    <div class="error-container">
                        <i class="fas fa-exclamation-triangle fa-3x"></i>
                        <h3>Failed to Load Analytics</h3>
                        <p>Unable to fetch company data. Please check your connection and try again.</p>
                        <button class="btn btn-primary" onclick="dashboardManager.loadCompanyOverviewContent()">
                            <i class="fas fa-retry"></i> Retry
                        </button>
                    </div>
                </div>
            `;
        }
    }

    async fetchCompanyOverview() {
        try {
            const response = await window.apiService.get('/analytics/overview');
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch company overview:', error);
            return null;
        }
    }

    async fetchRevenueGrowth() {
        try {
            const response = await window.apiService.get('/analytics/revenue-growth');
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch revenue growth:', error);
            return null;
        }
    }

    async fetchProjectStatus() {
        try {
            const response = await window.apiService.get('/analytics/project-status');
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch project status:', error);
            return null;
        }
    }

    async fetchDepartmentDistribution() {
        try {
            const response = await window.apiService.get('/analytics/department-distribution');
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch department distribution:', error);
            return null;
        }
    }

    async fetchEmployeeGrowth() {
        try {
            const response = await window.apiService.get('/analytics/employee-growth');
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch employee growth:', error);
            return null;
        }
    }

    async fetchTaskTrends() {
        try {
            const response = await window.apiService.get('/analytics/task-trends');
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch task trends:', error);
            return null;
        }
    }

    async fetchAttendanceTrends() {
        try {
            const response = await window.apiService.get('/analytics/attendance-trends');
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch attendance trends:', error);
            return null;
        }
    }

    async fetchKPI() {
        try {
            const response = await window.apiService.get('/analytics/kpi');
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch KPI data:', error);
            return null;
        }
    }

    async initializeRealCharts() {
        // Set Chart.js defaults for theme
        Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        Chart.defaults.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
        Chart.defaults.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--card-bg');

        try {
            // Fetch all chart data in parallel
            const [
                revenueData,
                projectData,
                departmentData,
                employeeGrowthData,
                taskTrendsData,
                attendanceData,
                kpiData
            ] = await Promise.all([
                this.fetchRevenueGrowth(),
                this.fetchProjectStatus(),
                this.fetchDepartmentDistribution(),
                this.fetchEmployeeGrowth(),
                this.fetchTaskTrends(),
                this.fetchAttendanceTrends(),
                this.fetchKPI()
            ]);

            // Create charts with real data
            if (revenueData) this.createRealRevenueChart(revenueData);
            if (projectData) this.createRealProjectStatusChart(projectData);
            if (departmentData) this.createRealDepartmentChart(departmentData);
            if (employeeGrowthData) this.createRealEmployeeGrowthChart(employeeGrowthData);
            if (taskTrendsData) this.createRealTaskChart(taskTrendsData);
            if (attendanceData) this.createRealAttendanceChart(attendanceData);
            if (kpiData) this.createRealKPIChart(kpiData);
            
            logger.success('All real-time charts initialized');
        } catch (error) {
            logger.error('Failed to initialize charts:', error);
            // Fallback to sample data if API fails
            this.initializeCharts();
        }
    }

    initializeCharts() {
        // Set Chart.js defaults for theme
        Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        Chart.defaults.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
        Chart.defaults.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--card-bg');

        // Revenue Growth Chart (Line Chart)
        this.createRevenueChart();
        
        // Project Status Chart (Doughnut Chart)
        this.createProjectStatusChart();
        
        // Employee Metrics Chart (Radar Chart)
        this.createEmployeeMetricsChart();
        
        // Budget Allocation Chart (Pie Chart)
        this.createBudgetChart();
        
        // Company Growth Timeline (Multi-line Chart)
        this.createGrowthChart();
        
        // Task Completion Chart (Stacked Bar Chart)
        this.createTaskChart();
        
        // Customer Satisfaction Chart (Line Chart with Points)
        this.createSatisfactionChart();
        
        // Technology Stack Chart (Horizontal Bar Chart)
        this.createTechStackChart();
        
        logger.success('All charts initialized');
    }

    // Real chart methods using database data
    createRealRevenueChart(data) {
        const ctx = document.getElementById('revenueChart');
        if (!ctx || !data) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Monthly Revenue',
                    data: data.revenue,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Revenue Growth (Last 12 Months)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    }
                }
            }
        });
    }

    createRealProjectStatusChart(data) {
        const ctx = document.getElementById('projectStatusChart');
        if (!ctx || !data) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: data.colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Project Status Distribution'
                    }
                }
            }
        });
    }

    createRealDepartmentChart(data) {
        const ctx = document.getElementById('budgetChart');
        if (!ctx || !data) return;

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: data.colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    title: {
                        display: true,
                        text: 'Department Distribution'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + ' employees';
                            }
                        }
                    }
                }
            }
        });
    }

    createRealEmployeeGrowthChart(data) {
        const ctx = document.getElementById('growthChart');
        if (!ctx || !data) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Employee Count',
                    data: data.employees,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Employee Growth Timeline'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    createRealTaskChart(data) {
        const ctx = document.getElementById('taskChart');
        if (!ctx || !data) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Completed Tasks',
                    data: data.completed,
                    backgroundColor: '#10b981'
                }, {
                    label: 'Total Tasks',
                    data: data.total,
                    backgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Task Completion Trends'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    createRealAttendanceChart(data) {
        const ctx = document.getElementById('satisfactionChart');
        if (!ctx || !data) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Attendance Rate (%)',
                    data: data.attendanceRates,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Daily Attendance Trends'
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    createRealKPIChart(data) {
        const ctx = document.getElementById('employeeMetricsChart');
        if (!ctx || !data) return;

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Employee Satisfaction', 'Project Completion', 'Task Efficiency', 'Employee Retention', 'Overall Score'],
                datasets: [{
                    label: 'Performance %',
                    data: [
                        data.employeeSatisfaction,
                        data.projectCompletionRate,
                        data.taskEfficiency,
                        data.employeeRetention,
                        data.overallScore
                    ],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Key Performance Indicators'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    createRealTechStackChart(data) {
        // This would be for technology usage - placeholder for now
        const ctx = document.getElementById('techStackChart');
        if (!ctx) return;

        // Create a simple placeholder chart
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['React', 'Node.js', 'MongoDB', 'Express', 'Chart.js'],
                datasets: [{
                    label: 'Usage %',
                    data: [95, 90, 85, 88, 80],
                    backgroundColor: ['#61dafb', '#339933', '#47a248', '#000000', '#ff6384'],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Technology Stack Usage'
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    createRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: sampleData.chartData.revenueGrowth.labels,
                datasets: [{
                    label: 'Actual Revenue',
                    data: sampleData.chartData.revenueGrowth.data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Target Revenue',
                    data: sampleData.chartData.revenueGrowth.target,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000) + 'K';
                            }
                        }
                    }
                }
            }
        });
    }

    createProjectStatusChart() {
        const ctx = document.getElementById('projectStatusChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: sampleData.chartData.projectStatus.labels,
                datasets: [{
                    data: sampleData.chartData.projectStatus.data,
                    backgroundColor: sampleData.chartData.projectStatus.colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createEmployeeMetricsChart() {
        const ctx = document.getElementById('employeeMetricsChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: sampleData.chartData.employeeMetrics.labels,
                datasets: [{
                    label: 'Performance %',
                    data: sampleData.chartData.employeeMetrics.data,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                }
            }
        });
    }

    createBudgetChart() {
        const ctx = document.getElementById('budgetChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: sampleData.chartData.budgetAllocation.labels,
                datasets: [{
                    data: sampleData.chartData.budgetAllocation.data,
                    backgroundColor: sampleData.chartData.budgetAllocation.colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    createGrowthChart() {
        const ctx = document.getElementById('growthChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: sampleData.chartData.companyGrowth.labels,
                datasets: [{
                    label: 'Employees',
                    data: sampleData.chartData.companyGrowth.employees,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4
                }, {
                    label: 'Revenue ($K)',
                    data: sampleData.chartData.companyGrowth.revenue.map(r => r / 1000),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.4
                }, {
                    label: 'Projects',
                    data: sampleData.chartData.companyGrowth.projects,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    createTaskChart() {
        const ctx = document.getElementById('taskChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sampleData.chartData.taskCompletion.labels,
                datasets: [{
                    label: 'Completed',
                    data: sampleData.chartData.taskCompletion.completed,
                    backgroundColor: '#10b981'
                }, {
                    label: 'Pending',
                    data: sampleData.chartData.taskCompletion.pending,
                    backgroundColor: '#f59e0b'
                }, {
                    label: 'Overdue',
                    data: sampleData.chartData.taskCompletion.overdue,
                    backgroundColor: '#ef4444'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    createSatisfactionChart() {
        const ctx = document.getElementById('satisfactionChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: sampleData.chartData.customerSatisfaction.labels,
                datasets: [{
                    label: 'Satisfaction Rating',
                    data: sampleData.chartData.customerSatisfaction.satisfaction,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 3.5,
                        max: 5.0,
                        ticks: {
                            stepSize: 0.1,
                            callback: function(value) {
                                return value.toFixed(1) + ' ★';
                            }
                        }
                    }
                }
            }
        });
    }

    createTechStackChart() {
        const ctx = document.getElementById('techStackChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sampleData.chartData.techStack.labels,
                datasets: [{
                    label: 'Usage %',
                    data: sampleData.chartData.techStack.usage,
                    backgroundColor: sampleData.chartData.techStack.colors,
                    borderWidth: 1,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    initializeOverviewControls() {
        const exportBtn = document.getElementById('exportDataBtn');
        const refreshBtn = document.getElementById('refreshChartsBtn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                alert('Export functionality - would export charts and data to PDF/Excel');
                logger.info('Export data clicked');
            });
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.initializeCharts();
                logger.info('Charts refreshed');
            });
        }
        
        logger.success('Overview controls initialized');
    }

    populateFullCalendar(month, year) {
        const calendarDates = document.getElementById('fullCalendarDates');
        if (!calendarDates) return;

        calendarDates.innerHTML = '';
        
        const today = new Date();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-date empty';
            calendarDates.appendChild(emptyCell);
        }
        
        // Add cells for each day of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateCell = document.createElement('div');
            dateCell.className = 'calendar-date';
            
            // Check if today
            const isToday = day === today.getDate() && 
                           month === today.getMonth() && 
                           year === today.getFullYear();
            
            if (isToday) {
                dateCell.classList.add('today');
            }
            
            // Check for events
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEvent = sampleData.calendarEvents.some(event => event.date === dateStr);
            
            dateCell.innerHTML = `
                <span class="date-number">${day}</span>
                ${hasEvent ? '<div class="event-indicator"></div>' : ''}
            `;
            
            if (hasEvent) {
                dateCell.classList.add('has-event');
            }
            
            // Add click handler
            dateCell.addEventListener('click', () => {
                logger.info(`Selected calendar date: ${day}/${month + 1}/${year}`);
            });
            
            calendarDates.appendChild(dateCell);
        }
    }

    initializeCalendarControls() {
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');
        const addEventBtn = document.getElementById('addEventBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                logger.info('Previous month clicked');
                // Previous month logic would go here
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                logger.info('Next month clicked');
                // Next month logic would go here
            });
        }
        
        if (addEventBtn) {
            addEventBtn.addEventListener('click', () => {
                this.showAddEventModal();
            });
        }
        
        logger.success('Calendar controls initialized');
    }

    showAddEventModal() {
        const currentUser = this.authManager.getCurrentUser();
        const currentRole = this.authManager.getCurrentRole();
        
        // Check if user has permission to add events
        if (!['ceo', 'hr', 'admin'].includes(currentRole)) {
            alert('You do not have permission to add events. Only CEO, HR, and Admin can add events.');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h3><i class="fas fa-calendar-plus"></i> Add New Event</h3>
                    <button class="modal-close" onclick="closeModal(this)">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addEventForm">
                        <div class="form-section">
                            <h4><i class="fas fa-info-circle"></i> Event Details</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="eventTitle">Event Title *</label>
                                    <input type="text" id="eventTitle" name="eventTitle" required>
                                </div>
                                <div class="form-group">
                                    <label for="eventType">Event Type *</label>
                                    <select id="eventType" name="eventType" required>
                                        <option value="">Select Type</option>
                                        <option value="meeting">Meeting</option>
                                        <option value="deadline">Deadline</option>
                                        <option value="holiday">Holiday</option>
                                        <option value="training">Training</option>
                                        <option value="conference">Conference</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="eventDate">Event Date *</label>
                                    <input type="date" id="eventDate" name="eventDate" required>
                                </div>
                                <div class="form-group">
                                    <label for="eventTime">Event Time</label>
                                    <input type="time" id="eventTime" name="eventTime">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="eventDescription">Description</label>
                                <textarea id="eventDescription" name="eventDescription" rows="3" placeholder="Event description..."></textarea>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4><i class="fas fa-users"></i> Notification Settings</h4>
                            <div class="form-group">
                                <label for="notifyRoles">Notify Roles</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" name="notifyRoles" value="all" checked> All Employees</label>
                                    <label><input type="checkbox" name="notifyRoles" value="managers"> Managers Only</label>
                                    <label><input type="checkbox" name="notifyRoles" value="hr"> HR Department</label>
                                    <label><input type="checkbox" name="notifyRoles" value="admin"> Administrators</label>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal(this)">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="submitAddEvent()">
                        <i class="fas fa-plus"></i> Add Event
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('eventDate').value = today;
        
        logger.info('Add Event modal opened');
    }

    showErrorContent(page, error) {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="content-card">
                    <h3>Error Loading ${page}</h3>
                    <p style="color: var(--danger);">Failed to load content: ${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
                </div>
            `;
        }
    }
}

// ============================================================================
// GLOBAL PAYROLL FUNCTIONS
// ============================================================================

// Payroll request with retry logic and rate limiting protection
async function makePayrollRequest(url, data, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            logger.info(`Payroll API attempt ${attempt}/${retries}`);
            
            // Add delay between retries to avoid rate limiting
            if (attempt > 1) {
                const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
                logger.info(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            const response = await window.apiService.post(url, data);
            return response;
            
        } catch (error) {
            logger.warn(`Payroll API attempt ${attempt} failed:`, error.message);
            
            // If it's a rate limit error and we have retries left, continue
            if (error.message.includes('429') && attempt < retries) {
                continue;
            }
            
            // If it's not a rate limit error, throw immediately
            if (!error.message.includes('429')) {
                throw error;
            }
            
            // If we've exhausted retries, throw the error
            if (attempt === retries) {
                throw new Error('Payroll service is temporarily unavailable. Please try again later.');
            }
        }
    }
}

// Make payroll function globally available
window.makePayrollRequest = makePayrollRequest;

// ============================================================================
// INITIALIZE GLOBAL OBJECTS
// ============================================================================
const logger = new Logger();
window.logger = logger; // Make globally accessible

let authManager;
let dashboardManager;

// ============================================================================
// APPLICATION STATE
// ============================================================================
const AppState = {
    isDarkMode: true,
    isInitialized: false,
    currentView: 'login'
};

// ============================================================================
// DOM ELEMENTS CACHE
// ============================================================================
let DOMElements = {};

function cacheDOMElements() {
    logger.info('Caching DOM elements...');
    
    DOMElements = {
        loginPage: document.getElementById('loginPage'),
        loginForm: document.getElementById('loginForm'),
        dashboard: document.getElementById('dashboard'),
        logoutBtn: document.getElementById('logoutBtn'),
        currentDate: document.getElementById('currentDate'),
        roleButtons: document.querySelectorAll('.role-btn'),
        viewCalendarBtn: document.getElementById('viewCalendarBtn'),
        viewAllNotifications: document.getElementById('viewAllNotifications'),
        themeToggle: document.getElementById('themeToggle'),
        usernameInput: document.getElementById('username'),
        passwordInput: document.getElementById('password')
    };
    
    // Validate critical elements
    const criticalElements = ['loginPage', 'loginForm', 'dashboard', 'themeToggle'];
    const missing = criticalElements.filter(key => !DOMElements[key]);
    
    if (missing.length > 0) {
        logger.error('Missing critical DOM elements', { missing });
        return false;
    }
    
    logger.success('DOM elements cached', {
        loginForm: !!DOMElements.loginForm,
        roleButtons: DOMElements.roleButtons.length,
        themeToggle: !!DOMElements.themeToggle
    });
    
    return true;
}

// ============================================================================
// THEME MANAGEMENT
// ============================================================================
function initializeTheme() {
    logger.info('Initializing theme...');
    
    if (!DOMElements.themeToggle) {
        logger.error('Theme toggle button not found');
        return;
    }
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        AppState.isDarkMode = false;
        document.body.classList.add('light-mode');
        DOMElements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    DOMElements.themeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        logger.info('Theme toggle clicked', { currentMode: AppState.isDarkMode ? 'dark' : 'light' });
        
        AppState.isDarkMode = !AppState.isDarkMode;
        
        if (AppState.isDarkMode) {
            document.body.classList.remove('light-mode');
            this.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'dark');
            logger.success('Switched to dark mode');
        } else {
            document.body.classList.add('light-mode');
            this.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'light');
            logger.success('Switched to light mode');
        }
    });
    
    logger.success('Theme initialized', { mode: AppState.isDarkMode ? 'dark' : 'light' });
}

// ============================================================================
// ROLE BUTTONS MANAGEMENT
// ============================================================================

function getRandomUsername(role) {
    const usernames = {
        ceo: ['john.smith', 'sarah.johnson', 'michael.chen', 'emma.davis', 'alex.rodriguez'],
        admin: ['alex.wilson', 'lisa.brown', 'david.miller', 'anna.garcia', 'chris.thompson'],
        hr: ['jennifer.taylor', 'robert.anderson', 'maria.martinez', 'james.thomas', 'sophie.white'],
        manager: ['kevin.jackson', 'rachel.white', 'daniel.harris', 'sophia.clark', 'ryan.moore'],
        employee: ['chris.lewis', 'amanda.walker', 'ryan.hall', 'jessica.young', 'mike.jones']
    };
    
    const roleUsernames = usernames[role] || usernames.employee;
    return roleUsernames[Math.floor(Math.random() * roleUsernames.length)];
}

function initializeRoleButtons() {
    logger.info('Initializing role buttons...');
    
    if (!DOMElements.roleButtons || DOMElements.roleButtons.length === 0) {
        logger.error('No role buttons found');
        return;
    }
    
    DOMElements.roleButtons.forEach((btn, index) => {
        const role = btn.dataset.role;
        
        if (!role) {
            logger.warn(`Role button ${index} missing data-role attribute`);
            return;
        }
        
        logger.info(`Setting up role button: ${role}`);
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            logger.info('Role button clicked', { role });
            
            // Remove active class from all buttons
            DOMElements.roleButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set role in auth manager
            if (authManager) {
                authManager.setRole(role);
            }
            
            // Auto-fill credentials with both real and demo options
            if (DOMElements.usernameInput && DOMElements.passwordInput) {
                // Real MongoDB credentials (seeded users)
                const realCredentials = {
                    ceo: { email: 'ceo@elaratech.com', password: 'Ceo@123456' },
                    hr: { email: 'hr@elaratech.com', password: 'Hr@123456' },
                    admin: { email: 'admin@elaratech.com', password: 'Admin@123456' },
                    manager: { email: 'manager@elaratech.com', password: 'Manager@123456' },
                    employee: { email: 'employee@elaratech.com', password: 'Employee@123456' }
                };
                
                // Demo credentials (simpler format)
                const demoCredentials = {
                    ceo: { email: 'ceo@elaratech.com', password: 'ceo123' },
                    hr: { email: 'hr@elaratech.com', password: 'hr123' },
                    admin: { email: 'admin@elaratech.com', password: 'admin123' },
                    manager: { email: 'manager@elaratech.com', password: 'manager123' },
                    employee: { email: 'employee@elaratech.com', password: 'employee123' }
                };
                
                // Use real credentials by default (will fallback to demo if needed)
                const credentials = realCredentials[role] || realCredentials.employee;
                
                DOMElements.usernameInput.value = credentials.email;
                DOMElements.passwordInput.value = credentials.password;
                
                logger.success('Credentials auto-filled', { 
                    email: credentials.email, 
                    role,
                    note: 'Will try real API first, then demo API if needed'
                });
                
                // Note: Removed auto-submit to avoid duplicate login requests
            } else {
                logger.error('Username or password input not found');
            }
        });
    });
    
    logger.success('Role buttons initialized', { count: DOMElements.roleButtons.length });
}

// ============================================================================
// LOGIN MANAGEMENT
// ============================================================================
function initializeLogin() {
    logger.info('Initializing login form...');
    
    if (!DOMElements.loginForm) {
        logger.error('Login form not found');
        return;
    }
    
    DOMElements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = DOMElements.usernameInput?.value || '';
        const password = DOMElements.passwordInput?.value || '';
        
        logger.info('Login form submitted', { email });
        
        if (!email || !password) {
            logger.error('Email or password is empty');
            alert('Please enter email and password');
            return;
        }
        
        try {
            logger.info('Attempting login...', { email });
            
            const user = await authManager.login(email, password);
            
            if (!user) {
                throw new Error('Login returned no user');
            }
            
            logger.success('Login successful', { user: user.name, role: user.role });
            
            // Update dashboard UI
            logger.info('Updating dashboard UI...');
            dashboardManager.updateUI();
            logger.success('Dashboard UI updated');
            
            // Switch views
            logger.info('Switching to dashboard view...');
            DOMElements.loginPage.style.display = 'none';
            DOMElements.dashboard.style.display = 'block';
            AppState.currentView = 'dashboard';
            logger.success('Dashboard displayed');
            
            // Load home content
            logger.info('Loading home content...');
            await dashboardManager.loadContent('home');
            logger.success('Home content loaded');
            
        } catch (error) {
            logger.error('Login failed', { 
                error: error.message, 
                stack: error.stack 
            });
            alert(`Login failed: ${error.message}`);
        }
    });
    
    logger.success('Login form initialized');
}

// ============================================================================
// LOGOUT MANAGEMENT
// ============================================================================
function initializeLogout() {
    logger.info('Initializing logout button...');
    
    if (!DOMElements.logoutBtn) {
        logger.warn('Logout button not found');
        return;
    }
    
    DOMElements.logoutBtn.addEventListener('click', async () => {
        logger.info('Logout button clicked');
        
        try {
            await authManager.logout();
            logger.success('User logged out');
            
            // Switch views
            DOMElements.dashboard.style.display = 'none';
            DOMElements.loginPage.style.display = 'flex';
            AppState.currentView = 'login';
            
            // Reset form
            if (DOMElements.loginForm) {
                DOMElements.loginForm.reset();
            }
            
            // Reset role buttons
            DOMElements.roleButtons.forEach(btn => btn.classList.remove('active'));
            
            logger.success('Logout complete - returned to login page');
            
        } catch (error) {
            logger.error('Logout failed', { error: error.message });
        }
    });
    
    logger.success('Logout button initialized');
}

// ============================================================================
// DASHBOARD NAVIGATION
// ============================================================================
function initializeDashboardNavigation() {
    logger.info('Initializing dashboard navigation...');
    
    if (DOMElements.viewCalendarBtn) {
        DOMElements.viewCalendarBtn.addEventListener('click', async () => {
            logger.info('Calendar button clicked');
            await dashboardManager.loadContent('calendar');
        });
    }
    
    if (DOMElements.viewAllNotifications) {
        DOMElements.viewAllNotifications.addEventListener('click', async () => {
            logger.info('Notifications button clicked');
            await dashboardManager.loadContent('notifications');
        });
    }
    
    logger.success('Dashboard navigation initialized');
}

// ============================================================================
// DATE DISPLAY
// ============================================================================
function initializeDate() {
    if (DOMElements.currentDate) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        DOMElements.currentDate.textContent = now.toLocaleDateString('en-US', options);
        logger.success('Date initialized', { date: DOMElements.currentDate.textContent });
    }
}

// ============================================================================
// MAIN INITIALIZATION FUNCTION
// ============================================================================
function initializeApp() {
    logger.info('🚀 Starting application initialization...');
    
    try {
        // Initialize managers first
        logger.info('Initializing managers...');
        authManager = new AuthManager();
        dashboardManager = new DashboardManager(authManager);
        logger.success('Managers initialized');
        
        // Make globally accessible
        window.authManager = authManager;
        window.dashboardManager = dashboardManager;
        
        // Step 1: Cache DOM elements
        if (!cacheDOMElements()) {
            logger.error('Failed to cache DOM elements - aborting initialization');
            return;
        }
        
        // Step 2: Initialize date display
        initializeDate();
        
        // Step 3: Initialize theme
        initializeTheme();
        
        // Step 4: Initialize role buttons
        initializeRoleButtons();
        
        // Step 5: Initialize login
        initializeLogin();
        
        // Step 6: Initialize logout
        initializeLogout();
        
        // Step 7: Initialize dashboard navigation
        initializeDashboardNavigation();
        
        // Mark as initialized
        AppState.isInitialized = true;
        
        logger.success('✅ Application initialized successfully!');
        logger.info('App is ready for user interaction', {
            theme: AppState.isDarkMode ? 'dark' : 'light',
            view: AppState.currentView,
            roleButtons: DOMElements.roleButtons.length
        });
        
    } catch (error) {
        logger.error('Fatal error during initialization', {
            error: error.message,
            stack: error.stack
        });
        
        // Show user-friendly error
        alert('Application failed to initialize. Please refresh the page.');
    }
}

// ============================================================================
// MODAL FUNCTIONS FOR API INTEGRATION
// ============================================================================

// Show Add Employee Modal
function showAddEmployeeModal() {
    console.log('🔧 Opening Add Employee Modal...');
    logger.info('showAddEmployeeModal called');
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>Add New Employee</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <form id="addEmployeeForm" class="modal-form">
                    <div class="form-section">
                        <h4>Personal Information</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="empName">Full Name *</label>
                                <input type="text" id="empName" name="name" required placeholder="Enter full name">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>Role & Department</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="empRole">System Role *</label>
                                <select id="empRole" name="role" required>
                                    <option value="employee" selected>Employee</option>
                                    <option value="manager">Manager</option>
                                    <option value="hr">HR</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="empDepartment">Department *</label>
                                <select id="empDepartment" name="department" required>
                                    <option value="Engineering" selected>Engineering</option>
                                    <option value="Human Resources">Human Resources</option>
                                    <option value="IT">IT</option>
                                    <option value="Executive">Executive</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Operations">Operations</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal(this)">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="submitAddEmployee()">Add Employee</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.modal-close'));
        }
    });
}

// Submit Add Employee Form
async function submitAddEmployee() {
    const form = document.getElementById('addEmployeeForm');
    if (!form) {
        alert('Form not found!');
        return;
    }
    
    const formData = new FormData(form);
    const employeeData = Object.fromEntries(formData.entries());
    
    // Validate required fields (name + role + department)
    if (!employeeData.name || !employeeData.role || !employeeData.department) {
        alert('Please enter name, select role, and select department');
        return;
    }
    
    // Auto-generate fields
    const role = (employeeData.role || 'employee').toLowerCase();
    employeeData.employeeId = 'EMP' + Date.now().toString().slice(-6);
    const username = employeeData.name.trim().toLowerCase().replace(/[^a-z\s.]/g, '').replace(/\s+/g, '.');
    employeeData.email = `${username}.${role}@elara.tech`;
    employeeData.password = `${role}12345`; // Minimum 8 characters
    employeeData.role = role;
    employeeData.department = employeeData.department; // Use selected department
    employeeData.position = 'Employee';
    employeeData.status = 'Active';
    
    try {
        logger.info('Creating employee...', employeeData);
        
        // Show loading state
        const submitBtn = document.querySelector('#addEmployeeForm').closest('.modal-container').querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating...';
        submitBtn.disabled = true;
        
        // Smart authentication-aware employee creation
        const storedToken = localStorage.getItem('token');
        const authMethod = localStorage.getItem('authMethod') || 'unknown';
        
        let response = null;
        
        if (storedToken) {
            try {
                logger.info('Creating employee via authenticated API', { authMethod });
                
                if (authMethod === 'real') {
                    // Use real MongoDB API
                    response = await window.dataService.createUser(employeeData);
                    // Standardize response shape
                    if (response && response.success && response.data) {
                        response.data = response.data;
                    } else if (response && response._id) {
                        response = { success: true, data: response };
                    }
                } else {
                    // Use demo API for demo authentication
                    response = await window.apiService.post('/users/demo', employeeData);
                    if (response && response._id) {
                        response = { success: true, data: response };
                    }
                }
                
                logger.success('Employee created via API', { method: authMethod });
            } catch (error) {
                logger.warn('API creation failed, using local demo data:', error.message);
                // Fallback to local demo data
                response = { 
                    success: true, 
                    data: {
                        ...employeeData,
                        _id: 'demo-' + Date.now(),
                        status: 'Active',
                        createdAt: new Date().toISOString()
                    }
                };
            }
        } else {
            logger.info('No authentication, using local demo data');
            // Use local demo data directly
            response = { 
                success: true, 
                data: {
                    ...employeeData,
                    _id: 'demo-' + Date.now(),
                    status: 'Active',
                    createdAt: new Date().toISOString()
                }
            };
        }
        
        if (response && response.success) {
            logger.success('Employee created successfully!', response.data);
            
            // Force server refresh instead of local push to avoid drift
            
            alert(`Employee "${employeeData.name}" added successfully!\nEmployee ID: ${response.data.employeeId || employeeData.employeeId}`);
            closeModal(document.querySelector('.modal-close'));
            
            // Optimistically add to local list so UI reflects immediately
            const created = response.data || employeeData;
            if (created) {
                const existedIdx = (window.allEmployees || []).findIndex(e => (e._id && created._id && e._id === created._id) || (e.email && created.email && e.email === created.email));
                if (existedIdx >= 0) {
                    window.allEmployees[existedIdx] = created;
                } else {
                    window.allEmployees = [created, ...(window.allEmployees || [])];
                }
            }

            // Refresh from server to ensure latest list; if it fails, keep local optimistic state
            if (dashboardManager && typeof dashboardManager.loadEmployeesContent === 'function') {
                try {
                    await dashboardManager.loadEmployeesContent();
                } catch (reloadErr) {
                    logger.warn('Server reload failed, updating view locally:', reloadErr.message);
                    await dashboardManager.loadEmployeesContent();
                }
            }
            
            // Refresh dashboard recent activity if on home page
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (currentUser && dashboardManager.currentContent === 'home') {
                await dashboardManager.loadHomeContent(currentUser);
            }
        } else {
            throw new Error(response.error || 'Failed to create employee');
        }
        
    } catch (error) {
        logger.error('Failed to create employee', error);
        
        // Show user-friendly error messages
        let errorMessage = 'Failed to add employee: ';
        if (error.message.includes('401')) {
            errorMessage += 'You are not authorized. Please login again.';
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } else if (error.message.includes('400')) {
            errorMessage += 'Invalid employee data. Please check all fields.';
        } else if (error.message.includes('409')) {
            errorMessage += 'Employee with this email already exists.';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
        
        // Reset button state
        const submitBtn = document.querySelector('#addEmployeeForm').closest('.modal-container').querySelector('.btn-primary');
        if (submitBtn) {
            submitBtn.textContent = 'Add Employee';
            submitBtn.disabled = false;
        }
    }
}

// Close Modal
function closeModal(closeBtn) {
    let modal;
    
    if (closeBtn && closeBtn.closest) {
        // Called from a button click with event target
        modal = closeBtn.closest('.modal-overlay');
    } else {
        // Called programmatically, find any open modal
        modal = document.querySelector('.modal-overlay');
    }
    
    if (modal) {
        modal.remove();
    }
}

// Debug function to test API connection
async function submitAddEvent() {
    try {
        const form = document.getElementById('addEventForm');
        if (!form) {
            throw new Error('Add Event form not found');
        }
        
        const formData = new FormData(form);
        
        // Get form values
        const eventTitle = formData.get('eventTitle');
        const eventType = formData.get('eventType');
        const eventDate = formData.get('eventDate');
        const eventTime = formData.get('eventTime');
        const eventDescription = formData.get('eventDescription');
        
        // Get selected notification roles
        const notifyRoles = Array.from(document.querySelectorAll('input[name="notifyRoles"]:checked'))
            .map(checkbox => checkbox.value);
        
        // Validate required fields
        if (!eventTitle || !eventType || !eventDate) {
            alert('Please fill in all required fields (Title, Type, Date)');
            return;
        }
        
        // Get current user info
        const currentUser = authManager ? authManager.getCurrentUser() : null;
        const currentRole = authManager ? authManager.getCurrentRole() : null;
        
        if (!currentUser || !currentRole) {
            throw new Error('User not authenticated');
        }
        
        // Create event object
        const newEvent = {
            id: Date.now(), // Simple ID generation
            title: eventTitle,
            type: eventType,
            date: eventDate,
            time: eventTime || 'All Day',
            description: eventDescription || '',
            createdBy: currentUser.name,
            createdByRole: currentRole,
            notifyRoles: notifyRoles,
            createdAt: new Date().toISOString()
        };
        
        // Add to sample data (in a real app, this would be an API call)
        sampleData.calendarEvents.push(newEvent);
        
        // Create notification for upcoming events (if within next 7 days)
        const eventDateObj = new Date(eventDate);
        const today = new Date();
        const daysUntilEvent = Math.ceil((eventDateObj - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilEvent >= 0 && daysUntilEvent <= 7) {
            const notification = {
                id: Date.now() + 1,
                title: `Upcoming ${eventType}: ${eventTitle}`,
                content: `${eventTitle} scheduled for ${eventDate} at ${eventTime}. Created by ${newEvent.createdBy} (${newEvent.createdByRole.toUpperCase()}).`,
                date: new Date().toISOString().split('T')[0],
                priority: eventType === 'meeting' ? 'high' : 'medium',
                type: 'event',
                eventDate: eventDate,
                eventTime: eventTime
            };
            
            sampleData.announcements.unshift(notification);
        }
        
        // Close modal
        closeModal();
        
        // Refresh calendar and notifications
        if (dashboardManager) {
            dashboardManager.updateMiniCalendar();
            dashboardManager.updateNotifications();
            
            // If we're on the calendar page, refresh it
            const activeMenuItem = document.querySelector('.sidebar-menu .active');
            if (activeMenuItem && activeMenuItem.getAttribute('data-page') === 'calendar') {
                dashboardManager.loadFullCalendarContent();
            }
        }
        
        alert(`Event "${eventTitle}" added successfully!`);
        logger.success('Event added successfully', newEvent);
        
    } catch (error) {
        logger.error('Failed to add event:', error);
        alert('Failed to add event: ' + error.message);
    }
}

async function testAPIConnection() {
    try {
        console.log('🔍 Testing API connection...');
        const response = await window.apiService.get('/health');
        console.log('✅ API Health Check:', response);
        alert('API Connection: ' + (response.success ? 'Working!' : 'Failed'));
    } catch (error) {
        console.error('❌ API Connection Failed:', error);
        alert('API Connection Failed: ' + error.message);
    }
}

// Make functions globally available
window.showAddEmployeeModal = showAddEmployeeModal;
window.submitAddEmployee = submitAddEmployee;
window.submitAddEvent = submitAddEvent;

// Global functions for notification actions
function viewEventDetails(eventId) {
    const event = sampleData.calendarEvents.find(e => e.id == eventId);
    if (event) {
        alert(`Event Details:\n\nTitle: ${event.title}\nType: ${event.type}\nDate: ${event.date}\nTime: ${event.time}\nDescription: ${event.description}\nCreated by: ${event.createdBy} (${event.createdByRole})`);
    } else {
        alert('Event not found');
    }
}

function markAsRead(notificationId) {
    // In a real app, this would make an API call to mark the notification as read
    alert(`Notification ${notificationId} marked as read`);
    logger.info('Notification marked as read:', notificationId);
}

// Make notification functions globally available
window.viewEventDetails = viewEventDetails;
window.markAsRead = markAsRead;
window.closeModal = closeModal;
window.testAPIConnection = testAPIConnection;

// ============================================================================
// START APPLICATION WHEN DOM IS READY
// ============================================================================
if (document.readyState === 'loading') {
    logger.info('DOM is loading - waiting for DOMContentLoaded event');
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    logger.info('DOM is already loaded - initializing immediately');
    initializeApp();
}

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================
window.addEventListener('error', (event) => {
    logger.error('Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
        reason: event.reason
    });
});

// ============================================================================
// ROLE HIERARCHY SYSTEM
// ============================================================================

// Role hierarchy levels (higher number = higher authority)
const ROLE_HIERARCHY = {
    'employee': 1,
    'manager': 2,
    'hr': 3,
    'admin': 4,
    'ceo': 5
};

// Get role hierarchy level
function getRoleLevel(role) {
    return ROLE_HIERARCHY[role] || 0;
}

// Check if current user can manage target user based on role hierarchy
function canManageUser(currentUserRole, targetUserRole, action = 'edit') {
    // CEO can manage everyone
    if (currentUserRole === 'ceo') {
        return true;
    }
    
    // Admin can manage everyone except CEO
    if (currentUserRole === 'admin' && targetUserRole !== 'ceo') {
        return true;
    }
    
    // HR can manage employees and managers, but not admin or CEO
    if (currentUserRole === 'hr' && !['admin', 'ceo'].includes(targetUserRole)) {
        return true;
    }
    
    // Manager can only manage employees
    if (currentUserRole === 'manager' && targetUserRole === 'employee') {
        return true;
    }
    
    // Users can edit their own profile (but not delete themselves)
    if (action === 'edit' && currentUserRole === targetUserRole) {
        return true;
    }
    
    return false;
}

// Get permission message for unauthorized actions
function getPermissionMessage(currentUserRole, targetUserRole, action) {
    const hierarchy = {
        'ceo': 'CEO',
        'admin': 'Administrator', 
        'hr': 'HR Manager',
        'manager': 'Manager',
        'employee': 'Employee'
    };
    
    return `As a ${hierarchy[currentUserRole]}, you cannot ${action} a ${hierarchy[targetUserRole]}. Insufficient privileges in the organizational hierarchy.`;
}

// ============================================================================
// EMPLOYEE MANAGEMENT FUNCTIONS
// ============================================================================

function filterEmployees() {
    const searchTerm = document.getElementById('employeeSearch')?.value.toLowerCase() || '';
    const departmentFilter = document.getElementById('departmentFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    if (!window.allEmployees) return;
    
    const filteredEmployees = window.allEmployees.filter(emp => {
        const matchesSearch = !searchTerm || 
            (emp.name && emp.name.toLowerCase().includes(searchTerm)) ||
            (emp.position && emp.position.toLowerCase().includes(searchTerm)) ||
            (emp.department && emp.department.toLowerCase().includes(searchTerm));
        
        const matchesDepartment = !departmentFilter || emp.department === departmentFilter;
        const matchesStatus = !statusFilter || (emp.status || 'Active').toLowerCase() === statusFilter.toLowerCase();
        
        return matchesSearch && matchesDepartment && matchesStatus;
    });
    
    // Re-render the employee table with filtered results
    const employeeTableBody = document.getElementById('employeeTableBody');
    if (employeeTableBody) {
        const employeeRows = filteredEmployees.length > 0 ? filteredEmployees.map(emp => {
            const currentUserRole = localStorage.getItem('userRole') || 'employee';
            const targetUserRole = emp.role || 'employee';
            const canEdit = canManageUser(currentUserRole, targetUserRole, 'edit');
            const canDelete = canManageUser(currentUserRole, targetUserRole, 'delete');
            
            return `
            <tr data-employee-id="${emp._id}">
                <td>${emp.employeeId || 'N/A'}</td>
                <td>
                    <div class="employee-name-cell">
                        ${emp.name || 'Unknown'}
                    </div>
                </td>
                <td>${emp.department || 'N/A'}</td>
                <td>${emp.position || 'N/A'}</td>
                <td><span class="role-badge role-${targetUserRole}">${targetUserRole.toUpperCase()}</span></td>
                <td>
                    ${canEdit ? `
                        <select class="status-select" onchange="updateEmployeeStatus('${emp._id}', this.value)" title="Change Status">
                            <option value="Active" ${(emp.status || 'Active') === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Inactive" ${emp.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    ` : `
                        <span class="status-badge status-${(emp.status || 'active').toLowerCase()}">${emp.status || 'Active'}</span>
                    `}
                </td>
                <td class="actions">
                    <button class="btn-action btn-primary" onclick="viewEmployee('${emp._id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${canDelete ? `
                        <button class="btn-action btn-danger" onclick="deleteEmployee('${emp._id}', '${emp.name}')" title="Delete Employee">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : `
                        <button class="btn-action btn-secondary disabled" title="Cannot delete ${targetUserRole}" disabled>
                            <i class="fas fa-trash"></i>
                        </button>
                    `}
                </td>
            </tr>
            `;
        }).join('') : `
            <tr>
                <td colspan="8" class="no-results">
                    <div class="empty-state">
                        <i class="fas fa-search fa-2x"></i>
                        <h4>No Employees Found</h4>
                        <p>No employees match your current filters.</p>
                        <button class="btn btn-secondary btn-sm" onclick="clearFilters()">
                            <i class="fas fa-times"></i> Clear Filters
                        </button>
                    </div>
                </td>
            </tr>
        `;
        
        employeeTableBody.innerHTML = employeeRows;
    }
}

function clearFilters() {
    document.getElementById('employeeSearch').value = '';
    document.getElementById('departmentFilter').value = '';
    document.getElementById('statusFilter').value = '';
    filterEmployees();
}

function viewEmployee(userId) {
    const employee = window.allEmployees?.find(emp => emp._id === userId);
    if (!employee) {
        alert('Employee not found');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3><i class="fas fa-user"></i> Employee Details</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="employee-details">
                    <div class="employee-info-grid">
                        <div class="info-row">
                            <label>Full Name:</label>
                            <span>${employee.name || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <label>Employee ID:</label>
                            <span>${employee.employeeId || employee._id || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <label>Email:</label>
                            <span>${employee.email || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <label>Department:</label>
                            <span>${employee.department || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <label>Position:</label>
                            <span>${employee.position || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <label>Role:</label>
                            <span>${employee.role || 'employee'}</span>
                        </div>
                        <div class="info-row">
                            <label>Status:</label>
                            <span class="status-badge status-${(employee.status || 'active').toLowerCase()}">${employee.status || 'Active'}</span>
                        </div>
                        <div class="info-row">
                            <label>Phone:</label>
                            <span>${employee.phone || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <label>Joining Date:</label>
                            <span>${employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="editEmployee('${employeeId}')">
                    <i class="fas fa-edit"></i> Edit Employee
                </button>
                <button class="btn btn-secondary" onclick="closeModal(this)">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function editEmployee(userId) {
    const employee = window.allEmployees?.find(emp => emp._id === userId);
    if (!employee) {
        alert('Employee not found');
        return;
    }
    
    // Check hierarchy permissions
    const currentUserRole = localStorage.getItem('userRole') || 'employee';
    const targetUserRole = employee.role || 'employee';
    
    if (!canManageUser(currentUserRole, targetUserRole, 'edit')) {
        alert(getPermissionMessage(currentUserRole, targetUserRole, 'edit'));
        return;
    }
    
    // Close any existing modals
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> Edit Employee</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editEmployeeForm" onsubmit="submitEditEmployee(event, '${employeeId}')">
                    <div class="form-section">
                        <h4><i class="fas fa-user"></i> Employee Information</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editEmployeeId">Employee ID</label>
                                <input type="text" id="editEmployeeId" name="employeeId" value="${employee.employeeId || ''}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="editName">Full Name</label>
                                <input type="text" id="editName" name="name" value="${employee.name || ''}" readonly>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editDepartment">Department</label>
                                <input type="text" id="editDepartment" name="department" value="${employee.department || ''}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="editPosition">Position</label>
                                <input type="text" id="editPosition" name="position" value="${employee.position || ''}" readonly>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4><i class="fas fa-cog"></i> Status Management</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editStatus">Employee Status *</label>
                                <select id="editStatus" name="status" required>
                                    <option value="Active" ${(employee.status || 'Active') === 'Active' ? 'selected' : ''}>Active</option>
                                    <option value="Inactive" ${employee.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                                </select>
                                <small class="form-text">Change employee status to Active or Inactive</small>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="submit" form="editEmployeeForm" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save Changes
                </button>
                <button class="btn btn-secondary" onclick="closeModal(this)">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function submitEditEmployee(event, employeeId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const status = formData.get('status');
    
    // Validate status
    if (!status || !['Active', 'Inactive'].includes(status)) {
        alert('Please select a valid status (Active or Inactive)');
        return;
    }
    
    // Add loading state
    const submitBtn = form.querySelector('button[type="submit"]') || document.querySelector('button[form="editEmployeeForm"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating Status...';
    submitBtn.disabled = true;
    
    try {
        // Only send status update
        const updateData = { status: status };
        
        // Try API call first
        try {
            const response = await window.apiService.put(`/users/${employeeId}`, updateData);
            
            if (response && response.success) {
                logger.success('Employee status updated successfully');
                
                // Update local data
                const employee = window.allEmployees?.find(emp => (emp._id === employeeId || emp.employeeId === employeeId));
                if (employee) {
                    employee.status = status;
                }
                
                // Close modal
                const modal = document.querySelector('.modal-overlay');
                if (modal) modal.remove();
                
                // Refresh employee list
                if (dashboardManager && typeof dashboardManager.loadEmployeesContent === 'function') {
                    dashboardManager.loadEmployeesContent();
                }
                
                alert(`Employee status updated to ${status}!`);
                return;
            }
        } catch (apiError) {
            logger.warn('API update failed, updating locally:', apiError.message);
        }
        
        // Fallback: Update locally
        const employee = window.allEmployees?.find(emp => (emp._id === employeeId || emp.employeeId === employeeId));
        if (employee) {
            employee.status = status;
            
            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.remove();
            
            // Refresh employee list
            if (dashboardManager && typeof dashboardManager.loadEmployeesContent === 'function') {
                dashboardManager.loadEmployeesContent();
            }
            
            alert(`Employee status updated to ${status}! (Local update)`);
        } else {
            throw new Error('Employee not found');
        }
        
    } catch (error) {
        logger.error('Failed to update employee status:', error);
        alert('Failed to update employee status: ' + error.message);
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function deleteEmployee(userId, employeeName) {
    // Find the employee to check their role
    const employee = window.allEmployees?.find(emp => emp._id === userId);
    if (!employee) {
        alert('Employee not found');
        return;
    }
    
    // Check hierarchy permissions
    const currentUserRole = localStorage.getItem('userRole') || 'employee';
    const targetUserRole = employee.role || 'employee';
    
    if (!canManageUser(currentUserRole, targetUserRole, 'delete')) {
        alert(getPermissionMessage(currentUserRole, targetUserRole, 'delete'));
        return;
    }
    
    if (!confirm(`Are you sure you want to delete employee "${employeeName}"? This action cannot be undone.`)) {
        return;
    }
    
    // Show confirmation dialog with additional warning
    const confirmDelete = confirm(`⚠️ WARNING: This will permanently delete all data for "${employeeName}" including:\n\n• Employee record\n• Associated tasks and projects\n• Attendance history\n• Leave records\n\nType "DELETE" to confirm this action.`);
    
    if (!confirmDelete) {
        return;
    }
    
    // Additional confirmation
    const userInput = prompt(`To confirm deletion, please type "DELETE" (in capital letters):`);
    if (userInput !== 'DELETE') {
        alert('Deletion cancelled. Employee was not deleted.');
        return;
    }
    
    deleteEmployeeConfirmed(userId, employeeName);
}

async function deleteEmployeeConfirmed(userId, employeeName) {
    try {
        logger.info(`Attempting to delete employee: ${employeeName} (UserID: ${userId})`);
        
        // Smart authentication-aware employee deletion
        const storedToken = localStorage.getItem('token');
        const authMethod = localStorage.getItem('authMethod') || 'unknown';
        
        let response = null;
        
        if (storedToken) {
            try {
                logger.info('Deleting employee via authenticated API', { authMethod, userId });
                
                if (authMethod === 'real') {
                    // Use real MongoDB API
                    response = await window.apiService.delete(`/users/${userId}`);
                } else {
                    // For demo authentication, simulate successful deletion
                    response = { success: true };
                }
                
                logger.success('Employee deleted via API', { method: authMethod });
            } catch (error) {
                logger.warn('API deletion failed, simulating local deletion:', error.message);
                // Fallback to local simulation
                response = { success: true };
            }
        } else {
            logger.info('No authentication, simulating local deletion');
            // Simulate successful deletion
            response = { success: true };
        }
        
        // Update local storage regardless of API result
        if (window.allEmployees) {
            window.allEmployees = window.allEmployees.filter(emp => emp._id !== userId);
        }
        
        if (response && response.success) {
            logger.success('Employee deleted successfully');
            
            // Show success message
            alert(`Employee "${employeeName}" has been successfully deleted.`);
            
            // Refresh employee list
            if (dashboardManager && typeof dashboardManager.loadEmployeesContent === 'function') {
                dashboardManager.loadEmployeesContent();
            }
        } else {
            throw new Error(response?.error || 'Failed to delete employee');
        }
        
    } catch (error) {
        logger.error('Failed to delete employee:', error);
        
        // Show user-friendly error messages
        let errorMessage = 'Failed to delete employee: ';
        if (error.message.includes('401')) {
            errorMessage += 'You are not authorized to perform this action.';
        } else if (error.message.includes('404')) {
            errorMessage += 'Employee not found in the system.';
        } else if (error.message.includes('403')) {
            errorMessage += 'Cannot delete this employee due to system restrictions.';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
}

// Direct status update function
async function updateEmployeeStatus(userId, newStatus) {
    const employee = window.allEmployees?.find(emp => emp._id === userId);
    if (!employee) {
        alert('Employee not found');
        return;
    }
    
    // Check hierarchy permissions
        const currentUserRole = localStorage.getItem('userRole') || 'employee';
    const targetUserRole = employee.role || 'employee';
    
    if (!canManageUser(currentUserRole, targetUserRole, 'edit')) {
        alert(getPermissionMessage(currentUserRole, targetUserRole, 'edit'));
        // Reset the dropdown to original value
        const select = document.querySelector(`select[onchange*="${userId}"]`);
        if (select) {
            select.value = employee.status || 'Active';
        }
        return;
    }
    
    // Validate status
    if (!['Active', 'Inactive'].includes(newStatus)) {
        alert('Invalid status selected');
        return;
    }
    
    try {
        logger.info(`Updating employee ${employee.name} status to ${newStatus}`);
        
        // Try API call first
        try {
            const updateData = { status: newStatus };
            const response = await window.apiService.put(`/users/${userId}`, updateData);
            
            if (response && response.success) {
                logger.success('Employee status updated successfully');
                
                // Update local data
                employee.status = newStatus;
                
                // Refresh employee list
                if (dashboardManager && typeof dashboardManager.loadEmployeesContent === 'function') {
                    dashboardManager.loadEmployeesContent();
                }
                
                alert(`Employee status updated to ${newStatus}!`);
                return;
            }
        } catch (apiError) {
            logger.warn('API update failed, updating locally:', apiError.message);
        }
        
        // Fallback: Update locally
        employee.status = newStatus;
        
        // Refresh employee list
        if (dashboardManager && typeof dashboardManager.loadEmployeesContent === 'function') {
            dashboardManager.loadEmployeesContent();
        }
        
        alert(`Employee status updated to ${newStatus}! (Local update)`);
        
    } catch (error) {
        logger.error('Failed to update employee status:', error);
        alert('Failed to update employee status: ' + error.message);
        
        // Reset the dropdown to original value
        const select = document.querySelector(`select[onchange*="${employeeId}"]`);
        if (select) {
            select.value = employee.status || 'Active';
        }
    }
}

// ============================================================================
// PROJECT MANAGEMENT FUNCTIONS
// ============================================================================

// Filter projects function
function filterProjects() {
    const searchTerm = document.getElementById('projectSearch')?.value.toLowerCase() || '';
    const departmentFilter = document.getElementById('departmentFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    if (!window.allProjects) return;
    
    const filteredProjects = window.allProjects.filter(project => {
        const matchesSearch = !searchTerm || 
            (project.name && project.name.toLowerCase().includes(searchTerm)) ||
            (project.description && project.description.toLowerCase().includes(searchTerm)) ||
            (project.department && project.department.toLowerCase().includes(searchTerm));
        
        const matchesDepartment = !departmentFilter || project.department === departmentFilter;
        const matchesStatus = !statusFilter || project.status === statusFilter;
        
        return matchesSearch && matchesDepartment && matchesStatus;
    });
    
    // Re-render the project table with filtered results
    const projectTableBody = document.getElementById('projectTableBody');
    if (projectTableBody) {
        projectTableBody.innerHTML = filteredProjects.map(project => dashboardManager.renderProjectRow(project)).join('');
    }
}

// Add Project Modal
function showAddProjectModal() {
    console.log('🔧 Opening Add Project Modal...');
    logger.info('showAddProjectModal called');
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>Add New Project</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <form id="addProjectForm" class="modal-form">
                    <div class="form-section">
                        <h4>Project Information</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="projectName">Project Name *</label>
                                <input type="text" id="projectName" name="name" required placeholder="Enter project name">
                            </div>
                            <div class="form-group">
                                <label for="projectDepartment">Department *</label>
                                <select id="projectDepartment" name="department" required>
                                    <option value="">Select Department</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Human Resources">Human Resources</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Operations">Operations</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="projectDescription">Description *</label>
                                <textarea id="projectDescription" name="description" required placeholder="Enter project description" rows="3"></textarea>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="projectStatus">Status</label>
                                <select id="projectStatus" name="status">
                                    <option value="Planning" selected>Planning</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="On Hold">On Hold</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="projectPriority">Priority</label>
                                <select id="projectPriority" name="priority">
                                    <option value="Low">Low</option>
                                    <option value="Medium" selected>Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="projectProgress">Progress (%)</label>
                                <input type="number" id="projectProgress" name="progress" min="0" max="100" value="0">
                            </div>
                            <div class="form-group">
                                <label for="projectStartDate">Start Date</label>
                                <input type="date" id="projectStartDate" name="startDate">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="projectEndDate">End Date</label>
                                <input type="date" id="projectEndDate" name="endDate">
                            </div>
                            <div class="form-group">
                                <label for="projectBudget">Budget (₹)</label>
                                <input type="number" id="projectBudget" name="budget" min="0" step="0.01">
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal(this)">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="submitAddProject()">Add Project</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Submit Add Project
async function submitAddProject() {
    const form = document.getElementById('addProjectForm');
    if (!form) {
        alert('Form not found!');
        return;
    }
    
    const formData = new FormData(form);
    const projectData = Object.fromEntries(formData.entries());
    
    // Validate required fields
    if (!projectData.name || !projectData.department || !projectData.description) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Convert progress to number
    projectData.progress = parseInt(projectData.progress) || 0;
    projectData.budget = parseFloat(projectData.budget) || 0;
    
    try {
        logger.info('Creating project...', projectData);
        
        // Show loading state
        const submitBtn = document.querySelector('#addProjectForm').closest('.modal-container').querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating...';
        submitBtn.disabled = true;
        
        // Make API call to create project
        const response = await window.apiService.post('/projects', projectData);
        
        if (response && response.success) {
            logger.success('Project created successfully');
            
            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.remove();
            
            // Refresh projects list
            if (dashboardManager && typeof dashboardManager.loadProjectsContent === 'function') {
                await dashboardManager.loadProjectsContent();
            }
            
            // Refresh dashboard recent activity if on home page
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (currentUser && dashboardManager.currentContent === 'home') {
                await dashboardManager.loadHomeContent(currentUser);
            }
            
            alert('Project created successfully!');
        } else {
            throw new Error(response?.error || 'Failed to create project');
        }
        
    } catch (error) {
        logger.error('Failed to create project:', error);
        
        // Show user-friendly error messages
        let errorMessage = 'Failed to create project: ';
        if (error.message.includes('401')) {
            errorMessage += 'You are not authorized to create projects.';
        } else if (error.message.includes('400')) {
            errorMessage += 'Please check the project information and try again.';
        } else if (error.message.includes('409')) {
            errorMessage += 'A project with this name already exists.';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    } finally {
        // Restore button state
        const submitBtn = document.querySelector('#addProjectForm').closest('.modal-container').querySelector('.btn-primary');
        if (submitBtn) {
            submitBtn.textContent = 'Add Project';
            submitBtn.disabled = false;
        }
    }
}

// View Project Modal
function viewProject(projectId) {
    const project = window.allProjects?.find(proj => (proj._id || proj.id) === projectId);
    if (!project) {
        alert('Project not found');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3><i class="fas fa-project-diagram"></i> Project Details</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="project-details">
                    <div class="project-info-grid">
                        <div class="info-row">
                            <label>Project Name:</label>
                            <span>${project.name || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <label>Description:</label>
                            <span>${project.description || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <label>Department:</label>
                            <span>${project.department || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <label>Status:</label>
                            <span class="status-badge status-${(project.status || 'Planning').toLowerCase().replace(/\s+/g, '-')}">${project.status || 'Planning'}</span>
                        </div>
                        <div class="info-row">
                            <label>Priority:</label>
                            <span class="priority-badge priority-${(project.priority || 'Medium').toLowerCase()}">${project.priority || 'Medium'}</span>
                        </div>
                        <div class="info-row">
                            <label>Progress:</label>
                            <span>${project.progress || 0}%</span>
                        </div>
                        <div class="info-row">
                            <label>Start Date:</label>
                            <span>${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <label>End Date:</label>
                            <span>${project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <label>Budget:</label>
                            <span>₹${(project.budget || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="editProject('${projectId}')">
                    <i class="fas fa-edit"></i> Edit Project
                </button>
                <button class="btn btn-secondary" onclick="closeModal(this)">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Edit Project Modal
function editProject(projectId) {
    const project = window.allProjects?.find(proj => (proj._id || proj.id) === projectId);
    if (!project) {
        alert('Project not found');
        return;
    }
    
    // Close any existing modals
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> Edit Project</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editProjectForm" onsubmit="submitEditProject(event, '${projectId}')">
                    <div class="form-section">
                        <h4><i class="fas fa-project-diagram"></i> Project Information</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editProjectName">Project Name *</label>
                                <input type="text" id="editProjectName" name="name" value="${project.name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="editProjectDepartment">Department *</label>
                                <select id="editProjectDepartment" name="department" required>
                                    <option value="">Select Department</option>
                                    <option value="Engineering" ${project.department === 'Engineering' ? 'selected' : ''}>Engineering</option>
                                    <option value="Marketing" ${project.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
                                    <option value="Sales" ${project.department === 'Sales' ? 'selected' : ''}>Sales</option>
                                    <option value="Human Resources" ${project.department === 'Human Resources' ? 'selected' : ''}>Human Resources</option>
                                    <option value="Finance" ${project.department === 'Finance' ? 'selected' : ''}>Finance</option>
                                    <option value="Operations" ${project.department === 'Operations' ? 'selected' : ''}>Operations</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editProjectDescription">Description *</label>
                                <textarea id="editProjectDescription" name="description" required rows="3">${project.description || ''}</textarea>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editProjectStatus">Status</label>
                                <select id="editProjectStatus" name="status">
                                    <option value="Planning" ${project.status === 'Planning' ? 'selected' : ''}>Planning</option>
                                    <option value="In Progress" ${project.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="On Hold" ${project.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
                                    <option value="Completed" ${project.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                    <option value="Cancelled" ${project.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editProjectPriority">Priority</label>
                                <select id="editProjectPriority" name="priority">
                                    <option value="Low" ${project.priority === 'Low' ? 'selected' : ''}>Low</option>
                                    <option value="Medium" ${project.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                                    <option value="High" ${project.priority === 'High' ? 'selected' : ''}>High</option>
                                    <option value="Critical" ${project.priority === 'Critical' ? 'selected' : ''}>Critical</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editProjectProgress">Progress (%)</label>
                                <input type="number" id="editProjectProgress" name="progress" min="0" max="100" value="${project.progress || 0}">
                            </div>
                            <div class="form-group">
                                <label for="editProjectBudget">Budget (₹)</label>
                                <input type="number" id="editProjectBudget" name="budget" min="0" step="0.01" value="${project.budget || 0}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editProjectStartDate">Start Date</label>
                                <input type="date" id="editProjectStartDate" name="startDate" value="${project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : ''}">
                            </div>
                            <div class="form-group">
                                <label for="editProjectEndDate">End Date</label>
                                <input type="date" id="editProjectEndDate" name="endDate" value="${project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''}">
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="submit" form="editProjectForm" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save Changes
                </button>
                <button class="btn btn-secondary" onclick="closeModal(this)">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Submit Edit Project
async function submitEditProject(event, projectId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const projectData = Object.fromEntries(formData.entries());
    
    // Convert numeric fields
    projectData.progress = parseInt(projectData.progress) || 0;
    projectData.budget = parseFloat(projectData.budget) || 0;
    
    // Add loading state
    const submitBtn = form.querySelector('button[type="submit"]') || document.querySelector('button[form="editProjectForm"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitBtn.disabled = true;
    
    try {
        // Make API call to update project
        const response = await window.apiService.put(`/projects/${projectId}`, projectData);
        
        if (response && response.success) {
            logger.success('Project updated successfully');
            
            // Update local data
            const project = window.allProjects?.find(proj => (proj._id || proj.id) === projectId);
            if (project) {
                Object.assign(project, projectData);
            }
            
            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.remove();
            
            // Refresh projects list
            if (dashboardManager && typeof dashboardManager.loadProjectsContent === 'function') {
                await dashboardManager.loadProjectsContent();
            }
            
            alert('Project updated successfully!');
        } else {
            throw new Error(response?.error || 'Failed to update project');
        }
        
    } catch (error) {
        logger.error('Failed to update project:', error);
        
        // Show user-friendly error messages
        let errorMessage = 'Failed to update project: ';
        if (error.message.includes('401')) {
            errorMessage += 'You are not authorized to update this project.';
        } else if (error.message.includes('400')) {
            errorMessage += 'Please check the project information and try again.';
        } else if (error.message.includes('404')) {
            errorMessage += 'Project not found.';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Delete Project
function deleteProject(projectId, projectName) {
    if (!confirm(`Are you sure you want to delete the project "${projectName}"?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    if (!confirm(`Final confirmation: Delete project "${projectName}"?`)) {
        return;
    }
    
    deleteProjectConfirmed(projectId, projectName);
}

async function deleteProjectConfirmed(projectId, projectName) {
    try {
        logger.info(`Deleting project: ${projectName}`);
        
        // Make API call to delete project
        const response = await window.apiService.delete(`/projects/${projectId}`);
        
        if (response && response.success) {
            logger.success('Project deleted successfully');
            
            // Remove from local data
            if (window.allProjects) {
                window.allProjects = window.allProjects.filter(proj => (proj._id || proj.id) !== projectId);
            }
            
            // Refresh projects list
            if (dashboardManager && typeof dashboardManager.loadProjectsContent === 'function') {
                await dashboardManager.loadProjectsContent();
            }
            
            alert(`Project "${projectName}" deleted successfully!`);
        } else {
            throw new Error(response?.error || 'Failed to delete project');
        }
        
    } catch (error) {
        logger.error('Failed to delete project:', error);
        
        // Show user-friendly error messages
        let errorMessage = 'Failed to delete project: ';
        if (error.message.includes('401')) {
            errorMessage += 'You are not authorized to delete this project.';
        } else if (error.message.includes('404')) {
            errorMessage += 'Project not found.';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
}

// ============================================================================
// PAYROLL MANAGEMENT FUNCTIONS
// ============================================================================

// Filter payroll function
function filterPayrolls() {
    const searchTerm = document.getElementById('payrollSearch')?.value.toLowerCase() || '';
    const employeeFilter = document.getElementById('employeeFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const monthFilter = document.getElementById('monthFilter')?.value || '';
    
    if (!window.allPayrolls) return;
    
    const filteredPayrolls = window.allPayrolls.filter(payroll => {
        const employee = payroll.employee || {};
        const employeeName = employee.name || payroll.employeeName || '';
        
        const matchesSearch = !searchTerm || 
            employeeName.toLowerCase().includes(searchTerm) ||
            (employee.email && employee.email.toLowerCase().includes(searchTerm)) ||
            (payroll.period && `${payroll.period.year}`.includes(searchTerm));
        
        const matchesEmployee = !employeeFilter || 
            (payroll.employee && (payroll.employee._id || payroll.employee.id) === employeeFilter) ||
            payroll.employee === employeeFilter;
        
        const matchesStatus = !statusFilter || payroll.status === statusFilter;
        const matchesMonth = !monthFilter || (payroll.period && payroll.period.month === parseInt(monthFilter));
        
        return matchesSearch && matchesEmployee && matchesStatus && matchesMonth;
    });
    
    // Re-render the payroll table with filtered results
    const payrollTableBody = document.getElementById('payrollTableBody');
    if (payrollTableBody) {
        payrollTableBody.innerHTML = filteredPayrolls.map(payroll => dashboardManager.renderPayrollRow(payroll)).join('');
    }
}

// Process Payroll Modal
function showProcessPayrollModal() {
    console.log('🔧 Opening Process Payroll Modal...');
    logger.info('showProcessPayrollModal called');
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>Process Payroll</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <form id="processPayrollForm" class="modal-form">
                    <div class="form-section">
                        <h4>Payroll Period</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="payrollMonth">Month *</label>
                                <select id="payrollMonth" name="month" required>
                                    <option value="">Select Month</option>
                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                    <option value="7">July</option>
                                    <option value="8">August</option>
                                    <option value="9">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="payrollYear">Year *</label>
                                <input type="number" id="payrollYear" name="year" required min="2020" max="2030" value="${new Date().getFullYear()}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>Select Employee</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="payrollEmployee">Employee *</label>
                                <select id="payrollEmployee" name="employee" required>
                                    <option value="">Select Employee</option>
                                    ${window.allEmployees ? window.allEmployees.map(emp => `
                                        <option value="${emp._id || emp.id}">${emp.name} - ${emp.department}</option>
                                    `).join('') : ''}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>Salary Information</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="baseSalary">Base Salary (₹) *</label>
                                <input type="number" id="baseSalary" name="baseSalary" required min="0" step="100" placeholder="Enter base salary in ₹">
                            </div>
                            <div class="form-group">
                                <label for="bonus">Bonus (₹)</label>
                                <input type="number" id="bonus" name="bonus" min="0" step="100" value="0" placeholder="Enter bonus amount in ₹">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="deductions">Manual Deductions (₹)</label>
                                <input type="number" id="deductions" name="deductions" min="0" step="100" value="0" placeholder="Additional deductions">
                            </div>
                            <div class="form-group">
                                <label for="netPay">Net Pay (₹)</label>
                                <input type="number" id="netPay" name="netPay" readonly placeholder="Calculated automatically">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="taxCalculation">Tax Calculation</label>
                                <div class="tax-breakdown" id="taxBreakdown">
                                    <small>Tax will be calculated automatically based on Indian tax slabs</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>Additional Information</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="payrollStatus">Status</label>
                                <select id="payrollStatus" name="status">
                                    <option value="Pending" selected>Pending</option>
                                    <option value="Processed">Processed</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="payrollNotes">Notes</label>
                                <textarea id="payrollNotes" name="notes" rows="3" placeholder="Additional notes (optional)"></textarea>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal(this)">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="submitProcessPayroll()">Process Payroll</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners for automatic net pay calculation
    const baseSalaryInput = document.getElementById('baseSalary');
    const bonusInput = document.getElementById('bonus');
    const deductionsInput = document.getElementById('deductions');
    const netPayInput = document.getElementById('netPay');
    
    function calculateNetPay() {
        const baseSalary = parseFloat(baseSalaryInput.value) || 0;
        const bonus = parseFloat(bonusInput.value) || 0;
        const manualDeductions = parseFloat(deductionsInput.value) || 0;
        
        // Calculate Indian taxes
        const grossSalary = baseSalary + bonus;
        const taxCalculation = calculateIndianTaxes(grossSalary);
        
        // Calculate net pay
        const totalDeductions = taxCalculation.totalTax + manualDeductions;
        const netPay = grossSalary - totalDeductions;
        
        netPayInput.value = Math.round(netPay);
        
        // Update tax breakdown display
        updateTaxBreakdown(taxCalculation);
    }
    
    function calculateIndianTaxes(annualSalary) {
        // Indian Income Tax Slabs for FY 2024-25 (New Tax Regime)
        const taxSlabs = [
            { min: 0, max: 300000, rate: 0 },           // No tax
            { min: 300000, max: 600000, rate: 0.05 },   // 5%
            { min: 600000, max: 900000, rate: 0.10 },   // 10%
            { min: 900000, max: 1200000, rate: 0.15 },  // 15%
            { min: 1200000, max: 1500000, rate: 0.20 }, // 20%
            { min: 1500000, max: Infinity, rate: 0.30 }   // 30%
        ];
        
        let totalTax = 0;
        let remainingSalary = annualSalary;
        const taxBreakdown = [];
        
        for (const slab of taxSlabs) {
            if (remainingSalary <= 0) break;
            
            const taxableAmount = Math.min(remainingSalary, slab.max - slab.min);
            const taxOnThisSlab = taxableAmount * slab.rate;
            
            if (taxOnThisSlab > 0) {
                taxBreakdown.push({
                    slab: `₹${slab.min.toLocaleString()} - ₹${slab.max === Infinity ? '∞' : slab.max.toLocaleString()}`,
                    rate: `${(slab.rate * 100)}%`,
                    amount: taxOnThisSlab
                });
            }
            
            totalTax += taxOnThisSlab;
            remainingSalary -= taxableAmount;
        }
        
        // Calculate other deductions (approximate)
        const pf = Math.min(annualSalary * 0.12, 180000); // EPF (12% of salary, max ₹1.8L)
        const esi = annualSalary <= 21000 ? annualSalary * 0.0075 : 0; // ESI (0.75% if salary ≤ ₹21k)
        const professionalTax = 200; // Approximate professional tax
        
        return {
            totalTax: totalTax,
            pf: pf,
            esi: esi,
            professionalTax: professionalTax,
            totalDeductions: totalTax + pf + esi + professionalTax,
            taxBreakdown: taxBreakdown
        };
    }
    
    function updateTaxBreakdown(taxCalculation) {
        const taxBreakdownDiv = document.getElementById('taxBreakdown');
        if (!taxBreakdownDiv) return;
        
        const monthlyTax = taxCalculation.totalTax / 12;
        const monthlyPF = taxCalculation.pf / 12;
        const monthlyESI = taxCalculation.esi / 12;
        const monthlyProfTax = taxCalculation.professionalTax / 12;
        
        taxBreakdownDiv.innerHTML = `
            <div class="tax-details">
                <div class="tax-item">
                    <span>Income Tax (Monthly):</span>
                    <span>₹${Math.round(monthlyTax).toLocaleString()}</span>
                </div>
                <div class="tax-item">
                    <span>EPF (Monthly):</span>
                    <span>₹${Math.round(monthlyPF).toLocaleString()}</span>
                </div>
                <div class="tax-item">
                    <span>ESI (Monthly):</span>
                    <span>₹${Math.round(monthlyESI).toLocaleString()}</span>
                </div>
                <div class="tax-item">
                    <span>Professional Tax (Monthly):</span>
                    <span>₹${Math.round(monthlyProfTax).toLocaleString()}</span>
                </div>
                <div class="tax-item total">
                    <span><strong>Total Tax Deductions (Monthly):</strong></span>
                    <span><strong>₹${Math.round((taxCalculation.totalDeductions) / 12).toLocaleString()}</strong></span>
                </div>
            </div>
        `;
    }
    
    baseSalaryInput.addEventListener('input', calculateNetPay);
    bonusInput.addEventListener('input', calculateNetPay);
    deductionsInput.addEventListener('input', calculateNetPay);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Submit Process Payroll
async function submitProcessPayroll() {
    const form = document.getElementById('processPayrollForm');
    if (!form) {
        alert('Form not found!');
        return;
    }
    
    const formData = new FormData(form);
    const payrollData = Object.fromEntries(formData.entries());
    
    // Validate required fields
    if (!payrollData.month || !payrollData.year || !payrollData.employee || !payrollData.baseSalary) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Convert numeric fields
    payrollData.month = parseInt(payrollData.month);
    payrollData.year = parseInt(payrollData.year);
    payrollData.baseSalary = parseFloat(payrollData.baseSalary);
    payrollData.bonus = parseFloat(payrollData.bonus) || 0;
    payrollData.deductions = parseFloat(payrollData.deductions) || 0;
    payrollData.netPay = parseFloat(payrollData.netPay) || (payrollData.baseSalary + payrollData.bonus - payrollData.deductions);
    
    // Structure the data according to the backend schema
    const structuredData = {
        employee: payrollData.employee,
        period: {
            month: payrollData.month,
            year: payrollData.year
        },
        salary: {
            baseSalary: payrollData.baseSalary,
            bonus: payrollData.bonus,
            overtime: 0,
            allowances: {
                houseRent: 0,
                transport: 0,
                medical: 0,
                other: 0
            }
        },
        deductions: {
            tax: 0,
            insurance: 0,
            providentFund: 0,
            loan: 0,
            other: payrollData.deductions
        },
        netPay: payrollData.netPay,
        status: payrollData.status || 'Pending',
        notes: payrollData.notes || ''
    };
    
    try {
        logger.info('Processing payroll...', structuredData);
        
        // Show loading state
        const submitBtn = document.querySelector('#processPayrollForm').closest('.modal-container').querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        // Make API call to create payroll record
        const response = await makePayrollRequest('/payroll', structuredData);
        
        if (response && response.success) {
            logger.success('Payroll processed successfully');
            
            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.remove();
            
            // Refresh payroll list
            if (dashboardManager && typeof dashboardManager.loadPayrollContent === 'function') {
                await dashboardManager.loadPayrollContent();
            }
            
            alert('Payroll processed successfully!');
        } else {
            throw new Error(response?.error || 'Failed to process payroll');
        }
        
    } catch (error) {
        logger.error('Failed to process payroll:', error);
        
        // Show user-friendly error messages
        let errorMessage = 'Failed to process payroll: ';
        if (error.message.includes('401')) {
            errorMessage += 'You are not authorized to process payroll.';
        } else if (error.message.includes('400')) {
            errorMessage += 'Please check the payroll information and try again.';
        } else if (error.message.includes('409')) {
            errorMessage += 'Payroll for this employee and period already exists.';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    } finally {
        // Restore button state
        const submitBtn = document.querySelector('#processPayrollForm').closest('.modal-container').querySelector('.btn-primary');
        if (submitBtn) {
            submitBtn.textContent = 'Process Payroll';
            submitBtn.disabled = false;
        }
    }
}

// View Payroll Modal
function viewPayroll(payrollId) {
    const payroll = window.allPayrolls?.find(pay => (pay._id || pay.id) === payrollId);
    if (!payroll) {
        alert('Payroll record not found');
        return;
    }
    
    const employee = payroll.employee || {};
    const employeeName = employee.name || payroll.employeeName || 'Unknown Employee';
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3><i class="fas fa-money-bill-wave"></i> Payroll Details</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="payroll-details">
                    <div class="payroll-info-grid">
                        <div class="info-row">
                            <label>Employee:</label>
                            <span>${employeeName}</span>
                        </div>
                        <div class="info-row">
                            <label>Department:</label>
                            <span>${employee.department || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <label>Period:</label>
                            <span>${payroll.period ? `${dashboardManager.getMonthName(payroll.period.month)} ${payroll.period.year}` : 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <label>Status:</label>
                            <span class="status-badge status-${(payroll.status || 'Pending').toLowerCase()}">${payroll.status || 'Pending'}</span>
                        </div>
                        <div class="info-row">
                            <label>Base Salary:</label>
                            <span>₹${((payroll.salary?.baseSalary || payroll.baseSalary) || 0).toLocaleString()}</span>
                        </div>
                        <div class="info-row">
                            <label>Bonus:</label>
                            <span>₹${((payroll.salary?.bonus || payroll.bonus) || 0).toLocaleString()}</span>
                        </div>
                        <div class="info-row">
                            <label>Deductions:</label>
                            <span>₹${((payroll.salary?.deductions || payroll.deductions) || 0).toLocaleString()}</span>
                        </div>
                        <div class="info-row">
                            <label>Net Pay:</label>
                            <span><strong>₹${((payroll.salary?.netPay || payroll.netPay) || 0).toLocaleString()}</strong></span>
                        </div>
                        ${payroll.notes ? `
                            <div class="info-row">
                                <label>Notes:</label>
                                <span>${payroll.notes}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="editPayroll('${payrollId}')">
                    <i class="fas fa-edit"></i> Edit Payroll
                </button>
                <button class="btn btn-secondary" onclick="closeModal(this)">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Edit Payroll Modal
function editPayroll(payrollId) {
    const payroll = window.allPayrolls?.find(pay => (pay._id || pay.id) === payrollId);
    if (!payroll) {
        alert('Payroll record not found');
        return;
    }
    
    const employee = payroll.employee || {};
    const employeeName = employee.name || payroll.employeeName || 'Unknown Employee';
    
    // Close any existing modals
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> Edit Payroll</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editPayrollForm" onsubmit="submitEditPayroll(event, '${payrollId}')">
                    <div class="form-section">
                        <h4><i class="fas fa-user"></i> Employee Information</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editEmployeeName">Employee</label>
                                <input type="text" id="editEmployeeName" value="${employeeName}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="editDepartment">Department</label>
                                <input type="text" id="editDepartment" value="${employee.department || 'N/A'}" readonly>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editPeriod">Period</label>
                                <input type="text" id="editPeriod" value="${payroll.period ? `${dashboardManager.getMonthName(payroll.period.month)} ${payroll.period.year}` : 'N/A'}" readonly>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4><i class="fas fa-dollar-sign"></i> Salary Information</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editBaseSalary">Base Salary ($) *</label>
                                <input type="number" id="editBaseSalary" name="baseSalary" required min="0" step="0.01" value="${(payroll.salary?.baseSalary || payroll.baseSalary) || 0}">
                            </div>
                            <div class="form-group">
                                <label for="editBonus">Bonus ($)</label>
                                <input type="number" id="editBonus" name="bonus" min="0" step="0.01" value="${(payroll.salary?.bonus || payroll.bonus) || 0}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editDeductions">Deductions ($)</label>
                                <input type="number" id="editDeductions" name="deductions" min="0" step="0.01" value="${(payroll.salary?.deductions || payroll.deductions) || 0}">
                            </div>
                            <div class="form-group">
                                <label for="editNetPay">Net Pay ($)</label>
                                <input type="number" id="editNetPay" name="netPay" readonly value="${(payroll.salary?.netPay || payroll.netPay) || 0}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4><i class="fas fa-cog"></i> Status & Notes</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editPayrollStatus">Status</label>
                                <select id="editPayrollStatus" name="status">
                                    <option value="Pending" ${payroll.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="Processed" ${payroll.status === 'Processed' ? 'selected' : ''}>Processed</option>
                                    <option value="Paid" ${payroll.status === 'Paid' ? 'selected' : ''}>Paid</option>
                                    <option value="Cancelled" ${payroll.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editPayrollNotes">Notes</label>
                                <textarea id="editPayrollNotes" name="notes" rows="3">${payroll.notes || ''}</textarea>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="submit" form="editPayrollForm" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save Changes
                </button>
                <button class="btn btn-secondary" onclick="closeModal(this)">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners for automatic net pay calculation
    const baseSalaryInput = document.getElementById('editBaseSalary');
    const bonusInput = document.getElementById('editBonus');
    const deductionsInput = document.getElementById('editDeductions');
    const netPayInput = document.getElementById('editNetPay');
    
    function calculateNetPay() {
        const baseSalary = parseFloat(baseSalaryInput.value) || 0;
        const bonus = parseFloat(bonusInput.value) || 0;
        const deductions = parseFloat(deductionsInput.value) || 0;
        const netPay = baseSalary + bonus - deductions;
        netPayInput.value = netPay.toFixed(2);
    }
    
    baseSalaryInput.addEventListener('input', calculateNetPay);
    bonusInput.addEventListener('input', calculateNetPay);
    deductionsInput.addEventListener('input', calculateNetPay);
}

// Submit Edit Payroll
async function submitEditPayroll(event, payrollId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const payrollData = Object.fromEntries(formData.entries());
    
    // Convert numeric fields
    payrollData.baseSalary = parseFloat(payrollData.baseSalary) || 0;
    payrollData.bonus = parseFloat(payrollData.bonus) || 0;
    payrollData.deductions = parseFloat(payrollData.deductions) || 0;
    payrollData.netPay = parseFloat(payrollData.netPay) || (payrollData.baseSalary + payrollData.bonus - payrollData.deductions);
    
    // Structure the data according to the backend schema
    const structuredData = {
        salary: {
            baseSalary: payrollData.baseSalary,
            bonus: payrollData.bonus,
            overtime: 0,
            allowances: {
                houseRent: 0,
                transport: 0,
                medical: 0,
                other: 0
            }
        },
        deductions: {
            tax: 0,
            insurance: 0,
            providentFund: 0,
            loan: 0,
            other: payrollData.deductions
        },
        netPay: payrollData.netPay,
        status: payrollData.status || 'Pending',
        notes: payrollData.notes || ''
    };
    
    // Add loading state
    const submitBtn = form.querySelector('button[type="submit"]') || document.querySelector('button[form="editPayrollForm"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitBtn.disabled = true;
    
    try {
        // Make API call to update payroll record
        const response = await window.apiService.put(`/payroll/${payrollId}`, structuredData);
        
        if (response && response.success) {
            logger.success('Payroll updated successfully');
            
            // Update local data
            const payroll = window.allPayrolls?.find(pay => (pay._id || pay.id) === payrollId);
            if (payroll) {
                Object.assign(payroll, structuredData);
            }
            
            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.remove();
            
            // Refresh payroll list
            if (dashboardManager && typeof dashboardManager.loadPayrollContent === 'function') {
                await dashboardManager.loadPayrollContent();
            }
            
            alert('Payroll updated successfully!');
        } else {
            throw new Error(response?.error || 'Failed to update payroll');
        }
        
    } catch (error) {
        logger.error('Failed to update payroll:', error);
        
        // Show user-friendly error messages
        let errorMessage = 'Failed to update payroll: ';
        if (error.message.includes('401')) {
            errorMessage += 'You are not authorized to update this payroll.';
        } else if (error.message.includes('400')) {
            errorMessage += 'Please check the payroll information and try again.';
        } else if (error.message.includes('404')) {
            errorMessage += 'Payroll record not found.';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Delete Payroll
function deletePayroll(payrollId, employeeName) {
    if (!confirm(`Are you sure you want to delete the payroll record for "${employeeName}"?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    if (!confirm(`Final confirmation: Delete payroll record for "${employeeName}"?`)) {
        return;
    }
    
    deletePayrollConfirmed(payrollId, employeeName);
}

async function deletePayrollConfirmed(payrollId, employeeName) {
    try {
        logger.info(`Deleting payroll record for: ${employeeName}`);
        
        // Make API call to delete payroll record
        const response = await window.apiService.delete(`/payroll/${payrollId}`);
        
        if (response && response.success) {
            logger.success('Payroll record deleted successfully');
            
            // Remove from local data
            if (window.allPayrolls) {
                window.allPayrolls = window.allPayrolls.filter(pay => (pay._id || pay.id) !== payrollId);
            }
            
            // Refresh payroll list
            if (dashboardManager && typeof dashboardManager.loadPayrollContent === 'function') {
                await dashboardManager.loadPayrollContent();
            }
            
            alert(`Payroll record for "${employeeName}" deleted successfully!`);
        } else {
            throw new Error(response?.error || 'Failed to delete payroll record');
        }
        
    } catch (error) {
        logger.error('Failed to delete payroll record:', error);
        
        // Show user-friendly error messages
        let errorMessage = 'Failed to delete payroll record: ';
        if (error.message.includes('401')) {
            errorMessage += 'You are not authorized to delete this payroll record.';
        } else if (error.message.includes('404')) {
            errorMessage += 'Payroll record not found.';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
}

// Make functions globally available
window.filterEmployees = filterEmployees;
window.clearFilters = clearFilters;
window.viewEmployee = viewEmployee;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.submitEditEmployee = submitEditEmployee;
window.updateEmployeeStatus = updateEmployeeStatus;

// Project functions
window.filterProjects = filterProjects;
window.showAddProjectModal = showAddProjectModal;
window.submitAddProject = submitAddProject;
window.viewProject = viewProject;
window.editProject = editProject;
window.submitEditProject = submitEditProject;
window.deleteProject = deleteProject;
window.deleteProjectConfirmed = deleteProjectConfirmed;

// Payroll functions
window.filterPayrolls = filterPayrolls;
window.showProcessPayrollModal = showProcessPayrollModal;
window.submitProcessPayroll = submitProcessPayroll;
window.viewPayroll = viewPayroll;
window.editPayroll = editPayroll;
window.submitEditPayroll = submitEditPayroll;
window.deletePayroll = deletePayroll;
window.deletePayrollConfirmed = deletePayrollConfirmed;

// ============================================================================
// EXPORT FOR DEBUGGING
// ============================================================================
window.AppState = AppState;
window.DOMElements = DOMElements;

logger.info('App-direct.js loaded successfully');
