"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createDemoSeed, DEMO_STATE_VERSION, DEMO_STORAGE_KEY } from "@/data/demo-seed";
import { offerService, orderService, pickupService, reviewService, type ServiceResult } from "@/demo/services";
import type {
  Branch,
  Business,
  ComplaintStatus,
  DemoState,
  MarketplaceOffer,
  OfferDraft,
  OfferStatus,
  Order,
  OrderStatus,
  Review,
  StaffMember,
} from "@/types/demo";

type Feedback = { ok: true; message: string } | { ok: false; message: string };

type DemoContextValue = {
  state: DemoState;
  hydrated: boolean;
  createOffer: (draft: OfferDraft, status: "draft" | "active" | "scheduled") => ServiceResult<MarketplaceOffer>;
  updateOffer: (id: string, patch: Partial<MarketplaceOffer>) => ServiceResult<MarketplaceOffer>;
  setOfferStatus: (id: string, status: OfferStatus) => ServiceResult<MarketplaceOffer>;
  adjustStock: (id: string, delta: number) => ServiceResult<MarketplaceOffer>;
  duplicateOffer: (id: string) => ServiceResult<MarketplaceOffer>;
  removeDraft: (id: string) => ServiceResult;
  publishTemplate: (id: string, values: { quantity: number; price: number; branchId: string; pickupDate: string; pickupStart: string; pickupEnd: string }) => ServiceResult<MarketplaceOffer>;
  createTemplate: (draft: OfferDraft, name?: string) => Feedback;
  updateTemplate: (id: string, patch: { templateName?: string; title?: string; description?: string; salePrice?: number }) => Feedback;
  duplicateTemplate: (id: string) => Feedback;
  deleteTemplate: (id: string) => Feedback;
  placeOrder: (offerId: string, quantity: number) => ServiceResult<Order>;
  transitionOrder: (id: string, status: OrderStatus) => ServiceResult<Order>;
  verifyPickup: (code: string) => ReturnType<typeof pickupService.verify>;
  submitReview: (orderId: string, rating: number, comment: string) => ServiceResult<Review>;
  respondReview: (id: string, response: string) => ServiceResult<Review>;
  updateComplaint: (id: string, status: ComplaintStatus, response?: string) => Feedback;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateCustomer: (patch: Partial<import("@/types/demo").Customer>) => void;
  updateBusiness: (patch: Partial<Business>) => void;
  updateBranch: (id: string, patch: Partial<Branch>) => Feedback;
  addBranch: (branch: Omit<Branch, "id" | "businessId">) => void;
  removeBranch: (id: string) => Feedback;
  updateStaff: (id: string, patch: Partial<StaffMember>) => Feedback;
  addStaff: (member: Omit<StaffMember, "id">) => void;
  setActiveStaff: (id: string) => void;
  resetDemo: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => createDemoSeed());
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);

  const commit = useCallback((next: DemoState) => {
    stateRef.current = next;
    setState(next);

    try {
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Keep the in-memory demo functional if browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    let next = createDemoSeed();
    try {
      const raw = localStorage.getItem(DEMO_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DemoState;
        if (parsed.version === DEMO_STATE_VERSION) next = parsed;
      }
    } catch {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    }
    const hydrateTimer = window.setTimeout(() => {
      stateRef.current = next;
      setState(next);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(hydrateTimer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The demo remains usable when private browsing blocks persistence.
    }
  }, [hydrated, state]);

  const createOffer = useCallback((draft: OfferDraft, status: "draft" | "active" | "scheduled") => {
    const result = offerService.create(stateRef.current, draft, status);
    if (result.ok) commit(result.state);
    return result;
  }, [commit]);

  const updateOffer = useCallback((id: string, patch: Partial<MarketplaceOffer>) => {
    const result = offerService.update(stateRef.current, id, patch);
    if (result.ok) commit(result.state);
    return result;
  }, [commit]);

  const setOfferStatus = useCallback((id: string, status: OfferStatus) => {
    const result = offerService.setStatus(stateRef.current, id, status);
    if (result.ok) commit(result.state);
    return result;
  }, [commit]);

  const adjustStock = useCallback((id: string, delta: number) => {
    const result = offerService.adjustStock(stateRef.current, id, delta);
    if (result.ok) commit(result.state);
    return result;
  }, [commit]);

  const duplicateOffer = useCallback((id: string) => {
    const result = offerService.duplicate(stateRef.current, id);
    if (result.ok) commit(result.state);
    return result;
  }, [commit]);

  const removeDraft = useCallback((id: string) => {
    const result = offerService.removeDraft(stateRef.current, id);
    if (result.ok) commit(result.state);
    return result;
  }, [commit]);

  const publishTemplate = useCallback((id: string, values: { quantity: number; price: number; branchId: string; pickupDate: string; pickupStart: string; pickupEnd: string }) => {
    const template = stateRef.current.templates.find((item) => item.id === id);
    if (!template) return { ok: false, state: stateRef.current, error: "قالب پیدا نشد." } as ServiceResult<MarketplaceOffer>;
    return createOffer({
      offerType: template.offerType,
      title: template.title,
      description: template.description,
      image: template.image,
      originalValue: template.originalValue,
      salePrice: values.price,
      totalQuantity: values.quantity,
      branchId: values.branchId,
      pickupDate: values.pickupDate,
      pickupStart: values.pickupStart,
      pickupEnd: values.pickupEnd,
      allergens: template.allergens,
      dietaryLabels: template.dietaryLabels,
      expiryInfo: template.expiryInfo,
      publishAt: new Date().toISOString(),
      expiresAt: `${values.pickupDate}T${values.pickupEnd}:00.000Z`,
    }, "active");
  }, [createOffer]);

  const createTemplate = useCallback((draft: OfferDraft, name?: string): Feedback => {
    const result = offerService.create(stateRef.current, draft, "draft");
    if (!result.ok) return { ok: false, message: result.error };
    const offer = result.value;
    const { id: _id, soldQuantity: _sold, reservedQuantity: _reserved, status: _status, publishAt: _publish, expiresAt: _expires, createdAt, updatedAt, ...base } = offer;
    void _id; void _sold; void _reserved; void _status; void _publish; void _expires;
    commit({ ...stateRef.current, templates: [{ ...base, id: `template-${Date.now()}`, templateName: name?.trim() || draft.title, createdAt, updatedAt }, ...stateRef.current.templates] });
    return { ok: true, message: "قالب پیشنهاد ذخیره شد." };
  }, [commit]);

  const duplicateTemplate = useCallback((id: string): Feedback => {
    const template = stateRef.current.templates.find((item) => item.id === id);
    if (!template) return { ok: false, message: "قالب پیدا نشد." };
    const stamp = new Date().toISOString();
    commit({ ...stateRef.current, templates: [{ ...template, id: `template-${Date.now()}`, templateName: `${template.templateName} (کپی)`, createdAt: stamp, updatedAt: stamp }, ...stateRef.current.templates] });
    return { ok: true, message: "یک کپی از قالب ساخته شد." };
  }, [commit]);

  const updateTemplate = useCallback((id: string, patch: { templateName?: string; title?: string; description?: string; salePrice?: number }): Feedback => {
    if (!stateRef.current.templates.some((item) => item.id === id)) return { ok: false, message: "قالب پیدا نشد." };
    commit({ ...stateRef.current, templates: stateRef.current.templates.map((item) => item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item) });
    return { ok: true, message: "قالب به‌روز شد." };
  }, [commit]);

  const deleteTemplate = useCallback((id: string): Feedback => {
    if (!stateRef.current.templates.some((item) => item.id === id)) return { ok: false, message: "قالب پیدا نشد." };
    commit({ ...stateRef.current, templates: stateRef.current.templates.filter((item) => item.id !== id) });
    return { ok: true, message: "قالب حذف شد." };
  }, [commit]);

  const placeOrder = useCallback((offerId: string, quantity: number) => {
    const result = orderService.place(stateRef.current, offerId, quantity);
    if (result.ok) commit(result.state);
    return result;
  }, [commit]);

  const transitionOrder = useCallback((id: string, status: OrderStatus) => {
    const result = orderService.transition(stateRef.current, id, status);
    if (result.ok) commit(result.state);
    return result;
  }, [commit]);

  const verifyPickup = useCallback((code: string) => pickupService.verify(stateRef.current, code), []);

  const submitReview = useCallback((orderId: string, rating: number, comment: string) => {
    const result = reviewService.submit(stateRef.current, orderId, rating, comment);
    if (result.ok) commit(result.state);
    return result;
  }, [commit]);

  const respondReview = useCallback((id: string, response: string) => {
    const result = reviewService.respond(stateRef.current, id, response);
    if (result.ok) commit(result.state);
    return result;
  }, [commit]);

  const updateComplaint = useCallback((id: string, status: ComplaintStatus, response = ""): Feedback => {
    const complaint = stateRef.current.complaints.find((item) => item.id === id);
    if (!complaint) return { ok: false, message: "گزارش پیدا نشد." };
    const updatedAt = new Date().toISOString();
    commit({
      ...stateRef.current,
      complaints: stateRef.current.complaints.map((item) => item.id === id ? { ...item, status, response: response.trim() || item.response, updatedAt, history: [...item.history, { status, at: updatedAt }] } : item),
    });
    return { ok: true, message: "وضعیت پیگیری ذخیره شد." };
  }, [commit]);

  const markNotificationRead = useCallback((id: string) => {
    commit({ ...stateRef.current, notifications: stateRef.current.notifications.map((item) => item.id === id ? { ...item, read: true } : item) });
  }, [commit]);

  const markAllNotificationsRead = useCallback(() => {
    commit({ ...stateRef.current, notifications: stateRef.current.notifications.map((item) => ({ ...item, read: true })) });
  }, [commit]);

  const updateBusiness = useCallback((patch: Partial<Business>) => {
    commit({ ...stateRef.current, business: { ...stateRef.current.business, ...patch } });
  }, [commit]);

  const updateCustomer = useCallback((patch: Partial<import("@/types/demo").Customer>) => {
    commit({ ...stateRef.current, customer: { ...stateRef.current.customer, ...patch } });
  }, [commit]);

  const updateBranch = useCallback((id: string, patch: Partial<Branch>): Feedback => {
    if (!stateRef.current.branches.some((branch) => branch.id === id)) return { ok: false, message: "شعبه پیدا نشد." };
    commit({ ...stateRef.current, branches: stateRef.current.branches.map((branch) => branch.id === id ? { ...branch, ...patch, id: branch.id } : branch) });
    return { ok: true, message: "اطلاعات شعبه ذخیره شد." };
  }, [commit]);

  const addBranch = useCallback((branch: Omit<Branch, "id" | "businessId">) => {
    commit({ ...stateRef.current, branches: [...stateRef.current.branches, { ...branch, id: `branch-${Date.now()}`, businessId: stateRef.current.business.id }] });
  }, [commit]);

  const removeBranch = useCallback((id: string): Feedback => {
    if (stateRef.current.branches.length <= 1) return { ok: false, message: "حداقل یک شعبه باید باقی بماند." };
    if (stateRef.current.offers.some((offer) => offer.branchId === id && offer.status === "active")) return { ok: false, message: "شعبه دارای پیشنهاد فعال است." };
    commit({ ...stateRef.current, branches: stateRef.current.branches.filter((branch) => branch.id !== id) });
    return { ok: true, message: "شعبه حذف شد." };
  }, [commit]);

  const updateStaff = useCallback((id: string, patch: Partial<StaffMember>): Feedback => {
    if (!stateRef.current.staff.some((member) => member.id === id)) return { ok: false, message: "کارمند پیدا نشد." };
    commit({ ...stateRef.current, staff: stateRef.current.staff.map((member) => member.id === id ? { ...member, ...patch, id: member.id } : member) });
    return { ok: true, message: "دسترسی کارمند ذخیره شد." };
  }, [commit]);

  const addStaff = useCallback((member: Omit<StaffMember, "id">) => {
    commit({ ...stateRef.current, staff: [...stateRef.current.staff, { ...member, id: `staff-${Date.now()}` }] });
  }, [commit]);

  const setActiveStaff = useCallback((id: string) => {
    if (stateRef.current.staff.some((member) => member.id === id)) commit({ ...stateRef.current, activeStaffId: id });
  }, [commit]);

  const resetDemo = useCallback(() => {
    const next = createDemoSeed();
    commit(next);
    try {
      localStorage.removeItem("moft-reservations-v2");
      localStorage.removeItem("moft-favorites-v2");
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Reset still succeeds in memory.
    }
  }, [commit]);

  const value = useMemo<DemoContextValue>(() => ({
    state, hydrated, createOffer, updateOffer, setOfferStatus, adjustStock, duplicateOffer, removeDraft,
    publishTemplate, createTemplate, updateTemplate, duplicateTemplate, deleteTemplate, placeOrder, transitionOrder, verifyPickup,
    submitReview, respondReview, updateComplaint, markNotificationRead, markAllNotificationsRead,
    updateBusiness, updateCustomer, updateBranch, addBranch, removeBranch, updateStaff, addStaff, setActiveStaff, resetDemo,
  }), [
    state, hydrated, createOffer, updateOffer, setOfferStatus, adjustStock, duplicateOffer, removeDraft,
    publishTemplate, createTemplate, updateTemplate, duplicateTemplate, deleteTemplate, placeOrder, transitionOrder, verifyPickup,
    submitReview, respondReview, updateComplaint, markNotificationRead, markAllNotificationsRead,
    updateBusiness, updateCustomer, updateBranch, addBranch, removeBranch, updateStaff, addStaff, setActiveStaff, resetDemo,
  ]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo must be used inside DemoProvider");
  return value;
}
