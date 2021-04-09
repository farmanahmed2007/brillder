import React, { Profiler, useEffect } from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import axios from 'axios';
import { connect } from 'react-redux';
import { isMobileOnly, isTablet} from 'react-device-detect';

import './app.scss';
import actions from "redux/actions/auth";
import GlobalFailedRequestDialog from "components/baseComponents/failedRequestDialog/GlobalFailedRequestDialog";

import VersionLabel from 'components/baseComponents/VersionLabel';
import ViewAll from '../viewAllPage/ViewAll';
import MobileCategory from '../viewAllPage/MobileCategory';
import PlayBrickRouting from '../play/PlayBrickRouting';
import PlayPreviewRouting from 'components/playPreview/PreviewBrickRouting';
import Proposal from 'components/build/proposal/Proposal';
import MainPage from 'components/mainPage/mainPage';
import BackToWorkPage from '../backToWorkPage/BackToWork';
import AssignmentsPage from '../assignmentsPage/AssignmentsPage';
import UsersListPage from '../userManagement/UsersList';
import InvestigationBuildPage from 'components/build/investigationBuildPage'
import LoginPage from '../loginPage/loginPage';
import ResetPasswordPage from '../resetPasswordPage/ResetPasswordPage';
import ActivateAccountPage from '../activateAccountPage/activateAccountPage';
import ManageClassrooms from 'components/teach/manageClassrooms/ManageClassrooms';
import ClassStatisticsPage from 'components/teach/statistics/ClassStatisticsPage';
import PostPlay from 'components/postPlay/PostPlay';
import Library from 'components/library/Library';

import UserProfilePage from 'components/userProfilePage/UserProfile';
import UserPreferencePage from 'components/onboarding/userPreferencePage/UserPreferencePage';
import UsernamePage from 'components/onboarding/usernamePage/UsernamePage';

import AuthRoute from './AuthRoute';
import BuildRoute from './BuildRoute';
import BuildBrickRoute from './BuildBrickRoute';
import StudentRoute from './StudentRoute';
import AuthRedirectRoute from './AuthRedirectRoute';
import AllUsersRoute from './AllUsersRoute';
import UnauthorizedRoute from './unauthorized/UnauthorizedRoute';

import BrickWrapper from './BrickWrapper';

import { setBrillderTitle } from 'components/services/titleService';
import { setupZendesk } from 'services/zendesk';
import map from 'components/map';
import RotateInstruction from 'components/baseComponents/rotateInstruction/RotateInstruction';
import TeachPage from 'components/teach/assignments/TeachPage';
import Terms from 'components/onboarding/terms/Terms';
import PlayPreviewRoute from './PlayPreviewRoute';
import EmailLoginPage from 'components/loginPage/EmailLoginPage';
import SelectSubjectPage from 'components/onboarding/selectSubjectPage/SelectSubjectPage';
import PublicTerms from 'components/terms/PublicTerms';
import MobileUsernamePage from 'components/onboarding/mobileUsernamePage/MobileUsernamePage';
import RotateIPadInstruction from 'components/baseComponents/rotateInstruction/RotateIPadInstruction';
import { isPhone } from 'services/phone';
import { setupMatomo } from 'services/matomo';
import { ReduxCombinedState } from 'redux/reducers';
import { User } from 'model/user';
import { getTerms } from 'services/axios/terms';
import IPadWarning from 'components/baseComponents/rotateInstruction/IPadWarning';
import BuildRouter from 'components/build/BuildRouter';

interface AppProps {
  user: User;
  setLogoutSuccess(): void;
}

