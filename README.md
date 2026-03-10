# ShelbyVault

Decentralized media storage built on [Shelby Protocol](https://shelbyprotocol.xyz), with Aptos wallet authentication.

Connect your Aptos wallet → upload files → stored on Shelby with your wallet address as the account identifier. Every file is cryptographically verified via SHA-256.

## How it works

1. Connect Petra, Nightly, or Pontem wallet
2. Drop files into the upload zone
3. Files are sent to a serverless function which forwards to Shelby
4. Shelby stores the blob at `/shelby/v1/blobs/{walletAddress}/{filename}`
5. Files are retrievable from the same URL globally

## Features

- Aptos wallet connect (Petra, Nightly, Pontem)
- Multi-format uploads — images, video, PDF, text, JSON
- SHA-256 hash computed client-side before upload
- Wallet address tied to each upload as proof of ownership
- Filter gallery by file type
- Verify modal showing full file metadata

## Stack

- Vanilla HTML/CSS/JS
- Vercel serverless functions (API key stays server-side)
- Shelby Protocol — `PUT /shelby/v1/blobs/{account}/{blobName}`
- Aptos wallet adapters (Petra, Nightly, Pontem)

## Setup

### Deploy on Vercel

1. Fork this repo
2. Import to Vercel
3. Add one environment variable:

```
SHELBY_API_KEY=your_api_key_here
```

4. Deploy

No other env vars needed — wallet address is passed from the frontend at upload time.

## API

The serverless function at `/api/upload` accepts:

```
POST /api/upload
Headers:
  x-file-name: filename.jpg
  x-file-type: image/jpeg
  x-wallet-address: 0xabc...123
Body: base64-encoded file data
```

It forwards to Shelby:

```
PUT https://api.shelbynet.shelby.xyz/shelby/v1/blobs/{walletAddress}/{filename}
Authorization: Bearer {SHELBY_API_KEY}
```

## Devlog

**Day 1** — Basic upload working against Shelby devnet. Figured out the correct endpoint format: `/shelby/v1/blobs/{account}/{blobName}`.

**Day 2** — Added Aptos wallet connect. Wallet address replaces the hardcoded account — each user's files live under their own address on Shelby.

**Day 3** — SHA-256 hashing, gallery with filter tabs, verify modal. Moved API key to Vercel env vars so it never touches the client.

## Status

- [x] Aptos wallet connect (Petra, Nightly, Pontem)
- [x] Multi-format upload
- [x] SHA-256 per-file verification
- [x] Wallet-bound storage accounts
- [x] Secure API key handling
- [ ] Public share page per file
- [ ] Persistent gallery across devices

---

Built during Shelby Builder Program. Running on Shelby devnet.
