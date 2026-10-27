import bcrypt from 'bcryptjs';
import { getConfig } from '../config';

export const hashPassword = (plain: string) => bcrypt.hash(plain, getConfig().bcryptRounds);

export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
