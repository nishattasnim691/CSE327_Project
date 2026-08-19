import { useState, type FormEvent } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  signup,
  type UserRole,
} from "../services/api/AuthApi";

export default function SignupPage() {
  const navigate = useNavigate();

  const [role, setRole] =
    useState<UserRole>("patient");
  const [name, setName] =
    useState("");
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
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

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Use at least 6 characters for the prototype password."
      );
      return;
    }

    setSubmitting(true);

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      navigate("/login");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Account creation could not be completed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F8F6] text-[#16332C]">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[0.85fr_1.15fr]">
        <section className="hidden px-12 py-14 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F3D3E] text-white">
              <Stethoscope size={24} />
            </div>

            <div>
              <p className="font-semibold">
                Virtual Clinic
              </p>
              <p className="text-xs text-[#70857E]">
                Account registration
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#1B7A6B]">
              Connected healthcare prototype
            </p>

            <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-tight">
              Create the right portal account.
            </h1>

            <p className="mt-5 max-w-lg leading-7 text-[#70857E]">
              Patient accounts access kiosk services. Doctor accounts access
              the remote portal for the side-by-side demonstration.
            </p>
          </div>

          <p className="text-xs text-[#81928C]">
            Synthetic course prototype — not for clinical use.
          </p>
        </section>

        <section className="flex items-center justify-center bg-white px-5 py-10 sm:px-8 lg:rounded-l-[2.5rem] lg:shadow-xl lg:shadow-[#16332C]/5">
          <div className="w-full max-w-lg">
            <p className="text-sm font-semibold text-[#1B7A6B]">
              New account
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Create your Virtual Clinic account
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#70857E]">
              Registration data will later be stored by Member 1's
              authentication/database backend.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  role === "patient"
                    ? "border-[#1B7A6B] bg-[#E8F4F0] text-[#0F5A50]"
                    : "border-[#D6E3DF] text-[#70857E]"
                }`}
              >
                Patient account
              </button>

              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  role === "doctor"
                    ? "border-[#1B7A6B] bg-[#E8F4F0] text-[#0F5A50]"
                    : "border-[#D6E3DF] text-[#70857E]"
                }`}
              >
                Doctor account
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              <label className="block">
                <span className="text-sm font-semibold">
                  Full name
                </span>

                <div className="relative mt-2">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81928C]"
                  />
                  <input
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-[#CCDCD6] bg-[#FBFDFC] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#1B7A6B] focus:ring-4 focus:ring-[#69B9A5]/15"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">
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
                    className="w-full rounded-xl border border-[#CCDCD6] bg-[#FBFDFC] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#1B7A6B] focus:ring-4 focus:ring-[#69B9A5]/15"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">
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
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-[#CCDCD6] bg-[#FBFDFC] py-3.5 pl-11 pr-12 text-sm outline-none focus:border-[#1B7A6B] focus:ring-4 focus:ring-[#69B9A5]/15"
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

              <label className="block">
                <span className="text-sm font-semibold">
                  Confirm password
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Enter the password again"
                  className="mt-2 w-full rounded-xl border border-[#CCDCD6] bg-[#FBFDFC] px-4 py-3.5 text-sm outline-none focus:border-[#1B7A6B] focus:ring-4 focus:ring-[#69B9A5]/15"
                />
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
                  ? "Creating account..."
                  : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#70857E]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#1B7A6B] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
