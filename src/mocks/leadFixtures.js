/**
 * Fixture leads in the BOT WIRE FORMAT: the exact payload Lamarck and
 * Priyanshi's bots POST at end of call. They go through `normalizeLead` like
 * real data would, so the UI is exercised against the real shape.
 *
 * NOTHING HERE IS PERSISTED. Scaffolding only, so the dashboard can be built in
 * parallel with the Django `Lead` model. Delete this file once the endpoint is
 * live and `USE_FIXTURES` flips off.
 *
 * The two "hero" leads reproduce the calls demoed on the 2pm sync.
 */

/**
 * Timestamps are pinned to a weekday or a weekend deliberately, rather than
 * just counting days back. Whether a lead lands in or out of business hours
 * drives the headline after-hours metric, and letting it drift with the day
 * you happen to run the demo produced implausible numbers (86% after-hours).
 * The split below is roughly even, which is what a real firm looks like.
 */
function at(daysAgo, hour, minute, { weekend = false } = {}) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  const isWeekend = day => day === 0 || day === 6
  while (weekend ? !isWeekend(d.getDay()) : isWeekend(d.getDay())) {
    d.setDate(d.getDate() - 1)
  }
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function span(daysAgo, hour, minute, durationSec, opts) {
  const received = at(daysAgo, hour, minute, opts)
  return {
    received_at: received,
    completed_at: new Date(new Date(received).getTime() + durationSec * 1000).toISOString(),
    call_duration_seconds: null, // the bot sends null; the UI derives it
  }
}

let seq = 0
const callId = () => `CA${String(++seq).padStart(6, '0')}f0e1d2c3b4a5`

// ── Aiden & Associates: family law (Pipecat) ─────────────────────────────────

const FAMILY_LINE = '+14058839601'

