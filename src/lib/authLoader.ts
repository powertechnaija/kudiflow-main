import { redirect } from "react-router-dom";

export const authLoader = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        return redirect("/login");
    }
    return null;
};
