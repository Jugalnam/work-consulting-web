import ReactMarkdown from 'react-markdown'

interface Props {
  children: string
  className?: string
}

export function MarkdownAnswer({ children, className }: Props) {
  return (
    <div className={`markdown-answer ${className ?? ''}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-neutral-900">{children}</strong>
          ),
          h1: ({ children }) => (
            <h3 className="mt-4 mb-2 text-base font-semibold text-neutral-900 first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="mt-4 mb-2 text-base font-semibold text-neutral-900 first:mt-0">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-2 text-base font-semibold text-neutral-900 first:mt-0">
              {children}
            </h3>
          ),
          ul: ({ children }) => <ul className="my-2 list-disc pl-5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal pl-5 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
