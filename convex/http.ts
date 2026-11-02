import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

async function validateRequest(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET environment variable is not configured in Convex.");
    return null;
  }

  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return null;
  }

  const payload = await req.text();
  const wh = new Webhook(webhookSecret);
  try {
    return wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as any;
  } catch (err) {
    console.error("Error verifying Clerk webhook signature:", err);
    return null;
  }
}

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Invalid Clerk webhook request or signature", {
        status: 400,
      });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const { id, first_name, last_name, email_addresses } = event.data;

        const primaryEmailObj = email_addresses?.find(
          (e: any) => e.id === event.data.primary_email_address_id
        );
        const email = primaryEmailObj?.email_address || "";

        // Optional email domain restriction check
        const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;
        if (allowedDomain && allowedDomain !== "*") {
          const emailDomain = email.split("@")[1];
          if (emailDomain !== allowedDomain) {
            console.warn(
              `User ${email} signed up with unallowed domain: ${emailDomain}`
            );
          }
        }

        const name = `${first_name || ""} ${last_name || ""}`.trim();

        // Only identity fields come from Clerk. Clerk metadata is never used
        // for roles because users can write to it from the browser.
        await ctx.runMutation(internal.users.syncUser, {
          clerkId: id,
          name: name || undefined,
          email,
        });
        break;
      }
    }

    return new Response(JSON.stringify({ status: "success" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
