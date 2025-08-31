import type { Insight } from "$models/insight.ts";
import * as insightsTable from "$tables/insights.ts";
import type { HasDBClient } from "../shared.ts";

type Input = HasDBClient & {
  brand: number;
  text: string;
};

export default (input: Input): Insight => {
  const createdAt = new Date().toISOString();

  const insertData: insightsTable.Insert = {
    brand: input.brand,
    createdAt,
    text: input.text,
  };

  const insertQuery = insightsTable.insertStatement(insertData);
  input.db.sql`${insertQuery}`;

  // Get the last inserted row to return the complete insight
  const [insertedRow] = input.db
    .sql<insightsTable.Row>`SELECT * FROM insights ORDER BY id DESC LIMIT 1`;

  if (!insertedRow) {
    throw new Error("Failed to create insight");
  }

  return {
    ...insertedRow,
    createdAt: new Date(insertedRow.createdAt),
  };
};
