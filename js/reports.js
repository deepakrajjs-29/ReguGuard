/**
 * ReguGuard AI - Reports Module
 * Generates and manages compliance reports with PDF export via jsPDF.
 */

const Reports = (() => {
  let reportHistory = [];

  /**
   * Initialize reports page
   */
  function init() {
    _loadReportHistory();
    _renderReportHistory();
  }

  /**
   * Generate a compliance report from analysis results
   */
  function generateReport(analysisResults, companyName = 'Organization') {
    const report = {
      id: 'RPT-' + Date.now().toString(36).toUpperCase(),
      title: `Compliance Assessment Report — ${companyName}`,
      generatedAt: new Date().toISOString(),
      companyName,
      score: analysisResults.score,
      riskLevel: analysisResults.riskLevel,
      violations: analysisResults.violations,
      warnings: analysisResults.warnings,
      compliant: analysisResults.compliant,
      totalChecks: analysisResults.totalChecks,
      results: analysisResults.results,
      summary: analysisResults.summary
    };

    reportHistory.unshift(report);
    _saveReportHistory();
    return report;
  }

  /**
   * Download report as PDF using jsPDF
   */
  function downloadPDF(report) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // ---- Header ----
    doc.setFillColor(15, 15, 26);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(241, 245, 249);
    doc.text('ReguGuard AI', margin, y + 12);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Regulatory Compliance Assessment Report', margin, y + 22);

    doc.setFontSize(9);
    doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, margin, y + 32);
    doc.text(`Report ID: ${report.id}`, pageWidth - margin - 60, y + 32);

    y = 60;

    // ---- Executive Summary ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 58);
    doc.text('Executive Summary', margin, y);
    y += 8;

    doc.setDrawColor(14,165,233);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 40, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 80);

    const summaryLines = doc.splitTextToSize(report.summary, contentWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 10;

    // ---- Score & Metrics Box ----
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(margin, y, contentWidth, 40, 3, 3, 'F');

    const metrics = [
      { label: 'Compliance Score', value: `${report.score}/100`, x: margin + 15 },
      { label: 'Risk Level', value: report.riskLevel.level, x: margin + 55 },
      { label: 'Violations', value: String(report.violations), x: margin + 95 },
      { label: 'Warnings', value: String(report.warnings), x: margin + 125 },
      { label: 'Compliant', value: String(report.compliant), x: margin + 155 }
    ];

    metrics.forEach(m => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(m.label, m.x, y + 14);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 58);
      doc.text(m.value, m.x, y + 28);
    });

    y += 52;

    // ---- Detailed Findings ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 58);
    doc.text('Detailed Findings', margin, y);
    y += 8;
    doc.setDrawColor(14,165,233);
    doc.line(margin, y, margin + 40, y);
    y += 10;

    if (report.results && report.results.length > 0) {
      for (const result of report.results) {
        // Check for page break
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        // Status color
        const statusColors = {
          violation: [239, 68, 68],
          warning: [245, 158, 11],
          compliant: [16, 185, 129]
        };
        const statusLabels = {
          violation: 'VIOLATION',
          warning: 'WARNING',
          compliant: 'COMPLIANT'
        };

        const color = statusColors[result.status] || statusColors.warning;
        
        // Status badge
        doc.setFillColor(...color);
        doc.roundedRect(margin, y, 22, 6, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(255, 255, 255);
        doc.text(statusLabels[result.status], margin + 2, y + 4.5);

        // Severity badge
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);
        doc.text(`Severity: ${result.severity.toUpperCase()}`, margin + 26, y + 4.5);

        y += 10;

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 58);
        doc.text(`${result.category}: ${result.title}`, margin, y);
        y += 6;

        // Explanation (truncated for PDF)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const cleanExplanation = result.explanation.replace(/[🚨❌⚠️✅🔴🟡🟢]/g, '').trim();
        const expLines = doc.splitTextToSize(cleanExplanation, contentWidth);
        const maxLines = Math.min(expLines.length, 4);
        doc.text(expLines.slice(0, maxLines), margin, y);
        y += maxLines * 4.5 + 3;

        // Recommendation
        if (result.recommendation) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(14,165,233);
          const recLines = doc.splitTextToSize(`Recommendation: ${result.recommendation}`, contentWidth);
          doc.text(recLines.slice(0, 3), margin, y);
          y += Math.min(recLines.length, 3) * 4 + 3;
        }

        // Separator
        doc.setDrawColor(230, 230, 240);
        doc.setLineWidth(0.2);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      }
    }

    // ---- Footer ----
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`ReguGuard AI — Confidential`, margin, 290);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, 290);
    }

    // Save
    const filename = `ReguGuard_Report_${report.id}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);

    Toast.show('Report downloaded successfully!', 'success');
    return filename;
  }

  /**
   * Render report history list
   */
  function _renderReportHistory() {
    const container = document.getElementById('report-history');
    if (!container) return;

    if (reportHistory.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:48px;color:#64748b">
          <div style="font-size:48px;margin-bottom:16px">📋</div>
          <p style="font-size:14px;margin-bottom:4px">No reports generated yet</p>
          <p style="font-size:12px">Run a compliance analysis to generate your first report</p>
        </div>
      `;
      return;
    }

    container.innerHTML = reportHistory.map((report, i) => {
      const date = new Date(report.generatedAt);
      const riskBadge = {
        'Low': 'badge-success',
        'Medium': 'badge-warning',
        'High': 'badge-danger',
        'Critical': 'badge-danger'
      }[report.riskLevel.level] || 'badge-info';

      return `
        <div class="report-row" style="animation: fadeUp 0.4s ease-out ${i * 0.08}s both">
          <div class="report-info">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
              <span style="font-size:14px;font-weight:600;color:#f1f5f9">${report.id}</span>
              <span class="badge ${riskBadge}">${report.riskLevel.level} Risk</span>
            </div>
            <p style="font-size:12px;color:#64748b">${report.companyName} · ${date.toLocaleDateString()} ${date.toLocaleTimeString()}</p>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="text-align:right">
              <div style="font-size:20px;font-weight:700;color:#f1f5f9">${report.score}<span style="font-size:12px;color:#64748b">%</span></div>
              <div style="font-size:11px;color:#64748b">${report.violations} violations</div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="Reports.downloadPDF(Reports.getReport(${i}))">
              📄 PDF
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function getReport(index) {
    return reportHistory[index];
  }

  function _saveReportHistory() {
    try {
      localStorage.setItem('reguguard_reports', JSON.stringify(reportHistory.slice(0, 20)));
    } catch (e) { /* quota exceeded */ }
  }

  function _loadReportHistory() {
    try {
      const saved = localStorage.getItem('reguguard_reports');
      if (saved) reportHistory = JSON.parse(saved);
    } catch (e) { reportHistory = []; }
  }

  return { init, generateReport, downloadPDF, getReport };
})();
