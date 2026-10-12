const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const formatRupees = (amount: number): string => rupees.format(amount);

/** 10000 → "10K", matching how creators talk about views. */
export const formatViews = (views: number): string => compact.format(views);

export const formatDate = (iso: string): string => date.format(new Date(iso));
