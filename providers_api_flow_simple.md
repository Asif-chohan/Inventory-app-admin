# Providers API Flow (Simple Explanation)

This document explains **how Providers APIs work in the system** in a
very simple way.

The system has three main roles:

1.  **Admin** -- configures providers and generates API keys\
2.  **Client** -- sends API requests to your system\
3.  **Worker (Backend)** -- processes messages and talks to external
    providers like Meta or Twilio

------------------------------------------------------------------------

# Step 1: Admin Configures Provider Credentials

First, the **Admin connects the system with messaging providers**.

Example providers: - WhatsApp (Meta) - SMS (Twilio)

### What Admin Does

1.  Admin goes to the **Admin Dashboard**
2.  Chooses a **customer**
3.  Adds provider credentials

Example credentials:

Twilio: - Account SID - Auth Token

Meta WhatsApp: - Access Token - Phone Number ID

### Backend Code

src/services/admin/providers.service.ts

Function:

upsertProviderCredentials

### Result

The credentials are stored in the database table:

provider_credentials

Important rule:

-   Clients **never see these credentials**
-   Only the **backend worker uses them** to talk to Meta or Twilio

------------------------------------------------------------------------

# Step 2: Admin Generates API Key for Client

Now the client needs **permission to use the API**.

### What Admin Does

Admin clicks **Generate API Key** for a customer.

### Backend Code

src/services/admin/keys.service.ts

Function:

generateKeyForCustomer

### Result

A key is generated like:

inv_abc123xyz

Two things happen:

1.  The **plain key** is shown once to the client
2.  The **hashed key (SHA-256)** is stored in the database

Database table:

api_keys

Example stored value:

SHA256(inv_abc123xyz)

This protects the system if the database is leaked.

------------------------------------------------------------------------

# Step 3: Client Sends an Authenticated Request

Now the customer's system wants to send a message.

Example request:

POST /api/v1/client/messages/send

Headers:

x-client-key: inv_abc123xyz

Body example:

{ "channel": "whatsapp", "to": "+923001234567", "message": "Hello" }

### Authentication Middleware

src/middlewares/auth.ts

Middleware:

authenticateClientKey

### What Middleware Does

1.  Takes the API key from the header
2.  Hashes it using SHA-256
3.  Searches the `api_keys` table
4.  Finds the matching **customer_id**

Now the system knows **which customer is sending the request**.

------------------------------------------------------------------------

# Step 4: Message Goes to the Outbox Queue

The API does **not send the message directly**.

Instead it adds the message to a queue.

### Backend Code

src/services/client/messages.service.ts

Function:

queueMessage

### Database Table

messages_outbox

Example record:

id: 1\
customer_id: 101\
channel: whatsapp\
message: Hello\
status: pending

This works like a **mailbox where messages wait to be processed**.

------------------------------------------------------------------------

# Step 5: Background Worker Processes the Message

A background worker runs continuously.

Worker file:

src/workers/outbox.processor.ts

### Worker Process

1.  Looks for messages where status = pending
2.  Picks the next message
3.  Starts processing it

------------------------------------------------------------------------

# Step 6: Worker Fetches Provider Credentials

The worker must know **which provider credentials to use**.

Function called:

fetchCredentials(customerId)

The system fetches credentials from:

provider_credentials

Example result:

provider: whatsapp\
metaAccessToken: abc123

------------------------------------------------------------------------

# Step 7: Worker Sends the Message to Provider

Now the worker makes the **real API call**.

Example:

POST https://graph.facebook.com/whatsapp/send

Using:

metaAccessToken

Or if SMS:

POST https://api.twilio.com/send

Using:

Account SID + Auth Token

------------------------------------------------------------------------

# Complete Flow (Simple)

Admin\
↓\
Add Provider Credentials\
↓\
Generate Client API Key\
↓\
Client sends API request with key\
↓\
Middleware authenticates the key\
↓\
Message saved in Outbox Queue\
↓\
Worker picks message\
↓\
Worker fetches provider credentials\
↓\
Worker sends message to Meta / Twilio

------------------------------------------------------------------------

# Key Architecture Idea

Client systems **never talk directly to Meta or Twilio**.

Instead:

Client → Your API → Queue → Worker → Provider

Your system acts as a **messaging gateway**.
