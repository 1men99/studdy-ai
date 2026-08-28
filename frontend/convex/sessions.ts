import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getOwnedSession, getUser, requireOwnedSession, requireUser } from "./lib/ownership";

const sessionType = v.union(
  v.literal("practice_questions"),
  v.literal("simplification"),
);

const sessionStatus = v.union(
  v.literal("pending"),
  v.literal("completed"),
  v.literal("failed"),
);

export const create = mutation({
  args: {
    type: sessionType,
    title: v.string(),
    sourceText: v.string(),
    status: sessionStatus,
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("study_sessions", {
      ...args,
      userId: user._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) {
      return [];
    }
    return await ctx.db
      .query("study_sessions")
      .withIndex("by_userId", (query) => query.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getMine = query({
  args: { sessionId: v.id("study_sessions") },
  handler: async (ctx, args) => {
    const owned = await getOwnedSession(ctx, args.sessionId);
    return owned ? owned.session : null;
  },
});

export const getDetails = query({
  args: { sessionId: v.id("study_sessions") },
  handler: async (ctx, args) => {
    const owned = await getOwnedSession(ctx, args.sessionId);
    if (!owned) {
      return null;
    }
    const questions = await ctx.db
      .query("practice_questions")
      .withIndex("by_sessionId", (query) => query.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
    const simplification = await ctx.db
      .query("simplifications")
      .withIndex("by_sessionId", (query) => query.eq("sessionId", args.sessionId))
      .order("desc")
      .first();
    const watchOutItems = simplification
      ? await ctx.db
          .query("watch_out_items")
          .withIndex("by_simplificationId", (query) =>
            query.eq("simplificationId", simplification._id),
          )
          .collect()
      : [];
    return { session: owned.session, questions, simplification, watchOutItems };
  },
});

export const updateStatus = mutation({
  args: {
    sessionId: v.id("study_sessions"),
    status: sessionStatus,
  },
  handler: async (ctx, args) => {
    await requireOwnedSession(ctx, args.sessionId);
    await ctx.db.patch(args.sessionId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { sessionId: v.id("study_sessions") },
  handler: async (ctx, args) => {
    await requireOwnedSession(ctx, args.sessionId);
    const questions = await ctx.db
      .query("practice_questions")
      .withIndex("by_sessionId", (query) => query.eq("sessionId", args.sessionId))
      .collect();
    for (const question of questions) {
      const answers = await ctx.db
        .query("question_answers")
        .withIndex("by_sessionId", (query) => query.eq("sessionId", args.sessionId))
        .filter((query) => query.eq(query.field("questionId"), question._id))
        .collect();
      for (const answer of answers) await ctx.db.delete(answer._id);
      await ctx.db.delete(question._id);
    }
    const simplifications = await ctx.db
      .query("simplifications")
      .withIndex("by_sessionId", (query) => query.eq("sessionId", args.sessionId))
      .collect();
    for (const simplification of simplifications) {
      const items = await ctx.db
        .query("watch_out_items")
        .withIndex("by_simplificationId", (query) =>
          query.eq("simplificationId", simplification._id),
        )
        .collect();
      for (const item of items) await ctx.db.delete(item._id);
      await ctx.db.delete(simplification._id);
    }
    await ctx.db.delete(args.sessionId);
  },
});