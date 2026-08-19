import { Link } from "react-router-dom";

function KioskNav() {
  return (
    <nav>
      <h2>Virtual Clinic</h2>

      <div className="kiosk-nav-links">
        <Link to="/kiosk">Home</Link>

        <Link to="/kiosk/symptoms">
          Input Symptoms
        </Link>

        <Link to="/kiosk/prescription">
          Prescription
        </Link>

        <Link to="/kiosk/checkout">
          Buy Medicine
        </Link>

        <Link to="/kiosk/orders">
          Track Order
        </Link>

        <Link to="/kiosk/dashboard">
          Health Dashboard
        </Link>
      </div>
    </nav>
  );
}

export default KioskNav;