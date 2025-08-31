import { useRef, useState } from "react";
import { BRANDS } from "../../lib/consts.ts";
import { Button } from "../button/button.tsx";
import { Modal, type ModalProps } from "../modal/modal.tsx";
import styles from "./add-insight.module.css";

type AddInsightProps = ModalProps & {
  onInsightAdded?: () => void;
};

export const AddInsight = (props: AddInsightProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const addInsight = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const brand = parseInt(formData.get("brand") as string);
    const text = formData.get("text") as string;

    if (!brand || !text) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ brand, text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create insight");
      }

      // Reset form and close modal on success
      if (formRef.current) {
        formRef.current.reset();
      }

      // Call the callback to refresh insights
      if (props.onInsightAdded) {
        props.onInsightAdded();
      }

      if (props.onClose) {
        props.onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal {...props}>
      <h1 className={styles.heading}>Add a new insight</h1>
      <form ref={formRef} className={styles.form} onSubmit={addInsight}>
        <label className={styles.field}>
          Brand
          <select name="brand" className={styles["field-input"]} required>
            <option value="">Select a brand</option>
            {BRANDS.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Insight
          <textarea
            name="text"
            className={styles["field-input"]}
            rows={5}
            placeholder="Something insightful..."
            required
          />
        </label>
        {error && <div className={styles.error}>{error}</div>}
        <Button
          className={styles.submit}
          type="submit"
          label={isSubmitting ? "Adding..." : "Add insight"}
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
};
