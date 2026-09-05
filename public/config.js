/**
 * Configuration Module
 * Handles API connection settings and environment configuration
 */

// Environment switcher - Easily switch between localhost and production
const ENVIRONMENT = 'LOCAL'; // Change to 'PRODUCTION' for live deployment

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
        baseUrl: 'https://your-production-domain.com/api/v1',
        healthUrl: 'https://your-production-domain.com/health',
        environment: 'production'
    }
};

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

// Load saved environment preference
const savedEnv = localStorage.getItem('appEnvironment');
if (savedEnv && API_CONFIGS[savedEnv]) {
    window.setEnvironment(savedEnv);
}