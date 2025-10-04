declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
declare let pool: any;
declare const app: import("express-serve-static-core").Express;
export { app, pool };
//# sourceMappingURL=server.d.ts.map