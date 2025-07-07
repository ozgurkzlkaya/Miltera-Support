import type { SQL } from "drizzle-orm";
import { customType, type Precision } from "drizzle-orm/pg-core";

const customTimestamp = customType<{
  data: Date;
  driverData: string;
  config?: { precision: Precision; withTimezone: boolean };
}>({
  dataType(config) {
    const precision = config?.precision ? ` (${config.precision})` : "";
    const timezone = config?.withTimezone
      ? config.withTimezone
        ? " with time zone"
        : " without time zone"
      : "";

    return `timestamp${precision}${timezone}`;
  },
  fromDriver(value: string): Date {
    return new Date(value);
  },
  toDriver(value: Date | SQL): string | SQL {
    if (value instanceof Date) {
      return value.toISOString();
    } else {
      return value;
    }
  },
});

export { customTimestamp };
