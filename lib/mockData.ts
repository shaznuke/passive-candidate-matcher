import { CandidateProfile, Job, JobMatch, TailoredResume } from './types';

export const DEFAULT_MOCK_PROFILE: CandidateProfile = {
  id: 'cand-mock-001',
  name: 'Alex Vance',
  email: 'alex.vance@example.com',
  title: 'Director of Special Operations & Strategic Projects',
  summary: '10+ years leading mission-critical operations, cross-functional teams, and rapid crisis response in high-stakes environments. Expertise in translating complex strategic mandates into scalable operational execution, resource allocation, and cross-departmental alignment.',
  core_skills: [
    'Operational Management',
    'Cross-Functional Leadership',
    'Crisis Management & Risk Mitigation',
    'Resource & Capital Allocation',
    'Data-Driven Process Optimization',
    'Stakeholder Management',
    'Agile & Sprint Execution'
  ],
  leadership_experience: [
    'Led a 45-person rapid response operational unit managing multi-million dollar asset allocations with 99.4% mission delivery rate.',
    'Spearheaded cross-functional restructuring resulting in a 35% reduction in project delivery cycle time across 4 global teams.',
    'Managed $12M annual operational budget, implementing lean continuous improvement frameworks.'
  ],
  domain_expertise: [
    'Operations & Supply Chain Logistics',
    'Strategic Planning & Chief of Staff Governance',
    'Risk & Security Operations',
    'Tech & Enterprise Program Management'
  ],
  transferable_skills: [
    'Military Operational Command -> Tech Operations / Business Operations Leadership',
    'Cross-Functional Alignment -> Senior Product Operations / Chief of Staff',
    'High-Stakes Crisis Response -> Incident Management / High-Growth Ops',
    'Resource Strategy -> Program Management Office (PMO) Director'
  ],
  raw_resume_text: `ALEX VANCE
Email: alex.vance@example.com | San Francisco, CA / Remote

EXECUTIVE SUMMARY
Seasoned Operations & Strategic Projects Leader with 10+ years directing multi-disciplinary teams in high-tempo, high-stakes environments. Proven track record of taking ambiguous operational challenges and turning them into streamlined, repeatable enterprise workflows.

CORE COMPETENCIES
- Operational Leadership & Scale
- Strategic Planning & Chief of Staff Execution
- Cross-Functional Team Alignment & Mentorship
- Financial & Budget Management ($12M+)
- Process Automation & Metric Tracking

PROFESSIONAL EXPERIENCE
Director of Special Operations & Strategic Projects | Apex Operations (2020 - Present)
- Directed a 45-person multi-disciplinary team delivering high-stakes logistics and operational missions globally.
- Architected enterprise OKR tracking dashboard that improved cross-departmental delivery predictability by 40%.
- Negotiated vendor and vendor SLAs saving $1.4M annually without compromising operational standards.

Senior Operations Program Manager | Vanguard Logistics (2016 - 2020)
- Designed and launched standard operating procedures (SOPs) across 6 regional hubs.
- Managed crisis management protocols during supply chain disruptions, maintaining 98%+ on-time SLA.
- Led technical integration of inventory tracking tools with engineering teams.`
};

