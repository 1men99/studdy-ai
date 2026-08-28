import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./lib/ownership";

export const syncProfile = mutation({
  args: {
    email: v.string(),
    fullName: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const now = Date.now();
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (query) =>
        query.eq("clerkId", identity.tokenIdentifier),
      )
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        fullName: args.fullName,
        imageUrl: args.imageUrl,
        updatedAt: now,
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId: identity.tokenIdentifier,
      email: args.email,
      fullName: args.fullName,
      imageUrl: args.imageUrl,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => getUser(ctx),
});