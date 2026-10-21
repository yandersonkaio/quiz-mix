
import { Link } from 'react-router'
import { ArrowLeft, FileQuestion } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="bg-background text-foreground flex min-h-dvh w-full items-center justify-center px-4 py-12">
            <div className="flex w-full max-w-md flex-col items-center text-center">
                {/* Ícone */}
                <div className="bg-muted text-muted-foreground mb-6 flex size-16 items-center justify-center rounded-2xl">
                    <FileQuestion
                        size={30}
                        strokeWidth={1.6}
                        aria-hidden="true"
                    />
                </div>

                {/* Código do erro */}
                <h1 className="text-foreground text-7xl font-bold tracking-tighter sm:text-8xl">
                    404
                </h1>

                {/* Mensagem */}
                <h2 className="text-foreground mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
                    Página não encontrada
                </h2>

                <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed sm:text-base">
                    Desculpe, mas a página que você está procurando
                    não existe ou foi movida.
                </p>

                {/* Navegação */}
                <Link
                    to="/"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                    <ArrowLeft
                        size={17}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />
                    Voltar para o início
                </Link>
            </div>
        </div>
    )
}
