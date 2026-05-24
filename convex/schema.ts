import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  leads: defineTable({
    uuid: v.string(),
    leadData: v.string(),
  }).index("by_uuid", ["uuid"]),
});
