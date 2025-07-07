import { hc as _hc } from "hono/client";
import type { Client } from "../.hono/#hc";

const hc = (...args: Parameters<typeof _hc>): Client => _hc(...args) as any;

export default hc;
export type { ClientResponse, ClientRequest } from "hono/client";
