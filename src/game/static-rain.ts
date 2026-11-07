// «Static Rain» — мини-игра для страницы 404. Чистый TypeScript + canvas 2D, без библиотек.
// Ты — огонёк сигнала внизу экрана: лови бирюзовые искры (+10) и уворачивайся от полос помех.
// Скорость растёт со временем, жизней три. Время кадра считается в секундах (dt),
// поэтому на любом мониторе — 60 или 144 Гц — игра идёт с одной скоростью.

export type GameState = "ready" | "playing" | "paused" | "over";

export interface Hud {
  score: number;
  best: number;
  lives: number;
  state: GameState;
}

interface Drop {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  kind: "spark" | "static";
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const BEST_KEY = "umbra-404-best";
const PLAYER_R = 12;
const PLAYER_SPEED = 460; // пикселей в секунду
const LIVES = 3;

/** Цвет из CSS-переменной: canvas понимает oklch() напрямую. */
const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export class StaticRain {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private last = 0;

  private state: GameState = "ready";
  private x = 0;
  private targetX: number | null = null;
  private keys = new Set<string>();
  private drops: Drop[] = [];
  private particles: Particle[] = [];
  private score = 0;
  private best = 0;
  private lives = LIVES;
  private time = 0;
  private spawnIn = 0;
  private hurt = 0; // секунды неуязвимости после удара
  private shake = 0;

  private colors = { bg: "", spark: "", static: "", player: "", text: "", line: "" };
  private readonly calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  private readonly ro: ResizeObserver;
  private readonly cleanup: (() => void)[] = [];

  constructor(
    private canvas: HTMLCanvasElement,
    private onHud: (hud: Hud) => void,
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D is not available");
    this.ctx = ctx;

    this.colors = {
      bg: token("--bg"),
      spark: token("--accent-2"),
      static: token("--hot"),
      player: token("--accent"),
      text: token("--text"),
      line: token("--line"),
    };

    try {
      this.best = Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
      this.best = 0;
    }

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.resize();
    this.x = this.w / 2;

    this.listen(window, "keydown", (e) => this.onKey(e as KeyboardEvent, true));
    this.listen(window, "keyup", (e) => this.onKey(e as KeyboardEvent, false));
    this.listen(canvas, "pointerdown", (e) => this.onPointer(e as PointerEvent));
    this.listen(canvas, "pointermove", (e) => this.onPointer(e as PointerEvent));
    this.listen(document, "visibilitychange", () => document.hidden && this.pause());

    this.emit();
    this.draw();
  }

  /* ---------------- управление игрой ---------------- */

  start() {
    this.drops = [];
    this.particles = [];
    this.score = 0;
    this.lives = LIVES;
    this.time = 0;
    this.spawnIn = 0.4;
    this.hurt = 0;
    this.x = this.w / 2;
    this.targetX = null;
    this.state = "playing";
    this.loop();
  }

  pause() {
    if (this.state !== "playing") return;
    this.state = "paused";
    cancelAnimationFrame(this.raf);
    this.emit();
    this.draw();
  }

  resume() {
    if (this.state !== "paused") return;
    this.state = "playing";
    this.loop();
  }

  /** Главная кнопка: старт / пауза / продолжить / ещё раз. */
  toggle() {
    if (this.state === "playing") this.pause();
    else if (this.state === "paused") this.resume();
    else this.start();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.cleanup.forEach((off) => off());
  }

  /* ---------------- ввод ---------------- */

  private listen(target: EventTarget, type: string, fn: (e: Event) => void) {
    target.addEventListener(type, fn);
    this.cleanup.push(() => target.removeEventListener(type, fn));
  }

  private onKey(e: KeyboardEvent, down: boolean) {
    const key = e.key.toLowerCase();
    const move = ["arrowleft", "arrowright", "a", "d"].includes(key);
    // игра слушает клавиши, только когда фокус на canvas или на странице (не в полях ввода)
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, dialog")) return;

    if (move) {
      if (this.state === "playing") e.preventDefault();
      if (down) this.keys.add(key);
      else this.keys.delete(key);
      this.targetX = null;
    }
    if (down && (key === " " || key === "enter") && target === this.canvas) {
      e.preventDefault();
      this.toggle();
    }
    if (down && (key === "p" || key === "escape") && this.state === "playing") this.pause();
  }

  private onPointer(e: PointerEvent) {
    // палец или мышь с зажатой кнопкой — огонёк едет к точке касания
    if (e.pointerType === "mouse" && e.buttons === 0 && e.type === "pointermove") return;
    const r = this.canvas.getBoundingClientRect();
    this.targetX = e.clientX - r.left;
    if (e.type === "pointerdown" && this.state !== "playing") this.toggle();
  }

  /* ---------------- цикл ---------------- */

  private loop() {
    this.last = performance.now();
    const frame = (now: number) => {
      if (this.state !== "playing") return;
      const dt = Math.min((now - this.last) / 1000, 0.05);
      this.last = now;
      this.update(dt);
      this.draw();
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  private update(dt: number) {
    this.time += dt;
    // сложность: каждые ~20 секунд игра заметно быстрее
    const level = 1 + this.time / 20;

    // движение игрока
    let dir = 0;
    if (this.keys.has("arrowleft") || this.keys.has("a")) dir -= 1;
    if (this.keys.has("arrowright") || this.keys.has("d")) dir += 1;
    if (this.targetX !== null) {
      const diff = this.targetX - this.x;
      dir = Math.abs(diff) < 4 ? 0 : Math.sign(diff);
    }
    this.x = Math.min(Math.max(this.x + dir * PLAYER_SPEED * dt, PLAYER_R), this.w - PLAYER_R);

    // новые капли: помехи чаще искр
    this.spawnIn -= dt;
    if (this.spawnIn <= 0) {
      // первые секунды мягкие: реже и медленнее, потом level разгоняет всё
      this.spawnIn = Math.max(0.2, 0.9 / level) * (0.6 + Math.random() * 0.8);
      const spark = Math.random() < 0.35;
      const w = spark ? 10 : 28 + Math.random() * 48;
      this.drops.push({
        x: Math.random() * (this.w - w),
        y: -20,
        w,
        h: spark ? 10 : 8,
        vy: (spark ? 150 : 160 + Math.random() * 100) * level,
        kind: spark ? "spark" : "static",
      });
    }

    // падение и столкновения
    const py = this.h - 36;
    this.drops = this.drops.filter((d) => {
      d.y += d.vy * dt;
      const hit =
        d.y + d.h > py - PLAYER_R && d.y < py + PLAYER_R && d.x < this.x + PLAYER_R && d.x + d.w > this.x - PLAYER_R;
      if (hit && d.kind === "spark") {
        this.score += 10;
        this.burst(d.x + d.w / 2, d.y, this.colors.spark, 14);
        return false;
      }
      if (hit && d.kind === "static" && this.hurt <= 0) {
        this.lives -= 1;
        this.hurt = 1.2;
        this.shake = this.calm ? 0 : 0.3;
        this.burst(this.x, py, this.colors.static, 24);
        if (this.lives <= 0) this.gameOver();
        return false;
      }
      return d.y < this.h + 20;
    });

    // очки за выживание
    this.score += dt * 2;
    this.hurt = Math.max(0, this.hurt - dt);
    this.shake = Math.max(0, this.shake - dt);

    // искры частиц
    this.particles = this.particles.filter((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt;
      p.life -= dt;
      return p.life > 0;
    });

    this.emit();
  }

  private burst(x: number, y: number, color: string, n: number) {
    if (this.calm) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 60 + Math.random() * 180;
      this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, life: 0.5 + Math.random() * 0.4, color });
    }
  }

