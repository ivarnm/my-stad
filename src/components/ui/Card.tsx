
export default function Card({ children, className }: { children?: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-(--surface-default) rounded-xl p-3 ${className}`}>{children}</div>
  )
}
