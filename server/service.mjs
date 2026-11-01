import { validateInput } from "./validator.mjs";
import { fail } from "./errors.mjs";
export const productions = {
  short: [
    ["Roteiro", []],
    ["Locações", [0]],
    ["Elenco", [0]],
    ["Arte", [1]],
    ["Filmagem", [2, 3]],
    ["Montagem", [4]],
    ["Som e cor", [5]],
    ["Estreia", [6]],
  ],
  launch: [
    ["Conceito", []],
    ["Pesquisa", [0]],
    ["Protótipo", [1]],
    ["Identidade", [0]],
    ["Produção", [2, 3]],
    ["Lançamento", [4]],
  ],
  exhibition: [
    ["Curadoria", []],
    ["Acervo", [0]],
    ["Espaço", [0]],
    ["Expografia", [1, 2]],
    ["Montagem", [3]],
    ["Luz", [4]],
    ["Abertura", [5]],
  ],
};
export const meta = {
  slug: "cadencia",
  title: "CADÊNCIA",
  engine: "hattip-runtypes-critical-path",
  productions,
  default_input: {
    production: "short",
    durations: [3, 2, 2, 3, 4, 5, 3, 1],
    deadline: 24,
    extra_from: -1,
    extra_to: -1,
  },
  presets: [
    {
      name: "Curta-metragem",
      input: {
        production: "short",
        durations: [3, 2, 2, 3, 4, 5, 3, 1],
        deadline: 24,
        extra_from: -1,
        extra_to: -1,
      },
    },
    {
      name: "Lançamento",
      input: {
        production: "launch",
        durations: [2, 3, 4, 5, 3, 1],
        deadline: 16,
        extra_from: -1,
        extra_to: -1,
      },
    },
    {
      name: "Exposição",
      input: {
        production: "exhibition",
        durations: [2, 4, 3, 3, 2, 1, 1],
        deadline: 18,
        extra_from: -1,
        extra_to: -1,
      },
    },
  ],
  note: "Projetos e durações fictícios em dias abstratos consecutivos, sem calendário, feriados, custos ou reservas reais. Caminho crítico pressupõe recursos ilimitados e dependências fim-início.",
};
export function validate(raw) {
  const p = validateInput(raw),
    n = productions[p.production].length;
  if (
    p.durations.length !== n ||
    p.extra_from >= n ||
    p.extra_to >= n ||
    p.extra_from < 0 !== p.extra_to < 0 ||
    (p.extra_from === p.extra_to && p.extra_from >= 0)
  )
    fail(
      "invalid_input",
      "Confira durações e os dois extremos da dependência extra.",
    );
  return p;
}
export function compute(raw) {
  const p = validate(raw),
    base = productions[p.production],
    tasks = base.map(([label, deps], i) => ({
      id: "A" + (i + 1),
      index: i,
      label,
      deps: [...deps],
      duration: p.durations[i],
    }));
  if (p.extra_from >= 0 && !tasks[p.extra_to].deps.includes(p.extra_from))
    tasks[p.extra_to].deps.push(p.extra_from);
  const remaining = new Map(tasks.map((t) => [t.index, t.deps.length])),
    ready = tasks.filter((t) => !t.deps.length).map((t) => t.index),
    order = [];
  while (ready.length) {
    ready.sort((a, b) => a - b);
    const i = ready.shift();
    order.push(i);
    for (const t of tasks)
      if (t.deps.includes(i)) {
        remaining.set(t.index, remaining.get(t.index) - 1);
        if (!remaining.get(t.index)) ready.push(t.index);
      }
  }
  if (order.length !== tasks.length)
    fail(
      "cycle",
      "Essa dependência cria um ciclo. O tempo não pode andar para trás.",
    );
  for (const i of order) {
    const t = tasks[i];
    t.start = t.deps.length ? Math.max(...t.deps.map((d) => tasks[d].end)) : 0;
    t.end = t.start + t.duration;
  }
  const finish = Math.max(...tasks.map((t) => t.end));
  for (const i of [...order].reverse()) {
    const t = tasks[i],
      successors = tasks.filter((x) => x.deps.includes(i));
    t.latest_end = successors.length
      ? Math.min(...successors.map((x) => x.latest_start))
      : finish;
    t.latest_start = t.latest_end - t.duration;
    t.slack = t.latest_start - t.start;
    t.critical = t.slack === 0;
  }
  const links = tasks.flatMap((t) =>
    t.deps.map((d) => ({
      from: tasks[d].id,
      to: t.id,
      critical: t.critical && tasks[d].critical && tasks[d].end === t.start,
    })),
  );
  return {
    tasks,
    links,
    finish,
    deadline: p.deadline,
    overrun: Math.max(0, finish - p.deadline),
    critical: tasks.filter((t) => t.critical).map((t) => t.id),
    order: order.map((i) => tasks[i].id),
    parallel_peak: Math.max(
      ...Array.from(
        { length: finish },
        (_, day) => tasks.filter((t) => t.start <= day && t.end > day).length,
      ),
    ),
    units: "dias abstratos",
  };
}
export function exportResult(input) {
  const r = compute(input);
  return {
    type: "text/csv; charset=utf-8",
    extension: "csv",
    text:
      "id,etapa,inicio,fim,duracao,folga,critica\n" +
      r.tasks
        .map((t) =>
          [t.id, t.label, t.start, t.end, t.duration, t.slack, t.critical].join(
            ",",
          ),
        )
        .join("\n") +
      "\n",
  };
}
export const service = { meta, validate, compute, export: exportResult };
