import { ChoiceOptions } from './question-display/ChoiceOptions'
import { FillInTheBlank } from './question-display/FillInTheBlank'
import { QuestionActions } from './question-display/QuestionActions'
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
        <div className="border-border bg-card text-card-foreground w-full min-w-0 rounded-xl border p-4 sm:p-6">
            <div className="mb-6">
                <h2 className="text-foreground text-lg leading-relaxed font-semibold tracking-tight wrap-break-word sm:text-xl">
                    {question.question}
                </h2>
            </div>

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
                isLastQuestion={isLastQuestion}
                onSubmit={handleSubmit}
                onNext={onNext}
            />
        </div>
    )
}
