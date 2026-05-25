import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveTranscript = mutation({
  args: {
    leadId: v.id("leads"),
    transcript: v.array(
      v.object({
        role: v.string(),
        text: v.string(),
        timestamp: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      leadId: args.leadId,
      transcript: args.transcript,
    });
  },
});

export const listByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .order("desc")
      .collect();
  },
});
