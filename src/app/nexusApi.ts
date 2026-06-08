import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {baseHeader} from "./baseApi.ts";

const nexusApiBaseUrl = import.meta.env.DEV ? "/nexus-api/" : "/api/";

export const nexusApi = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: nexusApiBaseUrl,
        prepareHeaders: (headers) => {
            const nextHeaders = baseHeader(headers);
            nextHeaders.set("Content-Type", "application/json");
            nextHeaders.set("Accept", "application/json");
            return nextHeaders;
        },
    }),
    reducerPath: "nexusApi",
    endpoints: () => ({}),
});
