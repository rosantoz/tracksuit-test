import { useEffect, useState } from "react";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import type { Insight } from "../schemas/insight.ts";
import styles from "./app.module.css";

export const App = () => {
  const [insights, setInsights] = useState<Insight[]>([]);

  const fetchInsights = async () => {
    try {
      const response = await fetch(`/api/insights`);
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    }
  };

  const deleteInsight = async (id: number) => {
    try {
      const response = await fetch(`/api/insights/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted insight from the local state
        setInsights(prevInsights => prevInsights.filter(insight => insight.id !== id));
      } else {
        console.error('Failed to delete insight');
      }
    } catch (error) {
      console.error('Error deleting insight:', error);
    }
  };

  useEffect(() => { // this could be a separate hook
    fetchInsights();
  }, []);

  return (
    <main className={styles.main}>
      <Header onAddInsight={fetchInsights} />
      <Insights
        className={styles.insights}
        insights={insights}
        onDeleteInsight={deleteInsight}
      />
    </main>
  );
};
