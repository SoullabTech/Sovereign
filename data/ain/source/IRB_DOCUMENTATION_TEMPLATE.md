# 📋 IRB Documentation Template for MAIA Research

## Study Title
"Validation of AI-Assisted Crisis Detection and Therapeutic Intervention in Digital Mental Health Conversations"

## Principal Investigator
[Name], [Degree], [Title]
[Institution]
[Email], [Phone]

## Co-Investigators
- Clinical Advisor: [Name], PhD, Licensed Clinical Psychologist
- Technical Lead: [Name], PhD, Computer Science/AI
- Data Analyst: [Name], MS, Statistics/Psychology

## Study Overview

### Purpose
To validate the accuracy and clinical utility of an AI-assisted crisis detection and therapeutic intervention system (MAIA) against standard clinical assessment practices, and to evaluate the effectiveness of element-specific therapeutic interventions.

### Background and Significance
Mental health crises often occur between scheduled therapy sessions, creating critical gaps in care delivery. Traditional research methodologies rely on retrospective chart reviews or weekly self-report measures, limiting our understanding of real-time crisis development and intervention effectiveness. MAIA provides continuous naturalistic conversation data with immediate crisis detection and intervention capabilities.

### Research Questions
1. **Primary**: How accurately does AI crisis detection perform compared to licensed clinician assessment?
2. **Secondary**: Do element-specific therapeutic interventions improve user engagement and clinical outcomes?
3. **Exploratory**: What linguistic patterns predict therapeutic breakthroughs in digital conversations?

## Study Design

### Study Type
Mixed-methods validation study with prospective data collection

### Participants

**Inclusion Criteria:**
- Adults aged 18-65
- Seeking mental health support through digital platforms
- English-speaking
- Capable of providing informed consent
- Access to internet-enabled device

**Exclusion Criteria:**
- Active psychosis or severe cognitive impairment
- Immediate suicide risk requiring emergency intervention
- Current participation in other mental health research studies
- Inability to provide informed consent

