import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface Category {
    categoryId: bigint;
    order: bigint;
    name: string;
    createdDate: bigint;
    lastUpdatedDate: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCategory(name: string, order: bigint): Promise<Category>;
    deleteCategory(categoryId: bigint): Promise<boolean>;
    getAllCategories(): Promise<Array<Category>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategoryById(categoryId: bigint): Promise<Category | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    reorderCategories(newOrder: Array<[bigint, bigint]>): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCategory(categoryId: bigint, name: string, order: bigint): Promise<Category>;
}
