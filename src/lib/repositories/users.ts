import { getDb } from '../db';
import { CREATE_USER, FIND_USER_BY_EMAIL, FIND_USER_BY_ID } from '../queries';

export type Role = 'user' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface UserWithPasswordHash extends User {
  passwordHash: string;
}

interface CreateUserProps {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
}

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: Role;
  created_at: string;
}

const toUser = (r: UserRow): User => ({
  id: r.id,
  fullName: r.full_name,
  email: r.email,
  role: r.role,
  createdAt: r.created_at,
});

export const findUserById = async (id: string): Promise<User | undefined> => {
  const result = await getDb().query(FIND_USER_BY_ID, [id]);
  return result.rows[0] ? toUser(result.rows[0]) : undefined;
};

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  const result = await getDb().query(FIND_USER_BY_EMAIL, [email]);
  return result.rows[0] ? toUser(result.rows[0]) : undefined;
};

export const createUser = async ({
  id,
  fullName,
  email,
  passwordHash,
}: CreateUserProps): Promise<User> => {
  const result = await getDb().query(CREATE_USER, [id, fullName, email, passwordHash]);
  return toUser(result.rows[0]);
};

export const findUserByEmailWithHash = async (
  email: string,
): Promise<UserWithPasswordHash | undefined> => {
  const result = await getDb().query(FIND_USER_BY_EMAIL, [email]);
  const row = result?.rows?.[0];

  return row ? { ...toUser(row), passwordHash: row.password_hash } : undefined;
};
