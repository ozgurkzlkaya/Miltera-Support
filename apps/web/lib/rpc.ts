/* eslint-disable turbo/no-undeclared-env-vars */

import type { AppType } from "@miltera/api/app";
import { hc } from "hono/client";

let appPromise: Promise<AppType> | null;

if (process.env.NEXT_RUNTIME) {
  // prevent sending to client (browser)
  appPromise = import("@miltera/api/app").then((a) => a.default);
}

const client = hc<AppType>("http://localhost:3000", {
  fetch: (async (url: string, init: RequestInit) => {
    // url always string
    if (typeof window !== "undefined" && !process.env.NEXT_RUNTIME) {
      // browser
      return fetch(url, init);
    } else if (process.env.NEXT_RUNTIME && appPromise) {
      // internal request (server)
      const app = await appPromise;
      const request = new Request(url, init);
      return app.fetch(request);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any,
});

export { client };
