import {
    BulkPermissionType,
    FilterType,
    KoboPermissionType,
    LocalPermissionType,
    PartialPermissionType,
    PermissionTreeType,
    PermissionType,
    UserPermissionTreeType,
    UserPermissionType
} from "../features/permissions/Permission.model.ts";
import {ADD_SUBMISSION, PARTIAL_PERMIT, PARTIAL_SUBMIT} from "../features/permissions/permissionSlice.ts";
import {FormType} from "../features/forms/form.model.ts";


function findWordAfter(url: string, firstWord: string) {
    // Construct a regular expression to capture the word following the firstWord
    const regex = new RegExp(`${firstWord}/([^/]+)`, 'i');

    // Execute the regex against the URL
    const match = url.match(regex);

    // If a match is found, return the captured word; otherwise, return null
    return match ? match[1] : '';
}

function getPermissionName(url: string): string {
    return findWordAfter(url, 'permissions')
}

function makeUrl(word: string, prefix: string = '', suffix: string = ''): string {
    const kfApiUrl = import.meta.env.VITE_KF_API_URL;
    return kfApiUrl + prefix + word + suffix;
}


function getUserPermission(
    userName: string,
    permissionName: string,
    label: string,
    type?: string,
    isExist: boolean = false,
    filters: { filters: FilterType[] } | undefined = (type === PARTIAL_PERMIT && userName ?
        {filters: [{_submitted_by: userName}]} : undefined),
    partial_permissions?: PartialPermissionType[],
    isOwner: boolean = false,): UserPermissionType {

    if (permissionName === ADD_SUBMISSION) {
        filters = undefined;
        partial_permissions = undefined;
        type = undefined;
    }

    return {
        id: userName ? userName.concat('.', permissionName) : permissionName,
        permission: permissionName,
        label,
        isExist,
        type,
        partial_permissions,
        ...filters,
        isOwner
    }

}

export function getPermissionsTree(localPermissions: LocalPermissionType[], user: string = '',): PermissionTreeType {
    const permissionTreeItem: PermissionTreeType = {} as PermissionTreeType;

    localPermissions?.map(({permission, label, type}) => {

        permissionTreeItem[permission] = getUserPermission(user, permission, label, type);
    })
    return permissionTreeItem;
}

export function getBlankPermission(user: string, localPermissions: LocalPermissionType[]) {
    const userPermissionTreeItem: UserPermissionTreeType = {[user]: {}};
    userPermissionTreeItem[user] = getPermissionsTree(localPermissions, user)
    return userPermissionTreeItem;
}

function getPermissionTreePerUser(permissions: PermissionType[], owner) {
    const permissionTree: UserPermissionTreeType = {};
    const selectedPermissions: Set<string> = new Set()
    permissions?.forEach((permission: PermissionType) => {
        const userName = findWordAfter(permission.user, 'users')
        const permissionName = getPermissionName(permission.permission)
        if (!Object.prototype.hasOwnProperty.call(permissionTree, userName)) {
            permissionTree[userName] = {}
        }
        const id = userName.concat('.', permissionName);
        const label = (typeof permission.label === 'string') ? permission.label : permissionName
        const {partial_permissions} = permission

        permissionTree[userName][permissionName] = getUserPermission(userName, permissionName, label, undefined, true, undefined, partial_permissions, userName === owner)

        selectedPermissions.add(id)
    })
    return {permissionTree, selectedPermissions};
}


export function getPermissionsExceptOwner(forms: FormType[], formId: string): PermissionType[] {
    const form = forms?.find(form => form.uid === formId)
    const owner_url = form?.owner;
    return form?.permissions.filter(permission => permission.user != owner_url) as PermissionType[]
}

export function getPermissionPerUser(permissions: PermissionType[], allPermissions?: KoboPermissionType[]): {
    permissionTree: UserPermissionTreeType,
    currentPermissions: Set<string>
} {

    const {permissionTree, selectedPermissions} = getPermissionTreePerUser(permissions, '')

    Object.keys(permissionTree)?.map(user => {
        allPermissions?.map(permission => {

            if (!Object.prototype.hasOwnProperty.call(permissionTree[user][permission.codename], 'id')) {
                permissionTree[user][permission.codename] = {
                    id: user.concat('.', permission.codename),
                    permission: permission.codename,
                    label: permission.name,
                    isExist: false,
                    type: '',
                }
            }

        })
    })

    return {permissionTree, currentPermissions: selectedPermissions};
}

export function getLocalPermissionsPerUser(forms: FormType[], localPermissions: LocalPermissionType[], formId: string) {
    const form = forms?.find(form => form.uid === formId)
    const owner = form?.owner__username
    const permissions: PermissionType[] = form?.permissions as PermissionType[]
    const {permissionTree, selectedPermissions} = getPermissionTreePerUser(permissions, owner)

    Object.keys(permissionTree)?.map(user => {

        permissionTree[user]?.partial_submissions?.partial_permissions?.map(permit => {
            const permissionName = getPermissionName(permit.url)
            const id = user.concat('.', permissionName)

            permissionTree[user][permissionName] = getUserPermission(user,
                permissionName, '', PARTIAL_PERMIT, true, {filters: permit.filters}, null, user === owner)

            selectedPermissions.add(id)
        })

        //update the label and add new that not selected
        localPermissions?.map(({permission, label, type}) => {
            if (!permissionTree[user][permission]) {

                permissionTree[user][permission] = getUserPermission(user, permission, label,
                    type, false, undefined, undefined, user === owner)

            } else {
                permissionTree[user][permission].label = label
                permissionTree[user][permission].type = type
            }

        })
    })
    return {permissionTree, currentPermissions: selectedPermissions, owner};
}


export function convertTreeToPermissions(treeData: UserPermissionTreeType, selectedPermissions: Set<string>): BulkPermissionType[] {
    const bulkPermission: BulkPermissionType[] = []
    Object.keys(treeData).map(user => {
        const partialPermit: PartialPermissionType[] = []
        Object.keys(treeData[user]).map(permission => {
            const permitObj = treeData[user][permission]
            if (!permitObj.isOwner && permission !== PARTIAL_SUBMIT && selectedPermissions.has(permitObj.id)) {
                if (permitObj.type === PARTIAL_PERMIT) {
                    partialPermit.push({
                        url: makeUrl(permission, 'permissions/', '/'),
                        filters: permitObj.filters
                    });
                } else {
                    bulkPermission.push({
                        user: makeUrl(user, 'users/', '/'),
                        permission: makeUrl(permission, 'permissions/', '/')
                    });
                }
            }
        })
        if (partialPermit.length) {
            bulkPermission.push({
                user: makeUrl(user, 'users/', '/'),
                permission: makeUrl(PARTIAL_SUBMIT, 'permissions/', '/'),
                [PARTIAL_PERMIT]: partialPermit
            })
        }

    })
    return bulkPermission;
}
