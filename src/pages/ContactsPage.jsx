import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, X, UserCircle } from 'lucide-react'
import { useAppStore } from '../store/AppContext'
import { getContacts, createContact, updateContact, deleteContact } from '../api/core'
import { parseApiError } from '../api/config'

const EMPTY_CONTACT = {
  first_name: '',
  last_name: '',
  email: '',
  additional_email: '',
  phone: '',
  additional_phone: '',
  office_hours: '',
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  )
}

function ContactForm({ initial = EMPTY_CONTACT, onSave, onCancel, saving, error }) {
  const [form, setForm] = useState(initial)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name">
          <Input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Jane" />
        </Field>
        <Field label="Last Name">
          <Input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Smith" />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@lawfirm.com" />
        </Field>
        <Field label="Additional Email">
          <Input name="additional_email" type="email" value={form.additional_email} onChange={handleChange} placeholder="jane.alt@lawfirm.com" />
        </Field>
        <Field label="Phone">
          <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
        </Field>
        <Field label="Additional Phone">
          <Input name="additional_phone" value={form.additional_phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
        </Field>
        <div className="col-span-2">
          <Field label="Office Hours">
            <Input name="office_hours" value={form.office_hours} onChange={handleChange} placeholder="e.g. 9am–5pm EST" />
          </Field>
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving || !form.first_name.trim()}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

function ContactCard({ contact, onEdit, onDelete }) {
  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 group hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
        <UserCircle className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{fullName || 'Unnamed Contact'}</p>
        <div className="flex items-center gap-3 mt-0.5">
          {contact.email && <p className="text-xs text-gray-400 truncate">{contact.email}</p>}
          {contact.phone && <p className="text-xs text-gray-400">{contact.phone}</p>}
          {contact.office_hours && <p className="text-xs text-gray-400">{contact.office_hours}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
          title="Delete contact"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function ContactsPage() {
  const { activeAccountId } = useAppStore()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    if (!activeAccountId) return
    getContacts(activeAccountId)
      .then(setContacts)
      .catch(() => setContacts([]))
      .finally(() => setLoading(false))
  }, [activeAccountId])

  async function handleCreate(form) {
    setSaving(true)
    setFormError('')
    try {
      const created = await createContact(activeAccountId, form)
      setContacts(prev => [...prev, created])
      setShowNewForm(false)
    } catch (err) {
      setFormError(parseApiError(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(id, form) {
    setSaving(true)
    setFormError('')
    try {
      const updated = await updateContact(activeAccountId, id, form)
      setContacts(prev => prev.map(c => c.id === id ? updated : c))
      setEditingId(null)
    } catch (err) {
      setFormError(parseApiError(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteContact(activeAccountId, id)
      setContacts(prev => prev.filter(c => c.id !== id))
    } catch {}
    setConfirmDelete(null)
  }

  const contactToDelete = contacts.find(c => c.id === confirmDelete)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-gray-400">Loading contacts…</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Contacts</h2>
          <p className="text-sm text-gray-500 mt-0.5">People associated with this firm account.</p>
        </div>
        {!showNewForm && (
          <button
            onClick={() => { setShowNewForm(true); setFormError('') }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        )}
      </div>

      <div className="space-y-2">
        {showNewForm && (
          <ContactForm
            onSave={handleCreate}
            onCancel={() => { setShowNewForm(false); setFormError('') }}
            saving={saving}
            error={formError}
          />
        )}

        {!loading && contacts.length === 0 && !showNewForm && (
          <div className="text-center py-16 text-gray-400">
            <UserCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No contacts yet</p>
            <p className="text-xs mt-1">Add attorneys and staff to this account.</p>
          </div>
        )}

        {contacts.map(contact => (
          editingId === contact.id ? (
            <ContactForm
              key={contact.id}
              initial={contact}
              onSave={(form) => handleUpdate(contact.id, form)}
              onCancel={() => { setEditingId(null); setFormError('') }}
              saving={saving}
              error={formError}
            />
          ) : (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={() => { setEditingId(contact.id); setShowNewForm(false); setFormError('') }}
              onDelete={() => setConfirmDelete(contact.id)}
            />
          )
        ))}
      </div>

      {confirmDelete && contactToDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Delete {[contactToDelete.first_name, contactToDelete.last_name].filter(Boolean).join(' ') || 'this contact'}?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently remove the contact and any associated transfer rules.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
