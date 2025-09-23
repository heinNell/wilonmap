import { NextRequest, NextResponse } from "next/server";
import { WialonClient } from "@/lib/wialon-client";

function makeClient() {
  return new WialonClient({
    token: process.env.WIALON_TOKEN,
    maxRetries: 4,
  });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const unitId = url.searchParams.get("unitId");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!action) return NextResponse.json({ error: "Missing ?action=" }, { status: 400 });

  const c = makeClient();
  await c.loginWithToken();

  try {
    switch (action) {
      case "units":
        return NextResponse.json(await c.listUnits());
      case "unitById":
        if (!unitId) return NextResponse.json({ error: "unitId required" }, { status: 400 });
        return NextResponse.json(await c.getUnitById(unitId));
      case "positionsNow":
        return NextResponse.json(await c.getPositionsNow());
      case "reportTemplates":
        return NextResponse.json(await c.listReportTemplates());
      case "geofences":
        return NextResponse.json(await c.getGeofences());
      case "geofencesWild":
        return NextResponse.json(await c.getGeofencesByNameWildcard());
      case "messages":
        if (!unitId || !from || !to) {
          return NextResponse.json({ error: "unitId, from, to required" }, { status: 400 });
        }
        return NextResponse.json(await c.loadMessagesInterval({
          itemId: Number(unitId),
          timeFrom: Number(from),
          timeTo: Number(to),
          loadCount: 100,
        }));
      default:
        return NextResponse.json({ error: `Unknown action ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    const status = err?.status ?? 500;
    return NextResponse.json(
      { error: String(err?.message ?? err), status, body: err?.bodyText },
      { status }
    );
  }
}
