/**
 * Main Application Controller
 * Handles authentication, API communication, and dynamic UI rendering
 */

// Global state
let currentUser = null;
let authToken = localStorage.getItem('authToken') || null;
let projects = [];
let teams = [];
let currentSection = 'dashboard';

// API Helper Functions
const api = {
    request: async (endpoint, options = {}) => {
        const url = `${APP_CONFIG.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(url, { ...options, headers });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error?.message || 'API request failed');
        }

        return data;
    },

    // Auth endpoints
    register: (userData) => api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),

    login: (credentials) => api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),

    getMe: () => api.request('/auth/me'),

    updateProfile: (data) => api.request('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    deleteAccount: () => api.request('/auth/me', {
        method: 'DELETE'
    }),

    // Project endpoints
    createProject: (projectData) => api.request('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
    }),

    getProjects: (params = '') => api.request(`/projects${params}`),

    getProject: (id) => api.request(`/projects/${id}`),

    updateProject: (id, data) => api.request(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    deleteProject: (id) => api.request(`/projects/${id}`, {
        method: 'DELETE'
    }),

    getStats: () => api.request('/projects/stats'),

    // Team endpoints (admin only)
    getAllUsers: () => api.request('/auth/users'),
};

// Auth Functions
function showLogin() {
    document.getElementById('register-page').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('login-form').reset();
    document.getElementById('login-error').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('register-page').classList.remove('hidden');
    document.getElementById('register-form').reset();
    document.getElementById('register-error').classList.add('hidden');
    document.getElementById('register-success').classList.add('hidden');
}

// Check auth status on load
async function checkAuth() {
    const loading = document.getElementById('auth-loading');
    const dashboard = document.getElementById('dashboard-app');
    const loginPage = document.getElementById('login-page');
    
    if (authToken) {
        try {
            const res = await api.getMe();
            currentUser = res.data.user;
            updateUserAvatar();
            dashboard.classList.remove('hidden');
            loginPage.classList.add('hidden');
            loading.classList.add('hidden');
            loadProjects();
            setActiveSection('dashboard');
        } catch (error) {
            localStorage.removeItem('authToken');
            authToken = null;
            showLogin();
            loading.classList.add('hidden');
        }
    } else {
        dashboard.classList.add('hidden');
        showLogin();
        loading.classList.add('hidden');
        }
}

// Update user avatar initials
function updateUserAvatar() {
    if (currentUser) {
        const initials = (currentUser.username || 'U').substring(0, 2).toUpperCase();
        document.getElementById('user-initials').textContent = initials;
    }
}

// Login handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    try {
        const res = await api.login({ email, password });
        authToken = res.token;
        localStorage.setItem('authToken', authToken);
        checkAuth();
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
    }
});

// Register handler
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    
    try {
        const res = await api.register({ username, email, password });
        successDiv.textContent = 'Registration successful! Please log in.';
        successDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        setTimeout(showLogin, 1500);
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
        successDiv.classList.add('hidden');
    }
});

// Logout
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    document.getElementById('dashboard-app').classList.add('hidden');
        showLogin();
}

// Navigation
function setActiveSection(section) {
    currentSection = section;
    const pageTitle = {
        'dashboard': 'Dashboard',
        'projects': 'Projects',
        'team': 'Team Control',
        'services': 'Services & Pricing',
        'profile': 'Profile'
    }[section] || 'Dashboard';
    
    document.getElementById('page-title').textContent = pageTitle;

    const content = document.getElementById('main-content');
    content.innerHTML = getSectionContent(section);
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'bg-gray-800');
        link.classList.add('text-gray-300');
    });
    
    // Find and highlight the clicked link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.textContent.trim().toLowerCase().includes(section) || 
            (section === 'dashboard' && link.textContent.trim() === 'Dashboard') ||
            (section === 'profile' && link.textContent.trim() === 'Profile')) {
            link.classList.add('active', 'bg-gray-800');
            link.classList.remove('text-gray-300');
        }
    });
    if (section === 'projects') loadProjects();
    if (section === 'dashboard') loadDashboard();
    if (section === 'team') loadTeam();
    if (section === 'profile') loadProfile();
}

// Get section content
function getSectionContent(section) {
    switch (section) {
        case 'dashboard': return getDashboardHTML();
        case 'projects': return getProjectsHTML();
        case 'team': return getTeamHTML();
        case 'services': return getServicesHTML();
        case 'profile': return getProfileHTML();
        default: return '';
    }
}

// Dashboard rendering
async function loadDashboard() {
    try {
        const stats = await api.getStats();
        const statsData = stats.data.stats;
        document.getElementById('stats-content').innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <div class="text-2xl font-bold text-blue-600">${statsData.total || 0}</div>
                    <div class="text-sm text-gray-500">Total Projects</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <div class="text-2xl font-bold text-yellow-600">${statsData.pending || 0}</div>
                    <div class="text-sm text-gray-500">Pending</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <div class="text-2xl font-bold text-blue-600">${statsData.in_progress || 0}</div>
                    <div class="text-sm text-gray-500">In Progress</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <div class="text-2xl font-bold text-green-600">${statsData.completed || 0}</div>
                    <div class="text-sm text-gray-500">Completed</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <div class="text-2xl font-bold text-red-600">${statsData.cancelled || 0}</div>
                    <div class="text-sm text-gray-500">Cancelled</div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

function getDashboardHTML() {
    return `
        <div class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-800">Project Statistics</h2>
            <div id="stats-content">
                <div class="animate-pulse">
                    <div class="h-4 bg-gray-200 rounded w-full mb-4"></div>
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                        ${Array(5).fill().map(() => '<div class="h-20 bg-gray-200 rounded"></div>').join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getProjectsHTML() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-800">Projects</h2>
                <button onclick="openProjectModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <i class="fas fa-plus mr-2"></i>New Project
                </button>
            </div>
            <div id="projects-table" class="bg-white rounded-lg shadow overflow-hidden">
                        </div>
    `;
}

async function loadProjects() {
    try {
        const res = await api.getProjects();
        projects = res.data.projects;
        renderProjectsTable();
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

function renderProjectsTable() {
    const container = document.getElementById('projects-table');
    if (!container) return;
    
    if (projects.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-gray-500">No projects yet. Create one!</div>';
        return;
    }

    container.innerHTML = `
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="text-left p-4 font-medium text-gray-700">Title</th>
                    <th class="text-left p-4 font-medium text-gray-700">Status</th>
                    <th class="text-left p-4 font-medium text-gray-700">Priority</th>
                    <th class="text-left p-4 font-medium text-gray-700">Created</th>
                    <th class="text-right p-4 font-medium text-gray-700">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${projects.map(project => `
                    <tr class="border-t">
                        <td class="p-4">${project.title}</td>
                        <td class="p-4">
                            <span class="px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}">
                                ${project.status}
                            </span>
                        </td>
                        <td class="p-4 capitalize">${project.priority}</td>
                        <td class="p-4 text-sm text-gray-500">${new Date(project.created_at).toLocaleDateString()}</td>
                        <td class="p-4 text-right">
                            <button onclick="editProject(${project.id})" class="text-blue-600 hover:text-blue-800 mr-2">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteProject(${project.id})" class="text-red-600 hover:text-red-800">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function getStatusColor(status) {
    const colors = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
        return colors[status] || 'bg-gray-100 text-gray-800';
}

// Project modal functions
function openProjectModal(project = null) {
    const modal = document.getElementById('project-modal');
    if (!modal) {
        createProjectModal();
    }
    document.getElementById('project-modal').classList.remove('hidden');
    document.getElementById('project-modal-title').textContent = project ? 'Edit Project' : 'New Project';
    document.getElementById('project-title').value = project?.title || '';
    document.getElementById('project-description').value = project?.description || '';
    document.getElementById('project-priority').value = project?.priority || 'medium';
    document.getElementById('project-status').value = project?.status || 'pending';
    document.getElementById('project-id').value = project?.id || '';
}

function createProjectModal() {
    const modal = document.createElement('div');
    modal.id = 'project-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 id="project-modal-title" class="text-xl font-bold mb-4">New Project</h3>
            <input type="hidden" id="project-id">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" id="project-title" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea id="project-description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select id="project-priority" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select id="project-status" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button onclick="closeProjectModal()" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onclick="saveProject()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Save</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeProjectModal() {
    document.getElementById('project-modal').classList.add('hidden');
}

async function saveProject() {
    const projectId = document.getElementById('project-id').value;
    const projectData = {
        title: document.getElementById('project-title').value,
        description: document.getElementById('project-description').value,
        priority: document.getElementById('project-priority').value,
        status: document.getElementById('project-status').value
    };

    try {
        if (projectId) {
            await api.updateProject(projectId, projectData);
        } else {
            await api.createProject(projectData);
        }
        closeProjectModal();
        loadProjects();
        loadDashboard();
    } catch (error) {
        alert('Error saving project: ' + error.message);
    }
}

async function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (project) openProjectModal(project);
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
        await api.deleteProject(id);
        loadProjects();
                loadDashboard();
    } catch (error) {
        alert('Error deleting project: ' + error.message);
    }
}

// ============================================================
// TEAM CONTROL FUNCTIONS
// ============================================================

function getTeamHTML() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-800">Team Control</h2>
                <button onclick="openInviteModal()" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                    <i class="fas fa-user-plus mr-2"></i>Invite Member
                </button>
            </div>

            <!-- Team Stats -->
            <div id="team-stats" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <div class="text-2xl font-bold text-purple-600" id="team-total">-</div>
                    <div class="text-sm text-gray-500">Total Members</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <div class="text-2xl font-bold text-blue-600" id="team-admin">-</div>
                    <div class="text-sm text-gray-500">Admins</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <div class="text-2xl font-bold text-green-600" id="team-active">-</div>
                    <div class="text-sm text-gray-500">Active</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <div class="text-2xl font-bold text-yellow-600" id="team-pending">-</div>
                    <div class="text-sm text-gray-500">Pending Invitations</div>
                </div>
            </div>

            <!-- Team Tabs -->
            <div class="border-b border-gray-200">
                <nav class="flex space-x-8">
                    <button onclick="switchTeamTab('members')" id="tab-members" class="tab-button active border-b-2 border-purple-600 text-purple-600 py-2 px-1">
                        <i class="fas fa-users mr-2"></i>Team Members
                    </button>
                    <button onclick="switchTeamTab('agencies')" id="tab-agencies" class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-800 py-2 px-1">
                        <i class="fas fa-building mr-2"></i>Agencies
                    </button>
                </nav>
            </div>

            <!-- Tab Content -->
            <div id="team-tab-content" class="text-center py-8 text-gray-500">
                                <div class="animate-pulse">Loading team data...</div>
            </div>
        </div>
    `;
}

async function loadTeam(tab) {
    try {
        const res = await api.getAllUsers();
        teams = res.data.users || [];
        renderTeamStats();
        renderTeamTab(tab || 'members');
    } catch (error) {
        console.error('Failed to load team data:', error);
        const container = document.getElementById('team-tab-content');
        if (container) {
            var isForbidden = error.message.includes('403') ||
                error.message.toLowerCase().includes('permission') ||
                error.message.toLowerCase().includes('access');
            container.innerHTML = '<div class="p-8 text-center text-gray-500">' +
                (isForbidden
                    ? '<i class="fas fa-lock text-2xl mb-3"></i><p class="font-medium">Admin access required to view team members.</p>'
                    : '<i class="fas fa-exclamation-triangle text-2xl mb-3"></i><p>' + error.message + '</p>') +
                '</div>';
        }
    }
}

function renderTeamStats() {
    var adminCount = teams.filter(u => u.role === 'admin').length;
    var totalEl = document.getElementById('team-total');
    var adminEl = document.getElementById('team-admin');
    var activeEl = document.getElementById('team-active');
    var pendingEl = document.getElementById('team-pending');
    if (totalEl) totalEl.textContent = teams.length;
    if (adminEl) adminEl.textContent = adminCount;
    if (activeEl) activeEl.textContent = teams.length;
    if (pendingEl) pendingEl.textContent = 0;
}

function switchTeamTab(tab) {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'border-purple-600', 'text-purple-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    var activeTab = document.getElementById('tab-' + tab);
    if (activeTab) {
        activeTab.classList.add('active', 'border-purple-600', 'text-purple-600');
        activeTab.classList.remove('border-transparent', 'text-gray-500');
    }
    renderTeamTab(tab);
}

function renderTeamTab(tab) {
    var container = document.getElementById('team-tab-content');
    if (!container) return;

    if (tab === 'members') {
        if (teams.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-gray-500">No team members found.</div>';
            return;
        }
        container.innerHTML = `
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="text-left p-4 font-medium text-gray-700">Member</th>
                        <th class="text-left p-4 font-medium text-gray-700">Email</th>
                        <th class="text-left p-4 font-medium text-gray-700">Role</th>
                        <th class="text-left p-4 font-medium text-gray-700">Joined</th>
                    </tr>
                </thead>
                <tbody>
                    ${teams.map(user => `
                        <tr class="border-t">
                            <td class="p-4 font-medium">${user.username}</td>
                            <td class="p-4 text-gray-600">${user.email}</td>
                            <td class="p-4">
                                <span class="px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
                                    ${user.role}
                                </span>
                            </td>
                            <td class="p-4 text-sm text-gray-500">${new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else if (tab === 'agencies') {
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-building text-2xl text-gray-400"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Agency Management</h3>
                <p class="text-gray-500">Agency and team management features are coming soon. Stay tuned!</p>
            </div>
        `;
    }
}

function openInviteModal() {
    alert('Invite member feature is being developed. Stay tuned!');
}

// ============================================================
// SERVICES & PRICING FUNCTIONS
// ============================================================

function getServicesHTML() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-800">Services & Pricing</h2>
                <button onclick="openNewServiceModal()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    <i class="fas fa-plus mr-2"></i>Add Service
                </button>
            </div>

            <!-- Pricing Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
                    <div class="text-center mb-6">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-bolt text-2xl text-blue-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800">Basic</h3>
                        <p class="text-3xl font-bold text-blue-600 mt-3">$9<span class="text-sm text-gray-500">/mo</span></p>
                    </div>
                    <ul class="space-y-3 mb-6 text-sm">
                        <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> Up to 10 projects</li>
                        <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> 5GB storage</li>
                        <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> Basic analytics</li>
                        <li class="flex items-center text-gray-400"><i class="fas fa-times mr-2"></i> Priority support</li>
                    </ul>
                    <button class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">Get Started</button>
                </div>

                <div class="bg-white rounded-xl shadow-lg border-2 border-purple-600 p-6 transform scale-105">
                    <div class="text-center mb-6">
                        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-crown text-2xl text-purple-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800">Pro</h3>
                        <p class="text-3xl font-bold text-purple-600 mt-3">$29<span class="text-sm text-gray-500">/mo</span></p>
                        <span class="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Most Popular</span>
                    </div>
                    <ul class="space-y-3 mb-6 text-sm">
                        <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> Unlimited projects</li>
                        <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> 50GB storage</li>
                        <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> Advanced analytics</li>
                        <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> Priority support</li>
                    </ul>
                    <button class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">Get Started</button>
                </div>

                <div class="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
                    <div class="text-center mb-6">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-building text-2xl text-green-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800">Enterprise</h3>
                        <p class="text-3xl font-bold text-green-600 mt-3">Custom</p>
                    </div>
                    <ul class="space-y-3 mb-6 text-sm">
                        <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> Unlimited everything</li>
                        <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> Dedicated support</li>
                        <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> Custom integrations</li>
                        <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> SLA guarantee</li>
                    </ul>
                    <button class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">Contact Sales</button>
                </div>
            </div>
        </div>
    `;
}

function openNewServiceModal() {
    alert('Add service feature is being developed. Stay tuned!');
}


// ============================================================
// PROFILE FUNCTIONS
// ============================================================

function getProfileHTML() {
    return `
        <div class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-800">Profile Settings</h2>

            <!-- Profile Info Card -->
            <div class="bg-white rounded-xl shadow p-6">
                <div class="flex items-center space-x-4 mb-6">
                    <div class="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center">
                        <span id="profile-initials" class="text-2xl font-bold text-white">U</span>
                    </div>
                    <div>
                        <h3 id="profile-name" class="text-lg font-bold text-gray-800">Loading...</h3>
                        <p id="profile-email-display" class="text-gray-500"></p>
                        <p id="profile-role" class="text-sm text-gray-500">Role: user</p>
                    </div>
                </div>

                <!-- Profile Form -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input type="text" id="profile-username" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="profile-email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" id="profile-password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        <p class="text-xs text-gray-500 mt-1">Leave blank to keep your current password</p>
                    </div>
                </div>

                <div id="profile-error" class="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm hidden mt-4"></div>
                <div id="profile-success" class="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-lg text-sm hidden mt-4"></div>

                <div class="flex justify-end space-x-3 mt-6">
                    <button onclick="deleteAccount()" class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition">
                        <i class="fas fa-trash mr-2"></i>Delete Account
                    </button>
                    <button onclick="saveProfile()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                        <i class="fas fa-save mr-2"></i>Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;
}

function loadProfile() {
    if (!currentUser) return;

    var initials = (currentUser.username || 'U').substring(0, 2).toUpperCase();
    var profileInitials = document.getElementById('profile-initials');
    var profileName = document.getElementById('profile-name');
    var profileEmailDisplay = document.getElementById('profile-email-display');
    var profileRole = document.getElementById('profile-role');
    var profileUsername = document.getElementById('profile-username');
    var profileEmail = document.getElementById('profile-email');

    if (profileInitials) profileInitials.textContent = initials;
    if (profileName) profileName.textContent = currentUser.username;
    if (profileEmailDisplay) profileEmailDisplay.textContent = currentUser.email;
    if (profileRole) profileRole.textContent = 'Role: ' + (currentUser.role || 'user');
    if (profileUsername) profileUsername.value = currentUser.username || '';
    if (profileEmail) profileEmail.value = currentUser.email || '';
}

async function saveProfile() {
    var updateData = {
        username: document.getElementById('profile-username').value,
        email: document.getElementById('profile-email').value,
    };

    var password = document.getElementById('profile-password').value;
    if (password) {
        updateData.password = password;
    }

    var errorDiv = document.getElementById('profile-error');
    var successDiv = document.getElementById('profile-success');

    try {
        var res = await api.updateProfile(updateData);
        currentUser = res.data.user;
        updateUserAvatar();
        loadProfile();
        successDiv.textContent = 'Profile updated successfully!';
        successDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        document.getElementById('profile-password').value = '';
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
        successDiv.classList.add('hidden');
    }
}

async function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;

    try {
        await api.deleteAccount();
        alert('Your account has been deleted.');
        logout();
    } catch (error) {
        alert('Error deleting account: ' + error.message);
    }
}

// Initialize app on page load
checkAuth();


