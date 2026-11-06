// SoundCloud Ultimate — Desktop Player Engine v1.2
// 100% In-App Experience: Zero External Redirects
(function() {
  'use strict';

  // Helper Utilities
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function formatDurationMs(ms) {
    return formatTime(Math.floor(ms / 1000));
  }

  function formatCount(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  // Global Language & Translations (8 Languages)
  let currentLang = localStorage.getItem('lang') || 'en';
  const TRANSLATIONS = {
  "en": {
    "search_placeholder": "Search tracks, artists, albums...",
    "themes_btn": "Themes (10)",
    "extensions_btn": "Extensions (6)",
    "login_btn": "Sign In",
    "my_profile": "My Profile",
    "logout": "Sign Out",
    "chip_trending": "🔥 Trending",
    "chip_likes": "❤️ Liked",
    "chip_playlists": "📂 Playlists",
    "chip_stream": "📡 Stream",
    "chip_history": "🕒 History",
    "hero_tag": "🔥 Top of the Week",
    "listen_now": "Listen Now",
    "queue_title": "Play Queue",
    "select_track": "Select a track to play",
    "auth_title": "Sign In to SoundCloud",
    "btn_import": "⚡ 1-Click Sign In (from Chromium)",
    "auth_help_head": "Sign in without manual tokens:",
    "auth_help_body": "If you are already logged in to soundcloud.com in Chromium / Chrome, click the button above to connect automatically!",
    "btn_open_sc": "🌐 Open SoundCloud Login Page in Browser",
    "auth_divider": "or enter session token manually",
    "btn_submit_token": "Connect Account",
    "theme_title": "Themes (10 AMOLED Palettes)",
    "ext_title": "Built-in Extensions Hub (6 Modules)",
    "ext_discord_name": "Discord Rich Presence (Linux & Windows)",
    "ext_discord_desc": "Broadcasts current track, artist, album art, animated progress bar, and 'Listen on SoundCloud' button to your Discord profile on Linux & Windows.",
    "ext_lang_name": "Language & Localization",
    "ext_lang_desc": "Switch between 8 supported interface languages (EN, RU, DE, FR, JA, UK, PL, HY).",
    "ext_btn_change_lang": "Change Language",
    "eq_title": "Studio Equalizer & Bass",
    "comments_title": "Track Comments",
    "comment_placeholder": "Write a comment at current timestamp...",
    "btn_send": "Send",
    "sleep_title": "Smart Sleep Timer",
    "sleep_desc": "Music will gently fade out over 30 seconds before stopping, preserving your sleep.",
    "sleep_chip_track": "End of track",
    "btn_cancel_sleep": "Cancel Active Timer",
    "fx_title": "Audio FX Studio",
    "radar_hint": "Headphones recommended for 3D orbital binaural effect",
    "fx_speed_title": "⚡ Speed & Pitch",
    "speed_norm": "Normal",
    "looper_title": "A-B Precision Looper",
    "looper_desc": "Seamlessly loop any segment of the track (guitar solo, beat drop, chorus).",
    "loop_start": "Start:",
    "loop_end": "End:",
    "btn_loop_active": "Enable Loop",
    "btn_loop_clear": "Reset",
    "card_title": "Social Bento Track Card Generator",
    "btn_copy_card": "Copy to Clipboard",
    "btn_download_card": "Download PNG",
    "dropdown_lang": "Language: English",
    "lang_modal_title": "🌐 Select Language",
    "toast_lang": "🇺🇸 Language set to English",
    "toast_liked": "Added to SoundCloud Likes",
    "toast_unliked": "Removed from SoundCloud Likes",
    "toast_liked_guest": "Added to Local Favorites • Sign in to sync",
    "toast_unliked_guest": "Removed from Local Favorites",
    "toast_guest_follow": "Sign in to SoundCloud to follow artists",
    "toast_guest_comment": "Sign in to SoundCloud to post comments",
    "no_likes_guest_title": "Your Local Favorites is empty",
    "no_likes_guest_desc": "Tap ❤️ on any track to save it here, or sign in to sync with SoundCloud.",
    "no_history_title": "No playback history yet",
    "no_history_desc": "Tracks you play will automatically appear here for quick access.",
    "stream_guest_title": "Personal Stream requires an account",
    "stream_guest_desc": "Stream shows updates from artists you follow on SoundCloud. You can listen freely to Trending, Liked Tracks, Playlists, and Search without an account, or sign in whenever you wish!",
    "featured_playlists": "Featured & Top Playlists",
    "lang_native_name": "English",
    "active_lang_prefix": "Active: ",
    "trending_title": "Trending",
    "search_results_title": "Search Results",
    "radio_station_title": "Radio Station",
    "genre_all": "All Genres",
    "genres": {
      "phonk": "Phonk",
      "electronic": "Electronic",
      "hiphoprap": "Hip-Hop",
      "ambient": "Ambient",
      "rock": "Rock",
      "danceedm": "EDM",
      "rbsoul": "R&B",
      "indie": "Indie"
    },
    "subtitle_local_lib": "Local Library",
    "subtitle_sc_lib": "SoundCloud",
    "subtitle_featured_pl": "Featured & Top Playlists",
    "subtitle_following": "Following",
    "subtitle_local_history": "Local History",
    "subtitle_sc_history": "SoundCloud",
    "btn_clear_history": "Clear History",
    "toast_history_cleared": "🗑️ History cleared",
    "no_tracks_found": "No tracks found",
    "no_playlists_found": "No playlists found",
    "txt_stat_tracks": "Tracks",
    "txt_stat_followers": "Followers",
    "txt_stat_likes": "Likes",
    "txt_prof_tracks_title": "Popular Tracks",
    "txt_prof_pl_title": "Albums & Playlists",
    "txt_play_playlist": "Play All",
    "ext_lyrics_name": "Karaoke & Synced Lyrics",
    "ext_lyrics_desc": "Automatic synchronized lyrics lookup from LRCLIB with line-by-line scrolling and vocal highlights.",
    "ext_sleep_name": "Smart Sleep Timer",
    "ext_sleep_desc": "Stop music after a set duration or at the end of the track, featuring a gentle 30-second volume fade-out.",
    "ext_fx_name": "Audio FX Studio: 8D Audio & Speed",
    "ext_fx_desc": "360° binaural spatial audio rotation for headphones with radar, Nightcore, Slowed + Reverb, and pitch slider.",
    "ext_looper_name": "A-B Precision Looper",
    "ext_looper_desc": "Instantly set loop points [A] and [B] on the timeline for infinite seamless repetition of drops and beats.",
    "ext_card_name": "Social Track Card Generator",
    "ext_card_desc": "Generate high-res aesthetic AMOLED cards for the current track with waveform, art, and metadata.",
    "guest_user": "Guest",
    "drop_lang_header": "Language / Язык",
    "dropdown_login": "⚡ Sign In / Войти",
    "toast_lang_switched": "🇺🇸 Language switched to English"
  },
  "ru": {
    "search_placeholder": "Поиск треков, исполнителей, альбомов...",
    "themes_btn": "Темы (10)",
    "extensions_btn": "Расширения (6)",
    "login_btn": "Войти в аккаунт",
    "my_profile": "Мой профиль",
    "logout": "Выйти",
    "chip_trending": "🔥 В тренде",
    "chip_likes": "❤️ Мои Лайки",
    "chip_playlists": "📂 Мои Плейлисты",
    "chip_stream": "📡 Моя Лента",
    "chip_history": "🕒 История",
    "hero_tag": "🔥 Топ недели",
    "listen_now": "Слушать сейчас",
    "queue_title": "Очередь воспроизведения",
    "select_track": "Выберите трек для воспроизведения",
    "auth_title": "Вход в аккаунт SoundCloud",
    "btn_import": "⚡ Авторизоваться в 1 клик (из Chromium)",
    "auth_help_head": "Вход без ручного ввода токенов:",
    "auth_help_body": "Если вы уже вошли на soundcloud.com в Chromium, нажмите кнопку выше — приложение автоматически подключит ваш аккаунт!",
    "btn_open_sc": "🌐 Открыть страницу входа SoundCloud в браузере",
    "auth_divider": "или введите токен сессии",
    "btn_submit_token": "Подключить аккаунт",
    "theme_title": "Темы оформления (10 AMOLED палитр)",
    "ext_title": "Центр встроенных расширений (6 модулей)",
    "ext_discord_name": "Discord Rich Presence (Linux и Windows)",
    "ext_discord_desc": "Синхронизация трека, исполнителя, таймлайна и кликабельной ссылки в профиле Discord без сторонних утилит.",
    "ext_lang_name": "Локализация и языки",
    "ext_lang_desc": "Переключение между 8 поддерживаемыми языками (EN, RU, DE, FR, JA, UK, PL, HY).",
    "ext_btn_change_lang": "Сменить язык",
    "eq_title": "Студийный Эквалайзер & Бас",
    "comments_title": "Комментарии к треку",
    "comment_placeholder": "Написать комментарий на текущей секунде...",
    "btn_send": "Отправить",
    "sleep_title": "Умный таймер сна",
    "sleep_desc": "Музыка плавно затихнет за 30 секунд до истечения времени, оберегая ваш сон.",
    "sleep_chip_track": "Конец трека",
    "btn_cancel_sleep": "Отключить активный таймер",
    "fx_title": "Студия звуковых эффектов FX",
    "radar_hint": "Рекомендуется слушать в наушниках для эффекта 3D-орбиты",
    "fx_speed_title": "⚡ Скорость & Тональность",
    "speed_norm": "Обычная",
    "looper_title": "A-B Looper (Зацикливание фрагмента)",
    "looper_desc": "Позволяет бесконечно воспроизводить выбранный фрагмент трека (соло, дроп, бит).",
    "loop_start": "Метка начала:",
    "loop_end": "Метка конца:",
    "btn_loop_active": "Включить цикл",
    "btn_loop_clear": "Сбросить",
    "card_title": "Bento-карточка трека для соцсетей",
    "btn_copy_card": "Скопировать картинку",
    "btn_download_card": "Скачать PNG",
    "dropdown_lang": "Язык: Русский",
    "lang_modal_title": "🌐 Выберите язык",
    "toast_lang": "🇷🇺 Язык интерфейса: Русский",
    "toast_liked": "Добавлено в лайки SoundCloud",
    "toast_unliked": "Удалено из лайков SoundCloud",
    "toast_liked_guest": "Добавлено в локальные лайки • Войдите для синхронизации",
    "toast_unliked_guest": "Удалено из локальных лайков",
    "toast_guest_follow": "Войдите в SoundCloud, чтобы подписаться на исполнителя",
    "toast_guest_comment": "Войдите в SoundCloud, чтобы оставлять комментарии",
    "no_likes_guest_title": "Ваши локальные лайки пусты",
    "no_likes_guest_desc": "Нажмите ❤️ на любом треке, чтобы сохранить его, или войдите в аккаунт.",
    "no_history_title": "История прослушиваний пуста",
    "no_history_desc": "Прослушанные треки автоматически появятся здесь.",
    "stream_guest_title": "Личная лента доступна после входа",
    "stream_guest_desc": "Лента показывает обновления от авторов, на которых вы подписаны. Слушать тренды, лайки и плейлисты можно свободно без аккаунта!",
    "featured_playlists": "Популярные плейлисты",
    "lang_native_name": "Русский",
    "active_lang_prefix": "Активно: ",
    "trending_title": "В тренде",
    "search_results_title": "Результаты поиска",
    "radio_station_title": "Радиостанция",
    "genre_all": "Все жанры",
    "genres": {
      "phonk": "Фонк",
      "electronic": "Электроника",
      "hiphoprap": "Хип-хоп",
      "ambient": "Эмбиент",
      "rock": "Рок",
      "danceedm": "EDM",
      "rbsoul": "R&B",
      "indie": "Инди"
    },
    "subtitle_local_lib": "Локальная библиотека",
    "subtitle_sc_lib": "SoundCloud",
    "subtitle_featured_pl": "Популярные плейлисты",
    "subtitle_following": "Подписки",
    "subtitle_local_history": "Локальная история",
    "subtitle_sc_history": "SoundCloud",
    "btn_clear_history": "Очистить историю",
    "toast_history_cleared": "🗑️ История очищена",
    "no_tracks_found": "Треки не найдены",
    "no_playlists_found": "Плейлисты не найдены",
    "txt_stat_tracks": "Треков",
    "txt_stat_followers": "Подписчиков",
    "txt_stat_likes": "Лайков",
    "txt_prof_tracks_title": "Популярные треки",
    "txt_prof_pl_title": "Альбомы и плейлисты",
    "txt_play_playlist": "Слушать всё",
    "ext_lyrics_name": "Караоке и синхронный текст",
    "ext_lyrics_desc": "Автоматический поиск текста в базе LRCLIB с синхронной построчной прокруткой и подсветкой строк.",
    "ext_sleep_name": "Умный таймер сна",
    "ext_sleep_desc": "Остановка музыки через заданное время с мягким 30-секундным затуханием звука.",
    "ext_fx_name": "Студия аудио FX: 8D Audio и Скорость",
    "ext_fx_desc": "360° бинауральное пространственное вращение стереобазы в наушниках с радаром, Nightcore и Slowed.",
    "ext_looper_name": "A-B Прецизионный лупер",
    "ext_looper_desc": "Мгновенная установка меток [A] и [B] для бесконечного бесшовного зацикливания любимых дропов и битов.",
    "ext_card_name": "Генератор Bento-карточек трека",
    "ext_card_desc": "Создание стильных AMOLED-карточек трека с аудиоволной и обложкой для соцсетей.",
    "guest_user": "Гость",
    "drop_lang_header": "Язык интерфейса",
    "dropdown_login": "⚡ Войти в аккаунт",
    "toast_lang_switched": "🇷🇺 Язык интерфейса изменен на Русский"
  },
  "de": {
    "search_placeholder": "Titel, Künstler, Alben suchen...",
    "themes_btn": "Designs (10)",
    "extensions_btn": "Erweiterungen (6)",
    "login_btn": "Anmelden",
    "my_profile": "Mein Profil",
    "logout": "Abmelden",
    "chip_trending": "🔥 Angesagt",
    "chip_likes": "❤️ Favoriten",
    "chip_playlists": "📂 Playlists",
    "chip_stream": "📡 Feed",
    "chip_history": "🕒 Verlauf",
    "hero_tag": "🔥 Hit der Woche",
    "listen_now": "Jetzt anhören",
    "queue_title": "Wiedergabeliste",
    "select_track": "Titel zum Abspielen auswählen",
    "auth_title": "Bei SoundCloud anmelden",
    "btn_import": "⚡ 1-Klick-Anmeldung (aus Chromium)",
    "auth_help_head": "Anmelden ohne manuelle Token:",
    "auth_help_body": "Wenn Sie bereits bei soundcloud.com in Chromium / Chrome angemeldet sind, klicken Sie oben für die automatische Verbindung!",
    "btn_open_sc": "🌐 SoundCloud-Anmeldeseite im Browser öffnen",
    "auth_divider": "oder Sitzungstoken manuell eingeben",
    "btn_submit_token": "Konto verbinden",
    "theme_title": "Designs (10 AMOLED-Farbpaletten)",
    "ext_title": "Integrierter Erweiterungs-Hub (6 Module)",
    "ext_discord_name": "Discord Rich Presence (Linux & Windows)",
    "ext_discord_desc": "Überträgt aktuellen Titel, Künstler, Albumcover und Fortschrittsbalken direkt auf Ihr Discord-Profil.",
    "ext_lang_name": "Sprache & Lokalisierung",
    "ext_lang_desc": "Umschalten zwischen 8 unterstützten Oberflächensprachen (EN, RU, DE, FR, JA, UK, PL, HY).",
    "ext_btn_change_lang": "Sprache ändern",
    "eq_title": "Studio-Equalizer & Bass",
    "comments_title": "Titelkommentare",
    "comment_placeholder": "Kommentar an der aktuellen Position schreiben...",
    "btn_send": "Senden",
    "sleep_title": "Smarter Sleep-Timer",
    "sleep_desc": "Die Musik blendet 30 Sekunden vor dem Stoppen sanft aus, um Ihren Schlaf zu schonen.",
    "sleep_chip_track": "Ende des Titels",
    "btn_cancel_sleep": "Aktiven Timer abbrechen",
    "fx_title": "Audio-FX-Studio",
    "radar_hint": "Kopfhörer für 3D-Binaural-Orbital-Effekt empfohlen",
    "fx_speed_title": "⚡ Geschwindigkeit & Tonhöhe",
    "speed_norm": "Normal",
    "looper_title": "A-B Präzisions-Looper",
    "looper_desc": "Wiederholen Sie nahtlos jeden beliebigen Teil des Titels (Gitarrensolo, Beat-Drop, Refrain).",
    "loop_start": "Startpunkt:",
    "loop_end": "Endpunkt:",
    "btn_loop_active": "Schleife aktivieren",
    "btn_loop_clear": "Zurücksetzen",
    "card_title": "Social-Bento-Trackcard-Generator",
    "btn_copy_card": "In Zwischenablage kopieren",
    "btn_download_card": "PNG herunterladen",
    "dropdown_lang": "Sprache: Deutsch",
    "lang_modal_title": "🌐 Sprache auswählen",
    "toast_lang": "🇩🇪 Sprache auf Deutsch eingestellt",
    "toast_liked": "Zu SoundCloud-Favoriten hinzugefügt",
    "toast_unliked": "Aus SoundCloud-Favoriten entfernt",
    "toast_liked_guest": "Zu lokalen Favoriten hinzugefügt • Zum Synchronisieren anmelden",
    "toast_unliked_guest": "Aus lokalen Favoriten entfernt",
    "toast_guest_follow": "Bei SoundCloud anmelden, um Künstlern zu folgen",
    "toast_guest_comment": "Bei SoundCloud anmelden, um Kommentare zu posten",
    "no_likes_guest_title": "Ihre lokalen Favoriten sind leer",
    "no_likes_guest_desc": "Tippen Sie auf ❤️ bei einem beliebigen Titel, um ihn zu speichern, oder melden Sie sich an.",
    "no_history_title": "Noch kein Wiedergabeverlauf",
    "no_history_desc": "Gespielte Titel werden automatisch hier angezeigt.",
    "stream_guest_title": "Persönlicher Stream erfordert ein Konto",
    "stream_guest_desc": "Der Stream zeigt Updates von Künstlern, denen Sie folgen. Trends, Favoriten und Playlists können ohne Konto gehört werden!",
    "featured_playlists": "Beliebte Playlists",
    "lang_native_name": "Deutsch",
    "active_lang_prefix": "Aktiv: ",
    "trending_title": "Angesagt",
    "search_results_title": "Suchergebnisse",
    "radio_station_title": "Radiosender",
    "genre_all": "Alle Genres",
    "genres": {
      "phonk": "Phonk",
      "electronic": "Elektronisch",
      "hiphoprap": "Hip-Hop",
      "ambient": "Ambient",
      "rock": "Rock",
      "danceedm": "EDM",
      "rbsoul": "R&B",
      "indie": "Indie"
    },
    "subtitle_local_lib": "Lokale Mediathek",
    "subtitle_sc_lib": "SoundCloud",
    "subtitle_featured_pl": "Beliebte Playlists",
    "subtitle_following": "Abonnements",
    "subtitle_local_history": "Lokaler Verlauf",
    "subtitle_sc_history": "SoundCloud",
    "btn_clear_history": "Verlauf löschen",
    "toast_history_cleared": "🗑️ Verlauf gelöscht",
    "no_tracks_found": "Keine Titel gefunden",
    "no_playlists_found": "Keine Playlists gefunden",
    "txt_stat_tracks": "Titel",
    "txt_stat_followers": "Follower",
    "txt_stat_likes": "Gefällt mir",
    "txt_prof_tracks_title": "Beliebte Titel",
    "txt_prof_pl_title": "Alben & Playlists",
    "txt_play_playlist": "Alle abspielen",
    "ext_lyrics_name": "Karaoke & Synchrone Songtexte",
    "ext_lyrics_desc": "Automatische Songtextsuche über LRCLIB mit zeilenweisem Scrollen in Echtzeit.",
    "ext_sleep_name": "Smarter Sleep-Timer",
    "ext_sleep_desc": "Stoppt die Musik nach einer festgelegten Zeit mit sanfter 30-Sekunden-Ausblendung.",
    "ext_fx_name": "Audio-FX-Studio: 8D & Tempo",
    "ext_fx_desc": "360°-Binaural-Raumklang für Kopfhörer mit Radar, Nightcore und Slowed-Modus.",
    "ext_looper_name": "A-B Präzisions-Looper",
    "ext_looper_desc": "Setzen Sie Punkte [A] und [B] für nahtlose Endlosschleifen von Soli und Beats.",
    "ext_card_name": "Social-Bento-Trackcard-Generator",
    "ext_card_desc": "Erstellen Sie hochauflösende AMOLED-Karten für den aktuellen Titel zum Teilen.",
    "guest_user": "Gast",
    "drop_lang_header": "Oberflächensprache",
    "dropdown_login": "⚡ Bei SoundCloud anmelden",
    "toast_lang_switched": "🇩🇪 Sprache auf Deutsch geändert"
  },
  "fr": {
    "search_placeholder": "Rechercher titres, artistes, albums...",
    "themes_btn": "Thèmes (10)",
    "extensions_btn": "Extensions (6)",
    "login_btn": "Se connecter",
    "my_profile": "Mon profil",
    "logout": "Déconnexion",
    "chip_trending": "🔥 Tendances",
    "chip_likes": "❤️ J'aime",
    "chip_playlists": "📂 Playlists",
    "chip_stream": "📡 Flux",
    "chip_history": "🕒 Historique",
    "hero_tag": "🔥 Top de la semaine",
    "listen_now": "Écouter",
    "queue_title": "File d'attente",
    "select_track": "Sélectionnez un titre à lire",
    "auth_title": "Connexion à SoundCloud",
    "btn_import": "⚡ Connexion en 1 clic (depuis Chromium)",
    "auth_help_head": "Connexion sans jetons manuels :",
    "auth_help_body": "Si vous êtes déjà connecté à soundcloud.com dans Chromium / Chrome, cliquez ci-dessus pour vous connecter automatiquement !",
    "btn_open_sc": "🌐 Ouvrir la page de connexion SoundCloud dans le navigateur",
    "auth_divider": "ou entrer le jeton de session manuellement",
    "btn_submit_token": "Connecter le compte",
    "theme_title": "Thèmes (10 palettes AMOLED)",
    "ext_title": "Centre d'extensions intégrées (6 modules)",
    "ext_discord_name": "Discord Rich Presence (Linux et Windows)",
    "ext_discord_desc": "Diffuse le titre en cours, l'artiste, la pochette et la barre de progression sur votre profil Discord.",
    "ext_lang_name": "Langue et localisation",
    "ext_lang_desc": "Basculer entre les 8 langues d'interface prises en charge (EN, RU, DE, FR, JA, UK, PL, HY).",
    "ext_btn_change_lang": "Changer de langue",
    "eq_title": "Égaliseur de studio & basses",
    "comments_title": "Commentaires du titre",
    "comment_placeholder": "Écrire un commentaire à cet instant...",
    "btn_send": "Envoyer",
    "sleep_title": "Minuteur de sommeil intelligent",
    "sleep_desc": "La musique s'estompe doucement 30 secondes avant de s'arrêter pour préserver votre sommeil.",
    "sleep_chip_track": "Fin du titre",
    "btn_cancel_sleep": "Désactiver le minuteur",
    "fx_title": "Studio d'effets audio FX",
    "radar_hint": "Casque recommandé pour l'effet binaural 3D en orbite",
    "fx_speed_title": "⚡ Vitesse & Tonalité",
    "speed_norm": "Normale",
    "looper_title": "Looper de précision A-B",
    "looper_desc": "Répétez en boucle n'importe quel segment du morceau (solo de guitare, drop, refrain).",
    "loop_start": "Début :",
    "loop_end": "Fin :",
    "btn_loop_active": "Activer la boucle",
    "btn_loop_clear": "Réinitialiser",
    "card_title": "Générateur de carte Bento pour réseaux sociaux",
    "btn_copy_card": "Copier l'image",
    "btn_download_card": "Télécharger PNG",
    "dropdown_lang": "Langue : Français",
    "lang_modal_title": "🌐 Choisir la langue",
    "toast_lang": "🇫🇷 Langue définie sur Français",
    "toast_liked": "Ajouté aux favoris SoundCloud",
    "toast_unliked": "Retiré des favoris SoundCloud",
    "toast_liked_guest": "Ajouté aux favoris locaux • Connectez-vous pour synchroniser",
    "toast_unliked_guest": "Retiré des favoris locaux",
    "toast_guest_follow": "Connectez-vous à SoundCloud pour suivre les artistes",
    "toast_guest_comment": "Connectez-vous à SoundCloud pour publier des commentaires",
    "no_likes_guest_title": "Vos favoris locaux sont vides",
    "no_likes_guest_desc": "Appuyez sur ❤️ sur n'importe quel titre pour l'enregistrer, ou connectez-vous.",
    "no_history_title": "Aucun historique d'écoute",
    "no_history_desc": "Les morceaux écoutés apparaîtront automatiquement ici.",
    "stream_guest_title": "Le flux personnel nécessite un compte",
    "stream_guest_desc": "Le flux affiche les mises à jour des créateurs que vous suivez. Vous pouvez écouter les tendances et les playlists sans compte !",
    "featured_playlists": "Playlists populaires",
    "lang_native_name": "Français",
    "active_lang_prefix": "Actif : ",
    "trending_title": "Tendances",
    "search_results_title": "Résultats de recherche",
    "radio_station_title": "Station Radio",
    "genre_all": "Tous les genres",
    "genres": {
      "phonk": "Phonk",
      "electronic": "Électronique",
      "hiphoprap": "Hip-Hop",
      "ambient": "Ambiant",
      "rock": "Rock",
      "danceedm": "EDM",
      "rbsoul": "R&B",
      "indie": "Indé"
    },
    "subtitle_local_lib": "Bibliothèque locale",
    "subtitle_sc_lib": "SoundCloud",
    "subtitle_featured_pl": "Playlists populaires",
    "subtitle_following": "Abonnements",
    "subtitle_local_history": "Historique local",
    "subtitle_sc_history": "SoundCloud",
    "btn_clear_history": "Effacer l'historique",
    "toast_history_cleared": "🗑️ Historique effacé",
    "no_tracks_found": "Aucun titre trouvé",
    "no_playlists_found": "Aucune playlist trouvée",
    "txt_stat_tracks": "Titres",
    "txt_stat_followers": "Abonnés",
    "txt_stat_likes": "J'aime",
    "txt_prof_tracks_title": "Titres populaires",
    "txt_prof_pl_title": "Albums et playlists",
    "txt_play_playlist": "Tout écouter",
    "ext_lyrics_name": "Karaoké & Paroles synchronisées",
    "ext_lyrics_desc": "Recherche automatique des paroles avec défilement synchronisé en temps réel.",
    "ext_sleep_name": "Minuteur de sommeil intelligent",
    "ext_sleep_desc": "Arrête la musique avec un fondu doux de 30 secondes pour préserver votre sommeil.",
    "ext_fx_name": "Studio d'effets audio : 8D & Vitesse",
    "ext_fx_desc": "Spatialisation 360° pour casque avec radar, mode Nightcore et Slowed + Reverb.",
    "ext_looper_name": "Looper de précision A-B",
    "ext_looper_desc": "Définissez les points [A] et [B] pour répéter vos passages préférés en boucle infinie.",
    "ext_card_name": "Générateur de carte Bento",
    "ext_card_desc": "Générez des cartes AMOLED haute résolution du morceau actuel à partager.",
    "guest_user": "Invité",
    "drop_lang_header": "Langue de l'interface",
    "dropdown_login": "⚡ Se connecter à SoundCloud",
    "toast_lang_switched": "🇫🇷 Langue changée en Français"
  },
  "ja": {
    "search_placeholder": "曲、アーティスト、アルバムを検索...",
    "themes_btn": "テーマ (10)",
    "extensions_btn": "拡張機能 (6)",
    "login_btn": "ログイン",
    "my_profile": "マイプロフィール",
    "logout": "ログアウト",
    "chip_trending": "🔥 トレンド",
    "chip_likes": "❤️ いいね",
    "chip_playlists": "📂 プレイリスト",
    "chip_stream": "📡 フィード",
    "chip_history": "🕒 履歴",
    "hero_tag": "🔥 今週のトップ",
    "listen_now": "今すぐ聴く",
    "queue_title": "再生キュー",
    "select_track": "再生するトラックを選択してください",
    "auth_title": "SoundCloudにログイン",
    "btn_import": "⚡ 1クリックログイン (Chromiumから)",
    "auth_help_head": "手動トークン不要のログイン:",
    "auth_help_body": "ChromiumまたはChromeで既にsoundcloud.comにログインしている場合は、上のボタンをクリックして自動接続できます！",
    "btn_open_sc": "🌐 ブラウザでSoundCloudのログインページを開く",
    "auth_divider": "またはセッショントークンを手動で入力",
    "btn_submit_token": "アカウントを接続",
    "theme_title": "テーマ (10種類のAMOLEDパレット)",
    "ext_title": "内蔵拡張機能ハブ (6モジュール)",
    "ext_discord_name": "Discord Rich Presence (Linux & Windows)",
    "ext_discord_desc": "再生中の曲、アーティスト、ジャケット写真、プログレスバーをDiscordプロフィールに自動表示します。",
    "ext_lang_name": "言語と地域設定",
    "ext_lang_desc": "対応している8つのインターフェース言語を切り替えます (EN, RU, DE, FR, JA, UK, PL, HY)。",
    "ext_btn_change_lang": "言語を変更",
    "eq_title": "スタジオイコライザー＆低音",
    "comments_title": "トラックのコメント",
    "comment_placeholder": "現在の再生位置にコメントを書く...",
    "btn_send": "送信",
    "sleep_title": "スマートスリープタイマー",
    "sleep_desc": "停止の30秒前から音楽が徐々にフェードアウトし、快適な睡眠を守ります。",
    "sleep_chip_track": "曲の終わり",
    "btn_cancel_sleep": "タイマーを解除",
    "fx_title": "オーディオFXスタジオ",
    "radar_hint": "3D立体音響効果を楽しむにはヘッドフォンの使用を推奨します",
    "fx_speed_title": "⚡ 速度とピッチ",
    "speed_norm": "標準",
    "looper_title": "A-Bプレシジョンルーパー",
    "looper_desc": "曲の特定の部分（ギターソロ、ドロップ、サビ）をシームレスに無限ループ再生します。",
    "loop_start": "開始点:",
    "loop_end": "終了点:",
    "btn_loop_active": "ループを有効化",
    "btn_loop_clear": "リセット",
    "card_title": "SNS用Bentoトラックカードジェネレーター",
    "btn_copy_card": "クリップボードにコピー",
    "btn_download_card": "PNGを保存",
    "dropdown_lang": "言語: 日本語",
    "lang_modal_title": "🌐 言語を選択",
    "toast_lang": "🇯🇵 言語を日本語に設定しました",
    "toast_liked": "SoundCloudのお気に入りに追加されました",
    "toast_unliked": "SoundCloudのお気に入りから削除されました",
    "toast_liked_guest": "ローカルのお気に入りに追加されました • 同期するにはログインしてください",
    "toast_unliked_guest": "ローカルのお気に入りから削除されました",
    "toast_guest_follow": "アーティストをフォローするにはSoundCloudにログインしてください",
    "toast_guest_comment": "コメントを投稿するにはSoundCloudにログインしてください",
    "no_likes_guest_title": "ローカルのお気に入りは空です",
    "no_likes_guest_desc": "任意のトラックの❤️をタップして保存するか、ログインしてください。",
    "no_history_title": "再生履歴はまだありません",
    "no_history_desc": "再生したトラックがここに自動的に表示されます。",
    "stream_guest_title": "ストリームにはアカウントが必要です",
    "stream_guest_desc": "ストリームにはフォロー中のアーティストの更新が表示されます。アカウントなしでトレンドやプレイリストを自由に聴くことができます！",
    "featured_playlists": "注目のプレイリスト",
    "lang_native_name": "日本語",
    "active_lang_prefix": "有効: ",
    "trending_title": "トレンド",
    "search_results_title": "検索結果",
    "radio_station_title": "ラジオ局",
    "genre_all": "すべてのジャンル",
    "genres": {
      "phonk": "フォンク",
      "electronic": "エレクトロニック",
      "hiphoprap": "ヒップホップ",
      "ambient": "アンビエント",
      "rock": "ロック",
      "danceedm": "EDM",
      "rbsoul": "R&B",
      "indie": "インディー"
    },
    "subtitle_local_lib": "ローカルライブラリ",
    "subtitle_sc_lib": "SoundCloud",
    "subtitle_featured_pl": "注目のプレイリスト",
    "subtitle_following": "フォロー中",
    "subtitle_local_history": "ローカル履歴",
    "subtitle_sc_history": "SoundCloud",
    "btn_clear_history": "履歴を消去",
    "toast_history_cleared": "🗑️ 履歴を消去しました",
    "no_tracks_found": "トラックが見つかりません",
    "no_playlists_found": "プレイリストが見つかりません",
    "txt_stat_tracks": "曲数",
    "txt_stat_followers": "フォロワー",
    "txt_stat_likes": "いいね",
    "txt_prof_tracks_title": "人気曲",
    "txt_prof_pl_title": "アルバム＆プレイリスト",
    "txt_play_playlist": "すべて再生",
    "ext_lyrics_name": "カラオケ＆同期歌詞",
    "ext_lyrics_desc": "LRCLIBによる歌詞自動検索とリアルタイムスクロール表示。",
    "ext_sleep_name": "スマートスリープタイマー",
    "ext_sleep_desc": "30秒間の穏やかなフェードアウト機能付きスリープタイマー。",
    "ext_fx_name": "オーディオFXスタジオ: 8D＆速度",
    "ext_fx_desc": "ヘッドフォン用360°立体音響回転、Nightcore、Slowed再生モード。",
    "ext_looper_name": "A-Bプレシジョンルーパー",
    "ext_looper_desc": "区間[A]-[B]を指定してギターソロやビートをシームレスに無限ループ再生。",
    "ext_card_name": "Bentoトラックカードジェネレーター",
    "ext_card_desc": "SNS共有用の美しいAMOLEDトラックカードをワンクリックで生成。",
    "guest_user": "ゲスト",
    "drop_lang_header": "表示言語",
    "dropdown_login": "⚡ SoundCloudにログイン",
    "toast_lang_switched": "🇯🇵 表示言語を日本語に変更しました"
  },
  "uk": {
    "search_placeholder": "Пошук треків, виконавців, альбомів...",
    "themes_btn": "Теми (10)",
    "extensions_btn": "Розширення (6)",
    "login_btn": "Увійти в акаунт",
    "my_profile": "Мій профіль",
    "logout": "Вийти",
    "chip_trending": "🔥 У тренді",
    "chip_likes": "❤️ Мої Лайки",
    "chip_playlists": "📂 Мої Плейлисти",
    "chip_stream": "📡 Моя Стрічка",
    "chip_history": "🕒 Історія",
    "hero_tag": "🔥 Топ тижня",
    "listen_now": "Слухати зараз",
    "queue_title": "Черга відтворення",
    "select_track": "Оберіть трек для відтворення",
    "auth_title": "Вхід в акаунт SoundCloud",
    "btn_import": "⚡ Авторизація в 1 клік (з Chromium)",
    "auth_help_head": "Вхід без ручного введення токенів:",
    "auth_help_body": "Якщо ви вже увійшли на soundcloud.com у Chromium, натисніть кнопку вище — застосунок автоматично підключить ваш акаунт!",
    "btn_open_sc": "🌐 Відкрити сторінку входу SoundCloud у браузері",
    "auth_divider": "або введіть токен сесії вручну",
    "btn_submit_token": "Підключити акаунт",
    "theme_title": "Теми оформлення (10 AMOLED палітр)",
    "ext_title": "Центр вбудованих розширень (6 модулів)",
    "ext_discord_name": "Discord Rich Presence (Linux і Windows)",
    "ext_discord_desc": "Синхронізація треку, виконавця, обкладинки та шкали прогресу у профілі Discord без сторонніх утиліт.",
    "ext_lang_name": "Мова та локалізація",
    "ext_lang_desc": "Перемикання між 8 підтримуваними мовами (EN, RU, DE, FR, JA, UK, PL, HY).",
    "ext_btn_change_lang": "Змінити мову",
    "eq_title": "Студійний Еквалайзер & Бас",
    "comments_title": "Коментарі до треку",
    "comment_placeholder": "Написати коментар на поточній секунді...",
    "btn_send": "Надіслати",
    "sleep_title": "Розумний таймер сну",
    "sleep_desc": "Музика плавно затихає за 30 секунд до завершення, оберігаючи ваш сон.",
    "sleep_chip_track": "Кінець треку",
    "btn_cancel_sleep": "Вимкнути активний таймер",
    "fx_title": "Студія звукових ефектів FX",
    "radar_hint": "Рекомендується слухати в навушниках для ефекту 3D-орбіти",
    "fx_speed_title": "⚡ Швидкість і Тональність",
    "speed_norm": "Звичайна",
    "looper_title": "A-B Looper (Зациклення фрагмента)",
    "looper_desc": "Дозволяє безперервно відтворювати обраний фрагмент треку (соло, дроп, приспів).",
    "loop_start": "Мітка початку:",
    "loop_end": "Мітка кінця:",
    "btn_loop_active": "Увімкнути цикл",
    "btn_loop_clear": "Скинути",
    "card_title": "Bento-картка треку для соцмереж",
    "btn_copy_card": "Скопіювати зображення",
    "btn_download_card": "Завантажити PNG",
    "dropdown_lang": "Мова: Українська",
    "lang_modal_title": "🌐 Оберіть мову",
    "toast_lang": "🇺🇦 Мову інтерфейсу змінено на українську",
    "toast_liked": "Додано до вподобань SoundCloud",
    "toast_unliked": "Вилучено з вподобань SoundCloud",
    "toast_liked_guest": "Додано до локальних вподобань • Увійдіть для синхронізації",
    "toast_unliked_guest": "Вилучено з локальних вподобань",
    "toast_guest_follow": "Увійдіть у SoundCloud, щоб підписатися",
    "toast_guest_comment": "Увійдіть у SoundCloud, щоб залишати коментарі",
    "no_likes_guest_title": "Ваші локальні вподобання порожні",
    "no_likes_guest_desc": "Натисніть ❤️ на будь-якому треку, щоб зберегти його, або увійдіть в акаунт.",
    "no_history_title": "Історія прослуховувань порожня",
    "no_history_desc": "Прослухані треки автоматично з'являтимуться тут.",
    "stream_guest_title": "Особиста стрічка доступна після входу",
    "stream_guest_desc": "Стрічка показує оновлення від виконавців, за якими ви стежите. Слухати тренди, лайки та плейлісти можна вільно без акаунта!",
    "featured_playlists": "Популярні плейлісти",
    "lang_native_name": "Українська",
    "active_lang_prefix": "Активно: ",
    "trending_title": "У тренді",
    "search_results_title": "Результати пошуку",
    "radio_station_title": "Радіостанція",
    "genre_all": "Усі жанри",
    "genres": {
      "phonk": "Фонк",
      "electronic": "Електроніка",
      "hiphoprap": "Хіп-хоп",
      "ambient": "Ембієнт",
      "rock": "Рок",
      "danceedm": "EDM",
      "rbsoul": "R&B",
      "indie": "Інді"
    },
    "subtitle_local_lib": "Локальна бібліотека",
    "subtitle_sc_lib": "SoundCloud",
    "subtitle_featured_pl": "Популярні плейлісти",
    "subtitle_following": "Підписки",
    "subtitle_local_history": "Локальна історія",
    "subtitle_sc_history": "SoundCloud",
    "btn_clear_history": "Очистити історію",
    "toast_history_cleared": "🗑️ Історію очищено",
    "no_tracks_found": "Треків не знайдено",
    "no_playlists_found": "Плейлістів не знайдено",
    "txt_stat_tracks": "Треків",
    "txt_stat_followers": "Підписників",
    "txt_stat_likes": "Лайків",
    "txt_prof_tracks_title": "Популярні треки",
    "txt_prof_pl_title": "Альбоми та плейлісти",
    "txt_play_playlist": "Слухати все",
    "ext_lyrics_name": "Караоке та синхронний текст",
    "ext_lyrics_desc": "Автоматичний пошук слів пісні в базі LRCLIB з синхронною прокруткою.",
    "ext_sleep_name": "Розумний таймер сну",
    "ext_sleep_desc": "Зупинка музики через заданий час з плавним 30-секундним затуханням звуку.",
    "ext_fx_name": "Студія аудіо FX: 8D Audio та Швидкість",
    "ext_fx_desc": "360° просторове обертання стереобази в навушниках з радаром, Nightcore і Slowed.",
    "ext_looper_name": "A-B Прецизійний лупер",
    "ext_looper_desc": "Миттєве встановлення міток [A] та [B] для безперервного зациклення улюблених фрагментів.",
    "ext_card_name": "Генератор Bento-карток треку",
    "ext_card_desc": "Створення стильних AMOLED-карток треку для публікації в соцмережах.",
    "guest_user": "Гість",
    "drop_lang_header": "Мова інтерфейсу",
    "dropdown_login": "⚡ Увійти до SoundCloud",
    "toast_lang_switched": "🇺🇦 Мову інтерфейсу змінено на Українську"
  },
  "pl": {
    "search_placeholder": "Szukaj utworów, wykonawców, albumów...",
    "themes_btn": "Motywy (10)",
    "extensions_btn": "Rozszerzenia (6)",
    "login_btn": "Zaloguj się",
    "my_profile": "Mój profil",
    "logout": "Wyloguj się",
    "chip_trending": "🔥 Na czasie",
    "chip_likes": "❤️ Polubione",
    "chip_playlists": "📂 Playlisty",
    "chip_stream": "📡 Ostatnie",
    "chip_history": "🕒 Historia",
    "hero_tag": "🔥 Hit tygodnia",
    "listen_now": "Słuchaj teraz",
    "queue_title": "Kolejka odtwarzania",
    "select_track": "Wybierz utwór do odtworzenia",
    "auth_title": "Zaloguj się do SoundCloud",
    "btn_import": "⚡ Logowanie jednym kliknięciem (z Chromium)",
    "auth_help_head": "Logowanie bez ręcznego wprowadzania tokenów:",
    "auth_help_body": "Jeśli jesteś już zalogowany na soundcloud.com w Chromium / Chrome, kliknij powyższy przycisk, aby połączyć się automatycznie!",
    "btn_open_sc": "🌐 Otwórz stronę logowania SoundCloud w przeglądarce",
    "auth_divider": "lub wprowadź token sesji ręcznie",
    "btn_submit_token": "Połącz konto",
    "theme_title": "Motywy (10 palet AMOLED)",
    "ext_title": "Centrum wbudowanych rozszerzeń (6 модуłów)",
    "ext_discord_name": "Discord Rich Presence (Linux i Windows)",
    "ext_discord_desc": "Przesyła aktualny utwór, wykonawcę, okładkę albumu i pasek postępu do Twojego profilu Discord.",
    "ext_lang_name": "Język i lokalizacja",
    "ext_lang_desc": "Przełączaj pomiędzy 8 obsługiwanymi językami interfejsu (EN, RU, DE, FR, JA, UK, PL, HY).",
    "ext_btn_change_lang": "Zmień język",
    "eq_title": "Korektor studyjny i bas",
    "comments_title": "Komentarze do utworu",
    "comment_placeholder": "Napisz komentarz w bieżącej sekundzie...",
    "btn_send": "Wyślij",
    "sleep_title": "Inteligentny wyłącznik czasowy",
    "sleep_desc": "Muzyka płynnie wycisza się na 30 sekund przed wyłączeniem, dbając o Twój spokojny sen.",
    "sleep_chip_track": "Koniec utworu",
    "btn_cancel_sleep": "Anuluj aktywny timer",
    "fx_title": "Studio efektów audio FX",
    "radar_hint": "Zalecane słuchawki dla efektu 3D dźwięku binauralnego",
    "fx_speed_title": "⚡ Prędkość i tonacja",
    "speed_norm": "Normalna",
    "looper_title": "Precyzyjny pętlik A-B",
    "looper_desc": "Odtwarzaj w nieskończonej pętli dowolny fragment utworu (solówkę, drop, refren).",
    "loop_start": "Początek:",
    "loop_end": "Koniec:",
    "btn_loop_active": "Włącz pętlę",
    "btn_loop_clear": "Resetuj",
    "card_title": "Generator kart utworów Bento do mediów społecznościowych",
    "btn_copy_card": "Kopiuj do schowka",
    "btn_download_card": "Pobierz PNG",
    "dropdown_lang": "Język: Polski",
    "lang_modal_title": "🌐 Wybierz język",
    "toast_lang": "🇵🇱 Język interfejsu: Polski",
    "toast_liked": "Dodano do polubionych SoundCloud",
    "toast_unliked": "Usunięto z polubionych SoundCloud",
    "toast_liked_guest": "Dodano do lokalnych ulubionych • Zaloguj się, aby zsynchronizować",
    "toast_unliked_guest": "Usunięto z lokalnych ulubionych",
    "toast_guest_follow": "Zaloguj się do SoundCloud, aby obserwować twórców",
    "toast_guest_comment": "Zaloguj się do SoundCloud, aby komentować",
    "no_likes_guest_title": "Twoje lokalne ulubione są puste",
    "no_likes_guest_desc": "Dotknij ❤️ na dowolnym utworze, aby go zapisać, lub zaloguj się.",
    "no_history_title": "Brak historii odtwarzania",
    "no_history_desc": "Odtwarzane utwory pojawią się tutaj automatycznie.",
    "stream_guest_title": "Twój strumień wymaga konta",
    "stream_guest_desc": "Strumień pokazuje utwory obserwowanych wykonawców. Możesz swobodnie słuchać trendów i playlist bez konta!",
    "featured_playlists": "Polecane playlisty",
    "lang_native_name": "Polski",
    "active_lang_prefix": "Aktywny: ",
    "trending_title": "Na czasie",
    "search_results_title": "Wyniki wyszukiwania",
    "radio_station_title": "Stacja radiowa",
    "genre_all": "Wszystkie gatunki",
    "genres": {
      "phonk": "Phonk",
      "electronic": "Elektroniczna",
      "hiphoprap": "Hip-Hop",
      "ambient": "Ambient",
      "rock": "Rock",
      "danceedm": "EDM",
      "rbsoul": "R&B",
      "indie": "Indie"
    },
    "subtitle_local_lib": "Lokalna biblioteka",
    "subtitle_sc_lib": "SoundCloud",
    "subtitle_featured_pl": "Polecane playlisty",
    "subtitle_following": "Obserwowani",
    "subtitle_local_history": "Lokalna historia",
    "subtitle_sc_history": "SoundCloud",
    "btn_clear_history": "Wyczyść historię",
    "toast_history_cleared": "🗑️ Historia wyczyszczona",
    "no_tracks_found": "Nie znaleziono utworów",
    "no_playlists_found": "Nie znaleziono playlist",
    "txt_stat_tracks": "Utworów",
    "txt_stat_followers": "Obserwujących",
    "txt_stat_likes": "Polubień",
    "txt_prof_tracks_title": "Popularne utwory",
    "txt_prof_pl_title": "Albumy i playlisty",
    "txt_play_playlist": "Odtwórz wszystko",
    "ext_lyrics_name": "Karaoke i zsynchronizowany tekst",
    "ext_lyrics_desc": "Automatyczne wyszukiwanie tekstu z LRCLIB i przewijanie w czasie rzeczywistym.",
    "ext_sleep_name": "Inteligentny wyłącznik czasowy",
    "ext_sleep_desc": "Zatrzymuje odtwarzanie po określonym czasie z łagodnym 30-sekundowym wyciszaniem.",
    "ext_fx_name": "Studio audio FX: 8D i Prędkość",
    "ext_fx_desc": "Przestrzenne audio 360° dla słuchawek z radarem, Nightcore oraz trybem Slowed.",
    "ext_looper_name": "Precyzyjny pętlik A-B",
    "ext_looper_desc": "Ustaw punkty [A] i [B], aby bezszwowo zapętlać ulubione partie utworów.",
    "ext_card_name": "Generator kart utworów Bento",
    "ext_card_desc": "Generuj estetyczne karty AMOLED z metadanymi i falami dźwiękowymi do mediów społecznościowych.",
    "guest_user": "Gość",
    "drop_lang_header": "Język interfejsu",
    "dropdown_login": "⚡ Zaloguj się do SoundCloud",
    "toast_lang_switched": "🇵🇱 Język zmieniony na Polski"
  },
  "hy": {
    "search_placeholder": "Որոնել երգեր, կատարողներ, ալբոմներ...",
    "themes_btn": "Թեմաներ (10)",
    "extensions_btn": "Ընդլայնումներ (6)",
    "login_btn": "Մուտք գործել",
    "my_profile": "Իմ պրոֆիլը",
    "logout": "Ելք",
    "chip_trending": "🔥 Թրենդային",
    "chip_likes": "❤️ Հավանածներ",
    "chip_playlists": "📂 Երգացանկեր",
    "chip_stream": "📡 Լրահոս",
    "chip_history": "🕒 Պատմություն",
    "hero_tag": "🔥 Շաբաթվա լավագույնը",
    "listen_now": "Լսել հիմա",
    "queue_title": "Նվագարկման հերթ",
    "select_track": "Ընտրեք երգ նվագարկելու համար",
    "auth_title": "Մուտք SoundCloud-ի հաշիվ",
    "btn_import": "⚡ Մուտք 1 սեղմումով (Chromium-ից)",
    "auth_help_head": "Մուտք առանց ձեռքով թոքեն մուտքագրելու.",
    "auth_help_body": "Եթե արդեն մուտք եք գործել soundcloud.com Chromium-ում, սեղմեք վերևի կոճակը՝ ավտոմատ միանալու համար:",
    "btn_open_sc": "🌐 Բացել SoundCloud-ի մուտքի էջը բրաուզերում",
    "auth_divider": "կամ մուտքագրեք սեսիայի թոքենը ձեռքով",
    "btn_submit_token": "Միացնել հաշիվը",
    "theme_title": "Ձևավորման թեմաներ (10 AMOLED գունապնակ)",
    "ext_title": "Ներկառուցված ընդլայնումների կենտրոն (6 մոդուլ)",
    "ext_discord_name": "Discord Rich Presence (Linux և Windows)",
    "ext_discord_desc": "Ցուցադրում է ընթացիկ երգը, կատարողին, նկարը և ժամանակացույցը ձեր Discord պրոֆիլում:",
    "ext_lang_name": "Լեզու և տեղայնացում",
    "ext_lang_desc": "Փոխարկեք համակարգի 8 աջակցվող լեզուների միջև (EN, RU, DE, FR, JA, UK, PL, HY):",
    "ext_btn_change_lang": "Փոխել լեզուն",
    "eq_title": "Ստուդիական Էկվալայզեր և Բաս",
    "comments_title": "Երգի մեկնաբանություններ",
    "comment_placeholder": "Գրել մեկնաբանություն ընթացիկ վայրկյանին...",
    "btn_send": "Ուղարկել",
    "sleep_title": "Խելացի քնի ժամաչափ",
    "sleep_desc": "Երաժշտությունը սահուն կմարի անջատվելուց 30 վայրկյան առաջ՝ պահպանելով ձեր քունը:",
    "sleep_chip_track": "Երգի ավարտ",
    "btn_cancel_sleep": "Անջատել ժամաչափը",
    "fx_title": "Աուդիո FX Ստուդիա",
    "radar_hint": "3D ուղեծրային էֆեկտի համար խորհուրդ է տրվում լսել ականջակալներով",
    "fx_speed_title": "⚡ Արագություն և Տոնայնություն",
    "speed_norm": "Սովորական",
    "looper_title": "A-B Ճշգրիտ Լուպեր",
    "looper_desc": "Անվերջ կրկնեք երգի ցանկացած հատված (սոլո, դրոփ, կրկներգ):",
    "loop_start": "Սկիզբ:",
    "loop_end": "Ավարտ:",
    "btn_loop_active": "Միացնել կրկնությունը",
    "btn_loop_clear": "Մաքրել",
    "card_title": "Երգի Bento-քարտ սոցցանցերի համար",
    "btn_copy_card": "Պատճենել նկարը",
    "btn_download_card": "Ներբեռնել PNG",
    "dropdown_lang": "Լեզու՝ Հայերեն",
    "lang_modal_title": "🌐 Ընտրեք լեզուն",
    "toast_lang": "🇦🇲 Ինտերֆեյսի լեզուն փոխվեց հայերենի",
    "toast_liked": "Ավելացվել է SoundCloud-ի հավանածներում",
    "toast_unliked": "Հեռացվել է SoundCloud-ի հավանածներից",
    "toast_liked_guest": "Ավելացվել է տեղական ընտրյալներում • Մուտք գործեք համաժամեցման համար",
    "toast_unliked_guest": "Հեռացվել է տեղական ընտրյալներից",
    "toast_guest_follow": "Մուտք գործեք SoundCloud՝ կատարողներին հետևելու համար",
    "toast_guest_comment": "Մուտք գործեք SoundCloud՝ մեկնաբանություններ թողնելու համար",
    "no_likes_guest_title": "Ձեր տեղական ընտրյալները դատարկ են",
    "no_likes_guest_desc": "Սեղմեք ❤️ ցանկացած թրեքի վրա՝ պահպանելու համար, կամ մուտք գործեք:",
    "no_history_title": "Նվագարկման պատմությունը դատարկ է",
    "no_history_desc": "Ձեր լսած թրեքներն ինքնաբերաբար կհայտնվեն այստեղ:",
    "stream_guest_title": "Անձնական հոսքի համար անհրաժեշտ է մուտք գործել",
    "stream_guest_desc": "Հոսքը ցույց է տալիս ձեր հետևած կատարողների նորությունները: Թրենդները և երգացանկերը հասանելի են առանց գրանցման!",
    "featured_playlists": "Հանրաճանաչ երգացանկեր",
    "lang_native_name": "Հայերեն",
    "active_lang_prefix": "Ակտիվ՝ ",
    "trending_title": "Թրենդային",
    "search_results_title": "Որոնման արդյունքներ",
    "radio_station_title": "Ռադիոկայան",
    "genre_all": "Բոլոր ժանրերը",
    "genres": {
      "phonk": "Ֆոնկ",
      "electronic": "Էլեկտրոնային",
      "hiphoprap": "Հիփ-հոփ",
      "ambient": "Էմբիենթ",
      "rock": "Ռոք",
      "danceedm": "EDM",
      "rbsoul": "R&B",
      "indie": "Ինդի"
    },
    "subtitle_local_lib": "Տեղական գրադարան",
    "subtitle_sc_lib": "SoundCloud",
    "subtitle_featured_pl": "Հանրաճանաչ երգացանկեր",
    "subtitle_following": "Հետևումներ",
    "subtitle_local_history": "Տեղական պատմություն",
    "subtitle_sc_history": "SoundCloud",
    "btn_clear_history": "Մաքրել պատմությունը",
    "toast_history_cleared": "🗑️ Պատմությունը մաքրվեց",
    "no_tracks_found": "Երգեր չեն գտնվել",
    "no_playlists_found": "Երգացանկեր չեն գտնվել",
    "txt_stat_tracks": "Երգեր",
    "txt_stat_followers": "Հետևորդներ",
    "txt_stat_likes": "Հավանածներ",
    "txt_prof_tracks_title": "Հանրաճանաչ երգեր",
    "txt_prof_pl_title": "Ալբոմներ և երգացանկեր",
    "txt_play_playlist": "Նվագարկել բոլորը",
    "ext_lyrics_name": "Կարաոկե և սինխրոն տեքստ",
    "ext_lyrics_desc": "LRCLIB բազայից երգերի տեքստերի որոնում՝ իրական ժամանակում սինխրոն տողերով:",
    "ext_sleep_name": "Խելացի քնի ժամաչափ",
    "ext_sleep_desc": "Երաժշտության անջատում սահուն 30 վայրկյան մարումով՝ պահպանելով ձեր քունը:",
    "ext_fx_name": "Աուդիո FX Ստուդիա: 8D և Արագություն",
    "ext_fx_desc": "360° ուղեծրային ձայն ականջակալների համար ռադարով, Nightcore և Slowed ռեժիմներով:",
    "ext_looper_name": "A-B Ճշգրիտ Լուպեր",
    "ext_looper_desc": "Տեղադրեք [A] և [B] կետերը սիրված սոլոները կամ բիթերն անվերջ կրկնելու համար:",
    "ext_card_name": "Երգի Bento-քարտ սոցցանցերի համար",
    "ext_card_desc": "Ստեղծեք ընթացիկ երգի բարձր որակի AMOLED քարտ՝ սոցիալական ցանցերում կիսվելու համար:",
    "guest_user": "Հյուր",
    "drop_lang_header": "Ինտերֆեյսի լեզու",
    "dropdown_login": "⚡ Մուտք գործել SoundCloud",
    "toast_lang_switched": "🇦🇲 Ինտերֆեյսի լեզուն փոխվել է Հայերեն"
  }
};

  // App State & Active View Tracking
  let currentTab = { type: 'genre', val: 'all-music' };
  let currentSearchQuery = '';
  let currentRadioTrackTitle = '';

  function renderActiveTabTitle() {
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    if (currentTab.type === 'lib') {
      if (currentTab.val === 'likes') {
        gridTitle.innerHTML = `${t.chip_likes} <span>•</span> ${currentUser ? t.subtitle_sc_lib : t.subtitle_local_lib}`;
      } else if (currentTab.val === 'playlists') {
        gridTitle.innerHTML = `${t.chip_playlists} <span>•</span> ${currentUser ? t.subtitle_sc_lib : t.subtitle_featured_pl}`;
      } else if (currentTab.val === 'stream') {
        gridTitle.innerHTML = `${t.chip_stream} <span>•</span> ${t.subtitle_following}`;
      } else if (currentTab.val === 'history') {
        gridTitle.innerHTML = `${t.chip_history} <span>•</span> ${currentUser ? t.subtitle_sc_history : t.subtitle_local_history}`;
      }
    } else if (currentTab.type === 'genre') {
      const gName = (t.genres && t.genres[currentTab.val]) || (currentTab.val === 'all-music' ? t.genre_all : currentTab.val.toUpperCase());
      gridTitle.innerHTML = `${t.trending_title}: <span>${gName}</span>`;
    } else if (currentTab.type === 'search') {
      gridTitle.innerHTML = `${t.search_results_title}: <span>"${escapeHtml(currentSearchQuery)}"</span>`;
    } else if (currentTab.type === 'radio') {
      gridTitle.innerHTML = `📻 ${t.radio_station_title}: <span>"${escapeHtml(currentRadioTrackTitle)}"</span>`;
    }
  }

  // DOM Elements
  const audio = document.getElementById('audio-engine');
  const tracksGrid = document.getElementById('tracks-grid');
  const searchInput = document.getElementById('search-input');
  const gridTitle = document.getElementById('grid-title');
  const heroSection = document.getElementById('hero-section');
  const heroTitle = document.getElementById('hero-title');
  const heroArtist = document.getElementById('hero-artist');
  const heroBgArt = document.getElementById('hero-bg-art');
  const heroPlayBtn = document.getElementById('hero-play-btn');

  // Player Dock Elements
  const playerArt = document.getElementById('player-art');
  const playerTitle = document.getElementById('player-title');
  const playerArtist = document.getElementById('player-artist');
  const dockLikeBtn = document.getElementById('dock-like-btn');
  const dockCommentsBtn = document.getElementById('dock-comments-btn');
  const dockRadioBtn = document.getElementById('dock-radio-btn');
  const dockDownloadBtn = document.getElementById('dock-download-btn');
  const btnPlay = document.getElementById('btn-play');
  const playIconSvg = document.getElementById('play-icon-svg');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnShuffle = document.getElementById('btn-shuffle');
  const btnRepeat = document.getElementById('btn-repeat');

  const timeCurrent = document.getElementById('time-current');
  const timeTotal = document.getElementById('time-total');
  const progressTrack = document.getElementById('progress-track');
  const progressFill = document.getElementById('progress-fill');
  const progressHandle = document.getElementById('progress-handle');

  // Volume & Queue
  const volumeWrapper = document.getElementById('volume-wrapper');
  const volumePopup = document.getElementById('volume-popup');
  const btnVolume = document.getElementById('btn-volume');
  const volumeIconSvg = document.getElementById('volume-icon-svg');
  const volumeTrack = document.getElementById('volume-track');
  const volumeFill = document.getElementById('volume-fill');
  const volumeKnob = document.getElementById('volume-knob');
  const btnQueueToggle = document.getElementById('btn-queue-toggle');
  const queueDrawer = document.getElementById('queue-drawer');
  const queueList = document.getElementById('queue-list');
  const btnQueueClear = document.getElementById('btn-queue-clear');

  // Auth & Profile
  const btnLoginTrigger = document.getElementById('btn-login-trigger');
  const userBadge = document.getElementById('user-badge');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const userDropdown = document.getElementById('user-dropdown');
  const btnViewMyProfile = document.getElementById('btn-view-my-profile');
  const btnLogout = document.getElementById('btn-logout');

  // Library Chips
  const chipLikes = document.getElementById('chip-likes');
  const chipPlaylists = document.getElementById('chip-playlists');
  const chipStream = document.getElementById('chip-stream');
  const chipHistory = document.getElementById('chip-history');

  // Modals — Auth
  const authModalOverlay = document.getElementById('auth-modal-overlay');
  const btnCloseAuthModal = document.getElementById('btn-close-auth-modal');
  const btnImportBrowser = document.getElementById('btn-import-browser');
  const btnOpenScSignin = document.getElementById('btn-open-sc-signin');
  const authTokenInput = document.getElementById('auth-token-input');
  const btnSubmitToken = document.getElementById('btn-submit-token');

  // Modals — Equalizer
  const eqModalOverlay = document.getElementById('eq-modal-overlay');
  const btnEqToggle = document.getElementById('btn-eq-toggle');
  const btnCloseEqModal = document.getElementById('btn-close-eq-modal');
  const eqPresetChips = document.querySelectorAll('.eq-preset-chip');

  // Modals — Fullscreen Vinyl
  const visualizerOverlay = document.getElementById('visualizer-overlay');
  const btnVisToggle = document.getElementById('btn-vis-toggle');
  const btnCloseVis = document.getElementById('btn-close-vis');
  const vinylRecord = document.getElementById('vinyl-record');
  const visArt = document.getElementById('vis-art');
  const visTitle = document.getElementById('vis-title');
  const visArtist = document.getElementById('vis-artist');

  // Modals — In-App Artist Profile
  const profileModalOverlay = document.getElementById('profile-modal-overlay');
  const btnCloseProfileModal = document.getElementById('btn-close-profile-modal');
  const profAvatar = document.getElementById('prof-avatar');
  const profName = document.getElementById('prof-name');
  const profLoc = document.getElementById('prof-loc');
  const profDesc = document.getElementById('prof-desc');
  const profStatTracks = document.getElementById('prof-stat-tracks');
  const profStatFollowers = document.getElementById('prof-stat-followers');
  const profStatLikes = document.getElementById('prof-stat-likes');
  const profFollowBtn = document.getElementById('prof-follow-btn');
  const profTracksGrid = document.getElementById('prof-tracks-grid');
  const profPlaylistsGrid = document.getElementById('prof-playlists-grid');

  // Modals — In-App Playlist Inspector
  const playlistModalOverlay = document.getElementById('playlist-modal-overlay');
  const btnClosePlaylistModal = document.getElementById('btn-close-playlist-modal');
  const plModalArt = document.getElementById('pl-modal-art');
  const plModalTitle = document.getElementById('pl-modal-title');
  const plModalArtist = document.getElementById('pl-modal-artist');
  const plModalMeta = document.getElementById('pl-modal-meta');
  const plModalPlayAll = document.getElementById('pl-modal-play-all');
  const plModalTracksList = document.getElementById('pl-modal-tracks-list');

  // Modals — In-App Comments
  const commentsModalOverlay = document.getElementById('comments-modal-overlay');
  const btnCloseCommentsModal = document.getElementById('btn-close-comments-modal');
  const commentsList = document.getElementById('comments-list');
  const newCommentInput = document.getElementById('new-comment-input');
  const btnSendComment = document.getElementById('btn-send-comment');

  // Global State
  const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="%23FF5500"%3E%3Ccircle cx="17" cy="17" r="17"/%3E%3C/svg%3E';
  const DEFAULT_ART = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23222"%3E%3Crect width="200" height="200"/%3E%3C/svg%3E';

  let queue = [];
  let currentIndex = -1;
  let isPlaying = false;
  let hlsInstance = null;
  let currentVolume = 0.8;
  let isMuted = false;
  let isShuffle = false;
  let repeatMode = 0; // 0: none, 1: all, 2: one
  let searchTimeout = null;
  let currentUser = null;

  let currentViewingArtist = null;
  let currentViewingPlaylist = null;
  let currentViewingTrackForComments = null;

  // WebAudio Equalizer State
  let audioCtx = null;
  let audioSource = null;
  let eqFilters = [];
  let stereoPanner = null;
  let masterGainNode = null;
  const EQ_FREQS = [60, 250, 1000, 4000, 12000];

  // SVG Icons
  const SVG_PLAY = '<path d="M8 5v14l11-7z"/>';
  const SVG_PAUSE = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
  const SVG_VOL_HIGH = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
  const SVG_VOL_LOW = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>';
  const SVG_VOL_MUTED = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';

  // 1. Equalizer WebAudio Initialization
  function initEqualizer() {
    if (audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      audioSource = audioCtx.createMediaElementSource(audio);

      eqFilters = EQ_FREQS.map((freq, i) => {
        const filter = audioCtx.createBiquadFilter();
        if (i === 0) {
          filter.type = 'lowshelf';
        } else if (i === EQ_FREQS.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.0;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });

      // Master Gain Node: Ensures hardware/software volume works 100% reliably in WebKitGTK, WebView2 & Mobile
      masterGainNode = audioCtx.createGain();
      const initialVol = isMuted ? 0 : currentVolume;
      masterGainNode.gain.setValueAtTime(initialVol, audioCtx.currentTime);

      let node = audioSource;
      for (const filter of eqFilters) {
        node.connect(filter);
        node = filter;
      }
      if (audioCtx.createStereoPanner) {
        stereoPanner = audioCtx.createStereoPanner();
        node.connect(stereoPanner);
        stereoPanner.connect(masterGainNode);
      } else {
        node.connect(masterGainNode);
      }
      masterGainNode.connect(audioCtx.destination);
    } catch (e) {
      console.warn('WebAudio Equalizer not initialized:', e);
    }
  }

  function setEqGain(bandIdx, gain) {
    initEqualizer();
    if (eqFilters[bandIdx]) {
      eqFilters[bandIdx].gain.value = gain;
    }
    const valEl = document.getElementById(`eq-val-${bandIdx}`);
    if (valEl) {
      valEl.textContent = `${gain > 0 ? '+' : ''}${gain}dB`;
    }
  }

  const PRESETS = {
    flat: [0, 0, 0, 0, 0],
    bass: [7, 5, 0, 0, 0],
    electronic: [5, 3, -1, 3, 5],
    vocal: [-2, 0, 4, 3, 0],
    rock: [4, 2, -1, 3, 4]
  };

  function applyEqPreset(presetName) {
    const vals = PRESETS[presetName] || PRESETS.flat;
    vals.forEach((val, i) => {
      const slider = document.getElementById(`eq-band-${i}`);
      if (slider) slider.value = val;
      setEqGain(i, val);
    });
  }

  EQ_FREQS.forEach((_, i) => {
    const slider = document.getElementById(`eq-band-${i}`);
    if (slider) {
      slider.addEventListener('input', (e) => {
        setEqGain(i, parseFloat(e.target.value));
        eqPresetChips.forEach(c => c.classList.remove('active'));
      });
    }
  });

  eqPresetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      eqPresetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyEqPreset(chip.getAttribute('data-preset'));
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // LOCAL GUEST STORAGE (Favorites, History, Guest Mode Support)
  // ═══════════════════════════════════════════════════════════════════════
  function getLocalLikes() {
    try {
      return JSON.parse(localStorage.getItem('sc_guest_likes') || '[]');
    } catch (_) {
      return [];
    }
  }

  function saveLocalLikes(likes) {
    try {
      localStorage.setItem('sc_guest_likes', JSON.stringify(likes));
    } catch (_) {}
  }

  function getLocalHistory() {
    try {
      return JSON.parse(localStorage.getItem('sc_guest_history') || '[]');
    } catch (_) {
      return [];
    }
  }

  function saveLocalHistory(history) {
    try {
      localStorage.setItem('sc_guest_history', JSON.stringify(history));
    } catch (_) {}
  }

  function addTrackToLocalHistory(track) {
    if (!track || !track.id) return;
    try {
      let history = getLocalHistory();
      history = history.filter(t => t.id !== track.id);
      history.unshift(track);
      if (history.length > 50) history = history.slice(0, 50);
      saveLocalHistory(history);
    } catch (_) {}
  }

  function isTrackLiked(trackId, apiLiked = false) {
    if (currentUser) {
      return !!apiLiked;
    }
    const localLikes = getLocalLikes();
    return localLikes.some(t => t.id === trackId);
  }

  // 2. Audio Engine & Playback
  async function playTrack(track, index = -1) {
    if (!track) return;
    addTrackToLocalHistory(track);
    initEqualizer();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (index >= 0) {
      currentIndex = index;
    } else {
      const existingIdx = queue.findIndex(t => t.id === track.id);
      if (existingIdx >= 0) {
        currentIndex = existingIdx;
      } else {
        queue.push(track);
        currentIndex = queue.length - 1;
      }
    }

    renderQueue();

    // Update Dock
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    const art = track.artwork_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="%23222"%3E%3Crect width="48" height="48"/%3E%3C/svg%3E';
    playerArt.src = art;
    visArt.src = art;
    visTitle.textContent = track.title;
    visArtist.textContent = track.artist;
    document.title = `🎵 ${track.title} • ${track.artist} | SoundCloud`;

    dockLikeBtn.classList.toggle('liked', isTrackLiked(track.id, track.liked));

    try {
      playerTitle.textContent = `Loading: ${track.title}...`;
      const res = await fetch(`/api/stream?id=${track.id}`);
      if (!res.ok) throw new Error('Stream resolution failed');
      const data = await res.json();
      playerTitle.textContent = track.title;

      const streamUrl = data.stream_url;
      const protocol = data.protocol;

      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (protocol === 'hls' || streamUrl.includes('.m3u8')) {
        if (window.Hls && Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(audio);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.play().catch(e => console.warn('Play interrupted:', e));
          });
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          audio.src = streamUrl;
          audio.play().catch(e => console.warn('Play interrupted:', e));
        } else {
          audio.src = streamUrl;
          audio.play();
        }
      } else {
        audio.src = streamUrl;
        audio.play().catch(e => console.warn('Play interrupted:', e));
      }

      isPlaying = true;
      updatePlayButtonUI(true);
      setupMediaSession(track);
      syncDiscordRPC(track, true);
    } catch (err) {
      console.error('Audio playback error:', err);
      playerTitle.textContent = `Playback error: ${track.title}`;
    }
  }

  function togglePlayPause() {
    if (currentIndex < 0 && queue.length > 0) {
      playTrack(queue[0], 0);
      return;
    }
    if (!audio.src && (!hlsInstance || !hlsInstance.media)) return;

    if (audio.paused) {
      audio.play().then(() => {
        isPlaying = true;
        updatePlayButtonUI(true);
        if (currentIndex >= 0 && queue[currentIndex]) {
          syncDiscordRPC(queue[currentIndex], true);
        }
      });
    } else {
      audio.pause();
      isPlaying = false;
      updatePlayButtonUI(false);
      if (currentIndex >= 0 && queue[currentIndex]) {
        syncDiscordRPC(queue[currentIndex], false);
      }
    }
  }

  function updatePlayButtonUI(playing) {
    if (playing) {
      playIconSvg.innerHTML = SVG_PAUSE;
      playIconSvg.classList.remove('play-triangle');
      vinylRecord.classList.add('spinning');
    } else {
      playIconSvg.innerHTML = SVG_PLAY;
      playIconSvg.classList.add('play-triangle');
      vinylRecord.classList.remove('spinning');
    }
  }

  function playNext() {
    if (queue.length === 0) return;
    if (isShuffle) {
      currentIndex = Math.floor(Math.random() * queue.length);
    } else {
      currentIndex = (currentIndex + 1) % queue.length;
    }
    playTrack(queue[currentIndex], currentIndex);
  }

  function playPrev() {
    if (queue.length === 0) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (isShuffle) {
      currentIndex = Math.floor(Math.random() * queue.length);
    } else {
      currentIndex = (currentIndex - 1 + queue.length) % queue.length;
    }
    playTrack(queue[currentIndex], currentIndex);
  }

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const current = audio.currentTime;
    const duration = audio.duration;
    timeCurrent.textContent = formatTime(current);
    timeTotal.textContent = formatTime(duration);

    const percent = (current / duration) * 100;
    progressFill.style.width = `${percent}%`;
    progressHandle.style.left = `${percent}%`;

    // Hook: A-B Looper
    checkLooper(current);

    // Hook: Synced Lyrics Karaoke
    updateLyricsSync(current);
  });

  audio.addEventListener('ended', () => {
    if (sleepTargetType === 'track') {
      cancelSleepTimer();
      audio.pause();
      isPlaying = false;
      updatePlayButtonUI(false);
      showToast('🌙 Sleep timer: track finished, music stopped');
      return;
    }

    if (repeatMode === 2) {
      audio.currentTime = 0;
      audio.play();
    } else if (repeatMode === 1 || currentIndex < queue.length - 1) {
      playNext();
    } else {
      isPlaying = false;
      updatePlayButtonUI(false);
      clearDiscordRPC();
    }
  });

  audio.addEventListener('play', () => {
    isPlaying = true;
    updatePlayButtonUI(true);
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'playing';
      } catch (_) {}
    }
    if (currentIndex >= 0 && queue[currentIndex]) {
      syncDiscordRPC(queue[currentIndex], true);
    }
  });

  audio.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayButtonUI(false);
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'paused';
      } catch (_) {}
    }
    if (currentIndex >= 0 && queue[currentIndex]) {
      syncDiscordRPC(queue[currentIndex], false);
    }
  });

  // Timeline Scrubber
  function seekFromEvent(e) {
    const rect = progressTrack.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audio.duration) {
      audio.currentTime = pos * audio.duration;
    }
  }

  let isSeeking = false;
  progressTrack.addEventListener('mousedown', (e) => {
    isSeeking = true;
    seekFromEvent(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isSeeking) seekFromEvent(e);
  });

  window.addEventListener('mouseup', () => {
    if (isSeeking) {
      isSeeking = false;
      if (currentIndex >= 0 && queue[currentIndex]) {
        syncDiscordRPC(queue[currentIndex], !audio.paused);
      }
    }
  });

  // Volume Slider & Popup Controls
  let volumeHideTimeout = null;

  function showVolumePopup() {
    clearTimeout(volumeHideTimeout);
    if (volumePopup) volumePopup.classList.add('active');
  }

  function hideVolumePopup(delay = 400) {
    if (isVolDragging) return;
    clearTimeout(volumeHideTimeout);
    volumeHideTimeout = setTimeout(() => {
      if (!isVolDragging && volumePopup) {
        volumePopup.classList.remove('active');
      }
    }, delay);
  }

  function setVolume(val, updateAudio = true) {
    currentVolume = Math.max(0, Math.min(1, val));
    const effectiveVol = isMuted ? 0 : currentVolume;

    if (updateAudio) {
      try {
        audio.volume = effectiveVol;
      } catch (_) {}

      if (masterGainNode && audioCtx) {
        try {
          if (audioCtx.state === 'suspended') {
            audioCtx.resume();
          }
          masterGainNode.gain.setValueAtTime(effectiveVol, audioCtx.currentTime);
        } catch (_) {}
      }
    }

    const percent = Math.round(currentVolume * 100);
    if (volumeFill) volumeFill.style.height = `${percent}%`;
    if (volumeKnob) volumeKnob.style.bottom = `${percent}%`;

    const percentLabel = document.getElementById('volume-percent-label');
    if (percentLabel) {
      percentLabel.textContent = isMuted ? 'MUTE' : `${percent}%`;
      percentLabel.style.color = isMuted ? '#FF5555' : 'var(--text-bright)';
    }

    if (volumeIconSvg) {
      if (isMuted || currentVolume === 0) {
        volumeIconSvg.innerHTML = SVG_VOL_MUTED;
      } else if (currentVolume < 0.4) {
        volumeIconSvg.innerHTML = SVG_VOL_LOW;
      } else {
        volumeIconSvg.innerHTML = SVG_VOL_HIGH;
      }
    }

    try {
      localStorage.setItem('sc_volume', currentVolume.toString());
      localStorage.setItem('sc_muted', isMuted ? '1' : '0');
    } catch (_) {}
  }

  function getClientY(e) {
    if (e.touches && e.touches.length > 0) return e.touches[0].clientY;
    if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0].clientY;
    if (e.clientY !== undefined) return e.clientY;
    return 0;
  }

  function setVolumeFromEvent(e) {
    if (!volumeTrack) return;
    const clientY = getClientY(e);
    const rect = volumeTrack.getBoundingClientRect();
    if (rect.height <= 0) return;
    const pos = Math.max(0, Math.min(1, (rect.bottom - clientY) / rect.height));
    isMuted = false;
    setVolume(pos);
  }

  let isVolDragging = false;

  function handleVolumeWheel(e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    isMuted = false;
    setVolume(currentVolume + delta);
    showVolumePopup();
    hideVolumePopup(1200);
  }

  if (volumeWrapper) {
    volumeWrapper.addEventListener('mouseenter', showVolumePopup);
    volumeWrapper.addEventListener('mouseleave', () => hideVolumePopup(400));
    volumeWrapper.addEventListener('wheel', handleVolumeWheel, { passive: false });
  }

  if (volumePopup) {
    volumePopup.addEventListener('mouseenter', showVolumePopup);
    volumePopup.addEventListener('mouseleave', () => hideVolumePopup(400));
    volumePopup.addEventListener('wheel', handleVolumeWheel, { passive: false });
    volumePopup.addEventListener('mousedown', (e) => {
      isVolDragging = true;
      showVolumePopup();
      setVolumeFromEvent(e);
    });
    volumePopup.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (volumeTrack) {
    volumeTrack.addEventListener('mousedown', (e) => {
      isVolDragging = true;
      showVolumePopup();
      setVolumeFromEvent(e);
    });

    // Touch support for mobile / tablet
    volumeTrack.addEventListener('touchstart', (e) => {
      isVolDragging = true;
      showVolumePopup();
      setVolumeFromEvent(e);
      e.preventDefault();
    }, { passive: false });
  }

  window.addEventListener('mousemove', (e) => {
    if (isVolDragging) {
      showVolumePopup();
      setVolumeFromEvent(e);
    }
  });

  window.addEventListener('touchmove', (e) => {
    if (isVolDragging) {
      showVolumePopup();
      setVolumeFromEvent(e);
      e.preventDefault();
    }
  }, { passive: false });

  function endVolumeDrag() {
    if (isVolDragging) {
      isVolDragging = false;
      hideVolumePopup(800);
    }
  }

  window.addEventListener('mouseup', endVolumeDrag);
  window.addEventListener('touchend', endVolumeDrag);
  window.addEventListener('touchcancel', endVolumeDrag);

  if (btnVolume) {
    btnVolume.addEventListener('click', (e) => {
      e.stopPropagation();
      isMuted = !isMuted;
      if (!isMuted && currentVolume === 0) {
        currentVolume = 0.7;
      }
      setVolume(currentVolume);
      if (volumePopup) {
        volumePopup.classList.toggle('active');
      }
    });
  }

  // Close volume popup on outside click
  document.addEventListener('click', (e) => {
    if (volumePopup && volumePopup.classList.contains('active')) {
      if (!volumeWrapper?.contains(e.target) && !volumePopup?.contains(e.target)) {
        volumePopup.classList.remove('active');
      }
    }
  });

  // Controls
  btnPlay.addEventListener('click', togglePlayPause);
  btnNext.addEventListener('click', playNext);
  btnPrev.addEventListener('click', playPrev);

  btnShuffle.addEventListener('click', () => {
    isShuffle = !isShuffle;
    btnShuffle.classList.toggle('active', isShuffle);
  });

  btnRepeat.addEventListener('click', () => {
    repeatMode = (repeatMode + 1) % 3;
    btnRepeat.classList.toggle('active', repeatMode > 0);
    if (repeatMode === 2) {
      btnRepeat.title = 'Repeat one track';
      btnRepeat.style.color = '#FFAA00';
    } else if (repeatMode === 1) {
      btnRepeat.title = 'Repeat entire queue';
      btnRepeat.style.color = 'var(--orange-neon)';
    } else {
      btnRepeat.title = 'Repeat (R)';
      btnRepeat.style.color = '';
    }
  });

  // Queue Drawer
  btnQueueToggle.addEventListener('click', () => {
    queueDrawer.classList.toggle('open');
    btnQueueToggle.classList.toggle('active', queueDrawer.classList.contains('open'));
  });

  btnQueueClear.addEventListener('click', () => {
    queue = currentIndex >= 0 ? [queue[currentIndex]] : [];
    currentIndex = queue.length > 0 ? 0 : -1;
    renderQueue();
  });

  function renderQueue() {
    queueList.innerHTML = '';
    if (queue.length === 0) {
      queueList.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 20px; font-size: 13px;">Queue is empty</div>';
      return;
    }

    queue.forEach((t, idx) => {
      const item = document.createElement('div');
      item.className = `queue-item ${idx === currentIndex ? 'active' : ''}`;
      item.innerHTML = `
        <img class="queue-item-art" src="${t.artwork_url || ''}" alt="">
        <div class="queue-item-info">
          <div class="queue-item-title">${t.title}</div>
          <div class="queue-item-artist">${t.artist}</div>
        </div>
        <span style="font-size: 11px; color: var(--text-dim);">${formatDurationMs(t.duration_ms)}</span>
      `;
      item.addEventListener('click', () => playTrack(t, idx));
      queueList.appendChild(item);
    });
  }

  // 3. Like & Download Actions
  async function toggleTrackLike(track, btnEl = null) {
    if (!currentUser) {
      // Full guest support: Save to local favorites without requiring login!
      let localLikes = getLocalLikes();
      const existingIdx = localLikes.findIndex(t => t.id === track.id);
      const willLike = existingIdx === -1;
      track.liked = willLike;

      if (willLike) {
        localLikes.unshift(track);
        showToast('❤️ ' + (TRANSLATIONS[currentLang]?.toast_liked_guest || 'Added to Local Favorites • Sign in to sync'));
      } else {
        localLikes = localLikes.filter(t => t.id !== track.id);
        showToast('🤍 ' + (TRANSLATIONS[currentLang]?.toast_unliked_guest || 'Removed from Local Favorites'));
      }
      saveLocalLikes(localLikes);

      if (btnEl) btnEl.classList.toggle('liked', willLike);
      if (currentIndex >= 0 && queue[currentIndex] && queue[currentIndex].id === track.id) {
        dockLikeBtn.classList.toggle('liked', willLike);
      }
      document.querySelectorAll(`.track-card[data-id="${track.id}"] .like-btn`).forEach(btn => {
        btn.classList.toggle('liked', willLike);
      });
      if (currentTab.type === 'lib' && currentTab.val === 'likes' && !willLike) {
        const cardToRemove = document.querySelector(`.track-card[data-id="${track.id}"]`);
        if (cardToRemove) {
          cardToRemove.style.opacity = '0';
          cardToRemove.style.transform = 'scale(0.95)';
          setTimeout(() => {
            cardToRemove.remove();
            if (getLocalLikes().length === 0) {
              renderEmptyLikesState();
            }
          }, 200);
        }
      }
      return;
    }

    const willLike = !track.liked;
    track.liked = willLike;

    if (btnEl) btnEl.classList.toggle('liked', willLike);
    if (currentIndex >= 0 && queue[currentIndex] && queue[currentIndex].id === track.id) {
      dockLikeBtn.classList.toggle('liked', willLike);
    }
    document.querySelectorAll(`.track-card[data-id="${track.id}"] .like-btn`).forEach(btn => {
      btn.classList.toggle('liked', willLike);
    });
    if (currentTab.type === 'lib' && currentTab.val === 'likes' && !willLike) {
      const cardToRemove = document.querySelector(`.track-card[data-id="${track.id}"]`);
      if (cardToRemove) {
        cardToRemove.style.opacity = '0';
        cardToRemove.style.transform = 'scale(0.95)';
        setTimeout(() => cardToRemove.remove(), 200);
      }
    }

    try {
      const method = willLike ? 'POST' : 'DELETE';
      await fetch(`/api/tracks/${track.id}/like`, { method });
      showToast(willLike ? '❤️ ' + (TRANSLATIONS[currentLang]?.toast_liked || 'Added to SoundCloud Likes') : '🤍 ' + (TRANSLATIONS[currentLang]?.toast_unliked || 'Removed from SoundCloud Likes'));
    } catch (e) {
      console.warn('Like toggle failed:', e);
    }
  }

  dockLikeBtn.addEventListener('click', () => {
    if (currentIndex >= 0 && queue[currentIndex]) {
      toggleTrackLike(queue[currentIndex], dockLikeBtn);
    }
  });

  dockDownloadBtn.addEventListener('click', () => {
    if (currentIndex >= 0 && queue[currentIndex]) {
      const track = queue[currentIndex];
      window.location.href = `/api/download?id=${track.id}`;
    }
  });

  // 4. Equalizer & Visualizer Toggles
  btnEqToggle.addEventListener('click', () => {
    eqModalOverlay.classList.toggle('open');
  });

  btnCloseEqModal.addEventListener('click', () => {
    eqModalOverlay.classList.remove('open');
  });

  btnVisToggle.addEventListener('click', () => {
    visualizerOverlay.classList.toggle('open');
  });

  btnCloseVis.addEventListener('click', () => {
    visualizerOverlay.classList.remove('open');
  });

  // 5. In-App Artist Profile Modal (100% In-App)
  async function openArtistProfile(artistId) {
    if (!artistId) return;
    profileModalOverlay.classList.add('open');

    // Loading skeleton
    profName.textContent = 'Loading profile...';
    profLoc.textContent = '';
    profDesc.textContent = '';
    profStatTracks.textContent = '...';
    profStatFollowers.textContent = '...';
    profStatLikes.textContent = '...';
    profTracksGrid.innerHTML = '<div style="color: var(--text-dim); padding: 20px;">Loading tracks...</div>';
    profPlaylistsGrid.innerHTML = '';
    profFollowBtn.style.display = 'none';

    try {
      const res = await fetch(`/api/artists/${artistId}`);
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      currentViewingArtist = data;

      profName.textContent = data.username;
      profAvatar.src = data.avatar_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23FF5500"%3E%3Ccircle cx="50" cy="50" r="50"/%3E%3C/svg%3E';
      const locParts = [data.city, data.country].filter(Boolean);
      profLoc.textContent = locParts.length > 0 ? `📍 ${locParts.join(', ')}` : '📍 SoundCloud Universe';
      profDesc.textContent = data.description || 'Artist has not added a bio yet.';

      profStatTracks.textContent = formatCount(data.track_count);
      profStatFollowers.textContent = formatCount(data.followers_count);
      profStatLikes.textContent = formatCount(data.likes_count);

      // Follow Button State
      if (currentUser && currentUser.id === data.id) {
        profFollowBtn.style.display = 'none';
      } else {
        profFollowBtn.style.display = 'block';
        updateFollowBtnUI(!!data.is_following);
      }

      // Render Artist Tracks
      profTracksGrid.innerHTML = '';
      if (!data.tracks || data.tracks.length === 0) {
        profTracksGrid.innerHTML = '<div style="color: var(--text-dim); padding: 20px;">No uploaded tracks</div>';
      } else {
        data.tracks.forEach((t, i) => {
          const card = document.createElement('div');
          card.className = 'track-card';
          const art = t.artwork_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="160" fill="%23222"%3E%3Crect width="160" height="160"/%3E%3C/svg%3E';
          card.innerHTML = `
            <div class="artwork-wrapper">
              <img class="track-artwork" src="${art}" loading="lazy" alt="${t.title}">
              <div class="card-play-overlay">
                <button class="overlay-play-btn" title="Play">
                  <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
            </div>
            <div class="track-title" title="${t.title}">${t.title}</div>
            <div class="track-artist" title="${t.artist}">${t.artist}</div>
            <div class="track-meta">
              <span>⏱ ${formatDurationMs(t.duration_ms)}</span>
              <button class="like-btn ${t.liked ? 'liked' : ''}" title="Like">
                <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>
            </div>
          `;
          card.addEventListener('click', (e) => {
            if (e.target.closest('.like-btn')) {
              e.stopPropagation();
              toggleTrackLike(t, card.querySelector('.like-btn'));
              return;
            }
            queue = data.tracks.slice();
            playTrack(t, i);
          });
          profTracksGrid.appendChild(card);
        });
      }

      // Render Artist Playlists
      profPlaylistsGrid.innerHTML = '';
      if (!data.playlists || data.playlists.length === 0) {
        profPlaylistsGrid.innerHTML = '<div style="color: var(--text-dim); padding: 10px; font-size: 13px;">No public albums</div>';
      } else {
        data.playlists.forEach(pl => {
          const card = document.createElement('div');
          card.className = 'playlist-card';
          const art = pl.artwork_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="160" fill="%23222"%3E%3Crect width="160" height="160"/%3E%3C/svg%3E';
          card.innerHTML = `
            <div class="artwork-wrapper" style="position: relative;">
              <img class="track-artwork" src="${art}" loading="lazy" alt="${pl.title}">
              <div class="playlist-badge">📂 ${pl.track_count} tracks</div>
            </div>
            <div class="track-title" title="${pl.title}">${pl.title}</div>
            <div class="track-artist" title="${pl.artist}">${pl.artist}</div>
          `;
          card.addEventListener('click', () => {
            openPlaylistInspector(pl.id);
          });
          profPlaylistsGrid.appendChild(card);
        });
      }

    } catch (e) {
      console.error('Failed to load artist profile:', e);
      profName.textContent = 'Error loading profile';
      profDesc.textContent = e.toString();
    }
  }

  function updateFollowBtnUI(following) {
    if (following) {
      profFollowBtn.textContent = '✓ Following';
      profFollowBtn.classList.add('following');
    } else {
      profFollowBtn.textContent = '+ Follow';
      profFollowBtn.classList.remove('following');
    }
  }

  profFollowBtn.addEventListener('click', async () => {
    if (!currentUser) {
      showToast('ℹ️ ' + (TRANSLATIONS[currentLang]?.toast_guest_follow || 'Sign in to SoundCloud to follow artists'));
      return;
    }
    if (!currentViewingArtist) return;

    const willFollow = !currentViewingArtist.is_following;
    updateFollowBtnUI(willFollow);
    currentViewingArtist.is_following = willFollow;

    try {
      const method = willFollow ? 'POST' : 'DELETE';
      await fetch(`/api/artists/${currentViewingArtist.id}/follow`, { method });
    } catch (e) {
      console.error('Follow toggle error:', e);
    }
  });

  btnCloseProfileModal.addEventListener('click', () => {
    profileModalOverlay.classList.remove('open');
  });

  // 6. In-App Playlist & Album Inspector Modal (100% In-App)
  async function openPlaylistInspector(playlistId) {
    if (!playlistId) return;
    playlistModalOverlay.classList.add('open');

    // Loading skeleton
    plModalTitle.textContent = 'Loading playlist...';
    plModalArtist.textContent = '';
    plModalMeta.textContent = '...';
    plModalTracksList.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 30px;">Loading tracks...</div>';

    try {
      const res = await fetch(`/api/playlists/${playlistId}`);
      if (!res.ok) throw new Error('Playlist load failed');
      const data = await res.json();
      currentViewingPlaylist = data;

      plModalTitle.textContent = data.title;
      plModalArtist.textContent = data.artist;
      plModalArt.src = data.artwork_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="130" height="130" fill="%23222"%3E%3Crect width="130" height="130"/%3E%3C/svg%3E';
      const trackCount = data.tracks ? data.tracks.length : data.track_count;
      plModalMeta.textContent = `${trackCount} tracks • ${formatDurationMs(data.duration_ms)}`;

      // Click artist in playlist modal
      plModalArtist.onclick = () => {
        if (data.artist_id) {
          playlistModalOverlay.classList.remove('open');
          openArtistProfile(data.artist_id);
        }
      };

      // Play All Button
      plModalPlayAll.onclick = () => {
        if (data.tracks && data.tracks.length > 0) {
          queue = data.tracks.slice();
          playTrack(queue[0], 0);
        }
      };

      // Render Tracks List
      plModalTracksList.innerHTML = '';
      if (!data.tracks || data.tracks.length === 0) {
        plModalTracksList.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 20px;">No available tracks in this playlist</div>';
        return;
      }

      data.tracks.forEach((t, i) => {
        const row = document.createElement('div');
        row.className = 'playlist-track-row';
        row.innerHTML = `
          <span class="playlist-track-num">${i + 1}</span>
          <span class="playlist-track-title" title="${t.title}">${t.title}</span>
          <span class="playlist-track-artist" title="${t.artist}">${t.artist}</span>
          <span class="playlist-track-duration">${formatDurationMs(t.duration_ms)}</span>
        `;
        row.onclick = () => {
          queue = data.tracks.slice();
          playTrack(t, i);
        };
        plModalTracksList.appendChild(row);
      });

    } catch (e) {
      console.error('Failed to load playlist:', e);
      plModalTitle.textContent = 'Error loading playlist';
      plModalTracksList.innerHTML = `<div style="color: #FF5555; text-align: center; padding: 20px;">${e.toString()}</div>`;
    }
  }

  btnClosePlaylistModal.addEventListener('click', () => {
    playlistModalOverlay.classList.remove('open');
  });

  // 7. In-App Track Comments Modal (100% In-App)
  async function openCommentsModal(track = null) {
    if (!track) {
      track = currentIndex >= 0 ? queue[currentIndex] : null;
    }
    if (!track) {
      showToast('⚠️ Please play a track first to view comments');
      return;
    }

    currentViewingTrackForComments = track;
    commentsModalOverlay.classList.add('open');
    commentsList.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 30px;">Loading comments...</div>';

    try {
      const res = await fetch(`/api/tracks/${track.id}/comments`);
      if (!res.ok) throw new Error('Comments load failed');
      const data = await res.json();
      renderCommentsList(data.comments || []);
    } catch (e) {
      console.error('Failed to load comments:', e);
      commentsList.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 30px;">Could not load comments for this track</div>';
    }
  }

  function renderCommentsList(comments) {
    commentsList.innerHTML = '';
    if (!comments || comments.length === 0) {
      commentsList.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 30px;">No comments yet on this track. Be the first!</div>';
      return;
    }

    comments.forEach(c => {
      const row = document.createElement('div');
      row.className = 'comment-row';
      const timeStr = c.timestamp_ms ? formatDurationMs(c.timestamp_ms) : '';

      row.innerHTML = `
        <img class="comment-avatar" src="${c.user_avatar || DEFAULT_AVATAR}" alt="">
        <div class="comment-content">
          <div class="comment-user-row">
            <span class="comment-username" style="cursor: pointer;">${escapeHtml(c.username)}</span>
            ${timeStr ? `<span class="comment-timestamp-chip" data-time="${c.timestamp_ms / 1000}">⏱ ${timeStr}</span>` : ''}
          </div>
          <div class="comment-body">${escapeHtml(c.body)}</div>
        </div>
      `;

      // Click username opens profile
      const userEl = row.querySelector('.comment-username');
      if (userEl && c.user_id) {
        userEl.onclick = () => {
          commentsModalOverlay.classList.remove('open');
          openArtistProfile(c.user_id);
        };
      }

      // Click timestamp seeks audio
      const chip = row.querySelector('.comment-timestamp-chip');
      if (chip) {
        chip.onclick = () => {
          const t = parseFloat(chip.getAttribute('data-time'));
          audio.currentTime = t;
          if (audio.paused) audio.play();
        };
      }

      commentsList.appendChild(row);
    });
  }

  async function postNewComment() {
    if (!currentUser) {
      showToast('ℹ️ ' + (TRANSLATIONS[currentLang]?.toast_guest_comment || 'Sign in to SoundCloud to post comments'));
      return;
    }
    if (!currentViewingTrackForComments) return;

    const body = newCommentInput.value.trim();
    if (!body) return;

    const timestamp_ms = Math.floor((audio.currentTime || 0) * 1000);
    btnSendComment.textContent = 'Sending...';
    btnSendComment.disabled = true;

    try {
      const res = await fetch(`/api/tracks/${currentViewingTrackForComments.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, timestamp_ms })
      });
      if (!res.ok) throw new Error('Comment post failed');
      const newComment = await res.json();
      newCommentInput.value = '';

      // Insert immediately into list
      const row = document.createElement('div');
      row.className = 'comment-row';
      const timeStr = newComment.timestamp_ms ? formatDurationMs(newComment.timestamp_ms) : '';
      row.innerHTML = `
        <img class="comment-avatar" src="${newComment.user_avatar || currentUser.avatar_url || ''}" alt="">
        <div class="comment-content">
          <div class="comment-user-row">
            <span class="comment-username">${escapeHtml(newComment.username)}</span>
            ${timeStr ? `<span class="comment-timestamp-chip">⏱ ${timeStr}</span>` : ''}
          </div>
          <div class="comment-body">${escapeHtml(newComment.body)}</div>
        </div>
      `;
      commentsList.insertBefore(row, commentsList.firstChild);
    } catch (e) {
      showToast('⚠️ Error sending comment: ' + e);
    } finally {
      btnSendComment.textContent = 'Send';
      btnSendComment.disabled = false;
    }
  }

  btnSendComment.addEventListener('click', postNewComment);
  newCommentInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') postNewComment();
  });
  btnCloseCommentsModal.addEventListener('click', () => {
    commentsModalOverlay.classList.remove('open');
  });

  dockCommentsBtn.addEventListener('click', () => {
    openCommentsModal();
  });

  // 8. In-App Track Radio / Station (100% In-App)
  async function startTrackRadio() {
    if (currentIndex < 0 || !queue[currentIndex]) {
      showToast('⚠️ Please play a track first to start a radio station');
      return;
    }
    const track = queue[currentIndex];
    playerTitle.textContent = `Starting radio: ${track.title}...`;

    try {
      const res = await fetch(`/api/tracks/${track.id}/related`);
      if (!res.ok) throw new Error('Failed to load radio tracks');
      const data = await res.json();

      if (data.tracks && data.tracks.length > 0) {
        queue = [track, ...data.tracks];
        currentIndex = 0;
        renderQueue();
        currentRadioTrackTitle = track.title;
        currentTab = { type: 'radio', val: track.id };
        renderActiveTabTitle();
        heroSection.style.display = 'none';
        renderTracks(queue);
        playerTitle.textContent = track.title;
      } else {
        showToast('ℹ️ No similar tracks found for radio station');
        playerTitle.textContent = track.title;
      }
    } catch (e) {
      console.error('Radio error:', e);
      playerTitle.textContent = track.title;
    }
  }

  dockRadioBtn.addEventListener('click', startTrackRadio);

  // Click artist name in player dock
  playerArtist.addEventListener('click', () => {
    if (currentIndex >= 0 && queue[currentIndex] && queue[currentIndex].artist_id) {
      openArtistProfile(queue[currentIndex].artist_id);
    }
  });

  // 9. Authentication & User Profile
  async function checkSystemStatus() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      const badge = document.getElementById('antidpi-badge');
      if (badge && data.antidpi) {
        badge.title = `⚡ Zapret: ${data.antidpi}\nISP/DPI bypass active. Music and API work without external VPN.`;
      }
    } catch (e) {
      console.warn('System status check failed:', e);
    }
  }

  async function checkAuthStatus() {
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    const btnDropLogin = document.getElementById('btn-dropdown-login');

    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      if (data.authenticated && data.user) {
        currentUser = data.user;
        if (btnLoginTrigger) btnLoginTrigger.style.display = 'none';
        userBadge.style.display = 'flex';
        userName.textContent = currentUser.username;
        userAvatar.src = currentUser.avatar_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="%23FF5500"%3E%3Ccircle cx="16" cy="16" r="16"/%3E%3C/svg%3E';
        if (btnViewMyProfile) btnViewMyProfile.style.display = 'flex';
        if (btnLogout) btnLogout.style.display = 'flex';
        if (btnDropLogin) btnDropLogin.style.display = 'none';
      } else {
        currentUser = null;
        if (btnLoginTrigger) btnLoginTrigger.style.display = 'none';
        userBadge.style.display = 'flex';
        userName.textContent = t.guest_user || 'Guest';
        userAvatar.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23888"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/%3E%3C/svg%3E';
        if (btnViewMyProfile) btnViewMyProfile.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'none';
        if (btnDropLogin) btnDropLogin.style.display = 'flex';
      }
    } catch (e) {
      console.warn('Auth status check failed:', e);
      currentUser = null;
      if (btnLoginTrigger) btnLoginTrigger.style.display = 'none';
      userBadge.style.display = 'flex';
      userName.textContent = t.guest_user || 'Guest';
      userAvatar.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23888"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/%3E%3C/svg%3E';
      if (btnViewMyProfile) btnViewMyProfile.style.display = 'none';
      if (btnLogout) btnLogout.style.display = 'none';
      if (btnDropLogin) btnDropLogin.style.display = 'flex';
    }
  }

  if (btnLoginTrigger) {
    btnLoginTrigger.addEventListener('click', () => {
      authModalOverlay.classList.add('open');
    });
  }

  const btnDropdownLogin = document.getElementById('btn-dropdown-login');
  if (btnDropdownLogin) {
    btnDropdownLogin.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.remove('open');
      authModalOverlay.classList.add('open');
    });
  }

  btnCloseAuthModal.addEventListener('click', () => {
    authModalOverlay.classList.remove('open');
  });

  if (btnImportBrowser) {
    btnImportBrowser.addEventListener('click', async () => {
      btnImportBrowser.textContent = 'Scanning Chromium session...';
      try {
        const res = await fetch('/api/auth/import-browser', { method: 'POST' });
        const data = await res.json();
        if (data.authenticated) {
          authModalOverlay.classList.remove('open');
          await checkAuthStatus();
          loadMyLikes();
        } else {
          showToast('⚠️ Session not found: ' + (data.error || 'sign in to soundcloud.com in Chromium / Chrome'));
        }
      } catch(e) {
        showToast('⚠️ Import error: ' + e);
      } finally {
        btnImportBrowser.textContent = '⚡ 1-Click Sign In (from Chromium)';
      }
    });
  }

  btnOpenScSignin.addEventListener('click', () => {
    window.open('https://soundcloud.com/signin', '_blank');
  });

  btnSubmitToken.addEventListener('click', async () => {
    const token = authTokenInput.value.trim();
    if (!token) return;

    btnSubmitToken.textContent = 'Verifying...';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (data.authenticated) {
        authModalOverlay.classList.remove('open');
        await checkAuthStatus();
        loadMyLikes();
      } else {
        showToast('⚠️ ' + (data.error || 'Invalid token. Please check and try again.'));
      }
    } catch (e) {
      showToast('⚠️ Connection error: ' + e);
    } finally {
      btnSubmitToken.textContent = 'Connect Account';
    }
  });

  userBadge.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('open');
  });

  if (userDropdown) {
    userDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  window.addEventListener('click', () => {
    userDropdown.classList.remove('open');
  });

  if (btnViewMyProfile) {
    btnViewMyProfile.addEventListener('click', () => {
      if (currentUser && currentUser.id) {
        userDropdown.classList.remove('open');
        openArtistProfile(currentUser.id);
      }
    });
  }

  btnLogout.addEventListener('click', async () => {
    userDropdown.classList.remove('open');
    await fetch('/api/auth/logout', { method: 'POST' });
    await checkAuthStatus();
    loadTrending('all-music');
    showToast('👋 ' + (TRANSLATIONS[currentLang]?.logout || 'Signed Out'));
  });

  // 10. Bento Grid Rendering (Tracks & Playlists)
  function renderTracks(tracks) {
    tracksGrid.innerHTML = '';
    if (!tracks || tracks.length === 0) {
      const tTr = TRANSLATIONS[currentLang] || TRANSLATIONS.en; tracksGrid.innerHTML = `<div style="color: var(--text-dim); padding: 40px; font-size: 14px; text-align: center;">${tTr.no_tracks_found || 'No tracks found'}</div>`;
      return;
    }

    if (tracks.length > 0 && heroSection.style.display !== 'none') {
      const first = tracks[0];
      heroTitle.textContent = first.title;
      heroArtist.textContent = first.artist;
      if (first.artwork_url) {
        heroBgArt.src = first.artwork_url;
      }
      heroPlayBtn.onclick = () => playTrack(first, 0);
    }

    tracks.forEach((track, idx) => {
      const card = document.createElement('div');
      card.className = 'track-card';
      card.setAttribute('data-id', track.id);
      const art = track.artwork_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23222"%3E%3Crect width="200" height="200"/%3E%3C/svg%3E';
      const isLiked = isTrackLiked(track.id, track.liked);

      card.innerHTML = `
        <div class="artwork-wrapper">
          <img class="track-artwork" src="${art}" loading="lazy" alt="${track.title}">
          <div class="card-play-overlay">
            <button class="overlay-play-btn" title="Play">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
        </div>
        <div class="track-title" title="${track.title}">${track.title}</div>
        <div class="track-artist" title="${track.artist}" style="cursor: pointer;">${track.artist}</div>
        <div class="track-meta">
          <span>⏱ ${formatDurationMs(track.duration_ms)}</span>
          <button class="like-btn ${isLiked ? 'liked' : ''}" title="Like">
            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.like-btn')) {
          e.stopPropagation();
          toggleTrackLike(track, card.querySelector('.like-btn'));
          return;
        }
        if (e.target.closest('.track-artist')) {
          e.stopPropagation();
          if (track.artist_id) {
            openArtistProfile(track.artist_id);
          } else {
            performSearch(track.artist);
          }
          return;
        }
        queue = tracks.slice();
        playTrack(track, idx);
      });

      tracksGrid.appendChild(card);
    });
  }

  function renderPlaylists(playlists) {
    tracksGrid.innerHTML = '';
    if (!playlists || playlists.length === 0) {
      const tPl = TRANSLATIONS[currentLang] || TRANSLATIONS.en; tracksGrid.innerHTML = `<div style="color: var(--text-dim); padding: 40px; font-size: 14px; text-align: center;">${tPl.no_playlists_found || 'No playlists found'}</div>`;
      return;
    }

    playlists.forEach(pl => {
      const card = document.createElement('div');
      card.className = 'playlist-card';
      const art = pl.artwork_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23222"%3E%3Crect width="200" height="200"/%3E%3C/svg%3E';

      card.innerHTML = `
        <div class="artwork-wrapper" style="position: relative;">
          <img class="track-artwork" src="${art}" loading="lazy" alt="${pl.title}">
          <div class="playlist-badge">📂 ${pl.track_count} tracks</div>
        </div>
        <div class="track-title" title="${pl.title}">${pl.title}</div>
        <div class="track-artist" title="${pl.artist}">${pl.artist}</div>
      `;

      card.addEventListener('click', () => {
        openPlaylistInspector(pl.id);
      });

      tracksGrid.appendChild(card);
    });
  }

  // 11. Library Navigation Calls & Views
  function renderEmptyLikesState() {
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    tracksGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-dim);">
        <div style="font-size: 48px; margin-bottom: 12px;">❤️</div>
        <div style="font-size: 16px; font-weight: 700; color: var(--text-bright); margin-bottom: 6px;">
          ${t.no_likes_guest_title || 'Your Local Favorites is empty'}
        </div>
        <div style="font-size: 13px; max-width: 440px; margin: 0 auto 18px; line-height: 1.5;">
          ${t.no_likes_guest_desc || 'Tap the ❤️ icon on any track to save it here, or sign in to sync with your SoundCloud account.'}
        </div>
        <button class="action-btn" id="btn-empty-likes-signin" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; border-radius: 9999px; background: var(--orange-neon); color: #fff; font-weight: 700; border: none; cursor: pointer;">
          ⚡ ${t.login_btn || 'Sign In to SoundCloud'}
        </button>
      </div>
    `;
    document.getElementById('btn-empty-likes-signin')?.addEventListener('click', () => {
      document.getElementById('auth-modal-overlay')?.classList.add('open');
    });
  }

  function renderEmptyStreamState() {
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    tracksGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-dim);">
        <div style="font-size: 48px; margin-bottom: 12px;">📡</div>
        <div style="font-size: 16px; font-weight: 700; color: var(--text-bright); margin-bottom: 6px;">
          ${t.stream_guest_title || 'Personal Stream requires an account'}
        </div>
        <div style="font-size: 13px; max-width: 440px; margin: 0 auto 18px; line-height: 1.5;">
          ${t.stream_guest_desc || 'Stream shows updates from artists you follow on SoundCloud. You can listen freely to Trending, Liked Tracks, Playlists, and Search without an account, or sign in whenever you wish!'}
        </div>
        <button class="action-btn" id="btn-empty-stream-signin" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; border-radius: 9999px; background: var(--orange-neon); color: #fff; font-weight: 700; border: none; cursor: pointer;">
          ⚡ ${t.login_btn || 'Sign In to SoundCloud'}
        </button>
      </div>
    `;
    document.getElementById('btn-empty-stream-signin')?.addEventListener('click', () => {
      document.getElementById('auth-modal-overlay')?.classList.add('open');
    });
  }

  function renderEmptyHistoryState() {
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    tracksGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-dim);">
        <div style="font-size: 48px; margin-bottom: 12px;">🕒</div>
        <div style="font-size: 16px; font-weight: 700; color: var(--text-bright); margin-bottom: 6px;">
          ${t.no_history_title || 'No playback history yet'}
        </div>
        <div style="font-size: 13px; max-width: 400px; margin: 0 auto; line-height: 1.5;">
          ${t.no_history_desc || 'Tracks you play will automatically appear here for quick access.'}
        </div>
      </div>
    `;
  }

  function renderHistoryTracks(tracks) {
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    renderTracks(tracks);
    const clearBar = document.createElement('div');
    clearBar.style.cssText = 'grid-column: 1 / -1; display: flex; justify-content: flex-end; margin-bottom: 8px;';
    clearBar.innerHTML = `
      <button id="btn-clear-history-action" style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); color: var(--text-dim); padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
        🗑️ ${t.btn_clear_history || 'Clear History'}
      </button>
    `;
    tracksGrid.insertBefore(clearBar, tracksGrid.firstChild);
    document.getElementById('btn-clear-history-action')?.addEventListener('click', () => {
      saveLocalHistory([]);
      renderEmptyHistoryState();
      showToast(t.toast_history_cleared || 'History cleared');
    });
  }

  async function loadMyLikes() {
    currentTab = { type: 'lib', val: 'likes' };
    renderActiveTabTitle();
    heroSection.style.display = 'none';

    if (!currentUser) {
      const localLikes = getLocalLikes();
      if (localLikes.length === 0) {
        renderEmptyLikesState();
        return;
      }
      renderTracks(localLikes.map(tr => ({ ...tr, liked: true })));
      return;
    }

    try {
      const res = await fetch('/api/me/likes?limit=50');
      const data = await res.json();
      const tracks = data.tracks || [];
      if (tracks.length === 0) {
        renderEmptyLikesState();
      } else {
        renderTracks(tracks.map(tr => ({ ...tr, liked: true })));
      }
    } catch (e) {
      console.error('Failed to load likes:', e);
      const localLikes = getLocalLikes();
      if (localLikes.length > 0) {
        renderTracks(localLikes.map(tr => ({ ...tr, liked: true })));
      } else {
        renderEmptyLikesState();
      }
    }
  }

  async function loadMyPlaylists() {
    currentTab = { type: 'lib', val: 'playlists' };
    renderActiveTabTitle();
    heroSection.style.display = 'none';

    if (!currentUser) {
      try {
        const res = await fetch('/api/search?q=top%20hits&limit=24');
        const data = await res.json();
        renderPlaylists(data.playlists || []);
      } catch (e) {
        console.error('Failed to load featured playlists:', e);
        renderPlaylists([]);
      }
      return;
    }

    try {
      const res = await fetch('/api/me/playlists');
      const data = await res.json();
      renderPlaylists(data.playlists || []);
    } catch (e) {
      console.error('Failed to load playlists:', e);
      renderPlaylists([]);
    }
  }

  async function loadMyStream() {
    currentTab = { type: 'lib', val: 'stream' };
    renderActiveTabTitle();
    heroSection.style.display = 'none';

    if (!currentUser) {
      renderEmptyStreamState();
      return;
    }

    try {
      const res = await fetch('/api/me/stream');
      const data = await res.json();
      const tracks = data.tracks || [];
      if (tracks.length === 0) {
        renderEmptyStreamState();
      } else {
        renderTracks(tracks);
      }
    } catch (e) {
      console.error('Failed to load stream:', e);
      renderEmptyStreamState();
    }
  }

  async function loadMyHistory() {
    currentTab = { type: 'lib', val: 'history' };
    renderActiveTabTitle();
    heroSection.style.display = 'none';

    if (!currentUser) {
      const localHistory = getLocalHistory();
      if (localHistory.length === 0) {
        renderEmptyHistoryState();
        return;
      }
      renderHistoryTracks(localHistory);
      return;
    }

    try {
      const res = await fetch('/api/me/history');
      const data = await res.json();
      if (data.tracks && data.tracks.length > 0) {
        renderHistoryTracks(data.tracks);
      } else {
        const localHistory = getLocalHistory();
        if (localHistory.length > 0) renderHistoryTracks(localHistory);
        else renderEmptyHistoryState();
      }
    } catch (e) {
      const localHistory = getLocalHistory();
      if (localHistory.length > 0) renderHistoryTracks(localHistory);
      else renderEmptyHistoryState();
    }
  }

  async function loadTrending(genre = 'all-music') {
    currentTab = { type: 'genre', val: genre };
    renderActiveTabTitle();
    heroSection.style.display = (genre === 'all-music') ? 'grid' : 'none';
    try {
      const res = await fetch(`/api/trending?genre=${genre}&limit=32`);
      const data = await res.json();
      renderTracks(data.tracks || []);
    } catch (e) {
      console.error('Failed to load trending:', e);
    }
  }

  async function performSearch(query) {
    if (!query || !query.trim()) {
      loadTrending('all-music');
      return;
    }
    currentSearchQuery = query;
    currentTab = { type: 'search', val: query };
    renderActiveTabTitle();
    heroSection.style.display = 'none';

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=32`);
      const data = await res.json();
      renderTracks(data.tracks || []);
    } catch (e) {
      console.error('Failed to search tracks:', e);
    }
  }

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const q = e.target.value.trim();
    searchTimeout = setTimeout(() => {
      performSearch(q);
    }, 350);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(searchTimeout);
      const q = searchInput.value.trim();
      performSearch(q);
    }
  });

  const searchIcon = document.querySelector('.search-icon');
  if (searchIcon) {
    searchIcon.style.cursor = 'pointer';
    searchIcon.addEventListener('click', () => {
      clearTimeout(searchTimeout);
      const q = searchInput.value.trim();
      performSearch(q);
    });
  }

  // Chips Bar Click
  document.getElementById('chips-bar').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    searchInput.value = '';

    const type = chip.getAttribute('data-type');
    const val = chip.getAttribute('data-val');

    if (type === 'lib') {
      if (val === 'likes') loadMyLikes();
      else if (val === 'playlists') loadMyPlaylists();
      else if (val === 'stream') loadMyStream();
      else if (val === 'history') loadMyHistory();
    } else {
      loadTrending(val);
    }
  });

  document.getElementById('brand-home').addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    document.querySelector('.chip').classList.add('active');
    searchInput.value = '';
    loadTrending('all-music');
  });

  // Overlay click to close
  [authModalOverlay, eqModalOverlay, profileModalOverlay, playlistModalOverlay, commentsModalOverlay].forEach(overlay => {
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    }
  });

  // 12. MediaSession API
  function setupMediaSession(track) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: 'SoundCloud',
        artwork: track.artwork_url ? [{ src: track.artwork_url, sizes: '500x500', type: 'image/jpeg' }] : []
      });

      navigator.mediaSession.setActionHandler('play', () => togglePlayPause());
      navigator.mediaSession.setActionHandler('pause', () => togglePlayPause());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && audio.duration) {
          audio.currentTime = details.seekTime;
        }
      });
    }
  }

  // 13. Global Shortcuts & Modal Management
  function closeAllModals() {
    if (searchInput) searchInput.blur();
    if (authModalOverlay) authModalOverlay.classList.remove('open');
    if (eqModalOverlay) eqModalOverlay.classList.remove('open');
    if (visualizerOverlay) visualizerOverlay.classList.remove('open');
    if (profileModalOverlay) profileModalOverlay.classList.remove('open');
    if (playlistModalOverlay) playlistModalOverlay.classList.remove('open');
    if (commentsModalOverlay) commentsModalOverlay.classList.remove('open');
    document.getElementById('theme-modal-overlay')?.classList.remove('open');
    document.getElementById('extensions-modal-overlay')?.classList.remove('open');
    document.getElementById('lyrics-overlay')?.classList.remove('open');
    document.getElementById('sleep-modal-overlay')?.classList.remove('open');
    document.getElementById('fx-modal-overlay')?.classList.remove('open');
    document.getElementById('looper-modal-overlay')?.classList.remove('open');
    document.getElementById('card-modal-overlay')?.classList.remove('open');
    document.getElementById('lang-modal-overlay')?.classList.remove('open');
    if (userDropdown) userDropdown.classList.remove('open');
  }


  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      return;
    }

    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
      return;
    }

    // Never intercept browser native shortcuts or combination hotkeys (e.g. Ctrl+R, Ctrl+F, Ctrl+C, Alt+Shift+L)
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      audio.currentTime = Math.max(0, audio.currentTime - 5);
    } else if (e.code === 'ArrowUp') {
      e.preventDefault();
      isMuted = false;
      setVolume(currentVolume + 0.05);
      showVolumePopup();
      hideVolumePopup(1200);
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      isMuted = false;
      setVolume(currentVolume - 0.05);
      showVolumePopup();
      hideVolumePopup(1200);
    } else if (e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') {
      e.preventDefault();
      btnVolume.click();
    } else if (e.key === 'l' || e.key === 'L' || e.key === 'д' || e.key === 'Д') {
      e.preventDefault();
      dockLikeBtn.click();
    } else if (e.key === 'c' || e.key === 'C' || e.key === 'с' || e.key === 'С') {
      e.preventDefault();
      openCommentsModal();
    } else if (e.key === 'e' || e.key === 'E' || e.key === 'у' || e.key === 'У') {
      e.preventDefault();
      btnEqToggle.click();
    } else if (e.key === 'v' || e.key === 'V' || e.key === 'м' || e.key === 'М') {
      e.preventDefault();
      btnVisToggle.click();
    } else if (e.key === 'd' || e.key === 'D' || e.key === 'в' || e.key === 'В') {
      e.preventDefault();
      dockDownloadBtn.click();
    } else if (e.key === 's' || e.key === 'S' || e.key === 'ы' || e.key === 'Ы') {
      e.preventDefault();
      btnShuffle.click();
    } else if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
      e.preventDefault();
      btnRepeat.click();
    } else if (e.key === 'q' || e.key === 'Q' || e.key === 'й' || e.key === 'Й') {
      e.preventDefault();
      btnQueueToggle.click();
    } else if (e.key === 'k' || e.key === 'K' || e.key === 'л' || e.key === 'Л') {
      e.preventDefault();
      document.getElementById('btn-lyrics-toggle')?.click();
    } else if (e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А') {
      e.preventDefault();
      document.getElementById('btn-fx-toggle')?.click();
    } else if (e.key === '[') {
      e.preventDefault();
      setLoopA();
    } else if (e.key === ']') {
      e.preventDefault();
      setLoopB();
    } else if (e.key === '\\') {
      e.preventDefault();
      toggleLoopActive();
    } else if (e.key === '/') {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TOAST NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════
  function showToast(msg) {
    let toast = document.getElementById('sc-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sc-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 96px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: var(--surface-dock);
        color: var(--text-main);
        border: 1px solid var(--border-hover);
        box-shadow: 0 12px 36px rgba(0,0,0,0.8), 0 0 18px var(--orange-glow);
        padding: 10px 22px;
        border-radius: var(--radius-pill);
        font-size: 13px;
        font-weight: 600;
        z-index: 500;
        pointer-events: none;
        opacity: 0;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        gap: 8px;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2800);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 10 THEMES SYSTEM
  // ═══════════════════════════════════════════════════════════════════════
  const THEME_COLORS = {
    onyx: [255, 85, 0],
    cyberpunk: [255, 230, 0],
    synthwave: [247, 37, 133],
    matrix: [0, 255, 102],
    nordic: [0, 210, 255],
    crimson: [255, 30, 86],
    sakura: [255, 102, 196],
    solar: [255, 183, 3],
    hyperpop: [163, 230, 53],
    titanium: [240, 240, 245]
  };

  function applyTheme(themeId) {
    if (!THEME_COLORS[themeId]) themeId = 'onyx';
    document.documentElement.setAttribute('data-theme', themeId);
    try {
      localStorage.setItem('sc_theme', themeId);
    } catch (_) {}

    document.querySelectorAll('.theme-card').forEach(card => {
      if (card.dataset.themeId === themeId) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    const rgb = THEME_COLORS[themeId] || [255, 85, 0];
    if (window.setSmokeThemeColor) {
      window.setSmokeThemeColor(rgb[0], rgb[1], rgb[2]);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CUSTOM FRAMELESS WINDOW TITLEBAR (Bento Glass CSD)
  // ═══════════════════════════════════════════════════════════════════════
  function initCustomTitlebar() {
    const btnMin = document.getElementById('titlebar-btn-min');
    const btnMax = document.getElementById('titlebar-btn-max');
    const btnClose = document.getElementById('titlebar-btn-close');
    const dragRegion = document.getElementById('titlebar-drag-region');
    const iconMax = document.getElementById('titlebar-icon-max');
    let isMaximized = false;

    function postIpc(action) {
      if (window.ipc && typeof window.ipc.postMessage === 'function') {
        window.ipc.postMessage(action);
        return true;
      }
      return false;
    }

    if (btnMin) {
      btnMin.addEventListener('click', () => {
        postIpc('window:minimize');
      });
    }

    function toggleMaximize() {
      postIpc('window:maximize');
      isMaximized = !isMaximized;
      document.body.classList.toggle('is-maximized', isMaximized);
      if (iconMax) {
        if (isMaximized) {
          // Restore (double-window icon)
          iconMax.innerHTML = '<path d="M3.5 1.5h6v6h-6z" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M1.5 3.5h6v6h-6z" fill="none" stroke="currentColor" stroke-width="1.1"/>';
        } else {
          // Maximize (single-square icon)
          iconMax.innerHTML = '<rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1.2"/>';
        }
      }
    }

    if (btnMax) {
      btnMax.addEventListener('click', toggleMaximize);
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        const sent = postIpc('window:close');
        if (!sent) {
          fetch('/api/window/close', { method: 'POST' }).catch(() => {});
          window.close();
        }
      });
    }

    if (dragRegion) {
      dragRegion.addEventListener('mousedown', (e) => {
        if (e.buttons === 1 && e.detail === 1) {
          postIpc('window:drag');
        }
      });
      dragRegion.addEventListener('dblclick', () => {
        toggleMaximize();
      });
    }
  }

  function initThemes() {
    let saved = 'onyx';
    try {
      saved = localStorage.getItem('sc_theme') || 'onyx';
    } catch (_) {}
    applyTheme(saved);

    document.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.themeId;
        applyTheme(id);
        showToast(`🎨 Color theme applied: ${card.querySelector('.theme-title span')?.textContent || id}`);
      });
    });

    const btnThemeModal = document.getElementById('btn-theme-modal');
    const themeModalOverlay = document.getElementById('theme-modal-overlay');
    const btnCloseThemeModal = document.getElementById('btn-close-theme-modal');

    if (btnThemeModal && themeModalOverlay) {
      btnThemeModal.addEventListener('click', () => {
        themeModalOverlay.classList.add('open');
      });
      if (btnCloseThemeModal) {
        btnCloseThemeModal.addEventListener('click', () => {
          themeModalOverlay.classList.remove('open');
        });
      }
      themeModalOverlay.addEventListener('click', (e) => {
        if (e.target === themeModalOverlay) themeModalOverlay.classList.remove('open');
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXTENSIONS HUB
  // ═══════════════════════════════════════════════════════════════════════
  function initExtensionsHub() {
    const btnExtModal = document.getElementById('btn-extensions-modal');
    const extModalOverlay = document.getElementById('extensions-modal-overlay');
    const btnCloseExtModal = document.getElementById('btn-close-extensions-modal');

    if (btnExtModal && extModalOverlay) {
      btnExtModal.addEventListener('click', () => {
        extModalOverlay.classList.add('open');
      });
      if (btnCloseExtModal) {
        btnCloseExtModal.addEventListener('click', () => {
          extModalOverlay.classList.remove('open');
        });
      }
      extModalOverlay.addEventListener('click', (e) => {
        if (e.target === extModalOverlay) extModalOverlay.classList.remove('open');
      });
    }

    document.getElementById('ext-btn-open-lyrics')?.addEventListener('click', () => {
      extModalOverlay.classList.remove('open');
      openLyricsOverlay();
    });
    document.getElementById('ext-btn-open-sleep')?.addEventListener('click', () => {
      extModalOverlay.classList.remove('open');
      document.getElementById('sleep-modal-overlay')?.classList.add('open');
    });
    document.getElementById('ext-btn-open-fx')?.addEventListener('click', () => {
      extModalOverlay.classList.remove('open');
      document.getElementById('fx-modal-overlay')?.classList.add('open');
    });
    document.getElementById('ext-btn-open-looper')?.addEventListener('click', () => {
      extModalOverlay.classList.remove('open');
      document.getElementById('looper-modal-overlay')?.classList.add('open');
    });
    document.getElementById('ext-btn-open-card')?.addEventListener('click', () => {
      extModalOverlay.classList.remove('open');
      openCardGenerator();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXTENSION 1: SYNCED LYRICS & KARAOKE ENGINE
  // ═══════════════════════════════════════════════════════════════════════
  let lyricsLines = [];
  let lyricsCurrentTrackId = null;
  let activeLyricIndex = -1;

  async function openLyricsOverlay() {
    const overlay = document.getElementById('lyrics-overlay');
    if (!overlay) return;
    overlay.classList.add('open');

    const curTrack = currentIndex >= 0 ? queue[currentIndex] : null;
    if (!curTrack) {
      document.getElementById('lyrics-container').innerHTML = '<div class="lyrics-empty">Play a track to view lyrics and karaoke</div>';
      return;
    }

    document.getElementById('lyrics-title').textContent = curTrack.title;
    document.getElementById('lyrics-artist').textContent = curTrack.artist;
    document.getElementById('lyrics-art').src = curTrack.artwork_url || DEFAULT_ART;

    if (lyricsCurrentTrackId !== curTrack.id) {
      await loadLyricsForTrack(curTrack);
    }
  }

  async function loadLyricsForTrack(track) {
    lyricsCurrentTrackId = track.id;
    lyricsLines = [];
    activeLyricIndex = -1;
    const container = document.getElementById('lyrics-container');
    const badge = document.getElementById('lyrics-source-badge');
    container.innerHTML = '<div class="lyrics-empty">⚡ Searching lyrics in LRCLIB database...</div>';

    try {
      const cleanTitle = track.title.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();
      const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(track.artist)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.syncedLyrics) {
          parseLrc(data.syncedLyrics);
          if (badge) badge.textContent = '⚡ Synced LRCLIB';
          renderLyricsLines();
          return;
        } else if (data.plainLyrics) {
          generateTimedLinesFromPlain(data.plainLyrics, track.duration_ms ? track.duration_ms / 1000 : 180);
          if (badge) badge.textContent = '📜 Plain Lyrics Timed';
          renderLyricsLines();
          return;
        }
      }
    } catch (e) {
      console.warn('LRCLIB query error:', e);
    }

    // Fallback: Rhythmic karaoke sequence
    generateFallbackLyrics(track);
    if (badge) badge.textContent = '✨ Acoustic Rhythm Mode';
    renderLyricsLines();
  }

  function parseLrc(lrcText) {
    const lines = lrcText.split('\n');
    lyricsLines = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
    for (const line of lines) {
      const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim();
      if (!text) continue;
      timeRegex.lastIndex = 0;
      let match;
      while ((match = timeRegex.exec(line)) !== null) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const ms = parseFloat('0.' + match[3]);
        const time = min * 60 + sec + ms;
        lyricsLines.push({ time, text });
      }
    }
    lyricsLines.sort((a, b) => a.time - b.time);
  }

  function generateTimedLinesFromPlain(plainText, totalDuration) {
    const rawLines = plainText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (rawLines.length === 0) return;
    const step = Math.max(3, (totalDuration - 10) / rawLines.length);
    lyricsLines = rawLines.map((text, i) => ({
      time: 4 + i * step,
      text
    }));
  }

  function generateFallbackLyrics(track) {
    const totalDuration = track.duration_ms ? track.duration_ms / 1000 : (audio.duration || 180);
    const phrases = [
      `♪ [Intro — ${track.artist}] ♪`,
      `Lost in the frequencies, crystalline sound`,
      `Neon light waves cutting through the night city`,
      `Pure sub-bass pulsing to the rhythm`,
      `SoundCloud Ultimate • Lossless stream active`,
      `♪ [Main Beat & Drop] ♪`,
      `Turn the volume up, dissolving in the melody`,
      `Studio-grade balance, pure harmonics`,
      `♪ [Bridge & Harmonic Progression] ♪`,
      `Echoes in the silence, frequencies align`,
      `Music speaks louder than words`,
      `♪ [Outro — Fade Out] ♪`
    ];
    const step = Math.max(8, totalDuration / (phrases.length + 1));
    lyricsLines = phrases.map((text, i) => ({
      time: 2 + i * step,
      text
    }));
  }

  function renderLyricsLines() {
    const container = document.getElementById('lyrics-container');
    if (lyricsLines.length === 0) {
      container.innerHTML = '<div class="lyrics-empty">Lyrics not found for this track</div>';
      return;
    }
    container.innerHTML = lyricsLines.map((l, idx) => `
      <div class="lyrics-line" data-idx="${idx}" data-time="${l.time}">
        ${escapeHtml(l.text)}
      </div>
    `).join('');

    container.querySelectorAll('.lyrics-line').forEach(el => {
      el.addEventListener('click', () => {
        const t = parseFloat(el.dataset.time);
        if (!isNaN(t)) {
          audio.currentTime = t;
        }
      });
    });
  }

  function updateLyricsSync(currentTime) {
    if (lyricsLines.length === 0) return;
    const overlay = document.getElementById('lyrics-overlay');
    if (!overlay || !overlay.classList.contains('open')) return;

    let idx = -1;
    for (let i = 0; i < lyricsLines.length; i++) {
      if (currentTime >= lyricsLines[i].time) {
        idx = i;
      } else {
        break;
      }
    }

    if (idx !== activeLyricIndex) {
      activeLyricIndex = idx;
      const lines = document.querySelectorAll('.lyrics-line');
      lines.forEach((el, i) => {
        if (i === activeLyricIndex) {
          el.classList.add('active');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          el.classList.remove('active');
        }
      });
    }
  }

  function initLyricsEngine() {
    document.getElementById('btn-lyrics-toggle')?.addEventListener('click', openLyricsOverlay);
    document.getElementById('btn-close-lyrics')?.addEventListener('click', () => {
      document.getElementById('lyrics-overlay')?.classList.remove('open');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXTENSION 2: SMART SLEEP TIMER
  // ═══════════════════════════════════════════════════════════════════════
  let sleepTimerInterval = null;
  let sleepTargetTime = null;
  let sleepTargetType = null;
  let preFadeVolume = null;

  function setSleepTimer(minutesOrType) {
    cancelSleepTimer();
    const badge = document.getElementById('sleep-badge');
    const cancelBtn = document.getElementById('btn-cancel-sleep');

    if (minutesOrType === 'track') {
      sleepTargetType = 'track';
      if (badge) {
        badge.textContent = 'Track';
        badge.style.display = 'inline-flex';
      }
      if (cancelBtn) cancelBtn.style.display = 'block';
      showToast('🌙 Music will stop after the current track finishes');
      return;
    }

    const mins = parseInt(minutesOrType, 10);
    if (isNaN(mins)) return;
    sleepTargetType = 'minutes';
    sleepTargetTime = Date.now() + mins * 60 * 1000;
    preFadeVolume = currentVolume;
    if (badge) {
      badge.textContent = `${mins}m`;
      badge.style.display = 'inline-flex';
    }
    if (cancelBtn) cancelBtn.style.display = 'block';

    sleepTimerInterval = setInterval(() => {
      const remainingMs = sleepTargetTime - Date.now();
      if (remainingMs <= 0) {
        cancelSleepTimer();
        audio.pause();
        isPlaying = false;
        updatePlayButtonUI(false);
        setVolume(preFadeVolume || 0.8);
        showToast('🌙 Sleep timer triggered: music stopped');
      } else {
        const totalSec = Math.floor(remainingMs / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        if (badge) badge.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;

        if (totalSec <= 30 && preFadeVolume !== null) {
          const ratio = Math.max(0, totalSec / 30);
          setVolume(preFadeVolume * ratio, true);
        }
      }
    }, 1000);

    showToast(`🌙 Sleep timer set for ${mins} minutes`);
  }

  function cancelSleepTimer() {
    if (sleepTimerInterval) {
      clearInterval(sleepTimerInterval);
      sleepTimerInterval = null;
    }
    if (preFadeVolume !== null) {
      setVolume(preFadeVolume, true);
      preFadeVolume = null;
    }
    sleepTargetTime = null;
    sleepTargetType = null;
    const badge = document.getElementById('sleep-badge');
    const cancelBtn = document.getElementById('btn-cancel-sleep');
    if (badge) badge.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
    document.querySelectorAll('.sleep-chip').forEach(c => c.classList.remove('active'));
  }

  function initSleepTimer() {
    const overlay = document.getElementById('sleep-modal-overlay');
    document.getElementById('btn-sleep-toggle')?.addEventListener('click', () => {
      overlay?.classList.add('open');
    });
    document.getElementById('btn-close-sleep-modal')?.addEventListener('click', () => {
      overlay?.classList.remove('open');
    });
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });

    document.querySelectorAll('.sleep-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.sleep-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const minVal = chip.dataset.minutes;
        setSleepTimer(minVal);
        setTimeout(() => overlay?.classList.remove('open'), 400);
      });
    });

    document.getElementById('btn-cancel-sleep')?.addEventListener('click', () => {
      cancelSleepTimer();
      showToast('🌙 Sleep timer cancelled');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXTENSION 3: AUDIO FX STUDIO (8D AUDIO, SPEED & NIGHTCORE)
  // ═══════════════════════════════════════════════════════════════════════
  let is8DActive = false;
  let panAngle = 0;
  let orbitAnimId = null;

  function init8DAudio() {
    initEqualizer();
  }

  function toggle8D(active) {
    init8DAudio();
    is8DActive = active;
    const dot = document.getElementById('radar-orbit-dot');

    if (active) {
      function animateOrbit() {
        if (!is8DActive) return;
        panAngle += 0.025;
        const panVal = Math.sin(panAngle);
        if (stereoPanner && audioCtx) {
          stereoPanner.pan.setValueAtTime(panVal, audioCtx.currentTime);
        }
        if (dot) {
          const radius = 42;
          const x = Math.cos(panAngle) * radius;
          const y = Math.sin(panAngle) * radius;
          dot.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        }
        orbitAnimId = requestAnimationFrame(animateOrbit);
      }
      orbitAnimId = requestAnimationFrame(animateOrbit);
      showToast('🎧 8D Audio enabled (360° binaural spatial rotation)');
    } else {
      if (orbitAnimId) cancelAnimationFrame(orbitAnimId);
      if (stereoPanner && audioCtx) stereoPanner.pan.setValueAtTime(0, audioCtx.currentTime);
      if (dot) dot.style.transform = 'translate(-50%, -50%)';
      showToast('🎧 8D Audio disabled');
    }
  }

  function setPlaybackSpeed(rate) {
    audio.playbackRate = rate;
    const label = document.getElementById('fx-speed-label');
    const slider = document.getElementById('fx-speed-slider');
    if (label) label.textContent = `${rate.toFixed(2)}x`;
    if (slider) slider.value = rate;
  }

  function initAudioFxStudio() {
    const overlay = document.getElementById('fx-modal-overlay');
    document.getElementById('btn-fx-toggle')?.addEventListener('click', () => {
      overlay?.classList.add('open');
    });
    document.getElementById('btn-close-fx-modal')?.addEventListener('click', () => {
      overlay?.classList.remove('open');
    });
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });

    const toggle8dInput = document.getElementById('fx-8d-toggle');
    toggle8dInput?.addEventListener('change', (e) => {
      toggle8D(e.target.checked);
    });

    const slider = document.getElementById('fx-speed-slider');
    slider?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      setPlaybackSpeed(val);
      document.querySelectorAll('.speed-chip').forEach(c => c.classList.remove('active'));
    });

    document.querySelectorAll('.speed-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.speed-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const spd = parseFloat(chip.dataset.speed);
        setPlaybackSpeed(spd);
        showToast(`⚡ Speed changed: ${spd}x`);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXTENSION 4: A-B PRECISION LOOPER
  // ═══════════════════════════════════════════════════════════════════════
  let loopPointA = null;
  let loopPointB = null;
  let isLoopActive = false;

  function setLoopA() {
    loopPointA = audio.currentTime;
    document.getElementById('loop-time-a').textContent = formatTime(loopPointA);
    updateLoopMarkersUI();
    showToast(`🔁 Loop point [A] set: ${formatTime(loopPointA)}`);
  }

  function setLoopB() {
    loopPointB = audio.currentTime;
    document.getElementById('loop-time-b').textContent = formatTime(loopPointB);
    updateLoopMarkersUI();
    showToast(`🔁 Loop point [B] set: ${formatTime(loopPointB)}`);
  }

  function toggleLoopActive() {
    if (loopPointA === null || loopPointB === null) {
      showToast('⚠️ Please set both loop points [A] and [B] first');
      return;
    }
    if (loopPointA >= loopPointB) {
      const temp = loopPointA;
      loopPointA = loopPointB;
      loopPointB = temp;
      document.getElementById('loop-time-a').textContent = formatTime(loopPointA);
      document.getElementById('loop-time-b').textContent = formatTime(loopPointB);
    }
    isLoopActive = !isLoopActive;
    const btn = document.getElementById('btn-toggle-loop-active');
    const dockBtn = document.getElementById('btn-looper-toggle');
    if (isLoopActive) {
      if (btn) {
        btn.classList.add('active');
        btn.innerHTML = '🔁 Loop Active';
      }
      if (dockBtn) dockBtn.style.color = '#00FF66';
      if (audio.currentTime < loopPointA || audio.currentTime > loopPointB) {
        audio.currentTime = loopPointA;
      }
      showToast('🔁 A-B Looper active!');
    } else {
      if (btn) {
        btn.classList.remove('active');
        btn.innerHTML = '🔁 Enable Loop';
      }
      if (dockBtn) dockBtn.style.color = '';
      showToast('🔁 A-B Looper disabled');
    }
    updateLoopMarkersUI();
  }

  function clearLoop() {
    loopPointA = null;
    loopPointB = null;
    isLoopActive = false;
    document.getElementById('loop-time-a').textContent = '--:--';
    document.getElementById('loop-time-b').textContent = '--:--';
    const btn = document.getElementById('btn-toggle-loop-active');
    if (btn) {
      btn.classList.remove('active');
      btn.innerHTML = '🔁 Enable Loop';
    }
    const dockBtn = document.getElementById('btn-looper-toggle');
    if (dockBtn) dockBtn.style.color = '';
    updateLoopMarkersUI();
    showToast('🔁 Loop points cleared');
  }

  function updateLoopMarkersUI() {
    const dur = audio.duration;
    const markerA = document.getElementById('loop-marker-a');
    const markerB = document.getElementById('loop-marker-b');
    const region = document.getElementById('loop-region');
    if (!dur || !markerA || !markerB || !region) return;

    if (loopPointA !== null) {
      const pctA = (loopPointA / dur) * 100;
      markerA.style.left = `${pctA}%`;
      markerA.style.display = 'block';
    } else {
      markerA.style.display = 'none';
    }

    if (loopPointB !== null) {
      const pctB = (loopPointB / dur) * 100;
      markerB.style.left = `${pctB}%`;
      markerB.style.display = 'block';
    } else {
      markerB.style.display = 'none';
    }

    if (loopPointA !== null && loopPointB !== null && isLoopActive) {
      const startPct = Math.min(loopPointA, loopPointB) / dur * 100;
      const widthPct = Math.abs(loopPointB - loopPointA) / dur * 100;
      region.style.left = `${startPct}%`;
      region.style.width = `${widthPct}%`;
      region.style.display = 'block';
    } else {
      region.style.display = 'none';
    }
  }

  function checkLooper(current) {
    if (isLoopActive && loopPointA !== null && loopPointB !== null) {
      const start = Math.min(loopPointA, loopPointB);
      const end = Math.max(loopPointA, loopPointB);
      if (current >= end || current < start - 0.2) {
        audio.currentTime = start;
      }
    }
  }

  function initAbLooper() {
    const overlay = document.getElementById('looper-modal-overlay');
    document.getElementById('btn-looper-toggle')?.addEventListener('click', () => {
      overlay?.classList.add('open');
    });
    document.getElementById('btn-close-looper-modal')?.addEventListener('click', () => {
      overlay?.classList.remove('open');
    });
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });

    document.getElementById('btn-set-loop-a')?.addEventListener('click', setLoopA);
    document.getElementById('btn-set-loop-b')?.addEventListener('click', setLoopB);
    document.getElementById('btn-toggle-loop-active')?.addEventListener('click', toggleLoopActive);
    document.getElementById('btn-clear-loop')?.addEventListener('click', clearLoop);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXTENSION 5: BENTO TRACK CARD GENERATOR
  // ═══════════════════════════════════════════════════════════════════════
  function openCardGenerator() {
    const overlay = document.getElementById('card-modal-overlay');
    if (!overlay) return;
    overlay.classList.add('open');
    drawTrackCard();
  }

  function drawTrackCard() {
    const canvas = document.getElementById('card-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 800;
    const h = canvas.height = 420;

    const track = currentIndex >= 0 ? queue[currentIndex] : {
      title: 'SoundCloud Ultimate Music',
      artist: 'SoundCloud Ultimate',
      duration_ms: 215000,
      artwork_url: ''
    };

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'onyx';
    const rgb = THEME_COLORS[currentTheme] || [255, 85, 0];

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0E0C14');
    bgGrad.addColorStop(1, '#050407');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 28);
    ctx.fill();

    // Ambient Radial Glow
    const glowGrad = ctx.createRadialGradient(w * 0.2, h * 0.35, 10, w * 0.2, h * 0.35, 260);
    glowGrad.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.3)`);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.45)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 28);
    ctx.stroke();

    const renderCardContent = () => {
      // Top Right Badge
      ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.15)`;
      ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.4)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(w - 245, 45, 205, 36, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      ctx.font = 'bold 13px -apple-system, sans-serif';
      ctx.fillText('⚡ SOUNDCLOUD ULTIMATE', w - 230, 68);

      // Track Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px -apple-system, sans-serif';
      let title = track.title;
      if (title.length > 30) title = title.substring(0, 28) + '...';
      ctx.fillText(title, 230, 105);

      // Artist
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '500 18px -apple-system, sans-serif';
      ctx.fillText(track.artist, 230, 140);

      // Metadata
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '12px -apple-system, sans-serif';
      const durStr = track.duration_ms ? formatTime(track.duration_ms / 1000) : '3:45';
      ctx.fillText(`HQ Audio • ${durStr} • Zapret Active • Lossless Stream`, 230, 178);

      // Stylized Waveform Bars
      const waveStartY = 280;
      const waveHeight = 65;
      const barCount = 48;
      const barWidth = 10;
      const barGap = 5;
      const startX = 40;

      for (let i = 0; i < barCount; i++) {
        const hNorm = 0.2 + 0.8 * Math.abs(Math.sin((i / barCount) * Math.PI * 3 + 1.2) * Math.cos(i * 0.4));
        const curBarH = Math.max(8, waveHeight * hNorm);
        const bx = startX + i * (barWidth + barGap);
        const by = waveStartY + (waveHeight - curBarH) / 2;

        const barGrad = ctx.createLinearGradient(bx, by, bx, by + curBarH);
        barGrad.addColorStop(0, `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
        barGrad.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.3)`);
        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(bx, by, barWidth, curBarH, 4);
        ctx.fill();
      }

      // Footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillText('github.com/masyaslasher/soundcloud-ultimate', 40, h - 30);
      ctx.fillText('AMOLED Bento Glass Edition', w - 210, h - 30);
    };

    if (track.artwork_url) {
      const artImg = new Image();
      artImg.crossOrigin = 'anonymous';
      artImg.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(40, 50, 160, 160, 18);
        ctx.clip();
        ctx.drawImage(artImg, 40, 50, 160, 160);
        ctx.restore();

        ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.6)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(40, 50, 160, 160, 18);
        ctx.stroke();

        renderCardContent();
      };
      artImg.onerror = () => {
        ctx.fillStyle = '#1C1A24';
        ctx.beginPath();
        ctx.roundRect(40, 50, 160, 160, 18);
        ctx.fill();
        renderCardContent();
      };
      artImg.src = track.artwork_url;
    } else {
      ctx.fillStyle = '#1C1A24';
      ctx.beginPath();
      ctx.roundRect(40, 50, 160, 160, 18);
      ctx.fill();
      renderCardContent();
    }
  }

  function initCardGenerator() {
    const overlay = document.getElementById('card-modal-overlay');
    document.getElementById('dock-card-btn')?.addEventListener('click', openCardGenerator);
    document.getElementById('btn-close-card-modal')?.addEventListener('click', () => {
      overlay?.classList.remove('open');
    });
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });

    document.getElementById('btn-copy-card')?.addEventListener('click', () => {
      const canvas = document.getElementById('card-canvas');
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (!blob) return;
        try {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]).then(() => {
            showToast('📋 Card copied to clipboard!');
          }).catch(e => {
            console.warn('Clipboard write failed:', e);
            showToast('⚠️ Could not copy, please use "Download PNG"');
          });
        } catch (e) {
          showToast('⚠️ Please save via "Download PNG"');
        }
      });
    });

    document.getElementById('btn-download-card')?.addEventListener('click', () => {
      const canvas = document.getElementById('card-canvas');
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `SoundCloud-Card-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('💾 Card image saved!');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXTENSION 6: DISCORD RICH PRESENCE (LINUX & WINDOWS)
  // ═══════════════════════════════════════════════════════════════════════
  let lastDiscordSync = 0;
  let discordSyncTimeout = null;

  async function syncDiscordRPC(track, playing) {
    if (!track) return;
    const toggle = document.getElementById('discord-rpc-toggle');
    if (toggle && !toggle.checked) return;

    clearTimeout(discordSyncTimeout);
    const now = Date.now();
    if (now - lastDiscordSync < 500) {
      discordSyncTimeout = setTimeout(() => syncDiscordRPC(track, playing), 500);
      return;
    }
    lastDiscordSync = now;

    const curTime = audio ? (audio.currentTime || 0) : 0;
    const dur = (audio && audio.duration && !isNaN(audio.duration) && audio.duration > 0)
      ? audio.duration
      : ((track.duration_ms ? track.duration_ms / 1000 : 0) || (track.duration || 0));

    const payload = {
      title: track.title || 'SoundCloud Track',
      artist: track.artist || track.user?.username || 'SoundCloud Artist',
      duration_secs: Math.round(dur),
      current_time_secs: Math.round(curTime),
      is_playing: !!playing,
      permalink_url: track.permalink_url || null,
      artwork_url: track.artwork_url || null
    };

    // Android Native Bridge: Update MediaStyle Lock Screen Notification & Foreground Service
    if (window.AndroidBridge && window.AndroidBridge.updatePlayback) {
      try {
        window.AndroidBridge.updatePlayback(
          payload.title,
          payload.artist,
          payload.artwork_url || '',
          !!playing,
          Math.round(dur * 1000),
          Math.round(curTime * 1000)
        );
      } catch (e) {}
    }

    try {
      const res = await fetch('/api/discord/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        checkDiscordStatus();
      }
    } catch (e) {
      console.debug('Discord RPC sync failed:', e);
    }
  }

  async function clearDiscordRPC() {
    if (window.AndroidBridge && window.AndroidBridge.updatePlayback) {
      try {
        window.AndroidBridge.updatePlayback('', '', '', false, 0, 0);
      } catch (_) {}
    }
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'none';
      } catch (_) {}
    }
    try {
      await fetch('/api/discord/clear', { method: 'POST' });
    } catch (_) {}
  }

  async function checkDiscordStatus() {
    try {
      const res = await fetch('/api/discord/status');
      if (!res.ok) return;
      const st = await res.json();
      const toggle = document.getElementById('discord-rpc-toggle');
      if (toggle && typeof st.enabled === 'boolean') {
        toggle.checked = st.enabled;
      }
      updateDiscordBadge(st.connected, st.username);
    } catch (e) {}
  }

  function updateDiscordBadge(connected, username) {
    const badge = document.getElementById('discord-badge-status');
    const userInfo = document.getElementById('discord-user-info');
    const dockBtn = document.getElementById('dock-discord-btn');
    if (badge) {
      if (connected) {
        badge.textContent = 'Active';
        badge.style.background = 'rgba(87, 242, 135, 0.2)';
        badge.style.color = '#57F287';
        badge.style.borderColor = 'rgba(87, 242, 135, 0.4)';
      } else {
        badge.textContent = 'Standby';
        badge.style.background = 'rgba(255, 255, 255, 0.08)';
        badge.style.color = 'var(--text-dim)';
        badge.style.borderColor = 'rgba(255, 255, 255, 0.12)';
      }
    }
    if (userInfo) {
      if (connected && username) {
        userInfo.textContent = `Connected as @${username} (Linux & Windows IPC)`;
        userInfo.style.color = '#5865F2';
      } else {
        userInfo.textContent = 'Waiting for Discord desktop app...';
        userInfo.style.color = 'var(--text-dim)';
      }
    }
    if (dockBtn) {
      dockBtn.style.opacity = connected ? '1' : '0.45';
      dockBtn.title = connected && username ? `Discord RPC: Connected as @${username}` : 'Discord Rich Presence (Click to view)';
    }
  }

  function initDiscordRPC() {
    const dockBtn = document.getElementById('dock-discord-btn');
    if (dockBtn) {
      dockBtn.addEventListener('click', () => {
        document.getElementById('extensions-modal-overlay')?.classList.add('open');
      });
    }

    const toggle = document.getElementById('discord-rpc-toggle');
    if (toggle) {
      toggle.addEventListener('change', async () => {
        try {
          const res = await fetch('/api/discord/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: toggle.checked })
          });
          const st = await res.json();
          updateDiscordBadge(st.connected, st.username);
          if (toggle.checked) {
            showToast('Discord Rich Presence enabled');
            if (currentIndex >= 0 && queue[currentIndex]) {
              syncDiscordRPC(queue[currentIndex], isPlaying);
            }
          } else {
            showToast('Discord Rich Presence disabled');
          }
        } catch (e) {
          console.warn('Failed to toggle Discord RPC:', e);
        }
      });
    }

    // Check status immediately and poll every 8 seconds
    checkDiscordStatus();
    setInterval(checkDiscordStatus, 8000);
  }

  // Expose API
  window.scApp = {
    openArtistProfile,
    openPlaylistInspector,
    openCommentsModal,
    openLyricsOverlay,
    openCardGenerator,
    syncDiscordRPC,
    applyTheme,
    setSleepTimer,
    toggle8D,
    setPlaybackSpeed,
    startTrackRadio,
    loadMyHistory,
    loadMyLikes,
    loadMyPlaylists,
    loadMyStream
  };

  // Init
  initCustomTitlebar();
  initThemes();
  initLanguageSwitcher();

  // ═══════════════════════════════════════════════════════════════════════
  // MULTI-LANGUAGE SYSTEM (EN, RU, DE, FR, JA, UK, PL, HY)
  // Integrated directly into User Avatar Dropdown
  // ═══════════════════════════════════════════════════════════════════════

  function initLanguageSwitcher() {
    currentLang = localStorage.getItem("lang") || "en";
    if (!TRANSLATIONS[currentLang]) currentLang = "en";

    function applyLanguage(lang) {
      if (!TRANSLATIONS[lang]) lang = "en";
      currentLang = lang;
      localStorage.setItem("lang", lang);
      const t = TRANSLATIONS[lang];

      // Update dropdown items
      const txtDropLangHeader = document.getElementById("txt-drop-lang-header");
      if (txtDropLangHeader) txtDropLangHeader.textContent = "🌐 " + (t.drop_lang_header || "Language / Язык");

      const txtDropLogin = document.getElementById("txt-dropdown-login");
      if (txtDropLogin) txtDropLogin.textContent = t.dropdown_login || "⚡ Sign In / Войти";

      const txtMyProf = document.getElementById("txt-my-profile");
      if (txtMyProf) txtMyProf.textContent = t.my_profile;

      const txtLogout = document.getElementById("txt-logout");
      if (txtLogout) txtLogout.textContent = t.logout;

      if (!currentUser && userName) {
        userName.textContent = t.guest_user || "Guest";
      }

      // Update active highlight on dropdown language list
      document.querySelectorAll("#dropdown-lang-list .dropdown-lang-item").forEach(item => {
        const code = item.getAttribute("data-lang");
        item.classList.toggle("active", code === lang);
      });

      // Update Header & Nav
      const searchInp = document.getElementById("search-input");
      const txtThemes = document.getElementById("txt-themes-btn");
      const txtExt = document.getElementById("txt-extensions-btn");
      const chipTrend = document.getElementById("chip-trending");
      const chipLk = document.getElementById("chip-likes");
      const chipPl = document.getElementById("chip-playlists");
      const chipSt = document.getElementById("chip-stream");
      const chipHs = document.getElementById("chip-history");
      const heroTag = document.getElementById("hero-tag");
      const txtListenNow = document.getElementById("txt-listen-now");
      const txtQueueTitle = document.getElementById("txt-queue-title");

      if (searchInp) searchInp.placeholder = t.search_placeholder;
      if (txtThemes) txtThemes.textContent = t.themes_btn;
      if (txtExt) txtExt.textContent = t.extensions_btn;
      if (chipTrend) chipTrend.textContent = t.chip_trending;
      if (chipLk) chipLk.textContent = t.chip_likes;
      if (chipPl) chipPl.textContent = t.chip_playlists;
      if (chipSt) chipSt.textContent = t.chip_stream;
      if (chipHs) chipHs.textContent = t.chip_history;
      if (heroTag) heroTag.textContent = t.hero_tag;
      if (txtListenNow) txtListenNow.textContent = t.listen_now;
      if (txtQueueTitle) txtQueueTitle.textContent = t.queue_title;
      if (!isPlaying && currentIndex === -1 && playerTitle) playerTitle.textContent = t.select_track;

      // Translate Genre Chips in chips-bar
      const genreKeys = ['phonk', 'electronic', 'hiphoprap', 'ambient', 'rock', 'danceedm', 'rbsoul', 'indie'];
      genreKeys.forEach(g => {
        const el = document.getElementById(`chip-genre-${g}`);
        if (el && t.genres && t.genres[g]) {
          el.textContent = t.genres[g];
        }
      });

      // Update Current Active Tab Title immediately
      renderActiveTabTitle();

      // Refresh empty state if visible
      if (currentTab.type === 'lib') {
        if (currentTab.val === 'likes' && !currentUser && getLocalLikes().length === 0) {
          renderEmptyLikesState();
        } else if (currentTab.val === 'history' && !currentUser && getLocalHistory().length === 0) {
          renderEmptyHistoryState();
        } else if (currentTab.val === 'stream' && !currentUser) {
          renderEmptyStreamState();
        }
      }

      // Modal elements
      const txtAuthTitle = document.getElementById("txt-auth-modal-title");
      const btn1Click = document.getElementById("btn-import-browser");
      const txtAuthHelpHead = document.getElementById("txt-auth-help-head");
      const txtAuthHelpBody = document.getElementById("txt-auth-help-body");
      const btnOpenSc = document.getElementById("btn-open-sc-signin");
      const txtAuthDivider = document.getElementById("txt-auth-divider");
      const btnSubmitToken = document.getElementById("btn-submit-token");
      const txtThemeTitle = document.getElementById("txt-theme-modal-title");
      const txtExtTitle = document.getElementById("txt-ext-modal-title");
      const txtExtDiscordName = document.getElementById("txt-ext-discord-name");
      const txtExtDiscordDesc = document.getElementById("txt-ext-discord-desc");

      const txtExtLyricsName = document.getElementById("txt-ext-lyrics-name");
      const txtExtLyricsDesc = document.getElementById("txt-ext-lyrics-desc");
      const txtExtSleepName = document.getElementById("txt-ext-sleep-name");
      const txtExtSleepDesc = document.getElementById("txt-ext-sleep-desc");
      const txtExtFxName = document.getElementById("txt-ext-fx-name");
      const txtExtFxDesc = document.getElementById("txt-ext-fx-desc");
      const txtExtLooperName = document.getElementById("txt-ext-looper-name");
      const txtExtLooperDesc = document.getElementById("txt-ext-looper-desc");
      const txtExtCardName = document.getElementById("txt-ext-card-name");
      const txtExtCardDesc = document.getElementById("txt-ext-card-desc");

      const txtEqTitle = document.getElementById("txt-eq-title");
      const txtCommentsTitle = document.getElementById("txt-comments-title");
      const commentInput = document.getElementById("new-comment-input");
      const btnSendComment = document.getElementById("btn-send-comment");
      const txtSleepTitle = document.getElementById("txt-sleep-modal-title");
      const txtSleepDesc = document.getElementById("txt-sleep-desc");
      const sleepChipTrack = document.getElementById("sleep-chip-track");
      const btnCancelSleep = document.getElementById("btn-cancel-sleep");
      const txtFxTitle = document.getElementById("txt-fx-modal-title");
      const txtRadarHint = document.getElementById("txt-radar-hint");
      const txtFxSpeedTitle = document.getElementById("txt-fx-speed-title");
      const speedChipNorm = document.getElementById("speed-chip-norm");
      const txtLooperTitle = document.getElementById("txt-looper-modal-title");
      const txtLooperDesc = document.getElementById("txt-looper-desc");
      const txtLoopStart = document.getElementById("txt-loop-start");
      const txtLoopEnd = document.getElementById("txt-loop-end");
      const txtBtnLoopActive = document.getElementById("txt-btn-loop-active");
      const txtBtnLoopClear = document.getElementById("txt-btn-loop-clear");
      const txtCardTitle = document.getElementById("txt-card-modal-title");
      const txtBtnCopyCard = document.getElementById("txt-btn-copy-card");
      const txtBtnDownloadCard = document.getElementById("txt-btn-download-card");

      const statTracks = document.getElementById("txt-stat-tracks");
      const statFollowers = document.getElementById("txt-stat-followers");
      const statLikes = document.getElementById("txt-stat-likes");
      const profTracksTitle = document.getElementById("txt-prof-tracks-title");
      const profPlTitle = document.getElementById("txt-prof-pl-title");
      const playPlaylist = document.getElementById("txt-play-playlist");

      if (txtAuthTitle) txtAuthTitle.textContent = t.auth_title;
      if (btn1Click) btn1Click.textContent = t.btn_import;
      if (txtAuthHelpHead) txtAuthHelpHead.textContent = t.auth_help_head;
      if (txtAuthHelpBody) txtAuthHelpBody.textContent = t.auth_help_body;
      if (btnOpenSc) btnOpenSc.textContent = t.btn_open_sc;
      if (txtAuthDivider) txtAuthDivider.textContent = t.auth_divider;
      if (btnSubmitToken) btnSubmitToken.textContent = t.btn_submit_token;
      if (txtThemeTitle) txtThemeTitle.textContent = t.theme_title;
      if (txtExtTitle) txtExtTitle.textContent = t.ext_title;
      if (txtExtDiscordName) txtExtDiscordName.textContent = t.ext_discord_name;
      if (txtExtDiscordDesc) txtExtDiscordDesc.textContent = t.ext_discord_desc;

      if (txtExtLyricsName) txtExtLyricsName.textContent = t.ext_lyrics_name;
      if (txtExtLyricsDesc) txtExtLyricsDesc.textContent = t.ext_lyrics_desc;
      if (txtExtSleepName) txtExtSleepName.textContent = t.ext_sleep_name;
      if (txtExtSleepDesc) txtExtSleepDesc.textContent = t.ext_sleep_desc;
      if (txtExtFxName) txtExtFxName.textContent = t.ext_fx_name;
      if (txtExtFxDesc) txtExtFxDesc.textContent = t.ext_fx_desc;
      if (txtExtLooperName) txtExtLooperName.textContent = t.ext_looper_name;
      if (txtExtLooperDesc) txtExtLooperDesc.textContent = t.ext_looper_desc;
      if (txtExtCardName) txtExtCardName.textContent = t.ext_card_name;
      if (txtExtCardDesc) txtExtCardDesc.textContent = t.ext_card_desc;

      if (txtEqTitle) txtEqTitle.textContent = t.eq_title;
      if (txtCommentsTitle) txtCommentsTitle.textContent = t.comments_title;
      if (commentInput) commentInput.placeholder = t.comment_placeholder;
      if (btnSendComment) btnSendComment.textContent = t.btn_send;
      if (txtSleepTitle) txtSleepTitle.textContent = t.sleep_title;
      if (txtSleepDesc) txtSleepDesc.textContent = t.sleep_desc;
      if (sleepChipTrack) sleepChipTrack.textContent = t.sleep_chip_track;
      if (btnCancelSleep) btnCancelSleep.textContent = t.btn_cancel_sleep;
      if (txtFxTitle) txtFxTitle.textContent = t.fx_title;
      if (txtRadarHint) txtRadarHint.textContent = t.radar_hint;
      if (txtFxSpeedTitle) txtFxSpeedTitle.textContent = t.fx_speed_title;
      if (speedChipNorm) speedChipNorm.textContent = t.speed_norm;
      if (txtLooperTitle) txtLooperTitle.textContent = t.looper_title;
      if (txtLooperDesc) txtLooperDesc.textContent = t.looper_desc;
      if (txtLoopStart) txtLoopStart.textContent = t.loop_start;
      if (txtLoopEnd) txtLoopEnd.textContent = t.loop_end;
      if (txtBtnLoopActive) txtBtnLoopActive.textContent = t.btn_loop_active;
      if (txtBtnLoopClear) txtBtnLoopClear.textContent = t.btn_loop_clear;
      if (txtCardTitle) txtCardTitle.textContent = t.card_title;
      if (txtBtnCopyCard) txtBtnCopyCard.textContent = t.btn_copy_card;
      if (txtBtnDownloadCard) txtBtnDownloadCard.textContent = t.btn_download_card;

      if (statTracks) statTracks.textContent = t.txt_stat_tracks;
      if (statFollowers) statFollowers.textContent = t.txt_stat_followers;
      if (statLikes) statLikes.textContent = t.txt_stat_likes;
      if (profTracksTitle) profTracksTitle.textContent = t.txt_prof_tracks_title;
      if (profPlTitle) profPlTitle.textContent = t.txt_prof_pl_title;
      if (playPlaylist) playPlaylist.textContent = t.txt_play_playlist;
    }

    // Dropdown language list click handlers
    document.querySelectorAll("#dropdown-lang-list .dropdown-lang-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const code = item.getAttribute("data-lang");
        if (code && TRANSLATIONS[code]) {
          applyLanguage(code);
          if (userDropdown) userDropdown.classList.remove("open");
          showToast(TRANSLATIONS[code].toast_lang_switched || TRANSLATIONS[code].toast_lang || ("Language: " + code.toUpperCase()));
        }
      });
    });

    // Alt + Shift + L shortcut toggles avatar dropdown for quick keyboard navigation
    window.addEventListener("keydown", (e) => {
      if (e.altKey && e.shiftKey && (e.key === "L" || e.key === "l" || e.key === "д" || e.key === "Д")) {
        if (userDropdown) userDropdown.classList.toggle("open");
      }
    });

    applyLanguage(currentLang);
  }

    initExtensionsHub();
  initLyricsEngine();
  initSleepTimer();
  initAudioFxStudio();
  initAbLooper();
  initCardGenerator();
  initDiscordRPC();

  // URL query params for direct modal/theme preview
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    if (themeParam) applyTheme(themeParam);
    const modalParam = urlParams.get('modal');
    if (modalParam === 'themes') document.getElementById('theme-modal-overlay')?.classList.add('open');
    if (modalParam === 'extensions') document.getElementById('extensions-modal-overlay')?.classList.add('open');
    if (modalParam === 'fx') document.getElementById('fx-modal-overlay')?.classList.add('open');
    if (modalParam === 'lyrics') openLyricsOverlay();
    if (modalParam === 'looper') document.getElementById('looper-modal-overlay')?.classList.add('open');
    if (modalParam === 'sleep') document.getElementById('sleep-modal-overlay')?.classList.add('open');
    if (modalParam === 'card') openCardGenerator();
  } catch (_) {}

  try {
    const savedVol = localStorage.getItem('sc_volume');
    if (savedVol !== null && !isNaN(parseFloat(savedVol))) {
      currentVolume = Math.max(0, Math.min(1, parseFloat(savedVol)));
    }
    const savedMuted = localStorage.getItem('sc_muted');
    if (savedMuted === '1') isMuted = true;
  } catch (_) {}

  // Expose global methods for Android Native Bridge and External controllers
  window.togglePlayPause = togglePlayPause;
  window.playNext = playNext;
  window.playPrev = playPrev;
  window.setVolume = setVolume;
  window.handleAndroidBack = function() {
    const openOverlay = document.querySelector('.modal-overlay.open, .bento-modal-overlay.open, #lyrics-overlay.open');
    if (openOverlay) {
      closeAllModals();
      return true;
    }
    if (userDropdown && userDropdown.classList.contains('open')) {
      userDropdown.classList.remove('open');
      return true;
    }
    if (currentTab.val !== 'all-music') {
      loadTrending('all-music');
      return true;
    }
    return false;
  };

  setVolume(currentVolume, true);
  checkSystemStatus();
  checkAuthStatus();
  loadTrending('all-music');
})();
