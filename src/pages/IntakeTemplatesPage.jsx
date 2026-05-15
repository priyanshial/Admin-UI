import { useState } from 'react'
import { Save, ChevronRight, ChevronDown, GitBranch } from 'lucide-react'
import { useAppStore } from '../store/AppContext'

const FIELD_TYPE_STYLES = {
  text:     'bg-gray-100 text-gray-500',
  email:    'bg-purple-50 text-purple-600',
  phone:    'bg-green-50 text-green-600',
  date:     'bg-orange-50 text-orange-600',
  dropdown: 'bg-blue-50 text-blue-600',
  textarea: 'bg-gray-100 text-gray-500',
  address:  'bg-yellow-50 text-yellow-600',
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={e => { e.stopPropagation(); onChange() }}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function QuestionRow({ question, onToggle, onQuestionChange }) {
  const enabled = question.enabled ?? true
  return (
    <div className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-opacity ${enabled ? '' : 'opacity-40'}`}>
      <div className="mt-0.5">
        <Toggle checked={enabled} onChange={onToggle} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{question.label}</p>
        <input
          type="text"
          value={question.question ?? ''}
          onChange={e => onQuestionChange(e.target.value)}
          placeholder="Enter the question the agent will speak…"
          className="mt-1 w-full text-xs text-gray-500 bg-transparent border-0 border-b border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none focus:text-gray-700 transition-colors placeholder-gray-300"
        />
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
        {question.conditionalOn && (
          <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
            <GitBranch className="w-2.5 h-2.5" />
            conditional
          </span>
        )}
        {question.required && (
          <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-500 border border-red-100 rounded-full">
            required
          </span>
        )}
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${FIELD_TYPE_STYLES[question.fieldType] ?? 'bg-gray-100 text-gray-500'}`}>
          {question.fieldType}
        </span>
      </div>
    </div>
  )
}

function TemplateCard({ template, onToggleTemplate, onToggleQuestion, onQuestionChange }) {
  const [expanded, setExpanded] = useState(false)
  const enabledCount = template.questions.filter(q => q.enabled ?? true).length

  return (
    <div className={`bg-white rounded-xl border transition-colors ${template.enabled ? 'border-gray-200' : 'border-gray-100'}`}>
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-gray-400 shrink-0">
          {expanded
            ? <ChevronDown className="w-4 h-4" />
            : <ChevronRight className="w-4 h-4" />
          }
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${template.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
            {template.label}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {enabledCount} / {template.questions.length} questions enabled
          </p>
        </div>
        <Toggle checked={template.enabled} onChange={onToggleTemplate} />
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-3 pt-2 space-y-0.5">
          {template.questions.map(q => (
            <QuestionRow
              key={q.id}
              question={q}
              onToggle={() => onToggleQuestion(q.id)}
              onQuestionChange={text => onQuestionChange(q.id, text)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SectionGroup({ title, templates, onToggleTemplate, onToggleQuestion, onQuestionChange }) {
  return (
    <section>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-2">
        {templates.map(t => (
          <TemplateCard
            key={t.id}
            template={t}
            onToggleTemplate={() => onToggleTemplate(t.id)}
            onToggleQuestion={(qId) => onToggleQuestion(t.id, qId)}
            onQuestionChange={(qId, text) => onQuestionChange(t.id, qId, text)}
          />
        ))}
      </div>
    </section>
  )
}

export default function IntakeTemplatesPage() {
  const { intakeTemplates, saveIntakeTemplates } = useAppStore()

  // Ensure every question has an explicit `enabled` flag (defaults to true for questions loaded
  // from DEFAULT_INTAKE_TEMPLATES which don't include it yet)
  const [templates, setTemplates] = useState(() =>
    intakeTemplates.map(t => ({
      ...t,
      questions: t.questions.map(q => ({ enabled: true, ...q })),
    }))
  )
  const [saved, setSaved] = useState(false)

  function toggleTemplate(id) {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t))
    setSaved(false)
  }

  function toggleQuestion(templateId, questionId) {
    setTemplates(prev =>
      prev.map(t =>
        t.id === templateId
          ? { ...t, questions: t.questions.map(q => q.id === questionId ? { ...q, enabled: !q.enabled } : q) }
          : t
      )
    )
    setSaved(false)
  }

  function changeQuestion(templateId, questionId, text) {
    setTemplates(prev =>
      prev.map(t =>
        t.id === templateId
          ? { ...t, questions: t.questions.map(q => q.id === questionId ? { ...q, question: text } : q) }
          : t
      )
    )
    setSaved(false)
  }

  function handleSave() {
    saveIntakeTemplates(templates)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const practiceAreas = templates.filter(t => t.category === 'practice_area')
  const thirdParty = templates.filter(t => t.category === 'third_party')
  const general = templates.filter(t => t.category === 'general')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Intake Templates</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Enable templates and toggle individual questions per call type.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <SectionGroup
          title="Practice Areas"
          templates={practiceAreas}
          onToggleTemplate={toggleTemplate}
          onToggleQuestion={toggleQuestion}
          onQuestionChange={changeQuestion}
        />
        <SectionGroup
          title="Third-Party Callers"
          templates={thirdParty}
          onToggleTemplate={toggleTemplate}
          onToggleQuestion={toggleQuestion}
          onQuestionChange={changeQuestion}
        />
        {general.length > 0 && (
          <SectionGroup
            title="General"
            templates={general}
            onToggleTemplate={toggleTemplate}
            onToggleQuestion={toggleQuestion}
            onQuestionChange={changeQuestion}
          />
        )}
      </div>
    </div>
  )
}
