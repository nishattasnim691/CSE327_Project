from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid

from database.database_manager import DatabaseConnectionPool
from patterns.state.pharmacy_order import PharmacyOrder
from patterns.state.order_registry import orders
from patterns.state.shipped_state import ShippedState
from patterns.state.delivered_state import DeliveredState


router = APIRouter()


db = DatabaseConnectionPool()


# ==========================
# Dispatcher: View Orders
# ==========================

@router.get("/api/pharmacy/orders")
def get_all_orders():

    result = db.execute_query(
        """
        SELECT
            OrderID,
            PatientID,
            Medicine,
            Quantity,
            Status,
            Total,
            CreatedAt
        FROM PharmacyOrders
        """
    )


    orders_list = []


    for order in result:

        orders_list.append({

            "orderId": order[0],

            "patientId": order[1],

            "medicine": order[2],

            "quantity": order[3],

            "status": order[4],

            "total": order[5],

            "createdAt": order[6]

        })


    return orders_list





# ==========================
# Patient: View Single Order
# ==========================

@router.get("/api/pharmacy/order/{order_id}")
def get_pharmacy_order(order_id: str):


    result = db.execute_query(
        """
        SELECT
            OrderID,
            PatientID,
            Medicine,
            Quantity,
            Status,
            Total,
            CreatedAt
        FROM PharmacyOrders
        WHERE OrderID = ?
        """,
        (order_id,)
    )


    if not result:

        return {
            "error": "Order not found"
        }


    order = result[0]


    return {

        "orderId": order[0],

        "patientId": order[1],

        "medicine": order[2],

        "quantity": order[3],

        "status": order[4],

        "total": order[5],

        "createdAt": order[6]

    }


def _get_stateful_order(order_id: str):
    stored = orders.get(order_id)
    if stored:
        return stored["order"]

    result = db.execute_query(
        "SELECT Status FROM PharmacyOrders WHERE OrderID = ?",
        (order_id,),
    )
    if not result:
        return None

    pharmacy_order = PharmacyOrder()
    if result[0][0] == "Out for Delivery":
        pharmacy_order.set_state(ShippedState())
    elif result[0][0] == "Delivered":
        pharmacy_order.set_state(DeliveredState())

    orders[order_id] = {"order": pharmacy_order}
    return pharmacy_order




# ==========================
# Dispatcher:
# Processing → Shipped
# ==========================

@router.put("/api/pharmacy/order/{order_id}/ship")
def ship_order(order_id: str):


    pharmacy_order = _get_stateful_order(order_id)
    if pharmacy_order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    if pharmacy_order.get_state() != "ProcessingState":
        raise HTTPException(
            status_code=409,
            detail="Only processing orders can be marked out for delivery.",
        )


    pharmacy_order.ship()


    new_status = "Out for Delivery"


    db.execute_query(
        """
        UPDATE PharmacyOrders
        SET Status = ?
        WHERE OrderID = ?
        """,
        (
            new_status,
            order_id
        )
    )


    return {

        "orderId": order_id,

        "status": new_status

    }





# ==========================
# Dispatcher:
# Shipped → Delivered
# ==========================

@router.put("/api/pharmacy/order/{order_id}/deliver")
def deliver_order(order_id: str):


    pharmacy_order = _get_stateful_order(order_id)
    if pharmacy_order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    if pharmacy_order.get_state() != "ShippedState":
        raise HTTPException(
            status_code=409,
            detail="Only out-for-delivery orders can be marked delivered.",
        )


    pharmacy_order.deliver()


    new_status = "Delivered"


    db.execute_query(
        """
        UPDATE PharmacyOrders
        SET Status = ?
        WHERE OrderID = ?
        """,
        (
            new_status,
            order_id
        )
    )


    return {

        "orderId": order_id,

        "status": new_status

    }