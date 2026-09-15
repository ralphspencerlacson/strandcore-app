import './Brand.css'

export default function Brand({ mark = false, className = '' }: { mark?: boolean; className?: string }) {
  return (
    <svg className={`brand-logo ${className}`} viewBox={mark ? '335 285 880 260' : '290 285 965 430'} aria-hidden="true" focusable="false">
      <image href="/StrandCoreLogo.svg" width="1536" height="1024" />
    </svg>
  )
}
