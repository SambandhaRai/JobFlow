// Single source of truth for phone number rules across the app.
//
// Nepali mobile numbers are exactly 10 digits and start with 98 or 97
// (e.g. 98XXXXXXXX). Enforcing this — instead of a loose 10–15 character
// range — stops people from typing arbitrary values into phone fields.

export const PHONE_MAX_LENGTH = 10;

// 9, then 7 or 8, then 8 more digits → 10 digits total, starting 97/98.
export const NEPAL_MOBILE_REGEX = /^9[78]\d{8}$/;

export const PHONE_ERROR_MESSAGE = "Enter a 10-digit number starting with 98 or 97.";

// Keep only digits and cap at 10 so the field can never hold anything else.
// Use this in onChange handlers for phone inputs.
export const sanitizePhoneInput = (value: string) => (
    value.replace(/\D/g, "").slice(0, PHONE_MAX_LENGTH)
);

export const isValidPhone = (value: string) => NEPAL_MOBILE_REGEX.test(value.trim());
