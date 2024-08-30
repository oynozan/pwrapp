import { model, Schema } from "mongoose";

export interface IApp {
    _id: string;
    token: string;
    name: string;
    redirect: string;
}

const appSchema = new Schema<IApp>(
    {
        _id: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        redirect: {
            type: String,
            required: true,
        },
    },
    { timestamps: true, _id: false },
);

const AppModel = model("apps", appSchema);
export default AppModel;
