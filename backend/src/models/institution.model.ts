import mongoose, { Document, Schema } from "mongoose";

export type InstitutionType = "school" | "college" | "university";

const InstitutionSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    type: {
        type: String,
        enum: ["school", "college", "university"],
        required: true,
    },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});

InstitutionSchema.index({ name: "text" });

export interface IInstitution extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    type: InstitutionType;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const InstitutionModel = mongoose.model<IInstitution>("Institution", InstitutionSchema);
