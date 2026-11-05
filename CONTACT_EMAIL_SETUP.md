# Contact email delivery

The contact form uses `/api/contact` to send through Resend. FormSubmit was
removed because delivery requests were timing out. Credentials are read only
by the server; the browser never receives them.

## Required settings

Create an API key in [Resend](https://resend.com/api-keys), and configure:

```dotenv
RESEND_API_KEY=your-private-api-key
CONTACT_FROM_EMAIL="Portfolio <contact@eshiv.in>"
CONTACT_TO_EMAIL=eshivpandey18@gmail.com
```

`CONTACT_TO_EMAIL` is optional and defaults to the address above. The sender
in `CONTACT_FROM_EMAIL` must belong to a [verified Resend domain](https://resend.com/domains).

For an initial delivery check, `Portfolio <onboarding@resend.dev>` can be used
as the sender only when the recipient is the email address on your Resend
account. Use a verified sender domain for normal production mail.

For local use, place the settings in `.env.local` and restart the dev server.
This file is ignored by Git. For the live site, add the same settings to your
hosting provider's Production environment variables and redeploy. In Vercel,
these settings are under Project Settings > Environment Variables.

Do not add a `NEXT_PUBLIC_` prefix to the API key or commit credentials.

## Verification

Submit a note through `/contact` and check both the Resend email log and the
recipient's inbox. API acceptance is not proof of inbox delivery. The visitor's
email is set as Reply-To, so replies go to the person who wrote the note.

Missing configuration returns an immediate error, keeping the note available
in a prefilled email draft. Delivery errors and timeouts also retain all fields.
