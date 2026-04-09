/**
 * ReguGuard AI - Dashboard Module
 * Handles dashboard rendering, charts, and real-time data.
 */

const Dashboard = (() => {
  let complianceTrendChart = null;
  let riskBreakdownChart = null;
  let categoryChart = null;

  // Simulated dashboard data
  const dashboardData = {
    complianceScore: 78,
    riskLevel: 'Medium',
    totalViolations: 12,
    policiesMonitored: 847,
    trendData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      scores: [65, 68, 71, 69, 73, 75, 72, 78, 80, 76, 82, 78]
    },
    riskData: {
      labels: ['Data Privacy', 'Financial', 'Legal', 'Cybersecurity', 'Healthcare', 'Environmental'],
      values: [35, 20, 18, 15, 7, 5]
    },
    recentActivity: [
      { type: 'violation', text: 'Data encryption gap detected in EU customer database', time: '2 hours ago', severity: 'critical' },
      { type: 'warning', text: 'Consent management audit pending for Q2 review', time: '5 hours ago', severity: 'high' },
      { type: 'compliant', text: 'AML monitoring system passed quarterly validation', time: '1 day ago', severity: 'low' },
      { type: 'warning', text: 'PCI DSS v4.0 migration deadline approaching', time: '2 days ago', severity: 'medium' },
      { type: 'violation', text: 'Cross-border data transfer lacks updated SCCs', time: '3 days ago', severity: 'high' },
      { type: 'compliant', text: 'Employee HIPAA training completion rate: 98%', time: '3 days ago', severity: 'low' }
    ],
    regulationUpdates: [
      { title: 'EU AI Act Final Guidelines Published', date: 'Apr 5, 2026', impact: 'High', region: 'EU' },
      { title: 'SEC Cybersecurity Disclosure Rules Update', date: 'Apr 3, 2026', impact: 'Medium', region: 'US' },
      { title: 'GDPR Enforcement Report Q1 2026', date: 'Apr 1, 2026', impact: 'High', region: 'EU' },
      { title: 'California Privacy Rights Act Amendment', date: 'Mar 28, 2026', impact: 'Medium', region: 'US' }
    ]
  };

  /**
   * Initialize dashboard
   */
  async function init() {
    _showSkeleton();
    
    // Simulate loading delay for real-time feel
    await _sleep(1200);
    
    _renderStatCards();
    _renderComplianceTrendChart();
    _renderRiskBreakdownChart();
    _renderCategoryChart();
    _renderRecentActivity();
    _renderRegulationUpdates();
    _renderRiskHeatmap();
    _startRealtimeAlerts();
  }

  /**
   * Show skeleton loading state
   */
  function _showSkeleton() {
    const statCards = document.querySelectorAll('.stat-card .stat-value');
    statCards.forEach(el => {
      el.textContent = '—';
      el.style.opacity = '0.3';
    });
  }

  /**
   * Render stat cards with animated counters
   */
  function _renderStatCards() {
    _animateCounter('compliance-score', dashboardData.complianceScore, '%');
    _animateCounter('total-violations', dashboardData.totalViolations);
    _animateCounter('policies-monitored', dashboardData.policiesMonitored);
    
    // Risk level badge
    const riskEl = document.getElementById('risk-level');
    if (riskEl) {
      riskEl.textContent = dashboardData.riskLevel;
      riskEl.style.opacity = '1';
    }

    // Compliance score ring
    _updateScoreRing(dashboardData.complianceScore);
  }

  /**
   * Animate a counter from 0 to target
   */
  function _animateCounter(elementId, target, suffix = '') {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    el.style.opacity = '1';
    let current = 0;
    const increment = target / 40;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.round(current) + suffix;
    }, 30);
  }

  /**
   * Update circular score ring
   */
  function _updateScoreRing(score) {
    const ring = document.getElementById('score-ring');
    if (!ring) return;
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (score / 100) * circumference;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;
  }

  /**
   * Compliance Trend Chart
   */
  function _renderComplianceTrendChart() {
    const ctx = document.getElementById('compliance-trend-chart');
    if (!ctx) return;

    if (complianceTrendChart) complianceTrendChart.destroy();

    complianceTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dashboardData.trendData.labels,
        datasets: [{
          label: 'Compliance Score',
          data: dashboardData.trendData.scores,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(14,165,233, 0.08)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#6366f1',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }]
      },
      options: _getChartOptions('Compliance Score (%)')
    });
  }

  /**
   * Risk Breakdown Doughnut Chart
   */
  function _renderRiskBreakdownChart() {
    const ctx = document.getElementById('risk-breakdown-chart');
    if (!ctx) return;

    if (riskBreakdownChart) riskBreakdownChart.destroy();

    riskBreakdownChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: dashboardData.riskData.labels,
        datasets: [{
          data: dashboardData.riskData.values,
          backgroundColor: [
            'rgba(14,165,233, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)'
          ],
          borderColor: 'rgba(10, 10, 15, 0.8)',
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              padding: 16,
              font: { size: 12, family: 'Inter' },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          }
        }
      }
    });
  }

  /**
   * Category distribution bar chart
   */
  function _renderCategoryChart() {
    const ctx = document.getElementById('category-chart');
    if (!ctx) return;

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Data Privacy', 'Cybersecurity', 'Financial', 'Legal', 'Healthcare', 'Environmental'],
        datasets: [
          {
            label: 'Compliant',
            data: [72, 85, 78, 82, 95, 90],
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderRadius: 4,
            barPercentage: 0.6
          },
          {
            label: 'Violations',
            data: [28, 15, 22, 18, 5, 10],
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderRadius: 4,
            barPercentage: 0.6
          }
        ]
      },
      options: {
        ..._getChartOptions('Percentage (%)'),
        scales: {
          ...(_getChartOptions('').scales || {}),
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } }
          },
          y: {
            stacked: true,
            max: 100,
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } }
          }
        }
      }
    });
  }

  /**
   * Recent Activity List
   */
  function _renderRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (!container) return;

    const icons = { violation: '❌', warning: '⚠️', compliant: '✅' };
    const badgeClass = { violation: 'badge-danger', warning: 'badge-warning', compliant: 'badge-success' };

    container.innerHTML = dashboardData.recentActivity.map((item, i) => `
      <div class="activity-item" style="animation: fadeUp 0.4s ease-out ${i * 0.1}s both">
        <div class="activity-icon">${icons[item.type]}</div>
        <div class="activity-content" style="flex:1;min-width:0">
          <p style="font-size:13px;color:#e2e8f0;margin-bottom:2px">${item.text}</p>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:11px;color:#64748b">${item.time}</span>
            <span class="badge ${badgeClass[item.type]}" style="font-size:10px;padding:2px 8px">${item.severity.toUpperCase()}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Regulation Updates
   */
  function _renderRegulationUpdates() {
    const container = document.getElementById('regulation-updates');
    if (!container) return;

    container.innerHTML = dashboardData.regulationUpdates.map((item, i) => `
      <div class="update-item" style="animation: fadeUp 0.4s ease-out ${i * 0.1}s both">
        <div style="flex:1">
          <p style="font-size:13px;color:#e2e8f0;font-weight:500;margin-bottom:3px">${item.title}</p>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:11px;color:#64748b">${item.date}</span>
            <span class="badge badge-info" style="font-size:10px;padding:2px 8px">${item.region}</span>
          </div>
        </div>
        <span class="badge ${item.impact === 'High' ? 'badge-danger' : 'badge-warning'}" style="font-size:10px">${item.impact}</span>
      </div>
    `).join('');
  }

  /**
   * Risk Heatmap
   */
  function _renderRiskHeatmap() {
    const container = document.getElementById('risk-heatmap');
    if (!container) return;

    const heatData = ComplianceEngine.generateHeatmapData();
    container.innerHTML = heatData.map(item => `
      <div class="heatmap-cell heatmap-${item.level}" title="${item.category}">
        <div style="font-size:11px;font-weight:600">${item.name}</div>
        <div style="font-size:10px;opacity:0.7;margin-top:4px">${item.level.toUpperCase()}</div>
      </div>
    `).join('');
  }

  /**
   * Simulate real-time alert notifications
   */
  function _startRealtimeAlerts() {
    const alerts = [
      { msg: '🔔 New regulation update: EU AI Act compliance deadline approaching', type: 'warning' },
      { msg: '🚨 Risk detected: Unusual access pattern in financial data module', type: 'error' },
      { msg: '✅ Compliance scan completed: 3 new items require review', type: 'info' },
      { msg: '📊 Weekly compliance report generated successfully', type: 'success' }
    ];

    // Show first alert after 8 seconds
    setTimeout(() => {
      const alert = alerts[Math.floor(Math.random() * alerts.length)];
      Toast.show(alert.msg, alert.type, 5000);
    }, 8000);

    // Show periodic alerts
    setInterval(() => {
      const alert = alerts[Math.floor(Math.random() * alerts.length)];
      Toast.show(alert.msg, alert.type, 5000);
    }, 45000);
  }

  /**
   * Shared chart options
   */
  function _getChartOptions(yAxisLabel) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: {
            color: '#94a3b8',
            font: { size: 12, family: 'Inter' },
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 15, 26, 0.95)',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          titleFont: { family: 'Inter', weight: '600' },
          bodyFont: { family: 'Inter' }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } },
          title: yAxisLabel ? {
            display: true,
            text: yAxisLabel,
            color: '#64748b',
            font: { size: 11, family: 'Inter' }
          } : undefined
        }
      }
    };
  }

  function _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return { init };
})();
