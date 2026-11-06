# ☁️ SoundCloud Ultimate — Suite

[![Release](https://img.shields.io/github/v/release/masyaslasher/soundcloud-ultimate?color=ff5500&logo=github)](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest)
[![Rust](https://img.shields.io/badge/Rust-1.85+-orange.svg?logo=rust)](https://www.rust-lang.org/)
[![Zapret Anti--DPI](https://img.shields.io/badge/Zapret%20Anti--DPI-Built--in%20%28No%20VPN%29-00E5FF.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platforms](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20Chrome-brightgreen.svg)]()
[![Design](https://img.shields.io/badge/Design-AMOLED%20Bento%20Glass-ff5500.svg)]()

<p align="center">
  <strong>🌐 Язык / Language:</strong>
  <a href="README.md">English</a> •
  <a href="README_RU.md"><strong>Русский</strong></a>
</p>

> **SoundCloud Ultimate** — ультимативный клиент нового поколения для прослушивания SoundCloud.
> Сочетает премиальный дизайн **AMOLED Bento Glass** (`#0A090E`, неоновые оранжевые лазерные акценты `#FF5500`), нативную скорость движка на Rust, встроенный 5-полосный студийный эквалайзер, 100% In-App социальную среду и **встроенный Zapret Anti-DPI обход блокировок для РФ без необходимости в стороннем VPN**.

---

## ⚡ Встроенный Zapret Anti-DPI (Работает в РФ без VPN!)

Приложение содержит полностью автономный встроенный Anti-DPI движок на чистом Rust (без установки драйверов WinDivert, ByeDPI или внешних утилит):
- 🛡️ **TLS ClientHello Record Splitting:** Разбивает начальный TLS-пакет на позиции `split-pos=2` со сбросом TCP-окна (`TCP_NODELAY` + 5ms push), в результате чего ТСПУ РКН не может обнаружить SNI заблокированных доменов (`*.sndcdn.com`, `api-v2.soundcloud.com`, `*.soundcloud.cloud`).
- 🌐 **Cloudflare & Google DoH (DNS-over-HTTPS):** Встроенный защищенный резолвер DNS через HTTPS, полностью предотвращающий DNS-спуфинг и подмену IP-адресов интернет-провайдерами.
- 🎵 **Прозрачный стриминг аудио и HLS:** Все плейлисты `.m3u8` и аудио-сегменты (`.m4s`, `.aac`, `.mp3`) проксируются локальным сокетом. Звук играет мгновенно, без задержек и заиканий.

---

## 📦 Быстрая загрузка / Downloads (v1.2.0)

Готовые скомпилированные релизы доступны во вкладке [**GitHub Releases**](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest):

| Платформа | Файл | Инструкция по запуску |
| :--- | :--- | :--- |
| 🪟 **Windows Portable** | [**`SoundCloud-Ultimate-Windows-x86_64-Portable.zip`**](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest) | Распаковать архив и запустить `soundcloud-desktop.exe` (не требует прав администратора) |
| 🪟 **Windows .EXE** | [**`SoundCloud-Ultimate-Portable.exe`**](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest) | Автономный исполняемый файл для Windows |
| 🐧 **Linux AppImage** | [**`SoundCloud-Ultimate-x86_64.AppImage`**](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest) | `chmod +x SoundCloud-Ultimate-x86_64.AppImage` и запустить двойным кликом или в терминале |
| 🐧 **Debian / Ubuntu** | [**`soundcloud-ultimate_1.2.0_amd64.deb`**](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest) | Установить пакет: `sudo dpkg -i soundcloud-ultimate_1.2.0_amd64.deb` |
| 🐧 **Linux Standalone** | [**`soundcloud-ultimate-linux-x86_64.tar.gz`**](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest) | Распаковать: `tar -xvf soundcloud-ultimate-linux-x86_64.tar.gz && ./run.sh` |
| 🧩 **Chrome Extension** | [**`soundcloud-ultimate-chrome-extension-v1.2.0.zip`**](https://github.com/masyaslasher/soundcloud-ultimate/releases/latest) | Включить режим разработчика в `chrome://extensions` и нажать «Загрузить распакованное» |

---

## 📸 Галерея интерфейса / Screenshots

<div align="center">

### 1. Темы оформления: 10 разнообразных AMOLED Bento палитр
![Themes Grid](screenshots/09_themes_10_palettes.png)

### 2. Центр встроенных расширений (Discord RPC, Караоке, FX Studio, Looper, Таймер сна, Bento-карточки)
![Extensions Hub](screenshots/discord_rpc_extensions.png)

### 3. Синхронные тексты песен (Караоке LRCLIB) & A-B Looper в теме Nordic Frost
<p align="center">
  <img src="screenshots/15_lyrics_karaoke.png" width="48%" alt="Karaoke Synchronized Lyrics" />
  &nbsp;&nbsp;
  <img src="screenshots/16_nordic_frost_looper.png" width="48%" alt="Nordic Frost & A-B Looper" />
</p>

### 4. Cyberpunk 2077 Тема & Midnight Synthwave Тема
<p align="center">
  <img src="screenshots/13_cyberpunk_neon_theme.png" width="48%" alt="Cyberpunk 2077 Theme" />
  &nbsp;&nbsp;
  <img src="screenshots/14_synthwave_theme.png" width="48%" alt="Synthwave Theme" />
</p>

### 5. Студия эффектов: 8D Audio (360° Вращение) & Скорость (Nightcore, Slowed)
![Audio FX Studio](screenshots/11_audio_fx_8d_studio.png)

### 6. Генератор неоновых Bento-карточек трека для Discord, Telegram и VK
![Bento Social Track Card](screenshots/12_bento_social_track_card.png)

### 7. Главный экран рекомендаций и чартов (Discover & Trending)
![Main Discover](screenshots/01_main_discover.png)

### 8. Встроенный профиль артиста с треками и кнопкой подписки (In-App Artist Profile)
![Artist Profile](screenshots/02_in_app_artist_profile.png)

### 9. Инспектор альбомов и плейлистов (Playlist Inspector)
![Playlist Inspector](screenshots/03_in_app_playlist_inspector.png)

### 10. Комментарии с таймкодами и публикацией в реальном времени (Track Comments)
![Comments System](screenshots/04_in_app_comments_system.png)

### 11. Лазерный Bento-ползунок громкости и Студийный эквалайзер
<p align="center">
  <img src="screenshots/06_bento_laser_volume.png" width="32%" alt="Volume Slider" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="screenshots/07_studio_equalizer.png" width="58%" alt="Studio Equalizer" />
</p>

</div>

---

## 🎨 10 Встроенных тем оформления (AMOLED Bento Themes)

Переключение осуществляется мгновенно в 1 клик через кнопку **«Темы (10)»** в шапке плеера:

1. **🧡 Onyx Orange** — оригинальный AMOLED Bento Glass и лазерный неоновый оранж `#FF5500`.
2. **⚡ Cyberpunk 2077** — электрический кибер-желтый `#FFE600`, неон-циан `#00F0FF` и темный Night City.
3. **🌆 Midnight Synthwave** — неоновая маджента `#F72585`, глубокий ультрафиолет `#7209B7` и ретровейв 80-х.
4. **🟢 Matrix Emerald** — хакерский CRT-терминал, изумрудный фосфор `#00FF66` и темный матричный код.
5. **❄️ Nordic Frost** — арктический неоновый лед `#00D2FF`, кристальный сапфир и океанический глубокий синий.
6. **🩸 Crimson Blood** — кровавый рубин `#FF1E56`, готический вампирский обсидиан и темный кармин.
7. **🌸 Sakura Blossom** — цветущая сакура токийской ночи, пастельный неон `#FF66C4` и розовое золото.
8. **🍯 Solar Amber** — жидкое янтарь-золото `#FFB703`, закатный горизонт и теплые премиальные тона.
9. **🔮 Hyperpop Acid** — кислотный лайм `#A3E635`, глубокий аметистовый фиолет и гиперпоп-стиль.
10. **💎 Monochrome Titanium** — абсолютный оникс `#000000`, чистая платина `#FFFFFF` и титановый минимализм.

---

## 🧩 6 Встроенных расширений (Built-in Power Extensions)

1. **🎤 Караоке и Синхронный Текст Песни (`K`):**
   - Автоматический поиск текста трека в базе LRCLIB по исполнителю и названию.
   - Синхронная построчная прокрутка в реальном времени с подсветкой поющей строки.
   - Возможность перемотать воспроизведение кликом на любую строку текста.
2. **🌙 Умный Таймер Сна:**
   - Автоматическая остановка воспроизведения через 15, 30, 45, 60, 90 минут или «в конце текущего трека».
   - Мягкое 30-секундное затухание звука (fade-out), предотвращающее резкое прерывание музыки во сне.
   - Отображение оставшегося времени прямо на кнопке плеера (`🌙 24:18`).
3. **🎛️ Студия Эффектов FX (`F`):**
   - **8D Audio Spatializer (360°):** аппаратное бинауральное пространственное вращение стереобазы вокруг головы слушателя в наушниках с анимированным радаром.
   - **Nightcore Режим (1.25x):** увеличение скорости и подъем гармоник.
   - **Slowed + Reverb Режим (0.85x):** атмосферное замедление с глубоким басом.
   - **Vaporwave Режим (0.75x) и Плавный регулятор скорости (0.5x – 2.0x).**
4. **🔁 A-B Precision Looper (`[`, `]`, `\`):**
   - Установка метки начала `[A]` и метки конца `[B]` прямо во время прослушивания.
   - Визуальные маркеры и цветовая подсветка зацикленного фрагмента на таймлайне.
   - Бесшовное циклическое воспроизведение любимых битов, дропов или гитарных соло.
5. **🪪 Генератор Bento-Карточек Трека:**
   - Мгновенное создание AMOLED-карточки текущего трека на HTML5 Canvas под цвет активной темы.
   - Включает обложку, стилизованную аудио-волну, имя автора и lossless-бейдж.
   - Копирование изображения в буфер обмена или сохранение в PNG для публикации в Telegram, Discord, VK в 1 клик.
6. **🎮 Discord Rich Presence (Кроссплатформенная синхронизация для Linux и Windows):**
   - Чистый нативный клиент Discord IPC на Rust, встроенный непосредственно в ядро приложения без внешних зависимостей.
   - Полная поддержка Linux (Unix Domain Sockets: `/run/user/<uid>/discord-ipc-*`, `$XDG_RUNTIME_DIR`, Flatpak, Snap) и Windows (Named Pipes: `\\.\pipe\discord-ipc-*`).
   - Отображение в профиле Discord в реальном времени:
     - **Тип активности:** «Слушает SoundCloud» (Listening to ...)
     - **Название и автор:** Название текущего трека и исполнитель (`by ...`)
     - **Живой таймлайн:** Синхронизированные метки времени с интерактивным прогресс-баром
     - **Обложка высокого разрешения:** Оригинальный арт альбома и иконка SoundCloud
     - **Интерактивная кнопка:** «Listen on SoundCloud» для мгновенного перехода к треку
     - **Управление в интерфейсе:** Живой статус в центре расширений (`Active • Connected as @user`), авто-переподключение при открытии Discord и переключатель on/off.

---

## ✨ Ключевые возможности / Core Features

### 🦀 Standalone Desktop Application (Rust Native Engine)
- **⚡ Встроенный Zapret Anti-DPI движок:**
  - Нативная реализация Record Splitting (разбиение TLS ClientHello на 2 байта + Cloudflare/Google DoH).
  - Полный обход блокировок ТСПУ РКН: треки, поиск, обложки и API работают в РФ без VPN.
  - Нулевая нагрузка на процессор и полное отсутствие необходимости в правах администратора или сторонних драйверах.
- **100% In-App Экосистема:** Никаких перенаправлений на soundcloud.com. Профили артистов, альбомы, плейлисты, комментарии и похожие радиостанции открываются прямо внутри единого окна.
- **Интеграция с аккаунтом SoundCloud:**
  - ⚡ **Вход в 1 клик:** Автоматический импорт сохранённой веб-сессии Chromium/Chrome без ручного извлечения токенов.
  - ❤️ **Мои Лайки:** Моментальный доступ ко всей вашей библиотеке лайков.
  - 📂 **Мои Плейлисты:** Просмотр и воспроизведение личных подборок и альбомов.
  - 📡 **Моя Лента:** Персональная лента свежих релизов авторов, на которых вы подписаны.
  - 🕒 **История прослушиваний:** 30 последних треков вашего аккаунта.
- **Встроенные социальные функции:**
  - Подписка / отписка от артистов в один клик.
  - Быстрый лайк прямо во время прослушивания (`L`).
  - Просмотр комментариев слушателей на таймлайне и переход по таймкодам.
  - Публикация комментариев на текущей секунде воспроизведения.
  - 📻 **Радио-станции:** Мгновенный сбор 24 похожих рекомендаций на основе любого трека.
- **Студийный звук:**
  - Прямой стриминг HLS / AAC / MP3 потоков без задержек.
  - **5-полосный студийный эквалайзер:** 60Hz, 250Hz, 1kHz, 4kHz, 12kHz.
  - **Пресеты звучания:** *Bass Boost 🔥, Electronic ⚡, Vocal 🎤, Rock 🎸, Flat*.
  - Управление громкостью колесиком мыши с hover-мостом и плавной интерполяцией.
  - Скачивание треков в оригинальном качестве прямо из плеера (`D`).
- **Премиальный визуал:**
  - Полноэкранный неоновый виниловый визуализатор (`V`).
  - Процедурный шейдер дыма и тумана на HTML5 Canvas (60 FPS).
  - Интеграция с MediaSession API (управление клавишами на мультимедийной клавиатуре).

---

## ⌨️ Горячие клавиши / Keyboard Shortcuts

| Клавиша | Действие |
| :---: | :--- |
| `Space` | Воспроизведение / Пауза |
| `←` / `→` | Перемотка трека на 5 секунд назад / вперед |
| `↑` / `↓` | Плавное изменение громкости (шаг 5%) |
| `M` | Мгновенное включение / выключение звука (Mute) |
| `L` | Поставить / убрать лайк текущему треку |
| `D` | Скачать текущий трек на компьютер |
| `V` | Полноэкранный режим визуализатора |
| `E` | Открыть 5-полосный студийный эквалайзер |
| `K` | Открыть Караоке и Синхронный текст песни |
| `F` | Открыть Студию звуковых эффектов FX (8D Audio, Скорость) |
| `[` / `]` | Установить метки начала [A] и конца [B] в A-B Looper |
| `\` | Включить / выключить зацикливание A-B Looper |
| `C` | Открыть комментарии к играющему треку |
| `P` | Открыть профиль автора текущего трека |
| `H` | Открыть историю недавних прослушиваний |
| `S` | Фокус на строку поиска |
| `Esc` | Закрыть любое открытое модальное окно |

---

## 🛠️ Сборка из исходников / Build from Source

### Требования
- [Rust 1.85+](https://www.rust-lang.org/tools/install)
- Браузер Chromium, Chrome, Edge или Brave (используется для ультра-легкого рендеринга окна)

```bash
# Клонировать репозиторий
git clone https://github.com/masyaslasher/soundcloud-ultimate.git
cd soundcloud-ultimate/desktop

# Запуск в режиме разработки
cargo run

# Сборка оптимизированного релизного бинарника
cargo build --release
```

---

## 📄 Лицензия / License

Проект распространяется под открытой лицензией [MIT License](LICENSE).
Разработано с душой для истинных ценителей музыки и эстетики. 🧡
