import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getOwnedSession, requireOwnedSession } from "./lib/ownership";

export const create = mutation({
  args: {
    sessionId: v.id("study_sessions"),
    originalText: v.string(),
    plainLanguage: v.string(),
  },
  handler: async (ctx, args) => {
    const { session } = await requireOwnedSession(ctx, args.sessionId);
    if (session.type !== "simplification") {
      throw new Error("Invalid session type");
    }

    return await ctx.db.insert("simplifications", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getForSession = query({
  args: { sessionId: v.id("study_sessions") },
  handler: async (ctx, args) => {
    const owned = await getOwnedSession(ctx, args.sessionId);
    if (!owned) {
      return null;
    }
    return await ctx.db
      .query("simplifications")
      .withIndex("by_sessionId", (query) =>
        query.eq("sessionId", args.sessionId),
      )
      .order("desc")
      .first();
  },
});

export const addWatchOut = mutation({
  args: {
    simplificationId: v.id("simplifications"),
    category: v.string(),
    title: v.string(),
    description: v.string(),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("alert")),
  },
  handler: async (ctx, args) => {
    const simplification = await ctx.db.get(args.simplificationId);
    if (!simplification) throw new Error("Simplification not found");
    await requireOwnedSession(ctx, simplification.sessionId);
    return await ctx.db.insert("watch_out_items", { ...args, createdAt: Date.now() });
  },
});