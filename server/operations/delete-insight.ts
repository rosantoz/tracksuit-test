import type { HasDBClient } from "../shared.ts";

type Input = HasDBClient & {
  id: number;
};

export default (input: Input): boolean => {
  console.log(`Deleting insight with id=${input.id}`);

  // First check if the insight exists
  const [existingRow] = input.db
    .sql`SELECT id FROM insights WHERE id = ${input.id} LIMIT 1`;

  if (!existingRow) {
    console.log(`Insight with id ${input.id} not found, but treating as successful deletion`);
    return true;
  }

  // Delete the insight using parameterized query
  input.db.sql`DELETE FROM insights WHERE id = ${input.id}`;

  console.log(`Successfully deleted insight with id=${input.id}`);
  return true;
};
