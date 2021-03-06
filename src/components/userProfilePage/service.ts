import { User, UserProfile, UserType, UserStatus } from 'model/user';

export const isValid = (user: UserProfile) => {
  if (user.firstName && user.lastName && user.email) {
    return true;
  }
  return false;
}

export const getUserProfile = (user: User): UserProfile => {
  let roles = user.roles.map(role => role.roleId);

  return {
    id: user.id,
    username: user.username,
    roles: roles ? roles : [],
    email: user.email ? user.email : "",
    firstName: user.firstName ? user.firstName : "",
    lastName: user.lastName ? user.lastName : "",
    subjects: user.subjects ? user.subjects : [],
    profileImage: user.profileImage ? user.profileImage : "",
    status: UserStatus.Pending,
    tutorialPassed: false,
    bio: user.bio ? user.bio : '',
    password: ""
  }
}

export const newStudentProfile = (): UserProfile => {
  return {
    id: 0,
    username: "",
    firstName: "",
    lastName: "",
    tutorialPassed: false,
    email: "",
    password: "",
    roles: [UserType.Student, UserType.Builder],
    subjects: [],
    status: UserStatus.Pending,
    bio: '',
    profileImage: "",
  }
}
