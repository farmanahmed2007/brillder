import React from "react";
import update from 'immutability-helper';
import { Button, Grid } from "@material-ui/core";

import './preLoginPage.scss'


enum LoginType {
  Student = 1,
  Teacher = 2,
  Builder = 3
}

function PreLoginPage(props: any) {
  const [userType, setUserType] = React.useState(0)
  const selectLoginType = (type: LoginType) => {
    setUserType(update(userType, { $set: type }));
  }

  const moveToLogin = () => {
    props.history.push('/login?userType=' + userType)
  }

  if (userType == 0) {
    return (
      <Grid className="pre-login-page" style={{height: '100%'}} container item justify="center" alignItems="center">
        <Grid container style={{height: '100%'}} justify="center" item xs={6} alignItems="center">
          <Grid container style={{height: '70%', borderRight: "2px solid white"}} justify="center" item xs={12} alignItems="center">
            <img src="/images/BrixLogo.png" style={{height: '80%'}} />
          </Grid>
        </Grid>
        <Grid container item xs={6}>
          <Grid container direction="row">
            <Grid container item xs={12} justify="center">
              <Button onClick={() => selectLoginType(LoginType.Student)} className="user-type-btn">
                <span className="user-type-name">Student</span>
              </Button>
            </Grid>
          </Grid>
          <Grid container direction="row">
            <Grid container item xs={12} justify="center">
              <Button onClick={() => selectLoginType(LoginType.Teacher)} className="user-type-btn">
                <span className="user-type-name">Teacher</span>
              </Button>
            </Grid>
          </Grid>
          <Grid container direction="row">
            <Grid container item xs={12} justify="center">
              <Button onClick={() => selectLoginType(LoginType.Builder)} className="user-type-btn">
                <span className="user-type-name">Builder</span>
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  } else {

    return (
      <Grid className="pre-login-page" container item justify="center" alignItems="center">
        <div className="login-container">
          <div className="login-logo">
            <img src="/images/lflogo.png" alt="lol" />
          </div>
          <Grid container direction="row">
            <Grid container item xs={12} justify="center">
              <Button className="email-button" onClick={moveToLogin}>
                <img className="email-icon" alt="" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/mail.svg" />
                <span className="email-button-text">Sign in with email</span>
              </Button>
            </Grid>
          </Grid>
          <Grid container direction="row">
            <Grid container item xs={12} justify="center">
              <Button className="google-button" href={process.env.REACT_APP_BACKEND_HOST + '/auth/google'}>
                <img className="google-icon" alt="" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"/>
                <span className="google-button-text">Sign in with Google</span>
              </Button>
            </Grid>
          </Grid>
          <Grid container direction="row">
            <Grid container item xs={12} justify="center">
              <img className="fotter" src="/images/brillder-2-logo.png" /><br />
            </Grid>
          </Grid>
        </div>
      </Grid>
    );
  }
}

export default PreLoginPage
