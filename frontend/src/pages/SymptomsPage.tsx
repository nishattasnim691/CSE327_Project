import {
  useState,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import {
  submitTriage,
  type TriageResponse,
} from "../services/api/TriageApi";


const COMMON_SYMPTOMS = [
  "Fever",
  "Cough",
  "Headache",
  "Tiredness",
  "Sore throat",
  "Nausea",
];

export default function SymptomsPage() {
  const [
    selectedSymptoms,
    setSelectedSymptoms,
  ] = useState<string[]>([]);

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    duration,
    setDuration,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    result,
    setResult,
  ] = useState<TriageResponse | null>(
    null
  );

  const [
    error,
    setError,
  ] = useState("");

  function toggleSymptom(
    symptom: string
  ) {
    setResult(null);
    setError("");

    setSelectedSymptoms(
      (current) =>
        current.includes(
          symptom
        )
          ? current.filter(
              (item) =>
                item !==
                symptom
            )
          : [
              ...current,
              symptom,
            ]
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setResult(null);

    if (
      selectedSymptoms.length ===
        0 &&
      !description.trim()
    ) {
      setError(
        "Select at least one symptom or enter a short description."
      );
      return;
    }

    if (!duration.trim()) {
      setError(
        "Please enter a duration."
      );
      return;
    }

    setSubmitting(true);

    try {
      /*
        MEMBER 3:
        Send the form data to Member 2's API.

        MEMBER 2:
        Their TriageEngine evaluates the request and returns the category.
      */
      const patientId = localStorage.getItem("patientId");

      if (!patientId) {
        throw new Error("Please log in as a patient before submitting symptoms.");
      }

      const triageResult =
        await submitTriage({
          patientId,
          symptoms:
            selectedSymptoms,
          description:
            description.trim(),
          duration:
            duration.trim(),
        });

      setResult(
        triageResult
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof
        Error
          ? caughtError.message
          : "The triage request could not be completed.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F8F7] text-[#12231F]">
      <header className="border-b border-white/10 bg-[#0F3D3E] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-4">
          <Link
            to="/kiosk"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#D7EBE6] transition hover:bg-white/10"
          >
            <ArrowLeft size={18} />
            Back to Kiosk
          </Link>

          <div className="hidden h-6 w-px bg-white/20 sm:block" />

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B7A6B]">
              <Activity size={20} />
            </div>

            <div>
              <h1 className="font-semibold">
                Symptom Submission
              </h1>

              <p className="text-xs text-[#8FB9AE]">
                Patient UI → Triage API
              </p>
            </div>
          </div>

          <div className="ml-auto inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-200">
            <ShieldCheck size={14} />
            Member 2 engine via API
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#DCEEE9] px-3 py-1.5 text-xs font-semibold text-[#1B7A6B]">
            <Stethoscope size={14} />
            Step 1 · Symptoms
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Submit symptoms for automatic triage
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-[#667A73]">
            This page only collects patient input and sends it to the backend.
            The actual triage decision belongs to Member 2's TriageEngine.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[#D8E5E0] bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <UserRound
                size={19}
                className="text-[#1B7A6B]"
              />

              <div>
                <h3 className="font-semibold text-[#29443D]">
                  Synthetic Patient 001
                </h3>

                <p className="text-xs text-[#81928C]">
                  Patient ID: P001
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-[#29443D]">
                Symptoms
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {COMMON_SYMPTOMS.map(
                  (symptom) => {
                    const active =
                      selectedSymptoms.includes(
                        symptom
                      );

                    return (
                      <button
                        key={
                          symptom
                        }
                        type="button"
                        onClick={() =>
                          toggleSymptom(
                            symptom
                          )
                        }
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          active
                            ? "border-[#1B7A6B] bg-[#DCEEE9] text-[#0F5A50]"
                            : "border-[#D8E5E0] text-[#667A73] hover:border-[#1B7A6B]"
                        }`}
                      >
                        {
                          symptom
                        }
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <label className="mt-6 block">
              <span className="text-sm font-semibold text-[#29443D]">
                Additional description
              </span>

              <textarea
                value={
                  description
                }
                onChange={(
                  event
                ) => {
                  setDescription(
                    event.target.value
                  );
                  setResult(
                    null
                  );
                }}
                rows={4}
                maxLength={500}
                placeholder="Enter a short synthetic symptom description..."
                className="mt-2 w-full resize-none rounded-xl border border-[#CCDCD6] bg-[#FCFDFD] px-4 py-3 text-sm leading-6 outline-none focus:border-[#1B7A6B] focus:ring-4 focus:ring-[#69B9A5]/15"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-[#29443D]">
                Duration
              </span>

              <input
                value={
                  duration
                }
                onChange={(
                  event
                ) => {
                  setDuration(
                    event.target.value
                  );
                  setResult(
                    null
                  );
                }}
                placeholder="e.g. Demo duration"
                className="mt-2 w-full rounded-xl border border-[#CCDCD6] bg-[#FCFDFD] px-4 py-3 text-sm outline-none focus:border-[#1B7A6B] focus:ring-4 focus:ring-[#69B9A5]/15"
              />
            </label>

            <div className="mt-5 rounded-xl border border-[#CFE2DC] bg-[#EDF7F4] p-4 text-xs leading-5 text-[#59736A]">
              No triage rules exist in this page. It calls{" "}
              <strong>submitTriage()</strong> and waits for Member 2's backend
              to return the category.
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">
                  Triage service unavailable
                </p>

                <p className="mt-1 text-xs leading-5">
                  {error}
                </p>
              </div>
            )}

            {result && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-semibold">
                    Triage result received
                  </p>

                  <p className="mt-1">
                    Category:{" "}
                    <strong>
                      {
                        result.category
                      }
                    </strong>
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={
                submitting
              }
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D3E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B665E] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Waiting for Triage API…
                </>
              ) : (
                <>
                  <Send
                    size={18}
                  />
                  Submit Symptoms
                </>
              )}
            </button>
          </form>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#CFE2DC] bg-[#EDF7F4] p-5">
              <h3 className="font-semibold text-[#0F5A50]">
                Responsibility boundary
              </h3>

              <div className="mt-4 space-y-2 text-sm leading-6 text-[#59736A]">
                <p>
                  <strong>Member 3:</strong> Form UI + API call + display result
                </p>

                <p>
                  <strong>Member 2:</strong> TriageEngine + Chain of
                  Responsibility
                </p>

                <p>
                  <strong>Member 1:</strong> Database + offline queue
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#D8E5E0] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Clock3
                  size={18}
                  className="text-[#1B7A6B]"
                />

                <h3 className="font-semibold text-[#29443D]">
                  Backend configuration
                </h3>
              </div>

              <p className="mt-3 text-sm leading-6 text-[#667A73]">
                Once Member 2's backend is running, configure the frontend API
                base URL in your environment file.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}