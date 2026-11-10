"use server";

import { getTest } from "@psikotest/core";
import { and, eq, testAttempts } from "@psikotest/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

const resetSchema = z.object({ userId: z.uuid(), slug: z.string().min(1).max(64) });

/** Menghapus attempt sehingga peserta dapat mengulang tes tersebut. */
export async function resetAttemptAction(formData: FormData) {
  await requireAdmin();
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || !getTest(parsed.data.slug)) return;

  await db
    .delete(testAttempts)
    .where(and(eq(testAttempts.userId, parsed.data.userId), eq(testAttempts.testSlug, parsed.data.slug)));
  revalidatePath(`/admin/users/${parsed.data.userId}`);
}
