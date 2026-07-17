/* eslint-disable */
import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auditLogs from "../auditLogs";
import type * as leads from "../leads";
import type * as notifications from "../notifications";
import type * as quotes from "../quotes";
import type * as tenants from "../tenants";

declare const fullApi: ApiFromModules<{
  auditLogs: typeof auditLogs;
  leads: typeof leads;
  notifications: typeof notifications;
  quotes: typeof quotes;
  tenants: typeof tenants;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