export const MOCK_JOBS: Job[] = [
  {
    id: 'job-001',
    title: 'Chief of Staff to CEO',
    company: 'Nexus AI Systems',
    location: 'San Francisco, CA (Hybrid / Remote)',
    salary_range: '$180,000 - $230,000 + Equity',
    job_type: 'Full-time',
    description: `We are seeking an exceptional Chief of Staff to partner closely with our CEO and executive team. In this role, you will act as a force multiplier for executive decision-making, lead strategic cross-functional initiatives, oversee company-wide OKR cadence, and drive key operational transformations.

Key Responsibilities:
- Serve as strategic advisor and operational sounding board to the CEO.
- Lead high-priority strategic projects spanning product, GTM, and engineering operations.
- Structure company OKRs, quarterly business reviews (QBRs), and board presentation decks.
- Solve complex, cross-departmental operational bottlenecks with speed and rigor.

Qualifications:
- 7+ years of experience in strategic operations, management consulting, PMO, or military leadership.
- World-class strategic problem-solving and executive communication skills.
- Proven ability to influence cross-functional leaders without formal authority.`,
    raw_url: 'https://example.com/careers/nexus-chief-of-staff',
    source: 'apify_greenhouse',
    external_id: 'gh-882109',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'job-002',
    title: 'Director of Business Operations & Strategy',
    company: 'HyperScale Cloud',
    location: 'Remote (US)',
    salary_range: '$190,000 - $240,000',
    job_type: 'Full-time',
    description: `HyperScale Cloud is looking for a Director of Business Operations to scale our core platform infrastructure operations. You will build and manage operational playbooks, optimize capital allocation across server hardware procurement, and lead cross-functional execution between Finance, Product, and Infrastructure Engineering.

Requirements:
- Proven experience scaling operations in technology, logistics, or operational consulting environments.
- Deep financial modeling, unit economics optimization, and vendor negotiation capabilities.
- Experience managing teams of 15+ operational professionals.`,
    raw_url: 'https://example.com/careers/hyperscale-dir-bizops',
    source: 'apify_lever',
    external_id: 'lev-339101',
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: 'job-003',
    title: 'Senior Product Operations Manager',
    company: 'FinFlow Global',
    location: 'New York, NY (Hybrid)',
    salary_range: '$150,000 - $185,000',
    job_type: 'Full-time',
    description: `FinFlow Global is searching for a Senior Product Ops Manager to bridge our Product Management, Engineering, and Customer Success teams. You will standardize launch readiness, streamline feedback loops, and implement scalable analytics for product adoption.

Looking for candidates with strong program management, sprint governance, and operational execution background.`,
    raw_url: 'https://example.com/careers/finflow-product-ops',
    source: 'apify_linkedin',
    external_id: 'li-992013',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'job-004',
    title: 'Principal Strategic Sourcing Manager',
    company: 'AeroDynamics Tech',
    location: 'Austin, TX',
    salary_range: '$165,000 - $195,000',
    job_type: 'Full-time',
    description: `Lead defense and aerospace procurement logistics, contract terms, supplier risk mitigation, and compliance frameworks. Requires deep domain experience in defense procurement regulations (FAR/DFARS).`,
    raw_url: 'https://example.com/careers/aerodynamics-procurement',
    source: 'apify_greenhouse',
    external_id: 'gh-441029',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  }
];

export const MOCK_JOB_MATCHES: JobMatch[] = [
  {
    id: 'match-001',
    job_id: 'job-001',
    candidate_id: 'cand-mock-001',
    match_score: 92,
    match_category: 'High Transferable Potential',
    fit_reasons: [
      'Candidate’s 10+ years directing special projects and cross-functional teams directly maps to Chief of Staff mandate to execute high-priority strategic initiatives.',
      'Demonstrated experience implementing OKR tracking frameworks across 4 global teams aligns 1:1 with company-wide QBR and OKR governance responsibilities.',
      'Proven crisis management & rapid response capability transfers directly to high-tempo executive decision-making under ambiguity.'
    ],
    transferable_skills_mapping: [
      {
        skillRequested: 'Executive Force Multiplier / Sounding Board',
        transferableSkillPossessed: 'Special Operations Leadership & Strategic Project Directorship',
        alignmentReason: 'Both roles require high-trust leadership, turning high-level leadership intent into flawless operational execution.'
      },
      {
        skillRequested: 'Company-wide OKR & QBR Governance',
        transferableSkillPossessed: 'Enterprise OKR Tracking & SOP Architecture',
        alignmentReason: 'Candidate built cross-departmental dashboards improving project delivery predictability by 40%.'
      },
      {
        skillRequested: 'Influence Without Formal Authority',
        transferableSkillPossessed: 'Cross-Functional Team Alignment across 45-person unit',
        alignmentReason: 'Proven track record of managing multi-disciplinary stakeholders to achieve 99.4% mission delivery.'
      }
    ],
    status: 'new',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    job: MOCK_JOBS[0]
  },
  {
    id: 'match-002',
    job_id: 'job-002',
    candidate_id: 'cand-mock-001',
    match_score: 87,
    match_category: 'Direct Fit',
    fit_reasons: [
      'Managed $12M+ operational budgets and negotiated SLAs saving $1.4M annually, matching financial unit economics requirements.',
      'Led 45-person operations team, meeting requirement for managing 15+ operational professionals.',
      'Built operational playbooks and SOPs across regional hubs.'
    ],
    transferable_skills_mapping: [
      {
        skillRequested: 'Operational Playbook & SOP Building',
        transferableSkillPossessed: 'Standard Operating Procedures launch across 6 hubs',
        alignmentReason: 'Direct 1:1 overlap in designing scalable operational execution playbooks.'
      },
      {
        skillRequested: 'Capital Allocation & Vendor Negotiation',
        transferableSkillPossessed: '$12M Budget Management & $1.4M SLA Cost Savings',
        alignmentReason: 'Direct quantitative track record in optimizing enterprise capital and vendor contracts.'
      }
    ],
    status: 'saved',
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    job: MOCK_JOBS[1]
  },
  {
    id: 'match-003',
    job_id: 'job-003',
    candidate_id: 'cand-mock-001',
    match_score: 79,
    match_category: 'High Transferable Potential',
    fit_reasons: [
      'Bridge product and engineering execution using cross-functional governance and process automation skills.',
      'Strong technical program management track record integrating inventory tools with engineering teams.'
    ],
    transferable_skills_mapping: [
      {
        skillRequested: 'Product Readiness & Feedback Loops',
        transferableSkillPossessed: 'Technical Integration with Engineering & Inventory Operations',
        alignmentReason: 'Translates high-level technical requirements into operational readiness workflows.'
      }
    ],
    status: 'new',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    job: MOCK_JOBS[2]
  },
  {
    id: 'match-004',
    job_id: 'job-004',
    candidate_id: 'cand-mock-001',
    match_score: 64,
    match_category: 'Stretch Target',
    fit_reasons: [
      'Strong general procurement & vendor management experience, but lacks niche defense regulation certifications (FAR/DFARS).'
    ],
    transferable_skills_mapping: [
      {
        skillRequested: 'Supplier Risk & Procurement Logistics',
        transferableSkillPossessed: 'Vendor SLA Management & Crisis Logistics',
        alignmentReason: 'General operational principles transfer, but regulatory compliance requires domain ramp-up.'
      }
    ],
    status: 'new',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    job: MOCK_JOBS[3]
  }
];

