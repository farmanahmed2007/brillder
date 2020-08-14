import React, { Component } from "react";
import { Grid, Radio, FormControlLabel } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import axios from "axios";
import { connect } from "react-redux";

import brickActions from "redux/actions/brickActions";
import userActions from "redux/actions/user";
import authActions from "redux/actions/auth";

import "./UserProfile.scss";
import { User, UserType, UserStatus, UserProfile, UserRole } from "model/user";
import { saveProfileImageName } from "components/services/profile";
import PhonePreview from "../build/baseComponents/phonePreview/PhonePreview";
import { Subject } from "model/brick";
import SubjectAutocomplete from "./components/SubjectAutoCompete";
import { checkAdmin, canBuild, canEdit } from "components/services/brickService";
import UserProfileMenu from "./components/UserProfileMenu";
import SubjectDialog from "./components/SubjectDialog";
import { ReduxCombinedState } from "redux/reducers";
import SaveProfileButton from "./components/SaveProfileButton";
import ProfileSavedDialog from "./components/ProfileSavedDialog";
import ProfileImage from "./components/ProfileImage";

const mapState = (state: ReduxCombinedState) => ({ user: state.user.user });

const mapDispatch = (dispatch: any) => ({
  forgetBrick: () => dispatch(brickActions.forgetBrick()),
  getUser: () => dispatch(userActions.getUser()),
  redirectedToProfile: () => dispatch(authActions.redirectedToProfile()),
});

const connector = connect(mapState, mapDispatch);

interface UserRoleItem extends UserRole {
  disabled: boolean;
}

interface UserProfileProps {
  user: User;
  history: any;
  match: any;
  forgetBrick(): void;
  redirectedToProfile(): void;
  getUser(): void;
}

interface UserProfileState {
  noSubjectDialogOpen: boolean;
  savedDialogOpen: boolean;
  user: UserProfile;
  subjects: Subject[];
  autoCompleteOpen: boolean;
  isNewUser: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  roles: UserRoleItem[];

  imageUploadSuccess: boolean;
}

class UserProfilePage extends Component<UserProfileProps, UserProfileState> {
  get maxAnimationTime() { return 2500; }

  constructor(props: UserProfileProps) {
    super(props);
    this.props.redirectedToProfile();
    const { userId } = props.match.params;
    const isAdmin = checkAdmin(props.user.roles);
    // check if admin wanna create new user
    if (userId === "new") {
      if (isAdmin) {
        this.state = this.getNewUserState(isAdmin);
      } else {
        props.history.push("/home");
      }
    } else {
      const { user } = props;

      let tempState: UserProfileState = this.getExistedUserState(user, isAdmin);
      if (userId) {
        this.state = tempState;
        axios.get(`${process.env.REACT_APP_BACKEND_HOST}/user/${userId}`, {
          withCredentials: true,
        }).then((res) => {
          const user = res.data as User;
          this.setState({ user: this.getUserProfile(user) });
        }).catch((error) => {
          alert("Can`t get user profile");
        });
      } else {
        tempState.user = this.getUserProfile(user);
        this.state = tempState;
      }
    }

    axios.get(process.env.REACT_APP_BACKEND_HOST + "/subjects", {
      withCredentials: true,
    }).then((res) => {
      this.setState({ subjects: res.data });
    }).catch((error) => {
      alert("Can`t get bricks");
    });
  }

  getUserProfile(user: User): UserProfile {
    let roles = user.roles.map(role => role.roleId);

    return {
      id: user.id,
      username: user.username,
      roles: roles ? roles: [],
      email: user.email ? user.email : "",
      firstName: user.firstName ? user.firstName : "",
      lastName: user.lastName ? user.lastName : "",
      subjects: user.subjects ? user.subjects : [],
      profileImage: user.profileImage ? user.profileImage : "",
      status: UserStatus.Pending,
      tutorialPassed: false,
      password: ""
    }
  }

  getExistedUserState(user: User, isAdmin: boolean) {
    const isBuilder = canBuild(user);
    const isEditor = canEdit(user);

    const isOnlyStudent = user.roles.length === 1 && user.roles[0].roleId === UserType.Student;

    return {
      user: {
        id: -1,
        username: "",
        firstName: "",
        lastName: "",
        tutorialPassed: false,
        email: "",
        password: "",
        roles: [],
        subjects: [],
        status: UserStatus.Pending,
        profileImage: "",
      },
      subjects: [],
      autoCompleteOpen: false,
      isNewUser: false,
      isStudent: isOnlyStudent,
      isAdmin,
      roles: [
        { roleId: UserType.Student, name: "Student", disabled: !isBuilder },
        { roleId: UserType.Teacher, name: "Teacher", disabled: !isBuilder },
        { roleId: UserType.Builder, name: "Builder", disabled: !isBuilder },
        { roleId: UserType.Editor, name: "Editor", disabled: !isEditor },
        { roleId: UserType.Admin, name: "Admin", disabled: !isAdmin },
      ],
      noSubjectDialogOpen: false,
      savedDialogOpen: false,
      imageUploadSuccess: false
    };
  }

