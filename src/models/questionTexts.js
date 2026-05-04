/**
 * Default question text the AI agent speaks for each field.
 * Key format: `${templateId}.${fieldId}`
 *
 * Firms can override these per-account through the Intake Templates UI.
 */
const QUESTION_TEXTS = {
  // ── Common fields (shared wording across templates) ─────────────────────────
  'first_name':    'What is your first name?',
  'last_name':     'What is your last name?',
  'middle_name':   'What is your middle name?',
  'suffix':        'Do you have a suffix, such as Jr. or Sr.?',
  'phone_number':  'What is the best phone number to reach you at?',
  'email':         'What is your email address?',
  'message':       'Is there anything else you would like to add or let the firm know?',
  'referral_source': 'How did you hear about us?',
  'callback_time': 'What is the best time to call you back?',
  'court_date':    'When is your next court date?',
  'opposing_counsel': 'What is the name of opposing counsel or the opposing party, for a conflict check?',
  'city':          'What city do you currently reside in?',

  // ── Standard Criminal ───────────────────────────────────────────────────────
  'criminal.date_of_arrest':    'What was the date of arrest?',
  'criminal.charges':           'What were you charged with?',
  'criminal.location':          'What city, county, and state did this take place in?',
  'criminal.court_date':        'When is your next court date?',
  'criminal.calling_for':       'Are you calling for yourself, or on behalf of someone else?',
  'criminal.client_in_custody': 'Is the potential new client currently in custody?',
  'criminal.custody_facility':  'Which facility are they being held at?',

  // ── Standard Traffic Tickets ────────────────────────────────────────────────
  'traffic.date_of_birth':    'What is your date of birth?',
  'traffic.violation':        'What is the violation?',
  'traffic.violation_number': 'What is the violation number?',
  'traffic.location':         'What city and county did this take place in?',

  // ── Standard Personal Injury ────────────────────────────────────────────────
  'personal_injury.accident_type':      'What type of accident was it?',
  'personal_injury.accident_date':      'When did the accident occur?',
  'personal_injury.accident_location':  'Where did the accident happen — city and state?',
  'personal_injury.injuries':           'What injuries did you sustain?',
  'personal_injury.received_treatment': 'Did anyone go to the hospital or receive any medical treatment?',
  'personal_injury.treatment_details':  'By whom or where — for example, the ER via ambulance, urgent care, or primary care?',

  // ── Standard Divorce ────────────────────────────────────────────────────────
  'divorce.divorce_type':     'Is the divorce contested or uncontested?',
  'divorce.has_children':     'Do you have any children together?',
  'divorce.has_property':     'Do you own any property together?',
  'divorce.same_household':   'Are you still living in the same household?',
  'divorce.has_court_date':   'Have you been served any paperwork, or do you have a court date pending?',
  'divorce.court_date':       'What is the court date?',

  // ── Standard Child Custody ──────────────────────────────────────────────────
  'child_custody.incident_location':  'Where did the incident take place?',
  'child_custody.court_order':        'Is there a court order currently in place?',
  'child_custody.order_location':     'What county and state are the orders in?',
  'child_custody.children_county':    'What county do the children currently live in?',
  'child_custody.caller_city':        'What city do you currently reside in?',
  'child_custody.num_children':       'How many children are involved?',
  'child_custody.children_ages':      'How old are the children?',
  'child_custody.children_residence': 'Where have the children been residing over the last six months?',
  'child_custody.property_dispute':   'Are there any contested property issues?',
  'child_custody.order_duration':     'How long has this order been in place?',
  'child_custody.order_status':       'Is the order currently being performed, or is it in default?',
  'child_custody.default_duration':   'For how long has it been in default?',

  // ── Standard Bankruptcy ─────────────────────────────────────────────────────
  'bankruptcy.accounts_frozen': 'Are your bank accounts currently frozen, or about to be?',
  'bankruptcy.wages_garnished': 'Are your wages being garnished, or are they about to be garnished?',
  'bankruptcy.foreclosure':     'Is your house currently in foreclosure?',
  'bankruptcy.sale_imminent':   'Is the sale date imminent?',
  'bankruptcy.married':         'Are you currently married?',
  'bankruptcy.filing_jointly':  'Are you planning to file jointly with your spouse?',

  // ── Standard Immigration ────────────────────────────────────────────────────
  'immigration.alien_number':     'What is your alien registration number?',
  'immigration.immigration_issue': 'What is the specific immigration issue you need help with?',

  // ── Standard Real Estate ────────────────────────────────────────────────────
  'real_estate.property_address':   'What is the property address?',
  'real_estate.mobile_or_section8': 'Is this a mobile home or section 8 housing?',
  'real_estate.property_location':  'What county and state is the property located in?',
  'real_estate.property_type':      'Is it a commercial or residential property?',
  'real_estate.has_dispute':        'Is there a dispute regarding this property?',
  'real_estate.dispute_nature':     'What is the nature of the dispute?',
  'real_estate.transaction_type':   'What type of real estate transaction is this — buying, selling, refinancing, or other?',
  'real_estate.purchase_financing': 'Will there be a lender involved, or will this be a cash purchase?',
  'real_estate.broker':             'Who is your broker?',

  // ── Standard Med Mal ────────────────────────────────────────────────────────
  'med_mal.malpractice_type':    'What type of alleged malpractice is this about?',
  'med_mal.malpractice_date':    'What date did the alleged malpractice occur?',
  'med_mal.facility_name':       'What is the name of the facility or doctor this took place with?',
  'med_mal.injuries':            'What injuries do you have as a result of this alleged malpractice?',
  'med_mal.injuries_permanent':  'Are the injuries you sustained due to the alleged malpractice permanent?',
  'med_mal.referral_source':     'How did you hear about the firm?',

  // ── Standard Family ─────────────────────────────────────────────────────────
  'family.matter_type': 'What type of matter is this in regards to?',

  // ── Standard HVAC ───────────────────────────────────────────────────────────
  'hvac.address': 'What is your address, including city, state, and zip code?',

  // ── Courts ──────────────────────────────────────────────────────────────────
  'courts.case_inquiry': 'What case or client are you inquiring about?',
  'courts.courthouse':   'What courthouse are you calling from?',

  // ── Insurance Adjusters ─────────────────────────────────────────────────────
  'insurance_adjusters.case_inquiry': 'What case or client are you calling about?',
  'insurance_adjusters.claim_number': 'What is the file, index, or claim number?',

  // ── Medical Providers ───────────────────────────────────────────────────────
  'medical_providers.case_inquiry': 'What case or client are you calling about?',
  'medical_providers.claim_number': 'What is the file, index, or claim number?',

  // ── Government Agencies ─────────────────────────────────────────────────────
  'government_agencies.agency_name': 'What agency are you calling from?',
  'government_agencies.case_ref':    'What is the client name and/or case number?',
}

/**
 * Merges default question texts into a template array.
 * Looks up `${templateId}.${fieldId}` first, then falls back to the
 * bare `${fieldId}` key for common fields shared across templates.
 * Existing `question` values on a field are never overwritten.
 */
export function withQuestions(templates) {
  return templates.map(t =>
    ({
      ...t,
      questions: t.questions.map(q => ({
        ...q,
        question: q.question
          ?? QUESTION_TEXTS[`${t.id}.${q.id}`]
          ?? QUESTION_TEXTS[q.id]
          ?? '',
      })),
    })
  )
}
