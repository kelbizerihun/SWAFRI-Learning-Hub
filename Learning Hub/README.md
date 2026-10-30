# Learning Hub: Web3 Learning Platform

**SWAFRI Hackathon 2026 · Project 1**

Learning Hub is an online learning platform. Learners take courses and earn certificates that are tamper-proof: anyone can check them without contacting the institution that issued them.

When a learner finishes a course, the platform:

1. creates a certificate record (ID, learner, course, date, score, skills);
2. computes its **SHA-256 fingerprint**;
3. **signs** the fingerprint with the issuer's Ethereum key;
4. **mines** it into the Learning Hub ledger;
5. **anchors** the fingerprint in a **Solidity smart contract** on an EVM chain.

Employers then check the certificate by entering its ID or scanning its QR code. The browser itself recomputes the fingerprint and checks the signature.

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), React 18 |
| Backend | Node.js, Express 4, JWT auth, bcrypt, zod validation, rate limiting |
| Web3 | Solidity 0.8.24 `CertificateRegistry`, Hardhat, ethers.js v6 provider |
| Storage | JSON document store (`backend/data/db.json`), atomic writes, no database server needed |
| Payments | Stripe Checkout (hosted payment page), server-side confirmation + signed webhooks |
| AI | Google Gemini (`gemini-2.5-flash`) for the AI Learning Assistant |

---

## Quick start (about 3 minutes)

Requirements: **Node.js 18.18+** (20 LTS recommended) and npm.

```bash
npm run setup     # installs all packages and creates backend/.env
npm run dev       # starts the local blockchain, the API and the web app
```

Open **http://localhost:3000**.

`npm run dev` starts three processes:

| Process | Address | What it does |
|---|---|---|
| `chain` | http://127.0.0.1:8545 | Local Hardhat EVM blockchain (chain id 31337) |
| `api` | http://localhost:4000/api | Express API. On first start it seeds the demo data, **deploys the contract automatically** and anchors the demo certificates on-chain. |
| `web` | http://localhost:3000 | Next.js app. It forwards `/api/*` to the API. |

To run the processes in separate terminals instead: `npm run chain`, then `npm run api`, then `npm run web`.

### Demo accounts

There are one-click buttons for these on the Log in page.

| Role | Email | Password |
|---|---|---|
| Student | misgana@learninghub.io | `Learn#2026` |
| Instructor | solomon@learninghub.io | `Teach#2026` |
| Admin | admin@learninghub.io | `Admin#2026` |

Other students (all with password `Learn#2026`): abel@, liya@, samuel@, ruth@, jonah@ and sara@ `example.com`.

### A 5-minute demo script for the judges

1. **Register** a new student account. The form validates live and checks whether the email is taken.
   Note that **Dashboard** only appears in the top menu once you're logged in.
2. Open **Blockchain & Verifiable Credentials** (7 lessons) and select **Start Learning**.
3. Complete the lessons and pass both quizzes. Quizzes are graded on the server, so the answers never reach the browser before a learner submits.
4. On the last lesson, the **certificate is issued**: hashed, signed, mined and anchored in the smart contract.
5. Open the certificate, then **scan its QR code** or open `/verify/<ID>`. The page runs **5 checks**:
   - the fingerprint matches;
   - the issuer signature is valid;
   - the ledger block contains it;
   - the smart contract's copy matches;
   - it isn't revoked.
6. Select **Run a tamper test** and change the learner's name. Verification now fails.
7. Log in as **Admin** and go to **Ledger explorer**. Select **Simulate tampering**: the chain breaks and the affected certificate fails verification. Select **Restore** to repair it.
8. In **Certificates**, revoke a certificate. Verification now says **Revoked**, both on the ledger and in the contract.
9. **Buy a paid course:** open **UI Design Fundamentals ($29)** and select **Buy course**. On Stripe's page use the test card `4242 4242 4242 4242`, any future date, any CVC. You come back enrolled.
10. Open the learner's **Achievement wallet**. It's a public page showing certificates, badges and verified skills.
11. Log in as the **Instructor** to create a course, build its curriculum and quizzes, publish it, and track learner progress.

---

## How the Web3 part works

