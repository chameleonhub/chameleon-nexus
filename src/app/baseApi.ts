import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {getCookie} from "../utils/AppUtils.ts";

const getCsrfToken = () => getCookie('csrftoken');

export const baseApi = createApi({
    baseQuery: fetchBaseQuery({
            baseUrl: import.meta.env.VITE_KF_API_URL,
            // credentials: "include",
            prepareHeaders: (headers) => {
                let token = localStorage.getItem('token');

                if (token && !/^[a-zA-Z0-9]/.test(token)) {
                    token = import.meta.env.VITE_KOBO_API_TOKEN;
                }

                const csrfToken = getCsrfToken();
                if (csrfToken) {
                    headers.set('X-CSRFToken', csrfToken);  // Include CSRF token in headers
                }
                headers.set("authorization", `TOKEN ${token}`);
                headers.set("Content-Type", "application/json");
                headers.set('Accept', 'application/json');
                return headers;
            },
        },
    ),
    reducerPath: "api",
    // tagTypes: ["Permissions"],
    endpoints: () => ({}),
})