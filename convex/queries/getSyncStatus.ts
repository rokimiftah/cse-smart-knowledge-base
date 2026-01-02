import { query } from "../_generated/server";

export const getSyncStatus = query({
  args: {},
  handler: async (ctx) => {
    const status = await ctx.db.query("syncStatus").first();
    return status ?? { isRunning: false };
  },
});
