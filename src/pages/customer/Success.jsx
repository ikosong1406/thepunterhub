import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaSpinner,
  FaArrowRight,
  FaShieldAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import axios from "axios";
import Api from "../../components/Api";

export default function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  const requestStarted = useRef(false);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(
    "We're verifying your payment with Stripe.",
  );
  const [expiresAt, setExpiresAt] = useState(null);

  useEffect(() => {
    if (requestStarted.current) return;

    if (!sessionId) {
      setStatus("error");
      setMessage(
        "We couldn't find your payment session. Please check your payment status or contact support.",
      );
      return;
    }

    requestStarted.current = true;

    const activatePremium = async () => {
      try {
        const response = await axios.post(`${Api}/client/activate`, {
          sessionId,
        });

        const data = response.data;

        if (data?.success) {
          setStatus("success");
          setMessage(data.message || "Your Premium access is now active.");
          setExpiresAt(data.expiresAt || null);
        } else {
          setStatus("error");
          setMessage(data?.error || "We couldn't confirm your payment yet.");
        }
      } catch (error) {
        console.error("Payment activation failed:", error);

        setStatus("error");
        setMessage(
          error.response?.data?.error ||
            "We couldn't verify your payment right now. Your payment may still have succeeded. Please try again.",
        );
      }
    };

    activatePremium();
  }, [sessionId]);

  const retryActivation = async () => {
    if (!sessionId) return;

    setStatus("loading");
    setMessage("Checking your payment again.");

    try {
      const response = await Api.post("/client/activate", {
        sessionId,
      });

      if (response.data?.success) {
        setStatus("success");
        setMessage(
          response.data.message || "Your Premium access is now active.",
        );
        setExpiresAt(response.data.expiresAt || null);
      } else {
        setStatus("error");
        setMessage(
          response.data?.error || "We couldn't confirm your payment yet.",
        );
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error.response?.data?.error ||
          "We couldn't verify your payment. Please try again shortly.",
      );
    }
  };

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a120e] px-4 py-10 text-white">
      <section className="w-full max-w-lg rounded-3xl border border-[#2a3a34] bg-[#0f1f1a] p-6 shadow-2xl shadow-black/20 sm:p-9">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#18ffc8]" />
            <span className="text-sm font-extrabold tracking-wide">
              TODAYPREDICTION365
            </span>
          </div>
        </div>

        <div className="mb-6 flex justify-center">
          {status === "loading" && (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#18ffc8]/20 bg-[#18ffc8]/10">
              <FaSpinner className="animate-spin text-3xl text-[#18ffc8]" />
            </div>
          )}

          {status === "success" && (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#18ffc8]/20 bg-[#18ffc8]/10">
              <FaCheckCircle className="text-4xl text-[#18ffc8]" />
            </div>
          )}

          {status === "error" && (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10">
              <FaExclamationCircle className="text-3xl text-amber-300" />
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#18ffc8]">
            {status === "loading"
              ? "Verifying payment"
              : status === "success"
                ? "Payment confirmed"
                : "Payment status"}
          </p>

          <h1 className="text-2xl font-extrabold sm:text-3xl">
            {status === "loading"
              ? "Almost there..."
              : status === "success"
                ? "You're Premium!"
                : "We couldn't finish verification"}
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-400">
            {message}
          </p>
        </div>

        {status === "success" && (
          <div className="mt-7 rounded-2xl border border-[#18ffc8]/20 bg-[#18ffc8]/5 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">Premium access</p>
                <p className="mt-1 text-xs text-gray-400">
                  Full access to Premium predictions
                </p>
              </div>

              <span className="rounded-full bg-[#18ffc8]/10 px-3 py-1 text-xs font-bold text-[#18ffc8]">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              <FaShieldAlt className="shrink-0 text-[#18ffc8]" />
              <span>One-time payment · 30 days of access</span>
            </div>

            {formattedExpiry && (
              <p className="mt-3 text-xs text-gray-400">
                Access expires on{" "}
                <span className="font-semibold text-white">
                  {formattedExpiry}
                </span>
              </p>
            )}
          </div>
        )}

        <div className="mt-7 space-y-3">
          {status === "success" && (
            <button
              type="button"
              onClick={() => navigate("/home", { replace: true })}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#18ffc8] px-5 py-3.5 text-sm font-extrabold text-[#07130f] transition hover:bg-[#7dffdf]"
            >
              Explore predictions <FaArrowRight />
            </button>
          )}

          {status === "error" && (
            <>
              <button
                type="button"
                onClick={retryActivation}
                className="w-full rounded-xl bg-[#18ffc8] px-5 py-3.5 text-sm font-extrabold text-[#07130f] transition hover:bg-[#7dffdf]"
              >
                Check payment again
              </button>

              <button
                type="button"
                onClick={() => navigate("/profile", { replace: true })}
                className="w-full rounded-xl border border-[#2a3a34] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#162821]"
              >
                Return to profile
              </button>
            </>
          )}

          {status === "loading" && (
            <p className="text-center text-xs text-gray-500">
              Please don't close this page while we verify your payment.
            </p>
          )}
        </div>

        <p className="mt-7 text-center text-xs text-gray-500">
          Payments are securely processed by Stripe.
        </p>
      </section>
    </main>
  );
}
