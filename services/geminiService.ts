import { GoogleGenAI } from "@google/genai";
import { CartItem } from "../types";

// Helper to interact with Gemini
export const getRecipeSuggestion = async (cartItems: CartItem[], userQuery?: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "Desculpe, o serviço de IA está temporariamente indisponível (Chave de API ausente).";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Create a context string from cart items
    const ingredients = cartItems.map(item => `${item.quantity}x ${item.name}`).join(", ");
    
    const context = `
      Você é o "Chef Formento", um assistente culinário virtual do supermercado Formento Express em Itajaí.
      O cliente tem os seguintes itens no carrinho: ${ingredients || "Nenhum item ainda"}.
      
      Objetivo: Sugerir uma receita rápida ou dar uma dica culinária baseada NESSES ingredientes.
      Se o usuário perguntar algo específico, responda diretamente.
      Se o carrinho estiver vazio, sugira uma oferta do dia (invente uma oferta plausível de carne ou cerveja).
      Mantenha a resposta curta, amigável e com emojis. Use no máximo 2 parágrafos.
    `;

    const prompt = userQuery || "O que posso cozinhar com isso?";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${context}\n\nUsuário: ${prompt}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Fast response for UI
      }
    });

    return response.text || "Não consegui pensar em nada agora, mas que tal um churrasco?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ops! Tive um problema ao consultar meu livro de receitas digital. Tente novamente!";
  }
};