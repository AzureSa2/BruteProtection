// Utility to format time
function formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(date);
}

// Generate random IP
function getRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

const services = ['SSH', 'Web App', 'FTP', 'RDP'];
const users = ['admin', 'root', 'user', 'test', 'postgres'];

// State
let dashboardData = {
    totalAttempts: 1248,
    activeThreats: 34,
    blockedIps: 412,
    attemptsHistory: Array(24).fill(0).map(() => Math.floor(Math.random() * 50) + 10),
    logs: [],
    blocked: []
};

// Initial data generation
for(let i=0; i<15; i++) {
    const time = new Date(Date.now() - Math.floor(Math.random() * 3600000));
    dashboardData.logs.push({
        time: formatTime(time),
        ip: getRandomIP(),
        service: services[Math.floor(Math.random() * services.length)],
        user: users[Math.floor(Math.random() * users.length)],
        status: Math.random() > 0.8 ? 'Blocked' : 'Failed'
    });
}
for(let i=0; i<5; i++) {
    dashboardData.blocked.push({
        ip: getRandomIP(),
        reason: 'Exceeded failed login threshold',
        blockTime: formatTime(new Date(Date.now() - Math.floor(Math.random() * 7200000))),
        expiration: 'Permanent'
    });
}


// UI Controllers
const CTRLS = {
    totalAttempts: document.getElementById('total-attempts'),
    activeThreats: document.getElementById('active-threats'),
    blockedIps: document.getElementById('blocked-ips'),
    attemptChart: document.getElementById('attempt-chart'),
    activityList: document.getElementById('activity-list'),
    logsTbody: document.getElementById('logs-tbody'),
    blockedTbody: document.getElementById('blocked-tbody'),
};

function initUI() {
    updateCards();
    renderChart();
    renderActivity();
    renderLogs();
    renderBlocked();
    setupNavigation();
}

function updateCards() {
    CTRLS.totalAttempts.innerText = dashboardData.totalAttempts.toLocaleString();
    CTRLS.activeThreats.innerText = dashboardData.activeThreats;
    CTRLS.blockedIps.innerText = dashboardData.blockedIps;
}

function renderChart() {
    CTRLS.attemptChart.innerHTML = '';
    const max = Math.max(...dashboardData.attemptsHistory, 100);
    dashboardData.attemptsHistory.forEach(val => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        const heightPercent = (val / max) * 100;
        bar.style.height = `${Math.max(5, heightPercent)}%`;
        bar.title = `${val} attempts`;
        CTRLS.attemptChart.appendChild(bar);
    });
}

function renderActivity() {
    CTRLS.activityList.innerHTML = '';
    dashboardData.logs.slice(0, 5).forEach(log => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        const isBlocked = log.status === 'Blocked';
        li.innerHTML = `
            <div class="activity-dot ${isBlocked ? 'red' : 'orange'}"></div>
            <div class="activity-details">
                <h4>${isBlocked ? 'IP Blocked' : 'Brute Force attempt'}</h4>
                <p>${log.ip} via ${log.service} (User: ${log.user}) - ${log.time}</p>
            </div>
        `;
        CTRLS.activityList.appendChild(li);
    });
}

function renderLogs() {
    CTRLS.logsTbody.innerHTML = '';
    dashboardData.logs.forEach(log => {
        const tr = document.createElement('tr');
        const isBlocked = log.status === 'Blocked';
        tr.innerHTML = `
            <td>${log.time}</td>
            <td style="font-family: monospace; color: var(--accent-blue)">${log.ip}</td>
            <td>${log.service}</td>
            <td>${log.user}</td>
            <td><span class="status-badge ${isBlocked ? 'blocked' : 'failed'}">${log.status}</span></td>
        `;
        CTRLS.logsTbody.appendChild(tr);
    });
}

function renderBlocked() {
    CTRLS.blockedTbody.innerHTML = '';
    dashboardData.blocked.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-family: monospace; color: var(--accent-red)">${item.ip}</td>
            <td>${item.reason}</td>
            <td>${item.blockTime}</td>
            <td>${item.expiration}</td>
            <td><button class="btn btn-small danger-btn-outline" onclick="unblockIP(${index})">Unblock</button></td>
        `;
        CTRLS.blockedTbody.appendChild(tr);
    });
}

// Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.content-area');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href').substring(1);
            
            // Update active nav
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Show target view
            views.forEach(v => {
                if(v.id === `view-${targetId}`) {
                    v.classList.remove('hidden');
                } else {
                    v.classList.add('hidden');
                }
            });
        });
    });
}

// Actions
window.unblockIP = function(index) {
    dashboardData.blocked.splice(index, 1);
    dashboardData.blockedIps--;
    updateCards();
    renderBlocked();
}

// Simulation loop
setInterval(() => {
    // Simulate new attempt
    const newAttempt = {
        time: formatTime(new Date()),
        ip: getRandomIP(),
        service: services[Math.floor(Math.random() * services.length)],
        user: users[Math.floor(Math.random() * users.length)],
        status: 'Failed'
    };
    
    dashboardData.totalAttempts++;
    
    // Potentially block
    if(Math.random() > 0.85) {
        newAttempt.status = 'Blocked';
        dashboardData.blockedIps++;
        dashboardData.activeThreats = Math.min(dashboardData.activeThreats + 1, 100);
        dashboardData.blocked.unshift({
             ip: newAttempt.ip,
             reason: 'Exceeded failed login threshold',
             blockTime: formatTime(new Date()),
             expiration: '24 Hours'
        });
        renderBlocked();
    }

    dashboardData.logs.unshift(newAttempt);
    if(dashboardData.logs.length > 50) dashboardData.logs.pop(); // Keep array bounded
    
    // Update history
    dashboardData.attemptsHistory[dashboardData.attemptsHistory.length - 1]++;

    // Re-render
    updateCards();
    renderChart();
    renderActivity();
    
    // Only update logs if observing it to save DOM operations, but for simplicity:
    if(!document.getElementById('view-logs').classList.contains('hidden')) {
        renderLogs();
    }
}, 3500); // Simulate event every ~3.5 seconds

// Shift the attempt history window every minute
setInterval(() => {
    dashboardData.attemptsHistory.shift();
    dashboardData.attemptsHistory.push(0);
    renderChart();
}, 60000);

// Start
initUI();
