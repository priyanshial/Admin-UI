import { withQuestions } from './questionTexts'

/**
 * IntakeTemplate — a practice-area or third-party intake script.
 * Each template is a self-contained ordered list of questions shown during a call.
 *
 * @typedef {Object} IntakeTemplate
 * @property {string}   id
 * @property {string}   label
 * @property {'practice_area'|'third_party'} category
 * @property {boolean}  enabled
 * @property {IntakeField[]} questions
 *
 * @typedef {Object} IntakeField
 * @property {string}   id
 * @property {string}   label
 * @property {'text'|'email'|'phone'|'date'|'dropdown'|'textarea'|'address'} fieldType
 * @property {boolean}  required
 * @property {string[]|null} options        - for dropdown fields
 * @property {{fieldId: string, value: string}|null} conditionalOn
 */
const RAW_INTAKE_TEMPLATES = [

  // ── Practice Areas ──────────────────────────────────────────────────────────

  {
    id: 'criminal',
    label: 'Standard Criminal',
    category: 'practice_area',
    enabled: true,
    questions: [
      { id: 'first_name',       label: 'First Name',                                       fieldType: 'text',     required: true,  options: null,                                                                              conditionalOn: null },
      { id: 'last_name',        label: 'Last Name',                                        fieldType: 'text',     required: true,  options: null,                                                                              conditionalOn: null },
      { id: 'phone_number',     label: 'Phone Number',                                     fieldType: 'phone',    required: true,  options: null,                                                                              conditionalOn: null },
      { id: 'email',            label: 'Email Address',                                    fieldType: 'email',    required: false, options: null,                                                                              conditionalOn: null },
      { id: 'date_of_arrest',   label: 'Date of Arrest',                                   fieldType: 'date',     required: true,  options: null,                                                                              conditionalOn: null },
      { id: 'charges',          label: 'What were you charged with?',                      fieldType: 'text',     required: true,  options: null,                                                                              conditionalOn: null },
      { id: 'location',         label: 'What City/County and State did this take place in?', fieldType: 'text',   required: true,  options: null,                                                                              conditionalOn: null },
      { id: 'court_date',       label: 'When is your next court date?',                    fieldType: 'date',     required: false, options: null,                                                                              conditionalOn: null },
      { id: 'calling_for',      label: 'Are you calling for yourself or on behalf of someone else?', fieldType: 'dropdown', required: true, options: ['Client', 'Someone calling on behalf of client'],                      conditionalOn: null },
      { id: 'client_in_custody', label: 'Is the potential new client in custody?',         fieldType: 'dropdown', required: false, options: ['Yes', 'No'],                                                                    conditionalOn: { fieldId: 'calling_for', value: 'Someone calling on behalf of client' } },
      { id: 'custody_facility', label: 'Which facility?',                                  fieldType: 'text',     required: false, options: null,                                                                              conditionalOn: { fieldId: 'client_in_custody', value: 'Yes' } },
      { id: 'message',          label: 'Message',                                          fieldType: 'textarea', required: false, options: null,                                                                              conditionalOn: null },
      { id: 'referral_source',  label: 'How did you hear about us?',                       fieldType: 'text',     required: false, options: null,                                                                              conditionalOn: null },
    ],
  },

  {
    id: 'traffic',
    label: 'Standard Traffic Tickets',
    category: 'practice_area',
    enabled: true,
    questions: [
      { id: 'first_name',        label: 'First Name',                                      fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'last_name',         label: 'Last Name',                                       fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'phone_number',      label: 'Phone Number',                                    fieldType: 'phone',    required: true,  options: null, conditionalOn: null },
      { id: 'email',             label: 'Email',                                           fieldType: 'email',    required: false, options: null, conditionalOn: null },
      { id: 'date_of_birth',     label: 'Date of Birth',                                   fieldType: 'date',     required: true,  options: null, conditionalOn: null },
      { id: 'message',           label: 'Message',                                         fieldType: 'textarea', required: false, options: null, conditionalOn: null },
      { id: 'violation',         label: 'What is the violation?',                          fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'violation_number',  label: 'What is the violation number?',                   fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'location',          label: 'What City & County did this take place in?',      fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'court_date',        label: 'When is your next court date?',                   fieldType: 'date',     required: false, options: null, conditionalOn: null },
      { id: 'referral_source',   label: 'How did you hear about us?',                      fieldType: 'text',     required: false, options: null, conditionalOn: null },
    ],
  },

  {
    id: 'personal_injury',
    label: 'Standard Personal Injury',
    category: 'practice_area',
    enabled: true,
    questions: [
      { id: 'first_name',         label: 'First Name',                                              fieldType: 'text',     required: true,  options: null,                    conditionalOn: null },
      { id: 'last_name',          label: 'Last Name',                                               fieldType: 'text',     required: true,  options: null,                    conditionalOn: null },
      { id: 'phone_number',       label: 'Phone Number',                                            fieldType: 'phone',    required: true,  options: null,                    conditionalOn: null },
      { id: 'email',              label: 'Email Address',                                           fieldType: 'email',    required: false, options: null,                    conditionalOn: null },
      { id: 'accident_type',      label: 'What type of accident?',                                  fieldType: 'text',     required: true,  options: null,                    conditionalOn: null },
      { id: 'accident_date',      label: 'When did the accident occur?',                            fieldType: 'date',     required: true,  options: null,                    conditionalOn: null },
      { id: 'accident_location',  label: 'Where did the accident happen (City/State)?',             fieldType: 'text',     required: true,  options: null,                    conditionalOn: null },
      { id: 'injuries',           label: 'What injuries did you sustain?',                          fieldType: 'textarea', required: true,  options: null,                    conditionalOn: null },
      { id: 'received_treatment', label: 'Did anyone go to the hospital or receive any treatment?', fieldType: 'dropdown', required: true,  options: ['Yes', 'No'],           conditionalOn: null },
      { id: 'treatment_details',  label: 'By whom / where? (e.g. ER via ambulance, Urgent Care)',   fieldType: 'text',     required: false, options: null,                    conditionalOn: { fieldId: 'received_treatment', value: 'Yes' } },
      { id: 'message',            label: 'Message',                                                 fieldType: 'textarea', required: false, options: null,                    conditionalOn: null },
    ],
  },

  {
    id: 'divorce',
    label: 'Standard Divorce',
    category: 'practice_area',
    enabled: true,
    questions: [
      { id: 'first_name',          label: 'First Name',                                                        fieldType: 'text',     required: true,  options: null,                          conditionalOn: null },
      { id: 'last_name',           label: 'Last Name',                                                         fieldType: 'text',     required: true,  options: null,                          conditionalOn: null },
      { id: 'phone_number',        label: 'Phone Number',                                                      fieldType: 'phone',    required: true,  options: null,                          conditionalOn: null },
      { id: 'email',               label: 'Email',                                                             fieldType: 'email',    required: false, options: null,                          conditionalOn: null },
      { id: 'divorce_type',        label: 'Is the divorce contested or uncontested?',                          fieldType: 'dropdown', required: true,  options: ['Contested', 'Uncontested'],   conditionalOn: null },
      { id: 'has_children',        label: 'Do you have any children together?',                                 fieldType: 'dropdown', required: true,  options: ['Yes', 'No'],                 conditionalOn: null },
      { id: 'has_property',        label: 'Do you own any property together?',                                  fieldType: 'dropdown', required: true,  options: ['Yes', 'No'],                 conditionalOn: null },
      { id: 'same_household',      label: 'Are you still living in the same household?',                        fieldType: 'dropdown', required: true,  options: ['Yes', 'No'],                 conditionalOn: null },
      { id: 'city',                label: 'What city do you currently reside/live in?',                        fieldType: 'text',     required: true,  options: null,                          conditionalOn: null },
      { id: 'opposing_counsel',    label: 'Name of opposing counsel/parties (for conflict check)',              fieldType: 'text',     required: false, options: null,                          conditionalOn: null },
      { id: 'has_court_date',      label: 'Have you been served any paperwork or have a court date pending?',  fieldType: 'dropdown', required: true,  options: ['Yes', 'No'],                 conditionalOn: null },
      { id: 'court_date',          label: 'What is the court date?',                                           fieldType: 'date',     required: false, options: null,                          conditionalOn: { fieldId: 'has_court_date', value: 'Yes' } },
      { id: 'message',             label: 'Message',                                                           fieldType: 'textarea', required: false, options: null,                          conditionalOn: null },
      { id: 'referral_source',     label: 'How did you hear about us?',                                        fieldType: 'text',     required: false, options: null,                          conditionalOn: null },
    ],
  },

  {
    id: 'child_custody',
    label: 'Standard Child Custody',
    category: 'practice_area',
    enabled: true,
    questions: [
      { id: 'first_name',           label: 'First Name',                                                fieldType: 'text',     required: true,  options: null,              conditionalOn: null },
      { id: 'last_name',            label: 'Last Name',                                                 fieldType: 'text',     required: true,  options: null,              conditionalOn: null },
      { id: 'phone_number',         label: 'Phone Number',                                              fieldType: 'phone',    required: true,  options: null,              conditionalOn: null },
      { id: 'email',                label: 'Email',                                                     fieldType: 'email',    required: false, options: null,              conditionalOn: null },
      { id: 'message',              label: 'Message',                                                   fieldType: 'textarea', required: false, options: null,              conditionalOn: null },
      { id: 'incident_location',    label: 'Where did the incident take place?',                        fieldType: 'text',     required: true,  options: null,              conditionalOn: null },
      { id: 'court_order',          label: 'Is there a court order currently in place?',                fieldType: 'dropdown', required: true,  options: ['Yes', 'No', 'N/A'], conditionalOn: null },
      { id: 'order_location',       label: 'What county and state are the orders in?',                  fieldType: 'text',     required: false, options: null,              conditionalOn: { fieldId: 'court_order', value: 'Yes' } },
      { id: 'children_county',      label: 'What county do the children live in?',                      fieldType: 'text',     required: true,  options: null,              conditionalOn: null },
      { id: 'caller_city',          label: 'What city do you currently reside/live in?',                fieldType: 'text',     required: true,  options: null,              conditionalOn: null },
      { id: 'num_children',         label: 'How many children are involved?',                           fieldType: 'text',     required: true,  options: null,              conditionalOn: null },
      { id: 'children_ages',        label: 'How old are the children?',                                 fieldType: 'text',     required: true,  options: null,              conditionalOn: null },
      { id: 'children_residence',   label: 'Where have the children been residing the last 6 months?', fieldType: 'text',     required: true,  options: null,              conditionalOn: null },
      { id: 'property_dispute',     label: 'Are there contested property issues?',                      fieldType: 'dropdown', required: false, options: ['Yes', 'No'],     conditionalOn: null },
      { id: 'opposing_counsel',     label: 'Name of opposing counsel/party (for conflict check)',       fieldType: 'text',     required: false, options: null,              conditionalOn: null },
      { id: 'order_duration',       label: 'How long has this order been in place?',                    fieldType: 'text',     required: false, options: null,              conditionalOn: null },
      { id: 'order_status',         label: 'Is it being performed, or is it in default?',              fieldType: 'dropdown', required: false, options: ['Being performed', 'In default'], conditionalOn: null },
      { id: 'default_duration',     label: 'If in default, for how long?',                             fieldType: 'text',     required: false, options: null,              conditionalOn: { fieldId: 'order_status', value: 'In default' } },
      { id: 'callback_time',        label: 'What is the best time to call you back?',                   fieldType: 'text',     required: false, options: null,              conditionalOn: null },
      { id: 'referral_source',      label: 'How did you hear about us?',                                fieldType: 'text',     required: false, options: null,              conditionalOn: null },
    ],
  },

  {
    id: 'bankruptcy',
    label: 'Standard Bankruptcy',
    category: 'practice_area',
    enabled: true,
    questions: [
      { id: 'first_name',        label: 'First Name',                                                    fieldType: 'text',     required: true,  options: null,                                                                                      conditionalOn: null },
      { id: 'last_name',         label: 'Last Name',                                                     fieldType: 'text',     required: true,  options: null,                                                                                      conditionalOn: null },
      { id: 'phone_number',      label: 'Phone Number',                                                  fieldType: 'phone',    required: true,  options: null,                                                                                      conditionalOn: null },
      { id: 'message',           label: 'Message',                                                       fieldType: 'textarea', required: false, options: null,                                                                                      conditionalOn: null },
      { id: 'accounts_frozen',   label: 'Are your bank accounts frozen or about to be?',                 fieldType: 'dropdown', required: true,  options: ['Yes', 'No'],                                                                             conditionalOn: null },
      { id: 'wages_garnished',   label: 'Are your wages being garnished, or about to be garnished?',     fieldType: 'dropdown', required: true,  options: ['Currently being garnished', 'About to be garnished', 'No', 'Unsure'],                   conditionalOn: null },
      { id: 'foreclosure',       label: 'Is your house in foreclosure?',                                 fieldType: 'dropdown', required: true,  options: ['Yes', 'No'],                                                                             conditionalOn: null },
      { id: 'sale_imminent',     label: 'Is the sale date imminent?',                                    fieldType: 'dropdown', required: false, options: ['Yes', 'No'],                                                                             conditionalOn: { fieldId: 'foreclosure', value: 'Yes' } },
      { id: 'married',           label: 'Are you married?',                                              fieldType: 'dropdown', required: true,  options: ['Yes', 'No'],                                                                             conditionalOn: null },
      { id: 'filing_jointly',    label: 'Are you filing jointly?',                                       fieldType: 'dropdown', required: false, options: ['Yes', 'No', 'N/A'],                                                                     conditionalOn: { fieldId: 'married', value: 'Yes' } },
    ],
  },

  {
    id: 'immigration',
    label: 'Standard Immigration',
    category: 'practice_area',
    enabled: true,
    questions: [
      { id: 'first_name',       label: 'First Name',                                               fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'middle_name',      label: 'Middle Name',                                              fieldType: 'text',     required: false, options: null, conditionalOn: null },
      { id: 'last_name',        label: 'Last Name',                                                fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'suffix',           label: 'Suffix (if available)',                                    fieldType: 'text',     required: false, options: null, conditionalOn: null },
      { id: 'phone_number',     label: 'Phone Number',                                             fieldType: 'phone',    required: true,  options: null, conditionalOn: null },
      { id: 'email',            label: 'Email Address',                                            fieldType: 'email',    required: false, options: null, conditionalOn: null },
      { id: 'alien_number',     label: 'Alien Number',                                             fieldType: 'text',     required: false, options: null, conditionalOn: null },
      { id: 'immigration_issue', label: 'What is the specific immigration issue you need help with?', fieldType: 'textarea', required: true, options: null, conditionalOn: null },
      { id: 'message',          label: 'Message',                                                  fieldType: 'textarea', required: false, options: null, conditionalOn: null },
    ],
  },

  {
    id: 'real_estate',
    label: 'Standard Real Estate',
    category: 'practice_area',
    enabled: true,
    questions: [
      { id: 'first_name',          label: 'First Name',                                                              fieldType: 'text',     required: true,  options: null,                                             conditionalOn: null },
      { id: 'last_name',           label: 'Last Name',                                                               fieldType: 'text',     required: true,  options: null,                                             conditionalOn: null },
      { id: 'phone_number',        label: 'Phone Number',                                                            fieldType: 'phone',    required: true,  options: null,                                             conditionalOn: null },
      { id: 'message',             label: 'Message',                                                                 fieldType: 'textarea', required: false, options: null,                                             conditionalOn: null },
      { id: 'property_address',    label: 'Property Address',                                                        fieldType: 'text',     required: true,  options: null,                                             conditionalOn: null },
      { id: 'mobile_or_section8',  label: 'Is this a mobile home or section 8 housing?',                             fieldType: 'dropdown', required: true,  options: ['Yes', 'No'],                                    conditionalOn: null },
      { id: 'property_location',   label: 'What county and state is the property located in?',                       fieldType: 'text',     required: true,  options: null,                                             conditionalOn: null },
      { id: 'property_type',       label: 'Is it a commercial or residential property?',                             fieldType: 'dropdown', required: true,  options: ['Commercial', 'Residential'],                    conditionalOn: null },
      { id: 'has_dispute',         label: 'Is there a dispute regarding this property?',                             fieldType: 'dropdown', required: true,  options: ['Yes', 'No', 'N/A'],                             conditionalOn: null },
      { id: 'dispute_nature',      label: 'What is the nature of the dispute?',                                      fieldType: 'text',     required: false, options: null,                                             conditionalOn: { fieldId: 'has_dispute', value: 'Yes' } },
      { id: 'transaction_type',    label: 'What type of Real Estate transaction is this?',                           fieldType: 'dropdown', required: true,  options: ['Buying', 'Selling', 'Refinancing', 'Other'],    conditionalOn: null },
      { id: 'purchase_financing',  label: 'Is there a lender involved or will this be a cash purchase?',             fieldType: 'dropdown', required: false, options: ['Lender', 'Cash purchase', 'N/A'],               conditionalOn: null },
      { id: 'broker',              label: 'Who is your broker?',                                                     fieldType: 'text',     required: false, options: null,                                             conditionalOn: null },
      { id: 'callback_time',       label: 'What is the best time to call you back?',                                 fieldType: 'text',     required: false, options: null,                                             conditionalOn: null },
      { id: 'referral_source',     label: 'How did you hear about us?',                                              fieldType: 'text',     required: false, options: null,                                             conditionalOn: null },
    ],
  },

  {
    id: 'med_mal',
    label: 'Standard Med Mal',
    category: 'practice_area',
    enabled: true,
    questions: [
      { id: 'first_name',          label: 'First Name',                                                           fieldType: 'text',     required: true,  options: null,             conditionalOn: null },
      { id: 'last_name',           label: 'Last Name',                                                            fieldType: 'text',     required: true,  options: null,             conditionalOn: null },
      { id: 'phone_number',        label: 'Phone Number',                                                         fieldType: 'phone',    required: true,  options: null,             conditionalOn: null },
      { id: 'email',               label: 'Email',                                                                fieldType: 'email',    required: false, options: null,             conditionalOn: null },
      { id: 'malpractice_type',    label: 'What type of alleged malpractice is this about?',                      fieldType: 'text',     required: true,  options: null,             conditionalOn: null },
      { id: 'malpractice_date',    label: 'What date did the alleged malpractice occur?',                         fieldType: 'date',     required: true,  options: null,             conditionalOn: null },
      { id: 'facility_name',       label: 'What is the name of the facility/doctor this took place with?',        fieldType: 'text',     required: true,  options: null,             conditionalOn: null },
      { id: 'injuries',            label: 'What injuries do you have as a result of this alleged malpractice?',   fieldType: 'textarea', required: true,  options: null,             conditionalOn: null },
      { id: 'injuries_permanent',  label: 'Are the injuries you sustained due to the alleged malpractice permanent?', fieldType: 'dropdown', required: true, options: ['Yes', 'No'], conditionalOn: null },
      { id: 'message',             label: 'Message',                                                              fieldType: 'textarea', required: false, options: null,             conditionalOn: null },
      { id: 'referral_source',     label: 'How did you hear about the firm?',                                     fieldType: 'text',     required: false, options: null,             conditionalOn: null },
    ],
  },

  {
    id: 'new_client',
    label: 'Standard New Client',
    category: 'practice_area',
    enabled: true,
    questions: [
      { id: 'first_name',    label: 'First Name',    fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'last_name',     label: 'Last Name',     fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'phone_number',  label: 'Phone Number',  fieldType: 'phone',    required: true,  options: null, conditionalOn: null },
      { id: 'email',         label: 'Email Address', fieldType: 'email',    required: false, options: null, conditionalOn: null },
      { id: 'message',       label: 'Message',       fieldType: 'textarea', required: false, options: null, conditionalOn: null },
    ],
  },

  {
    id: 'wills_trusts',
    label: 'Standard Wills / Trusts / Estates / Probate',
    category: 'practice_area',
    enabled: true,
    questions: [
      { id: 'first_name',    label: 'First Name',    fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'last_name',     label: 'Last Name',     fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'phone_number',  label: 'Phone Number',  fieldType: 'phone',    required: true,  options: null, conditionalOn: null },
      { id: 'email',         label: 'Email Address', fieldType: 'email',    required: false, options: null, conditionalOn: null },
      { id: 'message',       label: 'Message',       fieldType: 'textarea', required: false, options: null, conditionalOn: null },
    ],
  },

  {
    id: 'family',
    label: 'Standard Family',
    category: 'practice_area',
    enabled: true,
    questions: [
      { id: 'first_name',     label: 'First Name',                            fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'last_name',      label: 'Last Name',                             fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'phone_number',   label: 'Phone Number',                          fieldType: 'phone',    required: true,  options: null, conditionalOn: null },
      { id: 'email',          label: 'Email Address',                         fieldType: 'email',    required: false, options: null, conditionalOn: null },
      { id: 'matter_type',    label: 'What type of matter is this in regards to?', fieldType: 'text', required: true,  options: null, conditionalOn: null },
      { id: 'message',        label: 'Message',                               fieldType: 'textarea', required: false, options: null, conditionalOn: null },
      { id: 'referral_source', label: 'How did you hear about us?',           fieldType: 'text',     required: false, options: null, conditionalOn: null },
    ],
  },

  {
    id: 'hvac',
    label: 'Standard HVAC',
    category: 'practice_area',
    enabled: false,
    questions: [
      { id: 'first_name',      label: 'First Name',            fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'last_name',       label: 'Last Name',             fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'phone_number',    label: 'Phone Number',          fieldType: 'phone',    required: true,  options: null, conditionalOn: null },
      { id: 'email',           label: 'Email Address',         fieldType: 'email',    required: false, options: null, conditionalOn: null },
      { id: 'address',         label: 'Address',               fieldType: 'address',  required: true,  options: null, conditionalOn: null },
      { id: 'message',         label: 'Message',               fieldType: 'textarea', required: false, options: null, conditionalOn: null },
      { id: 'referral_source', label: 'How did you hear about us?', fieldType: 'text', required: false, options: null, conditionalOn: null },
    ],
  },

  // ── Third-Party Callers ──────────────────────────────────────────────────────

  {
    id: 'courts',
    label: 'Courts',
    category: 'third_party',
    enabled: true,
    questions: [
      { id: 'first_name',     label: 'First Name',                            fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'last_name',      label: 'Last Name',                             fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'phone_number',   label: 'Phone Number',                          fieldType: 'phone',    required: true,  options: null, conditionalOn: null },
      { id: 'email',          label: 'Email',                                 fieldType: 'email',    required: false, options: null, conditionalOn: null },
      { id: 'case_inquiry',   label: 'What case/client are you inquiring about?', fieldType: 'text', required: true,  options: null, conditionalOn: null },
      { id: 'courthouse',     label: 'What Court house are you calling from?', fieldType: 'text',    required: true,  options: null, conditionalOn: null },
      { id: 'message',        label: 'Message',                               fieldType: 'textarea', required: false, options: null, conditionalOn: null },
    ],
  },

  {
    id: 'judges',
    label: 'Judges',
    category: 'third_party',
    enabled: true,
    questions: [
      { id: 'first_name',   label: 'First Name',   fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'last_name',    label: 'Last Name',    fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'phone_number', label: 'Phone Number', fieldType: 'phone',    required: true,  options: null, conditionalOn: null },
      { id: 'message',      label: 'Message',      fieldType: 'textarea', required: false, options: null, conditionalOn: null },
    ],
  },

  {
    id: 'opposing_counsel',
    label: 'Opposing Counsel',
    category: 'third_party',
    enabled: true,
    questions: [
      { id: 'first_name',   label: 'First Name',   fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'last_name',    label: 'Last Name',    fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'phone_number', label: 'Phone Number', fieldType: 'phone',    required: true,  options: null, conditionalOn: null },
      { id: 'message',      label: 'Message',      fieldType: 'textarea', required: false, options: null, conditionalOn: null },
    ],
  },

  {
    id: 'insurance_adjusters',
    label: 'Insurance Adjusters',
    category: 'third_party',
    enabled: true,
    questions: [
      { id: 'first_name',    label: 'First Name',                              fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'last_name',     label: 'Last Name',                               fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'phone_number',  label: 'Phone Number',                            fieldType: 'phone',    required: true,  options: null, conditionalOn: null },
      { id: 'case_inquiry',  label: 'What case/client are they calling about?', fieldType: 'text',    required: true,  options: null, conditionalOn: null },
      { id: 'claim_number',  label: 'What is the file/index/claim number?',    fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'message',       label: 'Message',                                 fieldType: 'textarea', required: false, options: null, conditionalOn: null },
    ],
  },

  {
    id: 'medical_providers',
    label: 'Medical Providers',
    category: 'third_party',
    enabled: true,
    questions: [
      { id: 'first_name',   label: 'First Name',                              fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'last_name',    label: 'Last Name',                               fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'phone_number', label: 'Phone Number',                            fieldType: 'phone',    required: true,  options: null, conditionalOn: null },
      { id: 'case_inquiry', label: 'What case/client are they calling about?', fieldType: 'text',    required: true,  options: null, conditionalOn: null },
      { id: 'claim_number', label: 'What is the file/index/claim number?',    fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'message',      label: 'Message',                                 fieldType: 'textarea', required: false, options: null, conditionalOn: null },
    ],
  },

  {
    id: 'government_agencies',
    label: 'Government Agencies',
    category: 'third_party',
    enabled: true,
    questions: [
      { id: 'first_name',    label: 'First Name',                            fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'last_name',     label: 'Last Name',                             fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'phone_number',  label: 'Phone Number',                          fieldType: 'phone',    required: true,  options: null, conditionalOn: null },
      { id: 'agency_name',   label: 'What agency are you calling from?',     fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'case_ref',      label: 'Client name and/or case number',        fieldType: 'text',     required: true,  options: null, conditionalOn: null },
      { id: 'message',       label: 'Message',                               fieldType: 'textarea', required: false, options: null, conditionalOn: null },
    ],
  },
]

