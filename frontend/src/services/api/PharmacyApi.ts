import type {
  CheckoutRequest,
  CheckoutResult,
} from "../../patterns/facade/types";
import { apiRequest } from "./ApiClient";

/*
  React calls this API.
  The official PharmacyCheckoutFacade now runs in Python.
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
