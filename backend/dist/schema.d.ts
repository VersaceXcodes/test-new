import { z } from 'zod';
export declare const userSchema: z.ZodObject<{
    user_id: z.ZodString;
    email: z.ZodString;
    password_hash: z.ZodString;
    name: z.ZodString;
    created_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    email?: string;
    password_hash?: string;
    name?: string;
    created_at?: Date;
}, {
    user_id?: string;
    email?: string;
    password_hash?: string;
    name?: string;
    created_at?: Date;
}>;
export declare const createUserInputSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email?: string;
    name?: string;
    password?: string;
}, {
    email?: string;
    name?: string;
    password?: string;
}>;
export declare const updateUserInputSchema: z.ZodObject<{
    user_id: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    password_hash: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    email?: string;
    password_hash?: string;
    name?: string;
}, {
    user_id?: string;
    email?: string;
    password_hash?: string;
    name?: string;
}>;
export declare const searchUserInputSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["name", "created_at"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "name" | "created_at";
    sort_order?: "asc" | "desc";
}, {
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "name" | "created_at";
    sort_order?: "asc" | "desc";
}>;
export declare const taskSchema: z.ZodObject<{
    task_id: z.ZodString;
    user_id: z.ZodString;
    task_name: z.ZodString;
    due_date: z.ZodNullable<z.ZodDate>;
    is_complete: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    task_id?: string;
    task_name?: string;
    due_date?: Date;
    is_complete?: boolean;
}, {
    user_id?: string;
    task_id?: string;
    task_name?: string;
    due_date?: Date;
    is_complete?: boolean;
}>;
export declare const createTaskInputSchema: z.ZodObject<{
    user_id: z.ZodString;
    task_name: z.ZodString;
    due_date: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    is_complete: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    task_name?: string;
    due_date?: Date;
    is_complete?: boolean;
}, {
    user_id?: string;
    task_name?: string;
    due_date?: Date;
    is_complete?: boolean;
}>;
export declare const updateTaskInputSchema: z.ZodObject<{
    task_id: z.ZodString;
    task_name: z.ZodOptional<z.ZodString>;
    due_date: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    is_complete: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    task_id?: string;
    task_name?: string;
    due_date?: Date;
    is_complete?: boolean;
}, {
    task_id?: string;
    task_name?: string;
    due_date?: Date;
    is_complete?: boolean;
}>;
export declare const searchTaskInputSchema: z.ZodObject<{
    user_id: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
    is_complete: z.ZodOptional<z.ZodBoolean>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["task_name", "due_date", "created_at"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "created_at" | "task_name" | "due_date";
    sort_order?: "asc" | "desc";
    is_complete?: boolean;
}, {
    user_id?: string;
    query?: string;
    limit?: number;
    offset?: number;
    sort_by?: "created_at" | "task_name" | "due_date";
    sort_order?: "asc" | "desc";
    is_complete?: boolean;
}>;
export declare const authTokenSchema: z.ZodObject<{
    token_id: z.ZodString;
    user_id: z.ZodString;
    auth_token: z.ZodString;
    created_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    created_at?: Date;
    token_id?: string;
    auth_token?: string;
}, {
    user_id?: string;
    created_at?: Date;
    token_id?: string;
    auth_token?: string;
}>;
export declare const createAuthTokenInputSchema: z.ZodObject<{
    user_id: z.ZodString;
    auth_token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    auth_token?: string;
}, {
    user_id?: string;
    auth_token?: string;
}>;
export declare const updateAuthTokenInputSchema: z.ZodObject<{
    token_id: z.ZodString;
    auth_token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    token_id?: string;
    auth_token?: string;
}, {
    token_id?: string;
    auth_token?: string;
}>;
export declare const searchAuthTokenInputSchema: z.ZodObject<{
    user_id: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["created_at"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    limit?: number;
    offset?: number;
    sort_by?: "created_at";
    sort_order?: "asc" | "desc";
}, {
    user_id?: string;
    limit?: number;
    offset?: number;
    sort_by?: "created_at";
    sort_order?: "asc" | "desc";
}>;
export declare const searchFilterSchema: z.ZodObject<{
    filter_id: z.ZodString;
    user_id: z.ZodString;
    search_query: z.ZodNullable<z.ZodString>;
    filter_status: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    created_at?: Date;
    filter_id?: string;
    search_query?: string;
    filter_status?: string;
}, {
    user_id?: string;
    created_at?: Date;
    filter_id?: string;
    search_query?: string;
    filter_status?: string;
}>;
export declare const createSearchFilterInputSchema: z.ZodObject<{
    user_id: z.ZodString;
    search_query: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    filter_status: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    search_query?: string;
    filter_status?: string;
}, {
    user_id?: string;
    search_query?: string;
    filter_status?: string;
}>;
export declare const updateSearchFilterInputSchema: z.ZodObject<{
    filter_id: z.ZodString;
    search_query: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    filter_status: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    filter_id?: string;
    search_query?: string;
    filter_status?: string;
}, {
    filter_id?: string;
    search_query?: string;
    filter_status?: string;
}>;
export declare const searchSearchFilterInputSchema: z.ZodObject<{
    user_id: z.ZodOptional<z.ZodString>;
    search_query: z.ZodOptional<z.ZodString>;
    filter_status: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodEnum<["created_at"]>>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    user_id?: string;
    limit?: number;
    offset?: number;
    sort_by?: "created_at";
    sort_order?: "asc" | "desc";
    search_query?: string;
    filter_status?: string;
}, {
    user_id?: string;
    limit?: number;
    offset?: number;
    sort_by?: "created_at";
    sort_order?: "asc" | "desc";
    search_query?: string;
    filter_status?: string;
}>;
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
//# sourceMappingURL=schema.d.ts.map