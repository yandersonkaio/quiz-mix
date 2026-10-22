import { ChoiceOptions } from './question-display/ChoiceOptions'
import { FillInTheBlank } from './question-display/FillInTheBlank'
import { QuestionActions } from './question-display/QuestionActions'
import { QuestionHeader } from './question-display/QuestionHeader'
import { useQuestionAnswer } from './question-display/useQuestionAnswer'
import type { QuestionDisplayProps } from './question-display/types'

export function QuestionDisplay(props: QuestionDisplayProps) {
    return <QuestionDisplayContent key={props.question.id} {...props} />
}

function QuestionDisplayContent({
    question,
    onAnswer,
    showAnswersAfter,
    onNext,
    currentAttempt,
    isLastQuestion = false,
}: QuestionDisplayProps) {
    const {
        selectedAnswer,
        isSubmitted,
        incorrectAnswers,
        inputValue,
        setInputValue,
        latestAttempt,
        isCorrect,
        handleOptionClick,
        handleSubmit,
        handleInputSubmit,
    } = useQuestionAnswer({
        question,
        onAnswer,
        showAnswersAfter,
        onNext,
        currentAttempt,
        isLastQuestion,
    })

    const isUntilCorrect = showAnswersAfter === 'untilCorrect'

    return (
        <section
            aria-label="Pergunta do quiz"
            className="border-border bg-card text-card-foreground w-full min-w-0 overflow-hidden rounded-2xl border shadow-sm"
        >
            <div className="px-4 pt-5 pb-5 sm:px-7 sm:pt-7 sm:pb-7">
                <QuestionHeader
                    question={question}
                    showAnswersAfter={showAnswersAfter}
                />

                <ChoiceOptions
                    question={question}
                    selectedAnswer={selectedAnswer}
                    incorrectAnswers={incorrectAnswers}
                    latestAttempt={latestAttempt}
                    isCorrect={isCorrect}
                    isSubmitted={isSubmitted}
                    showAnswersAfter={showAnswersAfter}
                    onSelect={handleOptionClick}
                />

                {question.type === 'fill-in-the-blank' && (
                    <FillInTheBlank
                        inputValue={inputValue}
                        onInputChange={setInputValue}
                        onSubmit={handleInputSubmit}
                        isUntilCorrect={isUntilCorrect}
                        isCorrect={isCorrect}
                        hasIncorrectAnswers={incorrectAnswers.size > 0}
                        isSubmitted={isSubmitted}
                    />
                )}

                <QuestionActions
                    questionType={question.type}
                    showAnswersAfter={showAnswersAfter}
                    selectedAnswer={selectedAnswer}
                    isCorrect={isCorrect}
                    hasIncorrectAnswers={incorrectAnswers.size > 0}
                    isLastQuestion={isLastQuestion}
                    onSubmit={handleSubmit}
                    onNext={onNext}
                />
            </div>
        </section>
    )
}
