import React from 'react';
import { Button } from '@material-ui/core';

import './ChooseSeveral.scss';
import CompComponent from '../Comp';
import { ComponentAttempt } from 'components/play/model';
import ReviewEachHint from 'components/play/baseComponents/ReviewEachHint';
import ReviewGlobalHint from 'components/play/baseComponents/ReviewGlobalHint';
import { CompQuestionProps } from '../types';
import MathInHtml from '../../baseComponents/MathInHtml';
import { QuestionValueType } from 'components/build/investigationBuildPage/buildQuestions/questionTypes/types';
import { ChooseOneAnswer } from 'components/build/investigationBuildPage/buildQuestions/questionTypes/chooseOneBuild/types';


interface ChooseSeveralProps extends CompQuestionProps {
  component: any;
  attempt: ComponentAttempt<number[]>;
  answers: number[];
}

interface ChooseSeveralState {
  activeItems: number[];
}

class ChooseSeveral extends CompComponent<ChooseSeveralProps, ChooseSeveralState> {
  constructor(props: ChooseSeveralProps) {
    super(props);

    let activeItems: number[] = [];
    if (props.answers && props.answers.length > 0) {
      activeItems = props.answers;
    } else if (props.attempt?.answer.length > 0) {
      activeItems = Object.assign([], props.attempt.answer);
    }

    this.state = { activeItems };
  }

  setActiveItem(activeItem: number) {
    let { activeItems } = this.state;
    let found = activeItems.indexOf(activeItem);
    if (found >= 0) {
      activeItems.splice(found, 1);
    } else {
      activeItems.push(activeItem);
    }
    if (activeItems.length >= 2 && this.props.onAttempted) {
      this.props.onAttempted();
    }
    this.setState({ activeItems });
  }

  getAnswer(): number[] {
    return this.state.activeItems;
  }

  markLiveChoices(attempt: ComponentAttempt<any>, markIncrement: number) {
    const choices = this.props.component.list;
    for (let [index, choice] of choices.entries()) {
      const checked = attempt.answer.find((answer: number) => answer === index);
      if (checked >= 0) {
        if (choice.checked) {
          attempt.marks += markIncrement;
        } else {
          attempt.marks -= markIncrement;
          attempt.correct = false;
        }
      } else {
        if (choice.checked) {
          attempt.marks -= markIncrement;
          attempt.correct = false;
        }
      }
    }
  }

  getCorrectAnswers() {
    let count = 0;
    for (let item of this.props.component.list) {
      if (item.checked) {
        count += 1;
      }
    }
    return count;
  }

  mark(attempt: ComponentAttempt<number[]>, prev: ComponentAttempt<number[]>) {
    let correctAnswers = this.getCorrectAnswers();
    const markValue = 5;
    const markIncrement = prev ? Math.floor(markValue / correctAnswers) : markValue;

    attempt.correct = true;
    attempt.marks = 0;

    attempt.maxMarks = correctAnswers * markValue;
    this.markLiveChoices(attempt, markIncrement);

    // Then, if the attempt scored no marks or negative and the program is in live phase, then give the student a mark.
    if (attempt.marks <= 0 && attempt.answer !== [] && !prev) { attempt.marks = 1; }
    if (attempt.marks <= 0) { attempt.marks = 0; }

    if (attempt.answer.length === 0) {
      attempt.marks = 0;
    }

    return attempt;
  }

  checkChoice(choice: ChooseOneAnswer, index: number) {
    if (this.props.attempt && this.props.isReview) {
      const { answer } = this.props.attempt;
      const found = answer.find((a: number) => a === index);
      if (found && found >= 0) {
        if (choice.checked) {
          return true;
        } else {
          return false;
        }
      }
    }
    return null;
  }

  renderData(answer: ChooseOneAnswer) {
    if (answer.answerType === QuestionValueType.Image) {
      return <img alt="" src={`${process.env.REACT_APP_BACKEND_HOST}/files/${answer.valueFile}`} width="100%" />;
    } else {
      return <MathInHtml value={answer.value} />;
    }
  }

  renderButton(choice: ChooseOneAnswer, index: number) {
    let isCorrect = this.checkChoice(choice, index);
    let className = "choose-choice";
    let active = this.state.activeItems.find(i => i === index) as number;

    if (this.props.isPreview) {
      if (choice.checked) {
        className += " correct";
      }
    } else {
      if (active >= 0) {
        className += " active";
        if (isCorrect === true) {
          className += " correct";
        } else if (isCorrect === false) {
          className += " wrong";
        }
      }
      if (!isCorrect) {
        isCorrect = false;
      }
    }

    if (choice.answerType === QuestionValueType.Image) {
      className += " image-choice";
    }

    return (
      <Button
        className={className}
        key={index}
        onClick={() => this.setActiveItem(index)}
      >
        {this.renderData(choice)}
        <ReviewEachHint
          isPhonePreview={this.props.isPreview}
          isReview={this.props.isReview}
          isCorrect={isCorrect ? isCorrect : false}
          index={index}
          hint={this.props.question.hint}
        />
      </Button>
    );
  }

  render() {
    const { component } = this.props;

    return (
      <div className="choose-several-live">
        <p className="help-text">Choose more than one option.</p>
        {
          component.list.map((choice: any, index: number) => this.renderButton(choice, index))
        }
        <ReviewGlobalHint
          isReview={this.props.isReview}
          attempt={this.props.attempt}
          isPhonePreview={this.props.isPreview}
          hint={this.props.question.hint}
        />
      </div>
    );
  }
}

export default ChooseSeveral;