export const MOCK_TAILORED_RESUME: TailoredResume = {
  target_job_title: 'Chief of Staff to CEO',
  company_name: 'Nexus AI Systems',
  executive_summary: 'Versatile Operations & Strategic Projects Leader with 10+ years directing high-stakes operational mandates and cross-functional teams. Specialized in supporting C-suite directives, establishing enterprise OKR cadences, and driving rapid organizational alignment in fast-moving technology environments.',
  highlighted_skills: [
    'Executive Governance & Sounding Board',
    'Enterprise OKR & QBR Frameworks',
    'Cross-Functional Alignment',
    'Crisis Management & Rapid Execution',
    'Budget & Resource Optimization'
  ],
  tailored_bullets: [
    {
      original: 'Directed a 45-person multi-disciplinary team delivering high-stakes logistics and operational missions globally.',
      tailored: 'Partnered with senior executive leadership to direct a 45-person cross-functional team, serving as operational force multiplier to deliver 99.4% of high-priority strategic initiatives on schedule.',
      rationale: 'Re-framed leadership experience around acting as a force multiplier for executive leadership and strategic project delivery.'
    },
    {
      original: 'Architected enterprise OKR tracking dashboard that improved cross-departmental delivery predictability by 40%.',
      tailored: 'Architected company-wide OKR and executive reporting framework, aligning cross-departmental initiatives and increasing strategic goal predictability by 40%.',
      rationale: 'Directly mirrors Chief of Staff requirement for company-wide OKR governance and executive decision support.'
    },
    {
      original: 'Negotiated vendor and vendor SLAs saving $1.4M annually without compromising operational standards.',
      tailored: 'Drove strategic capital allocation and high-stakes vendor negotiations, securing $1.4M in annual cost efficiencies to reinvest into growth operations.',
      rationale: 'Emphasizes strategic resource allocation and ROI focus valued in executive leadership roles.'
    }
  ],
  full_tailored_markdown: `# ALEX VANCE
Email: alex.vance@example.com | San Francisco, CA / Remote

## TAILORED TARGET ROLE: Chief of Staff to CEO | Nexus AI Systems

### EXECUTIVE SUMMARY
Versatile Operations & Strategic Projects Leader with 10+ years directing high-stakes operational mandates and cross-functional teams. Specialized in supporting C-suite directives, establishing enterprise OKR cadences, and driving rapid organizational alignment in fast-moving technology environments.

### RELEVANT COMPETENCIES
- Executive Governance & Sounding Board
- Enterprise OKR & QBR Frameworks
- Cross-Functional Alignment (45+ Team Members)
- Crisis Management & Rapid Execution
- Strategic Resource Allocation ($12M+ Budget)

### PROFESSIONAL EXPERIENCE
**Director of Special Operations & Strategic Projects** | Apex Operations (2020 - Present)
- Partnered with senior executive leadership to direct a 45-person cross-functional team, serving as operational force multiplier to deliver 99.4% of high-priority strategic initiatives on schedule.
- Architected company-wide OKR and executive reporting framework, aligning cross-departmental initiatives and increasing strategic goal predictability by 40%.
- Drove strategic capital allocation and high-stakes vendor negotiations, securing $1.4M in annual cost efficiencies to reinvest into growth operations.

**Senior Operations Program Manager** | Vanguard Logistics (2016 - 2020)
- Designed and launched standard operating procedures (SOPs) across 6 regional hubs, establishing consistent executive performance metrics.
- Led high-stakes crisis response protocols during systemic disruptions, maintaining 98%+ on-time SLA performance.
`
};
