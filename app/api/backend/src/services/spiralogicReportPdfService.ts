import jsPDF from "jspdf";
import { SpiralogicReport } from "./spiralogicAstrologyService";

export interface SoulLabStyle {
  primaryColor: string;
  secondaryColor: string;
  accentColors: {
    fire: string;
    water: string;
    earth: string;
    air: string;
    aether: string;
  };
  fonts: {
    serif: string;
    sansSerif: string;
  };
  practitionerBranding?: {
    businessName?: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

const defaultSoulLabStyle: SoulLabStyle = {
  primaryColor: "#2D3748", // Charcoal
  secondaryColor: "#718096", // Slate gray
  accentColors: {
    fire: "#D69E2E", // Muted gold
    water: "#5B67CA", // Soft indigo
    earth: "#38A169", // Moss green
    air: "#4A5568", // Slate blue
    aether: "#9F7AEA", // Soft purple
  },
  fonts: {
    serif: "DM Serif Text",
    sansSerif: "Inter",
  },
};

export class SpiralogicReportPdfService {
  private style: SoulLabStyle;

  constructor(style: SoulLabStyle = defaultSoulLabStyle) {
    this.style = style;
  }

  /**
   * Generate a beautiful PDF report from Spiralogic data
   */
  async generateReport(
    report: SpiralogicReport,
    birthData: any,
  ): Promise<Blob> {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set up fonts
    doc.setFont("helvetica"); // Default until custom fonts loaded

    // Page 1: Cover Page
    this.createCoverPage(doc, report, birthData);

    // Page 2: Personal Overview
    doc.addPage();
    this.createPersonalOverviewPage(doc, report);

    // Page 3: Elemental Analysis
    doc.addPage();
    this.createElementalAnalysisPage(doc, report);

    // Page 4: Karmic Axis
    doc.addPage();
    this.createKarmicAxisPage(doc, report);

    // Page 5-6: Reflective Protocols
    doc.addPage();
    this.createReflectiveProtocolsPage(doc, report);

    // Page 7: Chart Visualization (placeholder for now)
    doc.addPage();
    this.createChartVisualizationPage(doc, report, birthData);

    // Return as blob
    return doc.output("blob");
  }

  private createCoverPage(
    doc: jsPDF,
    report: SpiralogicReport,
    birthData: any,
  ) {
    // Background gradient effect (simulated with rectangles)
    this.addGradientBackground(doc, 0, 0, 210, 297);

    // Logo/Branding area
    const branding = this.style.practitionerBranding;
    if (branding?.businessName) {
      doc.setFontSize(14);
      doc.setTextColor(this.style.primaryColor);
      doc.text(branding.businessName, 105, 30, { align: "center" });
    } else {
      doc.setFontSize(14);
      doc.setTextColor(this.style.primaryColor);
      doc.text("Soullab", 105, 30, { align: "center" });
    }

    // Title
    doc.setFontSize(32);
    doc.setTextColor(this.style.primaryColor);
    doc.text("Spiralogic", 105, 80, { align: "center" });
    doc.setFontSize(24);
    doc.text("Evolutionary Report", 105, 95, { align: "center" });

    // Birth info
    doc.setFontSize(16);
    doc.setTextColor(this.style.secondaryColor);
    const birthDate = new Date(birthData.date);
    doc.text(
      `Born ${birthDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      105,
      120,
      { align: "center" },
    );

    doc.setFontSize(14);
    doc.text(
      `${birthData.time} • ${birthData.location.placeName || "Location"}`,
      105,
      130,
      { align: "center" },
    );

    // Elemental symbols decoration
    this.drawElementalSymbols(doc, 105, 160);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(this.style.secondaryColor);
    doc.text(`Generated ${new Date().toLocaleDateString()}`, 105, 280, {
      align: "center",
    });
  }

  private createPersonalOverviewPage(doc: jsPDF, report: SpiralogicReport) {
    // Header
    this.addPageHeader(doc, "Personal Overview");

    // Being & Becoming Archetypes
    doc.setFontSize(18);
    doc.setTextColor(this.style.primaryColor);
    doc.text("Your Sacred Journey", 20, 50);

    // Being Archetype
    doc.setFontSize(14);
    doc.setTextColor(this.style.accentColors.fire);
    doc.text("State of Being:", 20, 65);
    doc.setFontSize(16);
    doc.setTextColor(this.style.primaryColor);
    doc.text(report.beingArchetype, 20, 75);

    // Becoming Archetype
    doc.setFontSize(14);
    doc.setTextColor(this.style.accentColors.water);
    doc.text("State of Becoming:", 20, 90);
    doc.setFontSize(16);
    doc.setTextColor(this.style.primaryColor);
    doc.text(report.becomingArchetype, 20, 100);

    // Personal Overview Text
    doc.setFontSize(12);
    doc.setTextColor(this.style.primaryColor);
    const overviewLines = doc.splitTextToSize(report.personalOverview, 170);
    doc.text(overviewLines, 20, 120);

    // Elemental Dominance Chart
    this.drawElementalDominanceChart(doc, 20, 180, report.elementalInsights);
  }

  private createElementalAnalysisPage(doc: jsPDF, report: SpiralogicReport) {
    this.addPageHeader(doc, "Elemental Wisdom");

    let yPos = 50;
    const elements = ["fire", "water", "earth", "air"] as const;

    elements.forEach((element) => {
      const insight = report.elementalInsights[element];

      // Element header with color accent
      doc.setDrawColor(this.style.accentColors[element]);
      doc.setLineWidth(2);
      doc.line(20, yPos - 5, 25, yPos - 5);

      doc.setFontSize(16);
      doc.setTextColor(this.style.accentColors[element]);
      doc.text(`${insight.element} (${insight.strength}%)`, 30, yPos);

      // Interpretation
      doc.setFontSize(10);
      doc.setTextColor(this.style.primaryColor);
      const interpretLines = doc.splitTextToSize(insight.interpretation, 160);
      doc.text(interpretLines, 30, yPos + 8);

      yPos += 8 + interpretLines.length * 4 + 10;

      // Only show first two elements per page
      if (element === "water") {
        doc.addPage();
        this.addPageHeader(doc, "Elemental Wisdom (continued)");
        yPos = 50;
      }
    });
  }

  private createKarmicAxisPage(doc: jsPDF, report: SpiralogicReport) {
    this.addPageHeader(doc, "Karmic Evolution");

    // North Node
    doc.setFontSize(14);
    doc.setTextColor(this.style.accentColors.aether);
    doc.text("North Node - Your Evolutionary Direction", 20, 50);

    doc.setFontSize(12);
    doc.setTextColor(this.style.primaryColor);
    const nnLines = doc.splitTextToSize(
      report.karmicAxis.northNode.interpretation,
      170,
    );
    doc.text(nnLines, 20, 60);

    // South Node
    doc.setFontSize(14);
    doc.setTextColor(this.style.accentColors.earth);
    doc.text("South Node - Your Innate Gifts", 20, 90);

    doc.setFontSize(12);
    const snLines = doc.splitTextToSize(
      report.karmicAxis.southNode.interpretation,
      170,
    );
    doc.text(snLines, 20, 100);

    // Saturn
    doc.setFontSize(14);
    doc.setTextColor(this.style.accentColors.earth);
    doc.text("Saturn - Your Path of Mastery", 20, 130);

    doc.setFontSize(12);
    const saturnLines = doc.splitTextToSize(
      report.karmicAxis.saturn.interpretation,
      170,
    );
    doc.text(saturnLines, 20, 140);

    // Pluto
    doc.setFontSize(14);
    doc.setTextColor(this.style.accentColors.water);
    doc.text("Pluto - Your Deepest Transformation", 20, 170);

    doc.setFontSize(12);
    const plutoLines = doc.splitTextToSize(
      report.karmicAxis.pluto.interpretation,
      170,
    );
    doc.text(plutoLines, 20, 180);
  }

  private createReflectiveProtocolsPage(doc: jsPDF, report: SpiralogicReport) {
    this.addPageHeader(doc, "Sacred Practices");

    let yPos = 50;

    report.reflectiveProtocols.forEach((protocol, index) => {
      // Protocol header
      doc.setFontSize(14);
      doc.setTextColor(
        this.style.accentColors[
          protocol.element.toLowerCase() as keyof typeof this.style.accentColors
        ] || this.style.primaryColor,
      );
      doc.text(protocol.name, 20, yPos);

      // Description
      doc.setFontSize(10);
      doc.setTextColor(this.style.secondaryColor);
      const descLines = doc.splitTextToSize(protocol.description, 170);
      doc.text(descLines, 20, yPos + 8);

      yPos += 8 + descLines.length * 4 + 5;

      // Steps
      doc.setFontSize(10);
      doc.setTextColor(this.style.primaryColor);
      protocol.steps.forEach((step, stepIndex) => {
        doc.text(`${stepIndex + 1}. ${step}`, 25, yPos);
        yPos += 5;
      });

      // Timing
      doc.setFontSize(10);
      doc.setTextColor(this.style.secondaryColor);
      doc.text(`Best practiced: ${protocol.timing}`, 20, yPos + 5);

      yPos += 15;

      // Add new page if needed
      if (yPos > 250 && index < report.reflectiveProtocols.length - 1) {
        doc.addPage();
        this.addPageHeader(doc, "Sacred Practices (continued)");
        yPos = 50;
      }
    });
  }

  private createChartVisualizationPage(
    doc: jsPDF,
    report: SpiralogicReport,
    birthData: any,
  ) {
    this.addPageHeader(doc, "Birth Chart Mandala");

    // Center of the chart
    const centerX = 105;
    const centerY = 150;
    const radius = 70;

    // Draw zodiac wheel (simplified)
    doc.setDrawColor(this.style.primaryColor);
    doc.setLineWidth(0.5);
    doc.circle(centerX, centerY, radius);

    // Draw house divisions
    for (let i = 0; i < 12; i++) {
      const angle = ((i * 30 - 90) * Math.PI) / 180;
      const x2 = centerX + radius * Math.cos(angle);
      const y2 = centerY + radius * Math.sin(angle);
      doc.line(centerX, centerY, x2, y2);
    }

    // Draw inner circles for aspects
    doc.circle(centerX, centerY, radius * 0.7);
    doc.circle(centerX, centerY, radius * 0.4);

    // Add zodiac signs (simplified)
    const signs = [
      "♈",
      "♉",
      "♊",
      "♋",
      "♌",
      "♍",
      "♎",
      "♏",
      "♐",
      "♑",
      "♒",
      "♓",
    ];
    doc.setFontSize(12);
    for (let i = 0; i < 12; i++) {
      const angle = ((i * 30 - 75) * Math.PI) / 180;
      const x = centerX + (radius + 10) * Math.cos(angle);
      const y = centerY + (radius + 10) * Math.sin(angle);
      doc.text(signs[i], x, y, { align: "center" });
    }

    // Note about full chart
    doc.setFontSize(10);
    doc.setTextColor(this.style.secondaryColor);
    doc.text(
      "For detailed chart analysis, consult your practitioner",
      105,
      240,
      { align: "center" },
    );
  }

  // Helper methods

  private addPageHeader(doc: jsPDF, title: string) {
    // Header line
    doc.setDrawColor(this.style.secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    // Title
    doc.setFontSize(20);
    doc.setTextColor(this.style.primaryColor);
    doc.text(title, 105, 20, { align: "center" });

    // Page number
    doc.setFontSize(10);
    doc.setTextColor(this.style.secondaryColor);
    doc.text(`${doc.getCurrentPageInfo().pageNumber}`, 190, 285, {
      align: "right",
    });
  }

  private addGradientBackground(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    // Simulate gradient with multiple rectangles
    const steps = 20;
    const stepHeight = height / steps;

    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const gray = 253 - ratio * 20; // From #fdfdfd to #eaeaea
      doc.setFillColor(gray, gray, gray);
      doc.rect(x, y + i * stepHeight, width, stepHeight, "F");
    }
  }

  private drawElementalSymbols(doc: jsPDF, centerX: number, centerY: number) {
    const symbols = {
      fire: "△",
      water: "▽",
      earth: "□",
      air: "○",
    };

    const positions = [
      { x: -40, y: 0 }, // left
      { x: 0, y: -40 }, // top
      { x: 40, y: 0 }, // right
      { x: 0, y: 40 }, // bottom
    ];

    Object.entries(symbols).forEach(([element, symbol], index) => {
      const pos = positions[index];
      doc.setTextColor(
        this.style.accentColors[
          element as keyof typeof this.style.accentColors
        ],
      );
      doc.setFontSize(24);
      doc.text(symbol, centerX + pos.x, centerY + pos.y, { align: "center" });
    });
  }

  private drawElementalDominanceChart(
    doc: jsPDF,
    x: number,
    y: number,
    insights: any,
  ) {
    const barWidth = 30;
    const maxHeight = 50;
    const spacing = 35;

    Object.entries(insights).forEach(
      ([element, insight]: [string, any], index) => {
        const barHeight = (insight.strength / 100) * maxHeight;
        const barX = x + index * spacing;
        const barY = y + maxHeight - barHeight;

        // Draw bar
        doc.setFillColor(
          this.style.accentColors[
            element as keyof typeof this.style.accentColors
          ],
        );
        doc.rect(barX, barY, barWidth, barHeight, "F");

        // Element label
        doc.setFontSize(10);
        doc.setTextColor(this.style.primaryColor);
        doc.text(
          element.toUpperCase(),
          barX + barWidth / 2,
          y + maxHeight + 10,
          { align: "center" },
        );

        // Percentage
        doc.setFontSize(8);
        doc.text(`${insight.strength}%`, barX + barWidth / 2, barY - 3, {
          align: "center",
        });
      },
    );
  }

  /**
   * Generate HTML template for advanced PDF generation
   */
  generateHtmlTemplate(report: SpiralogicReport, birthData: any): string {
    const style = this.style;
    const branding = style.practitionerBranding;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Text&family=Inter:wght@300;400;600&display=swap');

    body {
      font-family: 'Inter', sans-serif;
      color: ${style.primaryColor};
      background: radial-gradient(#fdfdfd, #eaeaea);
      margin: 0;
      padding: 0;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      page-break-after: always;
    }

    h1, h2, h3 {
      font-family: 'DM Serif Text', serif;
    }

    .cover-page {
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 257mm;
    }

    .elemental-symbol {
      display: inline-block;
      width: 60px;
      height: 60px;
      margin: 10px;
      font-size: 36px;
      line-height: 60px;
      text-align: center;
    }

    .fire { color: ${style.accentColors.fire}; }
    .water { color: ${style.accentColors.water}; }
    .earth { color: ${style.accentColors.earth}; }
    .air { color: ${style.accentColors.air}; }
    .aether { color: ${style.accentColors.aether}; }

    .archetype-box {
      background: #f7fafc;
      border-left: 4px solid;
      padding: 20px;
      margin: 20px 0;
    }

    .being-box { border-color: ${style.accentColors.fire}; }
    .becoming-box { border-color: ${style.accentColors.water}; }

    .elemental-insight {
      margin: 30px 0;
      padding: 20px;
      border-radius: 8px;
      background: #f7fafc;
    }

    .protocol {
      background: #fefefe;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }

    .protocol h3 {
      margin-top: 0;
    }

    .protocol-steps {
      list-style: none;
      padding-left: 0;
    }

    .protocol-steps li {
      padding: 8px 0;
      padding-left: 30px;
      position: relative;
    }

    .protocol-steps li:before {
      content: "✦";
      position: absolute;
      left: 0;
      color: ${style.accentColors.aether};
    }

    @media print {
      body { background: white; }
      .page { box-shadow: none; }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="page cover-page">
    ${branding?.businessName ? `<h3>${branding.businessName}</h3>` : "<h3>Soullab</h3>"}
    <h1 style="font-size: 48px; margin: 20px 0;">Spiralogic</h1>
    <h2 style="font-size: 32px; margin: 10px 0;">Evolutionary Report</h2>

    <div style="margin: 40px 0;">
      <p style="font-size: 18px;">Born ${new Date(
        birthData.date,
      ).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</p>
      <p>${birthData.time} • ${birthData.location.placeName || "Location"}</p>
    </div>

    <div class="elemental-symbols">
      <span class="elemental-symbol fire">△</span>
      <span class="elemental-symbol water">▽</span>
      <span class="elemental-symbol earth">□</span>
      <span class="elemental-symbol air">○</span>
    </div>

    <p style="position: absolute; bottom: 40px; font-size: 12px; color: ${style.secondaryColor};">
      Generated ${new Date().toLocaleDateString()}
    </p>
  </div>

  <!-- Personal Overview Page -->
  <div class="page">
    <h2>Personal Overview</h2>

    <div class="archetype-box being-box">
      <h3 class="fire">State of Being</h3>
      <p style="font-size: 20px; margin: 0;">${report.beingArchetype}</p>
    </div>

    <div class="archetype-box becoming-box">
      <h3 class="water">State of Becoming</h3>
      <p style="font-size: 20px; margin: 0;">${report.becomingArchetype}</p>
    </div>

    <div style="margin: 40px 0;">
      <p style="line-height: 1.8;">${report.personalOverview}</p>
    </div>
  </div>

  <!-- Elemental Analysis Pages -->
  ${Object.entries(report.elementalInsights)
    .map(
      ([element, insight]: [string, any]) => `
  <div class="page">
    <h2>Elemental Wisdom - ${insight.element}</h2>

    <div class="elemental-insight">
      <h3 class="${element}">${insight.element} (${insight.strength}%)</h3>
      <p>${insight.interpretation}</p>

      <h4>Gifts</h4>
      <ul>
        ${insight.gifts.map((gift: string) => `<li>${gift}</li>`).join("")}
      </ul>

      <h4>Challenges</h4>
      <ul>
        ${insight.challenges.map((challenge: string) => `<li>${challenge}</li>`).join("")}
      </ul>

      <h4>Practices</h4>
      <ul>
        ${insight.practices.map((practice: string) => `<li>${practice}</li>`).join("")}
      </ul>
    </div>
  </div>
  `,
    )
    .join("")}

  <!-- Karmic Axis Page -->
  <div class="page">
    <h2>Karmic Evolution</h2>

    <div style="margin: 30px 0;">
      <h3 class="aether">North Node - Your Evolutionary Direction</h3>
      <p>${report.karmicAxis.northNode.interpretation}</p>
      <p><strong>Key Lessons:</strong></p>
      <ul>
        ${report.karmicAxis.northNode.lessons.map((lesson: string) => `<li>${lesson}</li>`).join("")}
      </ul>
    </div>

    <div style="margin: 30px 0;">
      <h3 class="earth">South Node - Your Innate Gifts</h3>
      <p>${report.karmicAxis.southNode.interpretation}</p>
    </div>

    <div style="margin: 30px 0;">
      <h3 class="earth">Saturn - Your Path of Mastery</h3>
      <p>${report.karmicAxis.saturn.interpretation}</p>
    </div>

    <div style="margin: 30px 0;">
      <h3 class="water">Pluto - Your Deepest Transformation</h3>
      <p>${report.karmicAxis.pluto.interpretation}</p>
    </div>
  </div>

  <!-- Reflective Protocols Pages -->
  <div class="page">
    <h2>Sacred Practices</h2>

    ${report.reflectiveProtocols
      .map(
        (protocol) => `
    <div class="protocol">
      <h3 class="${protocol.element.toLowerCase()}">${protocol.name}</h3>
      <p style="font-style: italic; color: ${style.secondaryColor};">${protocol.description}</p>

      <h4>Steps:</h4>
      <ol class="protocol-steps">
        ${protocol.steps.map((step: string) => `<li>${step}</li>`).join("")}
      </ol>

      <p><strong>Best practiced:</strong> ${protocol.timing}</p>
      ${
        protocol.materials
          ? `
      <p><strong>Materials needed:</strong> ${protocol.materials.join(", ")}</p>
      `
          : ""
      }
    </div>
    `,
      )
      .join("")}
  </div>
</body>
</html>
    `;
  }
}

export const spiralogicReportPdfService = new SpiralogicReportPdfService();
