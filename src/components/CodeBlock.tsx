
import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import Prism from 'prismjs'

import 'prismjs/themes/prism.css'
import 'prismjs/components/prism-json'

interface CodeBlockProps {
    code: string
    language?: string
}

export function CodeBlock({
    code,
    language = 'javascript',
}: CodeBlockProps) {
    const [copied, setCopied] = useState(false)

    const codeRef = useRef<HTMLElement>(null)
    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    )

    useEffect(() => {
        if (!codeRef.current) return

        codeRef.current.textContent = code

        Prism.highlightElement(codeRef.current)
    }, [code, language])

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current)
            }
        }
    }, [])

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code)

            setCopied(true)

            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current)
            }

            copyTimeoutRef.current = setTimeout(() => {
                setCopied(false)
            }, 2000)
        } catch (error) {
            console.error('Erro ao copiar código:', error)
        }
    }

    return (
        <div
            className="
        border-border bg-muted/40
        w-full min-w-0 overflow-hidden rounded-xl border
        [&_code]:text-shadow-none!
        [&_.token]:text-shadow-none!
        [&_.token.comment]:text-muted-foreground!
        [&_.token.prolog]:text-muted-foreground!
        [&_.token.doctype]:text-muted-foreground!
        [&_.token.cdata]:text-muted-foreground!
        [&_.token.punctuation]:text-muted-foreground!
        [&_.token.keyword]:text-primary!
        [&_.token.boolean]:text-primary!
        [&_.token.number]:text-primary!
        [&_.token.property]:text-foreground!
        [&_.token.string]:text-foreground!
        [&_.token.function]:text-foreground!
        [&_.token.operator]:text-foreground!
        [&_.token.operator]:bg-transparent!
        [&_.token.entity]:bg-transparent!
      "
        >
            {/* Cabeçalho */}
            <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-2.5">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {language}
                </span>

                <button
                    type="button"
                    onClick={handleCopy}
                    aria-label={copied ? 'Código copiado' : 'Copiar código'}
                    title={copied ? 'Copiado!' : 'Copiar código'}
                    className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-lg px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                    {copied ? (
                        <>
                            <Check size={15} />
                            Copiado!
                        </>
                    ) : (
                        <>
                            <Copy size={15} />
                            Copiar
                        </>
                    )}
                </button>
            </div>

            {/* Código */}
            <pre className="m-0! max-w-full overflow-x-auto bg-transparent! p-4 text-sm leading-relaxed">
                <code
                    ref={codeRef}
                    className={`language-${language} bg-transparent! text-foreground!`}
                />
            </pre>
        </div>
    )
}
