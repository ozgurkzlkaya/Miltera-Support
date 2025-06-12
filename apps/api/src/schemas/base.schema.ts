import { buildResponseErrorSchema } from "../helpers/response.helpers";
import { z } from "zod";

const Error500Schema = buildResponseErrorSchema(z.string(), z.string());
const Error404Schema = buildResponseErrorSchema(z.string(), z.string());
const Error422Schema = buildResponseErrorSchema(z.string(), z.string());

export { Error500Schema, Error404Schema, Error422Schema };
