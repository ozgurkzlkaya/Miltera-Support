/* eslint-disable turbo/no-undeclared-env-vars */

import type { AppType } from "@miltera/api/app";
import { hc, type ClientResponse } from "hono/client";
import type { ResponseFormat } from "hono/types";
import type { StatusCode } from "hono/utils/http-status";

let appPromise: Promise<AppType> | null;

if (process.env.NEXT_RUNTIME) {
  // prevent sending to client (browser)
  appPromise = import("@miltera/api/app").then((a) => a.default);
}

const client = hc<AppType>("http://localhost:3000", {
  fetch: (async (url: string, init: RequestInit) => {
    const request = new Request(url, init);

    // url always string
    if (typeof window !== "undefined" && !process.env.NEXT_RUNTIME) {
      // browser

      return fetch(request);
    } else if (process.env.NEXT_RUNTIME && appPromise) {
      // internal request (server)

      const app = await appPromise;
      return app.fetch(request);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any,
});

const callRPC = async <
  T extends Promise<ClientResponse<any, any, any>>,
  R extends Awaited<ReturnType<Awaited<T>["json"]>>,
>(
  rpc: T
): Promise<R extends { data: any } ? R["data"] : never> => {
  const res = await rpc;
  const json = await res.json();

  if (!res.ok || !json.success) {
    const err = Object.assign(new Error(`Error`), {
      res: res,
      data: json.error,
    });

    throw err;
  }

  return json.data;
};

export { client, callRPC };
