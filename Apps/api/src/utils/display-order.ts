import { asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { serviceCategories, services } from "../db/schema.js";

export type DisplayOrderEntity = "service-category" | "service";

// Keep target index within valid insertion/move bounds.
const clampIndex = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const applyCategoryDisplayOrderUpdates = async (
  updates: Array<{ id: number; displayOrder: number }>
): Promise<void> => {
  // Apply deterministic row-by-row updates to avoid gaps and duplicates.
  for (const update of updates) {
    await db
      .update(serviceCategories)
      .set({ displayOrder: update.displayOrder })
      .where(eq(serviceCategories.id, update.id));
  }
};

const applyServiceDisplayOrderUpdates = async (
  updates: Array<{ id: number; displayOrder: number }>
): Promise<void> => {
  // Apply deterministic row-by-row updates to avoid gaps and duplicates.
  for (const update of updates) {
    await db
      .update(services)
      .set({ displayOrder: update.displayOrder })
      .where(eq(services.id, update.id));
  }
};

export const reindexDisplayOrderAfterDelete = async (
  entity: DisplayOrderEntity
): Promise<void> => {
  if (entity === "service-category") {
    // Rebuild sequential order from current sorted state after deletion.
    const rows = await db
      .select({ id: serviceCategories.id })
      .from(serviceCategories)
      .orderBy(asc(serviceCategories.displayOrder), asc(serviceCategories.id));

    // Assign contiguous indexes: 0..n-1.
    const updates = rows.map((row, index) => ({
      id: row.id,
      displayOrder: index
    }));

    await applyCategoryDisplayOrderUpdates(updates);
    return;
  }

  // Rebuild sequential order for services after deletion.
  const rows = await db
    .select({ id: services.id })
    .from(services)
    .orderBy(asc(services.displayOrder), asc(services.id));

  // Assign contiguous indexes: 0..n-1.
  const updates = rows.map((row, index) => ({
    id: row.id,
    displayOrder: index
  }));

  await applyServiceDisplayOrderUpdates(updates);
};

export const reindexDisplayOrderForWrite = async (
  entity: DisplayOrderEntity,
  requestedDisplayOrder: number,
  excludeId?: number
): Promise<number> => {
  if (entity === "service-category") {
    // Read rows in canonical order so tie-breaking is stable and predictable.
    const rows = await db
      .select({ id: serviceCategories.id, displayOrder: serviceCategories.displayOrder })
      .from(serviceCategories)
      .orderBy(asc(serviceCategories.displayOrder), asc(serviceCategories.id));

    // For updates, temporarily remove the target row from the sequence.
    const rowsWithoutTarget =
      excludeId !== undefined ? rows.filter((row) => row.id !== excludeId) : rows;

    // Clamp requested index to valid bounds (supports out-of-range inputs safely).
    const normalizedRequestedDisplayOrder = clampIndex(
      requestedDisplayOrder,
      0,
      rowsWithoutTarget.length
    );

    // Insert space at target index by shifting trailing rows by +1.
    const updates = rowsWithoutTarget.map((row, index) => ({
      id: row.id,
      displayOrder:
        index >= normalizedRequestedDisplayOrder
          ? index + 1
          : index
    }));

    await applyCategoryDisplayOrderUpdates(updates);

    // Caller persists this index on the incoming/newly updated row.
    return normalizedRequestedDisplayOrder;
  }

  // Read rows in canonical order so tie-breaking is stable and predictable.
  const rows = await db
    .select({ id: services.id, displayOrder: services.displayOrder })
    .from(services)
    .orderBy(asc(services.displayOrder), asc(services.id));

  // For updates, temporarily remove the target row from the sequence.
  const rowsWithoutTarget =
    excludeId !== undefined ? rows.filter((row) => row.id !== excludeId) : rows;

  // Clamp requested index to valid bounds (supports out-of-range inputs safely).
  const normalizedRequestedDisplayOrder = clampIndex(
    requestedDisplayOrder,
    0,
    rowsWithoutTarget.length
  );

  // Insert space at target index by shifting trailing rows by +1.
  const updates = rowsWithoutTarget.map((row, index) => ({
    id: row.id,
    displayOrder:
      index >= normalizedRequestedDisplayOrder
        ? index + 1
        : index
  }));

  await applyServiceDisplayOrderUpdates(updates);

  // Caller persists this index on the incoming/newly updated row.
  return normalizedRequestedDisplayOrder;
};
