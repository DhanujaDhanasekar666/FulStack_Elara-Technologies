// Modal and Form Management Module
import dataService from './api/dataService.js';

// Modal HTML template
export function createModal(title, content, footer = '') {
    return `
        <div class="modal-overlay" id="modalOverlay">
            <div class="modal-container">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        </div>
    `;
}

// Close modal function (global)
window.closeModal = function() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
        modal.remove();
    }
};

// Employee Modals
export function showAddEmployeeModal() {
    const modalHTML = createModal(
        'Add New Employee',
        `
        <form id="addEmployeeForm" class="modal-form">
            <div class="form-group">
                <label>Employee ID</label>
                <input type="text" name="employeeId" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" name="name" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Department</label>
                <select name="department" class="form-control" required>
                    <option value="Engineering">Engineering</option>
                    <option value="HR">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                </select>
            </div>
            <div class="form-group">
                <label>Position</label>
                <input type="text" name="position" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select name="status" class="form-control" required>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>
        </form>
        `,
        `
        <button class="btn btn-danger" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitEmployeeForm()">Add Employee</button>
        `
    );
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.submitEmployeeForm = async function() {
    const form = document.getElementById('addEmployeeForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await dataService.createEmployee(data);
        if (response.success) {
            alert('Employee added successfully!');
            closeModal();
            // Reload employees
            window.location.reload();
        }
    } catch (error) {
        alert('Error adding employee: ' + error.message);
    }
};

export function showViewEmployeeModal(employee) {
    const modalHTML = createModal(
        'Employee Details',
        `
        <div class="employee-details">
            <p><strong>ID:</strong> ${employee.id || employee.employeeId}</p>
            <p><strong>Name:</strong> ${employee.name}</p>
            <p><strong>Email:</strong> ${employee.email || 'N/A'}</p>
            <p><strong>Department:</strong> ${employee.department}</p>
            <p><strong>Position:</strong> ${employee.position}</p>
            <p><strong>Status:</strong> <span class="status status-${employee.status.toLowerCase()}">${employee.status}</span></p>
        </div>
        `,
        `<button class="btn btn-primary" onclick="closeModal()">Close</button>`
    );
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

export function showEditEmployeeModal(employee) {
    const modalHTML = createModal(
        'Edit Employee',
        `
        <form id="editEmployeeForm" class="modal-form">
            <input type="hidden" name="id" value="${employee.id}">
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" name="name" class="form-control" value="${employee.name}" required>
            </div>
            <div class="form-group">
                <label>Department</label>
                <select name="department" class="form-control" required>
                    <option value="Engineering" ${employee.department === 'Engineering' ? 'selected' : ''}>Engineering</option>
                    <option value="HR" ${employee.department === 'HR' ? 'selected' : ''}>Human Resources</option>
                    <option value="Finance" ${employee.department === 'Finance' ? 'selected' : ''}>Finance</option>
                    <option value="Marketing" ${employee.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
                    <option value="Sales" ${employee.department === 'Sales' ? 'selected' : ''}>Sales</option>
                </select>
            </div>
            <div class="form-group">
                <label>Position</label>
                <input type="text" name="position" class="form-control" value="${employee.position}" required>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select name="status" class="form-control" required>
                    <option value="Active" ${employee.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Inactive" ${employee.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
        </form>
        `,
        `
        <button class="btn btn-danger" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="updateEmployeeForm()">Update Employee</button>
        `
    );
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.updateEmployeeForm = async function() {
    const form = document.getElementById('editEmployeeForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const id = data.id;
    delete data.id;
    
    try {
        const response = await dataService.updateEmployee(id, data);
        if (response.success) {
            alert('Employee updated successfully!');
            closeModal();
            window.location.reload();
        }
    } catch (error) {
        alert('Error updating employee: ' + error.message);
    }
};

// Attendance Modals
export function showMarkAttendanceModal() {
    const modalHTML = createModal(
        'Mark Attendance',
        `
        <form id="attendanceForm" class="modal-form">
            <div class="form-group">
                <label>Employee</label>
                <select name="employeeId" class="form-control" required>
                    <option value="">Select Employee</option>
                    <option value="1">John Doe</option>
                    <option value="2">Jane Smith</option>
                    <option value="3">Mike Johnson</option>
                </select>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" name="date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label>Check In Time</label>
                <input type="time" name="checkIn" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Check Out Time</label>
                <input type="time" name="checkOut" class="form-control">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select name="status" class="form-control" required>
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Absent">Absent</option>
                </select>
            </div>
        </form>
        `,
        `
        <button class="btn btn-danger" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitAttendanceForm()">Mark Attendance</button>
        `
    );
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.submitAttendanceForm = async function() {
    const form = document.getElementById('attendanceForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await dataService.createAttendance(data);
        if (response.success) {
            alert('Attendance marked successfully!');
            closeModal();
            window.location.reload();
        }
    } catch (error) {
        alert('Error marking attendance: ' + error.message);
    }
};

// Leave Request Modals
export function showLeaveRequestModal() {
    const modalHTML = createModal(
        'Request Leave',
        `
        <form id="leaveRequestForm" class="modal-form">
            <div class="form-group">
                <label>Leave Type</label>
                <select name="type" class="form-control" required>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Personal">Personal</option>
                    <option value="Emergency">Emergency</option>
                </select>
            </div>
            <div class="form-group">
                <label>Start Date</label>
                <input type="date" name="startDate" class="form-control" required>
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="date" name="endDate" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Reason</label>
                <textarea name="reason" class="form-control" rows="4" required></textarea>
            </div>
        </form>
        `,
        `
        <button class="btn btn-danger" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitLeaveRequestForm()">Submit Request</button>
        `
    );
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.submitLeaveRequestForm = async function() {
    const form = document.getElementById('leaveRequestForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await dataService.createLeaveRequest(data);
        if (response.success) {
            alert('Leave request submitted successfully!');
            closeModal();
            window.location.reload();
        }
    } catch (error) {
        alert('Error submitting leave request: ' + error.message);
    }
};

window.approveLeave = async function(leaveId) {
    if (confirm('Approve this leave request?')) {
        try {
            const response = await dataService.updateLeaveRequest(leaveId, { status: 'Approved' });
            if (response.success) {
                alert('Leave approved!');
                window.location.reload();
            }
        } catch (error) {
            alert('Error approving leave: ' + error.message);
        }
    }
};

window.rejectLeave = async function(leaveId) {
    if (confirm('Reject this leave request?')) {
        try {
            const response = await dataService.updateLeaveRequest(leaveId, { status: 'Rejected' });
            if (response.success) {
                alert('Leave rejected!');
                window.location.reload();
            }
        } catch (error) {
            alert('Error rejecting leave: ' + error.message);
        }
    }
};

// Disciplinary Record Modals
export function showAddDisciplinaryModal() {
    const modalHTML = createModal(
        'Add Disciplinary Record',
        `
        <form id="disciplinaryForm" class="modal-form">
            <div class="form-group">
                <label>Employee</label>
                <select name="employeeId" class="form-control" required>
                    <option value="">Select Employee</option>
                    <option value="1">John Doe</option>
                    <option value="2">Jane Smith</option>
                </select>
            </div>
            <div class="form-group">
                <label>Type</label>
                <select name="type" class="form-control" required>
                    <option value="Warning">Warning</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Termination">Termination</option>
                </select>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" name="date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label>Reason</label>
                <textarea name="reason" class="form-control" rows="4" required></textarea>
            </div>
            <div class="form-group">
                <label>Action Taken</label>
                <textarea name="action" class="form-control" rows="3" required></textarea>
            </div>
        </form>
        `,
        `
        <button class="btn btn-danger" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitDisciplinaryForm()">Add Record</button>
        `
    );
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.submitDisciplinaryForm = async function() {
    const form = document.getElementById('disciplinaryForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await dataService.createDisciplinary(data);
        if (response.success) {
            alert('Disciplinary record added successfully!');
            closeModal();
            window.location.reload();
        }
    } catch (error) {
        alert('Error adding record: ' + error.message);
    }
};

// Payroll Modals
export function showProcessPayrollModal() {
    const modalHTML = createModal(
        'Process Payroll',
        `
        <form id="payrollForm" class="modal-form">
            <div class="form-group">
                <label>Employee</label>
                <select name="employeeId" class="form-control" required>
                    <option value="">Select Employee</option>
                    <option value="1">John Doe</option>
                    <option value="2">Jane Smith</option>
                </select>
            </div>
            <div class="form-group">
                <label>Base Salary</label>
                <input type="number" name="baseSalary" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Bonus</label>
                <input type="number" name="bonus" class="form-control" value="0">
            </div>
            <div class="form-group">
                <label>Deductions</label>
                <input type="number" name="deductions" class="form-control" value="0">
            </div>
            <div class="form-group">
                <label>Period</label>
                <input type="month" name="period" class="form-control" required>
            </div>
        </form>
        `,
        `
        <button class="btn btn-danger" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitPayrollForm()">Process Payroll</button>
        `
    );
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.submitPayrollForm = async function() {
    const form = document.getElementById('payrollForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Calculate net pay
    const baseSalary = parseFloat(data.baseSalary) || 0;
    const bonus = parseFloat(data.bonus) || 0;
    const deductions = parseFloat(data.deductions) || 0;
    data.netPay = baseSalary + bonus - deductions;
    
    try {
        const response = await dataService.createPayroll(data);
        if (response.success) {
            alert('Payroll processed successfully!');
            closeModal();
            window.location.reload();
        }
    } catch (error) {
        alert('Error processing payroll: ' + error.message);
    }
};

window.viewPayrollDetails = function(payroll) {
    const modalHTML = createModal(
        'Payroll Details',
        `
        <div class="payroll-details">
            <p><strong>Employee:</strong> ${payroll.employee}</p>
            <p><strong>Period:</strong> ${payroll.period}</p>
            <p><strong>Base Salary:</strong> $${payroll.baseSalary.toLocaleString()}</p>
            <p><strong>Bonus:</strong> $${payroll.bonus.toLocaleString()}</p>
            <p><strong>Deductions:</strong> $${payroll.deductions.toLocaleString()}</p>
            <p><strong>Net Pay:</strong> <span style="font-size: 1.5rem; color: var(--success)">$${payroll.netPay.toLocaleString()}</span></p>
            <p><strong>Status:</strong> <span class="status status-${payroll.status.toLowerCase()}">${payroll.status}</span></p>
        </div>
        `,
        `<button class="btn btn-primary" onclick="closeModal()">Close</button>`
    );
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// Export all functions
export { closeModal };






