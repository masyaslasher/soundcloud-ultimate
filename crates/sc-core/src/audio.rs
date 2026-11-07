use rodio::{Decoder, DeviceSinkBuilder, MixerDeviceSink, Player};
use std::io::Cursor;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

pub struct AudioPlayer {
    _sink_device: MixerDeviceSink,
    player: Arc<Mutex<Option<Player>>>,
    pub is_playing: Arc<AtomicBool>,
}

impl AudioPlayer {
    pub fn try_new() -> Result<Self, String> {
        let sink_device = DeviceSinkBuilder::open_default_sink().map_err(|e| e.to_string())?;
        Ok(Self {
            _sink_device: sink_device,
            player: Arc::new(Mutex::new(None)),
            is_playing: Arc::new(AtomicBool::new(false)),
        })
    }

    pub fn play_bytes(&self, bytes: Vec<u8>, initial_volume: f32) -> Result<(), String> {
        let cursor = Cursor::new(bytes);
        let decoder = Decoder::try_from(cursor).map_err(|e| e.to_string())?;

        let player = Player::connect_new(self._sink_device.mixer());
        player.set_volume(initial_volume.clamp(0.0, 1.0));
        player.append(decoder);
        player.play();

        let mut lock = self.player.lock().unwrap();
        if let Some(old_player) = lock.take() {
            old_player.stop();
        }
        *lock = Some(player);
        self.is_playing.store(true, Ordering::SeqCst);
        Ok(())
    }

    pub fn pause(&self) {
        if let Some(ref player) = *self.player.lock().unwrap() {
            player.pause();
            self.is_playing.store(false, Ordering::SeqCst);
        }
    }

    pub fn resume(&self) {
        if let Some(ref player) = *self.player.lock().unwrap() {
            player.play();
            self.is_playing.store(true, Ordering::SeqCst);
        }
    }

    pub fn stop(&self) {
        let mut lock = self.player.lock().unwrap();
        if let Some(player) = lock.take() {
            player.stop();
            self.is_playing.store(false, Ordering::SeqCst);
        }
    }

    pub fn set_volume(&self, vol: f32) {
        if let Some(ref player) = *self.player.lock().unwrap() {
            player.set_volume(vol.clamp(0.0, 1.0));
        }
    }

    pub fn seek(&self, position: Duration) -> Result<(), String> {
        if let Some(ref player) = *self.player.lock().unwrap() {
            player.try_seek(position).map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub fn get_pos(&self) -> Duration {
        if let Some(ref player) = *self.player.lock().unwrap() {
            player.get_pos()
        } else {
            Duration::ZERO
        }
    }

    pub fn is_empty(&self) -> bool {
        if let Some(ref player) = *self.player.lock().unwrap() {
            player.empty()
        } else {
            true
        }
    }
}
