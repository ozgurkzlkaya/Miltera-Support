import { Hono } from 'hono';
import { Context } from 'hono';

export interface ApiVersion {
  version: string;
  deprecated: boolean;
  sunsetDate?: Date;
  changelog: string[];
  breakingChanges: string[];
}

export interface VersionedRoute {
  version: string;
  path: string;
  method: string;
  handler: (c: Context) => Response | Promise<Response>;
}

export class ApiVersioningService {
  private versions: Map<string, ApiVersion> = new Map();
  private routes: Map<string, VersionedRoute[]> = new Map();

  constructor() {
    this.initializeVersions();
  }

  private initializeVersions() {
    // API v1
    this.versions.set('v1', {
      version: 'v1',
      deprecated: false,
      changelog: [
        'Initial API version',
        'Basic CRUD operations for all entities',
        'Authentication and authorization',
        'File upload support',
        'Search functionality',
        'WebSocket support',
        'Collaboration features',
        'Backup and recovery system',
      ],
      breakingChanges: [],
    });

    // API v2 (future version)
    this.versions.set('v2', {
      version: 'v2',
      deprecated: false,
      sunsetDate: new Date('2025-12-31'),
      changelog: [
        'Enhanced error handling',
        'Improved response format',
        'New pagination system',
        'Advanced filtering options',
        'GraphQL support',
        'Real-time subscriptions',
      ],
      breakingChanges: [
        'Response format changed',
        'Pagination parameters renamed',
        'Some endpoints moved to different paths',
      ],
    });
  }

  /**
   * Versiyon bilgilerini getirir
   */
  getVersion(version: string): ApiVersion | undefined {
    return this.versions.get(version);
  }

  /**
   * Tüm versiyonları getirir
   */
  getAllVersions(): ApiVersion[] {
    return Array.from(this.versions.values());
  }

  /**
   * Versiyonlu route ekler
   */
  addRoute(version: string, route: VersionedRoute): void {
    if (!this.routes.has(version)) {
      this.routes.set(version, []);
    }
    this.routes.get(version)!.push(route);
  }

  /**
   * Versiyon için route'ları getirir
   */
  getRoutes(version: string): VersionedRoute[] {
    return this.routes.get(version) || [];
  }

  /**
   * Versiyon middleware'i
   */
  versionMiddleware(version: string) {
    return async (c: Context, next: () => Promise<void>) => {
      const apiVersion = this.getVersion(version);
      
      if (!apiVersion) {
        return c.json({
          success: false,
          error: 'API version not found',
          availableVersions: this.getAllVersions().map(v => v.version),
        }, 404);
      }

      // Deprecated version warning
      if (apiVersion.deprecated) {
        c.header('X-API-Deprecated', 'true');
        c.header('X-API-Sunset', apiVersion.sunsetDate?.toISOString() || '');
      }

      // Version info header
      c.header('X-API-Version', version);
      c.header('X-API-Changelog', JSON.stringify(apiVersion.changelog));

      await next();
    };
  }

  /**
   * Versiyon bilgilerini response'a ekler
   */
  addVersionInfo(c: Context, version: string): void {
    const apiVersion = this.getVersion(version);
    if (apiVersion) {
      c.header('X-API-Version', version);
      c.header('X-API-Deprecated', apiVersion.deprecated.toString());
      if (apiVersion.sunsetDate) {
        c.header('X-API-Sunset', apiVersion.sunsetDate.toISOString());
      }
    }
  }

  /**
   * Versiyon uyumluluğunu kontrol eder
   */
  checkCompatibility(clientVersion: string, serverVersion: string): boolean {
    const client = this.getVersion(clientVersion);
    const server = this.getVersion(serverVersion);
    
    if (!client || !server) {
      return false;
    }

    // Basit uyumluluk kontrolü
    // Gerçek implementasyonda daha karmaşık semver kontrolü yapılabilir
    return client.version === server.version;
  }

  /**
   * Breaking changes'i kontrol eder
   */
  getBreakingChanges(fromVersion: string, toVersion: string): string[] {
    const from = this.getVersion(fromVersion);
    const to = this.getVersion(toVersion);
    
    if (!from || !to) {
      return [];
    }

    // Basit breaking changes kontrolü
    // Gerçek implementasyonda daha detaylı kontrol yapılabilir
    return to.breakingChanges || [];
  }
}

export const apiVersioningService = new ApiVersioningService();

/**
 * Versiyonlu route oluşturucu
 */
export function createVersionedRoute(version: string, path: string, method: string, handler: (c: Context) => Response | Promise<Response>) {
  apiVersioningService.addRoute(version, {
    version,
    path,
    method,
    handler,
  });
}

/**
 * Versiyon middleware factory
 */
export function createVersionMiddleware(version: string) {
  return apiVersioningService.versionMiddleware(version);
}
