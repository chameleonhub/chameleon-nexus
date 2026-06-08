import {baseApi} from "../../app/baseApi.ts";
import {nexusApi} from "../../app/nexusApi.ts";

export const formApiSlice = nexusApi.injectEndpoints({
    endpoints: build => ({
        getForms: build.query({
            query: () => {
                return `desk/forms/`
            }
        }),
        getFormPermissions: build.query({
            query: (fromId) => {
                return `desk/forms/${fromId}/permissions/`
            }
        })
    })
})

export const {useGetFormPermissionsQuery, useGetFormsQuery} = formApiSlice;
