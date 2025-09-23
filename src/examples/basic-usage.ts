/* Run with: pnpm example */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // or put the token in .env and use dotenv.config()
import { WialonClient } from "../lib/wialon-client";

async function main() {
  const client = new WialonClient({
    token: process.env.WIALON_TOKEN,
    maxRetries: 4,
  });

  await client.loginWithToken();

  // 1) Units
  const units = await client.listUnits();
  console.log("Units:", JSON.stringify(units, null, 2));

  // 2) Unit detail (first one if present)
  const firstId = units?.items?.[0]?.id;
  if (firstId) {
    const detail = await client.getUnitById(firstId);
    console.log("Unit detail:", JSON.stringify(detail, null, 2));
  }

  // 3) Live positions
  const pos = await client.getPositionsNow();
  console.log("Positions now:", JSON.stringify(pos, null, 2));

  // 4) Report templates
  const reports = await client.listReportTemplates();
  console.log("Report templates:", JSON.stringify(reports, null, 2));

  // 5) Geofences baseline
  const geos = await client.getGeofences();
  console.log("Geofences:", JSON.stringify(geos, null, 2));

  const geosWild = await client.getGeofencesByNameWildcard();
  console.log("Geofences (wild):", JSON.stringify(geosWild, null, 2));

  // 6) Flags exploration
  console.log("\n=== Testing Geofences with Different Flags ===");
  for (const mask of [ (16 | 1), (16 | 8192), (16 | 1024) ]) {
    try {
      const r = await client.getGeofencesWithFlags(mask);
      console.log(`Geofences with flags (${mask}):`, JSON.stringify(r, null, 2));
    } catch (err) {
      console.error(`Error with flags (${mask}):`, err);
    }
  }

  // 7) Resource exploration for zones
  console.log("\n=== Exploring Resources for Zones ===");
  try {
    const resources = await client.listResourcesMinimal();
    console.log("Resources minimal keys:", Object.keys(resources?.items?.[0] ?? {}));

    const resId = resources?.items?.[0]?.id;
    if (resId) {
      const deep = await client.getResourceByIdDeep(resId);
      const first = deep?.items?.[0] ?? {};
      console.log("Resource deep keys:", Object.keys(first));
      console.log("Sample resource deep JSON:", JSON.stringify(first, null, 2));

      // Where zones often show up (tenant-specific):
      const maybeZones = (first as any)?.zl ?? (first as any)?.zones ?? (first as any)?.geofences ?? null;
      console.log("Zones-ish block preview:", maybeZones ? Object.keys(maybeZones) : maybeZones);
    } else {
      console.log("No resources found to explore");
    }
  } catch (error) {
    console.error("Error exploring resources:", error);
  }
}

main().catch((e) => {
  console.error("Main execution error:", e);
  process.exit(1);
});