  getNewUserState(isAdmin: boolean) {
    return {
      user: {
        id: 0,
        username: "",
        firstName: "",
        lastName: "",
        tutorialPassed: false,
        email: "",
        password: "",
        roles: [],
        subjects: [],
        status: UserStatus.Pending,
        profileImage: "",
      },
      subjects: [],
      isNewUser: true,
      isStudent: false,
      isAdmin,
      autoCompleteOpen: false,
      roles: [
        { roleId: UserType.Student, name: "Student", disabled: false },
        { roleId: UserType.Teacher, name: "Teacher", disabled: false },
        { roleId: UserType.Builder, name: "Builder", disabled: false },
        { roleId: UserType.Editor, name: "Editor", disabled: false },
        { roleId: UserType.Admin, name: "Admin", disabled: false },
      ],
      noSubjectDialogOpen: false,
      savedDialogOpen: false,
      imageUploadSuccess: false
    };
  }

  saveStudentProfile(user: UserProfile) {
    const userToSave = {} as any;
    this.prepareUserToSave(userToSave, user);
    userToSave.roles = user.roles;

    if (!user.subjects || user.subjects.length === 0) {
      this.setState({ noSubjectDialogOpen: true });
      return;
    }
    this.save(userToSave);
  }

  prepareUserToSave(userToSave: any, user: UserProfile) {
    userToSave.firstName = user.firstName;
    userToSave.lastName = user.lastName;
    userToSave.email = user.email;

    if (user.password) {
      userToSave.password = user.password;
    }
    if (user.id !== -1) {
      userToSave.id = user.id;
    }
    if (user.subjects) {
      userToSave.subjects = user.subjects.map((s) => s.id);
    }
    if (user.profileImage) {
      userToSave.profileImage = user.profileImage;
    }
  }

  saveUserProfile() {
    const { user } = this.state;
    if (this.state.isStudent) {
      this.saveStudentProfile(user);
      return;
    }
    const userToSave = { roles: user.roles } as any;
    this.prepareUserToSave(userToSave, user);

    if (!user.subjects || user.subjects.length === 0) {
      this.setState({ noSubjectDialogOpen: true });
      return;
    }
    this.save(userToSave);
  }

  save(userToSave: any) {
    if (this.state.isNewUser) {
      // requet to add new user
    } else {
      axios.put(
        `${process.env.REACT_APP_BACKEND_HOST}/user`,
        { ...userToSave },
        { withCredentials: true }
      ).then((res) => {
        if (res.data === "OK") {
          this.setState({ savedDialogOpen: true });
          this.props.getUser();
        }
      }).catch((error) => {
        alert("Can`t save user profile");
      });
    }
  }

  onSubjectDialogClose() {
    this.setState({ noSubjectDialogOpen: false });
  }

  onProfileSavedDialogClose() {
    this.setState({ savedDialogOpen: false });
  }

  onFirstNameChanged(e: any) {
    const { user } = this.state;
    user.firstName = e.target.value;
    this.setState({ user });
  }

  onLastNameChanged(e: any) {
    const { user } = this.state;
    user.lastName = e.target.value;
    this.setState({ user });
  }

  onEmailChanged(e: any) {
    const { user } = this.state;
    user.email = e.target.value;
    this.setState({ user });
  }

  onPasswordChanged(e: any) {
    const { user } = this.state;
    user.password = e.target.value;
    this.setState({ user });
  }

  onProfileImageChanged(name: string) {
    const { user } = this.state;
    user.profileImage = name;

    saveProfileImageName(user.id, name).then((res: boolean) => {
      if (res) {
        this.setState({ imageUploadSuccess: true });
        setTimeout(() => {
          this.setState({ imageUploadSuccess: false });
        }, this.maxAnimationTime);
      } else {
        // saving image name failed
      }
    });

    this.setState({ user });
  }

  checkUserRole(roleId: number) {
    return this.state.user.roles.some((id) => id === roleId);
  }

