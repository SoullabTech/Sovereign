export const sacredPauses = {
  arrival: 2000,
  threshold: 1000,
  breath: 300,
  integration: 3000,
};

export const sacredErrors = {
  network: {
    message: "Taking a sacred pause...",
    haptic: [20, 1000, 20, 1000, 20],
    duration: 12000,
  },

  save: {
    message: "Holding this wisdom a moment longer...",
    haptic: [30, 500, 30],
    duration: 3000,
  },

  capacity: {
    message: "The circle is full. Rest, return soon.",
    haptic: [40, 1000, 40, 1000, 40],
    duration: 6000,
  },

  unknown: {
    message: "A pause in the field. Breathing together...",
    haptic: [25, 800, 25],
    duration: 4000,
  }
};

export async function handleSacredError(type: keyof typeof sacredErrors = 'unknown'): Promise<void> {
  const error = sacredErrors[type];

  if ('vibrate' in navigator && error.haptic) {
    navigator.vibrate(error.haptic);
  }

  return new Promise(resolve => {
    setTimeout(resolve, error.duration);
  });
}

export async function thresholdBreath(): Promise<void> {
  if ('vibrate' in navigator) {
    navigator.vibrate([0, 10, 20, 30, 40]);
    await new Promise(r => setTimeout(r, 4000));

    navigator.vibrate(20);
    await new Promise(r => setTimeout(r, 2000));

    navigator.vibrate([40, 30, 20, 10]);
    await new Promise(r => setTimeout(r, 4000));
  } else {
    await new Promise(r => setTimeout(r, 10000));
  }
}

export function thresholdHaptic(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate([0, 20, 40, 30, 60, 40, 80, 50]);
  }
}