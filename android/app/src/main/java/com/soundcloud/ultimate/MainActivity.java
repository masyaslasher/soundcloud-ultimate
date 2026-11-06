package com.soundcloud.ultimate;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private String activeClientId = "8UvlHph8Fhze3ZixMeSkFXj4Dwkblsjt";

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // AMOLED Dark Status & Nav Bars
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.BLACK);
        window.setNavigationBarColor(Color.BLACK);

        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        webView.setBackgroundColor(Color.BLACK);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setUserAgentString("Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 SoundCloudUltimate/1.3.0");

        webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String path = uri.getPath();

                if (path != null && path.startsWith("/api/")) {
                    return handleApiRequest(uri);
                }

                return super.shouldInterceptRequest(view, request);
            }
        });

        // Load bundled AMOLED Bento web application
        webView.loadUrl("file:///android_asset/web/index.html");

        handleIntent(getIntent());
    }

    private WebResourceResponse handleApiRequest(Uri uri) {
        String path = uri.getPath();
        OkHttpClient client = DoHClient.getClient();

        try {
            if ("/api/status".equals(path)) {
                JSONObject json = new JSONObject();
                json.put("app", "SoundCloud Ultimate Android");
                json.put("version", "1.3.0");
                json.put("client_id_ready", true);
                json.put("antidpi", true);
                json.put("doh_active", true);
                return createJsonResponse(json.toString());
            }

            if ("/api/trending".equals(path)) {
                String genre = uri.getQueryParameter("genre");
                String limit = uri.getQueryParameter("limit");
                if (limit == null) limit = "24";
                String genreParam = (genre != null && !genre.isEmpty()) ? "soundcloud:genres:" + genre : "soundcloud:genres:all-music";

                String scUrl = "https://api-v2.soundcloud.com/charts?kind=top&genre=" + Uri.encode(genreParam)
                        + "&client_id=" + activeClientId + "&limit=" + limit;

                Request scReq = new Request.Builder().url(scUrl).build();
                Response scResp = client.newCall(scReq).execute();
                if (scResp.isSuccessful() && scResp.body() != null) {
                    JSONObject raw = new JSONObject(scResp.body().string());
                    JSONArray col = raw.optJSONArray("collection");
                    JSONArray tracks = new JSONArray();
                    if (col != null) {
                        for (int i = 0; i < col.length(); i++) {
                            JSONObject item = col.optJSONObject(i);
                            if (item != null) {
                                JSONObject tr = item.optJSONObject("track");
                                if (tr != null) tracks.put(normalizeTrackJson(tr));
                            }
                        }
                    }
                    JSONObject out = new JSONObject();
                    out.put("tracks", tracks);
                    return createJsonResponse(out.toString());
                }
            }

            if ("/api/search".equals(path)) {
                String q = uri.getQueryParameter("q");
                if (q == null) q = "";
                String scUrl = "https://api-v2.soundcloud.com/search?q=" + Uri.encode(q)
                        + "&client_id=" + activeClientId + "&limit=24";

                Request scReq = new Request.Builder().url(scUrl).build();
                Response scResp = client.newCall(scReq).execute();
                if (scResp.isSuccessful() && scResp.body() != null) {
                    JSONObject raw = new JSONObject(scResp.body().string());
                    JSONArray col = raw.optJSONArray("collection");
                    JSONArray tracks = new JSONArray();
                    if (col != null) {
                        for (int i = 0; i < col.length(); i++) {
                            JSONObject tr = col.optJSONObject(i);
                            if (tr != null && tr.has("title")) {
                                tracks.put(normalizeTrackJson(tr));
                            }
                        }
                    }
                    JSONObject out = new JSONObject();
                    out.put("tracks", tracks);
                    out.put("playlists", new JSONArray());
                    out.put("users", new JSONArray());
                    return createJsonResponse(out.toString());
                }
            }

            if ("/api/stream".equals(path)) {
                String id = uri.getQueryParameter("id");
                String trackUrl = "https://api-v2.soundcloud.com/tracks/" + id + "?client_id=" + activeClientId;
                Request trReq = new Request.Builder().url(trackUrl).build();
                Response trResp = client.newCall(trReq).execute();
                if (trResp.isSuccessful() && trResp.body() != null) {
                    JSONObject trJson = new JSONObject(trResp.body().string());
                    JSONObject media = trJson.optJSONObject("media");
                    if (media != null) {
                        JSONArray trans = media.optJSONArray("transcodings");
                        if (trans != null && trans.length() > 0) {
                            String streamInfoUrl = null;
                            String protocol = "hls";
                            for (int i = 0; i < trans.length(); i++) {
                                JSONObject tc = trans.getJSONObject(i);
                                JSONObject format = tc.optJSONObject("format");
                                if (format != null && "progressive".equals(format.optString("protocol"))) {
                                    streamInfoUrl = tc.optString("url");
                                    protocol = "progressive";
                                    break;
                                }
                            }
                            if (streamInfoUrl == null) {
                                streamInfoUrl = trans.getJSONObject(0).optString("url");
                            }

                            if (streamInfoUrl != null) {
                                Request sReq = new Request.Builder().url(streamInfoUrl + "?client_id=" + activeClientId).build();
                                Response sResp = client.newCall(sReq).execute();
                                if (sResp.isSuccessful() && sResp.body() != null) {
                                    JSONObject sJson = new JSONObject(sResp.body().string());
                                    String finalUrl = sJson.optString("url");
                                    JSONObject out = new JSONObject();
                                    out.put("stream_url", finalUrl);
                                    out.put("protocol", protocol);
                                    return createJsonResponse(out.toString());
                                }
                            }
                        }
                    }
                }
            }

            if ("/api/discord/status".equals(path)) {
                return createJsonResponse("{\"enabled\":false,\"connected\":false}");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return createJsonResponse("{\"status\":\"ok\"}");
    }

    private JSONObject normalizeTrackJson(JSONObject tr) {
        JSONObject out = new JSONObject();
        try {
            out.put("id", tr.optLong("id"));
            out.put("title", tr.optString("title", "Track"));
            JSONObject user = tr.optJSONObject("user");
            out.put("artist", user != null ? user.optString("username", "Artist") : "Artist");
            String art = tr.optString("artwork_url", "");
            if (art.isEmpty() && user != null) art = user.optString("avatar_url", "");
            out.put("artwork_url", art.replace("-large.jpg", "-t500x500.jpg"));
            out.put("duration_ms", tr.optLong("duration", 0));
            out.put("playback_count", tr.optLong("playback_count", 0));
            out.put("likes_count", tr.optLong("likes_count", 0));
            out.put("waveform_url", tr.optString("waveform_url", ""));
            out.put("permalink_url", tr.optString("permalink_url", ""));
        } catch (Exception ignored) {}
        return out;
    }

    private WebResourceResponse createJsonResponse(String json) {
        InputStream stream = new ByteArrayInputStream(json.getBytes(StandardCharsets.UTF_8));
        return new WebResourceResponse("application/json", "UTF-8", 200, "OK", null, stream);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent != null && intent.getAction() != null) {
            String action = intent.getAction();
            if (MediaPlaybackService.ACTION_PLAY_PAUSE.equals(action)) {
                runOnUiThread(() -> webView.evaluateJavascript("togglePlayPause()", null));
            } else if (MediaPlaybackService.ACTION_NEXT.equals(action)) {
                runOnUiThread(() -> webView.evaluateJavascript("playNext()", null));
            } else if (MediaPlaybackService.ACTION_PREV.equals(action)) {
                runOnUiThread(() -> webView.evaluateJavascript("playPrev()", null));
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            moveTaskToBack(true);
        }
    }

    public class AndroidBridge {
        @JavascriptInterface
        public void updatePlayback(String title, String artist, String artworkUrl, boolean isPlaying, long durationMs, long currentMs) {
            Intent serviceIntent = new Intent(MainActivity.this, MediaPlaybackService.class);
            serviceIntent.setAction(MediaPlaybackService.ACTION_UPDATE);
            serviceIntent.putExtra(MediaPlaybackService.EXTRA_TITLE, title);
            serviceIntent.putExtra(MediaPlaybackService.EXTRA_ARTIST, artist);
            serviceIntent.putExtra(MediaPlaybackService.EXTRA_ARTWORK, artworkUrl);
            serviceIntent.putExtra(MediaPlaybackService.EXTRA_IS_PLAYING, isPlaying);
            serviceIntent.putExtra(MediaPlaybackService.EXTRA_DURATION, durationMs);
            serviceIntent.putExtra(MediaPlaybackService.EXTRA_POSITION, currentMs);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }
        }
    }
}
