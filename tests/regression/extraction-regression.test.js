const test = require("node:test");
const assert = require("node:assert/strict");

const {
  UserFacingError,
  normalizeWebUrl,
  extractDeterministicSignals,
  parseAndNormalizeProfileJson,
  parseJsonFromModel,
} = require("../../server");

test("URL extraction ignores email-domain and abbreviation false positives", () => {
  const text = [
    "John Doe",
    "Email: john@example.com",
    "Education: B.Tech Computer Science",
    "Portfolio: johndoe.dev",
    "LinkedIn: linkedin.com/in/johndoe",
  ].join("\n");

  const signals = extractDeterministicSignals(text, "");

  assert.equal(signals.emails[0], "john@example.com");
  assert.equal(signals.socials.website, "https://johndoe.dev/");
  assert.equal(signals.urls.includes("https://example.com/"), false);
  assert.equal(signals.urls.includes("https://b.tech/"), false);
});

test("Malformed JSON edits are rejected gracefully", () => {
  assert.throws(
    () => parseAndNormalizeProfileJson('{"identity": {"fullName": "Jane"'),
    (error) => {
      assert.equal(error instanceof UserFacingError, true);
      assert.match(error.message, /Malformed JSON edits/i);
      return true;
    }
  );
});

test("Valid JSON edits are normalized and unknown keys are dropped", () => {
  const raw = JSON.stringify({
    identity: {
      fullName: "Jane Doe",
      contact: {
        email: "INVALID_EMAIL",
      },
      socials: {
        website: "janedoe.dev",
      },
    },
    context: {
      primaryRole: "wizard",
    },
    hacked: {
      injected: true,
    },
  });

  const profile = parseAndNormalizeProfileJson(raw);

  assert.equal(profile.identity.fullName, "Jane Doe");
  assert.equal(profile.identity.contact.email, "");
  assert.equal(profile.identity.socials.website, "https://janedoe.dev/");
  assert.equal(profile.context.primaryRole, "explorer");
  assert.equal(Object.prototype.hasOwnProperty.call(profile, "hacked"), false);
});

test("Private and local portfolio URLs are rejected", () => {
  assert.throws(() => normalizeWebUrl("http://127.0.0.1:3000"), /Private or local network URLs are not allowed/i);
  assert.throws(() => normalizeWebUrl("http://localhost:8080"), /Private or local network URLs are not allowed/i);
  assert.throws(() => normalizeWebUrl("http://192.168.1.2/path"), /Private or local network URLs are not allowed/i);
});

test("JSON parser recovers from fenced and trailing-comma output", () => {
  const raw = [
    "```json",
    '{"identity":{"fullName":"Alex Example",},"context":{"primaryRole":"professional",},}',
    "```",
  ].join("\n");

  const parsed = parseJsonFromModel(raw);

  assert.equal(parsed.identity.fullName, "Alex Example");
  assert.equal(parsed.context.primaryRole, "professional");
});
