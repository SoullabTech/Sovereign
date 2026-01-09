import { NextRequest, NextResponse } from 'next/server';
import {
  calculateLifeCycleFromBirthDate,
  calculateLifeCycleReport,
  getGebserStructure,
  calculateAge,
} from '@/lib/astrology/lifeCycleCalculator';

/**
 * GET /api/astrology/life-cycles?birthDate=YYYY-MM-DD
 * Calculate life cycle markers for a birth date
 *
 * Optional query params:
 * - natalSaturn, natalJupiter, natalUranus, natalChiron, natalNorthNode
 *   (ecliptic longitudes for precise calculation)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const birthDateStr = searchParams.get('birthDate');

    if (!birthDateStr) {
      return NextResponse.json(
        { success: false, error: 'birthDate is required (YYYY-MM-DD format)' },
        { status: 400 }
      );
    }

    // Parse birth date
    const birthDate = new Date(birthDateStr);
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid birthDate format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Check for optional natal positions
    const natalSaturn = searchParams.get('natalSaturn');
    const natalJupiter = searchParams.get('natalJupiter');
    const natalUranus = searchParams.get('natalUranus');
    const natalChiron = searchParams.get('natalChiron');
    const natalNorthNode = searchParams.get('natalNorthNode');

    let report;

    if (natalSaturn && natalJupiter && natalUranus && natalChiron && natalNorthNode) {
      // Use precise natal positions
      report = calculateLifeCycleReport(birthDate, {
        saturn: parseFloat(natalSaturn),
        jupiter: parseFloat(natalJupiter),
        uranus: parseFloat(natalUranus),
        chiron: parseFloat(natalChiron),
        northNode: parseFloat(natalNorthNode),
      });
    } else {
      // Calculate from birth date alone
      report = calculateLifeCycleFromBirthDate(birthDate);
    }

    // Format response
    return NextResponse.json({
      success: true,
      data: {
        birthDate: birthDateStr,
        currentAge: Math.floor(report.currentAge),
        ageDecimal: parseFloat(report.currentAge.toFixed(2)),
        consciousness: {
          structure: report.currentGebserStructure.name,
          symbol: report.currentGebserStructure.symbol,
          description: report.currentGebserStructure.description,
        },
        saturnCycle: {
          currentCycle: report.saturnCycle.currentCycleNumber,
          progress: parseFloat((report.saturnCycle.phaseProgress * 100).toFixed(1)),
          nextReturn: report.saturnCycle.nextReturn
            ? {
                date: report.saturnCycle.nextReturn.exactDate?.toISOString().split('T')[0],
                age: parseFloat(report.saturnCycle.nextReturn.ageAtEvent.toFixed(1)),
                yearsAway: parseFloat((report.saturnCycle.nextReturn.ageAtEvent - report.currentAge).toFixed(1)),
                isActive: report.saturnCycle.nextReturn.isActive,
                description: report.saturnCycle.nextReturn.archetypeDescription,
              }
            : null,
        },
        uranusOpposition: {
          date: report.uranusOpposition.date?.toISOString().split('T')[0],
          age: parseFloat(report.uranusOpposition.ageAtEvent.toFixed(1)),
          progress: parseFloat((report.uranusOpposition.phase * 100).toFixed(1)),
          isActive: report.uranusOpposition.isActive,
        },
        chironReturn: {
          date: report.chironReturn.date?.toISOString().split('T')[0],
          age: parseFloat(report.chironReturn.ageAtEvent.toFixed(1)),
          progress: parseFloat((report.chironReturn.phase * 100).toFixed(1)),
        },
        upcomingMarkers: report.upcomingMarkers.map((m) => ({
          name: m.name,
          type: m.type,
          body: m.planetaryBody,
          date: m.exactDate?.toISOString().split('T')[0],
          age: parseFloat(m.ageAtEvent.toFixed(1)),
          yearsAway: parseFloat((m.ageAtEvent - report.currentAge).toFixed(1)),
          isActive: m.isActive,
          description: m.archetypeDescription,
        })),
        insight: report.currentPhaseInsight,
      },
    });
  } catch (error) {
    console.error('[life-cycles] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate life cycles' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/astrology/life-cycles
 * Calculate life cycles with full birth chart data
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { birthDate, birthChart } = body;

    if (!birthDate) {
      return NextResponse.json(
        { success: false, error: 'birthDate is required' },
        { status: 400 }
      );
    }

    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid birthDate format' },
        { status: 400 }
      );
    }

    let report;

    if (birthChart?.saturn && birthChart?.jupiter && birthChart?.uranus) {
      // Extract longitudes from birth chart
      const toEcliptic = (pos: { sign: string; degree: number }) => {
        const signs = [
          'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
          'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
        ];
        const signIndex = signs.indexOf(pos.sign);
        return signIndex * 30 + pos.degree;
      };

      report = calculateLifeCycleReport(date, {
        saturn: toEcliptic(birthChart.saturn),
        jupiter: toEcliptic(birthChart.jupiter),
        uranus: toEcliptic(birthChart.uranus),
        chiron: birthChart.chiron ? toEcliptic(birthChart.chiron) : 0,
        northNode: birthChart.northNode ? toEcliptic(birthChart.northNode) : 0,
      });
    } else {
      report = calculateLifeCycleFromBirthDate(date);
    }

    return NextResponse.json({
      success: true,
      data: {
        birthDate: date.toISOString().split('T')[0],
        currentAge: Math.floor(report.currentAge),
        ageDecimal: parseFloat(report.currentAge.toFixed(2)),
        consciousness: {
          structure: report.currentGebserStructure.name,
          symbol: report.currentGebserStructure.symbol,
          description: report.currentGebserStructure.description,
        },
        saturnCycle: {
          currentCycle: report.saturnCycle.currentCycleNumber,
          progress: parseFloat((report.saturnCycle.phaseProgress * 100).toFixed(1)),
          nextReturn: report.saturnCycle.nextReturn
            ? {
                date: report.saturnCycle.nextReturn.exactDate?.toISOString().split('T')[0],
                age: parseFloat(report.saturnCycle.nextReturn.ageAtEvent.toFixed(1)),
                yearsAway: parseFloat((report.saturnCycle.nextReturn.ageAtEvent - report.currentAge).toFixed(1)),
                isActive: report.saturnCycle.nextReturn.isActive,
                description: report.saturnCycle.nextReturn.archetypeDescription,
              }
            : null,
        },
        uranusOpposition: {
          date: report.uranusOpposition.date?.toISOString().split('T')[0],
          age: parseFloat(report.uranusOpposition.ageAtEvent.toFixed(1)),
          progress: parseFloat((report.uranusOpposition.phase * 100).toFixed(1)),
          isActive: report.uranusOpposition.isActive,
        },
        chironReturn: {
          date: report.chironReturn.date?.toISOString().split('T')[0],
          age: parseFloat(report.chironReturn.ageAtEvent.toFixed(1)),
          progress: parseFloat((report.chironReturn.phase * 100).toFixed(1)),
        },
        upcomingMarkers: report.upcomingMarkers.map((m) => ({
          name: m.name,
          type: m.type,
          body: m.planetaryBody,
          date: m.exactDate?.toISOString().split('T')[0],
          age: parseFloat(m.ageAtEvent.toFixed(1)),
          yearsAway: parseFloat((m.ageAtEvent - report.currentAge).toFixed(1)),
          isActive: m.isActive,
          description: m.archetypeDescription,
        })),
        insight: report.currentPhaseInsight,
      },
    });
  } catch (error) {
    console.error('[life-cycles] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate life cycles' },
      { status: 500 }
    );
  }
}
