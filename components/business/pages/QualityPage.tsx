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
  const reviews = useMemo(() => state.reviews.filter((review) => review.businessId === state.business.id && review.branchId === branchId && (rating === "all" || review.rating === Number(rating)) && (offerId === "all" || review.offerId === offerId) && (!commentOnly || Boolean(review.comment)) && (!complaintOnly || state.complaints.some((item) => item.reviewId === review.id))), [branchId, commentOnly, complaintOnly, offerId, rating, state.business.id, state.complaints, state.reviews]);
  const complaints = state.complaints.filter((item) => item.businessId === state.business.id && item.branchId === branchId);
  const branchReviews = state.reviews.filter((item) => item.branchId === branchId);
  const average = branchReviews.length ? branchReviews.reduce((sum, item) => sum + item.rating, 0) / branchReviews.length : 0;
  const open = complaints.filter((item) => !["closed", "responded"].includes(item.status)).length;
  const qualityScore = Math.max(0, Math.round((average / 5 * 85) + (1 - open / Math.max(complaints.length, 1)) * 15));
  const businessOffers = state.offers.filter((item) => item.businessId === state.business.id && item.branchId === branchId);

  const openReview = (review: Review) => { setSelectedReview(review); setResponse(review.response); };
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
    if (result.ok) setSelectedComplaint({ ...selectedComplaint, status, response: response || selectedComplaint.response, history: [...selectedComplaint.history, { status, at: new Date().toISOString() }] });
  };

  return (
    <div className="business-page quality-page">
      <BusinessPageHeader eyebrow="صدای مشتری" title="نظرات و کیفیت" description="بازخوردها را ببینید، پاسخ دهید و پیگیری‌های کیفیت را تا بسته‌شدن دنبال کنید." />
      <section className="business-metrics quality-metrics"><MetricCard label="امتیاز کلی" value={`${formatDecimal(average)} از ۵`} hint={`${formatNumber(branchReviews.length)} نظر`} tone="brand" /><MetricCard label="کیفیت تجربه" value={`${formatNumber(qualityScore)} از ۱۰۰`} hint="شاخص ترکیبی کیفیت" /><MetricCard label="پیگیری باز" value={formatNumber(open)} hint={`${formatNumber(complaints.length)} مورد کل`} tone={open ? "accent" : "default"} /><MetricCard label="پاسخ‌داده‌شده" value={formatNumber(branchReviews.filter((item) => item.response).length)} hint="پاسخ قابل مشاهده مشتری" /></section>
      <div className="quality-overview"><section className="business-panel chart-card"><h2>توزیع امتیاز</h2><MiniBarChart values={[1, 2, 3, 4, 5].map((value) => branchReviews.filter((item) => item.rating === value).length)} labels={["۱★", "۲★", "۳★", "۴★", "۵★"]} /></section><section className="business-panel chart-card"><h2>روند امتیاز</h2><MiniBarChart values={state.analytics.slice(-7).map((item) => item.rating)} labels={state.analytics.slice(-7).map((item) => item.date.slice(8))} /></section></div>
      <section className="business-panel review-panel"><div className="business-panel-head"><div><p className="eyebrow">نظرهای مشتریان</p><h2>بازخوردهای ثبت‌شده</h2></div><span>{formatNumber(reviews.length)} نتیجه</span></div><div className="review-filters"><label><span>امتیاز</span><select value={rating} onChange={(event) => setRating(event.target.value)}><option value="all">همه امتیازها</option>{[5, 4, 3, 2, 1].map((value) => <option value={value} key={value}>{value.toLocaleString("fa-IR")} ستاره</option>)}</select></label><label><span>پیشنهاد</span><select value={offerId} onChange={(event) => setOfferId(event.target.value)}><option value="all">همه پیشنهادها</option>{businessOffers.map((offer) => <option key={offer.id} value={offer.id}>{offer.title}</option>)}</select></label><button type="button" className={commentOnly ? "active" : ""} onClick={() => setCommentOnly(!commentOnly)} aria-pressed={commentOnly}>دارای متن</button><button type="button" className={complaintOnly ? "active" : ""} onClick={() => setComplaintOnly(!complaintOnly)} aria-pressed={complaintOnly}>دارای پیگیری</button></div><div className="review-list">{reviews.map((review) => <article key={review.id}><div className="review-avatar">{review.customerName[0]}</div><div><span className="review-stars" aria-label={`${review.rating} از ۵`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span><h3>{review.customerName}</h3><p>{review.comment || "بدون توضیح متنی"}</p>{review.response && <blockquote><strong>پاسخ {state.business.name}</strong>{review.response}</blockquote>}</div><button type="button" onClick={() => openReview(review)}>{review.response ? "ویرایش پاسخ" : "پاسخ"}</button></article>)}</div></section>
      <section className="business-panel complaint-panel"><div className="business-panel-head"><div><p className="eyebrow">پیگیری کیفیت</p><h2>گزارش‌ها و شکایت‌ها</h2></div><span>{formatNumber(complaints.length)} مورد</span></div><div className="complaint-list">{complaints.map((complaint) => <button type="button" key={complaint.id} onClick={() => { setSelectedComplaint(complaint); setResponse(complaint.response); }}><span><strong>{complaint.customerName}</strong><small>{complaintCategoryLabel[complaint.category]} · {complaint.orderId}</small></span><span className={`business-status complaint-${complaint.status}`}>{complaintStatusLabel[complaint.status]}</span><Icon name="chevron" /></button>)}</div></section>

      {selectedReview && <DialogShell titleId="review-response-title" onClose={() => setSelectedReview(null)}><div className="business-dialog compact-form"><p className="eyebrow">پاسخ به مشتری</p><h2 id="review-response-title">نظر {selectedReview.customerName}</h2><div className="quoted-review"><span>{"★".repeat(selectedReview.rating)}</span><p>{selectedReview.comment}</p></div><label><span>پاسخ کسب‌وکار</span><textarea rows={5} value={response} onChange={(event) => setResponse(event.target.value)} placeholder="پاسخی روشن، محترمانه و مسئولانه بنویسید." /></label><button className="business-primary full" type="button" onClick={saveResponse}>ذخیره پاسخ</button></div></DialogShell>}
      {selectedComplaint && <DialogShell titleId="complaint-title" onClose={() => setSelectedComplaint(null)} size="detail"><div className="business-dialog complaint-detail"><p className="eyebrow">جزئیات پیگیری</p><h2 id="complaint-title">{complaintCategoryLabel[selectedComplaint.category]}</h2><div className="complaint-summary"><span><small>مشتری</small><strong>{selectedComplaint.customerName}</strong></span><span><small>سفارش مرتبط</small><strong>{selectedComplaint.orderId}</strong></span><span><small>وضعیت</small><strong>{complaintStatusLabel[selectedComplaint.status]}</strong></span></div><section><h3>شرح مشتری</h3><p>{selectedComplaint.description}</p></section><div className="evidence-placeholder"><Icon name="info" /><span><strong>پیوست</strong><small>فایلی برای این پیگیری بارگذاری نشده است.</small></span></div><label><span>پاسخ کسب‌وکار</span><textarea rows={4} value={response} onChange={(event) => setResponse(event.target.value)} /></label><section className="status-timeline"><h3>تاریخچه وضعیت</h3>{selectedComplaint.history.map((entry, index) => <div key={`${entry.at}-${index}`}><i /><span><strong>{complaintStatusLabel[entry.status]}</strong><small>{entry.at.slice(0, 10)}</small></span></div>)}</section><div className="complaint-actions"><button type="button" onClick={() => changeComplaint("reviewing")}>در حال بررسی</button><button type="button" onClick={() => changeComplaint("responded")}>ثبت پاسخ</button><button type="button" onClick={() => changeComplaint("escalated")}>ارجاع به پشتیبانی</button><button className="business-primary" type="button" onClick={() => changeComplaint("closed")}>بستن پیگیری</button></div></div></DialogShell>}
    </div>
  );
}