const familyLaw = () => [
  // Hero: the divorce call demoed at 2pm. Deliberately keeps the real ASR
  // errors from that call so the "needs review" path has something to show.
  {
    call_id: callId(),
    firm_name: 'Aiden and Associates',
    caller_number: '+19342278405',
    dialed_number: FAMILY_LINE,
    ...span(0, 14, 4, 203),
    case_type_slug: 'divorce',
    case_type_label: 'Standard Divorce',
    case_type_corrected: false,
    case_type_original_guess: null,
    outcome: 'callback_attorney_unavailable',
    attorney_name: null,
    attorney_id: null,
    caller_description: 'Hi, so my name is Lamarck, and I wanted to speak about my divorce with my spouse. We have two kids and we are looking to get separated.',
    summary: 'Caller is seeking a divorce. Two children together, no shared property, no longer living in the same household. Resides in Stony Brook, NY. No paperwork served and no court date pending. Primary concern is child custody. The caller is distressed about how custody will be decided.',
    answers: {
      first_name: 'Lamarck',
      last_name: 'Dcunha',
      phone_number: '(934) 227-8405',
      email: 'limark.dcunha@gmail.com',
      has_children: 'Yes',
      has_property: 'No',
      same_household: 'No',
      city: 'Stony Brook, New York',
      has_court_date: 'No',
      message: 'Very stressed about how custody of the two children will be handled.',
      referral_source: 'From Internet',
    },
    low_confidence_fields: ['email', 'last_name'],
    additional_concerns: ['Caller is anxious about how custody of the children will be decided.'],
    faq_topics_asked: [],
    abandoned_at_question: null,
  },

  {
    call_id: callId(),
    firm_name: 'Aiden and Associates',
    caller_number: '+16315550188',
    dialed_number: FAMILY_LINE,
    ...span(0, 21, 18, 168),
    case_type_slug: 'child_custody',
    case_type_label: 'Standard Child Custody',
    case_type_corrected: true,
    case_type_original_guess: 'divorce',
    outcome: 'transferred',
    attorney_name: 'Marcus Feld',
    attorney_id: null,
    caller_description: 'I need help because my ex is not following our custody order.',
    summary: 'Existing custody order out of Suffolk County is in default: the other parent has not complied for roughly three months. Two children, ages 7 and 11, residing with the caller since March. Seeking enforcement.',
    answers: {
      first_name: 'Denise', last_name: 'Alvarez',
      phone_number: '(631) 555-0188',
      email: 'd.alvarez@gmail.com',
      incident_location: 'Islip, NY',
      court_order: 'Yes',
      order_location: 'Suffolk County, New York',
      children_county: 'Suffolk',
      caller_city: 'Bay Shore',
      num_children: '2',
      children_ages: '7 and 11',
      children_residence: 'With me since March',
      order_status: 'In default',
      default_duration: 'About 3 months',
      referral_source: 'Referred by a friend',
    },
    low_confidence_fields: [],
    additional_concerns: [],
    faq_topics_asked: ['office_hours'],
    abandoned_at_question: null,
  },

  {
    call_id: callId(),
    firm_name: 'Aiden and Associates',
    caller_number: '+15165550119',
    dialed_number: FAMILY_LINE,
    ...span(1, 10, 15, 141),
    case_type_slug: 'divorce',
    case_type_label: 'Standard Divorce',
    outcome: 'callback',
    attorney_name: null,
    caller_description: 'My wife and I have agreed to separate and want to keep it simple.',
    summary: 'Uncontested divorce, no children, jointly owned home, still sharing a household. Looking for a straightforward filing.',
    answers: {
      first_name: 'Robert', last_name: 'Kaminski',
      phone_number: '(516) 555-0119',
      email: 'rkaminski@outlook.com',
      divorce_type: 'Uncontested',
      has_children: 'No',
      has_property: 'Yes',
      same_household: 'Yes',
      city: 'Hicksville',
      has_court_date: 'No',
      referral_source: 'Google search',
    },
    low_confidence_fields: [],
    additional_concerns: [],
    faq_topics_asked: ['pricing'],
    abandoned_at_question: null,
  },

  {
    call_id: callId(),
    firm_name: 'Aiden and Associates',
    caller_number: '+18005550123',
    dialed_number: FAMILY_LINE,
    ...span(2, 2, 37, 44),
    case_type_slug: 'divorce',
    case_type_label: 'Standard Divorce',
    outcome: 'abandoned',
    attorney_name: null,
    caller_description: 'Uh, hello? Is this a real person?',
    summary: null,
    answers: { first_name: 'Karen' },
    low_confidence_fields: [],
    additional_concerns: [],
    faq_topics_asked: [],
    abandoned_at_question: 'What is your last name?',
  },

  {
    call_id: callId(),
    firm_name: 'Aiden and Associates',
    caller_number: '+19175550171',
    dialed_number: FAMILY_LINE,
    ...span(3, 15, 40, 187),
    case_type_slug: 'divorce',
    case_type_label: 'Standard Divorce',
    outcome: 'transferred',
    attorney_name: 'Marcus Feld',
    caller_description: 'I have a court date coming up and I still do not have a lawyer.',
    summary: 'Contested divorce with children and shared property. Court date on August 19. Opposing counsel identified as Harriet Blum of Blum & Cardoza, so a conflict check is required.',
    answers: {
      first_name: 'Thomas', last_name: 'Nwosu',
      phone_number: '(917) 555-0171',
      email: 'tnwosu@gmail.com',
      divorce_type: 'Contested',
      has_children: 'Yes',
      has_property: 'Yes',
      same_household: 'No',
      city: 'Queens',
      opposing_counsel: 'Harriet Blum, Blum & Cardoza',
      has_court_date: 'Yes',
      court_date: '2026-08-19',
      referral_source: 'From Internet',
    },
    low_confidence_fields: ['opposing_counsel'],
    additional_concerns: ['Caller is worried about missing the court date without representation.'],
    faq_topics_asked: ['office_hours', 'pricing'],
    abandoned_at_question: null,
  },

  {
    call_id: callId(),
    firm_name: 'Aiden and Associates',
    caller_number: '+16315550193',
    dialed_number: FAMILY_LINE,
    ...span(4, 22, 5, 122),
    case_type_slug: 'child_custody',
    case_type_label: 'Standard Child Custody',
    outcome: 'transferred',
    attorney_name: 'Priya Raman',
    caller_description: 'We never went to court, we just have an informal arrangement.',
    summary: 'No custody order currently in place. One child, age 4, alternating between both parents. Caller wants to establish a formal arrangement.',
    answers: {
      first_name: 'Grace', last_name: 'Oyelaran',
      phone_number: '(631) 555-0193',
      email: 'g.oyelaran@yahoo.com',
      incident_location: 'Riverhead, NY',
      court_order: 'No',
      children_county: 'Suffolk',
      caller_city: 'Riverhead',
      num_children: '1',
      children_ages: '4',
      children_residence: 'Alternating between both parents',
      referral_source: 'From Internet',
    },
    low_confidence_fields: ['last_name'],
    additional_concerns: [],
    faq_topics_asked: [],
    abandoned_at_question: null,
  },

  {
    call_id: callId(),
    firm_name: 'Aiden and Associates',
    caller_number: '+15165550137',
    dialed_number: FAMILY_LINE,
    ...span(5, 13, 12, 155, { weekend: true }),
    case_type_slug: 'divorce',
    case_type_label: 'Standard Divorce',
    outcome: 'callback_attorney_unavailable',
    attorney_name: null,
    caller_description: 'Things have gotten bad at home and I want to understand my options.',
    summary: 'Contested divorce, children and shared property, both parties still in the marital home. No filings yet.',
    answers: {
      first_name: 'Michael', last_name: 'Trent',
      phone_number: '(516) 555-0137',
      email: 'mtrent84@gmail.com',
      divorce_type: 'Contested',
      has_children: 'Yes',
      has_property: 'Yes',
      same_household: 'Yes',
      city: 'Levittown',
      has_court_date: 'No',
      referral_source: 'Radio ad',
    },
    low_confidence_fields: [],
    additional_concerns: [],
    faq_topics_asked: ['office_hours'],
    abandoned_at_question: null,
  },
]

