type Props = {
  icon: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-white border-r border-zinc-200 text-white rounded-md hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}