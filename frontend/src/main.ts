import Doz from "doz";
import { model } from "./model";
import { motionToggle } from "./client";
let component: any;
const a = model("cadencia", () => {
    if (component) component.props.tick++;
    paint();
  }),
  d = a.d;
let current: any,
  started = 0,
  frame = 0,
  paused = matchMedia("(prefers-reduced-motion: reduce)").matches,
  visible = true;
const canvas = document.querySelector<HTMLCanvasElement>("#timeline")!;
function paint() {
  cancelAnimationFrame(frame);
  frame = 0;
  if (!visible || document.hidden) return;
  const r = d.result,
    rect = canvas.getBoundingClientRect(),
    ratio = Math.min(devicePixelRatio, 1.5);
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  const c = canvas.getContext("2d")!;
  c.scale(ratio, ratio);
  const w = rect.width,
    h = rect.height;
  c.clearRect(0, 0, w, h);
  if (!r) return;
  if (current !== r) {
    current = r;
    started = performance.now();
  }
  const max = Math.max(r.finish, r.deadline) + 1,
    left = w < 500 ? 68 : 105,
    scale = (w - left - 25) / max,
    row = (h - 65) / r.tasks.length,
    progress = paused ? 1 : Math.min(1, (performance.now() - started) / 1150);
  c.font = "8px monospace";
  c.textAlign = "center";
  for (let day = 0; day <= max; day++) {
    if (w < 600 && day % 2) continue;
    const x = left + day * scale;
    c.strokeStyle = "#a9a4a023";
    c.beginPath();
    c.moveTo(x, 30);
    c.lineTo(x, h - 20);
    c.stroke();
    c.fillStyle = "#bcb9b2";
    c.fillText(String(day), x, 17);
  }
  r.links.forEach((e: any) => {
    const from = r.tasks.find((t: any) => t.id === e.from),
      to = r.tasks.find((t: any) => t.id === e.to),
      x1 = left + from.end * scale,
      y1 = 48 + from.index * row,
      x2 = left + to.start * scale,
      y2 = 48 + to.index * row;
    c.strokeStyle = e.critical ? "#e7ef7299" : "#93918c66";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x1 + 5, y1);
    c.lineTo(x1 + 5, y2);
    c.lineTo(x2, y2);
    c.stroke();
  });
  r.tasks.forEach((t: any) => {
    const y = 48 + t.index * row,
      x = left + t.start * scale;
    c.fillStyle = "#c9c6bf";
    c.font = "9px monospace";
    c.textAlign = "right";
    c.fillText(t.id, w < 500 ? left - 12 : left - 16, y + 3);
    if (w >= 500) {
      c.font = "7px monospace";
      c.fillText(t.label, left - 16, y + 16);
    }
    c.fillStyle = t.critical ? "#e7ef72" : "#7c9690";
    c.fillRect(x, y - 10, t.duration * scale * progress, 22);
    if (t.slack) {
      c.fillStyle = "#7c969030";
      c.fillRect(x + t.duration * scale, y - 10, t.slack * scale, 22);
    }
    c.fillStyle = t.critical ? "#282a25" : "#fffaf0";
    c.font = "8px monospace";
    c.textAlign = "center";
    if (t.duration * scale > 18)
      c.fillText(String(t.duration), x + (t.duration * scale) / 2, y + 4);
  });
  const dx = left + r.deadline * scale;
  c.setLineDash([3, 4]);
  c.strokeStyle = "#e38b6c";
  c.beginPath();
  c.moveTo(dx, 27);
  c.lineTo(dx, h - 12);
  c.stroke();
  c.setLineDash([]);
  if (progress < 1 && !paused) frame = requestAnimationFrame(paint);
}
const escape = (v: any) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const button = (text: string, action: string, extra = "", disabled = false) =>
  `<button data-action="${action}" ${extra} data-locked="${d.busy || disabled}">${escape(text)}</button>`;
