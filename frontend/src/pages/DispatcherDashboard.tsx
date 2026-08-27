import { useEffect, useState } from "react";
import {
  Truck,
  CheckCircle2,
  Package
} from "lucide-react";

import {
  getAllPharmacyOrders,
  shipPharmacyOrder,
  deliverPharmacyOrder
} from "../services/api/PharmacyApi";


type Order = {
  orderId: string;
  patientId: string;
  medicine: string;
  quantity: number;
  status: string;
  total: number;
};



export default function DispatcherDashboard() {


  const [orders, setOrders] =
    useState<Order[]>([]);

  const [error, setError] =
    useState("");

  const [updatingOrderId, setUpdatingOrderId] =
    useState("");



  useEffect(() => {

    loadOrders();

  }, []);




  async function loadOrders() {

    try {

      setError("");

      const data =
        await getAllPharmacyOrders();


      setOrders(data);


    } catch(error) {

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load pharmacy orders."
      );

      console.error(
        "Failed to load orders",
        error
      );

    }

  }





  async function handleShip(
    orderId:string
  ) {

    try {
      setUpdatingOrderId(orderId);
      await shipPharmacyOrder(orderId);
      await loadOrders();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update order.");
    } finally {
      setUpdatingOrderId("");
    }

  }





  async function handleDeliver(
    orderId:string
  ) {

    try {
      setUpdatingOrderId(orderId);
      await deliverPharmacyOrder(orderId);
      await loadOrders();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update order.");
    } finally {
      setUpdatingOrderId("");
    }

  }





  return (

    <div className="min-h-screen bg-[#F5F8F7] p-8">


      <h1 className="text-3xl font-bold mb-6">
        Dispatcher Dashboard
      </h1>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}



      <div className="grid gap-5">


      {
        orders.map(order => (

          <div
            key={order.orderId}
            className="rounded-xl bg-white p-6 shadow"
          >


            <div className="flex justify-between">


              <div>

                <h2 className="font-semibold">

                  Order ID:
                  {" "}
                  {order.orderId}

                </h2>


                <p>
                  Patient:
                  {" "}
                  {order.patientId}
                </p>


                <p>
                  Medicine:
                  {" "}
                  {order.medicine}
                </p>


                <p>
                  Quantity:
                  {" "}
                  {order.quantity}
                </p>


              </div>



              <div className="flex items-center gap-2">

                <Package size={18}/>

                {order.status}

              </div>


            </div>





            <div className="mt-5 flex gap-3">


            {
              order.status === "Processing" &&

              <button

              onClick={() =>
                handleShip(order.orderId)
              }

              disabled={updatingOrderId === order.orderId}

              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white"

              >

              <Truck size={18}/>

              {updatingOrderId === order.orderId ? "Updating..." : "Mark Out for Delivery"}

              </button>

            }





            {
              order.status === "Out for Delivery" &&


              <button

              onClick={() =>
                handleDeliver(order.orderId)
              }

              disabled={updatingOrderId === order.orderId}

              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white"

              >

              <CheckCircle2 size={18}/>

              {updatingOrderId === order.orderId ? "Updating..." : "Mark Delivered"}

              </button>

            }


            </div>


          </div>


        ))
      }


      </div>


    </div>

  );

}