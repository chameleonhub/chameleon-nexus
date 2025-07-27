import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {baseHeader} from "../../app/baseApi.ts";
import {XMLParser} from "fast-xml-parser";
import {XForm, XFormsResponse} from "./xForm.model.ts";


const xmlParser = new XMLParser({
    attributeNamePrefix: "", // Merge attributes into the same level as elements
    ignoreAttributes: false,
    parseAttributeValue: true,
});

export const kcFormApiSlice = createApi({
    baseQuery: fetchBaseQuery({
            baseUrl: import.meta.env.VITE_KC_API_URL,
            prepareHeaders: (headers) => {
                return baseHeader(headers)
            },
        },
    ),
    endpoints: (builder) => ({
        getForms: builder.query<XForm[], void>({
            query: () => ({
                url: 'formlist',
                method: 'GET',
                responseHandler: "text",
            }),
            transformResponse: (response: string): XForm[] => {
                const parser = new XMLParser();
                const parsedData = parser.parse(response) as XFormsResponse;
                return Array.isArray(parsedData.xforms.xform)
                    ? parsedData.xforms.xform
                    : [parsedData.xforms.xform];
            },
        })

    }),
});

export const { useGetFormsQuery} = kcFormApiSlice;