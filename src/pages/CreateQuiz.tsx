import { useState, useEffect } from "react";
import { auth, db } from "../db/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

interface Quiz {
    name: string;
    description?: string;
    userId: string;
    createdAt: any;
    settings: {
        timeLimitPerQuestion?: number;
        allowMultipleAttempts?: boolean;
        showAnswersAfter: "immediately" | "end" | "untilCorrect";
    };
}

function CreateQuiz() {
    const [quiz, setQuiz] = useState<Quiz>({
        name: "",
        userId: "",
        createdAt: null,
        settings: {
            showAnswersAfter: "end",
            allowMultipleAttempts: false,
        },
    });
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (!currentUser) navigate("/login");
            else setQuiz((prev) => ({ ...prev, userId: currentUser.uid }));
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleCreateQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !quiz.name.trim()) return;

        try {
            const settings: Quiz["settings"] = {
                showAnswersAfter: quiz.settings.showAnswersAfter,
                allowMultipleAttempts: quiz.settings.allowMultipleAttempts || false,
            };
            if (quiz.settings.timeLimitPerQuestion !== undefined) {
                settings.timeLimitPerQuestion = quiz.settings.timeLimitPerQuestion;
            }

            const quizRef = await addDoc(collection(db, "quizzes"), {
                name: quiz.name,
                description: quiz.description || "",
                userId: user.uid,
                createdAt: Timestamp.now(),
                settings,
            });
            alert("Quiz criado com sucesso!");
            navigate(`/quiz/details/${quizRef.id}`);
        } catch (error) {
            console.error("Erro ao criar quiz:", error);
            alert("Erro ao criar quiz.");
        }
    };

    if (loading) return <Loading />;
    if (!user) return <div className="text-white">Faça login para criar um quiz.</div>;

    return (
        <div className="min-h-screen bg-gray-900 p-6 text-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold ml-12 md:ml-0">Criar Novo Quiz</h1>
                </div>

                <form onSubmit={handleCreateQuiz} className="space-y-6 mb-8">
                    <div>
                        <label className="block text-gray-300 mb-1">Nome do Quiz</label>
                        <input
                            type="text"
                            value={quiz.name}
                            onChange={(e) => setQuiz({ ...quiz, name: e.target.value })}
                            className="w-full p-3 bg-gray-800 rounded-lg text-white"
                            placeholder="Ex.: Quiz de Biologia"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-1">Descrição (Opcional)</label>
                        <textarea
                            value={quiz.description || ""}
                            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                            className="w-full p-3 bg-gray-800 rounded-lg text-white"
                            placeholder="Descreva o quiz..."
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-1">Mostrar Respostas Corretas</label>
                        <select
                            value={quiz.settings.showAnswersAfter}
                            onChange={(e) =>
                                setQuiz({
                                    ...quiz,
                                    settings: { ...quiz.settings, showAnswersAfter: e.target.value as "immediately" | "end" | "untilCorrect" },
                                })
                            }
                            className="w-full p-3 bg-gray-800 rounded-lg text-white"
                        >
                            <option value="immediately">Logo após cada pergunta</option>
                            <option value="end">Apenas no final do quiz</option>
                            <option value="untilCorrect">Após acertar</option>
                        </select>
                        <p className="text-gray-400 text-sm mt-1">
                            Escolha quando os jogadores verão as respostas corretas.
                        </p>
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-1">Tempo Limite por Pergunta (segundos, opcional)</label>
                        <input
                            type="number"
                            min="1"
                            value={quiz.settings.timeLimitPerQuestion || ""}
                            onChange={(e) =>
                                setQuiz({
                                    ...quiz,
                                    settings: {
                                        ...quiz.settings,
                                        timeLimitPerQuestion: e.target.value ? Number(e.target.value) : undefined,
                                    },
                                })
                            }
                            className="w-full p-3 bg-gray-800 rounded-lg text-white"
                            placeholder="Ex.: 30"
                        />
                        <p className="text-gray-400 text-sm mt-1">
                            Deixe em branco para não ter limite de tempo.
                        </p>
                    </div>
                    <div>
                        <label className="flex items-center text-gray-300 mb-1">
                            <input
                                type="checkbox"
                                checked={quiz.settings.allowMultipleAttempts || false}
                                onChange={(e) =>
                                    setQuiz({
                                        ...quiz,
                                        settings: { ...quiz.settings, allowMultipleAttempts: e.target.checked },
                                    })
                                }
                                className="mr-2 h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                            />
                            Permitir Tentativas Múltiplas
                        </label>
                        <p className="text-gray-400 text-sm mt-1">
                            Se marcado, os jogadores poderão tentar o quiz mais de uma vez.
                        </p>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 cursor-pointer bg-blue-700 rounded-lg hover:bg-blue-600"
                    >
                        Criar Quiz
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateQuiz;