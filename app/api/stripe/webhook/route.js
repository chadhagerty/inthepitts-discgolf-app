import Stripe from "stripe";
import { getPrisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) throw new Error("Missing STRIPE_SECRET_KEY");
const stripe = new Stripe(secretKey);

function endOfTodayTorontoUTC() {
  // End of TODAY in Toronto, represented as a UTC Date
  const now = new Date();
  const torontoDate = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Toronto" })
  );

  return new Date(
    Date.UTC(
      torontoDate.getFullYear(),
      torontoDate.getMonth(),
      torontoDate.getDate(),
      23,
      59,
      59
    )
  );
}

export async function POST(req) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing stripe-signature", { status: 400 });

  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Signature verification failed:", err?.message);
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  // Only handle completed Checkout sessions
  if (event.type !== "checkout.session.completed") {
    return new Response("ignored", { status: 200 });
  }

  try {
    const prisma = getPrisma();
    const session = event.data.object;

    const mode = session?.metadata?.mode; // "daypass" | "yearly"
    const sessionId = session?.id;

    const customerEmail =
      session?.customer_details?.email || session?.customer_email || null;

    const customerName = session?.customer_details?.name || "Stripe Customer";
    const customerId = session?.customer || null; // Stripe customer id

    if (!sessionId) return new Response("Missing session id", { status: 400 });

    if (mode !== "daypass" && mode !== "yearly") {
      console.warn("Unknown mode:", mode, "session:", sessionId);
      return new Response("unknown mode", { status: 200 });
    }

    // Idempotency: already processed this checkout session?
    const existing = await prisma.checkIn.findFirst({
      where: { stripeSessionId: sessionId },
      select: { id: true },
    });
    if (existing) return new Response("Already processed", { status: 200 });

    // --------------------------
    // DAY PASS
    // --------------------------
    if (mode === "daypass") {
      const expiresAt = endOfTodayTorontoUTC();

      // ✅ IMPORTANT: If already yearly + not expired, DON'T downgrade to daypass.
      if (customerEmail) {
        const existingMember = await prisma.member.findUnique({
          where: { email: customerEmail },
          select: { id: true, membership: true, expiresAt: true },
        });

        if (
          existingMember?.membership === "yearly" &&
          existingMember.expiresAt &&
          new Date(existingMember.expiresAt) >= new Date()
        ) {
          // Still record a check-in for tracking
          await prisma.checkIn.create({
            data: {
              memberId: existingMember.id,
              source: "stripe",
              stripeSessionId: sessionId,
            },
          });

          // Optional: you can email them here if you want, but we’ll keep it quiet.
          return new Response("already yearly - recorded", { status: 200 });
        }
      }

      let member;
      if (customerEmail) {
        member = await prisma.member.upsert({
          where: { email: customerEmail },
          update: {
            name: customerName,
            membership: "daypass",
            expiresAt,
            ...(customerId ? { stripeCustomerId: customerId } : {}),
          },
          create: {
            name: customerName,
            email: customerEmail,
            membership: "daypass",
            expiresAt,
            ...(customerId ? { stripeCustomerId: customerId } : {}),
          },
        });
      } else {
        member = await prisma.member.create({
          data: {
            name: customerName,
            email: `daypass-${sessionId}@noemail.local`,
            membership: "daypass",
            expiresAt,
            ...(customerId ? { stripeCustomerId: customerId } : {}),
          },
        });
      }

      await prisma.checkIn.create({
        data: {
          memberId: member.id,
          source: "stripe",
          stripeSessionId: sessionId,
        },
      });

      // Email (best-effort)
      if (customerEmail) {
        try {
          await sendEmail({
            to: customerEmail,
            subject: "Your In The Pitts Day Pass is active ✅",
            html: `
              <div style="font-family:Arial,sans-serif;line-height:1.5">
                <h2 style="margin:0 0 8px 0">Day Pass Active ✅</h2>
                <p style="margin:0 0 10px 0">
                  Hey ${customerName || "there"}, your <b>In The Pitts Day Pass</b> is now active.
                </p>
                <p style="margin:0 0 10px 0">
                  Expires: <b>${expiresAt.toLocaleString("en-CA", { timeZone: "America/Toronto" })}</b>
                </p>
                <p style="margin:0">
                  Have a great round — and remember: inside 2 feet = parked 😄🥏
                </p>
              </div>
            `,
          });
        } catch (e) {
          console.error("[email] daypass failed:", e?.message);
        }
      }

      return new Response("daypass ok", { status: 200 });
    }

    // --------------------------
    // YEARLY
    // --------------------------
    if (mode === "yearly") {
      if (!customerEmail) {
        // Should be rare since checkout uses customer_creation:"always"
        return new Response("No email on yearly", { status: 200 });
      }

      const expiresAt = new Date();
      expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + 1);

      const member = await prisma.member.upsert({
        where: { email: customerEmail },
        update: {
          name: customerName,
          membership: "yearly",
          expiresAt,
          ...(customerId ? { stripeCustomerId: customerId } : {}),
        },
        create: {
          name: customerName,
          email: customerEmail,
          membership: "yearly",
          expiresAt,
          ...(customerId ? { stripeCustomerId: customerId } : {}),
        },
      });

      // Auto check-in on purchase (for tracking)
      await prisma.checkIn.create({
        data: {
          memberId: member.id,
          source: "stripe",
          stripeSessionId: sessionId,
        },
      });

      // Email (best-effort)
      try {
        await sendEmail({
          to: customerEmail,
          subject: "Welcome to In The Pitts Membership ✅",
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.5">
              <h2 style="margin:0 0 8px 0">Membership Active ✅</h2>
              <p style="margin:0 0 10px 0">
                Hey ${customerName || "there"}, your <b>Yearly Membership</b> is now active.
              </p>
              <p style="margin:0 0 10px 0">
                Expires: <b>${member.expiresAt.toLocaleString("en-CA", { timeZone: "America/Toronto" })}</b>
              </p>
              <p style="margin:0">
                Thanks for supporting the course — see you out there 🥏
              </p>
            </div>
          `,
        });
      } catch (e) {
        console.error("[email] yearly failed:", e?.message);
      }

      return new Response("yearly ok", { status: 200 });
    }

    return new Response("unknown mode", { status: 200 });
  } catch (err) {
    console.error("WEBHOOK DB ERROR:", err);
    return new Response(`Webhook DB error: ${err?.message || "unknown"}`, {
      status: 500,
    });
  }
}
