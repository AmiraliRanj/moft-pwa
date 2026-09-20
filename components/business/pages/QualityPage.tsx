"use client";

import { useMemo, useState } from "react";
import { BusinessPageHeader, MetricCard, MiniBarChart } from "@/components/business/BusinessPrimitives";
import { useBusinessUi } from "@/components/business/BusinessUiContext";
import { DialogShell } from "@/components/moft/DialogShell";
import { Icon } from "@/components/moft/Icon";
import { useDemo } from "@/demo/DemoProvider";
import { complaintCategoryLabel, complaintStatusLabel, formatDecimal, formatNumber } from "@/lib/demo-format";
import type { Complaint, ComplaintStatus, Review } from "@/types/demo";

export function QualityPage() {
  const { state, respondReview, updateComplaint } = useDemo();
  const { branchId, notify } = useBusinessUi();
  const [rating, setRating] = useState("all");
  const [offerId, setOfferId] = useState("all");
  const [commentOnly, setCommentOnly] = useState(false);
  const [complaintOnly, setComplaintOnly] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [response, setResponse] = useState("");
  const reviews = useMemo(
    () =>
      state.reviews.filter(
        (review) =>
          review.businessId === state.business.id &&
          review.branchId === branchId &&
          (rating === "all" || review.rating === Number(rating)) &&
          (offerId === "all" || review.offerId === offerId) &&
          (!commentOnly || Boolean(review.comment)) &&
          (!complaintOnly || state.complaints.some((item) => item.reviewId === review.id))
      ),
    [branchId, commentOnly, complaintOnly, offerId, rating, state.business.id, state.complaints, state.reviews]
  );
  const complaints = state.complaints.filter((item) => item.businessId === state.business.id && item.branchId === branchId);
  const branchReviews = state.reviews.filter((item) => item.branchId === branchId);
  const average = branchReviews.length ? branchReviews.reduce((sum, item) => sum + item.rating, 0) / branchReviews.length : 0;
  const open = complaints.filter((item) => !["closed", "responded"].includes(item.status)).length;
  const qualityScore = Math.max(0, Math.round((average / 5) * 85 + (1 - open / Math.max(complaints.length, 1)) * 15));
  const businessOffers = state.offers.filter((item) => item.businessId === state.business.id && item.branchId === branchId);

  const openReview = (review: Review) => {
    setSelectedReview(review);
    setResponse(review.response);
  };
  const saveResponse = () => {
    if (!selectedReview) return;
    const result = respondReview(selectedReview.id, response);
    notify(result.ok ? "پاسخ ذخیره شد و در نمای مشتری دیده می‌شود." : result.error, result.ok ? "success" : "error");
    if (result.ok) setSelectedReview(result.value);
  };
  const changeComplaint = (status: ComplaintStatus) => {
    if (!selectedComplaint) return;
    const result = updateComplaint(selectedComplaint.id, status, response);
    notify(result.message, result.ok ? "success" : "error");
    if (result.ok)
      setSelectedComplaint({
        ...selectedComplaint,
        status,
        response: response || selectedComplaint.response,
        history: [...selectedComplaint.history, { status, at: new Date().toISOString() }],
      });
  };

  return (
    <div className="flex flex-col gap-6 w-full text-start">
      <BusinessPageHeader
        eyebrow="صدای مشتری"
        title="نظرات و کیفیت"
        description="بازخوردها را ببینید، پاسخ دهید و پیگیری‌های کیفیت را تا بسته‌شدن دنبال کنید."
      />

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard label="امتیاز کلی" value={`${formatDecimal(average)} از ۵`} hint={`${formatNumber(branchReviews.length)} نظر`} tone="brand" />
        <MetricCard label="کیفیت تجربه" value={`${formatNumber(qualityScore)} از ۱۰۰`} hint="شاخص ترکیبی کیفیت" />
        <MetricCard label="پیگیری باز" value={formatNumber(open)} hint={`${formatNumber(complaints.length)} مورد کل`} tone={open ? "accent" : "default"} />
        <MetricCard label="پاسخ‌داده‌شده" value={formatNumber(branchReviews.filter((item) => item.response).length)} hint="پاسخ قابل مشاهده مشتری" />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-xs flex flex-col gap-2">
          <h2 className="text-base font-bold text-ink">توزیع امتیاز</h2>
          <MiniBarChart values={[1, 2, 3, 4, 5].map((value) => branchReviews.filter((item) => item.rating === value).length)} labels={["۱★", "۲★", "۳★", "۴★", "۵★"]} />
        </section>
        <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-xs flex flex-col gap-2">
          <h2 className="text-base font-bold text-ink">روند امتیاز</h2>
          <MiniBarChart values={state.analytics.slice(-7).map((item) => item.rating)} labels={state.analytics.slice(-7).map((item) => item.date.slice(8))} />
        </section>
      </div>

      <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <p className="text-xs font-bold text-brand-2 mb-1">نظرهای مشتریان</p>
            <h2 className="text-base sm:text-lg font-bold text-ink">بازخوردهای ثبت‌شده</h2>
          </div>
          <span className="text-xs font-bold text-muted">{formatNumber(reviews.length)} نتیجه</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <label className="flex items-center gap-1.5">
            <span className="font-bold text-muted">امتیاز:</span>
            <select value={rating} onChange={(event) => setRating(event.target.value)} className="h-9 px-2.5 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus cursor-pointer">
              <option value="all">همه امتیازها</option>
              {[5, 4, 3, 2, 1].map((value) => (
                <option value={value} key={value}>{value.toLocaleString("fa-IR")} ستاره</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5">
            <span className="font-bold text-muted">پیشنهاد:</span>
            <select value={offerId} onChange={(event) => setOfferId(event.target.value)} className="h-9 px-2.5 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus cursor-pointer">
              <option value="all">همه پیشنهادها</option>
              {businessOffers.map((offer) => (
                <option key={offer.id} value={offer.id}>{offer.title}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={`px-3 py-1.5 rounded-xl border border-line font-bold transition-colors cursor-pointer ${commentOnly ? "bg-brand text-white" : "bg-surface-raised text-muted hover:text-ink"}`}
            onClick={() => setCommentOnly(!commentOnly)}
            aria-pressed={commentOnly}
          >
            دارای متن
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 rounded-xl border border-line font-bold transition-colors cursor-pointer ${complaintOnly ? "bg-brand text-white" : "bg-surface-raised text-muted hover:text-ink"}`}
            onClick={() => setComplaintOnly(!complaintOnly)}
            aria-pressed={complaintOnly}
          >
            دارای پیگیری
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <article key={review.id} className="flex flex-col sm:flex-row items-start justify-between gap-3 p-4 rounded-2xl border border-line bg-surface-raised">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft font-bold text-brand text-sm">
                  {review.customerName[0]}
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 text-sm tracking-wider" aria-label={`${review.rating} از ۵`}>
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-ink">{review.customerName}</h3>
                  </div>
                  <p className="text-xs text-ink leading-relaxed">{review.comment || "بدون توضیح متنی"}</p>
                  {review.response && (
                    <blockquote className="mt-2 rounded-xl bg-canvas-soft p-2.5 border-s-2 border-brand-2 text-xs text-muted">
                      <strong className="block text-brand font-bold mb-0.5">پاسخ {state.business.name}:</strong>
                      {review.response}
                    </blockquote>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="self-end sm:self-start px-3 py-1.5 rounded-xl border border-line bg-surface text-xs font-bold text-ink hover:bg-canvas-soft cursor-pointer transition-colors"
                onClick={() => openReview(review)}
              >
                {review.response ? "ویرایش پاسخ" : "پاسخ"}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <p className="text-xs font-bold text-accent mb-1">پیگیری کیفیت</p>
            <h2 className="text-base sm:text-lg font-bold text-ink">گزارش‌ها و شکایت‌ها</h2>
          </div>
          <span className="text-xs font-bold text-muted">{formatNumber(complaints.length)} مورد</span>
        </div>

        <div className="flex flex-col gap-2">
          {complaints.map((complaint) => (
            <button
              type="button"
              key={complaint.id}
              onClick={() => {
                setSelectedComplaint(complaint);
                setResponse(complaint.response);
              }}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-line bg-surface-raised hover:border-line-strong transition-colors cursor-pointer text-start"
            >
              <div className="flex flex-col">
                <strong className="text-xs sm:text-sm font-bold text-ink">{complaint.customerName}</strong>
                <small className="text-xs text-muted font-mono">{complaintCategoryLabel[complaint.category]} · {complaint.orderId}</small>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[0.7rem] font-bold ${
                  complaint.status === "closed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : complaint.status === "responded" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}>
                  {complaintStatusLabel[complaint.status]}
                </span>
                <span className="text-muted [&>svg]:w-4 [&>svg]:h-4"><Icon name="chevron" /></span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selectedReview && (
        <DialogShell titleId="review-response-title" onClose={() => setSelectedReview(null)}>
          <div className="flex flex-col gap-4 text-start p-2">
            <div>
              <p className="text-xs font-bold text-brand-2">پاسخ به مشتری</p>
              <h2 id="review-response-title" className="text-lg font-bold text-ink">نظر {selectedReview.customerName}</h2>
            </div>
            <div className="p-3 rounded-xl bg-canvas-soft border border-line text-xs flex flex-col gap-1">
              <span className="text-amber-500 text-sm">{"★".repeat(selectedReview.rating)}</span>
              <p className="text-ink">{selectedReview.comment}</p>
            </div>
            <label className="flex flex-col gap-1.5 text-xs">
              <span className="font-bold text-ink">پاسخ کسب‌وکار</span>
              <textarea
                rows={4}
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                placeholder="پاسخی روشن، محترمانه و مسئولانه بنویسید."
                className="p-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus resize-none"
              />
            </label>
            <button
              className="flex min-h-[42px] items-center justify-center rounded-xl bg-brand text-white font-bold text-xs hover:opacity-95 cursor-pointer"
              type="button"
              onClick={saveResponse}
            >
              ذخیره پاسخ
            </button>
          </div>
        </DialogShell>
      )}

      {selectedComplaint && (
        <DialogShell titleId="complaint-title" onClose={() => setSelectedComplaint(null)} size="detail">
          <div className="flex flex-col gap-4 text-start">
            <div>
              <p className="text-xs font-bold text-accent">جزئیات پیگیری</p>
              <h2 id="complaint-title" className="text-xl font-black text-ink">{complaintCategoryLabel[selectedComplaint.category]}</h2>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-canvas-soft border border-line text-xs">
              <span className="flex flex-col">
                <small className="text-muted text-[0.65rem]">مشتری</small>
                <strong className="font-bold text-ink">{selectedComplaint.customerName}</strong>
              </span>
              <span className="flex flex-col">
                <small className="text-muted text-[0.65rem]">سفارش مرتبط</small>
                <strong className="font-mono font-bold text-ink">{selectedComplaint.orderId}</strong>
              </span>
              <span className="flex flex-col">
                <small className="text-muted text-[0.65rem]">وضعیت</small>
                <strong className="font-bold text-ink">{complaintStatusLabel[selectedComplaint.status]}</strong>
              </span>
            </div>

            <section className="flex flex-col gap-1 text-xs">
              <h3 className="font-bold text-ink">شرح مشتری:</h3>
              <p className="p-3 rounded-xl bg-surface-raised border border-line text-ink leading-relaxed">
                {selectedComplaint.description}
              </p>
            </section>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-canvas-soft border border-line text-xs">
              <span className="text-muted [&>svg]:w-4 [&>svg]:h-4"><Icon name="info" /></span>
              <span className="text-muted">پیوست: فایلی برای این پیگیری بارگذاری نشده است.</span>
            </div>

            <label className="flex flex-col gap-1.5 text-xs">
              <span className="font-bold text-ink">پاسخ کسب‌وکار:</span>
              <textarea
                rows={3}
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                className="p-3 rounded-xl border border-line bg-surface-raised text-xs text-ink focus:outline-focus resize-none"
              />
            </label>

            <section className="flex flex-col gap-2 text-xs">
              <h3 className="font-bold text-ink">تاریخچه وضعیت</h3>
              <div className="flex flex-col gap-2 ps-3 border-s-2 border-brand-2/30 ms-1">
                {selectedComplaint.history.map((entry, index) => (
                  <div key={`${entry.at}-${index}`} className="flex flex-col">
                    <strong className="font-bold text-ink">{complaintStatusLabel[entry.status]}</strong>
                    <small className="text-muted text-[0.65rem]">{entry.at.slice(0, 10)}</small>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-line text-xs font-bold">
              <button type="button" className="px-3 py-2 rounded-xl bg-surface border border-line text-ink hover:bg-canvas-soft cursor-pointer" onClick={() => changeComplaint("reviewing")}>
                در حال بررسی
              </button>
              <button type="button" className="px-3 py-2 rounded-xl bg-surface border border-line text-ink hover:bg-canvas-soft cursor-pointer" onClick={() => changeComplaint("responded")}>
                ثبت پاسخ
              </button>
              <button type="button" className="px-3 py-2 rounded-xl bg-surface border border-line text-ink hover:bg-canvas-soft cursor-pointer" onClick={() => changeComplaint("escalated")}>
                ارجاع به پشتیبانی
              </button>
              <button className="px-3 py-2 rounded-xl bg-brand text-white hover:opacity-95 cursor-pointer ms-auto" type="button" onClick={() => changeComplaint("closed")}>
                بستن پیگیری
              </button>
            </div>
          </div>
        </DialogShell>
      )}
    </div>
  );
}
