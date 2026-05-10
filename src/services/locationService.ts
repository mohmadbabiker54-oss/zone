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
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            return { 
              error: '⚠️ نحتاج لإذن الـ GPS لضمان دقة الموقع. الموقع التقريبي قد يحتوي على خطأ يصل لـ 5 كيلومترات. يرجى تفعيله من إعدادات التطبيق.' 
            };
          }
        }
      } catch (e) {
        console.warn('Geolocation permissions error:', e);
      }
    }

    // Attempt retrieval with strict accuracy requirements
    try {
      // Priority: High Accuracy (Forces GPS on Android)
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true, 
        timeout: 20000,
        maximumAge: 0
      });

      const accuracy = pos.coords.accuracy;

      // 2. Accuracy Filtering (Requirement: < 20 meters)
      if (accuracy > 20 && retryCount < 3) {
        console.log(`Low accuracy (${accuracy}m). Retrying update... Attempt ${retryCount + 1}`);
        // Small delay before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.getCurrentLocation(retryCount + 1);
      }

      return this.formatResult(pos);

    } catch (e) {
      console.warn('High Accuracy retrieval failed. Trying one last time...', e);
      
      // Fallback for Web/Browser environments
      if (!isNative && typeof navigator !== 'undefined' && navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(this.formatResult(pos)),
            (err) => resolve({ error: 'عذراً، فشل تحديد الموقع بدقة. تأكد من تفعيل الـ GPS في جهازك.' }),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
          );
        });
      }
      
      return { error: 'فشل تحديد الموقع عالي الدقة. يرجى التأكد من تفعيل الموقع (GPS) في وضع "الدقة العالية".' };
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
      isAccurate: accuracy <= 20 // Enforced threshold
    };
  }
};
