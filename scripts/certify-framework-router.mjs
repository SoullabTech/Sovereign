// scripts/certify-framework-router.mjs
import fs from "node:fs";
import path from "node:path";

const API_URL = process.env.MAIA_API_URL || "http://localhost:3000/api/sovereign/app/maia";

function loadFixture() {
  const p = path.resolve(process.cwd(), "tests/golden/framework-router.json");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

async function callMaia(input) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: input }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} from MAIA_API_URL. Body: ${body.slice(0, 400)}`);
  }
  return res.json();
}

(async () => {
  const tests = loadFixture();
  let fails = 0;

  console.log(`\n🧪 Framework Router Certification`);
  console.log(`API: ${API_URL}\n`);

  for (const t of tests) {
    process.stdout.write(`- ${t.id} ... `);
    try {
      const out = await callMaia(t.input);
      const meta = out?.metadata;

      if (!meta) {
        throw new Error("Missing metadata in response");
      }

      const primary = meta.primaryLens;
      if (!primary) {
        throw new Error(`Missing metadata.primaryLens (router not wired?) - lensesUsed: ${JSON.stringify(meta.lensesUsed)}`);
      }

      if (t.expect?.primaryLens && primary !== t.expect.primaryLens) {
        throw new Error(`expected primaryLens=${t.expect.primaryLens} got ${primary} - lensesUsed: ${JSON.stringify(meta.lensesUsed)}`);
      }

      console.log("PASS");
    } catch (e) {
      fails++;
      console.log("FAIL");
      console.log(`  ↳ ${e.message}\n`);
    }
  }

  if (fails) {
    console.error(`\n❌ Framework Router certification failed: ${fails} case(s)`);
    process.exit(1);
  }

  console.log(`\n✅ Framework Router certification passed (${tests.length}/${tests.length})\n`);
})();
