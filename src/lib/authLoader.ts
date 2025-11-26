import { redirect } from "react-router-dom";

export const authLoader = () => {
    const authState = localStorage.getItem("auth-storage");
    if (authState) {
        const { state } = JSON.parse(authState);
        if (state.accessToken) {
            return null;
        }
    }
    return redirect("/login");
};
