import * as React from 'react';
import {styled} from '@mui/material/styles';
import {
    useTreeItem as useTreeItem2,
    UseTreeItemParameters as UseTreeItem2Parameters,
} from '@mui/x-tree-view/useTreeItem';
import {
    TreeItemContent as TreeItem2Content,
    TreeItemIconContainer as TreeItem2IconContainer,
    TreeItemGroupTransition as TreeItem2GroupTransition,
    TreeItemLabel as TreeItem2Label,
    TreeItemRoot as TreeItem2Root,
    TreeItemCheckbox as TreeItem2Checkbox,
} from '@mui/x-tree-view/TreeItem';
import {TreeItemIcon as TreeItem2Icon} from '@mui/x-tree-view/TreeItemIcon';
import {TreeItemProvider as TreeItem2Provider} from '@mui/x-tree-view/TreeItemProvider';
import {FilterMultiUser, FilterType, UserPermissionTreeType, UserPermissionType} from "./Permission.model.ts";
import {Autocomplete, Stack} from "@mui/material";
import {PARTIAL_PERMIT, selectPermissionTreeData, setPermissionTreeData} from "./permissionSlice.ts";
import TextField from "@mui/material/TextField";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

const PermissionTreeItemContent = styled(TreeItem2Content)(({theme}) => ({
    padding: theme.spacing(1, 1),
    backgroundColor: 'transparent',
    '&:hover': {
        backgroundColor: 'transparent',
    },
}));

interface PermissionTreeItemProps
    extends Omit<UseTreeItem2Parameters, 'rootRef'>,
        Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {
    permitData: UserPermissionType,
    user: string,
    userOptions: string[]
    onOpenUserOptions: () => void
}

export const PermissionTreeItem = React.forwardRef(function PermissionTreeItem(
    props: PermissionTreeItemProps,
    ref: React.Ref<HTMLLIElement>,
) {

    const {id, itemId, label, disabled, children, permitData, user: currentUser, userOptions, onOpenUserOptions, ...other} = props;
    const {
        getRootProps,
        getContentProps,
        getIconContainerProps,
        getCheckboxProps,
        getLabelProps,
        getGroupTransitionProps,
        status,
    } = useTreeItem2({id, itemId, children, label, disabled, rootRef: ref});

    const [userValues, setUserValues] = useState<string[]>([])
    const permissionTreeData: UserPermissionTreeType = useSelector(selectPermissionTreeData);

    const dispatch = useDispatch()

    useEffect(() => {
        const submittedBy: string | FilterMultiUser | undefined = permitData.filters?.find(fltr => fltr._submitted_by)?._submitted_by

        let defaultUserValue: Set<string> = new Set<string>([]);
        if (typeof submittedBy === 'string') {
            defaultUserValue = new Set<string>([submittedBy])
        } else {
            if (submittedBy && Object.prototype.hasOwnProperty.call(submittedBy, '$in')) {
                defaultUserValue = new Set<string>(submittedBy.$in)
            }
        }

        defaultUserValue.add(currentUser)
        setUserValues([...defaultUserValue])

    }, [permitData.filters, currentUser]);

    const changeUserValue = (event, newValue) => {
        const newUsers = [
            currentUser,
            ...newValue.filter(option => option !== currentUser),
        ]
        setUserValues(newUsers);

        if (!getCheckboxProps().checked) return;

        const permissionData: UserPermissionType = permissionTreeData[currentUser][permitData.permission];
        let filters: FilterType[]
        if (newUsers.length > 1) {
            filters = [{_submitted_by: {$in: newUsers}}]
        } else {
            filters = [{_submitted_by: newUsers[0]}]

        }

        dispatch(setPermissionTreeData({
            ...permissionTreeData,
            [currentUser]: {
                ...permissionTreeData[currentUser],
                [permitData.permission]: {
                    ...permissionData,
                    filters,
                },
            },
        }))

    }

    return (
        <TreeItem2Provider id="ad" itemId={itemId}>
            <TreeItem2Root {...getRootProps(other)}>
                <PermissionTreeItemContent {...getContentProps()}>
                    <TreeItem2IconContainer {...getIconContainerProps()}>
                        <TreeItem2Icon status={status}/>
                    </TreeItem2IconContainer>
                    <TreeItem2Checkbox sx={{alignSelf: 'start'}} {...getCheckboxProps()} />
                    <Stack sx={{display: 'flex', width: '50%'}} spacing={1}>
                        <TreeItem2Label {...getLabelProps()} />
                        {(permitData.type === PARTIAL_PERMIT) &&
                            <Autocomplete
                                multiple
                                size={'small'}
                                value={userValues}
                                options={userOptions}
                                disabled={!getCheckboxProps().checked}
                                onOpen={onOpenUserOptions}
                                onChange={changeUserValue}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        label="User name"
                                        placeholder="User name"
                                        onClick={evt => {
                                            evt.preventDefault()
                                            evt.stopPropagation()
                                        }}
                                    />
                                )}
                            />
                        }

                    </Stack>
                </PermissionTreeItemContent>
                {children && <TreeItem2GroupTransition {...getGroupTransitionProps()} />}
            </TreeItem2Root>
        </TreeItem2Provider>
    );
});

