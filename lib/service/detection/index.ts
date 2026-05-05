import axiosClient from "../adapter/axiosClient";

export type DetectedObject = {
  /** Nome do objeto em inglês (como retorna o modelo) */
  labelEn: string;
  /** Nome do objeto em português (traduzido pelo backend) */
  labelPt: string;
  /** Score de confiança 0-1 */
  score: number;
};

export type DetectionResult = {
  objects: DetectedObject[];
};

export type GeneratedCard = {
  word: string;
  sentences: Array<{ en: string; pt: string }>;
};

/**
 * Envia uma imagem (base64 sem prefixo data:...) para detecção de objetos.
 * Retorna uma lista de candidatos ordenados por score.
 */
export const detectObjects = async (
  imageBase64: string,
): Promise<DetectionResult> => {
  const res = await axiosClient.post<DetectionResult>("/detect", {
    image: imageBase64,
  });
  return res.data;
};

/**
 * Gera frases em inglês e tradução para um objeto detectado.
 */
export const generateCardsForWord = async (
  word: string,
  deckId?: string,
): Promise<GeneratedCard> => {
  const res = await axiosClient.post<GeneratedCard>("/generate", {
    word,
    deckId,
  });
  return res.data;
};
