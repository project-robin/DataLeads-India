import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const record = mutation({
  args: {
    slug: v.string(),
    timestamp: v.number(),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("clicks", {
      slug: args.slug,
      timestamp: args.timestamp,
      userAgent: args.userAgent,
      referrer: args.referrer,
      country: args.country,
    });
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clicks")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .order("desc")
      .collect();
  },
});

export const getCountsBySlug = query({
  handler: async (ctx) => {
    const clicks = await ctx.db.query("clicks").collect();
    const stats: Record<
      string,
      {
        count: number;
        lastClickAt: number | null;
        mobile: number;
        desktop: number;
      }
    > = {};

    for (const click of clicks) {
      const slug = click.slug;
      if (!stats[slug]) {
        stats[slug] = { count: 0, lastClickAt: null, mobile: 0, desktop: 0 };
      }
      stats[slug].count++;
      if (!stats[slug].lastClickAt || click.timestamp > stats[slug].lastClickAt) {
        stats[slug].lastClickAt = click.timestamp;
      }
      
      const ua = (click.userAgent || "").toLowerCase();
      const isMobile = /mobile|android|iphone|ipad|phone/i.test(ua);
      if (isMobile) {
        stats[slug].mobile++;
      } else {
        stats[slug].desktop++;
      }
    }
    return stats;
  },
});
