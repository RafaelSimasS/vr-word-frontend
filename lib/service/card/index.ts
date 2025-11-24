// lib/service/card/index.ts
import axiosClient from "@/lib/service/adapter/axiosClient";
import type { AxiosResponse } from "axios";

export type Card = {
  id: string;
  front: string;
  back: string;
  deckId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCardDTO = {
  front: string;
  back: string;
  deckId: string;
};

export type UpdateCardDTO = {
  front?: string;
  back?: string;
};

/**
 * Requests
 */
export const createCard = async (payload: CreateCardDTO): Promise<Card> => {
  const res: AxiosResponse<Card> = await axiosClient.post("/cards", payload);
  return res.data;
};

export const updateCard = async (
  id: string,
  payload: UpdateCardDTO
): Promise<Card> => {
  const res: AxiosResponse<Card> = await axiosClient.put(
    `/cards/${id}`,
    payload
  );
  return res.data;
};

export const deleteCard = async (id: string): Promise<void> => {
  await axiosClient.delete(`/cards/${id}`);
};

export const getCard = async (id: string): Promise<Card> => {
  const res: AxiosResponse<Card> = await axiosClient.get(`/cards/${id}`);
  return res.data;
};

/**
 * listCards expects query param deckId
 */
export const listCards = async (params: {
  deckId: string;
  take?: number;
  skip?: number;
}): Promise<Card[]> => {
  const { deckId, take, skip } = params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = { deckId };
  if (take !== undefined) query.take = take;
  if (skip !== undefined) query.skip = skip;
  const res: AxiosResponse<Card[]> = await axiosClient.get("/cards", {
    params: query,
  });
  return res.data;
};
