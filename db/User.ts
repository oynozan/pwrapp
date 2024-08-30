import { model, Schema } from "mongoose";

export interface IUser {
    _id: string;
    wallet: string;
    privateKey: string;
    appID: string;
    type: 'discord' | 'google';
    email?: string;
    pfp?: string;
}

const userSchema = new Schema<IUser>(
    {
        _id: {
            type: String,
            required: true,
        },
        wallet: {
            type: String,
            required: true,
            index: true,
        },
        privateKey: {
            type: String,
            required: true,
        },
        appID: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        pfp: {
            type: String,
        },
    },
    {
        timestamps: true,
        _id: false,
    },
);

const UserModel = model("users", userSchema);
export default UserModel;
