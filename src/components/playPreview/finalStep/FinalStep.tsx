import React from "react";
import { Grid, Hidden } from "@material-ui/core";
import { connect } from "react-redux";

import map from 'components/map';
import actions from 'redux/actions/requestFailed';
import brickActions from 'redux/actions/brickActions';
import "./FinalStep.scss";
import { User } from "model/user";
import { Brick, BrickStatus } from "model/brick";
import { PlayStatus } from "components/play/model";
import { checkAdmin, checkPublisher } from "components/services/brickService";
import { publishBrick, returnToAuthor, returnToEditor } from "components/services/axios/brick";

import Clock from "components/play/baseComponents/Clock";
import ShareDialog from 'components/play/finalStep/dialogs/ShareDialog';
import InviteEditorDialog from './InviteEditorDialog';
import LinkDialog from 'components/play/finalStep/dialogs/LinkDialog';
import LinkCopiedDialog from 'components/play/finalStep/dialogs/LinkCopiedDialog';
import ExitButton from "components/play/finalStep/ExitButton";
import ShareColumn from "components/play/finalStep/ShareColumn";
import InviteColumn from "components/play/finalStep/InviteColumn";
import PublishColumn from './PublishColumn';
import InvitationSuccessDialog from "components/play/finalStep/dialogs/InvitationSuccessDialog";
import PublishSuccessDialog from "components/baseComponents/dialogs/PublishSuccessDialog";
import CustomColumn from "./CustomColumn";
import { ReduxCombinedState } from "redux/reducers";
import SendPublisherSuccessDialog from "./SendPublisherSuccess";
import { Redirect } from "react-router-dom";
import SpriteIcon from "components/baseComponents/SpriteIcon";

enum PublishStatus {
  None,
  Popup,
  Published,
}

interface FinalStepProps {
  user: User;
  status: PlayStatus;
  brick: Brick;
  history: any;
  location: any;

  sendedToPublisher: boolean;
  publisherConfirmed: boolean;

  fetchBrick(brickId: number): void;
  sendToPublisherConfirmed(): void;
  sendToPublisher(brickId: number): void;
  requestFailed(e: string): void;
}

