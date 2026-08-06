const TONES = {
  gray:   'bg-gray-100 text-gray-600',
  blue:   'bg-blue-50 text-blue-700',
  green:  'bg-green-50 text-green-700',
  amber:  'bg-amber-50 text-amber-700',
  red:    'bg-red-50 text-red-700',
  indigo: 'bg-indigo-50 text-indigo-700',
}

export default function Badge({ tone = 'gray', children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${TONES[tone] ?? TONES.gray} ${className}`}>
      {children}
    </span>
  )
}
