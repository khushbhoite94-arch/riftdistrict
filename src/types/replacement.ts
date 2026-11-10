export type ReplacementType = "damaged" | "replacement";

export type ReplacementStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "pickup_scheduled"
  | "picked_up"
  | "out_for_delivery"
  | "delivered";

export interface IReplacementRequest {
  _id: string;
  requestId: string;
  orderId: string;
  userId: string;
  type: ReplacementType;
  status: ReplacementStatus;
  images: string | string[];
  description?: string;
  requestedSize?: string;
  currentSize?: string;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  deliveryDate?: string;
}