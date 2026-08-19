export type PharmacyItem = {
  id: number;
  medicine: string;
  dosage: string;
  quantity: number;
  unitPrice: number;
  inStock: boolean;
};

export type CheckoutRequest = {
  prescriptionId: string;
  patientId: string;
  address: string;
  items: PharmacyItem[];
  deliveryFee: number;
};

export type PharmacyOrder = {
  orderId: string;
  status: "Processing";
  prescriptionId: string;
  patientId: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: string;
  items: PharmacyItem[];
  transactionId: string;
  createdAt: string;
};

export type CheckoutResult =
  | {
      success: true;
      order: PharmacyOrder;
    }
  | {
      success: false;
      message: string;
    };