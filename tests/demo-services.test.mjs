import assert from "node:assert/strict";
import test from "node:test";
import { loadTs } from "./load-ts.mjs";

const { createDemoSeed, DEMO_STATE_VERSION, DEMO_STORAGE_KEY } = loadTs("data/demo-seed.ts");
const { offerService, orderService, pickupService } = loadTs("demo/services.ts");

test("seed retains a versioned, independent demo state", () => {
  const first = createDemoSeed();
  const second = createDemoSeed();
  assert.equal(first.version, DEMO_STATE_VERSION);
  assert.equal(DEMO_STORAGE_KEY, "moft-unified-demo-v1");
  first.customer.name = "Changed demo";
  assert.notEqual(first.customer.name, second.customer.name);
});

test("reservation changes stock and creates a simulated order without changing another demo", () => {
  const state = createDemoSeed();
  const separate = createDemoSeed();
  const before = JSON.stringify(separate);
  const offer = state.offers.find((item) => item.status === "active" && item.totalQuantity > item.soldQuantity + item.reservedQuantity);
  const result = orderService.place(state, offer.id, 1);
  assert.equal(result.ok, true);
  assert.equal(result.value.paymentStatus, "simulated_paid");
  assert.equal(result.value.pickupStart, offer.pickupStart);
  assert.equal(result.value.pickupEnd, offer.pickupEnd);
  assert.equal(result.state.orders.length, state.orders.length + 1);
  assert.equal(result.state.offers.find((item) => item.id === offer.id).soldQuantity, offer.soldQuantity + 1);
  assert.equal(JSON.stringify(separate), before);
});

test("invalid reservations leave the seed unchanged", () => {
  const state = createDemoSeed();
  const before = JSON.stringify(state);
  assert.equal(orderService.place(state, "missing", 1).ok, false);
  assert.equal(orderService.place(state, state.offers.find((offer) => offer.status === "active").id, 0).ok, false);
  assert.equal(JSON.stringify(state), before);
});

test("cart checkout retains failed items while keeping successful reservations", () => {
  const state = createDemoSeed();
  const offer = state.offers.find((item) => item.status === "active" && item.totalQuantity - item.soldQuantity - item.reservedQuantity === 1);
  assert.ok(offer);
  const result = orderService.placeMany(state, [
    { offerId: offer.id, quantity: 1 },
    { offerId: offer.id, quantity: 1 },
  ]);
  assert.equal(result.succeededCount, 1);
  assert.equal(result.state.orders.length, state.orders.length + 1);
  assert.deepEqual(result.failedItems.map(({ offerId, quantity }) => ({ offerId, quantity })), [
    { offerId: offer.id, quantity: 1 },
  ]);
  assert.equal(state.orders.length + 1, result.state.orders.length);
});

test("business offer creation and status changes work with copied services", () => {
  const state = createDemoSeed();
  const original = state.offers.find((offer) => offer.businessId === state.business.id);
  const result = offerService.create(state, original, "draft");
  assert.equal(result.ok, true);
  assert.equal(result.value.status, "draft");
  const published = offerService.setStatus(result.state, result.value.id, "active");
  assert.equal(published.ok, true);
  assert.equal(published.value.status, "active");
  assert.equal(state.offers.some((offer) => offer.id === result.value.id), false);
});

test("orders transition through preparation and pickup can only be completed once", () => {
  const state = createDemoSeed();
  const paid = state.orders.find((order) => order.status === "paid");
  const preparing = orderService.transition(state, paid.id, "preparing");
  assert.equal(preparing.ok, true);
  const ready = orderService.transition(preparing.state, paid.id, "ready_for_pickup");
  assert.equal(ready.ok, true);
  assert.equal(pickupService.verify(ready.state, ready.value.pickupCode.value).kind, "valid");
  const completed = orderService.transition(ready.state, paid.id, "completed");
  assert.equal(completed.ok, true);
  assert.equal(pickupService.verify(completed.state, completed.value.pickupCode.value).kind, "used");
  assert.equal(orderService.transition(completed.state, paid.id, "completed").ok, false);
});
