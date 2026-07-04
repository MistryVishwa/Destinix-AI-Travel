import fs from 'fs';
import path from 'path';
import { Destination } from '../../types';

const DATA_FILE = path.join(process.cwd(), 'data', 'destinations.json');

export const getAllDestinations = async (): Promise<Destination[]> => {
  try {
    const raw = await fs.promises.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Destination[];
  } catch (err) {
    console.error('Failed to read destinations data', err);
    return [];
  }
};

export const getDestinationById = async (id: string): Promise<Destination | null> => {
  const all = await getAllDestinations();
  return all.find(d => d.id === id) || null;
};
