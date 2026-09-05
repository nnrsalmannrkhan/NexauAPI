/**
 * Configuration Module
 * Handles API connection settings and environment configuration
 */

// Auto-detect environment based on hostname
// On localhost → use absolute URL for local development
// On any other host (production/Render) → use relative URL (same-origin)
// This ensures the frontend talks to its own backend without CORS issues
const isLocal = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname === '::1';

// API Endpoints Configuration
const API_CONFIGS = {
    LOCAL: {
        name: 'Local Development',
        baseUrl: 'http://localhost:5000/api/v1',
        healthUrl: 'http://localhost:5000/health',
        environment: 'development'
    },
    PRODUCTION: {
        name: 'Production Server',
        // Relative URL — same-origin, no CORS issues on Render
        baseUrl: '/api/v1',
        healthUrl: '/health',
        environment: 'production'
    }
};

// Set environment automatically
const ENVIRONMENT = isLocal ? 'LOCAL' : 'PRODUCTION';

// Current active configuration
const config = API_CONFIGS[ENVIRONMENT];

// Export configuration
window.APP_CONFIG = {
    ...config,
    ENVIRONMENT,
    API_CONFIGS
};

/**
 * Utility function to switch environments
 * Usage: window.setEnvironment('PRODUCTION')
 */
window.setEnvironment = function(env) {
    if (API_CONFIGS[env]) {
        window.APP_CONFIG = {
            ...API_CONFIGS[env],
            ENVIRONMENT: env,
            API_CONFIGS
        };
        // Update environment indicator
        const envIndicator = document.getElementById('env-indicator');
        if (envIndicator) {
            envIndicator.textContent = API_CONFIGS[env].name;
            envIndicator.className = 'font-medium ' + (env === 'PRODUCTION' ? 'text-orange-600' : 'text-green-600');
        }
        localStorage.setItem('appEnvironment', env);
        return true;
    }
    return false;
};

// Load saved environment preference (honors user override)
const savedEnv = localStorage.getItem('appEnvironment');
if (savedEnv && API_CONFIGS[savedEnv]) {
    window.setEnvironment(savedEnv);
}

// Update environment indicator after DOM is loaded (for auto-detected env)
document.addEventListener('DOMContentLoaded', () => {
    if (!savedEnv) {
        const envIndicator = document.getElementById('env-indicator');
        if (envIndicator) {
            envIndicator.textContent = config.name;
            envIndicator.className = 'font-medium ' + (ENVIRONMENT === 'PRODUCTION' ? 'text-orange-600' : 'text-green-600');
        }
    }
});