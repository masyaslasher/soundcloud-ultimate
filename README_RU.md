<div align="center">

# SoundCloud Ultimate (Quiet Dark AMOLED Edition)

[![Release](https://img.shields.io/badge/Релиз-v2.0.0--beta.1-A855F7?style=for-the-badge&logo=github)](https://github.com/masyaslasher/soundcloud-ultimate/releases/tag/v2.0.0-beta.1)
[![Rust](https://img.shields.io/badge/Rust-1.85+-orange?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![Архитектура](https://img.shields.io/badge/Архитектура-Cargo%20Workspace-blue?style=for-the-badge)]()
[![Платформа](https://img.shields.io/badge/Платформа-Linux%20%7C%20Windows-brightgreen?style=for-the-badge)]()
[![Лицензия](https://img.shields.io/badge/Лицензия-MIT-green?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Язык / Language:</strong>
  <a href="README.md">English (README.md)</a> •
  <a href="README_RU.md"><strong>Русский</strong></a>
</p>

<p align="center">
  <b>Ультимативный нативный десктопный клиент нового поколения для SoundCloud.</b><br>
  Построен на базе высокопроизводительного модульного <b>Rust Cargo Workspace</b> (<code>sc-core</code>) и современного интерфейса в стиле <b>Quiet Dark AMOLED</b> (фон <code>#09090B</code>, карточки <code>#121217</code>, акцент <code>#A855F7</code>).
  100% нативный десктоп без браузерных обёрток и зависимостей.
</p>

</div>

---

## Модульная архитектура

Проект переведён на эталонную архитектуру рабочего пространства Cargo Workspace:

```text
SoundCloud-Ultimate/
├── crates/
│   └── sc-core/             # Чистое Rust-ядро (библиотека)
│       ├── api.rs           # Клиент SoundCloud API v2, автопоиск client_id, курсорная пагинация (next_href)
│       ├── audio.rs         # Нативный декодер Rodio + Symphonia для аудиопотоков
│       ├── models.rs        # Строго типизированные структуры serde (Track, User, Playlist, Collection)
│       ├── config.rs        # Конфигурация и локальное кэширование библиотеки
│       └── discord.rs       # Кроссплатформенный Discord Rich Presence IPC
└── desktop/                 # Нативное десктопное приложение
    ├── src/
    │   ├── main.rs          # Встроенный рантайм Axum, нативное окно Tao + Wry с кастомным заголовком
    │   └── soundcloud.rs    # Мост между ядром sc-core и локальным веб-интерфейсом
    └── frontend/            # Quiet Dark AMOLED Single-Page интерфейс
        ├── index.html       # 4 аутентичные полки, поиск с категориями, плеерный док
        ├── app.js           # Однонаправленный поиск, карусели треков, синхронизация аккаунта
        └── style.css        # Дизайн-система Quiet Dark, полная изоляция модальных окон
```

---

## Галерея интерфейса

| Экран | Описание | Скриншот |
| :--- | :--- | :--- |
| **Главная (Discover)** | Аутентичная лента SoundCloud с 4 горизонтальными полками (*Недавно прослушанные*, *Больше похожего*, *Понравившиеся треки*, *Ваши подписки*) и кнопками карусели ‹ / ›. | ![Home Discover](assets/screenshots/home.png) |
| **Поиск и категории** | Живой поиск без фантомного ввода, фильтрация по вкладкам (*Все*, *Треки*, *Артисты*, *Плейлисты*) и чипы жанров (*Phonk, Synthwave, Cyberpunk, Trap, Ambient*). | ![Search View](assets/screenshots/search.png) |
| **Понравившиеся треки** | Полная синхронизация библиотеки аккаунта (>160 треков) с курсорной пагинацией, мгновенным запуском и переключением лайков. | ![Liked Tracks](assets/screenshots/liked.png) |
| **Подписки и артисты** | Профили артистов, счётчик подписчиков, обложки, дискография и мгновенный переход. | ![Artists View](assets/screenshots/artists.png) |

---

## Ключевые возможности

- **Аутентичный Discover как в оригинальном SoundCloud:** Никаких лишних баннеров, только чистые карусели музыки.
- **Мощное Rust-ядро:** Высокая скорость работы, авто-ротация `client_id`, стриминг HLS и нулевое зависание.
- **Эстетика Quiet Dark AMOLED:** Глубокий черный фон (`#09090B`), мягкие границы (`#27272A`), фиолетовый акцент (`#A855F7`), жестко закрепленные заголовок (52px) и плеер (72px).
- **Полная изоляция модальных окон:** Все диалоги и настройки скрыты (`display: none; position: fixed; inset: 0;`) и не ломают сетку страницы.
- **Нативный Discord Rich Presence:** Название трека, автор, обложка и анимированный прогресс-бар в Discord.
- **Аудио-эффекты и Караоке:** 5-полосный эквалайзер, 360° 8D Audio, режимы Nightcore/Slowed и синхронные тексты песен через LRCLIB (`K`).

---

## Сборка и запуск из исходного кода

### Системные зависимости (Debian / Ubuntu / Linux Mint)

```bash
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libgtk-3-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev libasound2-dev
```

### Сборка приложения

```bash
# Клонирование репозитория
git clone https://github.com/masyaslasher/soundcloud-ultimate.git
cd soundcloud-ultimate

# Сборка оптимизированного бинарника
cargo build --release -p soundcloud-desktop

# Запуск приложения
./target/release/soundcloud-desktop
```

---

## Релизы и пакеты

Готовые бинарные сборки доступны в [GitHub Releases](https://github.com/masyaslasher/soundcloud-ultimate/releases/tag/v2.0.0-beta.1):

- **Linux Standalone:** `soundcloud-ultimate-linux-x86_64-v2.0.0-beta.1.tar.gz`
- **Debian / Ubuntu:** `soundcloud-ultimate_2.0.0-beta.1_amd64.deb`
- **Linux AppImage:** `SoundCloud-Ultimate-x86_64.AppImage`
- **Windows Portable:** `SoundCloud-Ultimate-Windows-x86_64-Portable.zip`

---

## Лицензия

Проект распространяется под лицензией [MIT License](LICENSE).
SoundCloud является зарегистрированной торговой маркой SoundCloud Global Limited & Co. KG. Этот проект является независимым клиентом с открытым исходным кодом.
