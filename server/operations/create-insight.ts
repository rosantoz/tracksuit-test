import type { Insight } from "$models/insight.ts";
import * as insightsTable from "$tables/insights.ts";
import type { HasDBClient } from "../shared.ts";

type Input = HasDBClient & {
  brand: number;
  text: string;
};

export default async (input: Input): Promise<Insight> => {
  const createdAt = new Date().toISOString();

  // Insert the insight using prepared statement
  const stmt = input.db
    .prepare("INSERT INTO insights (brand, createdAt, text) VALUES (?, ?, ?)");
  
  const result = stmt.run(input.brand, createdAt, input.text);

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