const App: React.FC<AppProps> = props => {
  setBrillderTitle();
  const location = useLocation();
  const [showWarning, setWarning] = React.useState(isTablet ? true: false)
  const [termsData, setTermsData] = React.useState({
    isLoading: false,
    termsVersion: ''
  });
  const [zendeskCreated, setZendesk] = React.useState(false);
  const isHorizontal = () => {
    // Apple does not seem to have the window.screen api so we have to use deprecated window.orientation instead.
    if (window.orientation && typeof window.orientation === "number" && Math.abs(window.orientation) === 90 ) {
      return true;
    }
    if (window.screen.orientation && window.screen.orientation.type.includes('/^landscape-.+$/') === true) {
      return true;
    }
    return false;
  };
  const [horizontal, setHorizontal] = React.useState(isHorizontal());

  useEffect(() => {
    window.addEventListener("orientationchange", (event: any) => {
      setHorizontal(isHorizontal());
    });

    // download mamoto
    setupMatomo();
  }, []);

  // lock screen for phone
  if (isPhone()) {
    document.onclick = function (e) {
      if (document.body.requestFullscreen && !document.fullscreenElement) {
        let res = document.body.requestFullscreen();
        res.then(() => {
          if (window.screen.orientation && window.screen.orientation.lock) {
            window.screen.orientation.lock('portrait');
            console.log('lock screen');
          }
        });
      }
    }
  }

  // intercept api errors to prevent redirect.
  axios.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    let { url } = error.response.config;

    // exception for login, play and view all pages
    if (error.response.status === 401) {
      if (
        url.search('/auth/login/') === -1
        && location.pathname.search('/play/brick/') === -1
        && location.pathname.search('/play/dashboard') === - 1
      ) {
        props.setLogoutSuccess();
      }
    }
    return Promise.reject(error);
  });

  const theme = React.useMemo(() =>
    createMuiTheme({
      palette: {
        secondary: { main: "#001c58" },
        primary: { main: "#0B3A7E" }
      },
      breakpoints: {
        values: {
          xs: 0,
          sm: 760,
          md: 960,
          lg: 1280,
          xl: 1920,
        },
      },
    }),
    [],
  );

  setupZendesk(location, zendeskCreated, setZendesk);

  axios.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    return Promise.reject(error);
  });

  // If is tablet and portrait tell them to go to landscape
  if ( isTablet && !horizontal) {
    return <RotateIPadInstruction />;
  }

  if (isTablet && showWarning) {
    return <IPadWarning hideWarning={() => setWarning(false)} />
  }
  
  // If is mobile and landscape tell them to go to portrait
  else if (isMobileOnly && horizontal) {
    return <RotateInstruction />;
  }

  // get terms version
  if (props.user && props.user.termsAndConditionsAcceptedVersion && !termsData.termsVersion && !termsData.isLoading) {
    setTermsData({isLoading: true, termsVersion: ''});
    getTerms().then(r => {
      if (r) {
        setTermsData({isLoading: false, termsVersion: r.lastModifiedDate});
      } else {
        setTermsData({isLoading: false, termsVersion: ''});
      }
    });
  }

  // redirect if to terms when file updated
  if (termsData.termsVersion && props.user && props.user.termsAndConditionsAcceptedVersion) {
    console.log(termsData.termsVersion, props.user.termsAndConditionsAcceptedVersion);
    if (termsData.termsVersion !== props.user.termsAndConditionsAcceptedVersion) {
      window.location.href= map.TermsSignUp + '?onlyAcceptTerms=true';
    }
  }

  const onRenderCallback = (
    id: any, // the "id" prop of the Profiler tree that has just committed
    phase: any, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
    actualDuration: any, // time spent rendering the committed update
    baseDuration: any, // estimated time to render the entire subtree without memoization
    startTime: any, // when React began rendering this update
    commitTime: any, // when React committed this update
  ) => {
    // if more then 100ms log it.
    if (baseDuration > 100) {
      //console.log('heavy: ', id, phase, baseDuration, startTime, actualDuration, commitTime);
    } else if (baseDuration > 75) {
      //console.log('medium:', id, phase, baseDuration, startTime, actualDuration, commitTime);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Profiler id="app-tsx" onRender={onRenderCallback} >
      {/* all page routes are here order of routes is important */}
      <Switch>
        <UnauthorizedRoute path={map.AllSubjects} component={ViewAll} />
        <UnauthorizedRoute path="/play/dashboard/:categoryId" component={MobileCategory} />
        <UnauthorizedRoute path="/play/brick/:brickId" component={BrickWrapper} innerComponent={PlayBrickRouting} />
        <UnauthorizedRoute path={map.ViewAllPage} component={ViewAll} />

        <StudentRoute path="/my-library" component={Library} />
        <StudentRoute path="/post-play/brick/:brickId/:userId" component={PostPlay} />

        <BuildRoute path={map.ManageClassroomsTab} component={ManageClassrooms} location={location} />
        <BuildRoute path={map.TeachAssignedTab} component={TeachPage} location={location} />
        <BuildRoute path="/classroom-stats/:classroomId" component={ClassStatisticsPage} location={location} />

        <PlayPreviewRoute path="/play-preview/brick/:brickId" component={PlayPreviewRouting} location={location} />
        <BuildBrickRoute
          path={[
            "/build/brick/:brickId/investigation/question-component/:questionId",
            "/build/brick/:brickId/investigation/question-component",
            "/build/brick/:brickId/investigation/question/:questionId",
            "/build/brick/:brickId/investigation/question",
            "/build/brick/:brickId"
          ]}
          component={BuildRouter}
          location={location}
        />
        <BuildBrickRoute path={map.ProposalBase} component={Proposal} location={location} />
        <BuildRoute path="/build/brick/:brickId" component={Proposal} location={location} />
        <BuildBrickRoute path="/build/brick/:brickId" component={InvestigationBuildPage} location={location} />
        <BuildRoute path={map.BackToWorkPage} component={BackToWorkPage} location={location} />
        <BuildRoute path={map.AssignmentsClassPage} component={AssignmentsPage} location={location} />
        <BuildRoute path={map.AssignmentsPage} component={AssignmentsPage} location={location} />
        <BuildRoute path="/users" component={UsersListPage} location={location} />
        <BuildRoute path={map.UserProfile + '/:userId'} component={UserProfilePage} location={location} />
        <BuildRoute path="/home" component={MainPage} location={location} />

        <AllUsersRoute path={map.UserProfile} component={UserProfilePage} />
        <AllUsersRoute path={map.UserPreference} component={UserPreferencePage} isPreferencePage={true} />
        <AllUsersRoute path={map.SetUsername} component={UsernamePage} />
        <AllUsersRoute path={map.MobileUsername} component={MobileUsernamePage} />
        <AllUsersRoute path={map.SelectSubjectPage} component={SelectSubjectPage} />

        <AuthRoute path={map.Login + '/email'} component={EmailLoginPage} />
        <AuthRoute path={map.Login} component={LoginPage} />
        <AuthRoute path="/login/:privacy" component={LoginPage} />
        <AuthRoute path="/resetPassword" component={ResetPasswordPage} />
        <AuthRoute path={map.ActivateAccount} component={ActivateAccountPage} />
        <Route path={map.TermsSignUp} component={Terms} />
        <Route path={map.TermsPage} component={PublicTerms} />

        <Route component={AuthRedirectRoute} />
      </Switch>
      <VersionLabel />
      <GlobalFailedRequestDialog />
      </Profiler>
    </ThemeProvider>
  );
}

const mapState = (state: ReduxCombinedState) => ({
  user: state.user.user,
});

const mapDispatch = (dispatch: any) => ({
  setLogoutSuccess: () => dispatch(actions.setLogoutSuccess()),
});

export default connect(mapState, mapDispatch)(App);
