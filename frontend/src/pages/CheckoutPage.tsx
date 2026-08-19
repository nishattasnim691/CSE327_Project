import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  FileSearch,
  Home,
  PackageCheck,
  Pill,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Truck,
  WalletCards,
  Workflow,
} from "lucide-react";

import type {
  PharmacyItem,
  PharmacyOrder,
} from "../patterns/facade/types";

import {
  submitPharmacyCheckout,
} from "../services/api/PharmacyApi";

import {
  getPrescriptionForPatient,
  subscribeToPrescriptions,
  type DigitalPrescription,
} from "../services/PrescriptionStore";

type PaymentState =
  | "idle"
  | "processing"
  | "success"
  | "failed";

const PATIENT_ID = "P001";
const DELIVERY_FEE = 40;

export default function CheckoutPage() {
  const navigate = useNavigate();

  const [
    prescription,
    setPrescription,
  ] = useState<
    DigitalPrescription | null
  >(() =>
    getPrescriptionForPatient(
      PATIENT_ID
    )
  );

  const [
    address,
    setAddress,
  ] = useState(
    "Synthetic Patient Address, Rangpur"
  );

  const [
    paymentState,
    setPaymentState,
  ] = useState<PaymentState>(
    "idle"
  );

  const [
    createdOrder,
    setCreatedOrder,
  ] = useState<
    PharmacyOrder | null
  >(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    const refreshPrescription =
      () => {
        setPrescription(
          getPrescriptionForPatient(
            PATIENT_ID
          )
        );

        setPaymentState(
          "idle"
        );

        setCreatedOrder(
          null
        );

        setErrorMessage(
          ""
        );
      };

    const unsubscribe =
      subscribeToPrescriptions(
        refreshPrescription
      );

    refreshPrescription();

    return unsubscribe;
  }, []);

  const checkoutItems =
    useMemo<
      PharmacyItem[]
    >(() => {
      if (!prescription) {
        return [];
      }

      return prescription.medicines.map(
        (medicine) => ({
          id: medicine.id,
          medicine:
            medicine.medicine,
          dosage:
            medicine.dosage,
          quantity:
            medicine.quantity,
          unitPrice:
            medicine.unitPrice,

          /*
            Temporary inventory flag.

            The Facade's InventoryService
            currently expects this field.
            Later the real backend will
            query inventory from the
            database instead.
          */
          inStock: true,
        })
      );
    }, [prescription]);

  const subtotal =
    useMemo(
      () =>
        checkoutItems.reduce(
          (
            sum,
            item
          ) =>
            sum +
            item.unitPrice *
              item.quantity,
          0
        ),
      [checkoutItems]
    );

  const total =
    subtotal +
    DELIVERY_FEE;

  const allInStock =
    checkoutItems.length >
      0 &&
    checkoutItems.every(
      (item) =>
        item.inStock
    );

  const canCheckout =
    Boolean(
      prescription
    ) &&
    prescription?.status ===
      "Approved" &&
    address.trim().length >=
      8 &&
    allInStock &&
    paymentState !==
      "processing" &&
    paymentState !==
      "success";

  async function handleCheckout() {
    if (
      !canCheckout ||
      !prescription
    ) {
      return;
    }

    setPaymentState(
      "processing"
    );

    setErrorMessage(
      ""
    );

    let result;

    try {
      /*
        OFFICIAL PYTHON FACADE FLOW:
        React CheckoutPage
          -> POST /api/checkout
          -> Python PharmacyCheckoutFacade.checkout()
          -> InventoryService
          -> PaymentService
          -> OrderService
      */
      result =
        await submitPharmacyCheckout(
          {
            prescriptionId:
              prescription.prescriptionId,

            patientId:
              prescription.patientId,

            address,

            items:
              checkoutItems,

            deliveryFee:
              DELIVERY_FEE,
          }
        );
    } catch (error) {
      setPaymentState(
        "failed"
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Python checkout service is unavailable."
      );

      return;
    }

    if (
      !result.success
    ) {
      setPaymentState(
        "failed"
      );

      setErrorMessage(
        result.message
      );

      return;
    }

    setCreatedOrder(
      result.order
    );

    setPaymentState(
      "success"
    );

    /*
      Temporary bridge for the
      current frontend prototype.

      OrderTrackingPage reads this
      order until the shared backend
      order service is connected.
    */
    localStorage.setItem(
      "latestPharmacyOrder",
      JSON.stringify(
        result.order
      )
    );
  }

  if (!prescription) {
    return (
      <div className="min-h-screen bg-[#F5F8F7] text-[#12231F]">
        <CheckoutHeader
          prescriptionId={
            null
          }
        />

        <main className="mx-auto max-w-4xl px-6 py-12">
          <section className="rounded-2xl border border-[#D8E5E0] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF7F4] text-[#1B7A6B]">
              <FileSearch
                size={26}
              />
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-[#223A34]">
              No approved prescription
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#667A73]">
              Pharmacy checkout requires
              a doctor-issued digital
              prescription. Ask the
              remote doctor to issue a
              prescription for patient
              P001 first.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/kiosk/prescription"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B665E]"
              >
                <Pill
                  size={17}
                />
                My Prescription
              </Link>

              <Link
                to="/kiosk/consultation"
                className="inline-flex items-center gap-2 rounded-xl border border-[#D8E5E0] bg-white px-5 py-3 text-sm font-semibold text-[#29443D] transition hover:border-[#1B7A6B]"
              >
                Talk to Doctor
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8F7] text-[#12231F]">
      <CheckoutHeader
        prescriptionId={
          prescription.prescriptionId
        }
      />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#DCEEE9] px-3 py-1.5 text-xs font-semibold text-[#1B7A6B]">
            <WalletCards
              size={14}
            />
            Step 4 · Pharmacy
            Checkout
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#12231F] md:text-4xl">
            Review and confirm
            your order
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-[#667A73]">
            The medicines below
            come directly from the
            prescription issued in
            the Remote Doctor
            Portal. The purchase is processed through the Python PharmacyCheckoutFacade.
          </p>
        </div>

        <section className="mb-6 rounded-2xl border border-[#CFE2DC] bg-[#EDF7F4] p-5">
          <div className="flex items-start gap-3">
            <Workflow
              size={20}
              className="mt-0.5 shrink-0 text-[#1B7A6B]"
            />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1B7A6B]">
                Connected Checkout
                Workflow
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#29443D]">
                <span className="rounded-lg bg-white px-3 py-2 shadow-sm">
                  Doctor Prescription
                </span>

                <span>→</span>

                <span className="rounded-lg bg-white px-3 py-2 shadow-sm">
                  PrescriptionStore
                </span>

                <span>→</span>

                <span className="rounded-lg bg-white px-3 py-2 shadow-sm">
                  CheckoutPage
                </span>

                <span>→</span>

                <span className="rounded-lg bg-[#0F3D3E] px-3 py-2 text-white shadow-sm">
                  Python PharmacyCheckoutFacade
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-[#D8E5E0] bg-white shadow-sm">
              <div className="border-b border-[#E3ECE9] bg-[#F9FBFA] px-6 py-5">
                <div className="flex items-center gap-3">
                  <PackageCheck
                    size={20}
                    className="text-[#1B7A6B]"
                  />

                  <div>
                    <h3 className="font-semibold text-[#223A34]">
                      Prescription
                      items
                    </h3>

                    <p className="text-xs text-[#81928C]">
                      {
                        prescription.prescriptionId
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-[#E7EEEB]">
                {checkoutItems.map(
                  (
                    item
                  ) => (
                    <div
                      key={
                        item.id
                      }
                      className="flex flex-wrap items-center gap-4 px-6 py-5"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DCEEE9] text-[#1B7A6B]">
                        <Pill
                          size={20}
                        />
                      </div>

                      <div className="min-w-[180px] flex-1">
                        <h4 className="font-semibold text-[#223A34]">
                          {
                            item.medicine
                          }
                        </h4>

                        <p className="mt-1 text-xs text-[#81928C]">
                          {
                            item.dosage
                          }{" "}
                          · Quantity{" "}
                          {
                            item.quantity
                          }
                        </p>
                      </div>

                      <div className="text-right">
                        <div
                          className={`mb-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            item.inStock
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {item.inStock
                            ? "In stock"
                            : "Out of stock"}
                        </div>

                        <p className="text-sm font-semibold text-[#29443D]">
                          ৳
                          {item.unitPrice *
                            item.quantity}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#D8E5E0] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Home
                  size={19}
                  className="text-[#1B7A6B]"
                />

                <div>
                  <h3 className="font-semibold text-[#223A34]">
                    Delivery address
                  </h3>

                  <p className="text-xs text-[#81928C]">
                    Synthetic address for
                    prototype use
                  </p>
                </div>
              </div>

              <textarea
                value={
                  address
                }
                onChange={(
                  event
                ) =>
                  setAddress(
                    event
                      .target
                      .value
                  )
                }
                rows={3}
                maxLength={250}
                disabled={
                  paymentState ===
                  "success"
                }
                className="mt-4 w-full resize-none rounded-xl border border-[#CCDCD6] bg-[#FCFDFD] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#1B7A6B] focus:ring-4 focus:ring-[#69B9A5]/15 disabled:opacity-60"
              />
            </div>

            <div className="rounded-2xl border border-[#D8E5E0] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <CreditCard
                  size={19}
                  className="text-[#1B7A6B]"
                />

                <div>
                  <h3 className="font-semibold text-[#223A34]">
                    Simulated payment
                  </h3>

                  <p className="text-xs text-[#81928C]">
                    No real payment
                    information is
                    collected
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#D8E5E0] bg-[#F9FBFA] p-4">
                <p className="text-sm font-semibold text-[#29443D]">
                  Demo Payment Gateway
                </p>

                <p className="mt-1 text-xs leading-5 text-[#81928C]">
                  PaymentService is
                  invoked internally by
                  Python PharmacyCheckoutFacade.
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#D8E5E0] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <ReceiptText
                  size={18}
                  className="text-[#1B7A6B]"
                />

                <h3 className="font-semibold text-[#29443D]">
                  Order summary
                </h3>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <SummaryRow
                  label="Subtotal"
                  value={`৳${subtotal}`}
                />

                <SummaryRow
                  label="Delivery fee"
                  value={`৳${DELIVERY_FEE}`}
                />

                <div className="border-t border-[#E3ECE9] pt-3">
                  <SummaryRow
                    label="Total"
                    value={`৳${total}`}
                    strong
                  />
                </div>
              </div>

              {(paymentState ===
                "idle" ||
                paymentState ===
                  "failed") && (
                <button
                  type="button"
                  onClick={
                    handleCheckout
                  }
                  disabled={
                    !canCheckout
                  }
                  className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D3E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B665E] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <CreditCard
                    size={18}
                  />
                  Confirm Purchase
                </button>
              )}

              {paymentState ===
                "processing" && (
                <button
                  type="button"
                  disabled
                  className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D3E] px-5 py-3 text-sm font-semibold text-white opacity-80"
                >
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Facade processing…
                </button>
              )}

              {paymentState ===
                "failed" &&
                errorMessage && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
                    {
                      errorMessage
                    }
                  </div>
                )}

              {paymentState ===
                "success" &&
                createdOrder && (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-emerald-700"
                      />

                      <div>
                        <h4 className="font-semibold text-emerald-800">
                          Checkout
                          completed
                        </h4>

                        <p className="mt-1 text-xs leading-5 text-emerald-700">
                          Order ID:{" "}
                          {
                            createdOrder.orderId
                          }
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-700">
                          Prescription:{" "}
                          {
                            createdOrder.prescriptionId
                          }
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-700">
                          State:{" "}
                          {
                            createdOrder.status
                          }
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/kiosk/orders"
                        )
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                    >
                      <Truck
                        size={17}
                      />
                      Track Order
                    </button>
                  </div>
                )}
            </div>

            <div className="rounded-2xl border border-[#CFE2DC] bg-[#EDF7F4] p-5">
              <div className="flex items-center gap-2 text-[#0F5A50]">
                <ShieldCheck
                  size={18}
                />

                <h3 className="font-semibold">
                  Prescription linked
                </h3>
              </div>

              <div className="mt-4 space-y-2 text-sm leading-6 text-[#59736A]">
                <p>
                  <strong>
                    Prescription:
                  </strong>{" "}
                  {
                    prescription.prescriptionId
                  }
                </p>

                <p>
                  <strong>
                    Patient:
                  </strong>{" "}
                  {
                    prescription.patientId
                  }
                </p>

                <p>
                  <strong>
                    Medicines:
                  </strong>{" "}
                  {
                    checkoutItems.length
                  }
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function CheckoutHeader({
  prescriptionId,
}: {
  prescriptionId:
    | string
    | null;
}) {
  return (
    <header className="border-b border-white/10 bg-[#0F3D3E] text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-4">
        <Link
          to="/kiosk"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#D7EBE6] transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft
            size={18}
          />
          Back to Kiosk
        </Link>

        <div className="hidden h-6 w-px bg-white/20 sm:block" />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B7A6B]">
            <ShoppingCart
              size={20}
            />
          </div>

          <div>
            <h1 className="font-semibold">
              Pharmacy Checkout
            </h1>

            <p className="text-xs text-[#8FB9AE]">
              Prescription-linked
              medicine purchase
            </p>
          </div>
        </div>

        <div
          className={`ml-auto inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium ${
            prescriptionId
              ? "bg-emerald-400/10 text-emerald-200"
              : "bg-amber-400/10 text-amber-200"
          }`}
        >
          <ShieldCheck
            size={14}
          />

          {prescriptionId
            ? "Prescription verified"
            : "Prescription required"}
        </div>
      </div>
    </header>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "font-semibold text-[#29443D]"
            : "text-[#667A73]"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-lg font-bold text-[#0F3D3E]"
            : "font-medium text-[#29443D]"
        }
      >
        {value}
      </span>
    </div>
  );
}