export const DEFAULT_INTAKE_TEMPLATES = withQuestions(RAW_INTAKE_TEMPLATES)

/**
 * AccountConfig — firm identity, LLM, voice providers, call routing.
 *
 * @typedef {Object} AccountConfig
 * @property {string} firmName
 * @property {string} agentName
 * @property {string} llmModel
 * @property {string} llmEndpoint     - empty string = use OpenAI directly
 * @property {string} openaiApiKey
 * @property {string} ttsProvider
 * @property {string} asrProvider
 * @property {string} transferPhone   - attorney's number for blind transfer
 * @property {string} outboundPhone   - caller ID shown on outbound calls
 * @property {string} timezone
 */
export const DEFAULT_ACCOUNT_CONFIG = {
  firmName: 'Law Office of Moira Rose',
  agentName: 'Ava',
  llmModel: 'gpt-4o-2024-11-20',
  llmEndpoint: '',
  openaiApiKey: '',
  ttsProvider: 'rime',
  asrProvider: 'deepgram',
  transferPhone: '',
  outboundPhone: '',
  timezone: 'America/New_York',
}

/**
 * IntakeQuestion — a question the agent asks during a call.
 * Questions are enabled/disabled globally and scoped to caller types.
 *
 * @typedef {Object} IntakeQuestion
 * @property {string}   id
 * @property {string}   label
 * @property {string}   description
 * @property {string[]} callerTypes  - which caller categories this applies to
 * @property {boolean}  enabled
 */
