import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    uuid: v.string(),
    leadData: v.string(),
    slug: v.optional(v.string()),
    businessName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leads", {
      uuid: args.uuid,
      leadData: args.leadData,
      slug: args.slug,
      businessName: args.businessName,
    });
  },
});

export const get = query({
  args: { uuid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .first();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("leads").order("desc").collect();
  },
});

export const remove = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// One-off cleanup, internal so the public client can't call it:
//   npx convex run --prod leads:pruneAllButLatest
// ponytail: leaves their conversations/clicks rows, same as `remove` does.
export const pruneAllButLatest = internalMutation({
  handler: async (ctx) => {
    const [, ...old] = await ctx.db.query("leads").order("desc").collect();
    for (const lead of old) await ctx.db.delete(lead._id);
    return old.length;
  },
});
