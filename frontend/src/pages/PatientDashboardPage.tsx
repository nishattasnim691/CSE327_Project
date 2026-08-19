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
  Droplets,
  Gauge,
  HeartPulse,
  Plus,
  RefreshCw,
  Stethoscope,
  Thermometer,
  Workflow,
} from "lucide-react";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

import {
  createPatientVital,
  fetchPatientVitals,
  replacePatientVitals,
  type VitalRecordDto,
} from "../services/api/VitalsApi";
import {
  connectToVitalUpdates,
} from "../services/api/VitalsRealtime";

type VitalRecord = VitalRecordDto;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type MetricKey =
  | "heartRate"
  | "temperature"
  | "systolic"
  | "diastolic"
  | "oxygen";

const PATIENT_ID = "P001";

const INITIAL_VITALS: VitalRecord[] = [
  {
    id: 1,
    recordedAt: "08:00",
    heartRate: 78,
    temperature: 36.7,
    systolic: 118,
    diastolic: 76,
    oxygen: 98,
  },
  {
    id: 2,
    recordedAt: "10:00",
    heartRate: 80,
    temperature: 36.8,
    systolic: 120,
    diastolic: 78,
    oxygen: 98,
  },
  {
    id: 3,
    recordedAt: "12:00",
    heartRate: 76,
    temperature: 36.6,
    systolic: 117,
    diastolic: 75,
    oxygen: 99,
  },
  {
    id: 4,
    recordedAt: "14:00",
    heartRate: 82,
    temperature: 36.9,
    systolic: 121,
    diastolic: 79,
    oxygen: 98,
  },
];

const METRIC_META: Record<
  MetricKey,
  {
    label: string;
    unit: string;
  }
> = {
  heartRate: {
    label: "Heart Rate",
    unit: "bpm",
  },
  temperature: {
    label: "Temperature",
    unit: "°C",
  },
  systolic: {
    label: "Systolic BP",
    unit: "mmHg",
  },
  diastolic: {
    label: "Diastolic BP",
    unit: "mmHg",
  },
  oxygen: {
    label: "Oxygen Saturation",
    unit: "%",
  },
};

