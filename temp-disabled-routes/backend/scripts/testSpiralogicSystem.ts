import { spiralogicAstrologyService } from "../src/services/spiralogicAstrologyService";
import { spiralogicReportPdfService } from "../src/services/spiralogicReportPdfService";

/**
 * Test script for the Spiralogic Report Generator System
 */
async function testSpiralogicSystem() {
  console.log("🔮 Testing Spiralogic Report Generator System...\n");

  try {
    // Test birth data
    const testBirthData = {
      date: new Date("1990-06-15"),
      time: "14:30",
      location: {
        lat: 37.7749,
        lng: -122.4194,
        timezone: "America/Los_Angeles",
        placeName: "San Francisco, CA",
      },
    };

    console.log("1. Testing Birth Chart Calculation...");
    const birthChart =
      await spiralogicAstrologyService.calculatePreciseBirthChart(
        testBirthData,
      );
    console.log("✅ Birth chart calculated successfully");
    console.log("   - Planets:", Array.from(birthChart.planets.keys()));
    console.log("   - Houses:", birthChart.houses.cusps.length, "house cusps");
    console.log("   - Aspects:", birthChart.aspects.length, "aspects found");

    console.log("\n2. Testing Spiralogic Phase Mapping...");
    const phaseMapping =
      spiralogicAstrologyService.mapToSpiralogicPhases(birthChart);
    console.log("✅ Phase mapping completed");
    console.log("   - Fire planets:", phaseMapping.fire.length);
    console.log("   - Water planets:", phaseMapping.water.length);
    console.log("   - Earth planets:", phaseMapping.earth.length);
    console.log("   - Air planets:", phaseMapping.air.length);

    console.log("\n3. Testing Report Generation...");
    const report = await spiralogicAstrologyService.generateSpiralogicReport(
      "test-user-id",
      "test-chart-id",
      birthChart,
      phaseMapping,
    );
    console.log("✅ Spiralogic report generated");
    console.log("   - Being Archetype:", report.beingArchetype);
    console.log("   - Becoming Archetype:", report.becomingArchetype);
    console.log(
      "   - Elemental Insights:",
      Object.keys(report.elementalInsights),
    );
    console.log(
      "   - Reflective Protocols:",
      report.reflectiveProtocols.length,
    );

    console.log("\n4. Testing PDF Generation...");
    const pdfBlob = await spiralogicReportPdfService.generateReport(
      report,
      testBirthData,
    );
    console.log("✅ PDF generated successfully");
    console.log("   - PDF size:", (pdfBlob.size / 1024).toFixed(2), "KB");

    console.log("\n5. Testing HTML Template Generation...");
    const htmlTemplate = spiralogicReportPdfService.generateHtmlTemplate(
      report,
      testBirthData,
    );
    console.log("✅ HTML template generated");
    console.log("   - Template length:", htmlTemplate.length, "characters");

    console.log("\n6. Testing Custom Branding...");
    const customStyle = {
      primaryColor: "#2D3748",
      secondaryColor: "#718096",
      accentColors: {
        fire: "#D69E2E",
        water: "#5B67CA",
        earth: "#38A169",
        air: "#4A5568",
        aether: "#9F7AEA",
      },
      fonts: {
        serif: "DM Serif Text",
        sansSerif: "Inter",
      },
      practitionerBranding: {
        businessName: "Test Practitioner",
        logoUrl: "https://example.com/logo.png",
        primaryColor: "#6B46C1",
        secondaryColor: "#9333EA",
      },
    };

    const customPdfService = new (
      await import("../src/services/spiralogicReportPdfService")
    ).SpiralogicReportPdfService(customStyle);
    const customPdf = await customPdfService.generateReport(
      report,
      testBirthData,
    );
    console.log("✅ Custom branded PDF generated");
    console.log(
      "   - Custom PDF size:",
      (customPdf.size / 1024).toFixed(2),
      "KB",
    );

    console.log("\n🎉 All tests passed! Spiralogic System is ready.\n");

    // Output sample report summary
    console.log("📋 Sample Report Summary:");
    console.log("════════════════════════════════════════");
    console.log(`Being Archetype: ${report.beingArchetype}`);
    console.log(`Becoming Archetype: ${report.becomingArchetype}`);
    console.log("\nElemental Strengths:");
    Object.entries(report.elementalInsights).forEach(([element, insight]) => {
      console.log(`  ${element.toUpperCase()}: ${insight.strength}%`);
    });
    console.log("\nKarmic Focus:");
    console.log(
      `  North Node: ${report.karmicAxis.northNode.evolutionary_direction}`,
    );
    console.log(
      `  South Node: ${report.karmicAxis.southNode.evolutionary_direction}`,
    );
    console.log("\nReflective Protocols:");
    report.reflectiveProtocols.forEach((protocol, index) => {
      console.log(`  ${index + 1}. ${protocol.name} (${protocol.element})`);
    });
    console.log("════════════════════════════════════════\n");

    return {
      success: true,
      report,
      pdfBlob,
      htmlTemplate,
    };
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("\nError details:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// API Endpoints Test
function generateApiTestCurls() {
  console.log("🔗 API Test Commands:");
  console.log("════════════════════════════════════════");

  console.log("\n1. Generate Spiralogic Report:");
  console.log(
    "curl -X POST http://localhost:3000/api/spiralogic-report/generate \\",
  );
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
  console.log("  -d '{");
  console.log('    "date": "1990-06-15",');
  console.log('    "time": "14:30",');
  console.log('    "location": {');
  console.log('      "lat": 37.7749,');
  console.log('      "lng": -122.4194,');
  console.log('      "timezone": "America/Los_Angeles",');
  console.log('      "placeName": "San Francisco, CA"');
  console.log("    }");
  console.log("  }'");

  console.log("\n2. Get User Reports:");
  console.log(
    "curl -X GET http://localhost:3000/api/spiralogic-report/my-reports \\",
  );
  console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN"');

  console.log("\n3. Practitioner Dashboard:");
  console.log(
    "curl -X GET http://localhost:3000/api/practitioner/dashboard \\",
  );
  console.log('  -H "Authorization: Bearer PRACTITIONER_JWT_TOKEN"');

  console.log("\n4. Add Practitioner Client:");
  console.log("curl -X POST http://localhost:3000/api/practitioner/clients \\");
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -H "Authorization: Bearer PRACTITIONER_JWT_TOKEN" \\');
  console.log("  -d '{");
  console.log('    "email": "client@example.com",');
  console.log('    "name": "Test Client",');
  console.log('    "notes": "New client for astrology consultation"');
  console.log("  }'");

  console.log("\n5. Setup Retreat:");
  console.log("curl -X POST http://localhost:3000/api/retreat/setup \\");
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -H "Authorization: Bearer FACILITATOR_JWT_TOKEN" \\');
  console.log("  -d '{");
  console.log('    "name": "Sacred Circle Retreat",');
  console.log('    "participants": [');
  console.log('      {"name": "Alice", "email": "alice@example.com"},');
  console.log('      {"name": "Beth", "email": "beth@example.com"},');
  console.log('      {"name": "Clara", "email": "clara@example.com"},');
  console.log('      {"name": "Diana", "email": "diana@example.com"},');
  console.log('      {"name": "Eva", "email": "eva@example.com"},');
  console.log('      {"name": "Fiona", "email": "fiona@example.com"},');
  console.log('      {"name": "Grace", "email": "grace@example.com"}');
  console.log("    ]");
  console.log("  }'");

  console.log("\n════════════════════════════════════════\n");
}

// Frontend Integration Guide
function generateFrontendGuide() {
  console.log("🎨 Frontend Integration Guide:");
  console.log("════════════════════════════════════════");

  console.log("\n1. Birth Data Form Component:");
  console.log(
    "   - Use the provided HTML form at /public/spiralogic-form.html",
  );
  console.log("   - Customize styling to match your design system");
  console.log("   - Integrate with your authentication system");

  console.log("\n2. Report Display Component:");
  console.log("   - Fetch report data from API endpoints");
  console.log("   - Display elemental insights with visual charts");
  console.log("   - Provide PDF download functionality");

  console.log("\n3. Practitioner Dashboard:");
  console.log("   - Client management interface");
  console.log("   - Report generation for clients");
  console.log("   - Branding customization tools");

  console.log("\n4. Retreat Mode Interface:");
  console.log("   - Participant list with avatars");
  console.log("   - Individual report access");
  console.log("   - Journal entry functionality");
  console.log("   - State of being/becoming inputs");

  console.log("\n5. Recommended UI Libraries:");
  console.log("   - React/Next.js or Vue/Nuxt.js");
  console.log("   - Chart.js or D3.js for elemental visualizations");
  console.log("   - Tailwind CSS for Soul Lab styling");
  console.log("   - React Hook Form or Formik for form handling");

  console.log("\n════════════════════════════════════════\n");
}

// Production Deployment Checklist
function generateDeploymentChecklist() {
  console.log("🚀 Production Deployment Checklist:");
  console.log("════════════════════════════════════════");

  console.log("\n✅ Prerequisites:");
  console.log("   [ ] Install Swiss Ephemeris: npm install swisseph");
  console.log("   [ ] Install PDF libraries: npm install jspdf html2canvas");
  console.log("   [ ] Configure Supabase project and database");
  console.log(
    "   [ ] Run migration: supabase/migrations/20250206_create_spiralogic_reports.sql",
  );
  console.log("   [ ] Set up Supabase Storage bucket for PDF files");
  console.log("   [ ] Configure CORS for file uploads");

  console.log("\n✅ Environment Variables:");
  console.log("   [ ] SUPABASE_URL");
  console.log("   [ ] SUPABASE_ANON_KEY");
  console.log("   [ ] SUPABASE_SERVICE_ROLE_KEY");
  console.log("   [ ] JWT_SECRET");
  console.log("   [ ] MAPBOX_TOKEN (for location search)");

  console.log("\n✅ Security Configuration:");
  console.log("   [ ] Enable RLS policies on all tables");
  console.log("   [ ] Configure user roles (user, practitioner, admin)");
  console.log("   [ ] Set up API rate limiting");
  console.log("   [ ] Enable HTTPS/SSL");

  console.log("\n✅ Performance Optimization:");
  console.log("   [ ] Enable PDF caching");
  console.log("   [ ] Configure CDN for static assets");
  console.log("   [ ] Set up database indexing");
  console.log("   [ ] Implement background job processing");

  console.log("\n✅ Monitoring & Analytics:");
  console.log("   [ ] Set up error tracking (Sentry)");
  console.log("   [ ] Configure performance monitoring");
  console.log("   [ ] Implement usage analytics");
  console.log("   [ ] Set up backup schedules");

  console.log("\n════════════════════════════════════════\n");
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSpiralogicSystem().then((result) => {
    if (result.success) {
      generateApiTestCurls();
      generateFrontendGuide();
      generateDeploymentChecklist();
    }
  });
}

export { testSpiralogicSystem };
