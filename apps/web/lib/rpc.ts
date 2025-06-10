import app, { type AppType } from "@miltera/api/app";
import { hc } from "hono/client";

const client = hc<AppType>("http://localhost:3000", {
  fetch: ((url: string, init: RequestInit) => {
    // url always string
    if (typeof window !== "undefined") {
      // browser
      return fetch(url, init);
    } else {
      // internal request (server)
      const request = new Request(url, init);
      return app.fetch(request);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any,
});

export { client };
