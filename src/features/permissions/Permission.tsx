import {UserPermissionType} from "./Permission.model.ts";
import {PermissionTreeItem} from "./PermissionTreeItem.tsx";
import {PARTIAL_SUBMIT} from "./permissionSlice.ts";


// type PermissionProps = TreeItem2Props & {
type PermissionProps = {
    userPermission: { [key: string]: UserPermissionType, }
    user: string,
    userOptions: string[]
    onOpenUserOptions: () => void
}


export const Permission = ({userPermission, user, userOptions, onOpenUserOptions}: PermissionProps) => {
    return (
        <>
            {Object.keys(userPermission)?.map(permission => (
                (permission != PARTIAL_SUBMIT) &&
                <PermissionTreeItem
                    permitData={userPermission[permission]}
                    user={user}
                    userOptions={userOptions}
                    onOpenUserOptions={onOpenUserOptions}
                    itemId={userPermission[permission].id}
                    label={userPermission[permission].label}
                    key={userPermission[permission].id}/>
            ))}
        </>
    );
};
