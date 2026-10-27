
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTimesCircle,
  FaArrowLeft,
  FaRegClock,
} from "react-icons/fa";

export default function Cancel() {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(3);

  useEffect(() => {
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, 3 - elapsed);

      setSecondsLeft(remaining);

      if (remaining === 0) {
        window.clearInterval(intervalId);
        navigate("/profile", { replace: true });
      }
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a120e] px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-3xl border border-[#2a3a34] bg-[#0f1f1a] p-7 text-center shadow-2xl shadow-black/20 sm:p-9">
        <div className="mb-7 flex items-center justify-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#18ffc8]" />
          <span className="text-sm font-extrabold tracking-wide">
            TODAYPREDICTION365
          </span>
        </div>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#f57cff]/20 bg-[#f57cff]/10">
          <FaTimesCircle className="text-4xl text-[#f57cff]" />
        </div>

        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f57cff]">
          Checkout cancelled
        </p>

        <h1 className="text-2xl font-extrabold sm:text-3xl">
          No payment was made
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-400">
          You've cancelled checkout. You haven't been charged through this
          checkout attempt. You can return to your profile whenever you're
          ready to try again.
        </p>

        <div className="mt-7 flex items-center justify-center gap-2 rounded-xl border border-[#2a3a34] bg-[#162821] px-4 py-3 text-sm text-gray-300">
          <FaRegClock className="text-[#18ffc8]" />
          <span>
            Returning to your profile in{" "}
            <strong className="text-white">{secondsLeft}</strong>{" "}
            {secondsLeft === 1 ? "second" : "seconds"}...
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate("/profile", { replace: true })}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#2a3a34] px-5 py-3.5 text-sm font-bold text-white transition hover:border-[#18ffc8]/40 hover:bg-[#162821]"
        >
          <FaArrowLeft /> Return to profile now
        </button>
      </section>
    </main>
  );
}
