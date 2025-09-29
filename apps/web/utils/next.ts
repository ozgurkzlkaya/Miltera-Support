const getMaybeNextHeaders = async () => {
  let headersPromise:
    | Promise<ReturnType<typeof import("next/headers").headers>>
    | undefined;

  if (process.env.NEXT_RUNTIME) {
    // allow both server and client calls
    headersPromise = import("next/headers").then((a) => a.headers());
  }

  const headers = headersPromise ? await headersPromise : undefined;
  return headers;
};

export { getMaybeNextHeaders };
