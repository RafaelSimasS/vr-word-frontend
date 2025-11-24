// lib/service/study/index.ts
import axiosClient from "@/lib/service/adapter/axiosClient";
import type { AxiosResponse } from "axios";

export type StudyProgress = {
  id: string;
  userId: string;
  cardId: string;
  easeFactor: number;
  interval: number;
  repetition: number;
  dueDate: string;
  lastReviewed?: string | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
};

export type StudyNextItem = StudyProgress & {
  card: {
    id: string;
    front: string;
    back: string;
    deckId: string;
    createdAt: string;
    updatedAt: string;
  };
};

/**
 * GET /study/next?deckId=...&limit=...
 * returns StudyNextItem[]
 */
export const getNext = async (params?: {
  deckId?: string;
  limit?: number;
}): Promise<StudyNextItem[]> => {
  const res: AxiosResponse<StudyNextItem[]> = await axiosClient.get(
    "/study/next",
    { params }
  );
  return res.data;
};

/**
 * GET /study/:cardId
 */
export const getProgress = async (
  cardId: string
): Promise<StudyProgress | null> => {
  const res: AxiosResponse<StudyProgress> = await axiosClient.get(
    `/study/${cardId}`
  );
  return res.data;
};

/**
 * POST /study/review { cardId, quality }
 */
export const reviewCard = async (payload: {
  cardId: string;
  quality: number;
}) => {
  const res: AxiosResponse<StudyProgress> = await axiosClient.post(
    "/study/review",
    payload
  );
  return res.data;
};
