import React, { useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { Grid } from "@material-ui/core";
import { connect } from "react-redux";

import actions from 'redux/actions/brickActions';
import sprite from "assets/img/icons-sprite.svg";
import { Brick, Editor } from 'model/brick';
import { getUserByUserName } from 'components/services/axios/user';
import AutocompleteUsername from 'components/play/baseComponents/AutocompleteUsername';

interface InviteProps {
  canEdit: boolean;
  isOpen: boolean;
  brick: Brick;
  hideAccess?: boolean;
  title?: string;
  submit(name: string): void;
  close(): void;
  assignEditor(brick: Brick): void;
}

const InviteEditorDialog: React.FC<InviteProps> = ({ brick, ...props }) => {
  const [isValid, setValid] = React.useState(false);
  const [editorUsername, setEditorUsername] = React.useState(brick.editor?.username ?? "");
  const [editor, setEditor] = React.useState(brick.editor);
  const [editorError, setEditorError] = React.useState("");
  const [locked, setLock] = React.useState(false);

  const saveEditor = (editorId: number, fullName: string) => {
    props.assignEditor({ ...brick, editor: { id: editorId } as Editor });
    props.submit(fullName);
  }

  const onNext = () => {
    if (isValid && editor) {
      saveEditor(editor.id, editor.firstName);
      props.close();
    }
  };

  const onBlur = async () => {
    if (editorUsername !== "") {
      setLock(true);
      let data = await getUserByUserName(editorUsername);
      if (data.user) {
        setValid(true);
        setEditor(data.user);
        setEditorError("");
      } else {
        setValid(false);
        setEditorError(data.message);
      }
      setLock(false);
    } else {
      setValid(false);
      setEditorError("No username input.");
    }
  }

  useEffect(() => {
    onBlur();
  }, [brick]);

  const renderSendButton = () => {
    return (
      <button
        disabled={locked}
        className={`btn bold btn-md yes-button bg-theme-orange`}
        style={{ width: 'auto', paddingLeft: '4vw' }}
        onClick={onNext}
      >
        Send Invite
        <svg className="svg active send-icon" onClick={props.close}>
          {/*eslint-disable-next-line*/}
          <use href={sprite + "#send"} />
        </svg>
      </button>
    );
  }

  return (
    <Dialog
      open={props.isOpen}
      onClose={props.close}
      className="dialog-box light-blue unlimited"
    >
      <div className="close-button svgOnHover" onClick={props.close}>
        <svg className="svg active">
          {/*eslint-disable-next-line*/}
          <use href={sprite + "#cancel-thick"} />
        </svg>
      </div>
      <div className="dialog-header" style={{ minWidth: '30vw' }}>
        <div className="title left">
          {props.title ? props.title : 'Who would you like to invite to play this brick?'}
        </div>
        <div style={{ marginTop: '1.8vh' }}></div>
        <Grid item className="input-container">
          <div className="audience-inputs border-rounded">
            <AutocompleteUsername
              canEdit={props.canEdit}
              brick={brick}
              editorError={editorError}
              placeholder="Enter editor's username here..."
              onBlur={onBlur}
              username={editorUsername}
              setUsername={setEditorUsername}
            />
          </div>
        </Grid>
      </div>
      <div style={{ marginTop: '1.8vh' }}></div>
      <div className="dialog-footer" style={{ justifyContent: 'center' }}>
        {renderSendButton()}
      </div>
    </Dialog>
  );
}

const mapDispatch = (dispatch: any) => ({
  assignEditor: (brick: any) => dispatch(actions.assignEditor(brick))
});

const connector = connect(null, mapDispatch);

export default connector(InviteEditorDialog);
