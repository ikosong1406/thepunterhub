import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import Api from "../components/Api";

const REGIONAL_COUNTRIES = ["NG", "GH", "KE"];

const REGIONAL_PRICE = 9.99;
const STANDARD_PRICE = 19.99;

const benefits = [
  {
    title: "Daily Predictions",
    description:
      "Get fresh football predictions every day, ready for your analysis.",
  },
  {
    title: "Safe Tips",
    description:
      "Access carefully selected tips advertised with an 80% success rate.",
  },
  {
    title: "Multiple Betting Markets",
    description:
      "1X2, Double Chance, Over/Under Goals, and Both Teams to Score (BTTS).",
  },
  {
    title: "Major League Coverage",
    description:
      "Predictions covering major football leagues and competitions.",
  },
  {
    title: "Match Analysis",
    description:
      "Make more informed decisions with insights to help assess upcoming fixtures.",
  },
  {
    title: "Regular Updates",
    description:
      "Stay up to date with the latest available predictions.",
  },
  {
    title: "Mobile-Friendly Access",
    description:
      "Access your predictions from your phone, tablet, or computer.",
  },
  {
    title: "Cancel Anytime",
    description:
      "No long-term commitment. Cancel your subscription whenever you choose.",
  },
];

const SubscriptionModal = ({ user, onClose }) => {
  const [countryCode, setCountryCode] = useState("");
  const [countryLoading, setCountryLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const detectCountry = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");

        if (!response.ok) {
          throw new Error("Country detection failed");
        }

        const data = await response.json();

        if (active && data.country_code) {
          setCountryCode(data.country_code.toUpperCase());
        } else if (active) {
          throw new Error("Country code was not returned");
        }
      } catch (error) {
        // Fall back to the browser's timezone if IP detection fails.
        if (active) {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          setCountryCode(timezone === "Africa/Lagos" ? "NG" : "OTHER");
        }
      } finally {
        if (active) {
          setCountryLoading(false);
        }
      }
    };

    detectCountry();

    return () => {
      active = false;
    };
  }, []);

  const isRegional = REGIONAL_COUNTRIES.includes(countryCode);

  const monthlyPrice = isRegional
    ? REGIONAL_PRICE
    : STANDARD_PRICE;

  const formattedPrice = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(monthlyPrice);

  const handleSubscription = async () => {
    if (loading || countryLoading) return;

    if (!countryCode) {
      toast.error("We could not determine your country.");
      return;
    }

    if (!user?._id || !user?.email) {
      toast.error("Please sign in to subscribe to Premium.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${Api}/client/subscription/checkout`,
        {
          plan: "premium",
          countryCode,
        },
        {
          withCredentials: true,
        }
      );

      const checkoutUrl = response.data?.url;

      if (!checkoutUrl) {
        throw new Error(
          "Stripe Checkout URL was not returned by the server."
        );
      }

      const checkout = new URL(checkoutUrl);

      if (
        checkout.protocol !== "https:" ||
        checkout.hostname !== "checkout.stripe.com"
      ) {
        throw new Error("Invalid Stripe Checkout URL.");
      }

      window.location.assign(checkout.href);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "Unable to start your subscription. Please try again.";

      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "#09100d" }}
    >
      <Toaster position="top-center" />

      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div
          className="px-6 py-4 flex justify-between items-center border-b"
          style={{ borderColor: "#376553" }}
        >
          <div>
            <h2
              className="text-lg font-bold"
              style={{ color: "#efefef" }}
            >
              Premium Subscription
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close subscription modal"
            className="p-1 rounded-full"
            style={{ color: "#efefef" }}
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            {/* Premium Plan */}
            <div
              className="rounded-2xl border-2 p-6 mb-8"
              style={{
                backgroundColor: "#101c16",
                borderColor: "#855391",
              }}
            >
              <div className="flex justify-between items-center gap-3 mb-5">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: "#fea92a",
                    color: "#09100d",
                  }}
                >
                  PREMIUM PLAN
                </span>
              </div>

              {countryLoading ? (
                <div
                  className="h-10 w-44 rounded animate-pulse"
                  style={{ backgroundColor: "#26372e" }}
                />
              ) : countryCode ? (
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-4xl font-extrabold"
                    style={{ color: "#efefef" }}
                  >
                    {formattedPrice}
                  </span>

                  <span
                    className="text-sm"
                    style={{ color: "#9ca3af" }}
                  >
                    / month
                  </span>
                </div>
              ) : (
                <p
                  className="text-sm"
                  style={{ color: "#f57c7c" }}
                >
                  Your subscription price is unavailable.
                </p>
              )}

              <div
                className="border-t my-5"
                style={{ borderColor: "#376553" }}
              />

              <p
                className="text-sm leading-6"
                style={{ color: "#d1d5db" }}
              >
                Unlock daily football predictions, multiple betting
                markets, major league coverage, and detailed match
                analysis with one simple monthly subscription.
              </p>
            </div>

            {/* Subscribe Button */}
            <button
              type="button"
              onClick={handleSubscription}
              disabled={
                loading ||
                countryLoading ||
                !countryCode
              }
              className="w-full py-4 rounded-xl font-bold flex items-center justify-center transition-opacity"
              style={{
                backgroundColor: "#18ffc8",
                color: "#09100d",
                opacity:
                  loading || countryLoading || !countryCode
                    ? 0.65
                    : 1,
                cursor:
                  loading || countryLoading || !countryCode
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {loading
                ? "Redirecting to Stripe..."
                : countryLoading
                  ? "Determining your region..."
                  : countryCode
                    ? `Subscribe for ${formattedPrice}/month`
                    : "Unable to load subscription price"}
            </button>

            {/* Benefits */}
            <div className="mb-8 mt-8">
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: "#efefef" }}
              >
                Everything included in Premium
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="flex items-start gap-3"
                  >
                    <span
                      className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold"
                      style={{
                        backgroundColor: "rgba(24,255,200,0.12)",
                        color: "#fea92a",
                      }}
                    >
                      ✓
                    </span>

                    <div>
                      <h4
                        className="font-semibold text-sm mb-1"
                        style={{ color: "#efefef" }}
                      >
                        {benefit.title}
                      </h4>

                      <p
                        className="text-sm leading-6"
                        style={{ color: "#9ca3af" }}
                      >
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-5 border-t"
          style={{ borderColor: "#376553" }}
        >
          <div className="max-w-3xl mx-auto">
            {error && (
              <div
                className="mb-4 p-3 rounded-lg text-sm text-center"
                style={{
                  backgroundColor: "rgba(245,124,124,0.1)",
                  color: "#f57c7c",
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;