export default function PatientDashboardPage() {
  const [vitals, setVitals] =
    useState<VitalRecord[]>(
      INITIAL_VITALS
    );

  const [observerConnected, setObserverConnected] =
    useState(false);

  useEffect(() => {
    let active = true;

    fetchPatientVitals(
      PATIENT_ID
    )
      .then((records) => {
        if (
          active &&
          records.length > 0
        ) {
          setVitals(records);
        }
      })
      .catch(() => {
        // Keep synthetic starter data visible until the backend is running.
      });

    const disconnect =
      connectToVitalUpdates(
        PATIENT_ID,
        (updatedVitals) => {
          if (active) {
            setVitals(
              updatedVitals
            );
          }
        },
        (connected) => {
          if (active) {
            setObserverConnected(
              connected
            );
          }
        }
      );

    return () => {
      active = false;
      disconnect();
    };
  }, []);

  const [selectedMetric, setSelectedMetric] =
    useState<MetricKey>("heartRate");

  const [heartRate, setHeartRate] = useState("79");
  const [temperature, setTemperature] = useState("36.8");
  const [systolic, setSystolic] = useState("119");
  const [diastolic, setDiastolic] = useState("77");
  const [oxygen, setOxygen] = useState("98");

  const [message, setMessage] = useState("");


  const latestVital = vitals[vitals.length - 1];

  const chartData = useMemo<ChartData<"line">>(() => {
    const meta = METRIC_META[selectedMetric];

    return {
      labels: vitals.map((item) => item.recordedAt),
      datasets: [
        {
          label: `${meta.label} (${meta.unit})`,
          data: vitals.map((item) => item[selectedMetric]),
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
        },
      ],
    };
  }, [selectedMetric, vitals]);

  const chartOptions = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        title: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
      },
    }),
    []
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const parsedHeartRate = Number(heartRate);
    const parsedTemperature = Number(temperature);
    const parsedSystolic = Number(systolic);
    const parsedDiastolic = Number(diastolic);
    const parsedOxygen = Number(oxygen);

    if (
      !Number.isFinite(parsedHeartRate) ||
      !Number.isFinite(parsedTemperature) ||
      !Number.isFinite(parsedSystolic) ||
      !Number.isFinite(parsedDiastolic) ||
      !Number.isFinite(parsedOxygen)
    ) {
      setMessage(
        "Please enter valid numbers for all vital fields."
      );
      return;
    }

    if (
      parsedHeartRate <= 0 ||
      parsedTemperature <= 0 ||
      parsedSystolic <= 0 ||
      parsedDiastolic <= 0 ||
      parsedOxygen <= 0 ||
      parsedOxygen > 100
    ) {
      setMessage(
        "Please enter valid positive values."
      );
      return;
    }

    const now = new Date();

    const newRecord: VitalRecord = {
      id: Date.now(),
      recordedAt: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      heartRate: parsedHeartRate,
      temperature: parsedTemperature,
      systolic: parsedSystolic,
      diastolic: parsedDiastolic,
      oxygen: parsedOxygen,
    };

    try {
      /*
        OFFICIAL PYTHON OBSERVER FLOW:
        React POST
          -> Python HealthRecord.add_vital()
          -> HealthRecord.notify()
          -> PatientDashboardObserver.update()
          -> WebSocket event
          -> this page and Doctor Portal update automatically.
      */
      await createPatientVital(
        PATIENT_ID,
        newRecord
      );

      if (!observerConnected) {
        const refreshed =
          await fetchPatientVitals(
            PATIENT_ID
          );

        setVitals(
          refreshed
        );
      }

      setMessage(
        "Vital sent → Python HealthRecord notified PatientDashboardObserver → real-time dashboard event published."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not send the vital record to the Python backend."
      );
    }
  }

  async function resetDemoData() {
    try {
      const restored =
        await replacePatientVitals(
          PATIENT_ID,
          INITIAL_VITALS
        );

      if (!observerConnected) {
        setVitals(
          restored
        );
      }

      setMessage(
        "Demo data restored through the Python Observer pipeline."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not reset the synthetic vital records."
      );
    }
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
              <Activity size={20} />
            </div>

            <div>
              <h1 className="font-semibold">
                My Health Dashboard
              </h1>
              <p className="text-xs text-[#8FB9AE]">
                Self-monitoring vitals · Patient Kiosk
              </p>
            </div>
          </div>

          <div
            className={`ml-auto inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium ${
              observerConnected
                ? "bg-emerald-400/10 text-emerald-200"
                : "bg-amber-400/10 text-amber-200"
            }`}
          >
            <Workflow size={14} />
            {observerConnected
              ? "Observer connected"
              : "Observer disconnected"}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#DCEEE9] px-3 py-1.5 text-xs font-semibold text-[#1B7A6B]">
            <HeartPulse size={14} />
            Patient Self-Monitoring
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#12231F] md:text-4xl">
            Track your latest vital readings
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-[#667A73]">
            Adding a synthetic vital record sends it to the Python backend.
            Python HealthRecord notifies PatientDashboardObserver, which
            publishes the real-time update to this chart and the Doctor Portal.
          </p>
        </div>

        <section className="mb-6 rounded-2xl border border-[#CFE2DC] bg-[#EDF7F4] p-5">
          <div className="flex items-start gap-3">
            <Workflow
              size={20}
              className="mt-0.5 shrink-0 text-[#1B7A6B]"
            />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1B7A6B]">
                Observer Pattern
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#29443D]">
                <span className="rounded-lg bg-white px-3 py-2 shadow-sm">
                  Log New Vitals
                </span>
                <span>→</span>
                <span className="rounded-lg bg-white px-3 py-2 shadow-sm">
                  Python HealthRecord
                </span>
                <span>→ notify()</span>
                <span className="rounded-lg bg-white px-3 py-2 shadow-sm">
                  Python PatientDashboardObserver
                </span>
                <span>→</span>
                <span className="rounded-lg bg-white px-3 py-2 shadow-sm">
                  Patient UI updates
                </span>
                <span>+</span>
                <span className="rounded-lg bg-white px-3 py-2 shadow-sm">
                  Doctor view updates
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <VitalCard
            icon={<HeartPulse size={20} />}
            label="Heart Rate"
            value={`${latestVital.heartRate}`}
            unit="bpm"
          />

          <VitalCard
            icon={<Thermometer size={20} />}
            label="Temperature"
            value={`${latestVital.temperature}`}
            unit="°C"
          />

          <VitalCard
            icon={<Gauge size={20} />}
            label="Blood Pressure"
            value={`${latestVital.systolic}/${latestVital.diastolic}`}
            unit="mmHg"
          />

          <VitalCard
            icon={<Droplets size={20} />}
            label="Oxygen Saturation"
            value={`${latestVital.oxygen}`}
            unit="%"
          />
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="rounded-2xl border border-[#D8E5E0] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1B7A6B]">
                  Vital trends
                </p>

                <h3 className="mt-1 text-xl font-semibold text-[#223A34]">
                  Reading history
                </h3>

                <p className="mt-1 text-sm text-[#81928C]">
                  Select a metric to view its synthetic trend.
                </p>
              </div>

              <select
                value={selectedMetric}
                onChange={(event) =>
                  setSelectedMetric(
                    event.target.value as MetricKey
                  )
                }
                className="rounded-xl border border-[#CCDCD6] bg-[#FCFDFD] px-4 py-2.5 text-sm font-medium text-[#29443D] outline-none focus:border-[#1B7A6B] focus:ring-4 focus:ring-[#69B9A5]/15"
              >
                {Object.entries(METRIC_META).map(
                  ([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="mt-6 h-[360px]">
              <Line
                data={chartData}
                options={chartOptions}
              />
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
              All readings are synthetic demo values for the CSE327 project.
              This dashboard does not provide medical interpretation or
              diagnosis.
            </div>
          </section>

          <aside className="space-y-4">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-[#D8E5E0] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Plus
                  size={18}
                  className="text-[#1B7A6B]"
                />

                <div>
                  <h3 className="font-semibold text-[#29443D]">
                    Log New Vitals
                  </h3>

                  <p className="mt-0.5 text-xs text-[#81928C]">
                    Synthetic demo entry
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <NumberField
                  label="Heart Rate"
                  unit="bpm"
                  value={heartRate}
                  onChange={setHeartRate}
                  step="1"
                />

                <NumberField
                  label="Temperature"
                  unit="°C"
                  value={temperature}
                  onChange={setTemperature}
                  step="0.1"
                />

                <div className="grid grid-cols-2 gap-3">
                  <NumberField
                    label="Systolic"
                    unit="mmHg"
                    value={systolic}
                    onChange={setSystolic}
                    step="1"
                  />

                  <NumberField
                    label="Diastolic"
                    unit="mmHg"
                    value={diastolic}
                    onChange={setDiastolic}
                    step="1"
                  />
                </div>

                <NumberField
                  label="Oxygen Saturation"
                  unit="%"
                  value={oxygen}
                  onChange={setOxygen}
                  step="1"
                  max="100"
                />
              </div>

              <button
                type="submit"
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F3D3E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B665E]"
              >
                <Plus size={18} />
                Add Vital Record
              </button>

              {message && (
                <div
                  aria-live="polite"
                  className="mt-4 flex items-start gap-2 rounded-xl bg-[#EDF7F4] p-3 text-xs leading-5 text-[#0F5A50]"
                >
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0"
                  />
                  {message}
                </div>
              )}
            </form>

            <div className="rounded-2xl border border-[#CFE2DC] bg-[#EDF7F4] p-5">
              <div className="flex items-center gap-2 text-[#0F5A50]">
                <Stethoscope size={18} />
                <h3 className="font-semibold">
                  Pattern status
                </h3>
              </div>

              <div className="mt-4 space-y-2 text-sm text-[#59736A]">
                <p>
                  <strong>Subject:</strong> Python HealthRecord
                </p>
                <p>
                  <strong>Observer:</strong> Python PatientDashboardObserver
                </p>
                <p>
                  <strong>Real-time connection:</strong>{" "}
                  {observerConnected ? "Connected" : "Disconnected"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetDemoData}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8E5E0] bg-white px-4 py-3 text-sm font-semibold text-[#536861] transition hover:border-[#1B7A6B] hover:text-[#0F5A50]"
            >
              <RefreshCw size={16} />
              Reset Demo Data
            </button>
          </aside>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#D8E5E0] bg-white shadow-sm">
          <div className="border-b border-[#E3ECE9] bg-[#F9FBFA] px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1B7A6B]">
              Recent records
            </p>

            <h3 className="mt-1 font-semibold text-[#223A34]">
              Vital history
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#FCFDFD] text-xs uppercase tracking-wide text-[#81928C]">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Time
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Heart Rate
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Temperature
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Blood Pressure
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Oxygen
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E7EEEB]">
                {[...vitals]
                  .reverse()
                  .slice(0, 6)
                  .map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 font-medium text-[#29443D]">
                        {record.recordedAt}
                      </td>

                      <td className="px-6 py-4 text-[#667A73]">
                        {record.heartRate} bpm
                      </td>

                      <td className="px-6 py-4 text-[#667A73]">
                        {record.temperature} °C
                      </td>

                      <td className="px-6 py-4 text-[#667A73]">
                        {record.systolic}/{record.diastolic} mmHg
                      </td>

                      <td className="px-6 py-4 text-[#667A73]">
                        {record.oxygen}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function VitalCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border border-[#D8E5E0] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCEEE9] text-[#1B7A6B]">
          {icon}
        </div>

        <span className="rounded-full bg-[#EDF7F4] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#1B7A6B]">
          Latest
        </span>
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[#81928C]">
        {label}
      </p>

      <div className="mt-1 flex items-end gap-2">
        <span className="text-2xl font-bold text-[#0F3D3E]">
          {value}
        </span>

        <span className="pb-1 text-xs font-medium text-[#81928C]">
          {unit}
        </span>
      </div>
    </div>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  step,
  max,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  step: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#536861]">
        {label}
      </span>

      <div className="mt-1.5 flex overflow-hidden rounded-xl border border-[#CCDCD6] bg-[#FCFDFD] focus-within:border-[#1B7A6B] focus-within:ring-4 focus-within:ring-[#69B9A5]/15">
        <input
          type="number"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          step={step}
          min="0"
          max={max}
          required
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[#29443D] outline-none"
        />

        <span className="flex items-center border-l border-[#E1E8E5] bg-[#F2F7F5] px-3 text-xs font-medium text-[#81928C]">
          {unit}
        </span>
      </div>
    </label>
  );
}
