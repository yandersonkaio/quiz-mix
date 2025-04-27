import { Question } from "@/types/quiz";

export const validateQuestionData = (q: Partial<Question>): string[] => {
    const errors: string[] = [];

    if (!q.question || !q.question.trim()) {
        errors.push("A pergunta não pode estar vazia.");
    }

    if (!q.type) {
        errors.push("O tipo da pergunta é obrigatório.");
        return errors;
    }

    switch (q.type) {
        case "multiple-choice":
            if (!q.options || q.options.length < 2) {
                errors.push("Múltipla escolha deve ter pelo menos 2 opções.");
            } else if (q.options.some((opt) => !opt || !opt.trim())) {
                errors.push("Todas as opções de múltipla escolha devem ser preenchidas.");
            }
            if (q.correctAnswer === undefined || q.correctAnswer === null || q.correctAnswer < 0 || (q.options && q.correctAnswer >= q.options.length)) {
                errors.push("Uma resposta correta válida deve ser selecionada para múltipla escolha.");
            }
            break;
        case "true-false":
            if (q.correctAnswer === undefined || q.correctAnswer === null || (q.correctAnswer !== 0 && q.correctAnswer !== 1)) {
                errors.push("Resposta correta para Verdadeiro/Falso deve ser 0 (Falso) ou 1 (Verdadeiro).");
            }
            break;
        case "fill-in-the-blank":
            if (!q.blankAnswer || !q.blankAnswer.trim()) {
                errors.push("Perguntas de preenchimento devem ter uma resposta definida.");
            }

            q.options = undefined;
            q.correctAnswer = undefined;
            break;
        default:
            errors.push(`Tipo de pergunta inválido: ${q.type}`);
    }

    if (q.type !== 'multiple-choice') {
        q.options = undefined;
    }
    if (q.type === 'fill-in-the-blank') {
        q.correctAnswer = undefined;
    } else {
        q.blankAnswer = undefined;
    }


    return errors;
};