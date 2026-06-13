import z from "zod";

export const NotificationTypeEnum = z.enum([
    "application_viewed",
    "application_shortlisted",
    "application_interview_scheduled",
    "application_not_selected",
    "application_update",
]);

export const NotificationSchema = z.object({
    userId: z.string().trim(),
    type: NotificationTypeEnum,
    title: z.string().trim(),
    message: z.string().trim(),
    applicationId: z.string().trim().optional(),
    jobId: z.string().trim().optional(),
    isRead: z.boolean().default(false),
    readAt: z.coerce.date().optional(),
});

export type NotificationKind = z.infer<typeof NotificationTypeEnum>;
export type NotificationType = z.infer<typeof NotificationSchema>;
