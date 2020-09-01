import React, { useEffect } from "react";
import { Grid, Hidden } from "@material-ui/core";
import SwipeableViews from "react-swipeable-views";
import { useTheme } from "@material-ui/core/styles";
import { useHistory, useLocation } from "react-router-dom";
import queryString from 'query-string';

import "./Live.scss";
import { Question, QuestionTypeEnum } from "model/question";
import QuestionLive from "../questionPlay/QuestionPlay";
import TabPanel from "../baseComponents/QuestionTabPanel";
import { PlayStatus, ComponentAttempt } from "../model";
import CountDown from "../baseComponents/CountDown";
import sprite from "assets/img/icons-sprite.svg";
import { CashQuestionFromPlay } from "localStorage/buildLocalStorage";
import { Brick } from "model/brick";
import LiveStepper from "./LiveStepper";
import ShuffleAnswerDialog from "components/baseComponents/failedRequestDialog/ShuffleAnswerDialog";
import SubmitAnswersDialog from "components/baseComponents/dialogs/SubmitAnswers";
import PulsingCircleNumber from "./PulsingCircleNumber";
import { PlayMode } from "../model";
import { Moment } from 'moment';
import { getPlayPath, getAssignQueryString } from "../service";

interface LivePageProps {
  status: PlayStatus;
  attempts: ComponentAttempt<any>[];
  brick: Brick;
  questions: Question[];
  isPlayPreview?: boolean;
  previewQuestionIndex?: number;
  updateAttempts(attempt: any, index: number): any;
  finishBrick(): void;

  // things related to count down
  endTime: any;
  setEndTime(time: Moment): void;

  // only for real play
  mode?: PlayMode;
}

