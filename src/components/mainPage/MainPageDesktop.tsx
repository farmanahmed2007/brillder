import React, { Component } from "react";
import { connect } from "react-redux";
import { Grid, Hidden } from "@material-ui/core";

import './themes/MainPageDesktop.scss';
import actions from "redux/actions/auth";
import brickActions from "redux/actions/brickActions";
import { RolePreference, User } from "model/user";
import { ReduxCombinedState } from "redux/reducers";
import { clearProposal } from "localStorage/proposal";
import map from 'components/map';
import { Notification } from 'model/notifications';
import { checkAdmin } from "components/services/brickService";

import WelcomeComponent from './WelcomeComponent';
import MainPageMenu from "components/baseComponents/pageHeader/MainPageMenu";
import PolicyDialog from "components/baseComponents/policyDialog/PolicyDialog";
import SpriteIcon from "components/baseComponents/SpriteIcon";
import { getAssignedBricks, getCurrentUserBricks } from "services/axios/brick";
import LockedDialog from "components/baseComponents/dialogs/LockedDialog";
import TeachButton from "./components/TeachButton";
import FirstButton from "./components/FirstButton";
import DesktopVersionDialogV2 from "components/build/baseComponents/dialogs/DesktopVersionDialogV2";
import ClassInvitationDialog from "components/baseComponents/classInvitationDialog/ClassInvitationDialog";
import LibraryButton from "./components/LibraryButton";
import BlocksIcon from "./components/BlocksIcon";


const mapState = (state: ReduxCombinedState) => ({
  user: state.user.user,
  notifications: state.notifications.notifications
});

const mapDispatch = (dispatch: any) => ({
  forgetBrick: () => dispatch(brickActions.forgetBrick()),
  logout: () => dispatch(actions.logout()),
});

const connector = connect(mapState, mapDispatch);

interface MainPageProps {
  history: any;
  user: User;
  notifications: Notification[] | null;
  forgetBrick(): void;
  logout(): void;
}

interface MainPageState {
  createHober: boolean;
  backHober: boolean;
  isPolicyOpen: boolean;
  notificationExpanded: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isBuilder: boolean;

  // for students
  backWorkActive: boolean;
  isMyLibraryOpen: boolean;
  isBackToWorkOpen: boolean;
  isTryBuildOpen: boolean;

  // for builder
  isBuilderActive: boolean;

  // for mobile popopup
  isDesktopOpen: boolean;
  secondaryLabel: string;
  secondPart: string;
}

class MainPageDesktop extends Component<MainPageProps, MainPageState> {
  constructor(props: MainPageProps) {
    super(props);

    const { rolePreference } = props.user;

    const isStudent = rolePreference?.roleId === RolePreference.Student;
    const isBuilder = rolePreference?.roleId === RolePreference.Builder;

    this.state = {
      createHober: false,
      backHober: false,
      isPolicyOpen: false,
      notificationExpanded: false,
      backWorkActive: false,
      isMyLibraryOpen: false,
      isBackToWorkOpen: false,
      isTryBuildOpen: false,
      isBuilderActive: false,

      isTeacher: rolePreference?.roleId === RolePreference.Teacher,
      isAdmin: checkAdmin(props.user.roles),
      isStudent,
      isBuilder,

      isDesktopOpen: false,
      secondaryLabel: '',
      secondPart: ' not yet been optimised for mobile devices.'
    } as any;

    if (isStudent) {
      this.preparationForStudent();
    } else if (isBuilder) {
      this.preparationForBuilder();
    }
  }

  async preparationForStudent() {
    let bricks = await getAssignedBricks();
    if (bricks && bricks.length > 0) {
      this.setState({ backWorkActive: true });
    }
  }

  async preparationForBuilder() {
    let bricks = await getCurrentUserBricks();
    if (bricks && bricks.length > 0) {
      this.setState({ isBuilderActive: true });
    }
  }

  setPolicyDialog(isPolicyOpen: boolean) {
    this.setState({ isPolicyOpen });
  }

