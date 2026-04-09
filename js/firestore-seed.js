/**
 * ReguGuard AI - Firestore Data Seeder
 * Seeds the Firestore database with initial regulatory rules and sample data.
 * Run once from the settings page or browser console.
 */

const FirestoreSeed = (() => {

  const rules = [
    {
      id: 'GDPR-001',
      industry: 'All',
      region: 'EU',
      severity: 'critical',
      title: 'Data Encryption Requirement',
      description: 'All PII must be encrypted at rest using AES-256 and in transit using TLS 1.2+.',
      category: 'Data Privacy',
      regulation: 'GDPR Article 32'
    },
    {
      id: 'GDPR-002',
      industry: 'All',
      region: 'EU',
      severity: 'critical',
      title: 'Consent Management',
      description: 'Valid consent must be obtained before processing personal data.',
      category: 'Data Privacy',
      regulation: 'GDPR Article 6-7'
    },
    {
      id: 'GDPR-003',
      industry: 'All',
      region: 'EU',
      severity: 'high',
      title: 'Data Retention Limits',
      description: 'Personal data must not be kept longer than necessary for its purpose.',
      category: 'Data Privacy',
      regulation: 'GDPR Article 5(1)(e)'
    },
    {
      id: 'PCI-001',
      industry: 'Financial Services',
      region: 'Global',
      severity: 'critical',
      title: 'Card Data Protection',
      description: 'Cardholder data must be protected. CVV must never be stored after authorization.',
      category: 'Financial',
      regulation: 'PCI DSS v4.0'
    },
    {
      id: 'HIPAA-001',
      industry: 'Healthcare',
      region: 'US',
      severity: 'critical',
      title: 'PHI Access Controls',
      description: 'Protected Health Information must be accessed only by authorized personnel with audit logging.',
      category: 'Healthcare',
      regulation: 'HIPAA Security Rule'
    },
    {
      id: 'SOX-001',
      industry: 'Financial Services',
      region: 'US',
      severity: 'high',
      title: 'Financial Record Integrity',
      description: 'All financial records must be accurate, tamper-proof, and retained for minimum 7 years.',
      category: 'Financial',
      regulation: 'SOX Section 302/404'
    },
    {
      id: 'NIST-001',
      industry: 'All',
      region: 'US',
      severity: 'high',
      title: 'Multi-Factor Authentication',
      description: 'MFA is required for all privileged access and remote access to systems.',
      category: 'Cybersecurity',
      regulation: 'NIST 800-53 IA-2'
    },
    {
      id: 'NIST-002',
      industry: 'All',
      region: 'US',
      severity: 'high',
      title: 'Incident Response Plan',
      description: 'Organizations must maintain a tested incident response plan.',
      category: 'Cybersecurity',
      regulation: 'NIST CSF IR'
    },
    {
      id: 'AML-001',
      industry: 'Financial Services',
      region: 'Global',
      severity: 'critical',
      title: 'KYC Procedures',
      description: 'Customer identity must be verified before account opening.',
      category: 'Financial',
      regulation: 'BSA / EU AMLD6'
    },
    {
      id: 'CSRD-001',
      industry: 'Manufacturing',
      region: 'EU',
      severity: 'medium',
      title: 'ESG Reporting',
      description: 'Large organizations must disclose environmental, social, and governance metrics.',
      category: 'Environmental',
      regulation: 'EU CSRD'
    }
  ];

  /**
   * Seed Firestore with regulatory rules
   */
  async function seedRules() {
    try {
      Toast.show('Seeding regulatory database...', 'info');
      
      const batch = db.batch();
      
      for (const rule of rules) {
        const ref = db.collection('rules').doc(rule.id);
        batch.set(ref, {
          ...rule,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      await batch.commit();
      Toast.show(`Successfully seeded ${rules.length} regulatory rules!`, 'success');
      return true;
    } catch (error) {
      console.error('[Seed] Error:', error);
      Toast.show('Error seeding data. Check Firebase configuration.', 'error');
      return false;
    }
  }

  /**
   * Log a compliance check
   */
  async function logComplianceCheck(userId, results) {
    try {
      await db.collection('logs').add({
        userId,
        score: results.score,
        violations: results.violations,
        warnings: results.warnings,
        totalChecks: results.totalChecks,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('[Seed] Error logging check:', error);
    }
  }

  /**
   * Save report to Firestore
   */
  async function saveReport(userId, report) {
    try {
      await db.collection('reports').add({
        userId,
        reportId: report.id,
        companyName: report.companyName,
        score: report.score,
        riskLevel: report.riskLevel.level,
        violations: report.violations,
        warnings: report.warnings,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('[Seed] Error saving report:', error);
    }
  }

  /**
   * Fetch rules from Firestore
   */
  async function fetchRules(filters = {}) {
    try {
      let query = db.collection('rules');
      
      if (filters.industry) query = query.where('industry', '==', filters.industry);
      if (filters.region) query = query.where('region', '==', filters.region);
      if (filters.severity) query = query.where('severity', '==', filters.severity);
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('[Seed] Error fetching rules:', error);
      return rules; // Fallback to local data
    }
  }

  return { seedRules, logComplianceCheck, saveReport, fetchRules };
})();
