import { router } from "../trpc";
import { authRouter } from "./auth";
import { accountRouter } from "./account";

export const appRouter = router({
  auth: authRouter,
  account: accountRouter,
});

// -- This extracts the type from the actual router implementation (appRouter) without
// -- exporting the implementation itself
export type AppRouter = typeof appRouter;
