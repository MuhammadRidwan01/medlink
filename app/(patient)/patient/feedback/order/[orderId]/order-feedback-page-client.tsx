'use client';

import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { RatingStars } from "@/components/features/feedback/rating-stars";
import { TagChips } from "@/components/features/feedback/tag-chips";
import { TextareaAutosize } from "@/components/features/feedback/textarea-autosize";
import { ThanksCard } from "@/components/features/feedback/thanks-card";
import { submitFeedback } from "@/components/features/feedback/store";

const POSITIVE = ["Packaging", "Timeliness", "Accuracy", "Courtesy"];
const NEGATIVE = [
  "Damaged",
  "Late delivery",
  "Missing items",
  "Poor packaging",
];

type OrderFeedbackPageClientProps = {
  orderId: string;
};

export function OrderFeedbackPageClient({
  orderId,
}: OrderFeedbackPageClientProps) {
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [contactOk, setContactOk] = useState(false);
  const [testimonialOk, setTestimonialOk] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const showNegative = useMemo(() => rating > 0 && rating <= 3, [rating]);
  const showTestimonial = useMemo(
    () => rating >= 4 && tags.some((tag) => POSITIVE.includes(tag)),
    [rating, tags],
  );

  const onSubmit = () => {
    setSubmitted(true);
    submitFeedback({
      id: orderId,
      kind: "order",
      rating,
      tags,
      comment: comment || undefined,
      contactOk,
      testimonialOk,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <PageShell
      title="Nilai Pesanan"
      subtitle="Berikan umpan balik untuk layanan apotek"
      className="space-y-4"
    >
      {submitted ? (
        <ThanksCard />
      ) : (
        <div className="space-y-4">
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Penilaian
            </p>
            <RatingStars
              value={rating}
              onChange={setRating}
              ariaLabel="Rate your order from 1 to 5 stars"
            />
          </section>
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Apa yang berjalan baik?
            </p>
            <TagChips tags={POSITIVE} value={tags} onChange={setTags} />
          </section>
          {showNegative ? (
            <section className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Apa yang perlu diperbaiki?
              </p>
              <TagChips tags={NEGATIVE} value={tags} onChange={setTags} />
              <TextareaAutosize
                value={comment}
                onChange={setComment}
                placeholder="Apa yang kurang?"
                ariaLabel="What went wrong"
              />
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={contactOk}
                  onChange={(event) => setContactOk(event.target.checked)}
                />
                Boleh hubungi saya untuk tindak lanjut
              </label>
            </section>
          ) : null}
          {showTestimonial ? (
            <section className="space-y-2">
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={testimonialOk}
                  onChange={(event) =>
                    setTestimonialOk(event.target.checked)
                  }
                />
                Bersedia berbagi testimoni publik (mock)
              </label>
            </section>
          ) : null}
          <div className="pt-2">
            <button
              type="button"
              onClick={onSubmit}
              disabled={rating === 0}
              className="tap-target inline-flex items-center justify-center rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              Kirim
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
