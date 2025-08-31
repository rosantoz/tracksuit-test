import type { Insight } from "$models/insight.ts";
import { expect } from "jsr:@std/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { withDB } from "../testing.ts";
import deleteInsight from "./delete-insight.ts";

describe("deleting insights from the database", () => {
  describe("deleting an existing insight", () => {
    withDB((fixture) => {
      const testInsight: Insight = {
        id: 1,
        brand: 1,
        createdAt: new Date("2024-01-01"),
        text: "Test insight to delete",
      };

      let result: boolean;
      let dbStateBefore: any[];
      let dbStateAfter: any[];

      beforeAll(async () => {
        // Insert test insight
        fixture.insights.insert([{
          brand: testInsight.brand,
          createdAt: testInsight.createdAt.toISOString(),
          text: testInsight.text,
        }]);

        // Verify insight exists before deletion
        dbStateBefore = fixture.insights.selectAll();
        
        // Delete the insight
        result = deleteInsight({ ...fixture, id: testInsight.id });
        
        // Check database state after deletion
        dbStateAfter = fixture.insights.selectAll();
      });

      it("returns true on successful deletion", () => {
        expect(result).toBe(true);
      });

      it("removes the insight from the database", () => {
        expect(dbStateBefore).toHaveLength(1);
        expect(dbStateAfter).toHaveLength(0);
      });

      it("deletes the correct insight", () => {
        const remainingInsights = dbStateAfter.filter(
          (insight) => insight.id === testInsight.id
        );
        expect(remainingInsights).toHaveLength(0);
      });
    });
  });

  describe("deleting a non-existent insight", () => {
    withDB((fixture) => {
      let result: boolean;
      let dbStateBefore: any[];
      let dbStateAfter: any[];

      beforeAll(() => {
        // Verify database is empty
        dbStateBefore = fixture.insights.selectAll();
        
        // Try to delete non-existent insight
        result = deleteInsight({ ...fixture, id: 999 });
        
        // Check database state after attempted deletion
        dbStateAfter = fixture.insights.selectAll();
      });

      it("returns true even when insight doesn't exist", () => {
        expect(result).toBe(true);
      });

      it("doesn't change the database state", () => {
        expect(dbStateBefore).toHaveLength(0);
        expect(dbStateAfter).toHaveLength(0);
      });
    });
  });

  describe("deleting multiple insights", () => {
    withDB((fixture) => {
      const testInsights: Insight[] = [
        { id: 1, brand: 1, createdAt: new Date("2024-01-01"), text: "First insight" },
        { id: 2, brand: 2, createdAt: new Date("2024-01-02"), text: "Second insight" },
        { id: 3, brand: 3, createdAt: new Date("2024-01-03"), text: "Third insight" },
      ];

      let results: boolean[];
      let dbStateAfter: any[];

      beforeAll(() => {
        // Insert multiple test insights
        fixture.insights.insert(
          testInsights.map((insight) => ({
            brand: insight.brand,
            createdAt: insight.createdAt.toISOString(),
            text: insight.text,
          }))
        );

        // Delete insights one by one
        results = testInsights.map((insight) => 
          deleteInsight({ ...fixture, id: insight.id })
        );
        
        // Check final database state
        dbStateAfter = fixture.insights.selectAll();
      });

      it("returns true for all deletions", () => {
        expect(results).toHaveLength(3);
        expect(results.every((result) => result === true)).toBe(true);
      });

      it("removes all insights from the database", () => {
        expect(dbStateAfter).toHaveLength(0);
      });
    });
  });

  describe("deleting insight with specific ID", () => {
    withDB((fixture) => {
      const testInsights: Insight[] = [
        { id: 1, brand: 1, createdAt: new Date("2024-01-01"), text: "Keep this insight" },
        { id: 2, brand: 2, createdAt: new Date("2024-01-02"), text: "Delete this insight" },
        { id: 3, brand: 3, createdAt: new Date("2024-01-03"), text: "Keep this insight too" },
      ];

      let result: boolean;
      let dbStateAfter: any[];

      beforeAll(() => {
        // Insert test insights
        fixture.insights.insert(
          testInsights.map((insight) => ({
            brand: insight.brand,
            createdAt: insight.createdAt.toISOString(),
            text: insight.text,
          }))
        );

        // Delete only the second insight
        result = deleteInsight({ ...fixture, id: 2 });
        
        // Check database state after deletion
        dbStateAfter = fixture.insights.selectAll();
      });

      it("returns true on successful deletion", () => {
        expect(result).toBe(true);
      });

      it("only deletes the specified insight", () => {
        expect(dbStateAfter).toHaveLength(2);
        
        const remainingIds = dbStateAfter.map((insight) => insight.id);
        expect(remainingIds).toContain(1);
        expect(remainingIds).toContain(3);
        expect(remainingIds).not.toContain(2);
      });

      it("preserves other insights unchanged", () => {
        const insight1 = dbStateAfter.find((insight) => insight.id === 1);
        const insight3 = dbStateAfter.find((insight) => insight.id === 3);
        
        expect(insight1).toBeDefined();
        expect(insight1?.text).toBe("Keep this insight");
        expect(insight1?.brand).toBe(1);
        
        expect(insight3).toBeDefined();
        expect(insight3?.text).toBe("Keep this insight too");
        expect(insight3?.brand).toBe(3);
      });
    });
  });

  describe("deleting from empty database", () => {
    withDB((fixture) => {
      let result: boolean;
      let dbState: any[];

      beforeAll(() => {
        // Verify database is empty
        dbState = fixture.insights.selectAll();
        
        // Try to delete from empty database
        result = deleteInsight({ ...fixture, id: 1 });
      });

      it("returns true when deleting from empty database", () => {
        expect(result).toBe(true);
      });

      it("keeps database empty", () => {
        expect(dbState).toHaveLength(0);
      });
    });
  });
});
