import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCheck,
  Clock3,
  MessageCircle,
  Send,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Wifi,
  WifiOff,
} from "lucide-react";

import { getPatientProfile, type PatientProfile } from "../services/api/PatientApi";
import { getAcceptedDoctorCases } from "../services/api/DoctorApi";

import {
  getConsultationMessages,
  sendConsultationMessage,
  type ConsultationMessageDto,
} from "../services/api/ConsultationApi";

type SharedChatMessage = ConsultationMessageDto;

const PATIENT_ID = localStorage.getItem("patientId") || "";

export default function ConsultationPage() {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [doctorName, setDoctorName] = useState("Waiting for doctor");
  const [consultationAccepted, setConsultationAccepted] = useState(false);
  const [online, setOnline] = useState(
    typeof navigator !== "undefined"
      ? navigator.onLine
      : true
  );

  const [messages, setMessages] = useState<
  SharedChatMessage[]
>([]);

  const [messageText, setMessageText] =
    useState("");

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const goOnline = () =>
      setOnline(true);

    const goOffline = () =>
      setOnline(false);

    window.addEventListener(
      "online",
      goOnline
    );

    window.addEventListener(
      "offline",
      goOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        goOnline
      );

      window.removeEventListener(
        "offline",
        goOffline
      );
    };
  }, []);

  useEffect(() => {
    if (!PATIENT_ID) return;

    getAcceptedDoctorCases()
      .then((cases) => {
        const current = cases.find(
          (item: any) => item.patientId === PATIENT_ID
        );

        if (current) {
          setConsultationAccepted(true);
          setDoctorName(current.doctorName ?? "Doctor");
        }
      })
      .catch((error) => console.error(error));

    getConsultationMessages(PATIENT_ID)
      .then((data) => {
        setMessages(data);
      })
      .catch((error) => {
        console.error(
          "Failed to load consultation messages",
          error
        );
      });
  }, []);

  useEffect(() => {
    if (!PATIENT_ID) {
      console.error("Patient ID not found");
      return;
    }

    getPatientProfile(PATIENT_ID)
      .then((data) => {
        setPatient(data);
      })
      .catch((error) => {
        console.error("Failed to load patient profile", error);
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [messages]);

  function handleSend(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const clean =
      messageText.trim();

    if (!clean) return;

    if (!consultationAccepted) {
      alert("Please wait until a doctor accepts your case.");
      return;
    }

    sendConsultationMessage(
      PATIENT_ID,
      {
        sender: "patient",
        text: clean,
      }
    )
      .then((newMessage) => {
        setMessages((previous) => [
          ...previous,
          newMessage,
        ]);
      })
      .catch((error) => {
        console.error(
          "Failed to send consultation message",
          error
        );
      });

    setMessageText("");
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
              <MessageCircle
                size={20}
              />
            </div>

            <div>
              <h1 className="font-semibold">
                Doctor Consultation
              </h1>

              <p className="text-xs text-[#8FB9AE]">
                Shared patient-doctor
                text consultation
              </p>
            </div>
          </div>

          <div
            className={`ml-auto flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium ${
              online
                ? "bg-emerald-400/10 text-emerald-200"
                : "bg-amber-400/10 text-amber-200"
            }`}
          >
            {online ? (
              <Wifi size={14} />
            ) : (
              <WifiOff size={14} />
            )}

            {online
              ? "Connected"
              : "Offline · message saved locally"}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <section className="flex min-h-[650px] flex-col overflow-hidden rounded-2xl border border-[#D8E5E0] bg-white shadow-sm">
            <div className="flex items-center gap-4 border-b border-[#E3ECE9] px-6 py-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DCEEE9] text-[#1B7A6B]">
                <Stethoscope
                  size={22}
                />
              </div>

              <div>
                <h2 className="font-semibold text-[#223A34]">
                  {doctorName}
                </h2>

                <p className="mt-0.5 text-xs text-[#81928C]">
                  Remote Physician ·
                  Verified
                </p>
              </div>

              <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                ● Available
              </span>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto bg-[#F9FBFA] px-5 py-6 md:px-7">
              {messages.length === 0 ? (
                <div className="flex h-full min-h-[300px] items-center justify-center text-center text-sm text-[#81928C]">
                  No messages yet.
                </div>
              ) : (
                messages.map(
                  (message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                    />
                  )
                )
              )}

              <div
                ref={
                  messagesEndRef
                }
              />
            </div>

            <form
              onSubmit={handleSend}
              className="border-t border-[#E3ECE9] bg-white p-4 md:p-5"
            >
              {!online && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  <WifiOff
                    size={14}
                  />

                  The prototype will keep
                  this message locally.
                </div>
              )}

              <div className="flex gap-3">
                <textarea
                  value={
                    messageText
                  }
                  onChange={(
                    event
                  ) =>
                    setMessageText(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Write a message to your doctor..."
                  rows={2}
                  maxLength={600}
                  className="flex-1 resize-none rounded-xl border border-[#CCDCD6] bg-[#FCFDFD] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[#A4B0AC] focus:border-[#1B7A6B] focus:ring-4 focus:ring-[#69B9A5]/15"
                />

                <button
                  type="submit"
                  disabled={
                    !messageText.trim()
                  }
                  className="flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-xl bg-[#0F3D3E] text-white transition hover:bg-[#1B665E] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send
                    size={19}
                  />
                </button>
              </div>

              <div className="mt-2 text-right text-[11px] text-[#9AA7A2]">
                {
                  messageText.length
                }
                /600
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#D8E5E0] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1B7A6B]">
                Consultation
              </p>

              <div className="mt-5 space-y-4">
                <InfoItem
                  icon={
                    <UserRound
                      size={16}
                    />
                  }
                  label="Patient"
                  value={patient ? patient.name : "Loading..."}
                />

                {patient && (
                  <>
                    <InfoItem
                      icon={<UserRound size={16} />}
                      label="Age"
                      value={`${patient.age} years`}
                    />

                    <InfoItem
                      icon={<UserRound size={16} />}
                      label="Gender"
                      value={patient.gender}
                    />

                    <InfoItem
                      icon={<ShieldCheck size={16} />}
                      label="Blood Group"
                      value={patient.bloodGroup}
                    />
                  </>
                )}

                <InfoItem
                  icon={
                    <Stethoscope
                      size={16}
                    />
                  }
                  label="Doctor"
                  value="{doctorName}"
                />

                <InfoItem
                  icon={
                    <Clock3
                      size={16}
                    />
                  }
                  label="Status"
                  value={consultationAccepted ? "Accepted" : "Waiting for doctor"}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#CFE2DC] bg-[#EDF7F4] p-5">
              <div className="flex items-center gap-2 text-[#0F5A50]">
                <ShieldCheck
                  size={18}
                />

                <h3 className="font-semibold">
                  Shared chat demo
                </h3>
              </div>

              <p className="mt-3 text-sm leading-6 text-[#59736A]">
                Messages sent here now
                appear in the Remote
                Doctor Portal for the logged-in
                patient, including when both
                views are open in separate
                browser tabs.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function MessageBubble({
  message,
}: {
  message: SharedChatMessage;
}) {
  const isPatient =
    message.sender === "patient";

  return (
    <div
      className={`flex ${
        isPatient
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[82%] items-start gap-3 ${
          isPatient
            ? "flex-row-reverse"
            : ""
        }`}
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isPatient
              ? "bg-[#0F3D3E] text-white"
              : "bg-[#DCEEE9] text-[#1B7A6B]"
          }`}
        >
          {isPatient ? (
            <UserRound
              size={15}
            />
          ) : (
            <Stethoscope
              size={15}
            />
          )}
        </div>

        <div>
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
              isPatient
                ? "rounded-tr-sm bg-[#0F3D3E] text-white"
                : "rounded-tl-sm border border-[#DFE8E5] bg-white text-[#40554E]"
            }`}
          >
            {message.text}
          </div>

          <div
            className={`mt-1.5 flex items-center gap-1 text-[10px] text-[#9AA7A2] ${
              isPatient
                ? "justify-end"
                : ""
            }`}
          >
            {message.time}

            {isPatient && (
              <>
                <span>·</span>

                <span className="flex items-center gap-1">
                  <CheckCheck
                    size={12}
                  />
                  Sent
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDF7F4] text-[#1B7A6B]">
        {icon}
      </div>

      <div>
        <p className="text-[11px] text-[#81928C]">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-medium text-[#29443D]">
          {value}
        </p>
      </div>
    </div>
  );
}