import { NextResponse } from "next/server";
import { parseAstrologyIntake } from "@/lib/astrology/parseAstrologyIntake";
import { pickLenses } from "@/lib/astrology/pickLenses";
import { composeAstrologyReading } from "@/lib/astrology/composeAstrologyReading";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function readBodyAsUnknown(req: Request): Promise<unknown> {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await req.json();
    } catch {
      // fall through to text
    }
  }
  return await req.text();
}

function pickControlFlags(req: Request, body: any) {
  // Prefer JSON body controls; fall back to query params if needed
  const url = new URL(req.url);

  const detailLevel =
    body?.detailLevel ?? url.searchParams.get("detailLevel") ?? "standard";

  const debug = body?.debug ?? (url.searchParams.get("debug") === "true");

  const include = body?.include ?? undefined;

  return { detailLevel, debug, include };
}

export async function POST(req: Request) {
  try {
    const body = await readBodyAsUnknown(req);

    // If JSON object, we can carry control flags alongside intake
    const bodyObj =
      typeof body === "object" && body !== null ? (body as any) : null;

    const intake = parseAstrologyIntake(bodyObj?.intake ?? body);
    const lensesUsed = pickLenses(intake);

    const { detailLevel, debug, include } = pickControlFlags(req, bodyObj);

    const reading = await composeAstrologyReading({
      intake,
      lensesUsed,
      detailLevel,
      debug,
      include,
    });

    return NextResponse.json(reading, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: "Astrology reading failed", detail: message },
      { status: 400 }
    );
  }
}

export async function GET() {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  return NextResponse.json(
    {
      ok: true,
      hint: "POST chart paste or JSON to this endpoint.",
      lensesAvailable: [
        "developmental",
        "mythic",
        "timing",
        "integration",
        "spiralogic",
      ],
      houseSystemsAvailable: [
        "whole_sign",
        "placidus",
        "porphyry",
        "equal",
        "koch",
      ],
      controls: {
        detailLevel: ["mini", "standard", "full"],
        debug: "true | false",
        include: {
          natalChart: "boolean",
          transits: "boolean",
          lifeCycles: "boolean",
          narrative: "boolean",
          spiralogic: "boolean",
        },
      },
      example: {
        detailLevel: "standard",
        debug: false,
        include: { spiralogic: true },
        intake: {
          houseSystem: "whole_sign",
          question: "What growth patterns should I focus on?",
          birth: {
            date: "1985-03-21",
            time: "14:30",
            location: "30.2672,-97.7431",
            timezone: "America/Chicago",
          },
        },
      },
    },
    { status: 200 }
  );
}
