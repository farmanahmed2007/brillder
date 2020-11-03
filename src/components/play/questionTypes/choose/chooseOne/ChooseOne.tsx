import React from 'react';
import { Button } from '@material-ui/core';

import '../choose.scss';
import './ChooseOne.scss';
import CompComponent from '../../Comp';
import { CompQuestionProps } from '../../types';
import { ComponentAttempt } from 'components/play/model';
import ReviewEachHint from '../../../baseComponents/ReviewEachHint';
import ReviewGlobalHint from '../../../baseComponents/ReviewGlobalHint';
import MathInHtml from '../../../baseComponents/MathInHtml';
import { QuestionValueType } from 'components/build/buildQuestions/questionTypes/types';
import { ChooseOneChoice } from 'components/interfaces/chooseOne';

export interface ChooseOneComponent {
  type: number;
  list: ChooseOneChoice[];
}

export type ChooseOneAnswer = ActiveItem;

interface ChooseOneProps extends CompQuestionProps {
  component: ChooseOneComponent;
  attempt: ComponentAttempt<ActiveItem>;
  answers: ActiveItem;
}

export interface ActiveItem {
  shuffleIndex: number;
  realIndex: number;
}

interface ChooseOneState {
  activeItem: ActiveItem;
}

class ChooseOne extends CompComponent<ChooseOneProps, ChooseOneState> {
  constructor(props: ChooseOneProps) {
    super(props);
    const activeItem = this.getActiveItem(props);
    this.state = { activeItem };
  }

  getActiveItem(props: ChooseOneProps) {
    let activeItem = { shuffleIndex: -1, realIndex: -1};
    if (props.answers?.shuffleIndex >= 0) {
      activeItem = props.answers;
    } else if (props.attempt?.answer?.shuffleIndex >= 0) {
      activeItem = props.attempt.answer;
    }
    return activeItem;
  }

  componentDidUpdate(prevProp: ChooseOneProps) {
    if (this.props.isBookPreview) {
      if (this.props.answers !== prevProp.answers) {
        const activeItem = this.getActiveItem(this.props);
        this.setState({activeItem});
      }
    }
  }

  setActiveItem(realIndex: number, activeItem: number) {
    this.setState({ activeItem: { realIndex, shuffleIndex: activeItem} });
    if (this.props.onAttempted) {
      this.props.onAttempted();
    }
  }

  getAnswer() {
    return this.state.activeItem;
  }

  renderData(answer: ChooseOneChoice) {
    if (answer.answerType === QuestionValueType.Image) {
      return <img alt="" src={`${process.env.REACT_APP_BACKEND_HOST}/files/${answer.valueFile}`} />;
    } else {
      return <MathInHtml value={answer.value} />;
    }
  }

  isCorrect(index: number) {
    if (this.props.attempt?.correct) {
      if (index === this.props.attempt?.answer.shuffleIndex) {
        return true;
      }
    }
    return false;
  }

  isResultCorrect(index: number, choice: ChooseOneChoice) {
    if (this.props.attempt?.answer) {
      if (choice.checked && index === this.props.attempt?.answer.realIndex) {
        return true;
      }
    }
    return false;
  }

  renderBookChoice(index: number, activeItem: ActiveItem, choice: ChooseOneChoice) {
    const isCorrect = this.isResultCorrect(index, choice);
    let className = "choose-choice";

    if (choice.answerType === QuestionValueType.Image) {
      className += " image-choice";
    }

    if (index === activeItem.realIndex) {
      if (isCorrect) {
        className += " correct";
      } else if (isCorrect === false) {
        className += " wrong";
      }
    }
    return (
      <Button className={className} key={index}>
        {this.renderData(choice)}
        <ReviewEachHint
          isPhonePreview={this.props.isPreview}
          isReview={this.props.isReview}
          isCorrect={isCorrect}
          index={index}
          hint={this.props.question.hint}
        />
      </Button>
    );
  }

  renderChoice(choice: ChooseOneChoice, index: number) {
    const { attempt } = this.props;
    let isCorrect = this.isCorrect(index);
    let className = "choose-choice";
    const { activeItem } = this.state;

    if (this.props.isPreview) {
      if (choice.checked) {
        className += " correct";
      }
    } else if (index === activeItem.shuffleIndex) {
      className += " active";
    }

    if (choice.answerType === QuestionValueType.Image) {
      className += " image-choice";
    }

    // book preview
    if (this.props.isBookPreview) {
      return this.renderBookChoice(index, activeItem, choice);
    }
    // if review show correct or wrong else just make answers active
    else if (attempt && index === activeItem.shuffleIndex) {
      let { answer } = attempt;
      if (answer.shuffleIndex >= 0 && answer.shuffleIndex === index) {
        if (this.props.isReview) {
          if (isCorrect) {
            className += " correct";
          } else if (isCorrect === false) {
            className += " wrong";
          }
        }
      } else {
        className += " active";
      }
    }

    return (
      <Button
        className={className}
        key={index}
        onClick={() => this.setActiveItem(choice.index, index)}
      >
        {this.renderData(choice)}
        {this.props.isPreview ?
          <ReviewEachHint
            isPhonePreview={true}
            isReview={false}
            isCorrect={isCorrect}
            index={index}
            hint={this.props.question.hint}
          />
          : this.props.isReview &&
          <ReviewEachHint
            isPhonePreview={false}
            isReview={true}
            isCorrect={isCorrect}
            index={choice.index}
            hint={this.props.question.hint}
          />
        }
      </Button>
    );
  }

  render() {
    const { list } = this.props.component;
    return (
      <div className="question-unique-play choose-one-live">
        {list.map((choice, index) => this.renderChoice(choice, index))}
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

export default ChooseOne;