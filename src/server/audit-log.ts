import "server-only";
import { db } from "@/lib/db";

export async function recordAuditLog(params: {
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
}) {
  await db.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      oldValue: params.oldValue as never,
      newValue: params.newValue as never,
      ipAddress: params.ipAddress,
    },
  });
}
