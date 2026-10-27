import { randomUUID } from 'node:crypto';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { UNIQUE_VOILATION_CODE } from '../lib/constants';
import { logger } from '../lib/logger';
import {
  createUser,
  findUserByEmail,
  findUserByEmailWithHash,
  User,
} from '../lib/repositories/users';
import { LoginInput, RegisterInput } from '../lib/schemas';
import { ApiError } from '../utils/api-errors';

export async function registerUser(input: RegisterInput): Promise<User> {
  try {
    const existingUser = await findUserByEmail(input.email);
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    logger.error(`Email already exists - ${error}`);
    throw ApiError.internalServer();
  }

  try {
    const passwordHash = await hashPassword(input.password);
    const user = await createUser({
      id: randomUUID(),
      fullName: input.fullName,
      email: input.email,
      passwordHash,
    });
    return user;
  } catch (error) {
    if ((error as { code?: string }).code === UNIQUE_VOILATION_CODE) {
      throw ApiError.conflict('An account with this email already exists');
    }
    throw error;
  }
}

export async function authenticate(input: LoginInput): Promise<User> {
  try {
    const record = await findUserByEmailWithHash(input.email);
    if (!record) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password');
    }

    const isValid = await verifyPassword(input.password, record?.passwordHash);

    if (!isValid) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password');
    }

    const { passwordHash: _passwordHash, ...user } = record;

    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    logger.error(`Error to get user details - ${error}`);
    throw ApiError.internalServer();
  }
}
