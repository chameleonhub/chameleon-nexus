import {useDispatch, useSelector} from "react-redux";
import {selectForms} from "../forms/formSlice.ts";
import {
    convertTreeToPermissions,
    getBlankPermission,
    getLocalPermissionsPerUser,
    getPermissionsTree
} from "../../utils/UserPermissionUtils.ts";
import {Permission} from "./Permission.tsx";
import {FormType} from "../forms/form.model.ts";
import {LocalPermissionType, UserPermissionTreeType} from "./Permission.model.ts";
import {
    Autocomplete,
    Box,
    Button,
    ButtonGroup,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Snackbar,
    SnackbarCloseReason,
    Typography
} from "@mui/material";
import {SimpleTreeView, TreeItem as TreeItem2, useTreeViewApiRef} from "@mui/x-tree-view";
import React, {SyntheticEvent, useEffect, useState} from "react";
import {
    selectedPermissionsIds,
    selectLocalPermissions,
    selectPermissionTreeData,
    setPermissionTreeData,
    setSelectedPermissionsIds
} from "./permissionSlice.ts";
import {useGetGroupsQuery, useGetUsersByGroupQuery, useGetUsersQuery} from "../users/userApiSlice.ts";
import {
    GroupAdd as GroupAddIcon,
    GroupRemove as GroupRemoveIcon,
    PersonAdd as PersonAddIcon
} from "@mui/icons-material";
import {useSubmitBulkPermissionMutation} from "./permissionApiSlice.ts";
import TextField from "@mui/material/TextField";
import {UserItem} from "./UserItem.tsx";
import {UserType} from "../users/User.model.ts";

interface PermissionProps {
    formId: string
}


