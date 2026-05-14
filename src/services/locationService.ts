import { Geolocation, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

/**
 * Interface for the location result containing coordinates or an error message.
 */
export interface LocationResult {
  coords?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  error?: string;
  timestamp?: number;
  isAccurate?: boolean;
}

/**
 * Service module for handling native and web geolocation using Capacitor.
 * Optimized for high accuracy (GPS) and Android integration.
 */
export const LocationService = {
  /**
   * Main function to get the current position.
   * Enforces high accuracy (GPS) and filters out approximate results (>20m).
   */
  async getCurrentLocation(retryCount = 0): Promise<LocationResult> {
    const isNative = Capacitor.isNativePlatform();
    
    // 1. Handle Permissions with Interactive Rationale
    if (isNative) {
      try {
        const perms = await Geolocation.checkPermissions();
        if (perms.location !== 'granted') {
          // Rationale: User specifically asked for this warning text
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            return { 
              error: '⚠️ نحتاج لتفعيل "الموقع الدقيق" (Fine Location) لضمان دقة النتائج وتفادي هامش خطأ قد يصل لـ 5 كيلومترات. يرجى السماح للتطبيق بالوصول للموقع بدقة عالية من إعدادات النظام.' 
            };
          }
        }
      } catch (e) {
        console.warn('Geolocation permissions error:', e);
      }
    }

    // Attempt retrieval with strict accuracy requirements
    try {
      // Priority: PRIORITY_HIGH_ACCURACY is mapped to enableHighAccuracy: true in Capacitor
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 0   // Force fresh coordinates, no cache
      });

      const accuracy = pos.coords.accuracy || 1000;

      // 2. Accuracy Filtering (Requirement: accuracy <= 550 meters)
      // Logic: If accuracy is > 550m, we request an update again and do NOT accept approximate coordinates.
      if (accuracy > 550) {
        if (retryCount < 4) { // Allow up to 4 retries for a total of ~1 minute wait for GPS lock
          console.log(`Accuracy threshold (>550m) not met: ${accuracy}m. Retrying... Attempt ${retryCount + 1}`);
          // Small delay to allow the GPS hardware to stabilize/lock better
          await new Promise(resolve => setTimeout(resolve, 5000)); 
          return this.getCurrentLocation(retryCount + 1);
        } else {
          return { 
            error: `عذراً، الإحداثيات الحالية تقريبية (الدقة: ${Math.round(accuracy)} متر). لا يمكننا قبول موقع غير دقيق. يرجى تفعيل الـ GPS والوقوف في مكان مكشوف للسماء لضمان دقة أقل من 550 متراً.` 
          };
        }
      }

      return this.formatResult(pos);

    } catch (e) {
      console.warn('High Accuracy retrieval failed search...', e);
      
      // Fallback for Web/Browser environments with high accuracy request
      if (!isNative && typeof navigator !== 'undefined' && navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const res = this.formatResult(pos);
              if (res.coords && (res.coords.accuracy || 1000) > 550) {
                 resolve({ error: 'المتصفح يقدم إحداثيات غير دقيقة. يرجى استخدام متصفح حديث أو تفعيل الـ GPS.' });
              } else {
                 resolve(res);
              }
            },
            (err) => resolve({ error: 'عذراً، فشل تحديد الموقع بدقة العالية. تأكد من تفعيل الموقع في المتصفح.' }),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
          );
        });
      }
      
      return { error: 'فشل تفعيل نظام الـ GPS فائق الدقة. يرجى التأكد من تفعيل "دقة الموقع العالية" في إعدادات جهازك.' };
    }
  },

  /**
   * Helper to format different position objects and check accuracy threshold.
   */
  formatResult(pos: Position | GeolocationPosition): LocationResult {
    const accuracy = pos.coords.accuracy || 1000;
    return {
      coords: {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: accuracy
      },
      timestamp: pos.timestamp,
      isAccurate: accuracy <= 550 // Enforced threshold
    };
  }
};
