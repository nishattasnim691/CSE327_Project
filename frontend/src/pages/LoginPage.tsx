import { useState, type FormEvent } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  login,
  type UserRole,
} from "../services/api/AuthApi";

export default function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] =
    useState<UserRole>("patient");
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    setSubmitting(true);

    try {
      const user = await login({
        email: email.trim(),
        password,
        role,
      });

      if (user.token) {
        sessionStorage.setItem(
          "virtualClinicAuthToken",
          user.token
        );
      }

      sessionStorage.setItem(
        "virtualClinicCurrentUser",
        JSON.stringify(user)
      );

      navigate(
        user.role === "doctor"
          ? "/doctor"
          : "/kiosk"
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Login could not be completed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F8F6] text-[#16332C]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#0F3D3E] px-12 py-14 text-white lg:flex lg:flex-col">
          <div className="absolute -right-28 -top-24 h-80 w-80 rounded-full bg-[#2F9B82]/20" />
          <div className="absolute -bottom-36 -left-24 h-96 w-96 rounded-full bg-[#69B9A5]/10" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1B7A6B]">
              <Stethoscope size={25} />
            </div>

            <div>
              <p className="text-lg font-semibold">
                Virtual Clinic
              </p>
              <p className="text-xs text-[#A9CEC5]">
                Telemedicine & Pharmacy Kiosk
              </p>
            </div>
          </div>

          <div className="relative z-10 my-auto max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-[#D9F0EA]">
              <ShieldCheck size={15} />
              Course Prototype
            </span>

            <h1 className="mt-7 text-5xl font-semibold leading-tight tracking-tight">
              One secure entrance to the Virtual Clinic.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-[#B9D6CF]">
              Patients enter the kiosk experience while doctors access the remote
              clinical portal from the same authentication interface.
            </p>
          </div>

          <p className="relative z-10 text-xs text-[#8FB9AE]">
            Synthetic demonstration system — not for clinical use.
          </p>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F3D3E] text-white">
                <Stethoscope size={22} />
              </div>

              <div>
                <p className="font-semibold">
                  Virtual Clinic
                </p>
                <p className="text-xs text-[#70857E]">
                  Secure portal access
                </p>
              </div>
            </div>

            <p className="text-sm font-semibold text-[#1B7A6B]">
              Welcome back
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Sign in to your portal
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#70857E]">
              Select your portal type and enter your account credentials.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3 rounded-2xl bg-[#E9F2EF] p-1.5">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  role === "patient"
                    ? "bg-white text-[#0F5A50] shadow-sm"
                    : "text-[#70857E]"
                }`}
              >
                <UserRound size={17} />
                Patient
              </button>

              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  role === "doctor"
                    ? "bg-white text-[#0F5A50] shadow-sm"
                    : "text-[#70857E]"
                }`}
              >
                <Stethoscope size={17} />
                Doctor
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              <label className="block">
                <span className="text-sm font-semibold text-[#29443D]">
                  Email address
                </span>

                <div className="relative mt-2">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81928C]"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-[#CCDCD6] bg-white py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#1B7A6B] focus:ring-4 focus:ring-[#69B9A5]/15"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#29443D]">
                  Password
                </span>

                <div className="relative mt-2">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81928C]"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#CCDCD6] bg-white py-3.5 pl-11 pr-12 text-sm outline-none focus:border-[#1B7A6B] focus:ring-4 focus:ring-[#69B9A5]/15"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#70857E]"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="min-h-12 w-full rounded-xl bg-[#0F3D3E] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#185B56] disabled:opacity-60"
              >
                {submitting
                  ? "Signing in..."
                  : `Sign in as ${
                      role === "doctor"
                        ? "Doctor"
                        : "Patient"
                    }`}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#70857E]">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-[#1B7A6B] hover:underline"
              >
                Create account
              </Link>
            </p>

            <div className="mt-7 rounded-xl border border-[#D7E6E1] bg-[#EDF6F3] p-4 text-xs leading-5 text-[#60766F]">
              Member 3 owns this interface and API integration. Member 1 will
              provide account verification, password handling, and database
              persistence.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
