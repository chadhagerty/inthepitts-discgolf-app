import Stripe from "stripe";


export const runtime = "nodejs";


const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) throw new Error("Missing STRIPE_SECRET_KEY");


const stripe = new Stripe(secretKey);


function getBaseUrl(req) {
  // BEST: explicitly set this in env to your public app URL
  const publicUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (publicUrl) {
    return publicUrl.replace(/\/$/, "");
  }


  // Good fallback for hosted/dev proxy environments
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }


  // Next fallback
  const host = req.headers.get("host");
  if (host) {
    const proto = host.includes("localhost") ? "http" : "https";
    return `${proto}://${host}`;
  }


  // Last resort only
  return "http://localhost:3000";
}


export async function POST(req) {
  try {
    const { mode } = await req.json(); // "yearly" | "daypass"


    if (mode !== "yearly" && mode !== "daypass") {
      return Response.json({ error: "Invalid mode" }, { status: 400 });
    }


    const price =
      mode === "yearly"
        ? process.env.STRIPE_PRICE_YEARLY
        : process.env.STRIPE_PRICE_DAYPASS;


    if (!price) {
      return Response.json({ error: "Missing price id" }, { status: 400 });
    }


    const baseUrl = getBaseUrl(req);


    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      billing_address_collection: "auto",
      line_items: [{ price, quantity: 1 }],
      success_url: `${baseUrl}/success?mode=${encodeURIComponent(mode)}`,
      cancel_url: `${baseUrl}/cancel?mode=${encodeURIComponent(mode)}`,
      metadata: { mode },
    });


    return Response.json({ url: session.url });
  } catch (e) {
    return Response.json({ error: e?.message || "Stripe error" }, { status: 500 });
  }
}
