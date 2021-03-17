import React, { useState } from "react";
import { History } from "history";
import { Switch } from "react-router-dom";
import { Route } from "react-router-dom";

import 'components/loginPage/desktop/LoginDesktopPage.scss';
import LoginLogo from 'components/loginPage/components/LoginLogo';
import GoogleDesktopButton from "components/loginPage/desktop/GoogleDesktopButton";
import RegisterDesktopButton from "components/loginPage/desktop/RegisterDesktopButton";
import TermsLink from "components/baseComponents/TermsLink"
import TypingLabel from "components/baseComponents/TypingLabel";
import EmailActivateDesktopPage from "./EmailActivateDesktopPage";
import { ActivateAccount, ActivateAccountEmail } from "components/loginPage/desktop/routes";
import PolicyDialog from "components/baseComponents/policyDialog/PolicyDialog"; // TODO: Reuse this for the cookie Popup

export enum LoginPage {
  Default,
  Join,
  Register
}

interface LoginProps {
  history: History;
  token: string | null;
  email: string;
  match: any;
}

const DesktopActivateAccountPage: React.FC<LoginProps> = (props) => {
  let initPolicyOpen = false;
  if (props.match.params.privacy && props.match.params.privacy === "privacy-policy") {
    initPolicyOpen = true;
  }
  const [isPolicyOpen, setPolicyDialog] = useState(initPolicyOpen);
  const { history } = props;

  const moveToRegister = () => history.push(ActivateAccountEmail + '?token=' + props.token);

  return (
    <div className="login-desktop-page">
      <div className="left-part-join">
        <h1>
          <TypingLabel className="" onEnd={() => { }} label="Join the revolution" />
        </h1>
        <div className="image-container spinning">
          <img alt="" src="/images/login/PhoneWheellogin.svg" />
        </div>
      </div>
      <Switch>
        <Route exact path={ActivateAccount}>
          <EmailActivateDesktopPage history={history} email={props.email} token={props.token || ''} />
        </Route>
      </Switch>
      <TermsLink history={history} />
      <PolicyDialog isOpen={isPolicyOpen} close={() => setPolicyDialog(false)} />
    </div>
  );
};

export default DesktopActivateAccountPage;