function template() {
  const options = (value: number) =>
    '<option value="-1"' +
    (value === -1 ? " selected" : "") +
    ">Sem dependência extra</option>" +
    d.catalog.productions[d.input.production]
      .map(
        ([label]: any, i: number) =>
          `<option value="${i}" ${value === i ? "selected" : ""}>A${i + 1} / ${escape(label)}</option>`,
      )
      .join("");
  return `<div class="production"><div class="production-head"><span>01 / COMPOR A PRODUÇÃO</span><h1>O tempo<br/>tem <em>estrutura.</em></h1></div>${d.catalog ? `<div class="controls"><div class="presets">${d.catalog.presets.map((p: any, i: number) => button(p.name + " ↗", "preset", `data-index="${i}"`)).join("")}</div><div class="task-inputs">${d.catalog.productions[d.input.production].map(([label]: any, i: number) => `<label><span>A${i + 1} / ${escape(label)}</span><input type="number" aria-label="Duração de ${escape(label)}" min="1" max="12" data-duration="${i}" value="${d.input.durations[i]}" data-locked="${d.busy}"/><small>dias</small></label>`).join("")}</div><label class="deadline">Prazo desejado <span>${d.input.deadline} dias</span><input aria-label="Prazo desejado" type="range" min="8" max="80" value="${d.input.deadline}" data-field="deadline" data-locked="${d.busy}"/></label><details class="dependency"><summary>Adicionar dependência fim → início</summary><label>Etapa anterior<select aria-label="Etapa anterior" data-field="extra_from">${options(d.input.extra_from)}</select></label><label>Etapa posterior<select aria-label="Etapa posterior" data-field="extra_to">${options(d.input.extra_to)}</select></label><small>Escolha os dois extremos. O servidor rejeita ciclos.</small></details>${button("Recalcular a produção ↗", "compute")}</div>` : button("Tentar abrir a produção", "retry")}<p class="status" role="status">${escape(d.error || d.status)}</p>${d.result ? `<div class="results"><div class="result"><strong>${d.result.finish}<small>DIAS</small></strong><p>${d.result.overrun ? "O prazo precisa de mais " + d.result.overrun + " dias." : "A produção cabe no prazo."}<br/>${d.result.parallel_peak} etapas simultâneas no pico.</p></div><details><summary>02 / CAMINHO CRÍTICO E FOLGAS</summary><p>${d.result.critical.map(escape).join(" → ")}</p><table><caption>Etapas calculadas no servidor</caption><thead><tr><th>Etapa</th><th>Início</th><th>Fim</th><th>Folga</th></tr></thead><tbody>${d.result.tasks.map((t: any) => `<tr><th scope="row">${t.id} / ${escape(t.label)}</th><td>${t.start}</td><td>${t.end}</td><td>${t.slack}</td></tr>`).join("")}</tbody></table></details></div>` : ""}<details class="archive"><summary>03 / GUARDAR ESTA PRODUÇÃO</summary><label>Nome da produção<input aria-label="Nome da produção" maxlength="48" value="${escape(d.title)}" data-title/></label>${button(d.current && d.owns ? "Salvar alterações" : "Guardar produção", "save", "", !d.result)}${d.current ? `<div class="saved-tools">${button("Reler do banco", "reload")}${button("Exportar CSV ↓", "export")}${d.owns ? button(d.current.published ? "Encerrar link" : "Criar link", "share") : ""}${button("Nova produção", "fresh")}</div>` : ""}${d.link ? `<a href="${escape(d.link)}" target="_blank" rel="noreferrer">Abrir produção compartilhada ↗</a>` : ""}<small>Retenção de 7 dias; edição nesta aba. Dias abstratos e recursos ilimitados.</small>${d.archive.map((x: any) => button(x.title + " ↗", "open", `data-id="${escape(x.id)}"`)).join("")}</details><p class="limit">Produções fictícias. Não considera feriados, custos, equipes limitadas ou reservas. Dependências fim-início; método CPM.</p></div>`;
}
const host = document.querySelector("#app-root")!;
host.replaceChildren();
host.addEventListener("click", (e) => {
  const target = (e.target as HTMLElement).closest<HTMLButtonElement>(
    "button[data-action]",
  );
  if (!target || target.disabled) return;
  const actions: any = {
    compute: () => a.run(),
    retry: () => a.init(),
    preset: () => a.preset(d.catalog.presets[+target.dataset.index!]),
    save: () => a.save(),
    reload: () => a.open(d.current.id),
    export: () => a.download(),
    share: () => a.share(),
    fresh: () => a.fresh(),
    open: () => a.open(target.dataset.id!),
  };
  actions[target.dataset.action!]?.();
});
host.addEventListener("input", (e) => {
  const input = e.target as HTMLInputElement;
  if (input.hasAttribute("data-title")) a.title(input.value);
  else if (input.dataset.field === "deadline")
    a.change("deadline", +input.value);
  else if (input.dataset.duration != null) {
    const durations = [...d.input.durations];
    durations[+input.dataset.duration] = +input.value;
    a.change("durations", durations);
  }
});
host.addEventListener("change", (e) => {
  const input = e.target as HTMLInputElement;
  if (input.dataset.duration != null) {
    const durations = [...d.input.durations];
    durations[+input.dataset.duration] = +input.value;
    a.change("durations", durations);
  } else if (input.dataset.field) a.change(input.dataset.field, +input.value);
});
function syncControls() {
  host
    .querySelectorAll<HTMLButtonElement | HTMLInputElement>("[data-locked]")
    .forEach((node) => {
      node.disabled = node.dataset.locked === "true";
    });
  host
    .querySelectorAll<HTMLSelectElement>("select[data-field]")
    .forEach((node) => {
      node.value = String(d.input?.[node.dataset.field!]);
    });
}
new Doz({
  root: "#app-root",
  props: { tick: 0 },
  template,
  onUpdate() {
    queueMicrotask(syncControls);
  },
  onMount(this: any) {
    component = this;
    syncControls();
    void a.init();
  },
});
const resize = new ResizeObserver(paint);
resize.observe(canvas);
const observer = new IntersectionObserver((entries) => {
  visible = entries[0].isIntersecting;
  if (visible) paint();
  else {
    cancelAnimationFrame(frame);
    frame = 0;
  }
});
observer.observe(canvas);
document.addEventListener("visibilitychange", () =>
  document.hidden ? cancelAnimationFrame(frame) : paint(),
);
motionToggle((value) => {
  paused = value;
  paint();
});
window.addEventListener(
  "pagehide",
  () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    observer.disconnect();
  },
  { once: true },
);
