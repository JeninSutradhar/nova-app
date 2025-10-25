let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function isMuted(): boolean {
  const saved = localStorage.getItem('nova-sound-muted');
  return saved !== null ? JSON.parse(saved) : true;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  if (isMuted()) return;
  
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

export function playSound(type: 'click' | 'success' | 'achievement' | 'error' | 'hover' = 'click') {
  if (isMuted()) return;
  
  switch (type) {
    case 'click':
      playTone(400, 0.05, 'sine', 0.2);
      break;
    case 'success':
      playTone(523, 0.1, 'sine', 0.2);
      setTimeout(() => playTone(659, 0.1, 'sine', 0.2), 100);
      break;
    case 'achievement':
      playTone(261, 0.1, 'sine', 0.25);
      setTimeout(() => playTone(329, 0.1, 'sine', 0.25), 100);
      setTimeout(() => playTone(392, 0.2, 'sine', 0.25), 200);
      setTimeout(() => playTone(523, 0.3, 'sine', 0.3), 400);
      break;
    case 'error':
      playTone(200, 0.3, 'sawtooth', 0.2);
      break;
    case 'hover':
      playTone(440, 0.03, 'sine', 0.1);
      break;
  }
}
