import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Droplets,
  Gauge,
  HeartPulse,
  MessageCircle,
  MinusCircle,
  Plus,
  Send,
  ShieldCheck,
  Stethoscope,
  Thermometer,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  sendConsultationMessage,
  getConsultationMessages,
  type SharedChatMessage,
} from "../services/api/ConsultationApi";

import {
  savePrescription,
  type DigitalPrescription,
  type PrescriptionMedicine,
} from "../services/PrescriptionStore";

import {
  type TriageLevel,
} from "../services/TriageStore";

import {
  fetchPatientVitals,
  type VitalRecordDto,
} from "../services/api/VitalsApi";
import {
  connectToVitalUpdates,
} from "../services/api/VitalsRealtime";

import {
  getPendingDoctorCases,
  getAcceptedDoctorCases,
  acceptDoctorCase,
  type AcceptedDoctorCase,
  type DoctorCase,
} from "../services/api/DoctorApi";

type VitalRecord = VitalRecordDto;

type MedicineDraft = {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: string;
  unitPrice: string;
};

const EMPTY_MEDICINE: MedicineDraft = {
  medicine: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
  quantity: "1",
  unitPrice: "",
};

export default function DoctorHome() {

  const [selectedPatientId, setSelectedPatientId] =
    useState("");

  const [messages, setMessages] =
    useState<SharedChatMessage[]>([]);

  const [messageText, setMessageText] =
    useState("");

  const [prescriptionNote, setPrescriptionNote] =
    useState(
      "Synthetic prescription created for the course demonstration."
    );

  const [medicines, setMedicines] =
    useState<MedicineDraft[]>([
      { ...EMPTY_MEDICINE },
    ]);

  const [issuedPrescriptionId, setIssuedPrescriptionId] =
    useState("");

  const [prescriptionError, setPrescriptionError] =
    useState("");

  const [latestVital, setLatestVital] =
    useState<VitalRecord | null>(
      null
    );

 const [pendingCases, setPendingCases] =
   useState<DoctorCase[]>([]);
const [acceptedCases, setAcceptedCases] =
  useState<AcceptedDoctorCase[]>([]);
  const selectedPatient = useMemo(
    () =>
      acceptedCases.find(
        (patient) =>
          patient.patientId === selectedPatientId
      ) ??
      acceptedCases[0] ??
      pendingCases.find(
        (patient) => patient.patientId === selectedPatientId
      ) ??
      pendingCases[0] ??
      null,
    [selectedPatientId, acceptedCases, pendingCases]
  );

  useEffect(() => {
    if (!selectedPatientId) {
      setMessages([]);
      return;
    }

    getConsultationMessages(selectedPatientId)
      .then(setMessages)
      .catch((error) =>
        console.error("Failed to load messages", error)
      );
  }, [selectedPatientId]);

  useEffect(() => {
    if (!selectedPatientId) {
      setLatestVital(null);
      return;
    }

    let active = true;

    const refreshLatest = (
      records: VitalRecord[]
    ) => {
      if (!active) {
        return;
      }

      setLatestVital(
        records.length > 0
          ? records[
              records.length - 1
            ]
          : null
      );
    };

    fetchPatientVitals(
      selectedPatientId
    )
      .then(
        refreshLatest
      )
      .catch(() => {
        if (active) {
          setLatestVital(
            null
          );
        }
      });

    const disconnect =
      connectToVitalUpdates(
        selectedPatientId,
        refreshLatest
      );

    return () => {
      active = false;
      disconnect();
    };
  }, [selectedPatientId]);

useEffect(() => {
  const loadCases = () => {
    Promise.all([
      getPendingDoctorCases(),
      getAcceptedDoctorCases(),
    ]).then(([pending, accepted]) => {
      setPendingCases(pending);
      setAcceptedCases(accepted);
      setSelectedPatientId((current) =>
        accepted.some((item) => item.patientId === current)
          ? current
          : accepted[0]?.patientId ?? pending[0]?.patientId ?? ""
      );
    }).catch((error) => {
      console.error("Failed to load doctor cases", error);
    });
  };

  loadCases();
  const refreshTimer = window.setInterval(loadCases, 5000);

  return () => window.clearInterval(refreshTimer);
}, []);

  async function handleAcceptCase(patientId: string) {
    const storedUser = sessionStorage.getItem(
      "virtualClinicCurrentUser"
    );
    const doctorId = storedUser
      ? (JSON.parse(storedUser) as { userId?: string }).userId
      : undefined;

    if (!doctorId) {
      console.error("Doctor identity is not available.");
      return;
    }

    await acceptDoctorCase(patientId, doctorId);

    setPendingCases((current) =>
      current.filter((item) => item.patientId !== patientId)
    );

    const accepted = await getAcceptedDoctorCases();
    setAcceptedCases(accepted);
    setSelectedPatientId(patientId);
  }

  function selectPatient(
    patientId: string
  ) {
    setSelectedPatientId(
      patientId
    );

    setIssuedPrescriptionId(
      ""
    );

    setPrescriptionError(
      ""
    );

    setMessageText(
      ""
    );

    setMedicines([
      { ...EMPTY_MEDICINE },
    ]);
  }

  function sendMessage(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const clean =
      messageText.trim();

    if (!clean) return;

    if (!acceptedCases.some((item) => item.patientId === selectedPatientId)) {
      console.error("Cannot start a conversation before the case is accepted.");
      return;
    }

   sendConsultationMessage(
    selectedPatientId,
    {
        sender: "doctor",
        text: clean
    }
)
      .then(() => getConsultationMessages(selectedPatientId))
      .then(setMessages)
      .catch((error) =>
        console.error("Failed to send message", error)
      );

    setMessageText("");
  }

  function updateMedicine(
    index: number,
    field: keyof MedicineDraft,
    value: string
  ) {
    setMedicines((current) =>
      current.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      )
    );

    setPrescriptionError(
      ""
    );

    setIssuedPrescriptionId(
      ""
    );
  }

  function addMedicine() {
    setMedicines(
      (current) => [
        ...current,
        {
          ...EMPTY_MEDICINE,
        },
      ]
    );
  }

  function removeMedicine(
    index: number
  ) {
    setMedicines(
      (current) => {
        if (
          current.length ===
          1
        ) {
          return [
            {
              ...EMPTY_MEDICINE,
            },
          ];
        }

        return current.filter(
          (
            _,
            itemIndex
          ) =>
            itemIndex !==
            index
        );
      }
    );

    setIssuedPrescriptionId(
      ""
    );
  }

  function issuePrescription() {
    if (!selectedPatient) {
      return;
    }

    setPrescriptionError(
      ""
    );

    setIssuedPrescriptionId(
      ""
    );

    if (
      !prescriptionNote.trim()
    ) {
      setPrescriptionError(
        "Please enter a prescription note."
      );
      return;
    }

    const incomplete =
      medicines.some(
        (item) => {
          const quantity =
            Number(
              item.quantity
            );

          const price =
            Number(
              item.unitPrice
            );

          return (
            !item.medicine.trim() ||
            !item.dosage.trim() ||
            !item.frequency.trim() ||
            !item.duration.trim() ||
            !Number.isFinite(
              quantity
            ) ||
            quantity <= 0 ||
            !Number.isFinite(
              price
            ) ||
            price < 0
          );
        }
      );

    if (incomplete) {
      setPrescriptionError(
        "Complete the required fields for every demo medicine."
      );
      return;
    }

    const prescriptionMedicines:
      PrescriptionMedicine[] =
      medicines.map(
        (item, index) => ({
          id:
            Date.now() +
            index,
          medicine:
            item.medicine.trim(),
          dosage:
            item.dosage.trim(),
          frequency:
            item.frequency.trim(),
          duration:
            item.duration.trim(),
          instructions:
            item.instructions.trim() ||
            "Synthetic course-demo instruction only.",
          quantity:
            Number(
              item.quantity
            ),
          unitPrice:
            Number(
              item.unitPrice
            ),
        })
      );

    const prescription:
      DigitalPrescription = {
      prescriptionId: `RX-VC-${Date.now()
        .toString()
        .slice(-8)}`,
      patientId:
        selectedPatient.patientId,
      patientName:
        selectedPatient.patientName,
      doctorName:
        "Dr. Sarah Ahmed",
      status: "Approved",
      note:
        prescriptionNote.trim(),
      issuedAt:
        new Date().toISOString(),
      medicines:
        prescriptionMedicines,
    };

    savePrescription(
      prescription
    );

    setIssuedPrescriptionId(
      prescription.prescriptionId
    );
  }

  if (!selectedPatient) {
    return (
      <div className="min-h-screen bg-[#F4F7F6] text-[#12231F]">
        <header className="border-b border-white/10 bg-[#0F3D3E] px-6 py-5 text-white">
          <div className="mx-auto flex max-w-[1500px] items-center gap-3">
            <Stethoscope size={20} />
            <h1 className="font-semibold">Remote Doctor Portal</h1>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-[#29443D]">
            No patient cases yet
          </h2>
          <p className="mt-2 text-sm text-[#81928C]">
            Patient submissions will appear here after they submit their symptoms.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-[#12231F]">
      <header className="border-b border-white/10 bg-[#0F3D3E] text-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-4 px-6 py-4">
          <Link
            to="/kiosk"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#D7EBE6] transition hover:bg-white/10"
          >
            <ArrowLeft size={18} />
            Patient Kiosk
          </Link>

          <div className="hidden h-6 w-px bg-white/20 sm:block" />

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B7A6B]">
              <Stethoscope size={20} />
            </div>

            <div>
              <h1 className="font-semibold">
                Remote Doctor Portal
              </h1>

              <p className="text-xs text-[#8FB9AE]">
                Virtual Clinic · Physician Workspace
              </p>
            </div>
          </div>

          <div className="ml-auto inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-200">
            <ShieldCheck size={14} />
            Live triage queue connected
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6 xl:grid-cols-[300px_1fr_390px]">
        {/* DOCTOR PENDING CASES */}
        <aside className="overflow-hidden rounded-2xl border border-[#D8E5E0] bg-white shadow-sm">
          <div className="border-b border-[#E3ECE9] bg-[#F9FBFA] p-5">
            <h2 className="font-semibold text-[#29443D]">Doctor Pending Cases</h2>
          </div>
          <div className="space-y-3 p-4">
            {pendingCases.length === 0 ? (
              <p className="text-sm text-[#81928C]">No pending patient cases</p>
            ) : (
              pendingCases.map((patient) => (
                <div key={patient.patientId} className="rounded-xl border p-4">
                  <p className="font-semibold">{patient.patientName}</p>
                  <p className="text-xs text-[#81928C]">{patient.patientId}</p>
                  <p className="mt-2 text-sm">Status: {patient.status}</p>
                  <button
                    onClick={() => handleAcceptCase(patient.patientId)}
                    className="mt-3 rounded-lg bg-[#0F3D3E] px-4 py-2 text-sm text-white"
                  >
                    Accept Case
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* TRIAGE QUEUE */}
        <aside className="overflow-hidden rounded-2xl border border-[#D8E5E0] bg-white shadow-sm">
          <div className="border-b border-[#E3ECE9] bg-[#F9FBFA] p-5">
            <div className="flex items-center gap-2">
              <Activity
                size={18}
                className="text-[#1B7A6B]"
              />

              <h2 className="font-semibold text-[#29443D]">
                Triage Queue
              </h2>
            </div>

            <p className="mt-1 text-xs text-[#81928C]">
              Shared patient submissions
            </p>
          </div>

          <div className="space-y-2 p-3">
            {acceptedCases.length === 0 ? (
              <p className="text-sm text-[#81928C]">
                No accepted patient cases
              </p>
            ) : (
              acceptedCases.map((patient) => {
                const active =
                  patient.patientId === selectedPatientId;

                return (
                  <button
                    key={patient.patientId}
                    type="button"
                    onClick={() =>
                      selectPatient(patient.patientId)
                    }
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-[#1B7A6B] bg-[#EDF7F4]"
                        : "border-transparent hover:border-[#D8E5E0] hover:bg-[#FAFCFB]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#29443D]">
                      {patient.patientName}
                    </p>

                    <p className="mt-1 text-xs text-[#81928C]">
                      {patient.patientId}
                    </p>

                    <p className="mt-2 text-sm">
                      Status: {patient.status}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* REVIEW + CHAT */}
        <section className="space-y-5">
          <div className="rounded-2xl border border-[#D8E5E0] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1B7A6B]">
                  Patient Review
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-[#223A34]">
                  {
                    selectedPatient.patientName
                  }
                </h2>

                <p className="mt-1 text-sm text-[#81928C]">
                  {
                    selectedPatient.patientId
                  }{" "}
                  · Age{" "}
                  {
                    selectedPatient.age
                  }
                </p>
              </div>

             <TriageBadge
  level={selectedPatient.triage ?? "Routine"}
  large
/>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <InfoCard
                icon={
                  <UserRound
                    size={18}
                  />
                }
                label="Submitted symptoms"
               value={
  (selectedPatient.symptoms ?? []).length > 0
    ? (selectedPatient.symptoms ?? []).join(", ")
    : selectedPatient.complaint ?? "No complaint provided"
}
              />

              <InfoCard
                icon={
                  <Clock3
                    size={18}
                  />
                }
                label="Duration"
                value={
                  selectedPatient.duration ?? "Not provided"
                }
              />

              <InfoCard
                icon={
                  <HeartPulse
                    size={18}
                  />
                }
                label="Automatic triage result"
                value={`${selectedPatient.triage}${
                  selectedPatient.triageSource === "backend"
                    ? " · Backend engine"
                    : " · Prototype fallback"
                }`}
              />
            </div>

            {selectedPatient.description && (
              <div className="mt-4 rounded-xl border border-[#E1E8E5] bg-[#FAFCFB] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#81928C]">
                  Patient description
                </p>

                <p className="mt-2 text-sm leading-6 text-[#40554E]">
                  {
                    selectedPatient.description
                  }
                </p>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-[#D8E5E0] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1B7A6B]">
                    Latest Self-Monitored Vitals
                  </p>

                  <p className="mt-1 text-xs text-[#81928C]">
                    Published by the Python PatientDashboardObserver in real time
                  </p>
                </div>

                {latestVital && (
                  <span className="rounded-full bg-[#EDF7F4] px-3 py-1 text-[11px] font-semibold text-[#1B7A6B]">
                    Updated {latestVital.recordedAt}
                  </span>
                )}
              </div>

              {latestVital ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <InfoCard
                    icon={
                      <HeartPulse
                        size={18}
                      />
                    }
                    label="Heart rate"
                    value={`${latestVital.heartRate} bpm`}
                  />

                  <InfoCard
                    icon={
                      <Thermometer
                        size={18}
                      />
                    }
                    label="Temperature"
                    value={`${latestVital.temperature} °C`}
                  />

                  <InfoCard
                    icon={
                      <Gauge
                        size={18}
                      />
                    }
                    label="Blood pressure"
                    value={`${latestVital.systolic}/${latestVital.diastolic} mmHg`}
                  />

                  <InfoCard
                    icon={
                      <Droplets
                        size={18}
                      />
                    }
                    label="Oxygen saturation"
                    value={`${latestVital.oxygen}%`}
                  />
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-[#F7FAF9] p-4 text-sm text-[#667A73]">
                  No synthetic vital record has been shared for this patient yet.
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
              The triage category is produced automatically through the triage-engine interface. The prototype fallback is not clinical decision support.
            </div>
          </div>

          <div className="flex min-h-[470px] flex-col overflow-hidden rounded-2xl border border-[#D8E5E0] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#E3ECE9] px-5 py-4">
              <MessageCircle
                size={18}
                className="text-[#1B7A6B]"
              />

              <div>
                <h3 className="font-semibold text-[#29443D]">
                  Patient Messages
                </h3>

                <p className="text-xs text-[#81928C]">
                  Shared asynchronous consultation
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[#FAFCFB] p-5">
              {messages.length ===
              0 ? (
                <div className="flex h-full min-h-[260px] items-center justify-center text-sm text-[#81928C]">
                  No messages yet
                </div>
              ) : (
                messages.map(
                  (message) => (
                    <ChatBubble
                      key={
                        message.id
                      }
                      message={
                        message
                      }
                    />
                  )
                )
              )}
            </div>

            <form
              onSubmit={
                sendMessage
              }
              className="border-t border-[#E3ECE9] bg-white p-4"
            >
              <div className="flex gap-3">
                <textarea
                  value={
                    messageText
                  }
                  onChange={(
                    event
                  ) =>
                    setMessageText(
                      event.target.value
                    )
                  }
                  rows={2}
                  maxLength={600}
                  placeholder="Write a message to the patient..."
                  className="flex-1 resize-none rounded-xl border border-[#CCDCD6] bg-[#FCFDFD] px-4 py-3 text-sm leading-6 outline-none focus:border-[#1B7A6B] focus:ring-4 focus:ring-[#69B9A5]/15"
                />

                <button
                  type="submit"
                  disabled={
                    !messageText.trim()
                  }
                  className="flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-xl bg-[#0F3D3E] text-white transition hover:bg-[#1B665E] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* PRESCRIPTION BUILDER */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-[#D8E5E0] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText
                size={18}
                className="text-[#1B7A6B]"
              />

              <div>
                <h3 className="font-semibold text-[#29443D]">
                  Digital Prescription
                </h3>

                <p className="text-xs text-[#81928C]">
                  Synthetic prescription builder
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-[#F2F7F5] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#81928C]">
                Patient
              </p>

              <p className="mt-1 text-sm font-semibold text-[#29443D]">
                {
                  selectedPatient.patientName
                }
              </p>

              <p className="mt-1 text-xs text-[#81928C]">
                {
                  selectedPatient.patientId
                }
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#29443D]">
                  Medicines
                </p>

                <p className="mt-0.5 text-xs text-[#81928C]">
                  Synthetic values only
                </p>
              </div>

              <button
                type="button"
                onClick={
                  addMedicine
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#BFD7CF] bg-[#EDF7F4] px-3 py-2 text-xs font-semibold text-[#0F5A50] transition hover:border-[#1B7A6B]"
              >
                <Plus size={14} />
                Add Medicine
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {medicines.map(
                (
                  medicine,
                  index
                ) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[#D8E5E0] bg-[#FAFCFB] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#1B7A6B]">
                        Medicine{" "}
                        {index +
                          1}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeMedicine(
                            index
                          )
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-red-600"
                      >
                        {medicines.length >
                        1 ? (
                          <Trash2
                            size={
                              14
                            }
                          />
                        ) : (
                          <MinusCircle
                            size={
                              14
                            }
                          />
                        )}

                        {medicines.length >
                        1
                          ? "Remove"
                          : "Clear"}
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      <Field
                        label="Medicine name *"
                        placeholder="Demo Medicine A"
                        value={
                          medicine.medicine
                        }
                        onChange={(
                          value
                        ) =>
                          updateMedicine(
                            index,
                            "medicine",
                            value
                          )
                        }
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="Dosage *"
                          placeholder="Demo Dose A"
                          value={
                            medicine.dosage
                          }
                          onChange={(
                            value
                          ) =>
                            updateMedicine(
                              index,
                              "dosage",
                              value
                            )
                          }
                        />

                        <Field
                          label="Frequency *"
                          placeholder="Demo Schedule A"
                          value={
                            medicine.frequency
                          }
                          onChange={(
                            value
                          ) =>
                            updateMedicine(
                              index,
                              "frequency",
                              value
                            )
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="Duration *"
                          placeholder="Demo Duration"
                          value={
                            medicine.duration
                          }
                          onChange={(
                            value
                          ) =>
                            updateMedicine(
                              index,
                              "duration",
                              value
                            )
                          }
                        />

                        <Field
                          label="Quantity *"
                          type="number"
                          min="1"
                          value={
                            medicine.quantity
                          }
                          onChange={(
                            value
                          ) =>
                            updateMedicine(
                              index,
                              "quantity",
                              value
                            )
                          }
                        />
                      </div>

                      <Field
                        label="Unit price (৳) *"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="120"
                        value={
                          medicine.unitPrice
                        }
                        onChange={(
                          value
                        ) =>
                          updateMedicine(
                            index,
                            "unitPrice",
                            value
                          )
                        }
                      />

                      <label className="block">
                        <span className="text-xs font-semibold text-[#536861]">
                          Demo instructions
                        </span>

                        <textarea
                          value={
                            medicine.instructions
                          }
                          onChange={(
                            event
                          ) =>
                            updateMedicine(
                              index,
                              "instructions",
                              event.target.value
                            )
                          }
                          rows={2}
                          maxLength={180}
                          placeholder="Synthetic course-demo instruction only."
                          className="mt-1.5 w-full resize-none rounded-lg border border-[#CCDCD6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1B7A6B] focus:ring-4 focus:ring-[#69B9A5]/15"
                        />
                      </label>
                    </div>
                  </div>
                )
              )}
            </div>

            <label className="mt-5 block">
              <span className="text-xs font-semibold text-[#536861]">
                Prescription note *
              </span>

              <textarea
                value={
                  prescriptionNote
                }
                onChange={(
                  event
                ) =>
                  setPrescriptionNote(
                    event.target.value
                  )
                }
                rows={4}
                maxLength={400}
                className="mt-2 w-full resize-none rounded-xl border border-[#CCDCD6] bg-[#FCFDFD] px-4 py-3 text-sm leading-6 outline-none focus:border-[#1B7A6B] focus:ring-4 focus:ring-[#69B9A5]/15"
              />
            </label>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              Use synthetic medicine names and demo values only. This is a
              software prototype, not real prescribing.
            </div>

            {prescriptionError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
                {
                  prescriptionError
                }
              </div>
            )}

            <button
              type="button"
              onClick={
                issuePrescription
              }
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D3E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B665E]"
            >
              <FileText
                size={17}
              />
              Issue Prescription
            </button>

            {issuedPrescriptionId && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-700">
                <CheckCircle2
                  size={15}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  Prescription shared with patient.
                  <div className="mt-1 font-mono">
                    {
                      issuedPrescriptionId
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  min?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#536861]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        min={min}
        step={step}
        className="mt-1.5 w-full rounded-lg border border-[#CCDCD6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1B7A6B] focus:ring-4 focus:ring-[#69B9A5]/15"
      />
    </label>
  );
}

function TriageBadge({
  level,
  large = false,
}: {
  level: TriageLevel;
  large?: boolean;
}) {
  const classes: Record<
    TriageLevel,
    string
  > = {
    Critical:
      "bg-red-100 text-red-700",
    Urgent:
      "bg-amber-100 text-amber-800",
    Routine:
      "bg-blue-100 text-blue-700",
    "Self-Care":
      "bg-emerald-100 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex shrink-0 rounded-full font-semibold ${
        large
          ? "px-4 py-2 text-sm"
          : "px-2.5 py-1 text-[10px]"
      } ${classes[level]}`}
    >
      {level}
    </span>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#E1E8E5] bg-[#FAFCFB] p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF7F4] text-[#1B7A6B]">
        {icon}
      </div>

      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[#81928C]">
        {label}
      </p>

      <p className="mt-1 text-sm leading-6 text-[#40554E]">
        {value}
      </p>
    </div>
  );
}

function ChatBubble({
  message,
}: {
  message: SharedChatMessage;
}) {
  const doctor =
    message.sender ===
    "doctor";

  return (
    <div
      className={`flex ${
        doctor
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-[82%] ${
          doctor
            ? "text-right"
            : ""
        }`}
      >
        <div
          className={`inline-block rounded-2xl px-4 py-3 text-left text-sm leading-6 ${
            doctor
              ? "rounded-tr-sm bg-[#0F3D3E] text-white"
              : "rounded-tl-sm border border-[#DFE8E5] bg-white text-[#40554E]"
          }`}
        >
          {message.text}
        </div>

        <p className="mt-1 text-[10px] text-[#9AA7A2]">
          {doctor
            ? "Doctor"
            : "Patient"}{" "}
          · {message.time}
        </p>
      </div>
    </div>
  );
}