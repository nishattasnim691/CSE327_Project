import type {
  CheckoutRequest,
  CheckoutResult,
} from "../../patterns/facade/types";

import { apiRequest } from "./ApiClient";


/*
  Facade Checkout
*/
export async function submitPharmacyCheckout(
  request: CheckoutRequest
): Promise<CheckoutResult> {

  return apiRequest<CheckoutResult>(
    "/api/checkout",
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}


/*
  Get order from database
*/
export async function getPharmacyOrder(
  orderId: string
) {

  return apiRequest<any>(
    `/api/pharmacy/order/${orderId}`,
    {
      method: "GET",
    }
  );

}

export async function getAllPharmacyOrders(){

  return apiRequest<any[]>(
    "/api/pharmacy/orders",
    {
      method:"GET"
    }
  );

}

/*
  State Pattern:
  Processing → Shipped
*/
export async function shipPharmacyOrder(
  orderId: string
) {

  return apiRequest<any>(
    `/api/pharmacy/order/${orderId}/ship`,
    {
      method: "PUT",
    }
  );

}


/*
  State Pattern:
  Shipped → Delivered
*/
export async function deliverPharmacyOrder(
  orderId: string
) {

  return apiRequest<any>(
    `/api/pharmacy/order/${orderId}/deliver`,
    {
      method: "PUT",
    }
  );

}