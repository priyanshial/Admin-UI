export const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PHONE: 'phone',
  DATE: 'date',
  DROPDOWN: 'dropdown',
  TEXTAREA: 'textarea',
  ADDRESS: 'address',
}

export const INTAKE_CATEGORIES = [
  { value: 'practice_area', label: 'Practice Area' },
  { value: 'third_party', label: 'Third-Party Caller' },
]

export const CALLER_TYPES = [
  'New Client',
  'Existing Client',
  'Family',
  'Third-Party',
  'Emergency',
  'Court',
  'General',
]

export const LLM_MODELS = [
  { value: 'gpt-4o-2024-11-20', label: 'GPT-4o (2024-11-20)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'meta-llama/Meta-Llama-3.1-8B-Instruct', label: 'Llama 3.1 8B (Local)' },
  { value: 'google/gemma-4-26B-A4B-it', label: 'Gemma 4 26B (Local)' },
]

export const TTS_PROVIDERS = [
  { value: 'rime', label: 'Rime (arcana / luna)' },
  { value: 'cartesia', label: 'Cartesia (sonic-3)' },
]

export const ASR_PROVIDERS = [
  { value: 'deepgram', label: 'Deepgram' },
]

export const CONFIRM_METHODS = [
  { value: 'repeat', label: 'Repeat verbatim' },
  { value: 'phonetic', label: 'NATO phonetic spelling' },
  { value: 'digit', label: 'Digit by digit' },
]
