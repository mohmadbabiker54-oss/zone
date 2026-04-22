import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';

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
   * Handles permissions, high accuracy, and errors.
   */
  async getCurrentLocation(): Promise<LocationResult> {
    try {
      // 1. Permissions Check
      let checkPerms: any = {};
      try {
        checkPerms = await Geolocation.checkPermissions();
      } catch (e) {
        console.warn('Permissions API not available');
      }

      if (checkPerms.location !== 'granted') {
        try {
          await Geolocation.requestPermissions();
        } catch (e) {
          console.warn('Request permissions failed');
        }
      }

      // 2. High Accuracy Attempt with fresh data
      // We use a small timeout to try and catch a real GPS signal quickly
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 
      });

      const accuracy = position.coords.accuracy || 1000;

      // If accuracy is worse than 1000m, it's likely IP-based (the "Another City" problem)
      // We return it but mark it as inaccurate
      return {
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: accuracy
        },
        timestamp: position.timestamp,
        isAccurate: accuracy <= 50 // User requested 50m threshold
      };

    } catch (err: any) {
      console.error('Capacitor Geo failed, switching to Native browser...');
      
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        return new Promise((resolve) => {
          // Attempt to get clear GPS data
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const accuracy = pos.coords.accuracy || 1000;
              resolve({
                coords: { 
                  latitude: pos.coords.latitude, 
                  longitude: pos.coords.longitude,
                  accuracy: accuracy
                },
                timestamp: pos.timestamp,
                isAccurate: accuracy <= 50
              });
            },
            (error) => {
              console.error('Final failure');
              resolve({ error: 'تعذر تحديد موقعك بدقة 50 متر. يرجى تفعيل الـ GPS والتأكد من فتح التطبيق في المتصفح الخارجي.' });
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
          );
        });
      }

      return { error: 'فشل بروتوكول تحديد الموقع. يرجى المحاولة يدوياً.' };
    }
  }
};
