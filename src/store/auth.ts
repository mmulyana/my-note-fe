import { atom } from 'jotai';
import { getToken } from '../lib/auth';

export const authTokenAtom = atom<string | null>(getToken());