const FinalStep: React.FC<FinalStepProps> = ({
  user, brick, history, publisherConfirmed, sendedToPublisher, requestFailed, ...props
}) => {
  const [shareOpen, setShare] = React.useState(false);
  const [inviteOpen, setInvite] = React.useState(false);
  const [linkOpen, setLink] = React.useState(false);
  const [linkCopiedOpen, setCopiedLink] = React.useState(false);
  const [publishSuccess, setPublishSuccess] = React.useState(PublishStatus.None);
  const [inviteSuccess, setInviteSuccess] = React.useState({
    isOpen: false,
    name: ''
  });

  let isAuthor = false;
  try {
    isAuthor = brick.author.id === user.id;
  } catch {}

  const isAdmin = checkAdmin(user.roles);
  const isPublisher = checkPublisher(user, brick);
  let isCurrentEditor = (brick.editors?.findIndex(e => e.id === user.id) ?? -1) >= 0;
  const link = `/play/brick/${brick.id}/intro`;

  if (!isAuthor && !isCurrentEditor && !isPublisher) {
    return <Redirect to={map.BackToWorkBuildTab} />;
  }

  const publish = async (brickId: number) => {
    let success = await publishBrick(brickId);
    if (success) {
      setPublishSuccess(PublishStatus.Popup);
    } else {
      requestFailed("Can`t publish brick");
    }
  }

  const renderInviteColumn = (size: 5 | 3) => {
    return (
      <InviteColumn
        size={size}
        firstLabel="an internal user"
        secondLabel="to edit this brick"
        onClick={()=> setInvite(true)}
      />
    );
  }

  const renderReturnToAuthorColumn = (size: 5 | 3) => {
    return (
      <CustomColumn
        icon="repeat"
        title="Return to author"
        label="for futher changes"
        size={size}
        onClick={async () => {
          await returnToAuthor(brick.id);
          props.fetchBrick(brick.id);
        }}
      />
    );
  }

  const renderReturnToEditorColumn = (size: 5 | 3) => {
    return (
      <CustomColumn
        icon="repeat" title="Return to editor" label="for futher changes"
        size={size}
        onClick={async () => {
          await returnToEditor(brick.id);
          props.fetchBrick(brick.id);
        }}
      />
    )
  }

  const renderSendToPublisherColumn = (size: 5 | 3) => {
    return (
      <CustomColumn
        icon="send" title="Send to publisher" label="for final review"
        size={size}
        onClick={async () => {
          await props.sendToPublisher(brick.id);
          history.push(`${map.BackToWorkBuildTab}?isCore=${brick.isCore}`);
        }}
      />
    );
  }

  const renderActionColumns = () => {
    const canPublish = isPublisher && brick.status !== BrickStatus.Publish && publishSuccess !== PublishStatus.Published;

    const size: 5 | 3 = canPublish ? 3 : 5;

    if (isAuthor && brick.status === BrickStatus.Draft) {
      if (brick.editors) {
        return (
          <Grid className="share-row" container direction="row" justify="center">
            { !brick.isCore && <ShareColumn size={size} onClick={() => setShare(true)} /> }
            {renderInviteColumn(size)}
          </Grid>
        );
      } else {
        return (
          <Grid className="share-row" container direction="row" justify="center">
            { !brick.isCore && <ShareColumn size={size} onClick={() => setShare(true)} /> }
            {renderInviteColumn(size)}
          </Grid>
        );
      }
    }

    if (canPublish) {
      return (
        <Grid className="share-row" container direction="row" justify="center">
          {isAdmin && renderInviteColumn(size)}
          {
            canPublish && renderReturnToEditorColumn(size)
          }
          {canPublish && <PublishColumn onClick={() => publish(brick.id)} />}
        </Grid>
      );
    }

    if (isCurrentEditor && !brick.publisher) {
      return (
        <Grid className="share-row" container direction="row" justify="center">
          { renderReturnToAuthorColumn(size) }
          { renderSendToPublisherColumn(size) }
        </Grid>
      );
    }

    if (!brick.isCore) {
      return (
        <Grid className="share-row" container direction="row" justify="center">
          <ShareColumn size={size} onClick={() => setShare(true)} />
          {renderInviteColumn(size)}
          { canPublish && renderReturnToEditorColumn(size) }
          {canPublish && <PublishColumn onClick={() => publish(brick.id)} />}
        </Grid>
      );
    }
    return (
      <Grid className="share-row" container direction="row" justify="center">
        {renderInviteColumn(size)}
        { canPublish && renderReturnToEditorColumn(size) }
      </Grid>
    );
  }

  return (
    <div>
      <Hidden only={['xs']}>
        <div className="brick-container final-step-page">
          <Grid container direction="row">
            <Grid item xs={8}>
              <div className="introduction-page">
                <div className="intro-header">
                  <div className="left-brick-circle">
                    <div className="round-button">
                      <SpriteIcon name="check-icon-thin" className="active" />
                    </div>
                  </div>
                  {isCurrentEditor ?
                    <div>
                      <h2>All done!</h2>
                    </div>
                    :
                    <div>
                      <h2>Submit for Review?</h2>
                      <p>Invite an editor to begin the publication process</p>
                    </div>}
                  {renderActionColumns()}
                </div>
              </div>
            </Grid>
            <Grid item xs={4}>
              <div className="introduction-info">
                <div className="intro-header">
                  <Clock brickLength={brick.brickLength} />
                </div>
                <div className="intro-text-row">
                </div>
                <ExitButton onClick={() =>
                  history.push(`${map.BackToWorkBuildTab}?isCore=${brick.isCore}`)} />
              </div>
            </Grid>
          </Grid>
        </div>
      </Hidden>
      <Hidden only={['sm', 'md', 'lg', 'xl']}>
        <div className="brick-container mobile-final-step-page final-step-page">
          <div className="introduction-info">
            <div className="intro-text-row"></div>
          </div>
          <div className="introduction-page">
          </div>
          <ExitButton onClick={() => history.push(map.BackToWorkPage)} />
        </div>
      </Hidden>
      <LinkDialog
        isOpen={linkOpen} link={document.location.host + link}
        submit={() => setCopiedLink(true)} close={() => setLink(false)}
      />
      <LinkCopiedDialog isOpen={linkCopiedOpen} close={()=> setCopiedLink(false)} />
      <ShareDialog isOpen={shareOpen} link={() => { setShare(false); setLink(true) }} close={() => setShare(false)} />
      <InviteEditorDialog
        canEdit={true} brick={brick} isOpen={inviteOpen}
        title="Who would you like to edit this brick?"
        submit={name => { setInviteSuccess({ isOpen: true, name }); }}
        close={() => setInvite(false)} />
      <InvitationSuccessDialog
        isAuthor={isAuthor}
        isOpen={inviteSuccess.isOpen} name={inviteSuccess.name} accessGranted={true}
        close={() => {
          setInviteSuccess({ isOpen: false, name: '' });
          props.fetchBrick(brick.id);
        }}
      />
      <PublishSuccessDialog
        isOpen={publishSuccess === PublishStatus.Popup}
        close={() => setPublishSuccess(PublishStatus.Published)}
      />
      <SendPublisherSuccessDialog isOpen={sendedToPublisher && publisherConfirmed === false} close={() => props.sendToPublisherConfirmed()} />
    </div>
  );
};
const mapState = (state: ReduxCombinedState) => ({
  brick: state.brick.brick,
  sendedToPublisher: state.sendPublisher.success,
  publisherConfirmed: state.sendPublisher.confirmed,
});

const mapDispatch = (dispatch: any) => ({
  fetchBrick: (brickId: number) => dispatch(brickActions.fetchBrick(brickId)),
  sendToPublisher: (brickId: number) => dispatch(brickActions.sendToPublisher(brickId)),
  sendToPublisherConfirmed: () => dispatch(brickActions.sendToPublisherConfirmed()),
  requestFailed: (e: string) => dispatch(actions.requestFailed(e))
});

export default connect(mapState, mapDispatch)(FinalStep);