// ── Law Firm 01: immigration (LiveKit) ───────────────────────────────────────

const IMMIGRATION_LINE = '+14058839655'

const immigration = () => [
  // Hero: the immigration call demoed at 2pm.
  {
    call_id: callId(),
    firm_name: 'Law Firm 01',
    caller_number: '+19342278816',
    dialed_number: IMMIGRATION_LINE,
    ...span(0, 14, 16, 226),
    case_type_slug: 'immigration',
    case_type_label: 'Standard Immigration',
    case_type_corrected: false,
    case_type_original_guess: null,
    outcome: 'callback_attorney_unavailable',
    attorney_name: null,
    attorney_id: null,
    caller_description: 'Hi, I need some legal assistance with an immigration matter.',
    summary: 'Caller is on OPT following graduation, with status expiring in approximately four months. Employer has not initiated H-1B sponsorship. Seeking guidance on options to maintain legal status.',
    answers: {
      first_name: 'Priyanshi',
      last_name: 'Jain',
      phone_number: '(934) 227-8816',
      email: 'priyanshijain@gmail.com',
      alien_number: 'A204881763',
      immigration_issue: 'Came to the US on a student visa five years ago, has graduated and is currently on OPT. Employer has not started H-1B sponsorship. Status expires in four months.',
      message: 'Anxious about maintaining legal status and wants to understand available options.',
    },
    low_confidence_fields: ['last_name', 'alien_number'],
    additional_concerns: ['Caller is anxious about falling out of status before H-1B sponsorship begins.'],
    faq_topics_asked: [],
    abandoned_at_question: null,
  },

  {
    call_id: callId(),
    firm_name: 'Law Firm 01',
    caller_number: '+17185550122',
    dialed_number: IMMIGRATION_LINE,
    ...span(0, 23, 9, 178),
    case_type_slug: 'immigration',
    case_type_label: 'Standard Immigration',
    outcome: 'transferred',
    attorney_name: 'Ana Villareal',
    caller_description: 'My green card expires soon and I have a trip booked.',
    summary: 'Green card renewal with a hard deadline: card expires in seven weeks and the caller has international travel planned in September. Concerned about re-entry.',
    answers: {
      first_name: 'Carlos', middle_name: 'Andrés', last_name: 'Restrepo',
      phone_number: '(718) 555-0122',
      email: 'c.restrepo@gmail.com',
      alien_number: 'A198334027',
      immigration_issue: 'Green card renewal. Current card expires in seven weeks and a trip abroad is planned.',
      message: 'Needs to travel in September and is worried about re-entry.',
    },
    low_confidence_fields: [],
    additional_concerns: [],
    faq_topics_asked: ['office_hours'],
    abandoned_at_question: null,
  },

  {
    call_id: callId(),
    firm_name: 'Law Firm 01',
    caller_number: '+19295550154',
    dialed_number: IMMIGRATION_LINE,
    ...span(1, 9, 48, 134),
    case_type_slug: 'immigration',
    case_type_label: 'Standard Immigration',
    outcome: 'transferred',
    attorney_name: 'Ana Villareal',
    caller_description: 'I got an offer from a new company and need to move my H-1B.',
    summary: 'H-1B transfer to a new employer with a start date in six weeks. No complications reported.',
    answers: {
      first_name: 'Mei', last_name: 'Ling',
      phone_number: '(929) 555-0154',
      email: 'meiling.work@gmail.com',
      immigration_issue: 'H-1B transfer to a new employer, start date in six weeks.',
    },
    low_confidence_fields: [],
    additional_concerns: [],
    faq_topics_asked: [],
    abandoned_at_question: null,
  },

  {
    call_id: callId(),
    firm_name: 'Law Firm 01',
    caller_number: '+13475550196',
    dialed_number: IMMIGRATION_LINE,
    ...span(2, 18, 33, 211),
    case_type_slug: 'immigration',
    case_type_label: 'Standard Immigration',
    outcome: 'callback',
    attorney_name: null,
    caller_description: 'I filed for asylum over a year ago and I have not heard anything.',
    summary: 'Asylum application pending 14 months with no interview scheduled. Employment authorisation expires next month, so renewal is time-critical.',
    answers: {
      first_name: 'Oluwaseun', last_name: 'Adeyemi',
      phone_number: '(347) 555-0196',
      email: 'seun.adeyemi@outlook.com',
      alien_number: 'A211470558',
      immigration_issue: 'Asylum application filed 14 months ago with no interview scheduled yet.',
      message: 'Work permit expires next month.',
    },
    low_confidence_fields: ['alien_number'],
    additional_concerns: ['Work permit expiry may create a gap in employment authorisation.'],
    faq_topics_asked: ['case_status'],
    abandoned_at_question: null,
  },

  {
    call_id: callId(),
    firm_name: 'Law Firm 01',
    caller_number: '+16465550178',
    dialed_number: IMMIGRATION_LINE,
    ...span(3, 12, 15, 89),
    case_type_slug: 'immigration',
    case_type_label: 'Standard Immigration',
    outcome: 'callback',
    attorney_name: null,
    caller_description: 'I want to bring my wife over from abroad.',
    summary: 'Family-based petition for a spouse residing abroad. Early-stage inquiry.',
    answers: {
      first_name: 'Dmitri', last_name: 'Volkov',
      phone_number: '(646) 555-0178',
      immigration_issue: 'Wants to sponsor a spouse currently living abroad.',
    },
    low_confidence_fields: [],
    additional_concerns: [],
    faq_topics_asked: ['pricing'],
    abandoned_at_question: null,
  },

  {
    call_id: callId(),
    firm_name: 'Law Firm 01',
    caller_number: '+18885550100',
    dialed_number: IMMIGRATION_LINE,
    ...span(4, 3, 22, 31),
    case_type_slug: 'immigration',
    case_type_label: 'Standard Immigration',
    outcome: 'spam',
    attorney_name: null,
    caller_description: 'This is an important message about your vehicle warranty.',
    summary: null,
    answers: {},
    low_confidence_fields: [],
    additional_concerns: [],
    faq_topics_asked: [],
    abandoned_at_question: 'What is your first name?',
  },

  {
    call_id: callId(),
    firm_name: 'Law Firm 01',
    caller_number: '+19175550163',
    dialed_number: IMMIGRATION_LINE,
    ...span(5, 16, 40, 165),
    case_type_slug: 'immigration',
    case_type_label: 'Standard Immigration',
    outcome: 'transferred',
    attorney_name: 'Ana Villareal',
    caller_description: 'I think I am finally eligible to apply for citizenship.',
    summary: 'Naturalisation inquiry. Caller becomes eligible next month and wants assistance filing the N-400.',
    answers: {
      first_name: 'Fatima', last_name: 'Haddad',
      phone_number: '(917) 555-0163',
      email: 'f.haddad@gmail.com',
      alien_number: 'A207661294',
      immigration_issue: 'Naturalisation. Eligible next month and wants to file N-400.',
    },
    low_confidence_fields: [],
    additional_concerns: [],
    faq_topics_asked: ['office_hours'],
    abandoned_at_question: null,
  },

  {
    call_id: callId(),
    firm_name: 'Law Firm 01',
    caller_number: '+17185550149',
    dialed_number: IMMIGRATION_LINE,
    ...span(6, 11, 30, 143, { weekend: true }),
    case_type_slug: 'immigration',
    case_type_label: 'Standard Immigration',
    outcome: 'transferred',
    attorney_name: 'Ana Villareal',
    caller_description: 'I received a letter saying I have to appear in immigration court.',
    summary: 'Caller has received a Notice to Appear with a hearing in three weeks. Removal defence, highly time-sensitive.',
    answers: {
      first_name: 'Javier', last_name: 'Morales',
      phone_number: '(718) 555-0149',
      email: 'jmorales.nyc@gmail.com',
      immigration_issue: 'Received a notice to appear in immigration court.',
      message: 'Hearing date is in three weeks.',
    },
    low_confidence_fields: [],
    additional_concerns: ['Hearing in three weeks, needs representation urgently.'],
    faq_topics_asked: [],
    abandoned_at_question: null,
  },
]

const THEMES = [familyLaw, immigration]

const cache = new Map()

/**
 * Deterministic per-account fixtures in wire format. `index` is the account's
 * position in the accounts list, so account #1 gets family law and account #2
 * immigration, the two-account story Sean asked for.
 */
export function fixtureLeadsFor(companyId, index = 0) {
  const key = `${companyId}:${index}`
  if (!cache.has(key)) {
    seq = index * 100
    cache.set(key, THEMES[index % THEMES.length]())
  }
  return cache.get(key)
}
