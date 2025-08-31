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

  useEffect(() => { // this could be a separate hook
    fetchInsights();
  }, []);

  return (
    <main className={styles.main}>
      <Header onAddInsight={fetchInsights} />
      <Insights className={styles.insights} insights={insights} />
    </main>
  );
};