export const DEFAULT_INTAKE_QUESTIONS = [
  {
    id: 'first_name',
    label: 'First Name',
    description: 'Ask the caller for their first name.',
    callerTypes: ['New Client', 'Existing Client', 'Family', 'Third-Party', 'Emergency', 'Court', 'General'],
    enabled: true,
  },
  {
    id: 'last_name',
    label: 'Last Name',
    description: 'Ask the caller for their last name.',
    callerTypes: ['New Client', 'Existing Client', 'Family', 'Third-Party', 'Emergency', 'Court', 'General'],
    enabled: true,
  },
  {
    id: 'phone_number',
    label: 'Phone Number',
    description: 'Ask for a callback phone number. Caller ID is used as a fallback.',
    callerTypes: ['New Client', 'Existing Client', 'Family', 'Third-Party', 'Emergency', 'Court', 'General'],
    enabled: true,
  },
  {
    id: 'email',
    label: 'Email Address',
    description: 'Ask the caller for their email address.',
    callerTypes: ['New Client', 'Existing Client'],
    enabled: false,
  },
  {
    id: 'caller_type',
    label: 'Caller Type',
    description: 'Identify what type of caller this is (new client, existing, family, etc.).',
    callerTypes: ['General'],
    enabled: true,
  },
  {
    id: 'address',
    label: 'Street Address',
    description: "Ask for the caller's full street address.",
    callerTypes: ['New Client'],
    enabled: false,
  },
  {
    id: 'calling_about_case',
    label: 'Case Association Check',
    description: 'Ask general callers if they are calling about an existing case.',
    callerTypes: ['General'],
    enabled: true,
  },
  {
    id: 'additional_summary',
    label: 'Additional Info After Summary',
    description: 'After the AI summary, ask the caller if they want to add or correct anything.',
    callerTypes: ['New Client', 'Existing Client', 'Family', 'Third-Party', 'Emergency', 'Court', 'General'],
    enabled: true,
  },
]

