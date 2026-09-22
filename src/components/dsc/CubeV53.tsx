import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useDscStore } from "./store";
import { positioned, scientificReport } from "./dossier";
import { AXES, CAUTION } from "./science";

const layers = [
  "Support",
  "Préparation",
  "Polychromie originale probable",
  "Glacis, patine ou voile",
  "Surpeint",
  "Ancienne résine ou intervention",
  "Dépôt superficiel",
];
const zones = [
  "Famille lipidique — illustration",
  "Famille résineuse — illustration",
  "Famille protéinique — illustration",
  "Réseau mixte — illustration",
];
export function CubeV53({ onCapture }: { onCapture: (text: string) => void }) {
  const store = useDscStore();
  const h = store.hypothesis;
  const valid = Boolean(store.activeSystem) && positioned(h);
  const report = scientificReport(store.data);
  const host = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reset = useRef<() => void>(() => {});
  const [mode, setMode] = useState<"dsc" | "layers">("dsc");
  const [opacity, setOpacity] = useState(0.35);
  const [grid, setGrid] = useState(true);
  const [exploded, setExploded] = useState(false);
  const [cut, setCut] = useState(false);
  const [labels, setLabels] = useState(true);
  const [selected, setSelected] = useState("");
  const [hidden, setHidden] = useState<string[]>([]);
  const coords = useMemo(
    () => (valid ? [h.x, h.y, h.z] : [null, null, null]),
    [valid, h.x, h.y, h.z],
  );
  const systemId = store.activeSystem?.id ?? null;
  const comparison = (systemId && store.data.comparison[systemId]) || {};
  const setComparison = (next: Record<string, string>) => {
    if (systemId) store.update({ comparison: { ...store.data.comparison, [systemId]: next } });
  };
  const [trajectory, setTrajectory] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const names = useMemo(
    () =>
      mode === "dsc"
        ? zones
        : store.activeSystem
          ? (store.activeSystem.layers ?? []).map((l) => l.name)
          : layers,
    [mode, store.activeSystem],
  );
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
    } catch {
      setError(
        "Vue 3D indisponible sur cet appareil. Les descriptions et données restent accessibles.",
      );
      return;
    }
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.localClippingEnabled = true;
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(5, 4, 6);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    reset.current = () => {
      camera.position.set(5, 4, 6);
      controls.target.set(0, 0, 0);
      controls.update();
    };
    scene.add(new THREE.AmbientLight(0xffffff, 2));
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(4, 6, 5);
    scene.add(light);
    const css = getComputedStyle(element);
    const colors = [
      "--axis-x",
      "--axis-y",
      "--axis-z",
      "--gold",
      "--zone-violet",
      "--zone-cyan",
      "--muted-foreground",
    ].map((x) => new THREE.Color(css.getPropertyValue(x).trim()));
    const lineColor = new THREE.Color(css.getPropertyValue("--scene-grid").trim());
    if (grid) {
      const helper = new THREE.GridHelper(3, 10, lineColor, lineColor);
      helper.position.y = -1.5;
      scene.add(helper);
      const box = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(3, 3, 3)),
        new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: 0.6 }),
      );
      scene.add(box);
    }
    if (mode === "dsc") {
      const origin = new THREE.Vector3(-1.5, -1.5, 1.5);
      [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0)].forEach(
        (dir, i) => scene.add(new THREE.ArrowHelper(dir, origin, 3.4, colors[i], 0.15, 0.08)),
      );
    }
    const meshes: THREE.Mesh[] = [];
    names.forEach((name, i) => {
      if (hidden.includes(name)) return;
      const geometry =
        mode === "dsc"
          ? new THREE.SphereGeometry(1, 36, 24)
          : new THREE.BoxGeometry(2.6, 0.22, 2.2);
      const material = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        transparent: true,
        opacity,
        roughness: 0.4,
        depthWrite: false,
        side: THREE.DoubleSide,
        clippingPlanes: cut ? [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0)] : [],
        emissive: name === selected ? colors[i % colors.length] : new THREE.Color(0),
        emissiveIntensity: 0.25,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = name;
      if (mode === "dsc") {
        mesh.scale.set(0.95, 0.28 + i * 0.045, 0.75);
        mesh.position.set(i % 2 === 0 ? -0.25 : 0.3, -1 + i * 0.62, 0);
      } else {
        mesh.position.y = (i - 3) * (exploded ? 0.44 : 0.24);
      }
      meshes.push(mesh);
      scene.add(mesh);
    });
    const [x, y, z] = coords;
    if (mode === "dsc" && x != null && y != null && z != null) {
      const lo = (c: number) => Math.max(0, c - h.envelope);
      const hi = (c: number) => Math.min(100, c + h.envelope);
      const span = (c: number) => Math.max(hi(c) - lo(c), 0.001) * 0.03;
      const mid = (c: number) => (lo(c) + hi(c)) / 2;
      const p = new THREE.Vector3((x - 50) * 0.03, (z - 50) * 0.03, (50 - y) * 0.03);
      const envelope = new THREE.Mesh(
        new THREE.BoxGeometry(span(x), span(z), span(y)),
        new THREE.MeshStandardMaterial({ color: colors[3], transparent: true, opacity: 0.2 }),
      );
      envelope.position.set((mid(x) - 50) * 0.03, (mid(z) - 50) * 0.03, (50 - mid(y)) * 0.03);
      scene.add(envelope);
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 16, 16),
        new THREE.MeshStandardMaterial({ color: colors[3] }),
      );
      dot.position.copy(p);
      scene.add(dot);
      if (trajectory) {
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), p]),
          new THREE.LineDashedMaterial({ color: colors[3], dashSize: 0.1, gapSize: 0.08 }),
        );
        line.computeLineDistances();
        scene.add(line);
      }
    }
    const resize = new ResizeObserver(() => {
      const w = element.clientWidth,
        h = element.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resize.observe(element);
    let down = [0, 0];
    const pointerDown = (e: PointerEvent) => {
      down = [e.clientX, e.clientY];
    };
    const click = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const ray = new THREE.Raycaster();
      ray.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      const hit = ray.intersectObjects(meshes)[0];
      if (hit) setSelected(hit.object.name);
    };
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointerup", click);
    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });
    return () => {
      resize.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Line) {
          o.geometry.dispose();
          const materials = Array.isArray(o.material) ? o.material : [o.material];
          materials.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      rendererRef.current = null;
    };
  }, [mode, names, opacity, grid, exploded, cut, hidden, selected, coords, trajectory, h.envelope]);
  const exportPNG = () => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "dsc-illustration-v5.3.png";
    const output = document.createElement("canvas");
    const lines = report.split("\n").flatMap((line) => line.match(/.{1,100}/g) ?? [""]);
    output.width = Math.max(canvas.width, 900);
    output.height = canvas.height + lines.length * 20 + 40;
    const ctx = output.getContext("2d");
    if (!ctx) return;
    const css = getComputedStyle(document.body);
    ctx.fillStyle = css.getPropertyValue("--background").trim();
    ctx.fillRect(0, 0, output.width, output.height);
    ctx.drawImage(canvas, 0, 0);
    ctx.fillStyle = css.getPropertyValue("--foreground").trim();
    ctx.font = "14px sans-serif";
    lines.forEach((line, i) => ctx.fillText(line, 20, canvas.height + 25 + i * 20));
    a.href = output.toDataURL();
    a.click();
  };
  return (
    <section className="science-panel">
      <h2>Cube DSC 3D</h2>
      <p role="status">
        {valid ? "Hypothèse DSC — enveloppe incertaine, non mesure" : "Position Z indéterminée"}
      </p>
      <p>{CAUTION}</p>
      <div className="tool-row" role="group" aria-label="Représentation">
        <button
          aria-pressed={mode === "dsc"}
          onClick={() => {
            setMode("dsc");
            setSelected("");
          }}
        >
          Espace DSC
        </button>
        <button
          aria-pressed={mode === "layers"}
          onClick={() => {
            setMode("layers");
            setSelected("");
          }}
        >
          Stratigraphie
        </button>
      </div>
      <div className="cube-layout">
        <aside className="cube-controls">
          <details open>
            <summary>{mode === "dsc" ? "Volumes conceptuels" : "Couches matérielles"}</summary>
            {names.map((name) => (
              <div className="layer-row" key={name}>
                <input
                  aria-label={`Afficher ${name}`}
                  type="checkbox"
                  checked={!hidden.includes(name)}
                  onChange={(e) =>
                    setHidden(
                      e.target.checked ? hidden.filter((x) => x !== name) : [...hidden, name],
                    )
                  }
                />
                <button onClick={() => setSelected(name)} aria-pressed={selected === name}>
                  {name}
                </button>
              </div>
            ))}
            <button
              onClick={() => setHidden(selected ? names.filter((x) => x !== selected) : [])}
              disabled={!selected}
            >
              Isoler la sélection
            </button>
            <button onClick={() => setHidden([])}>Tout afficher</button>
          </details>
        </aside>
        <div className="cube-center">
          <div
            ref={host}
            className="cube-scene"
            aria-label={
              mode === "dsc"
                ? "Espace conceptuel DSC interactif"
                : "Couches stratigraphiques illustratives"
            }
          >
            {error && <p>{error}</p>}
          </div>
          <div className="tool-row">
            <button onClick={() => reset.current()} title="Réinitialiser la vue">
              ↺ Réinitialiser la vue
            </button>
            <button onClick={exportPNG}>↓ PNG</button>
            <button onClick={() => onCapture(report)}>Capturer → Fiche</button>
          </div>
          <div className="tool-row">
            <label>
              <input type="checkbox" checked={grid} onChange={(e) => setGrid(e.target.checked)} />{" "}
              Grilles
            </label>
            <label>
              <input
                type="checkbox"
                checked={labels}
                onChange={(e) => setLabels(e.target.checked)}
              />{" "}
              Libellés
            </label>
            <label>
              Opacité
              <input
                type="range"
                min="0.05"
                max="0.9"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
              />
            </label>
          </div>
          {mode === "layers" ? (
            <div className="tool-row">
              <label>
                <input
                  type="checkbox"
                  checked={exploded}
                  onChange={(e) => setExploded(e.target.checked)}
                />{" "}
                Vue éclatée
              </label>
              <label>
                <input type="checkbox" checked={cut} onChange={(e) => setCut(e.target.checked)} />{" "}
                Plan de coupe
              </label>
              <button
                onClick={() => {
                  setExploded(false);
                  setCut(false);
                  setHidden([]);
                }}
              >
                Réassembler
              </button>
            </div>
          ) : (
            <>
              {labels && (
                <ul className="axis-legend">
                  {AXES.map((a, i) => (
                    <li key={a} data-axis={i}>
                      {a}
                    </li>
                  ))}
                </ul>
              )}
              <p>
                Volumes et positions : illustrations pédagogiques, sans attribution scientifique. Z
                regroupe six composantes indépendantes, sans agrégation ; ce n’est pas une
                profondeur.
              </p>
            </>
          )}
          {mode === "layers" && (
            <p>
              Empilement illustratif, épaisseurs non mesurées. Une couche matérielle n’est pas une
              zone comportementale DSC.
            </p>
          )}
        </div>
        <aside className="cube-properties">
          <details open>
            <summary>{selected || "Détail de la sélection"}</summary>
            <p>
              Statut : illustration pédagogique.
              <br />
              Coordonnées, incertitude, matériau réel et sources : Non documenté.
            </p>
            {selected && (
              <label>
                Observations / contradictions / sources
                <textarea
                  value={notes[selected] ?? ""}
                  onChange={(e) => setNotes({ ...notes, [selected]: e.target.value })}
                />
              </label>
            )}
          </details>
          <details>
            <summary>Position conceptuelle de l’hypothèse</summary>
            <p>
              Repères graphiques 0–100, sans unité physique, sans conversion depuis Teas ou Hansen.
            </p>
            <p>
              {valid
                ? "Hypothèse DSC — enveloppe incertaine, non mesure"
                : "Position Z indéterminée"}
            </p>
            <label>
              <input
                type="checkbox"
                checked={trajectory}
                onChange={(e) => setTrajectory(e.target.checked)}
              />{" "}
              Trajectoire opératoire DSC — hypothèse de déplacement conceptuel
            </label>
          </details>
          <details>
            <summary>Paramètres Teas/VRS — données de comparaison</summary>
            {["FD", "FP", "FH", "Extension VRS"].map((k) => (
              <label key={k}>
                {k}
                <input
                  type="number"
                  placeholder="Non documenté"
                  value={comparison[k] ?? ""}
                  onChange={(e) => setComparison({ ...comparison, [k]: e.target.value })}
                />
              </label>
            ))}
            <p>
              Source, unité et définition VRS : Non documenté. Correspondance expérimentale ou
              conceptuelle non validée. Aucun effet sur les coordonnées DSC.
            </p>
          </details>
        </aside>
      </div>
    </section>
  );
}
