// Secure Admin Authentication Service - In-Memory Only
class AdminAuthService {
  private static instance: AdminAuthService;
  private adminSession: {
    email: string;
    isAuthenticated: boolean;
    loginTime: number;
  } | null = null;
  
  // Hardcoded admin credentials (NEVER store in Supabase)
  private readonly ADMIN_EMAIL = (import.meta as any).env?.VITE_ADMIN_EMAIL as string;
  private readonly ADMIN_PASSWORD = (import.meta as any).env?.VITE_ADMIN_PASSWORD as string;
  private readonly SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
  
  private constructor() {
    this.validateEnv();
    // Check for existing session on initialization
    this.checkSessionValidity();
  }
  
  static getInstance(): AdminAuthService {
    if (!AdminAuthService.instance) {
      AdminAuthService.instance = new AdminAuthService();
    }
    return AdminAuthService.instance;
  }
  
  authenticate(email: string, password: string): boolean {
    if (email === this.ADMIN_EMAIL && password === this.ADMIN_PASSWORD) {
      this.adminSession = {
        email: this.ADMIN_EMAIL,
        isAuthenticated: true,
        loginTime: Date.now()
      };
      
      // Set secure HttpOnly cookie (simulated with secure flag)
      document.cookie = `admin_session=true; path=/; secure; samesite=strict; max-age=${this.SESSION_TIMEOUT / 1000}`;
      
      return true;
    }
    return false;
  }
  
  isAuthenticated(): boolean {
    if (!this.adminSession) return false;
    
    // Check session timeout
    const now = Date.now();
    if (now - this.adminSession.loginTime > this.SESSION_TIMEOUT) {
      this.logout();
      return false;
    }
    
    return this.adminSession.isAuthenticated;
  }
  
  getAdminEmail(): string | null {
    return this.adminSession?.email || null;
  }
  
  logout(): void {
    this.adminSession = null;
    // Clear cookie
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
  
  private checkSessionValidity(): void {
    // Check if cookie exists (basic check)
    const hasSessionCookie = document.cookie.includes('admin_session=true');
    if (!hasSessionCookie && this.adminSession) {
      this.adminSession = null;
    }
  }
  
  // Extend session on activity
  
  // Validate env presence (avoids leaking creds in repo)
  private validateEnv() {
    if (!this.ADMIN_EMAIL || !this.ADMIN_PASSWORD) {
      console.error('[AdminAuth] Missing VITE_ADMIN_EMAIL or VITE_ADMIN_PASSWORD in your .env');
      // Optional: prevent login if missing
    }
  }
extendSession(): void {
    if (this.adminSession) {
      this.adminSession.loginTime = Date.now();
    }
  }
}

export const adminAuth = AdminAuthService.getInstance();