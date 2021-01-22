import React, { Component } from "react";
import { Grid, FormControlLabel } from "@material-ui/core";
import AnimateHeight from "react-animate-height";

import "./SubjectsList.scss";
import { Subject } from "model/brick";
import SpriteIcon from "../SpriteIcon";
import { GENERAL_SUBJECT } from "components/services/subject";

interface PublishedSubjectsProps {
  filterHeight: string;
  subjects: Subject[];
  isPublic: boolean;
  filterBySubject(id: number): void;
}

interface ListState {
  canScroll: boolean;
  scrollArea: React.RefObject<any>;
}

class SubjectsListV2 extends Component<PublishedSubjectsProps, ListState> {
  constructor(props: PublishedSubjectsProps) {
    super(props);
    
    this.state = {
      canScroll: false,
      scrollArea: React.createRef()
    }
  }

  componentDidUpdate() {
    this.checkScroll();
  }

  componentDidMount() {
    this.checkScroll();
  }

  checkScroll() {
    const {canScroll} = this.state;
    const {current} = this.state.scrollArea;
    if (current) {
      if (current.scrollHeight > current.clientHeight) {
        if (!canScroll) {
          this.setState({canScroll: true});
        }
      } else {
        if (canScroll) {
          this.setState({canScroll: false});
        }
      }
    }
  }

  scrollUp() {
    const {current} = this.state.scrollArea;
    if (current) {
      current.scrollBy(0, -window.screen.height / 30);
    }
  }

  scrollDown() {
    const {current} = this.state.scrollArea;
    if (current) {
      current.scrollBy(0, window.screen.height / 30);
    }
  }

  renderCircle(color: string) {
    return <div className="filter-circle" style={{ background: color }} />
  }

  renderChecked(subject: Subject) {
    let { color, name } = subject;

    if (name === GENERAL_SUBJECT) {
      color = '#001c58';
    }

    return (
      <div className="subject-border">
        <SpriteIcon name="radio" className="radio-checked" style={{ color, fill: color }} />
      </div>
    );
  }

  renderDefault(color: string) {
    return (
      <div className="subject-no-border">
        {this.renderCircle(color)}
      </div>
    )
  }

  renderSubjectItem(subject: Subject, i: number) {
    let count = this.props.isPublic ? subject.publicCount : subject.personalCount;

    let className = "subject-list-v2";
    if (subject.checked) {
      className += ' checked';
    }

    return (
      <Grid key={i} container direction="row" className={className} onClick={() => this.props.filterBySubject(subject.id)}>
        <Grid item xs={11} className="filter-container subjects-indexes-box">
          <FormControlLabel
            checked={subject.checked}

            control={
              <div>
                {subject.checked
                  ? this.renderChecked(subject)
                  : this.renderDefault(subject.color)
                }
              </div>
            }
            label={subject.name}
          />
        </Grid>
        <Grid item xs={1} className="published-count">
          <Grid
            container
            alignContent="center"
            justify="center"
            style={{ height: "100%", margin: "0 0" }}
          >
            {count && count > 0 ? count : ''}
          </Grid>
        </Grid>
      </Grid>
    )
  }

  render() {
    const { subjects } = this.props;
    let checkedSubjects = subjects.filter(s => s.checked);
    let otherSubjects = subjects.filter(s => !s.checked);

    return (
      <div>
        <div className="scroll-buttons">
          <SpriteIcon name="arrow-up" className={`${!this.state.canScroll ? 'disabled' : ''}`} onClick={this.scrollUp.bind(this)} />
          <SpriteIcon name="arrow-down" className={`${!this.state.canScroll ? 'disabled' : ''}`} onClick={this.scrollDown.bind(this)} />
        </div>
        <Grid container direction="row" className="filter-container subjects-filter subjects-filter-v2 subjects-filter-v3" ref={this.state.scrollArea}>
          <AnimateHeight
            duration={500}
            height={this.props.filterHeight}
            style={{ width: "100%" }}
          >
            {checkedSubjects.map(this.renderSubjectItem.bind(this))}
            {otherSubjects.map(this.renderSubjectItem.bind(this))}
          </AnimateHeight>
        </Grid>
      </div>
    );
  }
}

export default SubjectsListV2;