/**
 * ConfirmationQuestion — how the agent confirms a collected value with the caller.
 *
 * @typedef {Object} ConfirmationQuestion
 * @property {string}  id
 * @property {string}  label
 * @property {string}  description
 * @property {boolean} confirmEnabled
 * @property {'repeat'|'phonetic'|'digit'} confirmMethod
 */
export const DEFAULT_CONFIRMATION_QUESTIONS = [
  {
    id: 'first_name',
    label: 'First Name',
    description: 'Spell out using NATO phonetic alphabet (Alpha, Bravo, Charlie…).',
    confirmEnabled: true,
    confirmMethod: 'phonetic',
  },
  {
    id: 'last_name',
    label: 'Last Name',
    description: 'Spell out using NATO phonetic alphabet.',
    confirmEnabled: true,
    confirmMethod: 'phonetic',
  },
  {
    id: 'phone_number',
    label: 'Phone Number',
    description: 'Read back digit by digit.',
    confirmEnabled: true,
    confirmMethod: 'digit',
  },
  {
    id: 'email',
    label: 'Email Address',
    description: 'Read back the full email address.',
    confirmEnabled: false,
    confirmMethod: 'repeat',
  },
  {
    id: 'caller_type',
    label: 'Caller Type',
    description: 'Confirm the identified caller category.',
    confirmEnabled: true,
    confirmMethod: 'repeat',
  },
  {
    id: 'address',
    label: 'Street Address',
    description: 'Read back the full address.',
    confirmEnabled: false,
    confirmMethod: 'repeat',
  },
  {
    id: 'llm_summary',
    label: 'Conversation Summary',
    description: 'Read back the AI-generated summary of the call before transfer.',
    confirmEnabled: true,
    confirmMethod: 'repeat',
  },
]