  toggleRole(roleId: number, disabled: boolean) {
    if (disabled) {
      return;
    }
    let index = this.state.user.roles.indexOf(roleId);
    if (index !== -1) {
      this.state.user.roles.splice(index, 1);
    } else {
      this.state.user.roles.push(roleId);
    }
    this.setState({ ...this.state });
  }

  renderUserRole(role: UserRoleItem) {
    let checked = this.checkUserRole(role.roleId);

    if (this.state.isStudent) {
      return (
        <FormControlLabel
          className="filter-container disabled"
          checked={checked}
          control={<Radio className="filter-radio" />}
          label={role.name}
        />
      );
    }

    return (
      <FormControlLabel
        className={`filter-container ${role.disabled ? "disabled" : ""}`}
        checked={checked}
        onClick={() => this.toggleRole(role.roleId, role.disabled)}
        control={<Radio className="filter-radio" />}
        label={role.name}
      />
    );
  }

  renderRoles() {
    return this.state.roles.map((role: any, i: number) => (
      <Grid item key={i}>
        {this.renderUserRole(role)}
      </Grid>
    ));
  }

  onSubjectChange(newValue: any[]) {
    const { user } = this.state;
    user.subjects = newValue;
    this.setState({ user });
  }

  renderSubjects(user: UserProfile) {
    if (user.id === -1) {
      return;
    }
    return (
      <SubjectAutocomplete
        selected={user.subjects}
        onSubjectChange={(subjects) => this.onSubjectChange(subjects)}
      />
    );
  }

  render() {
    const { user } = this.state;
    return (
      <div className="main-listing user-profile-page">
        <UserProfileMenu
          user={this.props.user}
          forgetBrick={this.props.forgetBrick}
          history={this.props.history}
        />
        <Grid container direction="row">
          <div className="profile-block">
            <div className="profile-header">
              {user.firstName ? user.firstName : "NAME"}
              <span className="profile-username">{user.username ? user.username : "USERNAME"}</span>
            </div>
            <div className="save-button-container">
              <SaveProfileButton
                user={user}
                onClick={() => this.saveUserProfile()}
              />
            </div>
            <div className="profile-fields">
              <ProfileImage
                imageUploadSuccess={this.state.imageUploadSuccess}
                profileImage={user.profileImage}
                setImage={(v) => this.onProfileImageChanged(v)}
              />
              <div className="profile-inputs-container">
                <div className="input-group">
                  <div className="input-block">
                    <input
                      className="first-name style2"
                      value={user.firstName}
                      onChange={(e: any) => this.onFirstNameChanged(e)}
                      placeholder="Name"
                    />
                  </div>
                  <div className="input-block">
                    <input
                      className="last-name style2"
                      value={user.lastName}
                      onChange={(e: any) => this.onLastNameChanged(e)}
                      placeholder="Surname"
                    />
                  </div>
                </div>
                <FormControlLabel
                  value="start"
                  className="secret-input"
                  control={<Checkbox color="primary" />}
                  label="Keep me secret: I don't want to be searchable"
                  labelPlacement="end"
                />
                <div className="input-block">
                  <input
                    type="email"
                    className="style2"
                    value={user.email}
                    onChange={(e: any) => this.onEmailChanged(e)}
                    placeholder="username@domain.com"
                  />
                </div>
                <div className="input-block">
                  <input
                    type="password"
                    className="style2"
                    value={user.password}
                    onChange={(e: any) => this.onPasswordChanged(e)}
                    placeholder="●●●●●●●●●●●"
                  />
                </div>
              </div>
              <div className="profile-roles-container">
                <div className="roles-title">ROLES</div>
                <Grid container className="roles-box">
                  {this.renderRoles()}
                </Grid>
              </div>
            </div>
            {this.renderSubjects(user)}
            <Grid container direction="row" className="big-input-container">
              <textarea
                className="style2"
                placeholder="Write a short bio here..."
              />
            </Grid>
          </div>
          <div className="profile-phone-preview">
            <Grid
              container
              justify="center"
              alignContent="center"
              style={{ height: "100%" }}
            >
              <PhonePreview />
            </Grid>
          </div>
        </Grid>
        <SubjectDialog
          isOpen={this.state.noSubjectDialogOpen}
          close={() => this.onSubjectDialogClose()}
        />
        <ProfileSavedDialog
          isAdmin={this.state.isAdmin}
          history={this.props.history}
          isOpen={this.state.savedDialogOpen}
          close={() => this.onProfileSavedDialogClose()}
        />
      </div>
    );
  }
}

export default connector(UserProfilePage);