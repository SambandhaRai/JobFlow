export type ApiResult<TData = unknown> = {
    success: boolean;
    data?: TData;
    token?: string;
    message?: string;
};

export type ActionResult<TData = unknown> =
    | {
        success: true;
        data?: TData;
        token?: string;
        message: string;
    }
    | {
        success: false;
        message: string;
    };

export const getActionErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
};

export const toActionResult = <TData = unknown>(
    result: ApiResult<TData>,
    successMessage: string,
    fallbackMessage: string,
): ActionResult<TData> => {
    if (result.success) {
        return {
            success: true,
            data: result.data,
            token: result.token,
            message: successMessage,
        };
    }

    return {
        success: false,
        message: result.message || fallbackMessage,
    };
};
