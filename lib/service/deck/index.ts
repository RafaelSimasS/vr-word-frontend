import { AxiosResponse } from "axios";
import axiosClient from "../adapter/axiosClient";

export type Deck = {
  id: string;
  title: string;
  description?: string;
  cardsCount?: number;
  userId?: string;
  createdAt: string;
  updatedAt: string;
};
export type CreateDeckDTO = {
  title: string;
  description?: string;
};

export type UpdateDeckDTO = {
  title?: string;
  description?: string;
};

export const createDeck = async (payload: CreateDeckDTO): Promise<Deck> => {
  const res: AxiosResponse<Deck> = await axiosClient.post("/decks", payload);
  return res.data;
};

export const updateDeck = async (
  id: string,
  payload: UpdateDeckDTO
): Promise<Deck> => {
  const res: AxiosResponse<Deck> = await axiosClient.put(
    `/decks/${id}`,
    payload
  );
  return res.data;
};

export const deleteDeck = async (id: string): Promise<void> => {
  await axiosClient.delete(`/decks/${id}`);
};

export const getDeck = async (id: string): Promise<Deck> => {
  const res: AxiosResponse<Deck> = await axiosClient.get(`/decks/${id}`);
  return res.data;
};

export const listDecks = async (params?: {
  take?: number;
  skip?: number;
}): Promise<Deck[]> => {
  const query: Record<string, unknown> = {};
  if (params?.take !== undefined) query.take = params.take;
  if (params?.skip !== undefined) query.skip = params.skip;

  const res: AxiosResponse<Deck[]> = await axiosClient.get("/decks", {
    params: query,
  });
  return res.data;
};
