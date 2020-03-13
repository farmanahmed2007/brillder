import React from 'react';
import { Question } from "components/model/question";
import { Grid, Select } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import CompComponent from '../Comp';

import './MissingWord.scss';
import { ComponentAttempt } from 'components/play/brick/model/model';
import ReviewGlobalHint from '../../baseComponents/ReviewGlobalHint';
import { HintStatus } from 'components/build/baseComponents/Hint/Hint';


interface MissingWordProps {
  question: Question;
  component: any;
  attempt: ComponentAttempt;
  answers: number[];
}

interface MissingWordState {
  userAnswers: any[];
  choices: any[];
}

class MissingWord extends CompComponent<MissingWordProps, MissingWordState> {
  constructor(props: MissingWordProps) {
    super(props);
    let userAnswers: any[] = [];
    console.log(props)
    if (props.answers) {
      userAnswers = props.answers;
    } else if (props.attempt?.answer?.length > 0) {
      props.attempt.answer.forEach((a: number) => userAnswers.push(a));
    } else {
      props.component.choices.forEach(() => userAnswers.push({value: -1}));
    }

    this.state = { userAnswers, choices: props.component.choices };
  }

  setUserAnswer(e: any, index: number) {
    let userAnswers = this.state.userAnswers;
    userAnswers[index].value = e.target.value as number;
    this.setState({ userAnswers });
  }

  getAnswer(): number[] {
    return this.state.userAnswers;
  }

  getState(entry: number): number {
    if (this.props.attempt.answer[entry]) {
      if (this.props.attempt.answer[entry].toLowerCase().replace(/ /g, '') === this.props.component.list[entry].answer.toLowerCase().replace(/ /g, '')) {
        return 1;
      } else { return -1; }
    } else { return 0; }
  }

  mark(attempt: any, prev: any): any {
    const markValue = 5;
    const markIncrement = prev ? 2 : markValue;

    attempt.correct = true;
    attempt.marks = 0;
    attempt.maxMarks = this.state.choices.length * 5;

    this.state.userAnswers.forEach((choice, i) => {
      console.log(this.state.choices[i]);
    });

    attempt.answer = this.state.userAnswers;
    if (attempt.marks === 0 && attempt.answer !== [] && !prev) { attempt.marks = 1; } 
    return attempt;
  }

  renderEachHint(index: number) {
    const {hint} = this.props.question;
    if (this.props.attempt?.correct === false && hint.status === HintStatus.Each && hint.list[index]) {
      return <div className="question-hint">{hint.list[index]}</div>;
    }
    return "";
  }

  render() {
    const { component } = this.props;

    return (
      <div className="missing-word-live">
        {
          component.choices.map((choice: any, index: number) =>
            <div key={index} className="missing-word-choice">
              <Grid container direction="row" justify="center">
                {choice.before}
                <Select className="missing-select" value={this.state.userAnswers[index]} onChange={(e) => this.setUserAnswer(e, index)}>
                  {
                    choice.answers.map((a: any, i:number) => (
                      <MenuItem key={i} value={i}>{a.value}</MenuItem>
                    ))
                  }
                </Select>
                {choice.after}
              </Grid>
              <Grid container direction="row" justify="center">
                {this.renderEachHint(index)}
              </Grid>
            </div>
          )
        }
        <ReviewGlobalHint attempt={this.props.attempt} hint={this.props.question.hint} />
      </div>
    );
  }
}

export default MissingWord;
