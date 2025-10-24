import https from 'https';
import http from 'http';

export interface UrlValidationResult {
  isValid: boolean;
  isAccessible?: boolean;
  statusCode?: number;
  error?: string;
  redirectUrl?: string;
}

export class UrlValidationService {
  /**
   * 驗證URL格式
   */
  validateUrlFormat(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // 只允許 http 和 https 協議
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  /**
   * 檢查URL是否可訪問
   */
  async checkUrlAccessibility(url: string, timeout: number = 5000): Promise<UrlValidationResult> {
    // 先驗證格式
    if (!this.validateUrlFormat(url)) {
      return {
        isValid: false,
        error: 'URL格式不正確'
      };
    }

    return new Promise((resolve) => {
      try {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;

        const request = protocol.get(url, {
          timeout,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; URLValidator/1.0)'
          }
        }, (response) => {
          const statusCode = response.statusCode || 0;

          // 處理重定向
          if (statusCode >= 300 && statusCode < 400 && response.headers.location) {
            resolve({
              isValid: true,
              isAccessible: true,
              statusCode,
              redirectUrl: response.headers.location
            });
            return;
          }

          // 檢查狀態碼
          const isAccessible = statusCode >= 200 && statusCode < 400;

          resolve({
            isValid: true,
            isAccessible,
            statusCode,
            error: isAccessible ? undefined : `HTTP狀態碼: ${statusCode}`
          });
        });

        request.on('error', (error) => {
          resolve({
            isValid: true,
            isAccessible: false,
            error: `無法訪問URL: ${error.message}`
          });
        });

        request.on('timeout', () => {
          request.destroy();
          resolve({
            isValid: true,
            isAccessible: false,
            error: '請求超時'
          });
        });
      } catch (error) {
        resolve({
          isValid: false,
          error: error instanceof Error ? error.message : '未知錯誤'
        });
      }
    });
  }

  /**
   * 完整驗證URL（格式 + 可訪問性）
   */
  async validateUrl(url: string, checkAccessibility: boolean = false): Promise<UrlValidationResult> {
    // 驗證格式
    const isValidFormat = this.validateUrlFormat(url);
    
    if (!isValidFormat) {
      return {
        isValid: false,
        error: 'URL格式不正確，請使用 http:// 或 https:// 開頭的完整URL'
      };
    }

    // 如果需要檢查可訪問性
    if (checkAccessibility) {
      return await this.checkUrlAccessibility(url);
    }

    return {
      isValid: true
    };
  }

  /**
   * 批量驗證URL
   */
  async validateUrls(urls: string[], checkAccessibility: boolean = false): Promise<Map<string, UrlValidationResult>> {
    const results = new Map<string, UrlValidationResult>();

    const validationPromises = urls.map(async (url) => {
      const result = await this.validateUrl(url, checkAccessibility);
      results.set(url, result);
    });

    await Promise.all(validationPromises);

    return results;
  }

  /**
   * 清理和標準化URL
   */
  normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // 移除尾部斜線（除非是根路徑）
      if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
        urlObj.pathname = urlObj.pathname.slice(0, -1);
      }

      // 移除預設端口
      if ((urlObj.protocol === 'http:' && urlObj.port === '80') ||
          (urlObj.protocol === 'https:' && urlObj.port === '443')) {
        urlObj.port = '';
      }

      return urlObj.toString();
    } catch (error) {
      return url;
    }
  }

  /**
   * 檢查URL是否為安全連結（HTTPS）
   */
  isSecureUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  /**
   * 從URL提取域名
   */
  extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return null;
    }
  }

  /**
   * 檢查URL是否屬於允許的域名列表
   */
  isAllowedDomain(url: string, allowedDomains: string[]): boolean {
    const domain = this.extractDomain(url);
    
    if (!domain) {
      return false;
    }

    return allowedDomains.some(allowedDomain => {
      // 支援萬用字元匹配
      if (allowedDomain.startsWith('*.')) {
        const baseDomain = allowedDomain.substring(2);
        return domain.endsWith(baseDomain);
      }
      return domain === allowedDomain;
    });
  }

  /**
   * 檢查URL是否包含可疑內容
   */
  isSuspiciousUrl(url: string): boolean {
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i,
      /<script/i,
      /onclick/i,
      /onerror/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(url));
  }

  /**
   * 完整的URL安全檢查
   */
  async performSecurityCheck(url: string): Promise<{
    isSafe: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // 檢查格式
    if (!this.validateUrlFormat(url)) {
      issues.push('URL格式不正確');
    }

    // 檢查可疑內容
    if (this.isSuspiciousUrl(url)) {
      issues.push('URL包含可疑內容');
    }

    // 檢查是否為HTTPS
    if (!this.isSecureUrl(url)) {
      issues.push('URL不是安全連結（建議使用HTTPS）');
    }

    return {
      isSafe: issues.length === 0,
      issues
    };
  }
}

// 匯出單例實例
export const urlValidationService = new UrlValidationService();
