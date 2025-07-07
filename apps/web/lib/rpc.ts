/* eslint-disable turbo/no-undeclared-env-vars */

import hc, { type ClientResponse } from "@miltera/api/hc";

let appPromise: Promise<typeof import("@miltera/api/app").default> | null;

if (process.env.NEXT_RUNTIME) {
  // prevent sending to client (browser)
  appPromise = import("@miltera/api/app").then((a) => a.default);
}

const hybridFetch = (async (url, init) => {
  const request = new Request(url, {
    ...init,
    credentials: "include", // Required for sending cookies cross-origin
  });

  if (typeof window !== "undefined" && !process.env.NEXT_RUNTIME) {
    // browser

    return fetch(request);
  } else if (process.env.NEXT_RUNTIME && appPromise) {
    // internal request (server)

    const app = await appPromise;
    return app.fetch(request);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as typeof fetch;

const client = hc("http://localhost:3000", {
  fetch: hybridFetch,
});

const callRPC = async <
  T extends Promise<ClientResponse<any, any, any>>,
  R extends Awaited<ReturnType<Awaited<T>["json"]>>,
>(
  rpc: T
): Promise<R extends { data: any } ? R : never> => {
  const res = await rpc;
  const contentType = res.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const json = await res.json();

    if (!res.ok || !json.success) {
      const err = Object.assign(
        new Error(`API Error: ${json.error?.message || res.statusText}`),
        {
          res: res,
          data: json.error,
        }
      );

      throw err;
    }

    return json;
  }

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  return undefined as any;
};

export { client, callRPC, hybridFetch };
