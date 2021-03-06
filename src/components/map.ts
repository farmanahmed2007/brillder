export const Login = '/login';
export const Build = '/build';
export const MainPage = '/home';
export const UserProfile = '/user-profile';
export const ProposalBase = `${Build}/new-brick`;
export const BackToWorkPage = '/back-to-work';
export const AssignmentsPage = '/assignments';

export const BackToWorkTeachTab = BackToWorkPage + '/teach';
export const BackToWorkBuildTab = BackToWorkPage + '/build';
export const BackToWorkLearnTab = BackToWorkPage + '/learn';

export const TeachAssignedTab = '/teach/assigned';
export const ManageClassroomsTab = '/teach/manage-classrooms';

export const ViewAllPage = '/play/dashboard';

const investigation = (brickId: number) => {
  return `/build/brick/${brickId}/investigation`;
}

export const InvestigationBuild = (brickId: number) => {
  return `${investigation(brickId)}/question-component`;
}

export const InvestigationSynthesis = (brickId: number) => {
  return `${investigation(brickId)}/synthesis`;
}

export const investigationBuildQuestion = (brickId: number, questionId: number) => {
  return InvestigationBuild(brickId) + `/${questionId}`;
}

export const investigationQuestionSuggestions = (brickId: number, questionId: number) => {
  return investigationBuildQuestion(brickId, questionId) + '?suggestionsExpanded=true'
}

export const investigationSynthesisSuggestions = (brickId: number) => {
  return `${InvestigationSynthesis(brickId)}?suggestionsExpanded=true`;
}

// proposal pages
export const ProposalSubject = `${ProposalBase}/subject`;
export const ProposalTitle = `${ProposalBase}/brick-title`;
export const ProposalOpenQuestion = `${ProposalBase}/open-question`;
export const ProposalBrief = `${ProposalBase}/brief`;
export const ProposalPrep = `${ProposalBase}/prep`;
export const ProposalLength = `${ProposalBase}/length`;
export const ProposalReview = `${ProposalBase}/proposal`;


// play preview
export const PlayPreviewBase = '/play-preview/brick';
export const PlayIntroLastPrefix = '/intro';

export const playPreview = (brickId: number) => {
  return  PlayPreviewBase + '/' + brickId;
}

export const playPreviewIntro = (brickId: number) => {
  return playPreview(brickId) + PlayIntroLastPrefix;
}

// play
export const PlayBase = '/play/brick';

export const realPlay = (brickId: number) => {
  return  PlayBase + '/' + brickId;
}

export const playIntro = (brickId: number) => {
  return realPlay(brickId) + PlayIntroLastPrefix;
}

// post play

export const PostPlay = '/post-play/brick';

export const postPlay = (brickId: number, userId: number) => {
  return PostPlay + '/' + brickId + '/' + userId;
}

export const playAssignment = (brickId: number, assignmentId: number) => {
  return `/play/brick/${brickId}/intro?assignmentId=${assignmentId}`
}

export default {
  Build,
  UserProfile,
  Login,
  MainPage,

  ProposalBase,
  ProposalSubject,
  ProposalTitle,
  ProposalOpenQuestion,
  ProposalBrief,
  ProposalPrep,
  ProposalLength,
  ProposalReview,

  BackToWorkPage,
  AssignmentsPage,
  BackToWorkTeachTab,
  BackToWorkBuildTab,
  BackToWorkLearnTab,

  TeachAssignedTab,
  ManageClassroomsTab,

  ViewAllPage,
  postPlay,
  playAssignment,

  InvestigationBuild,
  InvestigationSynthesis,
  investigationSynthesisSuggestions,
  investigationBuildQuestion,
  investigationQuestionSuggestions,
  playPreviewIntro,
  playIntro
}
