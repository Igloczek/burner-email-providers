import dns from "node:dns/promises";
import { readFile, writeFile } from "node:fs/promises";

const emailsPath = new URL("../emails.txt", import.meta.url).pathname;

const resolver = new dns.Resolver({ timeout: 5000, tries: 3 });
resolver.setServers(["1.1.1.1", "8.8.8.8"]);

const TRANSIENT_ERRORS = new Set([
  "ETIMEOUT",
  "ESERVFAIL",
  "ECONNREFUSED",
  "EREFUSED",
]);

/**
 * Check if a domain can receive email, per RFC 5321:
 * 1. Try MX records first
 * 2. If no MX, fall back to A/AAAA records (implicit MX)
 * 3. Only mark as dead if the domain has none of the above
 */
async function checkDomain(domain: string): Promise<boolean> {
  // Step 1: Check MX records
  try {
    const mx = await resolver.resolveMx(domain);
    if (mx && mx.length > 0) return true;
  } catch (err: any) {
    if (TRANSIENT_ERRORS.has(err?.code)) return true;
    if (err?.code === "ENOTFOUND") return false;
    // ENODATA = domain exists but no MX records, fall through to A/AAAA check
  }

  // Step 2: RFC 5321 fallback — check A/AAAA records (implicit MX)
  try {
    const a = await resolver.resolve4(domain);
    if (a && a.length > 0) return true;
  } catch {}

  try {
    const aaaa = await resolver.resolve6(domain);
    if (aaaa && aaaa.length > 0) return true;
  } catch {}

  return false;
}

async function main() {
  const fileContent = await readFile(emailsPath, "utf8");
  const rawDomains = fileContent
    .split("\n")
    .map((d) => d.trim())
    .filter(Boolean);

  console.log("Fetching upstream domains from wesbos...");
  const upstreamRes = await fetch(
    "https://raw.githubusercontent.com/wesbos/burner-email-providers/master/emails.txt",
  );
  const upstreamText = await upstreamRes.text();
  const upstreamDomains = new Set(
    upstreamText
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean),
  );
  console.log(`Loaded ${upstreamDomains.size} upstream domains.`);

  // Deduplicate, filter out upstream domains, and sort
  const domains = Array.from(new Set(rawDomains))
    .filter((domain) => !upstreamDomains.has(domain))
    .sort();
  console.log(`Loaded ${domains.length} unique domains to check.`);

  const aliveDomains: string[] = [];
  const concurrency = 50;
  let dead = 0;
  let processed = 0;

  // Pool-based concurrency — always keeps `concurrency` tasks in flight
  const queue = domains.map((domain) => async () => {
    const isAlive = await checkDomain(domain);
    if (isAlive) {
      aliveDomains.push(domain);
    } else {
      dead++;
    }
    processed++;
    process.stdout.write(
      `\r  Checking domains... ${processed}/${domains.length} (✅ ${aliveDomains.length} alive, ❌ ${dead} dead)`,
    );
  });

  const executing = new Set<Promise<void>>();
  for (const task of queue) {
    const p = task().then(() => executing.delete(p));
    executing.add(p);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);

  console.log("");

  // Final sort to be absolutely sure
  aliveDomains.sort();

  await writeFile(emailsPath, aliveDomains.join("\n") + "\n");
  console.log(`\n================================`);
  console.log(
    `Done! Kept ${aliveDomains.length} alive domains. Saved to emails.txt.`,
  );
  console.log(`Removed ${domains.length - aliveDomains.length} dead domains.`);
  console.log(`================================`);
}

main().catch(console.error);
