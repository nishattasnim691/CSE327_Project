import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  Home,
  Package,
  RefreshCw,
  Truck,
} from "lucide-react";

import {
  getAllPharmacyOrders,
  getPharmacyOrder,
} from "../services/api/PharmacyApi";


type OrderStatus =
  | "Processing"
  | "Out for Delivery"
  | "Delivered";


type StoredOrder = {
  orderId: string;
  status: OrderStatus;
  medicine?: string;
  patientId?: string;
  quantity?: number;
  total?: number;
  createdAt?: string;
  address?: string;
};


function normalizeOrder(
  value: unknown
): StoredOrder | null {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const rawOrder =
    value as Record<string, unknown>;

  const orderId =
    rawOrder.orderId ||
    rawOrder.OrderID;

  if (
    typeof orderId !== "string" ||
    orderId.trim() === ""
  ) {
    return null;
  }

  return {
    orderId,
    status: (
      rawOrder.status ||
      rawOrder.Status ||
      "Processing"
    ) as OrderStatus,
    medicine: (
      rawOrder.medicine ||
      rawOrder.Medicine
    ) as string | undefined,
    patientId: (
      rawOrder.patientId ||
      rawOrder.PatientID
    ) as string | undefined,
    quantity: (
      rawOrder.quantity ||
      rawOrder.Quantity
    ) as number | undefined,
    total: (
      rawOrder.total ||
      rawOrder.Total
    ) as number | undefined,
    createdAt: (
      rawOrder.createdAt ||
      rawOrder.CreatedAt
    ) as string | undefined,
    address: (
      rawOrder.address ||
      rawOrder.Address
    ) as string | undefined,
  };
}


async function loadLatestKnownOrder() {
  const patientId =
    localStorage.getItem("patientId");

  const orders =
    await getAllPharmacyOrders();

  const normalizedOrders =
    orders
      .map(normalizeOrder)
      .filter(
        (order): order is StoredOrder =>
          Boolean(order)
      )
      .filter(
        (order) =>
          !patientId ||
          order.patientId === patientId
      )
      .sort(
        (a, b) =>
          new Date(
            b.createdAt || ""
          ).getTime() -
          new Date(
            a.createdAt || ""
          ).getTime()
      );

  return normalizedOrders[0] || null;
}


const STATUS_STEPS: OrderStatus[] = [
  "Processing",
  "Out for Delivery",
  "Delivered",
];


export default function OrderTrackingPage() {

  const [order, setOrder] =
    useState<StoredOrder | null>(null);

  const [error, setError] =
    useState("");



  useEffect(() => {

    loadOrder();

  }, []);




  async function loadOrder() {

    const savedOrder =
      localStorage.getItem(
        "latestPharmacyOrder"
      );


    if (!savedOrder) {
      try {
        const latestOrder =
          await loadLatestKnownOrder();

        if (latestOrder) {
          setOrder(latestOrder);

          localStorage.setItem(
            "latestPharmacyOrder",
            JSON.stringify(latestOrder)
          );

          return;
        }
      } catch (error) {
        console.error(error);
      }

      setError(
        "No pharmacy order found."
      );

      return;

    }


    try {

      const saved =
        normalizeOrder(
          JSON.parse(savedOrder)
        );

      if (!saved) {
        localStorage.removeItem(
          "latestPharmacyOrder"
        );

        const latestOrder =
          await loadLatestKnownOrder();

        if (latestOrder) {
          setOrder(latestOrder);

          localStorage.setItem(
            "latestPharmacyOrder",
            JSON.stringify(latestOrder)
          );

          return;
        }

        setError(
          "No pharmacy order found."
        );

        return;
      }

      const latestOrder =
        await getPharmacyOrder(
          saved.orderId
        );

      const normalizedOrder =
        normalizeOrder(latestOrder);

      if (!normalizedOrder) {
        setError(
          latestOrder?.error ||
          "Unable to load order."
        );

        return;
      }

      setOrder(
        normalizedOrder
      );

      localStorage.setItem(
        "latestPharmacyOrder",
        JSON.stringify(normalizedOrder)
      );


    } catch(error) {

      console.error(error);

      setError(
        "Unable to load order."
      );

    }

  }





  const activeIndex = useMemo(()=>{

    if(!order)
      return 0;


    return STATUS_STEPS.indexOf(
      order.status
    );


  },[order]);





  return (

<div className="min-h-screen bg-[#F5F8F7] text-[#12231F]">


<header className="border-b bg-[#0F3D3E] text-white">

<div className="mx-auto max-w-6xl px-6 py-4">


<Link
to="/kiosk"
className="flex items-center gap-2 text-sm"
>

<ArrowLeft size={18}/>

Back to Kiosk

</Link>


<div className="mt-4 flex items-center gap-3">

<Truck size={22}/>

<div>

<h1 className="text-xl font-semibold">
Track Order
</h1>

<p className="text-xs text-[#8FB9AE]">
Pharmacy delivery status
</p>

</div>

</div>


</div>

</header>





<main className="mx-auto max-w-6xl px-6 py-8">


{error && (

<div className="rounded-xl bg-red-100 p-4 text-red-700">

{error}

</div>

)}





{!order && !error && (

<div>
Loading order...
</div>

)}






{order && (

<>


<div className="rounded-xl bg-white p-6 shadow">


<div className="flex justify-between">


<div>

<p className="text-sm text-gray-500">
Order ID
</p>

<h2 className="font-bold">
{order.orderId}
</h2>

</div>



<div className="flex items-center gap-2">

<CircleDot size={16}/>

{order.status}

</div>



</div>

</div>






<div className="mt-6 grid gap-4 md:grid-cols-3">


{
STATUS_STEPS.map(
(step,index)=>(

<div
key={step}
className="rounded-xl bg-white p-5 shadow"
>


{
index <= activeIndex

?

<CheckCircle2 className="text-green-600"/>

:

index === 1

?

<Truck/>

:

<Package/>

}



<h3 className="mt-3 font-semibold">

{step}

</h3>


</div>

)

)

}


</div>






<div className="mt-6 rounded-xl bg-white p-6 shadow">


<h2 className="font-semibold">
Order Details
</h2>


<p className="mt-3">

Medicine:
{" "}
{order.medicine ?? "N/A"}

</p>



<p>

Quantity:
{" "}
{order.quantity ?? 0}

</p>



<p>

Total:
{" "}
৳{order.total ?? 0}

</p>



{
order.address &&

<p className="mt-3 flex gap-2">

<Home size={18}/>

{order.address}

</p>

}



</div>






<div className="mt-6">

<button

onClick={loadOrder}

className="flex items-center gap-2 rounded-xl border px-5 py-3"

>

<RefreshCw size={18}/>

Refresh Status

</button>


</div>



</>

)}



</main>


</div>

  );

}
