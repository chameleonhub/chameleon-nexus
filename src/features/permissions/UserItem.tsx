import {IconButton, Typography} from "@mui/material";
import {Delete as DeleteIcon} from "@mui/icons-material";
import React, {ReactNode} from "react";
import {TreeItem as TreeItem2} from "@mui/x-tree-view";
import {UseTreeItemParameters as UseTreeItem2Parameters} from "@mui/x-tree-view/useTreeItem";


interface UserItemLabelProps {
    itemId: string;
    label: ReactNode;
    onDelete: (itemId: string) => void;
}

function UserItemLabel(props: UserItemLabelProps) {
    const {label, onDelete, itemId} = props;

    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            <Typography style={{flexGrow: 1}} className="capitalize" variant="h6">{label}</Typography>
            <IconButton
                size="small"
                onClick={(event) => {
                    event.stopPropagation();
                    onDelete(itemId);
                }}
            >
                <DeleteIcon/>
            </IconButton>
        </div>
    );
}

interface UserItemProps extends Omit<UseTreeItem2Parameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {
    onDelete: (itemId: string) => void;
}


export const UserItem = (props: UserItemProps) => {

    const {itemId, label, children, onDelete} = props;

    return <TreeItem2 itemId={itemId} label={<UserItemLabel onDelete={onDelete} itemId={itemId} label={label}/>}>
        {children}
    </TreeItem2>;
};
