import { z } from 'zod';

// Users Entity Schemas
export const userSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  name: z.string(),
  created_at: z.coerce.date()
});

// Input schema for creating a user
export const createUserInputSchema = z.object({
  email: z.string().email().min(1),
  password_hash: z.string().min(8),
  name: z.string().min(1),
  // created_at and user_id are auto-generated, so they are not included here
});

// Input schema for updating a user
export const updateUserInputSchema = z.object({
  user_id: z.string(),
  email: z.string().email().optional(),
  password_hash: z.string().min(8).optional(),
  name: z.string().min(1).optional(),
});

// Query schema for searching users
export const searchUserInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['name', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Tasks Entity Schemas
export const taskSchema = z.object({
  task_id: z.string(),
  user_id: z.string(),
  task_name: z.string(),
  due_date: z.coerce.date().nullable(),
  is_complete: z.boolean()
});

// Input schema for creating a task
export const createTaskInputSchema = z.object({
  user_id: z.string(),
  task_name: z.string().min(1),
  due_date: z.coerce.date().nullable().optional(),
  is_complete: z.boolean().default(false),
});

// Input schema for updating a task
export const updateTaskInputSchema = z.object({
  task_id: z.string(),
  task_name: z.string().min(1).optional(),
  due_date: z.coerce.date().nullable().optional(),
  is_complete: z.boolean().optional(),
});

// Query schema for searching tasks
export const searchTaskInputSchema = z.object({
  user_id: z.string().optional(),
  query: z.string().optional(),
  is_complete: z.boolean().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['task_name', 'due_date', 'created_at']).default('due_date'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Auth Tokens Entity Schemas
export const authTokenSchema = z.object({
  token_id: z.string(),
  user_id: z.string(),
  auth_token: z.string(),
  created_at: z.coerce.date()
});

// Input schema for creating an auth token
export const createAuthTokenInputSchema = z.object({
  user_id: z.string(),
  auth_token: z.string().min(1),
  // created_at and token_id are auto-generated, so they are not included here
});

// Input schema for updating an auth token
export const updateAuthTokenInputSchema = z.object({
  token_id: z.string(),
  auth_token: z.string().min(1).optional(),
});

// Query schema for searching auth tokens
export const searchAuthTokenInputSchema = z.object({
  user_id: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Search Filters Entity Schemas
export const searchFilterSchema = z.object({
  filter_id: z.string(),
  user_id: z.string(),
  search_query: z.string().nullable(),
  filter_status: z.string().nullable().default('incomplete'),
  created_at: z.coerce.date()
});

// Input schema for creating a search filter
export const createSearchFilterInputSchema = z.object({
  user_id: z.string(),
  search_query: z.string().nullable().optional(),
  filter_status: z.string().optional().default('incomplete'),
  // created_at and filter_id are auto-generated, so they are not included here
});

// Input schema for updating a search filter
export const updateSearchFilterInputSchema = z.object({
  filter_id: z.string(),
  search_query: z.string().nullable().optional(),
  filter_status: z.string().optional(),
});

// Query schema for searching search filters
export const searchSearchFilterInputSchema = z.object({
  user_id: z.string().optional(),
  search_query: z.string().optional(),
  filter_status: z.string().nullable().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Inferred types
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type SearchUserInput = z.infer<typeof searchUserInputSchema>;

export type Task = z.infer<typeof taskSchema>;
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
export type SearchTaskInput = z.infer<typeof searchTaskInputSchema>;

export type AuthToken = z.infer<typeof authTokenSchema>;
export type CreateAuthTokenInput = z.infer<typeof createAuthTokenInputSchema>;
export type UpdateAuthTokenInput = z.infer<typeof updateAuthTokenInputSchema>;
export type SearchAuthTokenInput = z.infer<typeof searchAuthTokenInputSchema>;

export type SearchFilter = z.infer<typeof searchFilterSchema>;
export type CreateSearchFilterInput = z.infer<typeof createSearchFilterInputSchema>;
export type UpdateSearchFilterInput = z.infer<typeof updateSearchFilterInputSchema>;
export type SearchSearchFilterInput = z.infer<typeof searchSearchFilterInputSchema>;