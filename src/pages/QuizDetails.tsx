import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
    BookOpen,
    ChartNoAxesColumnIncreasing,
    CheckCircle2,
    ChevronRight,
    CircleHelp,
    Clock3,
    Eye,
    EyeOff,
    FileUp,
    ListChecks,
    Pencil,
    Play,
    Plus,
    Settings2,
    Trash2,
    Trophy,
    TextCursorInput,
} from 'lucide-react'
import { toast } from 'sonner'

import Loading from '../components/Loading'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { RankingDisplay } from '../components/quiz/RankingDisplay'
import { QuizSettingsModal } from '../components/quiz/QuizSettingsModal'
import QuestionModal from '../components/quiz/QuestionModal'
import ImportQuestionsModal from '../components/quiz/ImportQuestionsModal'
import { useQuizData, type QuestionData } from '../hooks/useQuizData'
import type { Question, Quiz } from '../types/quiz'
import { DifficultyBadge } from '@/components/quiz/DifficultyBadge'

const managementButtonClass =
    'group/action flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

export default function QuizDetails() {
    const { quizId } = useParams<{ quizId: string }>()
    const navigate = useNavigate()

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<'quiz' | 'question' | null>(null)
    const [questionIdToDelete, setQuestionIdToDelete] = useState<string | null>(null)

    const [currentQuestion, setCurrentQuestion] = useState<Question>({
        id: '',
        type: 'multiple-choice',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
    })
    const [isEditing, setIsEditing] = useState(false)

    const {
        quiz,
        questions,
        ranking,
        studyRanking,
        allUserAttempts,
        loading,
        fetchRanking,
        user,
        updateQuizDetails,
        deleteQuiz,
        addQuestion,
        addMultipleQuestions,
        operationLoading,
        updateQuestion,
        deleteQuestion,
        statistics,
        deleteAttempt,
        deleteAllAttempts,
    } = useQuizData()

    const isUntilCorrectMode = quiz?.settings.showAnswersAfter === 'untilCorrect'
    const isImmediatelyMode = quiz?.settings.showAnswersAfter === 'immediately'

    const quizDetails: Partial<Quiz> | undefined = quiz
        ? {
            name: quiz.name,
            description: quiz.description || '',
            difficulty: quiz.difficulty,
            settings: {
                showAnswersAfter: quiz.settings.showAnswersAfter,
                timeLimitPerQuestion: quiz.settings.timeLimitPerQuestion,
            },
        }
        : undefined

    useEffect(() => {
        if (!quizId) {
            navigate('/login')
            return
        }
        fetchRanking('challenge')
        fetchRanking('study')
    }, [quizId, navigate, fetchRanking])

    const handleDeleteQuiz = async () => {
        if (!quiz || operationLoading) return
        setDeleteTarget('quiz')
        setIsDeleteModalOpen(true)
    }

    const handleRemoveQuestion = async (questionId: string) => {
        if (operationLoading) return
        setDeleteTarget('question')
        setQuestionIdToDelete(questionId)
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        try {
            if (deleteTarget === 'quiz') {
                await deleteQuiz()
                navigate('/my-quizzes')
            } else if (deleteTarget === 'question' && questionIdToDelete) {
                await deleteQuestion(questionIdToDelete)
            }
            setIsDeleteModalOpen(false)
            setDeleteTarget(null)
            setQuestionIdToDelete(null)
        } catch (error) {
            console.error('Erro ao excluir:', error)
            toast.error('Erro ao realizar a exclusão.')
        }
    }

    const handleSaveQuestion = async (question: Question) => {
        const questionData: Omit<Question, 'id'> = {
            type: question.type,
            question: question.question,
            ...(question.type === 'multiple-choice' && {
                options: question.options,
                correctAnswer: question.correctAnswer,
                optionFeedback: question.optionFeedback,
            }),
            ...(question.type === 'true-false' && {
                correctAnswer: question.correctAnswer,
            }),
            ...(question.type === 'fill-in-the-blank' && {
                blankAnswer: question.blankAnswer,
            }),
        }

        if (!questionData.question.trim()) {
            toast.error('A pergunta não pode estar vazia.')
            return
        }

        try {
            if (isEditing && question.id) {
                await updateQuestion(question.id, questionData)
            } else {
                await addQuestion(questionData)
            }
            setIsModalOpen(false)
        } catch (error) {
            console.error('Erro ao processar questão:', error)
        }
    }

    const handleSaveImportedQuestions = async (importedQuestions: QuestionData[]) => {
        if (!quizId) {
            console.error('Quiz ID não encontrado para importar perguntas.')
            throw new Error('ID do Quiz não encontrado.')
        }
        if (!addMultipleQuestions) {
            console.error('Função addMultipleQuestions não disponível no hook useQuizData.')
            throw new Error('Funcionalidade de importar não disponível.')
        }

        try {
            await addMultipleQuestions(importedQuestions)
        } catch (error) {
            console.error('Falha ao chamar addMultipleQuestions a partir de QuizDetails:', error)
            throw error
        }
    }

    const openModalForEdit = (question: Question) => {
        setCurrentQuestion({ ...question })
        setIsEditing(true)
        setIsModalOpen(true)
    }

    const openModalForAdd = () => {
        setCurrentQuestion({
            id: '',
            type: 'multiple-choice',
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
        })
        setIsEditing(false)
        setIsModalOpen(true)
    }

    const handlePlayQuiz = () => {
        if (!quizId) return
        if (questions.length === 0) {
            toast.info('Adicione perguntas ao quiz antes de jogar!')
            return
        }
        navigate(`/play-quiz/${quizId}`)
    }

    const handleSaveQuizDetails = async (updatedDetails: Partial<Quiz>) => {
        try {
            await updateQuizDetails(updatedDetails)
            toast.success('Detalhes do quiz atualizados com sucesso!')
            setIsSettingsModalOpen(false)
        } catch (error) {
            console.error('Erro ao salvar detalhes do quiz:', error)
            toast.error('Erro ao salvar detalhes do quiz.')
        }
    }

    if (loading) return <Loading />

    if (!quiz) {
        return (
            <div className="text-muted-foreground flex min-h-[60dvh] items-center justify-center px-4 py-8 text-sm">
                Quiz não encontrado.
            </div>
        )
    }

    const isCreator = quiz.userId === user?.uid
    const modeConfig = isUntilCorrectMode
        ? {
            icon: BookOpen,
            label: 'Modo Estudo',
            description: 'Responde até acertar cada questão',
            colors: 'border-answer-selected-foreground/20 bg-answer-selected text-answer-selected-foreground',
        }
        : isImmediatelyMode
            ? {
                icon: Eye,
                label: 'Respostas Imediatas',
                description: 'Feedback instantâneo após cada resposta',
                colors: 'border-border bg-accent text-accent-foreground',
            }
            : {
                icon: EyeOff,
                label: 'Resultado no Final',
                description: 'Respostas reveladas apenas no final',
                colors: 'border-answer-correct-foreground/20 bg-answer-correct text-answer-correct-foreground',
            }

    const ModeIcon = modeConfig.icon
    const formattedDate = quiz.createdAt?.toDate
        ? quiz.createdAt.toDate().toLocaleDateString('pt-BR')
        : 'N/A'

    return (
        <div className="bg-background text-foreground min-h-full w-full">
            <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-bold tracking-tight wrap-break-word sm:text-3xl">
                            {quiz.name}
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
                            {quiz.description || 'Sem descrição'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handlePlayQuiz}
                        disabled={questions.length === 0 || operationLoading}
                        title={questions.length === 0 ? 'Adicione perguntas para jogar' : 'Jogar o Quiz'}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        <Play size={17} fill="currentColor" />
                        Responder Quiz
                        {questions.length > 0 && (
                            <span className="bg-primary-foreground/15 ml-1 rounded-full px-2 py-0.5 text-xs font-medium">
                                {questions.length} {questions.length === 1 ? 'pergunta' : 'perguntas'}
                            </span>
                        )}
                    </button>
                </div>

                <div className={`mb-8 grid grid-cols-1 gap-4 lg:gap-5 ${isCreator ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2'}`}>
                    <section className="border-border bg-card text-card-foreground min-w-0 rounded-xl border p-5 sm:p-6">
                        <div className="mb-5 flex items-center gap-2.5">
                            <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
                                <CircleHelp size={19} />
                            </div>
                            <h2 className="text-lg font-semibold tracking-tight">Detalhes</h2>
                        </div>

                        <dl className="space-y-4 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <dt className="text-muted-foreground">Criado em</dt>
                                <dd className="font-medium">{formattedDate}</dd>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <dt className="text-muted-foreground">Dificuldade</dt>
                                <dd>
                                    <DifficultyBadge difficulty={quiz.difficulty} />
                                </dd>
                            </div>

                            <div>
                                <dt className="text-muted-foreground mb-2">Modo de resposta</dt>
                                <dd className={`rounded-lg border p-3 ${modeConfig.colors}`}>
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <ModeIcon size={17} />
                                        {modeConfig.label}
                                    </div>
                                    <p className="mt-1 text-xs opacity-85">{modeConfig.description}</p>
                                </dd>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <dt className="text-muted-foreground flex items-center gap-1.5">
                                    <Clock3 size={15} />
                                    Tempo por pergunta
                                </dt>
                                <dd className="font-medium">
                                    {quiz.settings?.timeLimitPerQuestion
                                        ? `${quiz.settings.timeLimitPerQuestion}s`
                                        : 'Sem limite'}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className="border-border bg-card text-card-foreground min-w-0 rounded-xl border p-5 sm:p-6">
                        <div className="mb-5 flex items-center gap-2.5">
                            <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
                                <Trophy size={19} />
                            </div>
                            <h2 className="text-lg font-semibold tracking-tight">Estatísticas</h2>
                        </div>

                        <dl className="space-y-4 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <dt className="text-muted-foreground">Total de participantes</dt>
                                <dd className="font-semibold">{statistics?.totalUniqueUsers || 0}</dd>
                            </div>

                            {!isUntilCorrectMode ? (
                                <>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <dt className="text-muted-foreground">Melhor pontuação</dt>
                                        <dd className="font-semibold">
                                            {ranking.length > 0 && statistics?.bestPercentage !== undefined
                                                ? `${statistics.bestPercentage}%`
                                                : 'N/A'}
                                        </dd>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <dt className="text-muted-foreground">Média geral</dt>
                                        <dd className="font-semibold">
                                            {ranking.length > 0 && statistics?.averagePercentage !== undefined
                                                ? `${statistics.averagePercentage}%`
                                                : 'N/A'}
                                        </dd>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <dt className="text-muted-foreground">Melhor eficiência</dt>
                                        <dd className="font-semibold">
                                            {studyRanking.length > 0 && statistics?.bestEfficiency !== undefined
                                                ? `${statistics.bestEfficiency}%`
                                                : 'N/A'}
                                        </dd>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <dt className="text-muted-foreground">Média de tentativas</dt>
                                        <dd className="font-semibold">
                                            {studyRanking.length > 0 && statistics?.averageTotalAttempts !== undefined
                                                ? statistics.averageTotalAttempts
                                                : 'N/A'}
                                        </dd>
                                    </div>
                                </>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <dt className="text-muted-foreground">Tipo de ranking</dt>
                                <dd>
                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${isUntilCorrectMode ? 'border-answer-selected-foreground/20 bg-answer-selected text-answer-selected-foreground' : 'border-answer-correct-foreground/20 bg-answer-correct text-answer-correct-foreground'}`}>
                                        {isUntilCorrectMode ? (
                                            <>
                                                <ChartNoAxesColumnIncreasing size={14} />
                                                Eficiência
                                            </>
                                        ) : (
                                            <>
                                                <Trophy size={14} />
                                                Pontuação
                                            </>
                                        )}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </section>

                    {isCreator && (
                        <section className="border-border bg-card text-card-foreground min-w-0 rounded-xl border p-5 sm:p-6">
                            <div className="mb-5 flex items-center gap-2.5">
                                <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
                                    <Settings2 size={19} />
                                </div>
                                <h2 className="text-lg font-semibold tracking-tight">Gerenciar Quiz</h2>
                            </div>

                            <div className="space-y-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsSettingsModalOpen(true)}
                                    disabled={operationLoading}
                                    className={`${managementButtonClass} border-primary/25 bg-primary/10 hover:bg-primary/15`}
                                >
                                    <span className="bg-primary/15 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                                        <Pencil size={19} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="text-foreground block text-sm font-semibold">Editar configurações</span>
                                        <span className="text-muted-foreground mt-0.5 block text-xs">Nome, dificuldade e regras</span>
                                    </span>
                                    <ChevronRight size={17} className="text-muted-foreground/70 shrink-0 transition-transform group-hover/action:translate-x-0.5" />
                                </button>

                                <button
                                    type="button"
                                    onClick={openModalForAdd}
                                    disabled={operationLoading}
                                    className={`${managementButtonClass} border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/15`}
                                >
                                    <span className="bg-emerald-500/15 text-emerald-500 flex size-10 shrink-0 items-center justify-center rounded-lg">
                                        <Plus size={21} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="text-foreground block text-sm font-semibold">Adicionar pergunta</span>
                                        <span className="text-muted-foreground mt-0.5 block text-xs">Criar uma questão manualmente</span>
                                    </span>
                                    <ChevronRight size={17} className="text-muted-foreground/70 shrink-0 transition-transform group-hover/action:translate-x-0.5" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(true)}
                                    disabled={operationLoading}
                                    className={`${managementButtonClass} border-sky-500/25 bg-sky-500/10 hover:bg-sky-500/15`}
                                >
                                    <span className="bg-sky-500/15 text-sky-500 flex size-10 shrink-0 items-center justify-center rounded-lg">
                                        <FileUp size={19} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="text-foreground block text-sm font-semibold">Importar perguntas</span>
                                        <span className="text-muted-foreground mt-0.5 block text-xs">Adicionar questões por JSON</span>
                                    </span>
                                    <ChevronRight size={17} className="text-muted-foreground/70 shrink-0 transition-transform group-hover/action:translate-x-0.5" />
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDeleteQuiz}
                                    disabled={operationLoading}
                                    className={`${managementButtonClass} border-destructive/25 bg-destructive/10 hover:bg-destructive/15`}
                                >
                                    <span className="bg-destructive/15 text-destructive flex size-10 shrink-0 items-center justify-center rounded-lg">
                                        <Trash2 size={19} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="text-destructive block text-sm font-semibold">Excluir quiz</span>
                                        <span className="text-muted-foreground mt-0.5 block text-xs">Remover o quiz permanentemente</span>
                                    </span>
                                    <ChevronRight size={17} className="text-destructive/70 shrink-0 transition-transform group-hover/action:translate-x-0.5" />
                                </button>
                            </div>
                        </section>
                    )}
                </div>

                {isCreator && (
                    <section className="border-border bg-card text-card-foreground mb-8 rounded-2xl border p-4 sm:p-6">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                                    <ListChecks size={21} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-semibold tracking-tight">Perguntas</h2>
                                        <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums">
                                            {questions.length}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed sm:text-sm">
                                        Revise e gerencie as questões deste quiz.
                                    </p>
                                </div>
                            </div>

                            {questions.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setIsImportModalOpen(true)}
                                        disabled={operationLoading}
                                        title="Importar perguntas de JSON"
                                        className="border-border bg-background text-foreground hover:bg-accent focus-visible:ring-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                                    >
                                        <FileUp size={16} />
                                        Importar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openModalForAdd}
                                        disabled={operationLoading}
                                        title="Adicionar pergunta manualmente"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                                    >
                                        <Plus size={17} />
                                        Nova pergunta
                                    </button>
                                </div>
                            )}
                        </div>

                        {questions.length === 0 ? (
                            <div className="border-border bg-muted/20 flex flex-col items-center rounded-xl border border-dashed px-4 py-10 text-center">
                                <div className="bg-primary/10 text-primary mb-4 flex size-14 items-center justify-center rounded-2xl">
                                    <ListChecks size={26} />
                                </div>
                                <h3 className="text-foreground text-base font-semibold">Nenhuma pergunta ainda</h3>
                                <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                                    Adicione a primeira pergunta para começar a montar seu quiz.
                                </p>
                                <button
                                    type="button"
                                    onClick={openModalForAdd}
                                    disabled={operationLoading}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Plus size={17} />
                                    Adicionar primeira pergunta
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {questions.map((question, index) => (
                                    <article
                                        key={question.id}
                                        className="group border-border bg-background hover:border-primary/30 flex min-w-0 flex-col gap-4 rounded-xl border p-4 transition-all duration-200 hover:shadow-sm sm:flex-row sm:items-start sm:justify-between sm:gap-5 sm:p-5"
                                    >
                                        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                                            <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold tabular-nums">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-foreground text-sm leading-relaxed font-semibold wrap-break-word sm:text-base">
                                                    {question.question}
                                                </h3>

                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <span className="border-primary/15 bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium">
                                                        {question.type === 'multiple-choice' ? (
                                                            <ListChecks size={14} aria-hidden="true" />
                                                        ) : question.type === 'true-false' ? (
                                                            <CheckCircle2 size={14} aria-hidden="true" />
                                                        ) : (
                                                            <TextCursorInput size={14} aria-hidden="true" />
                                                        )}
                                                        {question.type === 'multiple-choice'
                                                            ? 'Múltipla escolha'
                                                            : question.type === 'true-false'
                                                                ? 'Verdadeiro/Falso'
                                                                : 'Preenchimento'}
                                                    </span>
                                                    {question.type === 'multiple-choice' && (
                                                        <span className="border-border bg-muted/60 text-muted-foreground inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium">
                                                            {question.options?.length ?? 0} opções
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-border flex shrink-0 items-center justify-end gap-2 border-t pt-3 sm:border-0 sm:pt-0">
                                            <button
                                                type="button"
                                                onClick={() => openModalForEdit(question)}
                                                disabled={operationLoading}
                                                title="Editar pergunta"
                                                aria-label={`Editar pergunta ${index + 1}`}
                                                className="border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/10 hover:text-primary focus-visible:ring-ring inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Pencil size={15} />
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => question.id && handleRemoveQuestion(question.id)}
                                                disabled={operationLoading}
                                                title="Excluir pergunta"
                                                aria-label={`Excluir pergunta ${index + 1}`}
                                                className="border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 focus-visible:ring-ring inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Trash2 size={15} />
                                                Excluir
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <section className="border-border bg-card text-card-foreground rounded-xl border p-4 sm:p-6">
                    <RankingDisplay
                        ranking={ranking}
                        studyRanking={studyRanking}
                        allUserAttempts={allUserAttempts}
                        questions={questions}
                        operationLoading={operationLoading}
                        onDeleteAllAttempts={deleteAllAttempts}
                        onDeleteAttempt={deleteAttempt}
                        isCreator={isCreator}
                        currentUserId={user?.uid}
                    />
                </section>

                {isCreator && (
                    <>
                        <QuizSettingsModal
                            isOpen={isSettingsModalOpen}
                            onClose={() => setIsSettingsModalOpen(false)}
                            quizDetails={quizDetails}
                            onSave={handleSaveQuizDetails}
                        />
                        <QuestionModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            question={currentQuestion}
                            onSave={handleSaveQuestion}
                            isEditing={isEditing}
                        />
                        <ImportQuestionsModal
                            isOpen={isImportModalOpen}
                            onClose={() => setIsImportModalOpen(false)}
                            onSaveImportedQuestions={handleSaveImportedQuestions}
                            quizId={quizId || ''}
                        />
                        <ConfirmDeleteModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModalOpen(false)}
                            onConfirm={confirmDelete}
                            title={deleteTarget === 'quiz' ? 'Excluir Quiz' : 'Excluir Pergunta'}
                            message={
                                deleteTarget === 'quiz'
                                    ? `Tem certeza que deseja excluir o quiz "${quiz.name}"? Esta ação não pode ser desfeita.`
                                    : 'Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.'
                            }
                            isLoading={operationLoading}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
