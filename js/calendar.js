// Calendar module
import { sampleData } from './data.js';

export function updateMiniCalendar() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    const miniCalendar = document.getElementById('miniCalendar');
    miniCalendar.innerHTML = `
        <div class="calendar-header">
            <span style="font-weight: bold;">${monthNames[currentMonth]} ${currentYear}</span>
        </div>
        <div class="calendar-grid">
            <div class="calendar-day">Sun</div>
            <div class="calendar-day">Mon</div>
            <div class="calendar-day">Tue</div>
            <div class="calendar-day">Wed</div>
            <div class="calendar-day">Thu</div>
            <div class="calendar-day">Fri</div>
            <div class="calendar-day">Sat</div>
        </div>
        <div class="calendar-grid" id="calendarDates">
        </div>
    `;
    
    const calendarDates = document.getElementById('calendarDates');
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-date';
        calendarDates.appendChild(emptyCell);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateCell = document.createElement('div');
        dateCell.className = 'calendar-date';
        dateCell.textContent = day;
        
        // Check if today
        if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dateCell.classList.add('today');
        }
        
        // Check if has event
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (sampleData.calendarEvents.some(event => event.date === dateStr)) {
            dateCell.classList.add('event');
        }
        
        calendarDates.appendChild(dateCell);
    }
}

export function loadCalendarContent() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="card-header">
            <h3 class="card-title">Company Calendar</h3>
            <button class="btn btn-primary">Add Event</button>
        </div>
        <div class="calendar">
            <div class="calendar-header">
                <button class="btn-action btn-primary"><i class="fas fa-chevron-left"></i></button>
                <h3>October 2023</h3>
                <button class="btn-action btn-primary"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day">Sun</div>
                <div class="calendar-day">Mon</div>
                <div class="calendar-day">Tue</div>
                <div class="calendar-day">Wed</div>
                <div class="calendar-day">Thu</div>
                <div class="calendar-day">Fri</div>
                <div class="calendar-day">Sat</div>
            </div>
            <div class="calendar-grid" id="fullCalendar">
                <!-- Calendar dates will be populated here -->
            </div>
        </div>
        <div style="margin-top: 2rem;">
            <h4>Upcoming Events</h4>
            <ul style="list-style: none; margin-top: 1rem;">
                ${sampleData.calendarEvents.map(event => `
                    <li style="padding: 0.5rem 0; border-bottom: 1px solid var(--gray-light);">
                        <strong>${event.date}</strong>: ${event.title}
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
    
    // Populate the full calendar
    const fullCalendar = document.getElementById('fullCalendar');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-date';
        fullCalendar.appendChild(emptyCell);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateCell = document.createElement('div');
        dateCell.className = 'calendar-date';
        dateCell.textContent = day;
        
        if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dateCell.classList.add('today');
        }
        
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (sampleData.calendarEvents.some(event => event.date === dateStr)) {
            dateCell.classList.add('event');
        }
        
        fullCalendar.appendChild(dateCell);
    }
}

