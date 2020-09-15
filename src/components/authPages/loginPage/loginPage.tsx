import React, { useState } from "react";
import { Grid, Snackbar, Hidden } from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";
import { History } from "history";
import axios from "axios";

import actions from "redux/actions/auth";
import "./loginPage.scss";
import sprite from "assets/img/icons-sprite.svg";
import PolicyDialog from 'components/baseComponents/policyDialog/PolicyDialog';
import LoginLogo from './LoginLogo';
import map from 'components/map';

const mapDispatch = (dispatch: any) => ({
  loginSuccess: () => dispatch(actions.loginSuccess()),
});

const connector = connect(null, mapDispatch);

enum LoginState {
  ChooseLogin,
  ButtonsAnimation,
  Login
}

interface LoginProps {
  loginSuccess(): void;
  history: History;
  match: any;
}

const LoginPage: React.FC<LoginProps> = (props) => {
  let initPolicyOpen = false;
  if (props.match.params.privacy && props.match.params.privacy === "privacy-policy") {
    initPolicyOpen = true;
  }
  const [alertMessage, setAlertMessage] = useState("");
  const [alertShown, toggleAlertMessage] = useState(false);
  const [passwordHidden, setHidden] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPolicyOpen, setPolicyDialog] = React.useState(initPolicyOpen);
  const [loginState, setLoginState] = React.useState(LoginState.ChooseLogin);

  const googleLink = `${process.env.REACT_APP_BACKEND_HOST}/auth/google/login/build`;
  const moveToLogin = () => {
    setLoginState(LoginState.ButtonsAnimation);
    setTimeout(() => {
      setLoginState(LoginState.Login);
    }, 300);
  }

  const validateForm = () => {
    if (email.length > 0 && password.length > 0) {
      return true;
    }
    return "Fill required fields";
  };


  function handleSubmit(event: any) {
    event.preventDefault();

    let res = validateForm();
    if (res !== true) {
      toggleAlertMessage(true);
      setAlertMessage(res);
      return;
    }

    login(email, password);
  }

  const login = (email: string, password: string) => {
    axios.post(
      `${process.env.REACT_APP_BACKEND_HOST}/auth/login/3`,
      { email, password, userType: 3 },
      { withCredentials: true }
    ).then((response) => {
      const { data } = response;
      if (data === "OK") {
        props.loginSuccess();
        return;
      }
      let { msg } = data;
      if (!msg) {
        const { errors } = data;
        msg = errors[0].msg;
      }
      toggleAlertMessage(true);
      setAlertMessage(msg);
    }).catch((error) => {
      const { response } = error;
      if (response) {
        if (response.status === 500) {
          toggleAlertMessage(true);
          setAlertMessage("Server error");
        } else if (response.status === 401) {
          const { msg } = response.data;
          if (msg === "USER_IS_NOT_ACTIVE") {
            //props.history.push("/sign-up-success");
          } else if (msg === "INVALID_EMAIL_OR_PASSWORD") {
            toggleAlertMessage(true);
            setAlertMessage("Password is not correct");
          }
        }
      } else {
        toggleAlertMessage(true);
        setAlertMessage("Connection problem");
      }
    });
  };

  const register = (email: string, password: string) => {
    axios.post(
      `${process.env.REACT_APP_BACKEND_HOST}/auth/SignUp/3`,
      { email, password, confirmPassword: password },
      { withCredentials: true }
    ).then((resp) => {
      const { data } = resp;

      if (data.errors) {
        toggleAlertMessage(true);
        setAlertMessage(data.errors[0].msg);
        return;
      }

      if (data.msg) {
        toggleAlertMessage(true);
        setAlertMessage(data.msg);
      }

      if (data === "OK") {
        login(email, password);
      }
    }).catch((e) => {
      toggleAlertMessage(true);
      setAlertMessage("Connection problem");
    });
  };

  const renderButtons = () => {
    let className = 'button-box f-column';
    if (loginState === LoginState.ButtonsAnimation) {
      className += ' animated expanding';
    }
    return (
      <div className={className}>
        <button className="email-button svgOnHover" onClick={moveToLogin}>
          <svg className="svg active">
            {/*eslint-disable-next-line*/}
            <use href={sprite + "#email"} />
          </svg>
          <span>Register &nbsp;|&nbsp; Sign in with email</span>
        </button>
        <a className="google-button svgOnHover" href={googleLink}>
          <svg className="svg active">
            {/*eslint-disable-next-line*/}
            <use href={sprite + "#gmail"} />
          </svg>
          <span>Register &nbsp;|&nbsp; Sign in with Google</span>
        </a>
      </div>
    );
  }

  const renderForm = () => {
    return (
      <form onSubmit={handleSubmit} className="content-box animated">
        <div className="input-block">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-field"
            required
            placeholder="Email"
          />
        </div>
        <div className="input-block">
          <input
            type={passwordHidden ? "password" : "text"}
            value={password}
            className="login-field password"
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
          />
          <div className="hide-password-icon-container">
            <VisibilityIcon
              className="hide-password-icon"
              onClick={() => setHidden(!passwordHidden)}
            />
          </div>
        </div>
        <div className="input-block">
          <div className="button-box">
            <button type="button" className="sign-up-button" onClick={() => register(email, password)}>Sign up</button>
            <button type="submit" className="sign-in-button">Sign in</button>
          </div>
        </div>
      </form>
    );
  };

  return (
    <Grid
      className="auth-page login-page"
      container
      item
      justify="center"
      alignItems="center"
    >
      <Hidden only={["xs"]}>
        <div className="choose-login-desktop">
          <Grid container direction="row" className="first-row">
            <div className="first-col"></div>
            <div className="second-col"></div>
            <div className="third-col"></div>
          </Grid>
          <Grid container direction="row" className="second-row">
            <div className="first-col">
              <LoginLogo />
            </div>
            <div className="second-col">
              {loginState === LoginState.Login ?
                renderForm()
                :
                renderButtons()
              }
            </div>
          </Grid>
          <Grid container direction="row" className="third-row">
            <div className="first-col"></div>
            <div className="second-col">
              <span className="policy-text" onClick={() => setPolicyDialog(true)}>Privacy Policy</span>
            </div>
            <div className="third-col"></div>
          </Grid>
        </div>
      </Hidden>
      {loginState !== LoginState.ChooseLogin ?
        <Hidden only={["sm", "md", "lg", "xl"]}>
          <div className="back-col">
            <div className="back-box">
              <svg
                className="svg active back-button"
                onClick={() => props.history.push(map.Login)}
              >
                {/*eslint-disable-next-line*/}
                <use href={sprite + "#arrow-down"} className="theme-orange" />
              </svg>
            </div>
          </div>
          <div className="first-col">
            <div className="second-item">
              <div className="logo-box">
                <svg
                  className="svg active logo-image mobile"
                  onClick={() => props.history.push(map.Login)}
                >
                  {/*eslint-disable-next-line*/}
                  <use href={sprite + "#login"} className="text-theme-orange" />
                </svg>
              </div>
              <form onSubmit={handleSubmit} className="content-box">
                <div className="input-block">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-field"
                    required
                    placeholder="Email"
                  />
                </div>
                <div className="input-block">
                  <input
                    type={passwordHidden ? "password" : "text"}
                    value={password}
                    className="login-field password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Password"
                  />
                  <div className="hide-password-icon-container">
                    <VisibilityIcon
                      className="hide-password-icon"
                      onClick={() => setHidden(!passwordHidden)}
                    />
                  </div>
                </div>
                <div className="input-block button-box">
                  <Button
                    variant="contained"
                    color="primary"
                    className="sign-up-button"
                    type="button"
                    onClick={() => register(email, password)}
                  >
                    Sign up
                </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    className="sign-in-button"
                    type="submit"
                  >
                    Sign in
                </Button>
                </div>
                <div className="mobile-policy-text">
                  <span onClick={() => setPolicyDialog(true)}>Privacy Policy</span>
                </div>
              </form>
            </div>
          </div>
        </Hidden>
        :
        <Hidden only={['sm', 'md', 'lg', 'xl']}>
          <div className="back-col">
            <div className="back-box">
              <svg className="svg active back-button" onClick={moveToLogin}>
                {/*eslint-disable-next-line*/}
                <use href={sprite + "#arrow-down"} />
              </svg>
            </div>
          </div>
          <div className="first-col">
            <div className="second-item">
              <div className="logo-box">
                <svg
                  className="svg active logo-image mobile"
                  onClick={moveToLogin}
                >
                  {/*eslint-disable-next-line*/}
                  <use href={sprite + "#logo"} className="text-theme-orange" />
                </svg>
              </div>
              <div className="mobile-button-box button-box">
                <button className="email-button svgOnHover" onClick={moveToLogin}>
                  <svg className="svg active">
                    {/*eslint-disable-next-line*/}
                    <use href={sprite + "#email"} />
                  </svg>
                  <span>Register &nbsp;|&nbsp; Sign in with email</span>
                </button>
                <a className="google-button svgOnHover" href={googleLink}>
                  <svg className="svg active">
                    {/*eslint-disable-next-line*/}
                    <use href={sprite + "#gmail"} />
                  </svg>
                  <span>Register &nbsp;|&nbsp; Sign in with Google</span>
                </a>
                <div className="mobile-policy-text">
                  <span onClick={() => setPolicyDialog(true)}>Privacy Policy</span>
                </div>
              </div>
            </div>
          </div>
        </Hidden>
      }
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={alertShown}
        autoHideDuration={1500}
        onClose={() => toggleAlertMessage(false)}
        message={alertMessage}
        action={<React.Fragment></React.Fragment>}
      />
      <PolicyDialog isOpen={isPolicyOpen} close={() => setPolicyDialog(false)} />
    </Grid>
  );
};

export default connector(LoginPage);
