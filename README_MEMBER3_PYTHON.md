# Member 3 — Python Design Patterns

This folder contains the official Python implementations for Member 3.

## Pattern 6 — Facade

`backend/patterns/facade/pharmacy_checkout_facade.py`

Flow:

React CheckoutPage
→ POST `/api/checkout`
→ `PharmacyCheckoutFacade.checkout()`
→ `InventoryService`
→ `PaymentService`
→ `OrderService`
→ JSON order result

The facade does **not** implement Member 2's OrderState classes and does
not own Member 1's database.

## Pattern 7 — Observer

`backend/patterns/observer/health_record.py`
`backend/patterns/observer/patient_dashboard_observer.py`

Flow:

React PatientDashboard
→ POST `/api/patients/P001/vitals`
→ `HealthRecord.add_vital()`
→ `HealthRecord.notify()`
→ `PatientDashboardObserver.update()`
→ WebSocket broadcast
→ Patient/Doctor React views update.

No medical interpretation is performed. These are synthetic prototype values.

## Run

From the project root:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Test:

- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/api/member3/health`

Frontend `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Restart Vite after changing `.env`.
