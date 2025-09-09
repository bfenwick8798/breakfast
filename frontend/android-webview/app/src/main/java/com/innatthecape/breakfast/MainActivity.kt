package com.innatthecape.breakfast

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.BroadcastReceiver
import android.net.ConnectivityManager
import android.net.wifi.WifiManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.WindowInsetsController
import android.view.WindowInsets
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.TextView
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : AppCompatActivity() {
    
    private lateinit var webView: WebView
    private lateinit var wifiInfoText: TextView
    private val websiteUrl = "https://breakfast.innatthecape.com/?t=wR94jsbHmgXaFacDJKxM6aU8BTtF98Am9Dx6SvvAUScVR62ghGwMdDxEQsdz8qVtnZ8NMBGeyBZBLcvRpU89W8L3MFSpmSyhcDdATFRGC2Pab3pxvcT6DwCuMKV7yYRjGmAC3AgXFwmVzHxYSaGPq3qm7y6Evz9Z"
    
    // Screen state management
    private var isScreenOn = true
    private var lastUserActivity = System.currentTimeMillis()
    private val inactivityHandler = Handler(Looper.getMainLooper())
    private val screenReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                Intent.ACTION_SCREEN_ON -> {
                    isScreenOn = true
                    // Restore kiosk mode when screen turns back on
                    setupKioskMode()
                }
                Intent.ACTION_SCREEN_OFF -> {
                    isScreenOn = false
                    // Allow natural screen off behavior
                }
            }
        }
    }
    
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Initialize views
        webView = findViewById(R.id.webView)
        wifiInfoText = findViewById(R.id.wifiInfoText)
        
        // Register screen state receiver
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_SCREEN_OFF)
        }
        registerReceiver(screenReceiver, filter)
        
        // Setup modern back press handling
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // Handle WebView back navigation
                if (webView.canGoBack()) {
                    webView.goBack()
                }
                // Don't call super or finish() to prevent exiting the app
            }
        })
        
        // Setup kiosk mode
        setupKioskMode()
        
        // Setup Wi-Fi info
        setupWifiInfo()
        
        // Setup WebView
        setupWebView()
        
        // Load the website
        webView.loadUrl(websiteUrl)
    }
    
    private fun setupKioskMode() {
        // Use modern WindowInsetsController for Android R (API 30) and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
            val controller = window.insetsController
            controller?.let {
                // Hide system bars
                it.hide(WindowInsets.Type.systemBars())
                // Set behavior for immersive mode
                it.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            // Fallback for older Android versions
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            )
        }
        
        // Allow screen to turn off naturally - removed FLAG_KEEP_SCREEN_ON
        // This prevents tablet crashes from forced screen-on state
        
        // Set as launcher (home screen replacement) - these are still valid
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(false) // Don't force screen on
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            )
        }
    }
    
    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        // Clear any cached data to ensure fresh content
        webView.clearCache(true)
        webView.clearHistory()
        
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
            builtInZoomControls = false
            displayZoomControls = false
            setSupportZoom(false)
            
            // Disable caching to ensure fresh content
            cacheMode = android.webkit.WebSettings.LOAD_NO_CACHE
            
            // Enable mixed content for HTTPS/HTTP
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }
        
        // Set WebView client to handle page navigation
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                // Keep navigation within the WebView
                return false
            }
            
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Page loaded, could add any additional setup here
            }
        }
    }
    
    private fun setupWifiInfo() {
        // Hardcoded Wi-Fi information
        wifiInfoText.text = "Wi-Fi: The Inn | Password: 12345678"
    }
    
    // Track user activity for natural screensaver behavior
    override fun onTouchEvent(event: MotionEvent?): Boolean {
        updateUserActivity()
        return super.onTouchEvent(event)
    }
    
    override fun dispatchTouchEvent(ev: MotionEvent?): Boolean {
        updateUserActivity()
        return super.dispatchTouchEvent(ev)
    }
    
    private fun updateUserActivity() {
        lastUserActivity = System.currentTimeMillis()
    }
    
    // Block hardware keys to prevent exiting kiosk mode
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        return when (keyCode) {
            KeyEvent.KEYCODE_HOME,
            KeyEvent.KEYCODE_BACK,
            KeyEvent.KEYCODE_MENU,
            KeyEvent.KEYCODE_RECENT_APPS -> true // Block these keys
            else -> super.onKeyDown(keyCode, event)
        }
    }
    
    // Restore kiosk mode when app regains focus naturally
    override fun onResume() {
        super.onResume()
        // Only restore kiosk mode if screen is on
        if (isScreenOn) {
            setupKioskMode()
        }
        updateUserActivity()
    }
    
    override fun onPause() {
        super.onPause()
        // Allow natural screen timeout and screensaver behavior
        // Only restart if the app was explicitly closed by user action
        // This prevents aggressive focus regaining that can crash tablets
    }
    
    override fun onDestroy() {
        super.onDestroy()
        // Unregister screen state receiver
        try {
            unregisterReceiver(screenReceiver)
        } catch (e: Exception) {
            // Receiver might not be registered
        }
        // Clean up WebView
        webView.destroy()
    }
}
