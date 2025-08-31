import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { cx } from "../../lib/cx.ts";
import type { Insight } from "../../schemas/insight.ts";
import { Button } from "../button/button.tsx";
import { Modal } from "../modal/modal.tsx";
import styles from "./insights.module.css";

type InsightsProps = {
  insights: Insight[];
  className?: string;
  onDeleteInsight: (id: number) => Promise<void>;
};

export const Insights = ({ insights, className, onDeleteInsight }: InsightsProps) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [insightToDelete, setInsightToDelete] = useState<Insight | null>(null);

  const handleDeleteClick = (insight: Insight) => {
    setInsightToDelete(insight);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (insightToDelete) {
      await onDeleteInsight(insightToDelete.id);
      setDeleteModalOpen(false);
      setInsightToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setInsightToDelete(null);
  };

  return (
    <div className={cx(className)}>
      <h1 className={styles.heading}>Insights</h1>
      <div className={styles.list}>
        {insights && insights.length > 0
          ? (
            insights.map(({ id, text, createdAt, brandId }) => (
              <div className={styles.insight} key={id}>
                <div className={styles["insight-meta"]}>
                  <span>Brand {brandId}</span>
                  <div className={styles["insight-meta-details"]}>
                    <span>{new Date(createdAt).toLocaleDateString()}</span>
                    <Trash2Icon
                      className={styles["insight-delete"]}
                      onClick={() => handleDeleteClick({ id, text, createdAt, brandId })}
                    />
                  </div>
                </div>
                <p className={styles["insight-content"]}>{text}</p>
              </div>
            ))
          )
          : <p>We have no insights!</p>}
      </div>

      <Modal open={deleteModalOpen} onClose={handleCancelDelete}>
        <div className={styles.deleteModal}>
          <h3>Delete Insight</h3>
          <p>Are you sure you want to delete this insight?</p>
          <div className={styles.deleteModalActions}>
            <Button
              label="Cancel"
              theme="secondary"
              onClick={handleCancelDelete}
            />
            <Button
              label="Delete"
              theme="primary"
              onClick={handleConfirmDelete}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