  creatingBrick() {
    clearProposal();
    this.props.forgetBrick();
    this.props.history.push(map.ProposalSubject);
  }

  renderCreateButton(disabled?: boolean) {
    let isActive = true;
    if (disabled) {
      isActive = false;
    }
    return (
      <div className="create-item-container" onClick={() => {
        if (disabled) {
          return;
        }
        this.props.history.push(map.BackToWorkPage);
      }}>
        <button className="btn btn-transparent zoom-item svgOnHover">
          <SpriteIcon name="trowel-home" className={isActive ? 'active text-theme-orange' : 'text-theme-light-blue'} />
          <span className="item-description">Build Bricks</span>
        </button>
      </div>
    );
  }

  renderLibraryButton() {
    const isActive = this.props.user.hasPlayedBrick;
    return (
      <LibraryButton
        isActive={isActive} history={this.props.history} isSwiping={false}
        onClick={() => this.setState({ isMyLibraryOpen: true })}
        onMobileClick={() => {
          this.setState({
            isDesktopOpen: true,
            secondaryLabel: 'Your Library has' + this.state.secondPart
          });
        }}
      />
    );
  }

  renderStudentWorkButton() {
    const isActive = this.state.backWorkActive;
    const disabledColor = 'text-theme-dark-blue';
    return (
      <div className="back-item-container student-back-work" onClick={() => {
        if (isActive) {
          this.props.history.push(map.AssignmentsPage);
        } else {
          this.setState({ isBackToWorkOpen: true });
        }
      }}>
        <button className={`btn btn-transparent ${isActive ? 'active zoom-item text-theme-orange' : disabledColor}`}>
          <BlocksIcon />
          <span className={`item-description ${isActive ? '' : 'disabled'}`}>Assignments</span>
        </button>
      </div>
    );
  }

  renderSecondButton() {
    if (this.state.isTeacher || this.state.isAdmin) {
      return <TeachButton history={this.props.history} />
    } else if (this.state.isStudent) {
      return this.renderStudentWorkButton();
    }
    return this.renderCreateButton();
  }

  renderThirdButton() {
    if (this.state.isTeacher) {
      return this.renderTryBuildButton(true);
    } else if (this.state.isStudent) {
      return this.renderLibraryButton();
    } else if (this.state.isAdmin) {
      return this.renderCreateButton();
    }
    return this.renderAssignmentsButton();
  }

  renderAssignmentsButton() {
    return (
      <div className="back-item-container" onClick={() => {
        this.props.history.push(map.AssignmentsPage);
      }}>
        <button className="btn btn-transparent text-theme-orange zoom-item">
          <BlocksIcon />
          <span className="item-description">Assignments</span>
        </button>
      </div>
    );
  }

  renderLiveAssignmentButton(isActive: boolean) {
    return (
      <div className="back-item-container student-back-work" onClick={() => {
        if (isActive) {
          this.props.history.push(map.AssignmentsPage);
        } else {
          this.setState({ isBackToWorkOpen: true });
        }
      }}>
        <button className={`btn btn-transparent ${isActive ? 'active zoom-item text-theme-orange' : 'text-theme-light-blue'}`}>
          <BlocksIcon />
          <span className={`item-description ${isActive ? '' : 'disabled'}`}>Shared with Me</span>
        </button>
      </div>
    );
  }

  renderReportsButton(isActive: boolean) {
    return (
      <div className="back-item-container student-back-work" onClick={() => {
        this.setState({
          isDesktopOpen: true,
          secondaryLabel: 'Reports have ' + this.state.secondPart
        });
      }}>
        <button className={`btn btn-transparent ${isActive ? 'active zoom-item text-theme-orange' : 'text-theme-light-blue'}`}>
          <SpriteIcon name="book-open" />
          <span className={`item-description ${isActive ? '' : 'disabled'}`}>Reports</span>
        </button>
      </div>
    );
  }

