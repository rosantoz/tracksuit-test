import type { HasDBClient } from "../shared.ts";

type Input = HasDBClient & {
  id: number;
};

export default (input: Input): boolean => {
  console.log(`Deleting insight with id=${input.id}`);

  // First check if the insight exists
  const selectStmt = input.db
    .prepare("SELECT id FROM insights WHERE id = ? LIMIT 1");
  
  const [existingRow] = selectStmt.all(input.id);

  if (!existingRow) {
    console.log(`Insight with id ${input.id} not found, but treating as successful deletion`);
    return true;
  }

  // Delete the insight using prepared statement
  const deleteStmt = input.db
    .prepare("DELETE FROM insights WHERE id = ?");
  
  deleteStmt.run(input.id);

  console.log(`Successfully deleted insight with id=${input.id}`);
  return true;
};
