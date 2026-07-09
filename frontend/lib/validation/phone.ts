
export const PHONE_MAX_LENGTH = 10;

export const NEPAL_MOBILE_REGEX = /^9[78]\d{8}$/;

export const PHONE_ERROR_MESSAGE = "Enter a 10-digit number starting with 98 or 97.";

export const sanitizePhoneInput = (value: string) => (
    value.replace(/\D/g, "").slice(0, PHONE_MAX_LENGTH)
);

export const isValidPhone = (value: string) => NEPAL_MOBILE_REGEX.test(value.trim());
