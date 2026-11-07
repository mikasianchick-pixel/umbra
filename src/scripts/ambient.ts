// Тихий эмбиент: синтезируется в браузере (Web Audio API), без аудиофайлов.
// Два слегка расстроенных тона + мягкий фильтр, который медленно «дышит».
// По умолчанию выключен: браузеры и так разрешают звук только после действия пользователя.

let ctx: AudioContext | undefined;
let master: GainNode | undefined;
let playing = false;

const VOLUME = 0.05;

function build() {
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 600;
  filter.Q.value = 6;

  // медленное «дыхание» фильтра
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 350;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();

  // аккорд: ля минор в низком регистре, тоны чуть расстроены для «живости»
  for (const [freq, type, detune] of [
    [110, "sawtooth", -6],
    [110, "sawtooth", 7],
    [164.8, "triangle", 0],
    [220, "sine", 3],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    osc.connect(filter);
    osc.start();
  }

  filter.connect(master).connect(ctx.destination);
}

export async function setAmbient(on: boolean) {
  if (on && !ctx) build();
  if (!ctx || !master) return;
  if (on) await ctx.resume();
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  // плавное появление и затухание, без щелчков
  master.gain.linearRampToValueAtTime(on ? VOLUME : 0, now + (on ? 2 : 0.6));
  playing = on;
  if (!on) setTimeout(() => !playing && ctx?.suspend(), 700);
}

/** Кнопки [data-sound] (в шапке) и клавиша M. */
export function initAmbientButtons() {
  const buttons = () => document.querySelectorAll<HTMLElement>("[data-sound]");
  const sync = () =>
    buttons().forEach((b) => {
      b.setAttribute("aria-pressed", String(playing));
    });

  const toggle = async () => {
    await setAmbient(!playing);
    sync();
  };

  document.addEventListener("click", (e) => {
    if ((e.target as Element).closest("[data-sound]")) toggle();
  });
  document.addEventListener("keydown", (e) => {
    const t = e.target as HTMLElement;
    if (e.key.toLowerCase() !== "m" || e.ctrlKey || e.metaKey || e.altKey) return;
    if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    toggle();
  });
}
