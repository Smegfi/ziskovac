import { createFileRoute } from "@tanstack/react-router"
import { db } from "@/lib/db"
import { and, eq } from "drizzle-orm"
import { getAuthenticatedUserId, jsonError } from "../-_shared"
import * as schema from "@/lib/schema"

export const Route = createFileRoute("/api/overhead/costs/$id")({
  server: {
    handlers: {
      DELETE: async ({ params, request }) => {
        const userId = await getAuthenticatedUserId(request)
        if (!userId) {
          return jsonError("Unauthorized", 401)
        }

        try {
          // Verify ownership
          const cost = await db.query.overheadCost.findFirst({
            where: and(eq(schema.overheadCost.id, params.id), eq(schema.overheadCost.userId, userId)),
          })

          if (!cost) {
            return jsonError("Cost not found", 404)
          }

          await db.delete(schema.overheadCost).where(eq(schema.overheadCost.id, params.id))

          return Response.json({ success: true })
        } catch (error) {
          console.error(`DELETE /api/overhead/costs/${params.id} error:`, error)
          return jsonError("Failed to delete cost", 500)
        }
      },
    },
  },
})
