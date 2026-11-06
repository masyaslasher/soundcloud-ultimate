package com.soundcloud.ultimate;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import okhttp3.Request;
import okhttp3.Response;

public class MediaPlaybackService extends Service {
    public static final String ACTION_UPDATE = "com.soundcloud.ultimate.ACTION_UPDATE";
    public static final String ACTION_PLAY_PAUSE = "com.soundcloud.ultimate.ACTION_PLAY_PAUSE";
    public static final String ACTION_NEXT = "com.soundcloud.ultimate.ACTION_NEXT";
    public static final String ACTION_PREV = "com.soundcloud.ultimate.ACTION_PREV";

    public static final String EXTRA_TITLE = "extra_title";
    public static final String EXTRA_ARTIST = "extra_artist";
    public static final String EXTRA_ARTWORK = "extra_artwork";
    public static final String EXTRA_IS_PLAYING = "extra_is_playing";
    public static final String EXTRA_DURATION = "extra_duration";
    public static final String EXTRA_POSITION = "extra_position";

    private static final String CHANNEL_ID = "sc_media_channel";
    private static final int NOTIFICATION_ID = 4545;

    private MediaSessionCompat mediaSession;
    private PowerManager.WakeLock wakeLock;
    private String currentTitle = "SoundCloud Ultimate";
    private String currentArtist = "Playing Music";
    private String currentArtwork = "";
    private boolean isPlaying = false;
    private long duration = 0;
    private long position = 0;
    private Bitmap artworkBitmap = null;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();

        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "SoundCloudUltimate:WakeLock");
            wakeLock.setReferenceCounted(false);
        }

        mediaSession = new MediaSessionCompat(this, "SoundCloudUltimateSession");
        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override
            public void onPlay() {
                sendActionToActivity(ACTION_PLAY_PAUSE);
            }

            @Override
            public void onPause() {
                sendActionToActivity(ACTION_PLAY_PAUSE);
            }

            @Override
            public void onSkipToNext() {
                sendActionToActivity(ACTION_NEXT);
            }

            @Override
            public void onSkipToPrevious() {
                sendActionToActivity(ACTION_PREV);
            }
        });
        mediaSession.setActive(true);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    getString(R.string.channel_name),
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription(getString(R.string.channel_desc));
            channel.setShowBadge(false);
            channel.setSound(null, null);

            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) {
                nm.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_UPDATE.equals(action)) {
                currentTitle = intent.getStringExtra(EXTRA_TITLE);
                if (currentTitle == null) currentTitle = "SoundCloud Track";
                currentArtist = intent.getStringExtra(EXTRA_ARTIST);
                if (currentArtist == null) currentArtist = "Artist";
                String artUrl = intent.getStringExtra(EXTRA_ARTWORK);
                isPlaying = intent.getBooleanExtra(EXTRA_IS_PLAYING, false);
                duration = intent.getLongExtra(EXTRA_DURATION, 0);
                position = intent.getLongExtra(EXTRA_POSITION, 0);

                if (artUrl != null && !artUrl.equals(currentArtwork)) {
                    currentArtwork = artUrl;
                    loadArtworkAsync(currentArtwork);
                }

                updateMediaSession();
                Notification notification = buildNotification();
                startForeground(NOTIFICATION_ID, notification);

                if (isPlaying) {
                    if (wakeLock != null && !wakeLock.isHeld()) {
                        wakeLock.acquire(180 * 60 * 1000L); // 3 hours max
                    }
                } else {
                    if (wakeLock != null && wakeLock.isHeld()) {
                        wakeLock.release();
                    }
                }
            } else if (ACTION_PLAY_PAUSE.equals(action)) {
                sendActionToActivity(ACTION_PLAY_PAUSE);
            } else if (ACTION_NEXT.equals(action)) {
                sendActionToActivity(ACTION_NEXT);
            } else if (ACTION_PREV.equals(action)) {
                sendActionToActivity(ACTION_PREV);
            }
        }
        return START_NOT_STICKY;
    }

    private void loadArtworkAsync(String urlStr) {
        new Thread(() -> {
            try {
                if (urlStr != null && urlStr.startsWith("http")) {
                    Request req = new Request.Builder().url(urlStr).build();
                    Response resp = DoHClient.getClient().newCall(req).execute();
                    if (resp.isSuccessful() && resp.body() != null) {
                        artworkBitmap = BitmapFactory.decodeStream(resp.body().byteStream());
                        updateMediaSession();
                        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                        if (nm != null) {
                            nm.notify(NOTIFICATION_ID, buildNotification());
                        }
                    }
                }
            } catch (Exception ignored) {}
        }).start();
    }

    private void updateMediaSession() {
        int state = isPlaying ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED;
        mediaSession.setPlaybackState(new PlaybackStateCompat.Builder()
                .setActions(PlaybackStateCompat.ACTION_PLAY_PAUSE |
                        PlaybackStateCompat.ACTION_PLAY |
                        PlaybackStateCompat.ACTION_PAUSE |
                        PlaybackStateCompat.ACTION_SKIP_TO_NEXT |
                        PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS)
                .setState(state, position, isPlaying ? 1.0f : 0.0f)
                .build());

        MediaMetadataCompat.Builder metaBuilder = new MediaMetadataCompat.Builder()
                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, currentTitle)
                .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, currentArtist)
                .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, duration);

        if (artworkBitmap != null) {
            metaBuilder.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, artworkBitmap);
        }

        mediaSession.setMetadata(metaBuilder.build());
    }

    private Notification buildNotification() {
        Intent contentIntent = new Intent(this, MainActivity.class);
        contentIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pContent = PendingIntent.getActivity(
                this, 0, contentIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        PendingIntent pPrev = PendingIntent.getService(
                this, 1, new Intent(this, MediaPlaybackService.class).setAction(ACTION_PREV),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        PendingIntent pPlayPause = PendingIntent.getService(
                this, 2, new Intent(this, MediaPlaybackService.class).setAction(ACTION_PLAY_PAUSE),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        PendingIntent pNext = PendingIntent.getService(
                this, 3, new Intent(this, MediaPlaybackService.class).setAction(ACTION_NEXT),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        int playIcon = isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play;

        androidx.media.app.NotificationCompat.MediaStyle mediaStyle = new androidx.media.app.NotificationCompat.MediaStyle()
                .setMediaSession(mediaSession.getSessionToken())
                .setShowActionsInCompactView(0, 1, 2);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(currentTitle)
                .setContentText(currentArtist)
                .setContentIntent(pContent)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setStyle(mediaStyle)
                .addAction(android.R.drawable.ic_media_previous, "Prev", pPrev)
                .addAction(playIcon, "Play/Pause", pPlayPause)
                .addAction(android.R.drawable.ic_media_next, "Next", pNext)
                .setOngoing(isPlaying)
                .setShowWhen(false);

        if (artworkBitmap != null) {
            builder.setLargeIcon(artworkBitmap);
        }

        return builder.build();
    }

    private void sendActionToActivity(String action) {
        boolean handled = MainActivity.handlePlaybackAction(action);
        if (!handled) {
            try {
                Intent intent = new Intent(this, MainActivity.class);
                intent.setAction(action);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                startActivity(intent);
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void onDestroy() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        if (mediaSession != null) {
            mediaSession.release();
        }
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
