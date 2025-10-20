import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const App = () => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bmi, setBmi] = useState<number | null>(null);
    const [category, setCategory] = useState('');
    const [aiTip, setAiTip] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getBmiCategory = (bmiValue: number): { category: string; color: string } => {
        if (bmiValue < 18.5) return { category: 'Abaixo do peso', color: 'text-blue-500' };
        if (bmiValue >= 18.5 && bmiValue <= 24.9) return { category: 'Peso normal', color: 'text-green-500' };
        if (bmiValue >= 25 && bmiValue <= 29.9) return { category: 'Sobrepeso', color: 'text-yellow-500' };
        if (bmiValue >= 30 && bmiValue <= 34.9) return { category: 'Obesidade Grau I', color: 'text-orange-500' };
        if (bmiValue >= 35 && bmiValue <= 39.9) return { category: 'Obesidade Grau II', color: 'text-red-500' };
        return { category: 'Obesidade Grau III', color: 'text-red-700' };
    };

    const handleCalculate = async () => {
        const h = parseFloat(height);
        const w = parseFloat(weight);

        if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
            setError('Por favor, insira valores válidos para altura e peso.');
            return;
        }

        setError('');
        setIsLoading(true);
        setBmi(null);
        setCategory('');
        setAiTip('');

        const heightInMeters = h / 100;
        const bmiValue = w / (heightInMeters * heightInMeters);
        const { category: bmiCategory } = getBmiCategory(bmiValue);

        setBmi(bmiValue);
        setCategory(bmiCategory);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Para uma pessoa com IMC de ${bmiValue.toFixed(1)}, classificado como '${bmiCategory}', forneça uma dica de saúde curta, encorajadora e útil em português do Brasil. Mantenha a dica com no máximo 25 palavras.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 0 }
                }
            });

            setAiTip(response.text);
        } catch (apiError) {
            console.error("API Error:", apiError);
            setAiTip('Não foi possível carregar a dica da IA no momento.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const bmiResult = bmi !== null && (
        <div id="result" className="mt-8 text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg animate-fade-in" aria-live="polite">
            <p className="text-lg text-gray-600 dark:text-gray-300">Seu IMC é</p>
            <p className="text-6xl font-bold text-gray-800 dark:text-white my-2">{bmi.toFixed(1)}</p>
            <p className={`text-2xl font-semibold ${getBmiCategory(bmi).color}`}>{category}</p>
            {aiTip && (
                 <div className="mt-6 text-left p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-r-lg">
                    <p className="font-semibold text-blue-800 dark:text-blue-300"><i className="fas fa-lightbulb mr-2"></i>Dica da IA</p>
                    <p className="text-blue-700 dark:text-blue-200">{aiTip}</p>
                </div>
            )}
        </div>
    );

    return (
        <main className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-800 dark:to-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transform transition-all duration-500">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Calculadora de IMC</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">com dicas personalizadas por IA</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); handleCalculate(); }}>
                    <div>
                        <label htmlFor="height" className="text-sm font-medium text-gray-700 dark:text-gray-300">Altura (cm)</label>
                        <input
                            id="height"
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder="Ex: 175"
                            className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            aria-required="true"
                        />
                    </div>

                    <div>
                        <label htmlFor="weight" className="text-sm font-medium text-gray-700 dark:text-gray-300">Peso (kg)</label>
                        <input
                            id="weight"
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="Ex: 70"
                            className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            aria-required="true"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || !height || !weight}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-3"></i>
                                    <span>Calculando...</span>
                                </>
                            ) : (
                                <span>Calcular IMC</span>
                            )}
                        </button>
                    </div>
                </form>

                {bmiResult}

            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </main>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
