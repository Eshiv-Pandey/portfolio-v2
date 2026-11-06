# Contact email delivery

The contact form uses `/api/contact` to send through Resend. FormSubmit was
removed because delivery requests were timing out. Credentials are read only
by the server; the browser never receives them.

## Required settings

Create an API key in [Resend](https://resend.com/api-keys), and configure:

```dotenv
RESEND_API_KEY=your-private-api-key
CONTACT_FROM_EMAIL="Eshiv Pandey <onboarding@resend.dev>"
CONTACT_TO_EMAIL=your-resend-account-email
```

Configure `CONTACT_TO_EMAIL` with the inbox chosen for contact notes. If omitted,
it defaults to the public portfolio address, `eshivpandey18@gmail.com`.

`onboarding@resend.dev` can deliver only to the email address on the Resend
account. This works for a portfolio whose notes all go to that account's owner.
To send to another inbox, use a sender from a [verified Resend domain](https://resend.com/domains),
such as `Portfolio <contact@send.eshiv.in>`, and configure its DNS records.

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

Each note keeps the same idempotency key when retried without edits, preventing
duplicate emails after an uncertain response. The API retries a transient
provider failure once within an eight-second timeout.

Contact messages use the supplied Mixkit software interface WAV, preloaded
from `/sounds/mixkit-software-interface-start-2574.wav`. The sound control
remembers the visitor's preference. Browsers require a click, tap, or key press
before audio can play; muted messages and hidden tabs stay silent.
