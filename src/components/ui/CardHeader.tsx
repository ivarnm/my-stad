
export default function CardHeader({ title, icon }: { title: string; icon?: string }) {
  return (
    <div className='flex gap-2 items-center mb-1'>
      {icon && (
        <span className="material-symbols-outlined text-(--text-subtle)">
          {icon}
        </span>
      )}
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  )
}
