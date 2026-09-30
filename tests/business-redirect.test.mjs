import assert from "node:assert/strict";
import test from "node:test";
import { loadTs } from "./load-ts.mjs";

const { default: config } = loadTs("next.config.ts");

async function withEnv(businessUrl, mode, action) {
  const previousUrl = process.env.BUSINESS_PWA_URL;
  const previousMode = process.env.NODE_ENV;
  if (businessUrl === undefined) delete process.env.BUSINESS_PWA_URL;
  else process.env.BUSINESS_PWA_URL = businessUrl;
  process.env.NODE_ENV = mode;
  try { await action(); }
  finally {
    if (previousUrl === undefined) delete process.env.BUSINESS_PWA_URL;
    else process.env.BUSINESS_PWA_URL = previousUrl;
    if (previousMode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousMode;
  }
}

test("legacy routes retain their suffix on the configured business origin", async () => {
  await withEnv("https://business.example.com/", "production", async () => {
    assert.deepEqual(await config.redirects(), [{
      source: "/business/:path*",
      destination: "https://business.example.com/business/:path*",
      permanent: false,
    }]);
  });
});

test("local development redirects to port 3001 without inventing a production host", async () => {
  await withEnv(undefined, "development", async () => {
    assert.equal((await config.redirects())[0].destination, "http://localhost:3001/business/:path*");
  });
  await withEnv(undefined, "production", async () => {
    assert.deepEqual(await config.redirects(), []);
  });
});

test("reject invalid origins before shipping redirects", async () => {
  for (const url of ["not-a-url", "javascript:alert(1)", "https://example.com/business", "https://example.com?x=1", "https://example.com/#fragment", "https://user:pass@example.com"]) {
    await withEnv(url, "production", async () => { await assert.rejects(() => config.redirects()); });
  }
});
