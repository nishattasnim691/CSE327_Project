import { useState, type FormEvent } from "react";
import {
  Stethoscope,
  Truck,
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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  // Patient fields
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] =
    useState("");

  // Doctor fields
  const [licenseNumber, setLicenseNumber] =
    useState("");

  const [specialty, setSpecialty] =
    useState("");


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

      setError(
        "Please complete all required fields."
      );

      return;
    }


    if (password !== confirmPassword) {

      setError(
        "Passwords do not match."
      );

      return;
    }


    if (password.length < 6) {

      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }



    if (role === "patient") {

      if (!dob || !gender || !bloodGroup) {

        setError(
          "Please provide DOB, gender and blood group."
        );

        return;
      }

    }



    if (role === "doctor") {

      if (!licenseNumber.trim()) {

        setError(
          "Doctor license number is required."
        );

        return;
      }

    }



    setSubmitting(true);



    try {


      const account = await signup({

        name: name.trim(),

        email: email.trim(),

        password,

        role,

        ...(role === "patient"
          ? {
              dob,
              gender,
              bloodGroup,
            }
          : {
              licenseNumber,
              specialty,
            }),

      });



      if (account.role === "doctor") {
        sessionStorage.setItem(
          "virtualClinicCurrentUser",
          JSON.stringify(account)
        );
        navigate("/doctor");
      } else {
        navigate("/login");
      }


    } catch (caughtError) {


      setError(

        caughtError instanceof Error
          ? caughtError.message
          : "Account creation failed."

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

              <Stethoscope size={24}/>

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


            <h1 className="mt-4 text-5xl font-semibold leading-tight">
              Create the right portal account.
            </h1>


            <p className="mt-5 leading-7 text-[#70857E]">

              Patients provide medical information while doctors provide
              professional verification details.

            </p>

          </div>


        </section>





        <section className="flex items-center justify-center bg-white px-5 py-10">

          <div className="w-full max-w-lg">


            <h2 className="text-3xl font-semibold">
              Create your Virtual Clinic account
            </h2>



            <div className="mt-7 grid gap-3 sm:grid-cols-3">


              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`rounded-xl border px-4 py-3 font-semibold ${
                  role==="patient"
                  ? "border-[#1B7A6B] bg-[#E8F4F0]"
                  : ""
                }`}
              >
                Patient
              </button>



              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`rounded-xl border px-4 py-3 font-semibold ${
                  role==="doctor"
                  ? "border-[#1B7A6B] bg-[#E8F4F0]"
                  : ""
                }`}
              >
                Doctor
              </button>

              <button
                type="button"
                onClick={() => setRole("dispatcher")}
                className={`rounded-xl border px-4 py-3 font-semibold ${
                  role === "dispatcher"
                  ? "border-[#1B7A6B] bg-[#E8F4F0]"
                  : ""
                }`}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Truck size={17} />
                  Dispatcher
                </span>
              </button>


            </div>




            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-4"
            >


              <input
                value={name}
                onChange={(e)=>setName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-xl border p-3"
              />



              <input
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-xl border p-3"
              />




              <input
               type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border p-3"
              />



              <input
                type="password"
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-xl border p-3"
              />



              {role==="patient" && (

                <>

                <label>
                  Date of Birth
                </label>

                <input
                  type="date"
                  value={dob}
                  onChange={(e)=>setDob(e.target.value)}
                  className="w-full rounded-xl border p-3"
                />


                <select
                  value={gender}
                  onChange={(e)=>setGender(e.target.value)}
                  className="w-full rounded-xl border p-3"
                >

                  <option value="">
                    Select Gender
                  </option>

                  <option>
                    Male
                  </option>

                  <option>
                    Female
                  </option>

                  <option>
                    Other
                  </option>

                </select>



                <select
                  value={bloodGroup}
                  onChange={(e)=>setBloodGroup(e.target.value)}
                  className="w-full rounded-xl border p-3"
                >

                  <option value="">
                    Select Blood Group
                  </option>

                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                  <option>O+</option>
                  <option>O-</option>

                </select>


                </>

              )}




              {role==="doctor" && (

                <>

                <input
                  value={licenseNumber}
                  onChange={(e)=>setLicenseNumber(e.target.value)}
                  placeholder="Medical License Number"
                  className="w-full rounded-xl border p-3"
                />


                <input
                  value={specialty}
                  onChange={(e)=>setSpecialty(e.target.value)}
                  placeholder="Specialty"
                  className="w-full rounded-xl border p-3"
                />

                </>

              )}




              {error && (

                <div className="rounded-xl bg-red-50 p-3 text-red-700">

                  {error}

                </div>

              )}




              <button
                disabled={submitting}
                className="w-full rounded-xl bg-[#0F3D3E] p-3 text-white"
              >

                {submitting
                ? "Creating account..."
                : "Create account"}

              </button>



            </form>



            <p className="mt-5 text-center">

              Already have an account?

              <Link
                to="/login"
                className="ml-1 text-[#1B7A6B]"
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