**Sample Size Calculation:**
- Primary analysis: 500 sessions (250 crisis-flagged, 250 control)
- Power analysis: 80% power to detect moderate effect size (Cohen's κ = 0.60)
- Attrition allowance: 20% oversampling

### Methodology

**Phase 1: Concurrent Validation (Weeks 1-8)**
1. Users engage in normal MAIA conversations
2. AI system flags potential crisis conversations
3. De-identified transcripts reviewed by 3 licensed clinicians
4. Clinicians rate crisis risk independently (blinded to AI assessment)
5. Calculate sensitivity, specificity, and inter-rater reliability

**Phase 2: Intervention Effectiveness (Weeks 9-20)**
1. Randomized assignment to element-aware vs. standard responses
2. Longitudinal tracking of user engagement and outcomes
3. Embedded assessment administration (PHQ-2, GAD-7)
4. 3-month follow-up for sustained engagement

**Data Collection Timeline:**
- Baseline: Demographics, initial assessments
- Daily: Conversation transcripts, risk assessments, interventions
- Weekly: Embedded clinical assessments
- Monthly: Comprehensive outcome evaluation

## Data Management and Privacy

### Data Types Collected

**Conversation Data:**
- De-identified conversation transcripts
- Timestamp information (relative, not absolute)
- AI-generated risk assessments and confidence scores
- Intervention types and outcomes

**Clinical Data:**
- Embedded PHQ-2/GAD-7 scores
- Crisis intervention records
- Clinician risk ratings (validation phase)
- Therapeutic outcome measures

**Technical Data:**
- Session duration and frequency
- User engagement metrics
- System response times
- Error logs (de-identified)

### De-identification Protocol

**Automated Removal:**
- Names, addresses, phone numbers
- Email addresses and usernames
- Specific dates (replaced with relative timeframes)
- Geographic identifiers smaller than state level

**Manual Review Process:**
- All crisis-flagged conversations reviewed before research export
- Additional PII scanning using NLP tools
- Clinical reviewer approval for research inclusion

**Data Security:**
- HIPAA-compliant cloud storage with encryption at rest and in transit
- Access limited to authorized research personnel
- Audit logs for all data access
- Regular security assessments

### Consent Process

**Informed Consent Elements:**

*Research Participation:*
"You are being invited to participate in research designed to improve AI-assisted mental health interventions. Your participation involves allowing researchers to analyze de-identified versions of your conversations with MAIA to better understand crisis detection and therapeutic effectiveness."

*Data Use:*
"Your de-identified conversation data may be used for:
- Validating crisis detection algorithms
- Improving therapeutic response systems
- Academic research publications
- Grant applications for continued research"

*Voluntary Participation:*
"Research participation is completely voluntary. You can:
- Decline research participation while still using MAIA
- Withdraw consent for research use at any time
- Request deletion of your research data
- Participate in conversations without research data collection"

*Risks and Benefits:*
"Risks are minimal and similar to normal therapy conversation risks. Benefits include contributing to improved mental health technology and potentially receiving enhanced therapeutic responses through experimental features."

**Special Consent Considerations:**

*Crisis Intervention Research:*
"☐ I consent to my crisis conversations being analyzed for research
☐ I understand that crisis detection research may involve reviewing my high-risk conversations
☐ I consent to experimental crisis intervention approaches during research period"

*Longitudinal Follow-up:*
"☐ I consent to 3-month follow-up contact for outcome assessment
☐ I provide contact information for follow-up (separate from conversation data)"

## Risk Management

### Participant Safety Protocols

**Crisis Intervention Hierarchy:**
1. **Immediate AI Response** (<30 seconds): De-escalation language, safety resources
2. **Clinical Review** (<15 minutes): Licensed clinician notification and override capability
3. **Emergency Escalation** (<60 minutes): Emergency services contact if indicated
4. **Follow-up Protocol** (24-72 hours): Automated check-in with escalation if no response

**Risk Monitoring:**
- Real-time monitoring of all crisis-flagged conversations
- Daily review of intervention outcomes
- Weekly safety committee review of adverse events
- Monthly external clinical advisor review

**Adverse Event Reporting:**
- Serious adverse events reported to IRB within 24 hours
- Monthly safety reports to IRB
- Annual comprehensive safety analysis

### Data and Privacy Risks

**Risk Mitigation Strategies:**
- Multi-layer encryption for all data storage and transmission
- Limited data retention periods (research data deleted after 7 years)
- Regular security audits and penetration testing
- Staff training on HIPAA compliance and research ethics

**Breach Response Plan:**
- Immediate containment and assessment
- IRB notification within 24 hours
- Participant notification if risk of harm
- Remediation and prevention measures

## Statistical Analysis Plan

### Primary Analysis

**Crisis Detection Validation:**
- Sensitivity and specificity calculations with 95% confidence intervals
- Inter-rater reliability using Fleiss' κ for multiple raters
- AI-clinician agreement using Cohen's κ
- ROC curve analysis for optimal threshold determination

**Sample Size Justification:**
```
Target κ = 0.75 (substantial agreement)
Null hypothesis κ = 0.40 (fair agreement)
α = 0.05, β = 0.20 (80% power)
Estimated sample size: 250 crisis sessions, 250 non-crisis sessions
```

### Secondary Analyses

**Intervention Effectiveness:**
- Mixed-effects models for repeated measures
- Time-to-event analysis for user engagement
- Propensity score matching for intervention comparison
- Mediation analysis for mechanism identification

**Breakthrough Prediction:**
- Logistic regression with linguistic features
- Time series analysis for trajectory prediction
- Cross-validation for model generalizability

### Missing Data Strategy
- Multiple imputation for missing outcome data
- Sensitivity analyses for different missing data assumptions
- Complete case analysis for primary endpoints

## Ethical Considerations

### Vulnerable Populations
While the study targets adults with mental health concerns (potentially vulnerable), safeguards include:
- Enhanced consent process with comprehension assessment
- Independent clinical oversight of all crisis interventions
- Right to withdraw without affecting treatment access
- Additional privacy protections for sensitive data

### Risk-Benefit Analysis
**Risks:**
- Minimal: Standard therapy conversation risks
- Privacy concerns mitigated through robust de-identification
- Potential for AI system errors addressed through clinical oversight

**Benefits:**
- Individual: Potential for improved crisis detection and intervention
- Societal: Advancement of digital mental health capabilities
- Scientific: Novel insights into therapeutic conversations and crisis prediction

### Community Engagement
- Community advisory board including mental health advocates
- Regular updates to participant community on research progress
- Transparency reports on system performance and safety

## Data Sharing and Dissemination

### Publication Plan
- Primary validation results in peer-reviewed clinical journal
- Technical methodology in AI/computer science venue
- Clinical insights in mental health practice journal
- Open-access publication when possible

### Data Sharing
- De-identified aggregate data shared through NIH repositories
- Code and algorithms made open-source (with privacy protections)
- Clinical protocols shared for replication studies

### Community Benefit
- Research findings integrated into MAIA system improvements
- Best practices shared with broader digital mental health community
- Training materials developed for clinicians using AI-assisted tools

## Budget and Resources

### Personnel (Annual)
- Principal Investigator (20% effort): $30,000
- Clinical Advisor (15% effort): $22,000
- Data Analyst (50% effort): $45,000
- Research Coordinator (100% effort): $55,000

### Technology and Infrastructure
- HIPAA-compliant cloud infrastructure: $12,000
- Data security and compliance auditing: $8,000
- Software licenses and tools: $5,000

### Other Costs
- IRB fees and regulatory compliance: $3,000
- Participant incentives (follow-up surveys): $2,500
- Conference presentations and dissemination: $8,000

**Total Annual Budget: $190,500**

## Timeline

**Year 1:**
- Months 1-2: IRB approval, system preparation
- Months 3-8: Phase 1 data collection and validation
- Months 9-12: Phase 2 intervention effectiveness study

**Year 2:**
- Months 1-6: Data analysis and manuscript preparation
- Months 7-9: Peer review and revision process
- Months 10-12: Dissemination and community engagement

## Appendices

### Appendix A: Clinical Rating Guidelines
[Detailed instructions for clinician raters including examples and edge cases]

### Appendix B: Technical Specifications
[System architecture, AI model details, and performance metrics]

### Appendix C: Consent Forms
[Complete informed consent documents with all required elements]

### Appendix D: Safety Protocols
[Detailed crisis intervention procedures and escalation pathways]

### Appendix E: Data Management Plan
[Complete data lifecycle management including retention and destruction]

---

*This IRB documentation template provides a comprehensive framework for submitting MAIA research protocols for institutional review. Each section should be customized based on specific institutional requirements and study objectives.*