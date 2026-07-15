# Virtual Clinic System

### An Offline-First Telemedicine & Pharmacy Kiosk

CSE327 – Software Engineering | North South University

---

## Group members

| # | Name | ID |
|---|------|-----|
| 1 | Nishat Tasnim | 2121692642 |
| 2 | Ismam Ahmed Surjo | 2312741042 |
| 3 | Sayema Tasnim Aroni | 2413241642 |

---

## Project description

The Virtual Clinic System is a resilient, text-first telemedicine kiosk application designed for low-bandwidth, underserved communities. It connects remote patients with healthcare professionals through an automated triage engine, asynchronous doctor consultations, and an integrated pharmacy module for prescription fulfillment and delivery tracking — all built to keep working through unreliable connectivity via offline-first data synchronization.

## Key features

- **Automated symptom triage** — classifies patient input as Critical, Urgent, Routine, or Self-Care
- **Asynchronous text consultation** — patient/doctor chat with accessibility support (jargon simplification, translation)
- **Role-based doctor verification** — mock credential checks unlock prescription privileges
- **Offline-first synchronization** — queues chat, triage, and prescription data locally, syncs when reconnected
- **Integrated pharmacy checkout** — prescription review, sandbox payment, delivery address confirmation
- **Order state tracking** — Processing → Out for Delivery → Delivered
- **Self-monitoring dashboard** — patients log vitals and view historical charts

## Target users

- **Patients** (rural/underserved) — kiosk end users
- **Remote physicians** — web portal for triage review and prescriptions
- **Pharmacy/logistics dispatchers** — order fulfillment and delivery status

## System design

The system architecture follows seven core design patterns:

| Pattern | Component | Purpose |
|---|---|---|
| Singleton | `DatabaseConnectionPool` | Single secure connection to the database |
| Chain of Responsibility | `TriageHandler` | Evaluates symptom severity |
| Decorator | `ChatInterface` | Adds jargon simplification and translation |
| Command | `SyncCommand` | Queues local actions when offline |
| Facade | `PharmacyCheckoutFacade` | Simplifies checkout into one call |
| State | `OrderState` | Manages pharmacy order lifecycle |
| Observer | `HealthRecord` | Notifies dashboard on new vitals |


## Getting started

```bash
# Clone the repository
git clone https://github.com/nishattasnim691/CSE327_Project.git
cd CSE327_Project

# Install dependencies
# npm install

# Run the app
# npm start
```

## Course context

This project was developed for **CSE327 (Software Engineering)** at North South University as an academic prototype demonstrating enterprise software architecture, design patterns, and compliant healthcare data handling.