/**
 * Service — an individual feature or integration that can be toggled on/off.
 * Note: icon is a UI concern and is not part of this model. See SERVICE_ICONS in ToggleServicePage.
 *
 * @typedef {Object} Service
 * @property {string}  id
 * @property {string}  label
 * @property {string}  description
 * @property {boolean} enabled
 * @property {boolean} critical  - if true, disabling requires a confirmation modal
 */
export const DEFAULT_SERVICES = [
  {
    id: 'voice_agent',
    label: 'Voice Agent',
    description: 'The main AI phone receptionist. Disabling stops the agent from answering new calls.',
    enabled: true,
    critical: true,
  },
  {
    id: 'blind_transfer',
    label: 'Blind Call Transfer',
    description: 'Transfer callers directly to the attorney. When disabled, calls end after intake.',
    enabled: true,
    critical: false,
  },
  {
    id: 'llm_rephraser',
    label: 'LLM Rephraser',
    description: 'Rephrase all agent responses through an LLM for more natural speech. Disabling uses raw template responses.',
    enabled: true,
    critical: false,
  },
  {
    id: 'call_summary',
    label: 'Call Summary (GPT-4o)',
    description: 'Generate an AI summary of the call before transfer. Disabling skips the summary step.',
    enabled: true,
    critical: false,
  },
  {
    id: 'asr_deepgram',
    label: 'Deepgram ASR',
    description: 'Speech recognition service. Required for voice input — disable only when using text channel.',
    enabled: true,
    critical: true,
  },
  {
    id: 'google_calendar',
    label: 'Google Calendar',
    description: 'Check attorney availability and suggest appointment times via Google Calendar API.',
    enabled: false,
    critical: false,
  },
  {
    id: 'microsoft_calendar',
    label: 'Microsoft Calendar',
    description: 'Check attorney availability via Microsoft Graph (Outlook/Teams calendar).',
    enabled: false,
    critical: false,
  },
]

/**
 * Creates a fresh account with all config domains set to their defaults.
 * @param {string} firmName
 * @returns {{ id: string, accountConfig: AccountConfig, intakeTemplates: IntakeTemplate[], confirmationQuestions: ConfirmationQuestion[], services: Service[] }}
 */
export function createDefaultAccount(firmName = 'New Firm') {
  return {
    id: `acct_${Date.now()}`,
    accountConfig: { ...DEFAULT_ACCOUNT_CONFIG, firmName },
    intakeTemplates: DEFAULT_INTAKE_TEMPLATES,
    confirmationQuestions: DEFAULT_CONFIRMATION_QUESTIONS,
    services: DEFAULT_SERVICES,
  }
}