export const Permissions = (props: PermissionProps) => {
    const TEM_PERMISSION_ID = "tmpPermissions";
    const forms: FormType[] = useSelector(selectForms);
    const selectedPermit: [] = useSelector(selectedPermissionsIds);
    const localPermission: LocalPermissionType[] = useSelector(selectLocalPermissions);
    const permissionTreeData: UserPermissionTreeType = useSelector(selectPermissionTreeData);

    const treeRef = useTreeViewApiRef();
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
    const [selectedGroupPermissions, setSelectedGroupPermissions] = useState<Set<string>>(new Set())
    const [owner, setOwner] = useState<string>()
    const [selectedUser, setSelectedUser] = useState('')
    const [selectedGroup, setSelectedGroup] = useState('')
    const [expandedItems, setExpandedItems] = useState([])
    const [toastOpen, setToastOpen] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState('');

    const {data: userList} = useGetUsersQuery()
    const {data: groupList} = useGetGroupsQuery()
    const {data: groupUserList} = useGetUsersByGroupQuery(selectedGroup, {skip: selectedGroup === ''})


    const [submitBulkPermission, {
        isError: isSaveError,
        isSuccess: isSaveSuccess,
        error: saveError
    }] = useSubmitBulkPermissionMutation()

    const dispatch = useDispatch()

    useEffect(() => {
        const {
            permissionTree,
            currentPermissions,
            owner
        } = getLocalPermissionsPerUser(forms, localPermission, props.formId)
        dispatch(setPermissionTreeData(permissionTree))
        setSelectedPermissions(currentPermissions)
        setOwner(owner)
    }, [dispatch, forms, localPermission, props.formId])

    useEffect(() => {
        dispatch(setSelectedPermissionsIds(Array.from(selectedPermissions)))
    }, [dispatch, selectedPermissions])

    useEffect(() => {
        if (isSaveError) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setToastMessage(`Failed!! Error: ${saveError?.error}`)
            setToastOpen(true)

        }
        if (isSaveSuccess) {
            setToastMessage("Successfully Saved")
            setToastOpen(true)
        }
    }, [isSaveSuccess, isSaveError]);


    const addBlankUser = (userList: string[]) => {

        let blankPermission: UserPermissionTreeType = {};
        userList.map(user => {
            const perm = []
            selectedGroupPermissions.forEach(permission => {
                if (permission != TEM_PERMISSION_ID) {
                    perm.push(`${user}.${permission}`)
                }
            })
            setSelectedPermissions(prev => {
                return new Set<string>([...prev, ...perm])
            })

            blankPermission = {...getBlankPermission(user, localPermission), ...blankPermission}
        })
        dispatch(setPermissionTreeData({...blankPermission, ...permissionTreeData}))
    }
    const removeUser = (userList: string[]) => {
        const newPermissionTreeData: UserPermissionTreeType = {...permissionTreeData}
        const itemsToRemove = []
        userList.map(user => {
            selectedPermissions.forEach(permission => {
                if (permission.startsWith(user)) {
                    itemsToRemove.push(permission)
                }
            })
            delete newPermissionTreeData[user];
        })
        setSelectedPermissions(prev => new Set([...prev].filter(permit => !itemsToRemove.includes(permit))))
        dispatch(setPermissionTreeData({...newPermissionTreeData}))
    }
    const getAllPermissions = (): string[] => {
        const allPermissions = []
        Object.keys(permissionTreeData).map(user => {
            Object.keys(getPermissionsTree(localPermission)).map(permission => {
                allPermissions.push(`${user}.${permission}`)
            })
        })
        return allPermissions
    }
    const getAllUsers = (): string[] => {
        return Object.keys(permissionTreeData)
    }

    const handleChangePermission = (event: SyntheticEvent, itemId: string, isSelected: boolean) => {
        if (isSelected) {
            // if item is user
            if (Object.keys(permissionTreeData).includes(itemId)) {
                setSelectedPermissions(prev => {
                    return new Set<string>([...prev, ...Object.values(permissionTreeData[itemId]).map(permit => permit.id), itemId])
                })
            } else {
                setSelectedPermissions(prev => {
                    return new Set<string>([...prev, itemId])
                })
            }

        } else {
            // if item is user
            if (Object.keys(permissionTreeData).includes(itemId)) {
                const itemsToRemove = [...Object.values(permissionTreeData[itemId]).map(permit => permit.id), itemId]
                setSelectedPermissions(prev => new Set([...prev].filter(permit => !itemsToRemove.includes(permit))))
            } else {
                setSelectedPermissions(prev => new Set([...prev].filter(permit => permit != itemId)))
            }
        }
    }
    const handleChangeGroupPermission = (event: SyntheticEvent, itemId: string, isSelected: boolean) => {
        if (isSelected) {
            if (itemId === TEM_PERMISSION_ID) {
                setSelectedGroupPermissions(new Set([
                    ...(Object.values(getPermissionsTree(localPermission)) || []).map(prm => prm.id),
                    TEM_PERMISSION_ID,
                ]));
            } else {
                setSelectedGroupPermissions(prev => {
                    return new Set<string>([...prev, itemId])
                })
            }
        } else {
            if (itemId === TEM_PERMISSION_ID) {
                setSelectedGroupPermissions(new Set([]))
            } else {
                setSelectedGroupPermissions(prev => new Set([...prev].filter(permit => permit != itemId)))
            }
        }
    }
    const handleExpandedItemsChange = (event: React.SyntheticEvent, itemIds: string[],) => {
        setExpandedItems(itemIds)
    }
    const handleChangeUser = (_evt, newUser: UserType) => {
        if (newUser) {
            setSelectedUser(newUser.username);
        }
    }
    const handleAddUser = () => {
        if (selectedUser) {
            addBlankUser([selectedUser])
            setSelectedUser('')
        }
    }
    const handleRemoveUser = () => {
        if (selectedUser) {
            removeUser([selectedUser])
            setSelectedUser('')
        }
    }
    const handleAddGroup = () => {
        if (selectedGroup && groupUserList && groupUserList.length > 0) {
            addBlankUser(groupUserList.map(user => user.username));
        }
    }
    const handleRemoveGroup = () => {
        if (selectedGroup && groupUserList && groupUserList.length > 0) {
            removeUser(groupUserList.map(user => user.username));
        }
    }
    const handleSavePermission = () => {
        const bulkPermission = convertTreeToPermissions(permissionTreeData, selectedPermissions)
        submitBulkPermission({bulkPermission, formId: props.formId})
    }
    const handleChangeGroup = (evt: SelectChangeEvent) => {
        setSelectedGroup(evt.target.value);
    }
    const handleDelete = (item) => {
        removeUser([item])
    }
    const handleSelectAll = () => {
        setSelectedPermissions(new Set<string>(getAllPermissions()))
    }
    const handleUnselectAll = () => {
        setSelectedPermissions(new Set<string>([]))
    }
    const handleExpandAll = () => {
        setExpandedItems(getAllUsers())
    }
    const handleCollapseAll = () => {
        setExpandedItems([])
    }
    const handleSearch = (evt: SyntheticEvent, newValue) => {
        treeRef.current?.focusItem(evt, newValue);
        setExpandedItems(prev => ([...prev, newValue]))
    }
    const handleToastClose = (
        event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (reason === 'clickaway') {
            return;
        }

        setToastOpen(false);
    };

    const handleRemoveAll = () => {
        setSelectedPermissions(new Set([]))
        dispatch(setPermissionTreeData({}))
    }

    const SaveComp = () => {
        return (
            <div className={"mb-5 self-end"}>
                <Button color='success' onClick={handleSavePermission} size='large'
                        variant="contained">Save Permissions</Button>
            </div>
        )
    }

    return (
        <Paper sx={{px: '1rem', my: '1rem'}} elevation={0} variant="outlined">
            <Typography variant="h5" gutterBottom sx={{my: '1rem'}}>
                Assign User Permissions
            </Typography>
            <div className={"flex flex-col"}>
                <Paper sx={{p: '1rem'}} elevation={0} variant="outlined">
                    <SimpleTreeView
                        selectedItems={[...selectedGroupPermissions]}
                        onItemSelectionToggle={handleChangeGroupPermission}
                        multiSelect
                        defaultExpandedItems={[TEM_PERMISSION_ID]}
                        checkboxSelection>
                        <TreeItem2
                            itemId={TEM_PERMISSION_ID}
                            label='Permissions'>
                            {Object.values(getPermissionsTree(localPermission))?.map(permission => (
                                <TreeItem2
                                    key={permission.id}
                                    label={permission.label}
                                    itemId={permission.id}>
                                </TreeItem2>
                            ))}
                        </TreeItem2>
                    </SimpleTreeView>

                    <Paper sx={{p: '.5rem', mt: '1rem'}} elevation={1}>
                        <Box display="flex"
                             alignItems="center"
                             className={'my-5'}
                             gap={2}>
                            <Box display="flex" flexDirection='column' gap={1} width='100%'>
                                <FormControl fullWidth size='small'>
                                    <InputLabel id="group-list-label">Group List</InputLabel>
                                    <Select
                                        labelId="group-list-label"
                                        label="Group List"
                                        value={selectedGroup}
                                        onChange={handleChangeGroup}>
                                        {groupList?.map((group) => (
                                            (group.id !== -1 && !Object.keys(permissionTreeData).includes(group.name)) &&
                                            <MenuItem key={group.id}
                                                      value={group.name}>{group.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Box display="flex" width='100%' justifyContent="space-between">
                                    <Button variant='contained'
                                            onClick={handleAddGroup}
                                            startIcon={<GroupAddIcon/>}
                                            sx={{'minWidth': '10rem', 'maxWidth': '15rem'}}>
                                        Assign Group
                                    </Button>
                                    <Button variant='contained'
                                            onClick={handleRemoveGroup}
                                            startIcon={<GroupRemoveIcon/>}
                                            sx={{'minWidth': '10rem', 'maxWidth': '15rem'}}>
                                        Remove Group
                                    </Button>
                                </Box>


                            </Box>
                            <Box display="flex" flexDirection='column' gap={1} width='100%'>

                                <Autocomplete
                                    clearOnEscape
                                    options={userList || []}
                                    getOptionLabel={(option) => option.username}
                                    loading={false}
                                    value={userList?.find(user => user.username === selectedUser) || null}
                                    getOptionDisabled={user => !(user.id !== -1 && !Object.keys(permissionTreeData).includes(user.username))}
                                    onChange={handleChangeUser}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="User List"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option.username === value.username}
                                />

                                <Box display="flex" width='100%' justifyContent="space-between">
                                    <Button variant='contained'
                                            onClick={handleAddUser}
                                            startIcon={<PersonAddIcon/>}
                                            sx={{'minWidth': '10rem', 'maxWidth': '15rem'}}>
                                        Assign User
                                    </Button>
                                    {/*<Button variant='contained'*/}
                                    {/*        onClick={handleRemoveUser}*/}
                                    {/*        startIcon={<PersonRemoveIcon/>}*/}
                                    {/*        sx={{'minWidth': '10rem', 'maxWidth': '15rem'}}>*/}
                                    {/*    Remove User*/}
                                    {/*</Button>*/}
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Paper>
                <Paper sx={{px: '1rem', my: '1rem'}} elevation={0} variant="outlined">
                    {Object.keys(permissionTreeData).length > 1 ?
                        <>
                            <Box display='flex' justifyContent='space-between' py={1}>
                                <ButtonGroup color='info' variant="outlined" size="small">
                                    <Button onClick={handleSelectAll}>Select All</Button>
                                    <Button onClick={handleUnselectAll}>Unselect All</Button>
                                    <Button onClick={handleExpandAll}>Expand All</Button>
                                    <Button onClick={handleCollapseAll}>Collapse All</Button>
                                    <Button onClick={handleRemoveAll}>Remove All</Button>
                                </ButtonGroup>

                                <Autocomplete
                                    options={getAllUsers()}
                                    onChange={handleSearch}
                                    size="small"
                                    sx={{minWidth: '10rem'}}
                                    renderInput={(params) => <TextField {...params} label="Search"/>}
                                />

                            </Box>

                            <Paper sx={{px: '1rem', py: '.5rem', my: '.25rem'}} elevation={0} variant="outlined">
                                <SaveComp/>
                                <SimpleTreeView
                                    apiRef={treeRef}
                                    expandedItems={[...expandedItems]}
                                    defaultExpandedItems={[]}
                                    selectedItems={selectedPermit}
                                    onItemSelectionToggle={handleChangePermission}
                                    onExpandedItemsChange={handleExpandedItemsChange}
                                    checkboxSelection
                                    multiSelect>
                                    {Object.keys(permissionTreeData)?.map(user => (
                                        user !== owner &&
                                        <UserItem
                                            key={user}
                                            onDelete={handleDelete}
                                            label={user === owner ? (user + ' (Owner)') : user}
                                            itemId={user}
                                            disabled={user === owner}>
                                            <Permission userPermission={permissionTreeData[user]} formOwner={owner}
                                                        user={user}/>
                                        </UserItem>


                                    ))}
                                </SimpleTreeView>
                                <SaveComp/>
                            </Paper>
                        </> :
                        <Typography variant='body1' sx={{p: '1rem'}}>
                            {
                                props.formId ?
                                    <span>No permissions assign</span> :
                                    <span>No form selected</span>
                            }
                        </Typography>
                    }
                </Paper>

            </div>


            <Snackbar
                open={toastOpen}
                autoHideDuration={5000}
                onClose={handleToastClose}
                message={toastMessage}
            />
        </Paper>
    )
}
