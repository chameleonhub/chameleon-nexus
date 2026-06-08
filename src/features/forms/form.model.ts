import {PermissionType} from "../permissions/Permission.model.ts";

export interface FormType {
    id?: string,
    uid: string,
    name: string,
    access_types: string,
    asset_type:string,
    data:string,
    date_created:string,
    date_deployed:string,
    date_modified:string,
    deployed_version_id:string,
    deployment__active: boolean,
    deployment__submission_count: number,
    deployment_status:string,
    has_deployment: boolean,
    kind:string,
    owner:string,
    owner__username:string,
    parent:string,
    status:string,
    subscribers_count: number,
    tag_string:string,
    url:string,
    version_id:string,
    permissions: PermissionType[]
}

export interface FormInitialState {
    forms: FormType[],
    permissions: PermissionType[]
}