  private gameOver() {
    this.state = "over";
    const final = Math.floor(this.score);
    if (final > this.best) {
      this.best = final;
      try {
        localStorage.setItem(BEST_KEY, String(final));
      } catch {
        /* рекорд не сохранится — не страшно */
      }
    }
    this.emit();
  }

  private emit() {
    this.onHud({ score: Math.floor(this.score), best: this.best, lives: this.lives, state: this.state });
  }

  /* ---------------- отрисовка ---------------- */

  private resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = r.width;
    this.h = r.height;
    this.canvas.width = Math.round(r.width * this.dpr);
    this.canvas.height = Math.round(r.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.x = Math.min(Math.max(this.x, PLAYER_R), this.w - PLAYER_R);
    if (this.state !== "playing") this.draw();
  }

  private draw() {
    const { ctx, w, h, colors } = this;
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    if (this.shake > 0) ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);

    // фон: сетка-пол, уходящая вдаль, как в hero главной
    ctx.strokeStyle = colors.line;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1;
    const offset = (this.time * 60) % 40;
    for (let y = h - 60 + offset; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let i = -6; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(w / 2 + i * 30, h - 60);
      ctx.lineTo(w / 2 + i * 120, h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // капли
    for (const d of this.drops) {
      ctx.shadowBlur = 16;
      if (d.kind === "spark") {
        ctx.shadowColor = colors.spark;
        ctx.fillStyle = colors.spark;
        ctx.beginPath();
        ctx.arc(d.x + d.w / 2, d.y + d.h / 2, d.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.shadowColor = colors.static;
        ctx.fillStyle = colors.static;
        // полоса помех «рваная»: несколько кусков с промежутками
        for (let x = d.x; x < d.x + d.w; x += 9) {
          if (Math.random() > 0.15) ctx.fillRect(x, d.y + (Math.random() - 0.5) * 2, 7, d.h);
        }
      }
    }

    // частицы
    ctx.shadowBlur = 8;
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
    }
    ctx.globalAlpha = 1;

    // игрок: огонёк мигает, пока неуязвим после удара
    const visible = this.hurt <= 0 || Math.floor(this.hurt * 12) % 2 === 0;
    if (visible) {
      const py = h - 36;
      ctx.shadowBlur = 28;
      ctx.shadowColor = colors.player;
      ctx.fillStyle = colors.player;
      ctx.beginPath();
      ctx.arc(this.x, py, PLAYER_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = colors.text;
      ctx.beginPath();
      ctx.arc(this.x - 3, py - 3, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
