package com.soundcloud.ultimate;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.lang.ref.WeakReference;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class MainActivity extends AppCompatActivity {
    private static WeakReference<MainActivity> instanceRef;
    private WebView webView;
    private volatile String activeClientId = "8UvlHph8Fhze3ZixMeSkFXj4Dwkblsjt";

    public static boolean handlePlaybackAction(String action) {
        MainActivity activity = instanceRef != null ? instanceRef.get() : null;
        if (activity != null && !activity.isFinishing() && !activity.isDestroyed()) {
            activity.runOnUiThread(() -> {
                if (MediaPlaybackService.ACTION_PLAY_PAUSE.equals(action)) {
                    activity.webView.evaluateJavascript("togglePlayPause()", null);
                } else if (MediaPlaybackService.ACTION_NEXT.equals(action)) {
                    activity.webView.evaluateJavascript("playNext()", null);
                } else if (MediaPlaybackService.ACTION_PREV.equals(action)) {
                    activity.webView.evaluateJavascript("playPrev()", null);
                }
            });
            return true;
        }
        return false;
    }

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @SuppressWarnings("deprecation")
    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        instanceRef = new WeakReference<>(this);

        // AMOLED Dark Status & Nav Bars
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.BLACK);
        window.setNavigationBarColor(Color.BLACK);

        setContentView(R.layout.activity_main);

        // Request Notification permission on Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 101);
            }
        }

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
                String host = uri.getHost();
                String path = uri.getPath();

                if (path != null && path.startsWith("/api/")) {
                    return handleApiRequest(uri);
                }

                if (host != null && (host.endsWith("sndcdn.com") || host.endsWith("soundcloud.com") || host.endsWith("soundcloud.cloud"))) {
                    return proxyExternalMediaRequest(request);
                }

                return super.shouldInterceptRequest(view, request);
            }
        });

        // Modern back navigation handler with in-app modal and navigation dismissal
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                webView.evaluateJavascript("(function(){ return window.handleAndroidBack ? window.handleAndroidBack() : false; })()", value -> {
                    if (!"true".equals(value)) {
                        if (webView.canGoBack()) {
                            webView.goBack();
                        } else {
                            moveTaskToBack(true);
                        }
                    }
                });
            }
        });

        // Proactively refresh client_id in background
        refreshClientIdAsync();

        // Load bundled AMOLED Bento web application
        webView.loadUrl("file:///android_asset/web/index.html");

        handleIntent(getIntent());
    }

    private void refreshClientIdAsync() {
        new Thread(() -> {
            try {
                OkHttpClient client = DoHClient.getClient();
                Request req = new Request.Builder()
                        .url("https://soundcloud.com")
                        .header("User-Agent", "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36")
                        .build();
                Response resp = client.newCall(req).execute();
                if (resp.isSuccessful() && resp.body() != null) {
                    String html = resp.body().string();
                    Pattern scriptPattern = Pattern.compile("<script[^>]+src=\"(https://[^\"]+assets[^\"]+\\.js)\"");
                    Matcher m = scriptPattern.matcher(html);
                    List<String> scripts = new ArrayList<>();
                    while (m.find()) {
                        scripts.add(m.group(1));
                    }
                    Collections.reverse(scripts);
                    Pattern idPattern = Pattern.compile("client_id[:=]\"([a-zA-Z0-9]{32})\"");
                    for (int i = 0; i < Math.min(10, scripts.size()); i++) {
                        Request jsReq = new Request.Builder().url(scripts.get(i)).build();
                        Response jsResp = client.newCall(jsReq).execute();
                        if (jsResp.isSuccessful() && jsResp.body() != null) {
                            Matcher idMatcher = idPattern.matcher(jsResp.body().string());
                            if (idMatcher.find()) {
                                activeClientId = idMatcher.group(1);
                                break;
                            }
                        }
                    }
                }
            } catch (Exception ignored) {}
        }).start();
    }

    private WebResourceResponse proxyExternalMediaRequest(WebResourceRequest request) {
        try {
            Request.Builder builder = new Request.Builder().url(request.getUrl().toString());
            Map<String, String> inHeaders = request.getRequestHeaders();
            if (inHeaders != null) {
                for (Map.Entry<String, String> entry : inHeaders.entrySet()) {
                    builder.addHeader(entry.getKey(), entry.getValue());
                }
            }
            Response response = DoHClient.getClient().newCall(builder.build()).execute();
            if (response.body() != null) {
                String contentType = response.header("Content-Type", "application/octet-stream");
                String mimeType = contentType.split(";")[0].trim();
                Map<String, String> outHeaders = new HashMap<>();
                for (String name : response.headers().names()) {
                    outHeaders.put(name, response.header(name));
                }
                return new WebResourceResponse(
                        mimeType,
                        "UTF-8",
                        response.code(),
                        response.message().isEmpty() ? "OK" : response.message(),
                        outHeaders,
                        response.body().byteStream()
                );
            }
        } catch (Exception ignored) {}
        return null;
    }

    private WebResourceResponse handleApiRequest(Uri uri) {
        String path = uri.getPath();
        if (path == null) path = "";
        OkHttpClient client = DoHClient.getClient();

        try {
            if ("/api/status".equals(path)) {
                JSONObject json = new JSONObject();
                json.put("status", "ok");
                json.put("app", "SoundCloud Ultimate Android");
                json.put("version", "1.3.0");
                json.put("client_id", activeClientId);
                json.put("engine", "Android Native MediaPlayer");
                json.put("auth", new JSONObject().put("authenticated", false));
                return createJsonResponse(json.toString());
            }

            if ("/api/auth/status".equals(path)) {
                JSONObject json = new JSONObject();
                json.put("authenticated", false);
                json.put("user", JSONObject.NULL);
                json.put("message", "Guest mode (Android)");
                return createJsonResponse(json.toString());
            }

            if ("/api/discord/status".equals(path)) {
                return createJsonResponse("{\"enabled\":false,\"connected\":false}");
            }

            if ("/api/me/likes".equals(path) || "/api/me/stream".equals(path) || "/api/me/history".equals(path)) {
                return createJsonResponse("{\"tracks\":[]}");
            }

            if ("/api/me/playlists".equals(path)) {
                return createJsonResponse("{\"playlists\":[]}");
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
                if (q == null || q.trim().isEmpty()) q = "top";
                String limit = uri.getQueryParameter("limit");
                if (limit == null) limit = "24";

                String scUrl = "https://api-v2.soundcloud.com/search/tracks?q=" + Uri.encode(q)
                        + "&client_id=" + activeClientId + "&limit=" + limit;

                Request scReq = new Request.Builder().url(scUrl).build();
                Response scResp = client.newCall(scReq).execute();
                JSONArray tracks = new JSONArray();
                if (scResp.isSuccessful() && scResp.body() != null) {
                    JSONObject raw = new JSONObject(scResp.body().string());
                    JSONArray col = raw.optJSONArray("collection");
                    if (col != null) {
                        for (int i = 0; i < col.length(); i++) {
                            JSONObject tr = col.optJSONObject(i);
                            if (tr != null && tr.has("title")) {
                                tracks.put(normalizeTrackJson(tr));
                            }
                        }
                    }
                }

                // Also query playlists for rich guest & discovery browsing
                JSONArray playlists = new JSONArray();
                try {
                    String plUrl = "https://api-v2.soundcloud.com/search/playlists?q=" + Uri.encode(q)
                            + "&client_id=" + activeClientId + "&limit=16";
                    Request plReq = new Request.Builder().url(plUrl).build();
                    Response plResp = client.newCall(plReq).execute();
                    if (plResp.isSuccessful() && plResp.body() != null) {
                        JSONObject rawPl = new JSONObject(plResp.body().string());
                        JSONArray colPl = rawPl.optJSONArray("collection");
                        if (colPl != null) {
                            for (int i = 0; i < colPl.length(); i++) {
                                JSONObject pl = colPl.optJSONObject(i);
                                if (pl != null && pl.has("title")) {
                                    JSONObject pObj = new JSONObject();
                                    pObj.put("id", pl.optLong("id"));
                                    pObj.put("title", pl.optString("title", "Untitled Playlist"));
                                    JSONObject u = pl.optJSONObject("user");
                                    pObj.put("artist", u != null ? u.optString("username", "Various Artists") : "SoundCloud");
                                    pObj.put("artwork_url", pl.optString("artwork_url", ""));
                                    pObj.put("track_count", pl.optInt("track_count", 0));
                                    playlists.put(pObj);
                                }
                            }
                        }
                    }
                } catch (Exception ignored) {}

                JSONObject out = new JSONObject();
                out.put("tracks", tracks);
                out.put("playlists", playlists);
                out.put("users", new JSONArray());
                return createJsonResponse(out.toString());
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

            if (path.startsWith("/api/artists/")) {
                String artistId = path.substring("/api/artists/".length()).split("/")[0];
                String userUrl = "https://api-v2.soundcloud.com/users/" + artistId + "?client_id=" + activeClientId;
                Request userReq = new Request.Builder().url(userUrl).build();
                Response userResp = client.newCall(userReq).execute();
                if (userResp.isSuccessful() && userResp.body() != null) {
                    JSONObject user = new JSONObject(userResp.body().string());
                    String tracksUrl = "https://api-v2.soundcloud.com/users/" + artistId + "/tracks?client_id=" + activeClientId + "&limit=30";
                    Request tracksReq = new Request.Builder().url(tracksUrl).build();
                    Response tracksResp = client.newCall(tracksReq).execute();
                    JSONArray tracks = new JSONArray();
                    if (tracksResp.isSuccessful() && tracksResp.body() != null) {
                        JSONObject raw = new JSONObject(tracksResp.body().string());
                        JSONArray col = raw.optJSONArray("collection");
                        if (col != null) {
                            for (int i = 0; i < col.length(); i++) {
                                JSONObject tr = col.optJSONObject(i);
                                if (tr != null) tracks.put(normalizeTrackJson(tr));
                            }
                        }
                    }
                    JSONObject out = new JSONObject();
                    out.put("artist", user);
                    out.put("tracks", tracks);
                    return createJsonResponse(out.toString());
                }
            }

            if (path.startsWith("/api/playlists/")) {
                String plId = path.substring("/api/playlists/".length()).split("/")[0];
                String plUrl = "https://api-v2.soundcloud.com/playlists/" + plId + "?client_id=" + activeClientId;
                Request plReq = new Request.Builder().url(plUrl).build();
                Response plResp = client.newCall(plReq).execute();
                if (plResp.isSuccessful() && plResp.body() != null) {
                    JSONObject pl = new JSONObject(plResp.body().string());
                    JSONArray rawTracks = pl.optJSONArray("tracks");
                    JSONArray tracks = new JSONArray();
                    if (rawTracks != null) {
                        for (int i = 0; i < rawTracks.length(); i++) {
                            JSONObject tr = rawTracks.optJSONObject(i);
                            if (tr != null && tr.has("title")) {
                                tracks.put(normalizeTrackJson(tr));
                            }
                        }
                    }
                    pl.put("tracks", tracks);
                    return createJsonResponse(pl.toString());
                }
            }

            if (path.contains("/comments")) {
                String trackId = path.replace("/api/tracks/", "").replace("/comments", "").split("/")[0];
                String cUrl = "https://api-v2.soundcloud.com/tracks/" + trackId + "/comments?client_id=" + activeClientId + "&limit=40";
                Request cReq = new Request.Builder().url(cUrl).build();
                Response cResp = client.newCall(cReq).execute();
                if (cResp.isSuccessful() && cResp.body() != null) {
                    JSONObject raw = new JSONObject(cResp.body().string());
                    JSONArray col = raw.optJSONArray("collection");
                    JSONObject out = new JSONObject();
                    out.put("comments", col != null ? col : new JSONArray());
                    return createJsonResponse(out.toString());
                }
            }

            if (path.contains("/related")) {
                String trackId = path.replace("/api/tracks/", "").replace("/related", "").split("/")[0];
                String rUrl = "https://api-v2.soundcloud.com/tracks/" + trackId + "/related?client_id=" + activeClientId + "&limit=24";
                Request rReq = new Request.Builder().url(rUrl).build();
                Response rResp = client.newCall(rReq).execute();
                if (rResp.isSuccessful() && rResp.body() != null) {
                    JSONObject raw = new JSONObject(rResp.body().string());
                    JSONArray col = raw.optJSONArray("collection");
                    JSONArray tracks = new JSONArray();
                    if (col != null) {
                        for (int i = 0; i < col.length(); i++) {
                            JSONObject tr = col.optJSONObject(i);
                            if (tr != null) tracks.put(normalizeTrackJson(tr));
                        }
                    }
                    JSONObject out = new JSONObject();
                    out.put("tracks", tracks);
                    return createJsonResponse(out.toString());
                }
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
    protected void onDestroy() {
        if (instanceRef != null && instanceRef.get() == this) {
            instanceRef.clear();
        }
        super.onDestroy();
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
