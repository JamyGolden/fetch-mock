export default CallHistory;
export type RouteConfig = import("./Route").RouteConfig;
export type RouteName = import("./Route").RouteName;
export type NormalizedRequestOptions = import("./RequestUtils").NormalizedRequestOptions;
export type RouteMatcher = import("./Matchers").RouteMatcher;
export type FetchMockConfig = import("./FetchMock").FetchMockConfig;
export type CallLog = {
    arguments: any[];
    url: string;
    options: NormalizedRequestOptions;
    request?: Request;
    signal?: AbortSignal;
    route?: Route;
    response?: Response;
    expressParams?: {
        [x: string]: string;
    };
    queryParams?: {
        [x: string]: string;
    };
    pendingPromises: Promise<any>[];
};
export type Matched = "matched";
export type Unmatched = "unmatched";
export type CallHistoryFilter = RouteName | Matched | Unmatched | boolean | RouteMatcher;
declare class CallHistory {
    constructor(globalConfig: FetchMockConfig, router: Router);
    callLogs: CallLog[];
    config: import("./FetchMock").FetchMockConfig;
    router: Router;
    recordCall(callLog: CallLog): void;
    clear(): void;
    flush(waitForResponseMethods?: boolean): Promise<void>;
    calls(filter: CallHistoryFilter, options: RouteConfig): CallLog[];
    called(filter: CallHistoryFilter, options: RouteConfig): boolean;
    lastCall(filter: CallHistoryFilter, options: RouteConfig): CallLog;
    done(routeNames?: RouteName | RouteName[]): boolean;
}
import Route from './Route.js';
import Router from './Router.js';