// Configuration for base URL and environment settings
export const config = {
    // Base URL for the application
    // Uses Vite's base URL configuration
    baseUrl: import.meta.env.BASE_URL || '',
    
    // API base URL (you can add other config here)
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
    
    // Environment
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
};

// Helper function to get the full path with base URL
export const getFullPath = (path: string): string => {
    return `${config.baseUrl}${path}`;
};

// Helper function to check if we're in development mode
export const isDev = (): boolean => {
    return config.isDevelopment;
}; 