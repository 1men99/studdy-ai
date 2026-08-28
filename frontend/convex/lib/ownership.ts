import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

type AuthenticatedCtx = QueryCtx | MutationCtx;

export async function getUser(ctx: AuthenticatedCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (query) =>
      query.eq("clerkId", identity.tokenIdentifier),
    )
    .unique();

  return user;
}

export async function requireUser(ctx: AuthenticatedCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated");
  }

  let user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (query) =>
      query.eq("clerkId", identity.tokenIdentifier),
    )
    .unique();

  if (!user) {
    // If inside a mutation, auto-provision the user record
    if ("insert" in ctx.db) {
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        clerkId: identity.tokenIdentifier,
        email: identity.email || "",
        fullName: identity.name || "Student",
        imageUrl: identity.pictureUrl || "",
        createdAt: now,
        updatedAt: now,
      });
      const created = await ctx.db.get(userId);
      if (created) return created;
    }
    throw new Error("User profile not found");
  }

  return user;
}

export async function getOwnedSession(
  ctx: AuthenticatedCtx,
  sessionId: Id<"study_sessions">,
): Promise<{ user: Doc<"users">; session: Doc<"study_sessions"> } | null> {
  const user = await getUser(ctx);
  if (!user) return null;

  const session = await ctx.db.get(sessionId);
  if (!session || session.userId !== user._id) {
    return null;
  }

  return { user, session };
}

export async function requireOwnedSession(
  ctx: AuthenticatedCtx,
  sessionId: Id<"study_sessions">,
): Promise<{ user: Doc<"users">; session: Doc<"study_sessions"> }> {
  const user = await requireUser(ctx);
  const session = await ctx.db.get(sessionId);

  if (!session || session.userId !== user._id) {
    throw new Error("Study session not found");
  }

  return { user, session };
}