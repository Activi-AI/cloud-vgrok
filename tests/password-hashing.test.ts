/**
 * Password Hashing Tests
 *
 * Tests for bcrypt password hashing in demo system
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import bcrypt from "bcrypt";

describe("bcrypt password hashing", () => {
  it("hashes passwords correctly", async () => {
    const password = "testpassword123";
    const hash = await bcrypt.hash(password, 10);

    assert.ok(hash);
    assert.notStrictEqual(hash, password);
    assert.ok(hash.startsWith("$2b$10$")); // bcrypt format
  });

  it("verifies correct passwords", async () => {
    const password = "mySecurePassword!";
    const hash = await bcrypt.hash(password, 10);

    const isValid = await bcrypt.compare(password, hash);
    assert.strictEqual(isValid, true);
  });

  it("rejects incorrect passwords", async () => {
    const password = "correctPassword";
    const hash = await bcrypt.hash(password, 10);

    const isValid = await bcrypt.compare("wrongPassword", hash);
    assert.strictEqual(isValid, false);
  });

  it("generates different hashes for same password", async () => {
    const password = "samePassword";
    const hash1 = await bcrypt.hash(password, 10);
    const hash2 = await bcrypt.hash(password, 10);

    // Different hashes (because of random salt)
    assert.notStrictEqual(hash1, hash2);

    // But both verify correctly
    assert.strictEqual(await bcrypt.compare(password, hash1), true);
    assert.strictEqual(await bcrypt.compare(password, hash2), true);
  });

  it("handles special characters in passwords", async () => {
    const password = "P@ssw0rd!#$%^&*()_+-=[]{}|;':\",./<>?";
    const hash = await bcrypt.hash(password, 10);

    assert.ok(hash);
    assert.strictEqual(await bcrypt.compare(password, hash), true);
  });

  it("uses correct number of salt rounds", async () => {
    const password = "testPassword";

    // Test with different salt rounds
    const hash6 = await bcrypt.hash(password, 6);
    const hash10 = await bcrypt.hash(password, 10);
    const hash12 = await bcrypt.hash(password, 12);

    assert.ok(hash6.startsWith("$2b$06$"));
    assert.ok(hash10.startsWith("$2b$10$"));
    assert.ok(hash12.startsWith("$2b$12$"));
  });
});
