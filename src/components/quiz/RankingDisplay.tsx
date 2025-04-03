import { Attempt } from "../../hooks/useQuizData";

interface RankingDisplayProps {
    ranking: Attempt[];
    totalQuestions: number;
}

export const RankingDisplay = ({ ranking, totalQuestions }: RankingDisplayProps) => {
    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Ranking</h3>
            {ranking.length > 0 ? (
                <div className="space-y-4">
                    {ranking.map((attempt, index) => (
                        <div
                            key={index}
                            className={`flex items-center p-4 rounded-lg ${index === 0 ? "bg-yellow-600" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-yellow-800" : "bg-gray-700"}`}
                        >
                            <span className="mr-4 text-lg font-bold">{index + 1}º</span>
                            {attempt.photoURL && (
                                <img src={attempt.photoURL} alt={attempt.displayName} className="w-10 h-10 rounded-full mr-4" />
                            )}
                            <div>
                                <p className="font-medium">{attempt.displayName}</p>
                                <p className="text-sm text-gray-300">
                                    Acertos: {attempt.correctAnswers} / {totalQuestions}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">Nenhum jogador no ranking ainda.</p>
            )}
        </div>
    );
};