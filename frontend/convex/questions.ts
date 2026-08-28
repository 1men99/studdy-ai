import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getOwnedSession, requireOwnedSession } from "./lib/ownership";

const questionType = v.union(
  v.literal("multiple_choice"),
  v.literal("true_false"),
  v.literal("fill_blank"),
  v.literal("short_answer"),
);

export const add = mutation({
  args: {
    sessionId: v.id("study_sessions"),
    questionNumber: v.number(),
    type: questionType,
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.string(),
    explanation: v.string(),
  },
  handler: async (ctx, args) => {
    await requireOwnedSession(ctx, args.sessionId);
    return await ctx.db.insert("practice_questions", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listForSession = query({
  args: { sessionId: v.id("study_sessions") },
  handler: async (ctx, args) => {
    const owned = await getOwnedSession(ctx, args.sessionId);
    if (!owned) {
      return [];
    }
    return await ctx.db
      .query("practice_questions")
      .withIndex("by_sessionId", (query) =>
        query.eq("sessionId", args.sessionId),
      )
      .order("asc")
      .collect();
  },
});

export const recordAnswer = mutation({
  args: {
    sessionId: v.id("study_sessions"),
    questionId: v.id("practice_questions"),
    userAnswer: v.string(),
    isCorrect: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireOwnedSession(ctx, args.sessionId);
    const question = await ctx.db.get(args.questionId);
    if (!question || question.sessionId !== args.sessionId) {
      throw new Error("Question not found");
    }

    return await ctx.db.insert("question_answers", {
      ...args,
      answeredAt: Date.now(),
    });
  },
});