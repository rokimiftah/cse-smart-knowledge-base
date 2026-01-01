/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_aiAnalyzer from "../actions/aiAnalyzer.js";
import type * as actions_githubFetcher from "../actions/githubFetcher.js";
import type * as actions_manualSync from "../actions/manualSync.js";
import type * as actions_syncIssues from "../actions/syncIssues.js";
import type * as crons from "../crons.js";
import type * as lib_openai from "../lib/openai.js";
import type * as mutations_clearIssues from "../mutations/clearIssues.js";
import type * as mutations_saveIssue from "../mutations/saveIssue.js";
import type * as queries_getDashboardStats from "../queries/getDashboardStats.js";
import type * as queries_getIssueByGithubId from "../queries/getIssueByGithubId.js";
import type * as queries_getIssues from "../queries/getIssues.js";
import type * as queries_getIssuesWithPagination from "../queries/getIssuesWithPagination.js";
import type * as queries_keywordSearch from "../queries/keywordSearch.js";
import type * as queries_searchIssues from "../queries/searchIssues.js";
import type * as queries_vectorSearch from "../queries/vectorSearch.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/aiAnalyzer": typeof actions_aiAnalyzer;
  "actions/githubFetcher": typeof actions_githubFetcher;
  "actions/manualSync": typeof actions_manualSync;
  "actions/syncIssues": typeof actions_syncIssues;
  crons: typeof crons;
  "lib/openai": typeof lib_openai;
  "mutations/clearIssues": typeof mutations_clearIssues;
  "mutations/saveIssue": typeof mutations_saveIssue;
  "queries/getDashboardStats": typeof queries_getDashboardStats;
  "queries/getIssueByGithubId": typeof queries_getIssueByGithubId;
  "queries/getIssues": typeof queries_getIssues;
  "queries/getIssuesWithPagination": typeof queries_getIssuesWithPagination;
  "queries/keywordSearch": typeof queries_keywordSearch;
  "queries/searchIssues": typeof queries_searchIssues;
  "queries/vectorSearch": typeof queries_vectorSearch;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
