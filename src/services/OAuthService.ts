import { authApi } from "@/api/auth";
import type { OAuthProvider, AuthResponse } from "@/types";

// OAuth Service for handling SSO authentication
export class OAuthService {
  private static readonly OAUTH_STATE_KEY = "oauth_state";
  private static readonly OAUTH_REDIRECT_KEY = "oauth_redirect";

  // Get available OAuth providers
  static async getProviders(): Promise<OAuthProvider[]> {
    try {
      const response = await authApi.getOAuthProviders();
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data) {
        return [];
      }
      return response.data.providers.map(provider => ({
        name: provider.name as "google" | "github",
        display_name: provider.display_name,
        icon: this.getProviderIcon(provider.name),
        url: provider.url,
      }));
    } catch (error) {
      console.error("Failed to get OAuth providers:", error);
      return [];
    }
  }

  // Initiate OAuth flow
  static initiateOAuth(provider: "google" | "github", redirectTo?: string): void {
    // Generate state for CSRF protection
    const state = this.generateState();
    localStorage.setItem(this.OAUTH_STATE_KEY, state);
    
    // Store redirect URL if provided
    if (redirectTo) {
      localStorage.setItem(this.OAUTH_REDIRECT_KEY, redirectTo);
    }

    // Get OAuth URL
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const oauthUrl = `${baseUrl}/auth/oauth/${provider}?state=${state}`;
    
    // Redirect to OAuth provider
    window.location.href = oauthUrl;
  }

  // Handle OAuth callback
  static async handleCallback(
    provider: string,
    code: string,
    state: string
  ): Promise<AuthResponse | null> {
    try {
      // Verify state to prevent CSRF attacks
      const storedState = localStorage.getItem(this.OAUTH_STATE_KEY);
      if (!storedState || storedState !== state) {
        throw new Error("Invalid OAuth state");
      }

      // Clear stored state
      localStorage.removeItem(this.OAUTH_STATE_KEY);

      // Exchange code for tokens
      const response = await authApi.oauthCallback(provider, code, state);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (!response.data) {
        throw new Error("OAuth authentication failed");
      }

      // Store tokens
      this.storeTokens(response.data);

      // Get redirect URL
      const redirectTo = localStorage.getItem(this.OAUTH_REDIRECT_KEY);
      localStorage.removeItem(this.OAUTH_REDIRECT_KEY);

      // Redirect if needed
      if (redirectTo) {
        window.location.href = redirectTo;
      }

      return response.data;
    } catch (error) {
      console.error("OAuth callback error:", error);
      throw error;
    }
  }

  // Store authentication tokens
  private static storeTokens(authResponse: AuthResponse): void {
    localStorage.setItem("auth_token", authResponse.access_token);
    localStorage.setItem("refresh_token", authResponse.refresh_token);
    
    // Store user data
    localStorage.setItem("user", JSON.stringify(authResponse.user));
  }

  // Generate random state for CSRF protection
  private static generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Get provider icon
  private static getProviderIcon(providerName: string): string {
    switch (providerName.toLowerCase()) {
      case "google":
        return "https://developers.google.com/identity/images/g-logo.png";
      case "github":
        return "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";
      default:
        return "";
    }
  }

  // Check if OAuth callback is in URL
  static isOAuthCallback(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has("code") && urlParams.has("state");
  }

  // Extract OAuth parameters from URL
  static extractOAuthParams(): { provider: string; code: string; state: string } | null {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const provider = urlParams.get("provider") || this.detectProviderFromUrl();

    if (!code || !state) {
      return null;
    }

    return { provider, code, state };
  }

  // Detect provider from URL or referrer
  private static detectProviderFromUrl(): string {
    const url = window.location.href;
    if (url.includes("google")) return "google";
    if (url.includes("github")) return "github";
    return "unknown";
  }

  // Clear OAuth state
  static clearOAuthState(): void {
    localStorage.removeItem(this.OAUTH_STATE_KEY);
    localStorage.removeItem(this.OAUTH_REDIRECT_KEY);
  }
}
