import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const sessionType = v.union(
  v.literal("practice_questions"),
  v.literal("simplification"),
);

const sessionStatus = v.union(
  v.literal("pending"),
  v.literal("completed"),
  v.literal("failed"),
);

const questionType = v.union(
  v.literal("multiple_choice"),
  v.literal("true_false"),
  v.literal("fill_blank"),
  v.literal("short_answer"),
);

const severity = v.union(
  v.literal("info"),
  v.literal("warning"),
  v.literal("alert"),
);

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    fullName: v.string(),
    imageUrl: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  study_sessions: defineTable({
    userId: v.id("users"),
    type: sessionType,
    title: v.string(),
    sourceText: v.string(),
    status: sessionStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  practice_questions: defineTable({
    sessionId: v.id("study_sessions"),
    questionNumber: v.number(),
    type: questionType,
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.string(),
    explanation: v.string(),
    createdAt: v.number(),
  }).index("by_sessionId", ["sessionId"]),

  question_answers: defineTable({
    sessionId: v.id("study_sessions"),
    questionId: v.id("practice_questions"),
    userAnswer: v.string(),
    isCorrect: v.boolean(),
    answeredAt: v.number(),
  }).index("by_sessionId", ["sessionId"]),

  simplifications: defineTable({
    sessionId: v.id("study_sessions"),
    originalText: v.string(),
    plainLanguage: v.string(),
    createdAt: v.number(),
  }).index("by_sessionId", ["sessionId"]),

  watch_out_items: defineTable({
    simplificationId: v.id("simplifications"),
    category: v.string(),
    title: v.string(),
    description: v.string(),
    severity,
    createdAt: v.number(),
  }).index("by_simplificationId", ["simplificationId"]),
});