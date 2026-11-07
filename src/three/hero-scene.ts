// 3D-сцена hero: гранёный неоновый кристалл, ореол и облако светящихся частиц.
// Свои шейдеры (GLSL), цвета берутся из CSS-токенов — один источник правды с Figma.
// Сцена рисуется только когда видна, при уходе со страницы всё освобождается (dispose).
import * as THREE from "three";

export interface HeroScene {
  /** 0…1 — насколько hero прокручен; меняет цвет света и поворот */
  setScroll(progress: number): void;
  /** плавно «проявить» кристалл (после загрузчика) */
  reveal(): void;
  dispose(): void;
}

interface Options {
  calm: boolean;
  /** слабое устройство: меньше частиц, без сглаживания */
  lite: boolean;
}

/** Цвет из CSS-переменной в THREE.Color: браузер сам переводит oklch() в sRGB через canvas. */
function tokenColor(name: string): THREE.Color {
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const color = new THREE.Color();
  if (!ctx) return color;
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return color.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
}

/** Двойная пирамида: острая верхушка, шестигранный «пояс», длинный низ. Грани плоские. */
function crystalGeometry(): THREE.BufferGeometry {
  const top = new THREE.Vector3(0, 1.3, 0);
  const bottom = new THREE.Vector3(0, -1.8, 0);
  const ring = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * 0.82, 0.18 + (i % 2 ? 0.1 : -0.06), Math.sin(a) * 0.82);
  });

  const positions: number[] = [];
  const pushTri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    // разворачиваем треугольник наружу: нормаль должна смотреть от центра
    const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
    const center = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3);
    const [p, q] = n.dot(center) < 0 ? [c, b] : [b, c];
    positions.push(a.x, a.y, a.z, p.x, p.y, p.z, q.x, q.y, q.z);
  };

  ring.forEach((a, i) => {
    const b = ring[(i + 1) % ring.length]!;
    pushTri(top, a, b);
    pushTri(bottom, a, b);
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

const crystalVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vY;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - world.xyz);
    vY = position.y;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const crystalFragment = /* glsl */ `
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  uniform vec3 uLight;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vY;
  void main() {
    vec3 n = normalize(vNormal);
    // левые грани — основной цвет, правые — второй, нижние передние — редкий розовый
    vec3 base = mix(uA, uB, smoothstep(0.3, 0.7, n.x * 0.5 + 0.5));
    base = mix(base, uC, smoothstep(0.55, 0.95, n.z * 0.5 + 0.5) * step(vY, 0.2) * 0.55);
    // книзу кристалл темнеет и «тонет» во тьме
    base *= mix(0.18, 1.2, smoothstep(-1.8, 1.3, vY));

    float diffuse = max(dot(n, normalize(uLight)), 0.0);
    float rim = pow(1.0 - max(dot(n, vView), 0.0), 2.4);
    float spec = pow(diffuse, 28.0);
    // по граням медленно бежит полоса света
    float sweep = smoothstep(0.96, 1.0, sin(vY * 3.0 - uTime * 1.2)) * 0.35;

    vec3 col = base * (0.28 + 0.8 * diffuse) + uB * rim * 0.55 + vec3(spec * 0.5 + sweep * 0.5);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const haloFragment = /* glsl */ `
  uniform vec3 uA;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float d = distance(vUv, vec2(0.5));
    float glow = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uA * glow * glow, glow * uOpacity);
    #include <colorspace_fragment>
  }
`;

const uvVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const pointsVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.4 + aPhase) * 0.12;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (9.0 / -mv.z);
    vColor = aColor;
    vTwinkle = 0.55 + 0.45 * sin(uTime * 1.7 + aPhase * 3.0);
  }
`;

const pointsFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * vTwinkle);
    #include <colorspace_fragment>
  }
