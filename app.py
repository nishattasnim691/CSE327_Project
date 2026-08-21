import streamlit as st
import pandas as pd
import datetime # 1. Import datetime to fix the calendar window
from database_manager import DatabaseConnectionPool
from offline_sync import OfflineSyncManager, SaveSymptomLogCommand # <-- AGILE: Import your Command Pattern!

# Set up the visual page configuration
st.set_page_config(page_title="Virtual Clinic", page_icon="🏥", layout="wide")

# AGILE: Initialize the Offline Sync Manager in the website's memory
if 'sync_manager' not in st.session_state:
    st.session_state.sync_manager = OfflineSyncManager()
    st.session_state.sync_manager.is_online = True

# Connect to the database using your Singleton!
db = DatabaseConnectionPool()


# Create a sidebar for navigation
st.sidebar.title("🏥 Virtual Clinic System")

# AGILE FEATURE: Offline Network Toggle
st.sidebar.subheader("📡 Network Status")
is_offline = st.sidebar.checkbox("Simulate Network Drop (Offline Mode)")

if is_offline and st.session_state.sync_manager.is_online:
    st.session_state.sync_manager.simulate_connection_drop()
    st.sidebar.error("Internet Disconnected! Kiosk running locally.")
elif not is_offline and not st.session_state.sync_manager.is_online:
    st.session_state.sync_manager.simulate_connection_restored()
    st.sidebar.success("Network Restored! Queued data synced.")

page = st.sidebar.radio("Go to", ["Patient Kiosk", "Doctor Portal", "Database Viewer"])

if page == "Patient Kiosk":
    st.title("Welcome to the Patient Kiosk")
    st.write("Please enter your details and symptoms below.")
    
    # Create a visual form for the patient
    with st.form("patient_form"):
        p_id = st.text_input("Patient ID (e.g., P-002)")
        name = st.text_input("Full Name")
        
        # 2. Update the date_input to allow dates going back to 1900!
        dob = st.date_input(
            "Date of Birth", 
            min_value=datetime.date(1900, 1, 1), 
            max_value=datetime.date.today()
        )
        
        blood_type = st.selectbox("Blood Type", ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"])
        
        # AGILE: Add symptoms field for the Command Pattern
        symptoms = st.text_area("Describe your symptoms:")
        
        submitted = st.form_submit_button("Register")
        
        if submitted and p_id and name:
            # Save to your SQLite database (Using OR IGNORE to prevent crashes on duplicate IDs)
            db.execute_query(
                "INSERT OR IGNORE INTO Patients (PatientID, Name, DOB, BloodType) VALUES (?, ?, ?, ?)",
                (p_id, name, str(dob), blood_type)
            )
            
            # AGILE: Execute the Command Pattern for symptoms!
            if symptoms:
                cmd = SaveSymptomLogCommand(p_id, symptoms, "Pending Triage")
                st.session_state.sync_manager.add_action(cmd)
            
            if is_offline:
                st.warning(f"Patient {name} registered locally. Symptoms queued in offline mode!")
            else:
                st.success(f"Patient {name} registered and synced to central database!")

elif page == "Doctor Portal":
    st.title("👨‍⚕️ Doctor Portal")
    st.write("Review incoming patients and triage queues.")
    
    # Fetch all patients from your database
    results = db.execute_query("SELECT * FROM Patients")
    
    if results:
        # Convert the SQL results into a beautiful web table using Pandas
        df = pd.DataFrame(results, columns=["Patient ID", "Name", "DOB", "Blood Type"])
        st.dataframe(df, use_container_width=True)
    else:
        st.info("No patients in the system yet.")

elif page == "Database Viewer":
    st.title("⚙️ Backend Database Viewer")
    st.write("Since you are Member 1, use this page to prove your database works!")
    
    # Show Doctors table
    st.subheader("Doctors Table")
    doc_results = db.execute_query("SELECT * FROM Doctors")
    if doc_results:
        st.dataframe(pd.DataFrame(doc_results, columns=["Doctor ID", "Name", "License"]))