import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {getCookie} from "../utils/AppUtils.ts";

const getCsrfToken = () => getCookie('csrftoken');


export const baseHeader = (headers: Headers) => {
    let token = localStorage.getItem('token');
    if (token && !/^[a-zA-Z0-9]/.test(token)) {
        token = import.meta.env.VITE_KOBO_API_TOKEN;
    }

    const csrfToken = getCsrfToken();
    if (csrfToken) {
        headers.set('X-CSRFToken', csrfToken);
    }
    headers.set("authorization", `TOKEN ${token}`);
    return headers;
}

export const baseApi = createApi({
    baseQuery: fetchBaseQuery({
            baseUrl: import.meta.env.VITE_KF_API_URL,
            // credentials: "include",
            prepareHeaders: (headers) => {
                const _headers = baseHeader(headers)
                _headers.set("Content-Type", "application/json");
                _headers.set('Accept', 'application/json');
                return _headers;
            },
        },
    ),
    reducerPath: "api",
    // tagTypes: ["Permissions"],
    endpoints: () => ({}),
})