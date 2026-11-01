import { routeTable, simpleDispatch } from "./routes.mjs";
import { service } from "./service.mjs";
import { guarded, errorResponse, readJson } from "./transport.mjs";
import { fail } from "./errors.mjs";
import { compose } from "@hattip/compose";
export function createApi(db, clock) {
  const dispatch = simpleDispatch(routeTable(db, service, clock)),
    pipeline = compose(
      (ctx) => {
        ctx.handleError = (error) => errorResponse(error, crypto.randomUUID());
        ctx.locals.product = "cadencia";
        return ctx.next();
      },
      (ctx) => dispatch(ctx.request),
    );
  return guarded((request) =>
    pipeline({
      request,
      platform: {},
      env: {},
      ip: "127.0.0.1",
      waitUntil() {},
      passThrough() {},
    }),
  );
}