```
 Learner finishes last lesson
            │
            ▼
  backend/src/services/certificates.js
   1. record = {id, studentName, studentWallet, courseId, courseTitle, instructorName, issuedAt, score, skills, issuer}
   2. hash   = SHA-256(canonical JSON of record)        ← same function in browser and server
   3. sig    = issuerWallet.signMessage(hash)           ← secp256k1, EIP-191
   4. Learning Hub ledger: MINT_CERTIFICATE tx → proof-of-work block (Merkle root, prev hash)
   5. web3/chain.js queue → CertificateRegistry.issue(certId, 0x+hash, studentWallet)
            │
            ▼
  Verify page (in the browser)
   ✓ recompute SHA-256 from the visible details
   ✓ recover signer from signature == published issuer address
   ✓ block on ledger contains the hash and the block is valid
   ✓ CertificateRegistry.getCertificate(id).certHash == hash
   ✓ no REVOKE transaction on the ledger, revokedAt == 0 in the contract
```

- **Contract:** `blockchain/contracts/CertificateRegistry.sol`. It stores only the fingerprint, the issuer, the learner's wallet and timestamps, so **no personal data goes on-chain**. Only authorized issuers can write, and revocation records a reason. It has 5 Hardhat tests.
- **Issuer key:** one Ethereum key signs certificates and pays for the anchoring transactions. Set it with `ISSUER_PRIVATE_KEY`; otherwise one is generated into `backend/data/issuer.key`.
- **Resilient:** if the chain is down, certificates are still issued (ledger plus signature) and their status shows "EVM anchor pending". The API keeps retrying and anchors them once the chain is reachable.
- **Learner wallets:** every learner gets a wallet address automatically when they register. There are no fees and no extension to install.

### Deploying to a public testnet (Sepolia or Polygon Amoy)

1. Create an account and get free test tokens from a faucet. That account becomes your issuer.
2. Set these in `backend/.env`:
   ```
   CHAIN_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   ISSUER_PRIVATE_KEY=0x…your funded key…
   EXPLORER_URL=https://sepolia.etherscan.io
   CONTRACT_ADDRESS=            # leave empty to auto-deploy, or set one you deployed
   ```
3. Run `npm run seed` (re-signs the demo certificates with your issuer), then `npm run api`.

Verification steps then link to the transaction on Etherscan. To deploy with Hardhat instead, fill in `blockchain/.env` and run `npm --prefix blockchain run deploy:sepolia`.

To run without any blockchain, leave `CHAIN_RPC_URL` empty ("ledger-only" mode).

---

## Payments (Stripe)

