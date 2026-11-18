#!/usr/bin/env node

/**
 * ScanBeforeEat — Google Indexing API Submission Script
 * Submits all static public URLs directly to Google's Indexing API for rapid crawling.
 *
 * Usage:
 *   node scripts/google-index.mjs [--key-path /path/to/service-account.json]
 */

import fs from "fs";
import crypto from "crypto";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://scanbeforeeat.com";

const URLS_TO_INDEX = [
  `${SITE_URL}/`,
  `${SITE_URL}/upf-guide/`,
  `${SITE_URL}/additives/`,
  `${SITE_URL}/about/`,
  `${SITE_URL}/blog/`,
  `${SITE_URL}/careers/`,
  `${SITE_URL}/privacy/`,
  `${SITE_URL}/terms/`,
];

function getServiceAccountKey() {
  const argIdx = process.argv.indexOf("--key-path");
  if (argIdx !== -1 && process.argv[argIdx + 1]) {
    return JSON.parse(fs.readFileSync(process.argv[argIdx + 1], "utf-8"));
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
    return JSON.parse(fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH, "utf-8"));
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }

  return null;
}

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getGoogleAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
  const signInput = `${encodedHeader}.${encodedClaimSet}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signInput);
  const signature = signer.sign(serviceAccount.private_key, "base64");
  const encodedSignature = signature
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${signInput}.${encodedSignature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to obtain Google OAuth access token: ${errText}`);
  }

  const tokenData = await res.json();
  return tokenData.access_token;
}

async function publishUrl(accessToken, url, type = "URL_UPDATED") {
  const endpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, type }),
  });

  const body = await res.json();
  return { status: res.status, body };
}

async function main() {
  console.log("=== ScanBeforeEat Google Indexing Submission ===");
  console.log(`Base URL: ${SITE_URL}`);
  console.log(`Total URLs to submit: ${URLS_TO_INDEX.length}`);

  const serviceAccount = getServiceAccountKey();
  if (!serviceAccount) {
    console.warn("\n⚠️ No Google Service Account key provided.");
    console.log("To submit URLs, provide the key via:");
    console.log("  node scripts/google-index.mjs --key-path ./service-account.json");
    console.log("  OR set GOOGLE_SERVICE_ACCOUNT_KEY_PATH / GOOGLE_SERVICE_ACCOUNT_JSON in .env.local\n");
    console.log("Generated list of URLs ready for indexing:");
    URLS_TO_INDEX.forEach((u, i) => console.log(`  [${i + 1}] ${u}`));
    return;
  }

  console.log(`\nAuthenticating as: ${serviceAccount.client_email}`);
  const token = await getGoogleAccessToken(serviceAccount);
  console.log("✓ Google OAuth Token obtained successfully.\n");

  for (const url of URLS_TO_INDEX) {
    try {
      const result = await publishUrl(token, url, "URL_UPDATED");
      console.log(`✓ Submitted ${url} -> Status ${result.status}`);
    } catch (err) {
      console.error(`✕ Failed to submit ${url}:`, err.message);
    }
  }

  console.log("\nBatch submission completed.");
}

main().catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