const LivePage: React.FC<LivePageProps> = ({
  status,
  questions,
  brick,
  ...props
}) => {
  let initStep = 0;
  if (props.previewQuestionIndex) {
    if (questions[props.previewQuestionIndex]) {
      initStep = props.previewQuestionIndex;
    }
  }

  const [activeStep, setActiveStep] = React.useState(initStep);
  const [prevStep, setPrevStep] = React.useState(initStep);
  const [isShuffleOpen, setShuffleDialog] = React.useState(false);
  const [isTimeover, setTimeover] = React.useState(false);
  const [isSubmitOpen, setSubmitAnswers] = React.useState(false);
  let initAnswers: any[] = [];

  const [answers, setAnswers] = React.useState(initAnswers);
  const history = useHistory();

  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    const values = queryString.parse(location.search);
    if (values.activeStep) {
      setActiveStep(parseInt(values.activeStep as string));
    }
  }, [location.search]);

  const moveToProvisional = () => {
    let playPath = getPlayPath(props.isPlayPreview, brick.id);
    history.push(`${playPath}/provisionalScore${getAssignQueryString(location)}`);
  }

  if (status > PlayStatus.Live) {
    moveToProvisional();
    return <div></div>;
  }

  let questionRefs: React.RefObject<QuestionLive>[] = [];
  questions.forEach(() => questionRefs.push(React.createRef()));

  const handleStep = (step: number) => () => {
    setActiveAnswer();
    let newStep = activeStep + 1;

    if (props.isPlayPreview) {
      CashQuestionFromPlay(brick.id, newStep);
    }
    setTimeout(() => {
      setPrevStep(activeStep);
      setActiveStep(step);
    }, 100);
  };

  /**
   * Handle mobile swipe
   * @param index number - could be from 0 to 1. in the end should be interger value
   * @param status string - almost all time is "move" and in the end "end"
   */
  const handleSwipe = (step: number, status: string) => {
    if (status === "end") {
      setActiveStep(Math.round(step));
      if (step === questions.length) {
        moveNext();
      }
    }
  }

  const setCurrentAnswerAttempt = () => {
    let attempt = questionRefs[activeStep].current?.getAttempt();
    props.updateAttempts(attempt, activeStep);
  }

  const setActiveAnswer = () => {
    const copyAnswers = Object.assign([], answers) as any[];
    copyAnswers[activeStep] = questionRefs[activeStep].current?.getAnswer();
    setCurrentAnswerAttempt();
    setAnswers(copyAnswers);
  };

  const prev = () => {
    if (activeStep === 0) {
      moveToPrep();
    } else {
      handleStep(activeStep - 1)();
    }
  }

  const nextFromShuffle = () => {
    setShuffleDialog(false);
    onQuestionAttempted(activeStep);

    handleStep(activeStep + 1)();
    if (activeStep >= questions.length - 1) {
      questions.forEach((question) => (question.edited = false));
      props.finishBrick();
      moveToProvisional();
    }
  };

  const cleanAndNext = () => {
    setShuffleDialog(false);
    handleStep(activeStep + 1)();
    questions[activeStep].edited = false;
    if (activeStep >= questions.length - 1) {
      moveNext();
    }
  };

  const next = () => {
    let question = questions[activeStep];
    if (
      question.type === QuestionTypeEnum.PairMatch ||
      question.type === QuestionTypeEnum.HorizontalShuffle ||
      question.type === QuestionTypeEnum.VerticalShuffle
    ) {
      let attempt = questionRefs[activeStep].current?.getAttempt();
      if (!attempt.dragged) {
        setShuffleDialog(true);
        return;
      }
    }
    handleStep(activeStep + 1)();
    if (activeStep >= questions.length - 1) {
      moveNext();
    }
  };

  const onEnd = () => {
    setTimeover(true);
    moveNext();
  }

  const moveNext = () => {
    questions.forEach((question) => (question.edited = false));
    props.finishBrick();
    moveToProvisional();
  }

  const onQuestionAttempted = (questionIndex: number) => {
    if (!questions[questionIndex].edited) {
      questions[activeStep].edited = true;
      handleStep(questionIndex)();
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    return (
      <QuestionLive
        mode={props.mode}
        isTimeover={isTimeover}
        question={question}
        attempt={props.attempts[index]}
        answers={answers[index]}
        ref={questionRefs[index]}
        onAttempted={() => onQuestionAttempted(index)}
      />
    );
  };

  const renderQuestionContainer = (question: Question, index: number) => {
    return (
      <TabPanel
        key={index}
        index={index}
        value={activeStep}
        dir={theme.direction}
      >
        <div className="introduction-page">
          <PulsingCircleNumber
            isPulsing={true}
            edited={question.edited}
            number={index + 1}
          />
          <div className="question-live-play review-content">
            <div className="question-title">Investigation</div>
            {renderQuestion(question, index)}
          </div>
        </div>
      </TabPanel>
    );
  };

  const renderPrevButton = () => {
    return (
      <button
        className="play-preview svgOnHover play-white"
        onClick={prev}
      >
        <svg className="svg w80 h80 svg-default m-0">
          {/*eslint-disable-next-line*/}
          <use href={sprite + "#arrow-left"} className="text-gray" />
        </svg>
        <svg className="svg w80 h80 colored m-0">
          {/*eslint-disable-next-line*/}
          <use href={sprite + "#arrow-left"} className="text-white" />
        </svg>
      </button>
    );
  };

  const moveToPrep = () => {
    let attempt = questionRefs[activeStep].current?.getRewritedAttempt();
    props.updateAttempts(attempt, activeStep);
    let playPath = getPlayPath(props.isPlayPreview, brick.id);
    const values = queryString.parse(location.search);
    let link = `${playPath}/intro?prepExtanded=true&resume=true&activeStep=${activeStep}`;
    if (values.assignmentId) {
      link += '&assignmentId=' + values.assignmentId;
    }

    history.push(link);
  }

  const renderStepper = () => {
    return (
      <LiveStepper
        activeStep={activeStep}
        questions={questions}
        previousStep={prevStep}
        handleStep={handleStep}
        moveToPrep={moveToPrep}
      />
    );
  }

  const renderNextButton = () => {
    if (questions.length - 1 > activeStep) {
      return (
        <button
          type="button"
          className="play-preview svgOnHover play-green"
          onClick={next}
        >
          <svg className="svg w80 h80 active m-l-02">
            {/*eslint-disable-next-line*/}
            <use href={sprite + "#arrow-right"} />
          </svg>
        </button>
      );
    }
    return (
      <button
        type="button"
        className="play-preview svgOnHover play-green"
        onClick={() => setSubmitAnswers(true)}
      >
        <svg className="svg w80 h80 active" style={{ margin: 0 }}>
          {/*eslint-disable-next-line*/}
          <use href={sprite + "#check-icon-thin"} />
        </svg>
      </button>
    );
  }

  const renderCenterText = () => {
    if (questions.length - 1 > activeStep) {
      return (
        <div className="direction-info">
          <h2 className="text-center">Next</h2>
          <span>Don’t panic, you can<br />always come back</span>
        </div>
      );
    }
    return (
      <div className="direction-info">
        <h2 className="text-center">Submit</h2>
        <span style={{bottom: '-1vw'}}>How do you think it went?</span>
      </div>
    );
  }

  const renderMobileNext = () => {
    if (questions.length - 1 > activeStep) { return; }
    return (
      <button
        type="button"
        className="play-preview svgOnHover play-green mobile-next"
        onClick={() => setSubmitAnswers(true)}
      >
        <svg className="svg w80 h80 active" style={{ margin: 0 }}>
          {/*eslint-disable-next-line*/}
          <use href={sprite + "#check-icon-thin"} />
        </svg>
      </button>
    );
  }

  const renderFooter = () => {
    return (
      <div className="action-footer">
        <div>{renderPrevButton()}</div>
        {renderCenterText()}
        <div>{renderNextButton()}</div>
      </div>
    );
  }

  const renderCountDown = () => {
    return (
      <CountDown
        isLive={true}
        onEnd={onEnd}
        endTime={props.endTime}
        brickLength={brick.brickLength}
        setEndTime={props.setEndTime}
      />
    );
  }

  return (
    <div className="brick-container live-page">
      <Hidden only={["xs"]}>
        <Grid container direction="row">
          <Grid item xs={8}>
            <SwipeableViews
              axis={theme.direction === "rtl" ? "x-reverse" : "x"}
              index={activeStep}
              className="swipe-view"
              style={{ width: "100%" }}
              onChangeIndex={handleStep}
            >
              {questions.map(renderQuestionContainer)}
            </SwipeableViews>
          </Grid>
          <Grid item xs={4}>
            <div className="introduction-info">
              {renderCountDown()}
              <div className="intro-text-row">
                {renderStepper()}
              </div>
              {renderFooter()}
            </div>
          </Grid>
        </Grid>
      </Hidden>

      <Hidden only={["sm", "md", "lg", "xl"]}>
        <div className="introduction-info">
          {renderCountDown()}
          <div className="intro-text-row">
            <span className="heading">Investigation</span>
            {renderStepper()}
          </div>
        </div>
        <div className="introduction-page">
          <SwipeableViews
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={activeStep}
            className="swipe-view"
            style={{ width: "100%" }}
            onSwitching={handleSwipe}
            onChangeIndex={handleStep}
          >
            {questions.map(renderQuestionContainer)}
            <TabPanel index={questions.length} value={activeStep} />
          </SwipeableViews>
        </div>
        {renderMobileNext()}
      </Hidden>
      <ShuffleAnswerDialog
        isOpen={isShuffleOpen}
        submit={() => nextFromShuffle()}
        hide={() => setShuffleDialog(false)}
        close={() => cleanAndNext()}
      />
      <SubmitAnswersDialog
        isOpen={isSubmitOpen}
        submit={moveNext}
        close={() => setSubmitAnswers(false)}
      />
    </div>
  );
};

export default LivePage;