Courses have a price (in the instructor's course editor; `0` = free). Seeded prices: UI Design $29, Python $39, Full-Stack $49; the rest are free, including the 7-lesson demo course.

1. A learner selects **Buy course**. The API creates a **Stripe Checkout Session** and the browser goes to Stripe's hosted page, so card details never touch our servers.
2. Stripe sends the learner back to `/payment/success?session_id=…`. The API **retrieves the session from Stripe** and enrolls the learner only if Stripe says it's paid.
3. Optionally, Stripe also calls `POST /api/payments/webhook` (signature-checked), so enrollment happens even if the learner closes the tab. Both paths are idempotent.

The free-enrollment endpoint refuses paid courses (HTTP 402), so the API can't be used to skip payment.

**Setup:** put your **secret** key in `backend/.env` as `STRIPE_SECRET_KEY`. The publishable key isn't needed, because Stripe's hosted Checkout page doesn't use it. For webhooks during local development, install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and run:

```bash
stripe listen --forward-to localhost:4000/api/payments/webhook
```

Copy the `whsec_…` value it prints into `STRIPE_WEBHOOK_SECRET`, then restart the API.

**Test cards:** `4242 4242 4242 4242` succeeds; `4000 0000 0000 9995` is declined.

## AI Learning Assistant (Gemini)

Get a key at https://aistudio.google.com/apikey and set `GEMINI_API_KEY` in `backend/.env`. The model is configurable with `GEMINI_MODEL` (default `gemini-2.5-flash`). The key stays on the server: the browser calls `/api/assistant` and never sees it. Without a key, or if Gemini is unreachable, the assistant still answers simple questions from the course data.

## Feature checklist

**Student portal**
- Registration and authentication (JWT, bcrypt)
- Course catalog with search and filters
- Enrollment
- Lesson player that tracks watch progress
- Notes, bookmarks and downloadable resources
- Quizzes graded on the server, with unlimited attempts and best score kept
- Dashboard with streaks, weekly hours, badges and goals
- AI learning assistant

**Instructor portal**
- Course creation and editing
- Curriculum builder: modules and lessons, with reordering
- Quiz builder
- Publishing rules checked on the server
- Student progress dashboard

**Admin portal**
- User management: add, change role, suspend, delete
- Course management: publish, feature, delete
- Platform analytics
- Certificate management: issue and revoke on-chain
- Ledger explorer with tamper demo
- Contact inbox

**Web3**
- On-chain certificate: ID, learner, course, date and certificate hash
- QR code on every certificate
- Public verification portal at `/verify/<ID>`
- Public Digital Achievement Wallet at `/wallet/<handle>`, showing badges, skills and certificates
- Downloadable certificate (SVG)

---

## API reference

All routes are under `/api`. Send `Authorization: Bearer <token>` for signed-in routes.

| Method | Route | Who | Purpose |
|---|---|---|---|
| POST | `/auth/register`, `/auth/login` | anyone | Returns a JWT |
| GET | `/auth/email-available?email=` | anyone | Live duplicate-email check |
| GET | `/state` | anyone | Snapshot of the data this viewer is allowed to see |
| GET | `/verify/:certId` | anyone | Full verification report, including a live contract read |
| GET | `/web3/status` | anyone | Network, contract and issuer |
| POST | `/courses/:id/enroll` | student | Enroll |
| POST | `/enrollments/:courseId/lessons/:lessonId/complete` | student | Complete a lesson (may return `cert`) |
| POST | `/enrollments/:courseId/quizzes/:lessonId/submit` | student | `{answers:[…]}` → score, explanations, `cert` |
| PATCH | `/enrollments/:courseId/watch` | student | Video or practice progress |
| PUT / DELETE | `/me/notes/…`, `/me/goals/…` | signed in | Notes and goals |
| POST | `/me/saved/toggle`, `/events/:id/register`, `/careers/:id/apply` | signed in | Bookmarks, events, careers |
| POST / PUT | `/courses`, `/courses/:id` | instructor, admin | Create a course; save details and curriculum (validated) |
| POST | `/courses/:id/publish`, `/courses/:id/feature` | owner or admin; admin | Publish; feature |
| POST / PATCH / DELETE | `/admin/users…` | admin | User management |
| POST | `/admin/certificates/issue`, `/admin/certificates/:id/revoke` | admin | Issue or revoke a certificate |
| POST | `/admin/chain/tamper`, `/admin/chain/restore` | admin | Ledger tamper demo |
| POST | `/contact`, `/subscribe`, `/assistant` | anyone (rate limited) | Forms; AI assistant (Gemini) |
| POST | `/payments/checkout`, `/payments/confirm` | student | Start Stripe Checkout; confirm and enroll |
| POST | `/payments/webhook` | Stripe (signed) | `checkout.session.completed` → enroll |

Quick check from a terminal: `curl localhost:4000/api/verify/LH-2026-XXXXXX`

---

## Project structure

```
blockchain/   Solidity contract, Hardhat config, tests, deploy script
backend/      Express API
  src/routes/        auth, learning, me, courses, admin, public, payments
  src/services/      certificates (issue/revoke/verify), payments (Stripe), projection (role-based data), learning
  src/web3/          chain.js (ethers provider, auto-deploy, anchoring queue), issuer.js (signing key)
  src/lib/           ledger.js (proof-of-work chain), util.js (hashing)
  src/db/            store.js (JSON store), seed.js
  test/              API tests (node:test + supertest)
frontend/     Next.js App Router
  app/               layout, page, /verify/[id], /wallet/[handle], /cert/[id]
  lib/hub.js         the UI: views, router, API client, in-browser verification
  app/globals.css    design system (light and dark themes)
```

## Tests

```bash
npm test     # 5 contract tests + 11 API tests (payments and Gemini use fakes, so no keys or network needed)
```

## Notes and next steps

- **Storage:** all data access goes through `db.data` and `db.save()` in `backend/src/db/store.js`. To move to PostgreSQL or MongoDB after the hackathon, replace that layer.
- **Google sign-in:** the button shows a message for now. It needs OAuth client credentials.
- **Secrets:** `backend/.env` holds your Stripe and Gemini keys. It's in `.gitignore`; never commit it or paste keys in chats. Roll the Stripe keys after the hackathon.
- **Production:** set a strong `JWT_SECRET` and `DEMO_MODE=false` (this disables "Reset demo data"). Keep `ISSUER_PRIVATE_KEY` in a secrets manager.
