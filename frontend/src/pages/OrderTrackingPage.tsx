import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  Clock3,
  Home,
  Package,
  RefreshCw,
  ShoppingCart,
  Truck,
} from "lucide-react";

type OrderStatus = "Processing" | "Out for Delivery" | "Delivered";

type StoredOrder = {
  orderId: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: string;
  items: Array<{
    id: number;
    medicine: string;
    dosage: string;
    quantity: number;
    unitPrice: number;
    inStock: boolean;
  }>;
  createdAt: string;
};

const STATUS_STEPS: OrderStatus[] = [
  "Processing",
  "Out for Delivery",
  "Delivered",
];

export default function OrderTrackingPage() {
  const [order, setOrder] = useState<StoredOrder | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("latestPharmacyOrder");

    if (!saved) {
      setOrder(null);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as StoredOrder;
      setOrder(parsed);
    } catch {
      setOrder(null);
    }
  }, []);

  const activeIndex = useMemo(() => {
    if (!order) return 0;
    return STATUS_STEPS.indexOf(order.status);
  }, [order]);

  function simulateNextStatus() {
    if (!order) return;

    const currentIndex = STATUS_STEPS.indexOf(order.status);

    if (currentIndex >= STATUS_STEPS.length - 1) {
      return;
    }

    const nextStatus = STATUS_STEPS[currentIndex + 1];

    const updatedOrder: StoredOrder = {
      ...order,
      status: nextStatus,
    };

    setOrder(updatedOrder);

    localStorage.setItem(
      "latestPharmacyOrder",
      JSON.stringify(updatedOrder)
    );
  }

  function reloadOrder() {
    const saved = localStorage.getItem("latestPharmacyOrder");

    if (!saved) {
      setOrder(null);
      return;
    }

    try {
      setOrder(JSON.parse(saved) as StoredOrder);
    } catch {
      setOrder(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F8F7] text-[#12231F]">
      <header className="border-b border-white/10 bg-[#0F3D3E] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-4">
          <Link
            to="/kiosk"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#D7EBE6] transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Kiosk
          </Link>

          <div className="hidden h-6 w-px bg-white/20 sm:block" />

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B7A6B]">
              <Truck size={20} />
            </div>

            <div>
              <h1 className="font-semibold">Track Order</h1>
              <p className="text-xs text-[#8FB9AE]">
                Pharmacy delivery status
              </p>
            </div>
          </div>

          {order && (
            <div className="ml-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-[#D7EBE6]">
              <CircleDot size={14} />
              {order.status}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {!order ? (
          <section className="mx-auto max-w-2xl rounded-2xl border border-[#D8E5E0] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF7F4] text-[#1B7A6B]">
              <Package size={26} />
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-[#223A34]">
              No pharmacy order found
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#667A73]">
              Complete the pharmacy checkout first. After a successful purchase,
              your latest order will appear here automatically.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/kiosk/checkout"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B665E]"
              >
                <ShoppingCart size={17} />
                Go to Checkout
              </Link>

              <button
                type="button"
                onClick={reloadOrder}
                className="inline-flex items-center gap-2 rounded-xl border border-[#D8E5E0] bg-white px-5 py-3 text-sm font-semibold text-[#29443D] transition hover:border-[#1B7A6B]"
              >
                <RefreshCw size={17} />
                Check Again
              </button>
            </div>
          </section>
        ) : (
          <>
            <div className="mb-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#DCEEE9] px-3 py-1.5 text-xs font-semibold text-[#1B7A6B]">
                <Package size={14} />
                Order {order.orderId}
              </span>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#12231F] md:text-4xl">
                Your medicine delivery
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-[#667A73]">
                Follow your order from pharmacy processing through final
                delivery.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <section className="space-y-5">
                <div className="rounded-2xl border border-[#D8E5E0] bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1B7A6B]">
                    Delivery progress
                  </p>

                  <div className="mt-7 grid gap-4 md:grid-cols-3">
                    {STATUS_STEPS.map((step, index) => {
                      const complete = index < activeIndex;
                      const active = index === activeIndex;

                      return (
                        <div
                          key={step}
                          className={`rounded-2xl border p-5 ${
                            complete
                              ? "border-emerald-200 bg-emerald-50"
                              : active
                              ? "border-[#1B7A6B] bg-[#EDF7F4]"
                              : "border-[#E1E8E5] bg-[#FAFCFB]"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              complete
                                ? "bg-emerald-100 text-emerald-700"
                                : active
                                ? "bg-[#1B7A6B] text-white"
                                : "bg-[#EEF3F1] text-[#82918C]"
                            }`}
                          >
                            {complete ? (
                              <CheckCircle2 size={19} />
                            ) : index === 0 ? (
                              <Package size={19} />
                            ) : index === 1 ? (
                              <Truck size={19} />
                            ) : (
                              <Home size={19} />
                            )}
                          </div>

                          <h3
                            className={`mt-4 font-semibold ${
                              active
                                ? "text-[#0F5A50]"
                                : complete
                                ? "text-emerald-800"
                                : "text-[#667A73]"
                            }`}
                          >
                            {step}
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-[#81928C]">
                            {step === "Processing" &&
                              "The pharmacy is preparing your order."}
                            {step === "Out for Delivery" &&
                              "Your medicine has left the pharmacy."}
                            {step === "Delivered" &&
                              "Your medicine has reached the delivery address."}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#D8E5E0] bg-white shadow-sm">
                  <div className="border-b border-[#E3ECE9] bg-[#F9FBFA] px-6 py-5">
                    <h3 className="font-semibold text-[#223A34]">
                      Order items
                    </h3>
                  </div>

                  <div className="divide-y divide-[#E7EEEB]">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center gap-4 px-6 py-5"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCEEE9] text-[#1B7A6B]">
                          <Package size={18} />
                        </div>

                        <div className="min-w-[180px] flex-1">
                          <h4 className="font-semibold text-[#223A34]">
                            {item.medicine}
                          </h4>
                          <p className="mt-1 text-xs text-[#81928C]">
                            {item.dosage} · Quantity {item.quantity}
                          </p>
                        </div>

                        <p className="text-sm font-semibold text-[#29443D]">
                          ৳{item.unitPrice * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-[#D8E5E0] bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1B7A6B]">
                    Order summary
                  </p>

                  <div className="mt-5 space-y-3 text-sm">
                    <SummaryRow label="Order ID" value={order.orderId} />
                    <SummaryRow
                      label="Status"
                      value={order.status}
                    />
                    <SummaryRow
                      label="Created"
                      value={new Date(order.createdAt).toLocaleString()}
                    />
                  </div>

                  <div className="mt-5 border-t border-[#E3ECE9] pt-4">
                    <SummaryRow label="Subtotal" value={`৳${order.subtotal}`} />
                    <SummaryRow
                      label="Delivery fee"
                      value={`৳${order.deliveryFee}`}
                    />
                    <SummaryRow
                      label="Total"
                      value={`৳${order.total}`}
                      strong
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#D8E5E0] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Home size={18} className="text-[#1B7A6B]" />
                    <h3 className="font-semibold text-[#29443D]">
                      Delivery address
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[#667A73]">
                    {order.address}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#CFE2DC] bg-[#EDF7F4] p-5">
                  <div className="flex items-center gap-2 text-[#0F5A50]">
                    <Clock3 size={18} />
                    <h3 className="font-semibold">
                      Real-time update ready
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[#59736A]">
                    In the final integrated version, the dispatcher or backend
                    will change the order state and this page will update
                    automatically through your API/WebSocket layer.
                  </p>
                </div>

                {order.status !== "Delivered" && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                      Demo control
                    </p>

                    <p className="mt-2 text-sm leading-6 text-amber-800">
                      Use this only for the course demo until the dispatcher
                      interface is connected.
                    </p>

                    <button
                      type="button"
                      onClick={simulateNextStatus}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
                    >
                      <RefreshCw size={16} />
                      Simulate Next Status
                    </button>
                  </div>
                )}
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
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
    <div className="flex items-start justify-between gap-4 py-1">
      <span className={strong ? "font-semibold text-[#29443D]" : "text-[#81928C]"}>
        {label}
      </span>

      <span
        className={`max-w-[180px] text-right ${
          strong
            ? "text-lg font-bold text-[#0F3D3E]"
            : "font-medium text-[#29443D]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}