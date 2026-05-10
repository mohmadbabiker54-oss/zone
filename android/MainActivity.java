package com.mashtalzone.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;

public class MainActivity extends AppCompatActivity {

    private WebView myWebView;
    private FusedLocationProviderClient fusedLocationClient;
    private LocationRequest locationRequest;
    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        myWebView = findViewById(R.id.webview);
        setupWebView();

        // إعداد FusedLocationProviderClient
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        
        // ضبط إعدادات الدقة العالية (PRIORITY_HIGH_ACCURACY)
        locationRequest = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000)
                .setMinUpdateIntervalMillis(2000)
                .build();

        checkLocationPermissions();
    }

    private void setupWebView() {
        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        
        // تفعيل الجيولوكيشن داخل الـ WebView
        webSettings.setGeolocationEnabled(true);

        myWebView.setWebViewClient(new WebViewClient());
        
        // تجاوز دالة onGeolocationPermissionsShowPrompt لضمان مرور الأذونات
        myWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                // منح الإذن للويب تلقائياً بمجرد موافقة المستخدم في النظام
                callback.invoke(origin, true, false);
            }
        });

        // استبدل هذا الرابط برابط تطبيقك الفعلي
        myWebView.loadUrl("https://mashtal-zone.web.app");
    }

    private void checkLocationPermissions() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, 
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, 
                    LOCATION_PERMISSION_REQUEST_CODE);
        } else {
            startLocationUpdates();
        }
    }

    private void startLocationUpdates() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fusedLocationClient.requestLocationUpdates(locationRequest, new LocationCallback() {
                @Override
                public void onLocationResult(@NonNull LocationResult locationResult) {
                    for (Location location : locationResult.getLocations()) {
                        // معالجة الدقة: إذا كان هامش الخطأ أكبر من 20 متر، نطلب تحديثاً آخر
                        if (location.getAccuracy() > 20) {
                            // تجاهل المواقع التقريبية وتنبيه النظام للحصول على موقع أدق
                            continue; 
                        }
                        // تمرير الإحداثيات للـ WebView إذا لزم الأمر عبر Javascript
                        // myWebView.loadUrl("javascript:updateLocation(" + location.getLatitude() + "," + location.getLongitude() + ")");
                    }
                }
            }, getMainLooper());
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startLocationUpdates();
            } else {
                // إظهار رسالة توضح أهمية الـ GPS لتقليل هامش الخطأ (أقل من 5 كم)
                Toast.makeText(this, "التطبيق يحتاج للوصول الدقيق للموقع (GPS) لضمان دقة النتائج وتفادي أخطاء المسافة.", Toast.LENGTH_LONG).show();
            }
        }
    }
}