`;

export function createHeroScene(host: HTMLElement, { calm, lite }: Options): HeroScene {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !lite, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.25 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 7.5);

  const palette = {
    accent: tokenColor("--accent"),
    accent2: tokenColor("--accent-2"),
    hot: tokenColor("--hot"),
  };
  // смена света по мере прокрутки: фиолетовый → бирюзовый → розовый
  const stops = [palette.accent, palette.accent2, palette.hot];

  // ---------- кристалл ----------
  const group = new THREE.Group();
  scene.add(group);

  const geo = crystalGeometry();
  const uniforms = {
    uA: { value: palette.accent.clone() },
    uB: { value: palette.accent2.clone() },
    uC: { value: palette.hot.clone() },
    uLight: { value: new THREE.Vector3(-0.6, 0.8, 1) },
    uTime: { value: 0 },
  };
  const crystalMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: crystalVertex,
    fragmentShader: crystalFragment,
  });
  const crystal = new THREE.Mesh(geo, crystalMat);
  group.add(crystal);

  const edgesGeo = new THREE.EdgesGeometry(geo);
  const edgesMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  group.add(new THREE.LineSegments(edgesGeo, edgesMat));

  // ---------- ореол за кристаллом ----------
  // ореол меньше видимой области, чтобы его край никогда не упирался в границу холста
  const haloGeo = new THREE.PlaneGeometry(4, 4);
  const haloUniforms = { uA: uniforms.uA, uOpacity: { value: 0.55 } };
  const haloMat = new THREE.ShaderMaterial({
    uniforms: haloUniforms,
    vertexShader: uvVertex,
    fragmentShader: haloFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.z = -1.5;
  scene.add(halo);

  // ---------- частицы ----------
  const count = lite ? 220 : 600;
  const pos = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    // равномерно по сферическому слою вокруг кристалла
    const r = 2 + Math.random() * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos.set([r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi) * 0.8, r * Math.sin(phi) * Math.sin(theta) - 1], i * 3);
    const c = stops[i % 7 === 0 ? 2 : i % 2]!;
    colors.set([c.r, c.g, c.b], i * 3);
    sizes[i] = 2 + Math.random() * 5;
    phases[i] = Math.random() * Math.PI * 2;
  }
  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  pointsGeo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  pointsGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  pointsGeo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  const pointsMat = new THREE.ShaderMaterial({
    uniforms: { uTime: uniforms.uTime, uPixelRatio: { value: renderer.getPixelRatio() } },
    vertexShader: pointsVertex,
    fragmentShader: pointsFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(pointsGeo, pointsMat);
  scene.add(points);

  // ---------- размер ----------
  // на широком экране холст во весь hero, а кристалл стоит справа от текста
  let offsetX = 0;
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const wide = width >= 1024;
    camera.position.z = wide ? 8.5 : 8;
    camera.updateProjectionMatrix();
    // ширина видимой области на глубине кристалла (z = 0)
    const visibleW = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
    offsetX = wide ? visibleW * 0.25 : 0;
    group.position.x = halo.position.x = points.position.x = offsetX;
    if (calm) render();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  // ---------- мышь и прокрутка ----------
  const pointer = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!calm) window.addEventListener("pointermove", onPointer, { passive: true });

  let scroll = 0;
  let appear = calm ? 1 : 0;
  let appearTarget = calm ? 1 : 0;

  const tmpA = new THREE.Color();
  const tmpB = new THREE.Color();
  const mixStops = (t: number, out: THREE.Color) => {
    const x = Math.min(Math.max(t, 0), 1) * (stops.length - 1);
    const i = Math.min(Math.floor(x), stops.length - 2);
    return out.copy(stops[i]!).lerp(stops[i + 1]!, x - i);
  };

  // ---------- кадр ----------
  let last = performance.now();
  const render = () => renderer.render(scene, camera);

  // автоупрощение: если устройство долго не тянет 40 FPS — рисуем в меньшем разрешении
  let slowFor = 0;
  let downgraded = lite;

  const frame = (now: number) => {
    // время кадра в секундах; не больше 50 мс, чтобы после паузы ничего не «прыгало»
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (!downgraded) {
      slowFor = dt > 1 / 40 ? slowFor + dt : Math.max(0, slowFor - dt);
      if (slowFor > 2) {
        downgraded = true;
        renderer.setPixelRatio(1);
        pointsMat.uniforms.uPixelRatio!.value = 1;
        resize();
      }
    }
    const t = (uniforms.uTime.value += dt);

    appear += (appearTarget - appear) * Math.min(dt * 2.5, 1);
    const s = 0.6 + appear * 0.4;
    group.scale.setScalar(s);
    haloUniforms.uOpacity.value = 0.55 * appear;

    // кристалл медленно вращается, покачивается и тянется за курсором
    crystal.rotation.y += dt * (0.25 + scroll * 1.5);
    group.rotation.x += (pointer.y * 0.25 - group.rotation.x) * dt * 3;
    group.rotation.z += (-pointer.x * 0.18 - group.rotation.z) * dt * 3;
    group.position.y = Math.sin(t * 0.8) * 0.1 - scroll * 0.6;
    halo.position.y = group.position.y;
    points.rotation.y = t * 0.03 + pointer.x * 0.15;
    points.rotation.x = pointer.y * 0.08;

    // свет «перетекает» между цветами при прокрутке
    mixStops(scroll * 1.2, tmpA);
    mixStops(scroll * 1.2 + 0.5, tmpB);
    uniforms.uA.value.lerp(tmpA, dt * 3);
    uniforms.uB.value.lerp(tmpB, dt * 3);
    uniforms.uLight.value.set(-0.6 + pointer.x * 0.8, 0.8 - pointer.y * 0.5, 1);

    render();
  };

  // ---------- рисуем только когда видно ----------
  let visible = false;
  const updateLoop = () => {
    const run = visible && !document.hidden && !calm;
    if (run) last = performance.now();
    renderer.setAnimationLoop(run ? frame : null);
  };
  const io = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    updateLoop();
  });
  io.observe(host);
  document.addEventListener("visibilitychange", updateLoop);

  resize();
  if (calm) render();

  return {
    setScroll(p) {
      scroll = p;
    },
    reveal() {
      appearTarget = 1;
    },
    dispose() {
      renderer.setAnimationLoop(null);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", updateLoop);
      window.removeEventListener("pointermove", onPointer);
      [geo, edgesGeo, haloGeo, pointsGeo].forEach((g) => g.dispose());
      [crystalMat, edgesMat, haloMat, pointsMat].forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
