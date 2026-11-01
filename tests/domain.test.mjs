import { test } from "node:test";
import assert from "node:assert/strict";
import { service } from "../server/service.mjs";

test("earliest finish equals independent recursive longest-path oracle", () => {
  for (const p of service.meta.presets) {
    const r = service.compute(p.input),
      byId = new Map(r.tasks.map((t) => [t.index, t])),
      end = (i) =>
        byId.get(i).duration +
        (byId.get(i).deps.length ? Math.max(...byId.get(i).deps.map(end)) : 0);
    assert.equal(r.finish, Math.max(...r.tasks.map((t) => end(t.index))));
  }
});
test("every task respects dependency finish and nonnegative slack", () => {
  for (const p of service.meta.presets) {
    const r = service.compute(p.input);
    for (const t of r.tasks) {
      assert.ok(t.slack >= 0);
      for (const dep of t.deps) assert.ok(t.start >= r.tasks[dep].end);
      assert.equal(t.critical, t.slack === 0);
    }
  }
});
test("cycle is rejected before pretending to produce a schedule", () => {
  assert.throws(
    () =>
      service.compute({
        ...service.meta.default_input,
        extra_from: 7,
        extra_to: 0,
      }),
    (e) => e.code === "cycle",
  );
});
test("tight deadline reports exact overrun", () => {
  const p = { ...service.meta.default_input, deadline: 8 },
    r = service.compute(p);
  assert.equal(r.overrun, r.finish - 8);
});
test("duplicate existing dependency does not count duration twice", () => {
  const p = service.meta.default_input;
  assert.equal(
    service.compute({ ...p, extra_from: 0, extra_to: 1 }).finish,
    service.compute(p).finish,
  );
  assert.equal(service.export(p).text.trim().split("\n").length, 9);
});
test("wrong task count missing dependency endpoint and extra fields rejected", () => {
  for (const x of [
    { durations: [1, 2, 3, 4, 5, 6] },
    { extra_from: 0, extra_to: -1 },
    { extra_from: 2, extra_to: 2 },
    { deadline: 0 },
    { extra: 1 },
  ])
    assert.throws(() =>
      service.compute({ ...service.meta.default_input, ...x }),
    );
});
