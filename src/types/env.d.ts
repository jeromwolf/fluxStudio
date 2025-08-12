declare namespace NodeJS {
  interface ProcessEnv {
    // Application
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_APP_URL: string;
    
    // API Configuration
    NEXT_PUBLIC_API_URL: string;
    
    // Export Settings
    NEXT_PUBLIC_MAX_EXPORT_DURATION: string;
    NEXT_PUBLIC_MAX_FILE_SIZE: string;
    
    // Feature Flags
    NEXT_PUBLIC_ENABLE_AUDIO: string;
    NEXT_PUBLIC_ENABLE_CLOUD_EXPORT: string;
    NEXT_PUBLIC_ENABLE_AI_FEATURES: string;
    
    // Analytics
    NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;
    
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    
    // Storage
    STORAGE_ENDPOINT?: string;
    STORAGE_ACCESS_KEY?: string;
    STORAGE_SECRET_KEY?: string;
    STORAGE_BUCKET?: string;
  }
}