import {baseApi} from "../../app/baseApi.ts";
import {nexusApi} from "../../app/nexusApi.ts";
import {GroupType, UserType} from "./User.model.ts";


export const userApiSlice = nexusApi.injectEndpoints({
    endpoints: build => ({
        getUsers: build.query<UserType[], void>({
            query: () => `desk/users/?limit=1000`,
            transformResponse: (response: { results: UserType[] }) => response.results
        })
    })
})

export const koboUserApiSlice = baseApi.injectEndpoints({
    endpoints: build => ({
        getUsersByGroup: build.query<UserType[], string>({
            query: (groupName) => `utils/groups/${groupName}/users/?limit=10000&offset=0`,
            transformResponse: (response: { results: UserType[] }) => response.results
        }),
        getGroups: build.query<GroupType[], void>({
            query: () => `utils/groups/`,
            transformResponse: (response: { results: GroupType[] }) => response.results
        })
    })
})

export const {useGetUsersQuery, useLazyGetUsersQuery} = userApiSlice
export const {useGetGroupsQuery, useGetUsersByGroupQuery} = koboUserApiSlice
