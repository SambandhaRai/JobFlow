"use server";

import {
    deleteUser,
    getAllUsers,
    getUserById,
} from "../../api/admin/user";
import type { UserListQuery } from "../../api/endpoints";
import {
    getActionErrorMessage,
    type ActionResult,
    type ApiResult,
    toActionResult,
} from "../action-utils";

export const handleAdminGetAllUsers = async (
    params?: UserListQuery,
): Promise<ActionResult> => {
    try {
        const result = await getAllUsers(params) as ApiResult;
        return toActionResult(result, "Users fetched successfully", "Failed to fetch users");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to fetch users"),
        };
    }
};

export const handleAdminGetUserById = async (id: string): Promise<ActionResult> => {
    try {
        const result = await getUserById(id) as ApiResult;
        return toActionResult(result, "User fetched successfully", "Failed to fetch user");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to fetch user"),
        };
    }
};

export const handleAdminDeleteUser = async (id: string): Promise<ActionResult> => {
    try {
        const result = await deleteUser(id) as ApiResult;
        return toActionResult(result, "User deleted successfully", "Failed to delete user");
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to delete user"),
        };
    }
};
