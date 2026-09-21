"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/moft/Icon"

const toast = ToastPrimitive.createToastManager()

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ className, ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" className={cn("pointer-events-none", className)} {...props} />
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed top-[calc(4.75rem+env(safe-area-inset-top,0px))] sm:top-[calc(5.25rem+env(safe-area-inset-top,0px))] inset-x-0 z-[9999] px-4 mx-auto w-full outline-none flex flex-col items-center gap-2",
        className
      )}
      {...props}
    />
  )
}

function Toast({ className, swipeDirection = ["up", "right", "left"], style, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      swipeDirection={swipeDirection}
      style={{
        boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.75)",
        ...style,
      }}
      className={cn(
        "dibz-toast group/toast pointer-events-auto relative z-[calc(1000-var(--toast-index))] w-auto max-w-[320px] sm:max-w-[350px] rounded-full border-0 bg-black text-white outline-none select-none",
        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "data-starting-style:-translate-y-4 data-starting-style:opacity-0",
        "data-ending-style:-translate-y-4 data-ending-style:opacity-0",
        "data-ending-style:data-[swipe-direction=up]:-translate-y-8",
        "data-ending-style:data-[swipe-direction=left]:-translate-x-8",
        "data-ending-style:data-[swipe-direction=right]:translate-x-8",
        className
      )}
      {...props}
    />
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-black rounded-full",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-xs font-bold leading-tight truncate", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-[10px] font-medium mt-0.5", className)}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="بستن اعلان"
      className={cn(
        "min-w-[24px] min-h-[24px] w-6 h-6 -me-0.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white grid place-items-center transition-colors cursor-pointer shrink-0 active:scale-90",
        className
      )}
      {...props}
    >
      {children ?? <Icon name="close" className="w-3 h-3 text-white/70" />}
    </ToastPrimitive.Close>
  )
}

function getToastStatus(toastItem: { type?: string; title?: React.ReactNode }): "error" | "success" | "default" {
  const type = toastItem.type
  const titleStr = typeof toastItem.title === "string" ? toastItem.title : ""

  if (
    type === "error" ||
    titleStr.includes("خطا") ||
    titleStr.includes("اشتباه") ||
    titleStr.includes("ناموفق") ||
    titleStr.includes("امکان‌پذیر نیست") ||
    titleStr.includes("در دسترس نیست")
  ) {
    return "error"
  }

  if (
    type === "success" ||
    titleStr.includes("تنظیم شد") ||
    titleStr.includes("اضافه شد") ||
    titleStr.includes("ثبت شد") ||
    titleStr.includes("ذخیره شد") ||
    titleStr.includes("بازگردانده شد") ||
    titleStr.includes("موفق")
  ) {
    return "success"
  }

  return "default"
}

function ToastIcon({ status }: { status: "error" | "success" | "default" }) {
  if (status === "error") {
    return (
      <span
        data-slot="toast-icon"
        className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 grid place-items-center shrink-0"
      >
        <Icon name="close" className="w-3 h-3 text-red-400" />
      </span>
    )
  }

  if (status === "success") {
    return (
      <span
        data-slot="toast-icon"
        className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 grid place-items-center shrink-0"
      >
        <Icon name="check" className="w-3 h-3 text-emerald-400" />
      </span>
    )
  }

  return (
    <span
      data-slot="toast-icon"
      className="w-5 h-5 rounded-full bg-white/10 text-white grid place-items-center shrink-0"
    >
      <Icon name="info" className="w-3 h-3 text-white" />
    </span>
  )
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toastItem) => {
    const status = getToastStatus(toastItem)
    const textClass =
      status === "error"
        ? "text-red-400"
        : status === "success"
        ? "text-emerald-400"
        : "text-white"

    return (
      <Toast key={toastItem.id} toast={toastItem}>
        <ToastContent>
          <ToastIcon status={status} />
          <div className="flex min-w-0 flex-1 flex-col">
            <ToastTitle className={textClass} />
            <ToastDescription className={cn("text-[11px] font-medium mt-0.5", textClass, "opacity-80")} />
          </div>
          <ToastAction />
          <ToastClose />
        </ToastContent>
      </Toast>
    )
  })
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
}

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
}
