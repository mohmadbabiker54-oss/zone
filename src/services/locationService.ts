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
 */
export const LocationService = {
  /**
   * Main function to get the current position.
   * Handles permissions, high accuracy fallbacks, and multi-layered retrieval.
   */
  async getCurrentLocation(): Promise<LocationResult> {
    const isNative = Capacitor.isNativePlatform();
    
    // 1. Handle Permissions (Native only usually)
    if (isNative) {
      try {
        const perms = await Geolocation.checkPermissions();
        if (perms.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            return { error: 'تم رفض إذن الوصول للموقع الجغرافي. يرجى تفعيله من إعدادات الهاتف.' };
          }
        }
      } catch (e) {
        console.warn('Geolocation permissions error:', e);
      }
    }

    // Attempt retrieval sequence
    try {
      // Attempt 1: Capacitor with High Accuracy
      try {
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
        return this.formatResult(pos);
      } catch (e) {
        console.warn('Capacitor High Accuracy failed, trying Low Accuracy...');
        
        // Attempt 2: Capacitor with Low Accuracy (faster, uses Cell/WiFi)
        try {
          const pos = await Geolocation.getCurrentPosition({
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 30000 // Allow cached if recent
          });
          return this.formatResult(pos);
        } catch (e2) {
          console.warn('Capacitor Location failed entirely.');
        }
      }

      // Attempt 3: Web Native API (Fallback)
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        console.log('Switching to Web Geolocation API...');
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(this.formatResult(pos)),
            (err) => {
              console.error('Web Geolocation failed:', err);
              // Final fallback to IP-based or manual
              resolve({ error: 'عذراً، فشل تحديد الموقع تلقائياً. يرجى سحب الدبوس يدوياً على الخريطة.' });
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
          );
        });
      }

    } catch (globalErr) {
      console.error('Global Location Error:', globalErr);
    }

    return { error: 'فشل بروتوكول تحديد الموقع. يرجى وضع الدبوس يدوياً على الخريطة.' };
  },

  /**
   * Helper to format different position objects into our standard LocationResult
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
      isAccurate: accuracy <= 50 // Our threshold for "Guaranteed Doorstep"
    };
  }
};
