import test from "node:test";
import assert from "node:assert/strict";
import { calculateLoyaltyRedemption } from "./loyalty-utils";

test("rounds down redemption requests to a 100-point multiple and caps by available balance", () => {
  const result = calculateLoyaltyRedemption(350, 500);

  assert.equal(result.pointsToRedeem, 300);
  assert.equal(result.discount, 3);
  assert.equal(result.error, undefined);
});

test("rejects redemption requests that exceed the available balance", () => {
  const result = calculateLoyaltyRedemption(600, 500);

  assert.equal(result.pointsToRedeem, 500);
  assert.equal(result.discount, 5);
  assert.equal(result.error, "You do not have enough loyalty points to redeem that amount.");
});

test("returns a zero redemption plan for empty requests", () => {
  const result = calculateLoyaltyRedemption(0, 500);

  assert.equal(result.pointsToRedeem, 0);
  assert.equal(result.discount, 0);
  assert.equal(result.error, undefined);
});
