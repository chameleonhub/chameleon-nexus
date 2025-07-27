import { baseApi } from '../../app/baseApi';

export const kfApiSlice = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getFormData: build.query({
            query: ({ formId, limit = 10, offset = 0 }) => {
                console.log('get from data is calling')
                return `assets/${formId}/data/?limit=${limit}&offset=${offset}&format=json`
            }
        }),
    }),
});

export const { useGetFormDataQuery, useLazyGetFormDataQuery } = kfApiSlice; 