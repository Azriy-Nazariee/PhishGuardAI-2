import jsPDF from "jspdf";

export function generatePDF(report, fileName = `PhishGuard_Report_${report.id}.pdf`) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2;
  const lineHeight = 18;
  let y = 100;

  const logo = new window.Image();
  logo.src = "/logo.png";

  // Page break helper
  function checkPageSpace(yPos, neededSpace) {
    if (yPos + neededSpace > pageHeight - 60) {
      doc.addPage();
      return 60;
    }
    return yPos;
  }

  logo.onload = () => {
    // HEADER
    doc.setFillColor("#333652");
    doc.rect(0, 0, pageWidth, 80, "F");
    doc.addImage(logo, "PNG", marginX, 15, 50, 50);
    doc.setFontSize(24).setFont("helvetica", "bold").setTextColor("#fff");
    doc.text("PhishGuard AI", marginX + 70, 38);
    doc.setFontSize(14).setFont("helvetica", "normal");
    doc.text("Email Analysis Report", marginX + 70, 62);

    // FOOTER
    doc.setFillColor("#e7a92f");
    doc.rect(0, pageHeight - 40, pageWidth, 40, "F");
    doc.setFontSize(10).setTextColor("#333652");
    doc.text("© PhishGuard AI 2025 | All Rights Reserved", marginX, pageHeight - 18);

    y += 10;
    drawDivider(doc, y, pageWidth, marginX);
    y += 20;

    // METADATA Section Heading
    doc.setFontSize(14).setFont("helvetica", "bold").setTextColor("#0f61a5");
    doc.text("METADATA", marginX, y);
    y += lineHeight;

    // METADATA (bold keys + normal values, aligned)
    const metadata = [
      ["Report ID:", report.id],
      ["Date Analysed:", new Date(report.date).toLocaleString()],
      ["Email Title:", report.title],
      ["Sender:", report.sender],
    ];

    doc.setFontSize(12).setTextColor("#333652");
    metadata.forEach(([key, value]) => {
      y = checkPageSpace(y, lineHeight);
      doc.setFont("helvetica", "bold");
      doc.text(key, marginX, y);
      const keyWidth = doc.getTextWidth(key);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), marginX + keyWidth + 8, y);
      y += lineHeight;
    });

    y += 6;
    drawDivider(doc, y, pageWidth, marginX);
    y += 18;

    // ANALYSIS RESULT Heading
    doc.setFontSize(14).setFont("helvetica", "bold").setTextColor("#0f61a5");
    doc.text("ANALYSIS RESULT", marginX, y);
    y += lineHeight;

    // Prediction label (black bold) + colored value
    const predictionColor = report.isPhishing ? "#d32f2f" : "#388e3c";
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor("#000");
    doc.text("Prediction:", marginX, y);
    const predKeyWidth = doc.getTextWidth("Prediction: ");
    doc.setFont("helvetica", "normal").setTextColor(predictionColor);
    doc.text(report.isPhishing ? "Phishing Email" : "Legitimate Email", marginX + predKeyWidth + 8, y);
    y += lineHeight;

    // Risk Score (standard style, not boxed)
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor("#000");
    doc.text("Risk Score:", marginX, y);
    const riskKeyWidth = doc.getTextWidth("Risk Score: ");
    doc.setFont("helvetica", "normal").setTextColor(predictionColor);
    doc.text(`${report.riskScore}% (${report.riskLevel})`, marginX + riskKeyWidth + 8, y);
    y += lineHeight;

    // Recommendation
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor("#333652");
    doc.text("Recommendation:", marginX, y);
    y += 16;

    // Render recommendation as a bulleted list (ul)
    doc.setFont("helvetica", "normal").setFontSize(11).setTextColor("#333652");
    let recommendations = [];
    if (Array.isArray(report.suggestion)) {
      recommendations = report.suggestion;
    } else if (typeof report.suggestion === "string") {
      // Split by newlines or semicolons for multiple recommendations, or just use as single item
      recommendations = report.suggestion.split(/\n|;/).map(s => s.trim()).filter(Boolean);
    }
    if (recommendations.length > 0) {
      recommendations.forEach(rec => {
        y = checkPageSpace(y, 14);
        doc.text("• " + rec, marginX + 12, y);
        y += 14;
      });
    } else {
      doc.text("None", marginX + 12, y);
      y += 14;
    }

    y += 10;
    drawDivider(doc, y, pageWidth, marginX);
    y += 20;

    // DETECTED FEATURES Heading
    doc.setFontSize(14).setFont("helvetica", "bold").setTextColor("#0f61a5");
    doc.text("DETECTED FEATURES", marginX, y);
    y += lineHeight;

    // URLs section heading
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor("#333652");
    doc.text("URLs:", marginX, y);
    y += 20;

    // URLs as black bulleted list
    if (report.urls?.length) {
      doc.setFont("helvetica", "normal").setFontSize(11).setTextColor("#000");
      report.urls.forEach(url => {
        const urlLines = doc.splitTextToSize(url, contentWidth - 40);
        urlLines.forEach((line, idx) => {
          y = checkPageSpace(y, 14);
          const bullet = idx === 0 ? "• " : "  ";
          doc.text(bullet + line, marginX + 24, y);
          y += 14;
        });
        y += 4;
      });
    } else {
      doc.setFont("helvetica", "normal").setFontSize(11).setTextColor("#888");
      doc.text("None", marginX + 24, y);
      y += lineHeight;
    }

    // Flagged Keywords section heading
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor("#333652");
    doc.text("Flagged Keywords:", marginX, y);
    y += 20;

    // Flagged Keywords as black bulleted list
    if (report.flaggedKeywords?.length) {
      doc.setFont("helvetica", "normal").setFontSize(11).setTextColor("#000");
      report.flaggedKeywords.forEach(keyword => {
        y = checkPageSpace(y, 14);
        doc.text("• " + keyword, marginX + 24, y);
        y += 14;
      });
    } else {
      doc.setFont("helvetica", "normal").setFontSize(11).setTextColor("#888");
      doc.text("None", marginX + 24, y);
      y += lineHeight;
    }

    doc.save(fileName);
  };

  logo.onerror = () => {
    generatePDFWithoutLogo(report, fileName);
  };
}

function drawDivider(doc, y, pageWidth, marginX) {
  doc.setDrawColor("#e7a92f").setLineWidth(0.8);
  doc.line(marginX, y, pageWidth - marginX, y);
}
