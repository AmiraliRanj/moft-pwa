import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";

function worker(existingNames = []) {
  const listeners = {};
  const stores = new Map(existingNames.map((name) => [name, new Map()]));
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
    open: async (name) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return { addAll: async (urls) => urls.forEach((url) => store.set(url, new Response(url))), put: async (key, value) => store.set(key, value) };
    },
    match: async (request) => {
      const path = typeof request === "string" ? request : new URL(request.url).pathname;
      for (const store of stores.values()) if (store.has(path)) return store.get(path);
    },
  };
  const self = { location: { origin: "http://localhost" }, skipWaiting: async () => {}, clients: { claim: async () => {} }, addEventListener: (name, fn) => { listeners[name] = fn; } };
  runInNewContext(readFileSync("public/sw.js", "utf8"), { self, caches, URL, fetch: async () => { throw new Error("offline"); } });
  return { listeners, stores };
}

async function lifecycle(listener) {
  let pending;
  listener({ waitUntil: (promise) => { pending = promise; } });
  await pending;
}

test("cache upgrade deletes only this app's old caches", async () => {
  const { listeners, stores } = worker(["dibz-shell-v7", "dibz-customer-shell-v6", "dibz-business-shell-v1", "unrelated"]);
  await lifecycle(listeners.install);
  await lifecycle(listeners.activate);
  assert.deepEqual([...stores.keys()].sort(), ["dibz-customer-shell-v8", "dibz-business-shell-v1", "unrelated"].sort());
});

test("offline navigation returns a cached page or the offline fallback", async () => {
  const { listeners } = worker();
  await lifecycle(listeners.install);
  for (const path of ["/customer", "/never-visited"]) {
    let pending;
    listeners.fetch({ request: { url: `http://localhost${path}`, method: "GET", mode: "navigate" }, respondWith: (promise) => { pending = promise; } });
    const response = await pending;
    assert.equal(await response.text(), path === "/customer" ? "/customer" : "/offline");
  }
});

test("legacy business routes bypass the worker even when cached", () => {
  const { listeners, stores } = worker(["dibz-shell-v7"]);
  stores.get("dibz-shell-v7").set("/business/orders", new Response("old business UI"));
  for (const path of ["/business", "/business/orders?status=paid"]) {
    let intercepted = false;
    listeners.fetch({ request: { url: `http://localhost${path}`, method: "GET", mode: "navigate" }, respondWith: () => { intercepted = true; } });
    assert.equal(intercepted, false);
  }
});
