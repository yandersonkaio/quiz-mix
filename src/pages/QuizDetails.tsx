import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
    BookOpen,
    ChartNoAxesColumnIncreasing,
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
import { getDifficultyConfig } from '@/utils/quis'

const managementButtonClass =
    'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const iconButtonClass =
    'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-50'

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

    const [quizDetails, setQuizDetails] = useState<Partial<Quiz>>({
        name: '',
        description: '',
        difficulty: undefined,
        settings: {
            showAnswersAfter: 'end',
            timeLimitPerQuestion: undefined,
        },
    })

    useEffect(() => {
        if (!quizId) {
            navigate('/login')
            return
        }
        fetchRanking('challenge')
        fetchRanking('study')
    }, [quizId, navigate, fetchRanking])

    useEffect(() => {
        if (quiz) {
            setQuizDetails({
                name: quiz.name,
                description: quiz.description || '',
                difficulty: quiz.difficulty,
                settings: {
                    showAnswersAfter: quiz.settings.showAnswersAfter,
                    timeLimitPerQuestion: quiz.settings.timeLimitPerQuestion,
                },
            })
        }
    }, [quiz])

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
            setQuizDetails((prev) => {
                const newSettings: Quiz['settings'] = {
                    showAnswersAfter:
                        updatedDetails.settings?.showAnswersAfter ??
                        prev.settings?.showAnswersAfter ??
                        'end',
                    timeLimitPerQuestion:
                        updatedDetails.settings?.timeLimitPerQuestion ??
                        prev.settings?.timeLimitPerQuestion,
                }
                return {
                    ...prev,
                    ...updatedDetails,
                    settings: newSettings,
                }
            })
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
    const difficultyConfig = getDifficultyConfig(quiz.difficulty)

    const difficultyColors =
        quiz.difficulty === 'easy'
            ? 'border-answer-correct-foreground/20 bg-answer-correct text-answer-correct-foreground'
            : quiz.difficulty === 'medium'
                ? 'border-answer-selected-foreground/20 bg-answer-selected text-answer-selected-foreground'
                : quiz.difficulty === 'hard'
                    ? 'border-answer-incorrect-foreground/20 bg-answer-incorrect text-answer-incorrect-foreground'
                    : 'border-border bg-muted text-muted-foreground'

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
                {/* Título e ação principal */}
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

                {/* Detalhes, estatísticas e gerenciamento */}
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
                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${difficultyColors}`}>
                                        {difficultyConfig.icon}
                                        {difficultyConfig.label}
                                    </span>
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
                                    className={managementButtonClass}
                                >
                                    <span>Editar configurações</span>
                                    <Pencil size={17} />
                                </button>
                                <button
                                    type="button"
                                    onClick={openModalForAdd}
                                    disabled={operationLoading}
                                    className={managementButtonClass}
                                >
                                    <span>Adicionar pergunta</span>
                                    <Plus size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(true)}
                                    disabled={operationLoading}
                                    className={managementButtonClass}
                                >
                                    <span>Importar perguntas</span>
                                    <FileUp size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteQuiz}
                                    disabled={operationLoading}
                                    className="border-destructive/25 text-destructive hover:bg-destructive/10 flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <span>Excluir quiz</span>
                                    <Trash2 size={17} />
                                </button>
                            </div>
                        </section>
                    )}
                </div>

                {/* Perguntas - apenas para o criador */}
                {isCreator && (
                    <section className="border-border bg-card text-card-foreground mb-8 rounded-xl border p-5 sm:p-6">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
                                    <ListChecks size={19} />
                                </div>
                                <h2 className="text-lg font-semibold tracking-tight">
                                    Perguntas <span className="text-muted-foreground">({questions.length})</span>
                                </h2>
                            </div>

                            {questions.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsImportModalOpen(true)}
                                        disabled={operationLoading}
                                        title="Importar perguntas de JSON"
                                        aria-label="Importar perguntas de JSON"
                                        className={iconButtonClass}
                                    >
                                        <FileUp size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openModalForAdd}
                                        disabled={operationLoading}
                                        title="Adicionar pergunta manualmente"
                                        aria-label="Adicionar pergunta manualmente"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {questions.length === 0 ? (
                            <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
                                <div className="bg-muted text-muted-foreground mb-4 flex size-14 items-center justify-center rounded-xl">
                                    <Plus size={26} />
                                </div>
                                <h3 className="text-foreground text-base font-semibold">Nenhuma pergunta ainda</h3>
                                <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                                    Adicione perguntas para começar seu quiz.
                                </p>
                                <button
                                    type="button"
                                    onClick={openModalForAdd}
                                    disabled={operationLoading}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Plus size={17} />
                                    Adicionar primeira pergunta
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {questions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        className="border-border bg-background hover:bg-accent/40 group rounded-lg border p-4 transition-colors sm:p-5"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 flex-1 items-start gap-3">
                                                <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold">
                                                    {index + 1}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-foreground text-sm font-medium leading-relaxed wrap-break-word sm:text-base">
                                                        {question.question}
                                                    </h3>
                                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                                        <span className="bg-muted text-muted-foreground inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium">
                                                            {question.type === 'multiple-choice'
                                                                ? 'Múltipla escolha'
                                                                : question.type === 'true-false'
                                                                    ? 'Verdadeiro/Falso'
                                                                    : 'Preenchimento'}
                                                        </span>
                                                        {question.type === 'multiple-choice' && (
                                                            <span className="bg-muted text-muted-foreground inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium">
                                                                4 opções
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openModalForEdit(question)}
                                                    disabled={operationLoading}
                                                    title="Editar pergunta"
                                                    aria-label={`Editar pergunta ${index + 1}`}
                                                    className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-9 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Pencil size={17} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => question.id && handleRemoveQuestion(question.id)}
                                                    disabled={operationLoading}
                                                    title="Excluir pergunta"
                                                    aria-label={`Excluir pergunta ${index + 1}`}
                                                    className="text-destructive hover:bg-destructive/10 inline-flex size-9 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Ranking e histórico de tentativas */}
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

                {/* Modais existentes */}
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
