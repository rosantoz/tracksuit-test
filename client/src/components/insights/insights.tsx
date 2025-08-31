import { Trash2Icon } from "lucide-react";
import { cx } from "../../lib/cx.ts";
import type { Insight } from "../../schemas/insight.ts";
import styles from "./insights.module.css";
type InsightsProps = {
  insights: Insight[];
  className?: string;
};

export const Insights = ({ insights, className }: InsightsProps) => {
  const deleteInsight = () => undefined;

  return (
    <div className={cx(className)}>
      <h1 className={styles.heading}>Insights</h1>
      <div className={styles.list}>
        {insights && insights.length > 0
          ? (
            insights.map(({ id, text, date, brandId }) => (
              <div className={styles.insight} key={id}>
                <div className={styles["insight-meta"]}>
                  <span>Brand {brandId}</span>
                  <div className={styles["insight-meta-details"]}>
                    <span>{new Date(date).toLocaleDateString()}</span>
                    <Trash2Icon
                      className={styles["insight-delete"]}
                      onClick={deleteInsight}
                    />
                  </div>
                </div>
                <p className={styles["insight-content"]}>{text}</p>
              </div>
            ))
          )
          : <p>We have no insights!</p>}
      </div>
    </div>
  );
};
