# ☁️ SoundCloud Ultimate — Suite

[![Rust](https://img.shields.io/badge/Rust-1.85+-orange.svg?logo=rust)](https://www.rust-lang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20Windows%20%7C%20macOS-brightgreen.svg)]()
[![Theme](https://img.shields.io/badge/Design-AMOLED%20Bento%20Glass-ff5500.svg)]()

> **SoundCloud Ultimate** — это ультимативный набор для прослушивания музыки на SoundCloud, включающий в себя:
> 1. 🚀 **Standalone Desktop Client на Rust** — сверхбыстрое нативное приложение с нулевым потреблением памяти, аппаратным ускорением, встроенным 5-полосным студийным эквалайзером, авторизацией в 1 клик и 100% In-App функционалом (без внешних переходов в браузер).
> 2. 🧩 **Chromium Extension** — расширение для браузера, преображающее официальный веб-сайт soundcloud.com в глубокий премиальный дизайн **AMOLED Bento Glass** (`#0A090E`, неоновые оранжевые акценты `#FF5500`, парящий док-плеер и атмосферный туман).

---

## 📸 Галерея скриншотов / Screenshots

<div align="center">

### 1. Главный экран Discover (Discover & Trending)
![Main Discover](screenshots/01_main_discover.png)

### 2. Встроенный профиль исполнителя (In-App Artist Profile)
![Artist Profile](screenshots/02_in_app_artist_profile.png)

### 3. Инспектор альбомов и плейлистов (Playlist Inspector)
![Playlist Inspector](screenshots/03_in_app_playlist_inspector.png)

### 4. Комментарии к треку с таймкодами (Track Comments)
![Comments System](screenshots/04_in_app_comments_system.png)

### 5. История прослушиваний и медиатека (Listening History & Library)
![Listening History](screenshots/05_listening_history.png)

### 6. Лазерный Bento-ползунок громкости и Студийный эквалайзер
<p align="center">
  <img src="screenshots/06_bento_laser_volume.png" width="30%" alt="Volume Slider" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="screenshots/07_studio_equalizer.png" width="55%" alt="Studio Equalizer" />
</p>

</div>

---

## ✨ Ключевые возможности / Core Features

### 🦀 Standalone Desktop Application (Rust Engine)
- **100% In-App Навигация:** Никаких перенаправлений на внешний сайт! Профили исполнителей, карточки авторов, инспектор плейлистов, комментарии и рекомендации открываются прямо в окне приложения.
- **Интеграция с аккаунтом SoundCloud:**
  - ⚡ **Вход в 1 клик:** Автоматический импорт активной сессии из Chromium без ручного ввода токенов.
  - ❤️ **Мои Лайки:** Моментальный доступ к вашей библиотеке избранных треков, синхронизированных с серверами SoundCloud.
  - 📂 **Мои Плейлисты:** Просмотр и запуск ваших персональных альбомов.
  - 📡 **Моя Лента:** Персональная подборка свежих релизов от авторов, на которых вы подписаны.
  - 🕒 **История прослушиваний:** 30 последних треков вашего аккаунта.
- **Встроенная социальная экосистема:**
  - Подписка и отписка от артистов в один клик.
  - Добавление и снятие лайков прямо во время прослушивания (горячая клавиша `L`).
  - Просмотр комментариев с таймкодами (клик по таймкоду перематывает трек).
  - Публикация собственных комментариев на текущей секунде воспроизведения.
  - 📻 **Радио-станции:** Мгновенный сбор 24 похожих рекомендаций на основе играющего трека.
- **Аудио-движок студийного уровня:**
  - Поддержка HLS и прогрессивных MP3 аудиопотоков без задержек.
  - **5-полосный студийный эквалайзер:** частоты 60Hz, 250Hz, 1kHz, 4kHz, 12kHz.
  - **Пресеты звучания:** *Bass Boost 🔥, Electronic ⚡, Vocal 🎤, Rock 🎸, Flat*.
  - Плавная регулировка громкости колёсиком мыши и клавиатурой.
  - Скачивание треков в MP3 напрямую из плеера (клавиша `D`).
- **Премиальный визуал:**
  - Полноэкранный неоновый виниловый визуализатор (клавиша `V`).
  - 60 FPS процедурный шейдер дыма и тумана на HTML5 Canvas.
  - Медиа-клавиши и интеграция с MediaSession API (управление мультимедиа-кнопками клавиатуры).

---

### 🧩 Browser Extension (Chrome / Chromium)
- Полная замена стандартного светлого интерфейса soundcloud.com на глубокий **AMOLED Bento Glass**:
  - Цвет фона: чистый глубокий чёрный `#0A090E`.
  - Эффект матового стекла (`backdrop-filter: blur(20px)`).
  - Акцентный неоновый оранжевый `#FF5500`.
- Парящий док-плеер с центрированными элементами управления и лазерной геометрией.
- Улучшенные карточки треков и плейлистов с адаптивной сеткой.

---

## ⌨️ Горячие клавиши / Keyboard Shortcuts

| Клавиша | Действие |
|:---:|---|
| <kbd>Space</kbd> | Воспроизведение / Пауза |
| <kbd>←</kbd> / <kbd>→</kbd> | Перемотка на 5 секунд назад / вперёд |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Увеличение / Уменьшение громкости |
| <kbd>M</kbd> | Включение / Отключение звука (Mute) |
| <kbd>L</kbd> | Поставить / Снять лайк с текущего трека |
| <kbd>C</kbd> | Открыть окно комментариев трека |
| <kbd>E</kbd> | Открыть Студийный Эквалайзер & Bass Boost |
| <kbd>V</kbd> | Полноэкранный виниловый визуализатор |
| <kbd>D</kbd> | Скачать трек в MP3 |
| <kbd>S</kbd> | Случайный порядок (Shuffle) |
| <kbd>R</kbd> | Режим повтора (Off / All / One) |
| <kbd>Q</kbd> | Боковая панель очереди треков |
| <kbd>/</kbd> | Быстрый фокус на строку поиска |
| <kbd>Esc</kbd> | Закрыть любое открытое модальное окно |

---

## 🛠 Установка и запуск / Installation & Getting Started

### 1. Standalone Desktop Client (Rust)

#### Требования:
- Установленный компилятор **Rust & Cargo** (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
- Chromium или Google Chrome (используется для ультра-лёгкого GPU-рендеринга без раздувания зависимостей)

#### Сборка и запуск:
```bash
git clone https://github.com/aluynon681-cpu/soundcloud-ultimate.git
cd soundcloud-ultimate/desktop

# Запуск в один клик
./run.sh

# Или ручная компиляция релизной версии:
cargo build --release
./target/release/soundcloud-desktop
```

---

### 2. Browser Extension (Расширение для браузера)

#### Установка в браузер (Chromium, Chrome, Brave, Edge):
1. Откройте в браузере страницу управления расширениями: `chrome://extensions/`
2. Включите переключатель **«Режим разработчика»** (Developer mode) в правом верхнем углу.
3. Нажмите кнопку **«Загрузить распакованное расширение»** (Load unpacked).
4. Выберите папку `soundcloud-ultimate/extension` (или собранную `extension/dist`).
5. Откройте [soundcloud.com](https://soundcloud.com) и наслаждайтесь новым AMOLED дизайном!

---

## 📂 Структура проекта / Repository Structure

```
soundcloud-ultimate/
├── desktop/                  # Нативное десктопное приложение на Rust
│   ├── src/
│   │   ├── main.rs           # Сервер Axum, маршрутизация API, статика RustEmbed
│   │   ├── soundcloud.rs     # Клиент SoundCloud v2 API, сессии, аудио-потоки
│   │   ├── models.rs         # Типизированные структуры данных Serde
│   │   └── launcher.rs       # Запуск окна с аппаратным ускорением
│   ├── frontend/             # Встроенный UI приложения
│   │   ├── index.html        # Bento-разметка и модальные окна
│   │   ├── style.css         # AMOLED Bento Glass CSS
│   │   ├── app.js            # Логика плеера, эквалайзер, комментарии, профили
│   │   ├── smoke.js          # Атмосферный шейдер дыма 60fps
│   │   └── hls.min.js        # HLS аудио-движок
│   ├── Cargo.toml            # Зависимости Rust (axum, tokio, reqwest, serde)
│   └── run.sh                # Скрипт быстрого запуска
├── extension/                # Расширение для Chromium/Chrome
│   ├── src/                  # Исходный код контент-скриптов и стилей
│   ├── public/               # manifest.json, иконки
│   ├── package.json          # Vite + TypeScript конфигурация
│   └── vite.config.ts        # Сборщик бандла расширения
├── screenshots/              # Скриншоты высокого разрешения
├── .gitignore                # Игнорируемые файлы (build artifacts, target, tokens)
└── README.md                 # Документация проекта
```

---

## 📜 Лицензия / License

Распространяется под лицензией **MIT License**. Подробнее см. в файле [LICENSE](extension/LICENSE).
