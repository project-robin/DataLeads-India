import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  leads: defineTable({
    uuid: v.string(),
    leadData: v.string(),
    slug: v.optional(v.string()),
    businessName: v.optional(v.string()),
  })
    .index("by_uuid", ["uuid"])
    .index("by_slug", ["slug"]),
    
  conversations: defineTable({
    leadId: v.id("leads"),
    transcript: v.array(
      v.object({
        role: v.string(), // "user" or "agent"
        text: v.string(),
        timestamp: v.number(),
      })
    ),
  }).index("by_lead", ["leadId"]),
});