  renderTryBuildButton(isActive: boolean) {
    return (
      <div className="create-item-container" onClick={() => {
        if (isActive) {
          this.props.history.push(map.BackToWorkPage);
        } else {
          this.setState({ isTryBuildOpen: true });
        }
      }}>
        <button className={`btn btn-transparent ${isActive ? 'zoom-item text-theme-orange active' : 'text-theme-light-blue'}`}>
          <SpriteIcon name="trowel-home" />
          <span className={`item-description ${isActive ? '' : 'disabled'}`}>Build Bricks</span>
        </button>
      </div>
    );
  }

  renderRightButton() {
    if (this.state.isBuilder) {
      let isActive = false;
      return (
        <div className="create-item-container">
          <button className={`btn btn-transparent ${isActive ? 'zoom-item text-theme-orange active' : 'text-theme-light-blue'}`}>
            <SpriteIcon name="book-open" />
            <span className={`item-description ${isActive ? '' : 'disabled'}`}>Brick Stats</span>
          </button>
        </div>
      );
    }
    let isActive = this.props.user.hasPlayedBrick;
    if (this.state.isTeacher) {
      return this.renderLiveAssignmentButton(true);
    } else if (this.state.isStudent) {
      return this.renderTryBuildButton(isActive);
    } else if (this.state.isAdmin) {
      return this.renderAssignmentsButton();
    }
    return "";
  }

  renderRightBottomButton() {
    if (this.state.isTeacher) {
      return this.renderReportsButton(false);
    } else if (this.state.isAdmin) {
      if (this.state.isStudent) {
        return this.renderAssignmentsButton();
      }
      return this.renderLibraryButton();
    }
    return "";
  }

  renderDesktopPage() {
    return (
      <Hidden>
        <div className="welcome-col">
          <WelcomeComponent
            user={this.props.user}
            history={this.props.history}
            notifications={this.props.notifications}
            notificationClicked={() => this.setState({ notificationExpanded: !this.state.notificationExpanded })}
          />
        </div>
        <div className="first-col">
          <div className="first-item">
            <FirstButton history={this.props.history} user={this.props.user} />
            {this.renderSecondButton()}
            {this.renderThirdButton()}
          </div>
          <div className="second-item"></div>
        </div>
        {(this.state.isTeacher || this.state.isAdmin) ?
          <div className="second-col">
            <div>
              {this.renderRightButton()}
              {this.renderRightBottomButton()}
            </div>
          </div>
          : <div className="second-col">
            {this.renderRightButton()}
          </div>
        }
        <MainPageMenu
          user={this.props.user}
          history={this.props.history}
          notificationExpanded={this.state.notificationExpanded}
          toggleNotification={() => this.setState({ notificationExpanded: !this.state.notificationExpanded })}
        />
        <div className="policy-text">
          <span onClick={() => this.setPolicyDialog(true)}>Privacy Policy</span>
        </div>
      </Hidden>
    );
  }

  render() {
    return (
      <Grid container direction="row" className="mainPage">
        {this.renderDesktopPage()}
        <PolicyDialog isOpen={this.state.isPolicyOpen} close={() => this.setPolicyDialog(false)} />
        <LockedDialog
          label="Play a brick to unlock this feature"
          isOpen={this.state.isMyLibraryOpen}
          close={() => this.setState({ isMyLibraryOpen: false })} />
        <LockedDialog
          label="To unlock this, a brick needs to have been assigned to you"
          isOpen={this.state.isBackToWorkOpen}
          close={() => this.setState({ isBackToWorkOpen: false })} />
        <LockedDialog
          label="Play a brick to unlock this feature"
          isOpen={this.state.isTryBuildOpen}
          close={() => this.setState({ isTryBuildOpen: false })} />
        <DesktopVersionDialogV2
          isOpen={this.state.isDesktopOpen} secondaryLabel={this.state.secondaryLabel}
          onClick={() => this.setState({ isDesktopOpen: false })}
        />
        <ClassInvitationDialog />
      </Grid>
    );
  }
}

export default connector(MainPageDesktop);