import type { Insight } from "$models/insight.ts";
import { expect } from "jsr:@std/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { withDB } from "../testing.ts";
import createInsight from "./create-insight.ts";

describe("creating insights in the database", () => {
  describe("creating a new insight", () => {
    withDB((fixture) => {
      const input = {
        brand: 1,
        text: "Test insight text",
      };

      let result: Insight;
      let dbState: any[];

      beforeAll(async () => {
        result = await createInsight({ ...fixture, ...input });
        dbState = fixture.insights.selectAll();
      });

      it("returns the created insight", () => {
        expect(result).toBeDefined();
        expect(result.brand).toBe(input.brand);
        expect(result.text).toBe(input.text);
        expect(result.id).toBeDefined();
        expect(result.createdAt).toBeInstanceOf(Date);
      });

      it("stores the insight in the database", () => {
        expect(dbState).toHaveLength(1);
        expect(dbState[0].brand).toBe(input.brand);
        expect(dbState[0].text).toBe(input.text);
        expect(dbState[0].id).toBeDefined();
        expect(dbState[0].createdAt).toBeDefined();
      });

      it("returns insight with correct data types", () => {
        expect(typeof result.id).toBe("number");
        expect(typeof result.brand).toBe("number");
        expect(typeof result.text).toBe("string");
        expect(result.createdAt).toBeInstanceOf(Date);
      });

      it("generates a unique ID", () => {
        expect(result.id).toBeGreaterThan(0);
      });

      it("sets createdAt to current time", () => {
        const now = new Date();
        const timeDiff = Math.abs(now.getTime() - result.createdAt.getTime());
        // Allow for 1 second difference due to test execution time
        expect(timeDiff).toBeLessThan(1000);
      });
    });
  });

  describe("creating multiple insights", () => {
    withDB((fixture) => {
      const inputs = [
        { brand: 1, text: "First insight" },
        { brand: 2, text: "Second insight" },
        { brand: 3, text: "Third insight" },
      ];

      let results: Insight[];
      let dbState: any[];

      beforeAll(async () => {
        results = await Promise.all(inputs.map((input) => createInsight({ ...fixture, ...input })));
        dbState = fixture.insights.selectAll();
      });

      it("creates all insights successfully", () => {
        expect(results).toHaveLength(3);
        expect(dbState).toHaveLength(3);
      });

      it("assigns unique IDs to each insight", () => {
        const ids = results.map((r) => r.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(3);
        expect(ids.every((id) => id > 0)).toBe(true);
      });

      it("maintains correct brand and text for each insight", () => {
        results.forEach((result, index) => {
          expect(result.brand).toBe(inputs[index].brand);
          expect(result.text).toBe(inputs[index].text);
        });
      });

      it("sets timestamps for each insight", () => {
        const timestamps = results.map((r) => r.createdAt.getTime());
        // All timestamps should be valid (greater than 0)
        expect(timestamps.every((ts) => ts > 0)).toBe(true);
        // Timestamps should be recent (within last 5 seconds)
        const now = new Date().getTime();
        expect(timestamps.every((ts) => now - ts < 5000)).toBe(true);
      });
    });
  });

  describe("creating insight with different brand values", () => {
    withDB((fixture) => {
      const inputs = [
        { brand: 0, text: "Brand 0 insight" },
        { brand: 999, text: "Brand 999 insight" },
        { brand: 1, text: "Brand 1 insight" },
      ];

      let results: Insight[];

      beforeAll(async () => {
        results = await Promise.all(inputs.map((input) => createInsight({ ...fixture, ...input })));
      });

      it("handles different brand values correctly", () => {
        expect(results).toHaveLength(3);
        results.forEach((result, index) => {
          expect(result.brand).toBe(inputs[index].brand);
        });
      });
    });
  });

  describe("creating insight with different text content", () => {
    withDB((fixture) => {
      const inputs = [
        { brand: 1, text: "" },
        { brand: 1, text: "Short text" },
        { brand: 1, text: "Very long text that might contain special characters like !@#$%^&*() and numbers 12345" },
      ];

      let results: Insight[];

      beforeAll(async () => {
        results = await Promise.all(inputs.map((input) => createInsight({ ...fixture, ...input })));
      });

      it("handles different text content correctly", () => {
        expect(results).toHaveLength(3);
        results.forEach((result, index) => {
          expect(result.text).toBe(inputs[index].text);
        });
      });
    });
  });
});
