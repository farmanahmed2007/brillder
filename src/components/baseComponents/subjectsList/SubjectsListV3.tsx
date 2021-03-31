import React, { Component } from "react";
import { Grid, FormControlLabel, Radio } from "@material-ui/core";
import AnimateHeight from "react-animate-height";

import { isIPad13, isMobile, isTablet } from 'react-device-detect';
import { Subject } from "model/brick";
import SpriteIcon from "../SpriteIcon";
import RadioButton from "../buttons/RadioButton";

interface PublishedSubjectsProps {
  filterHeight: string;
  subjects: Subject[];
  isPublic: boolean;
  isSelected: boolean;
  isAll: boolean;
  toggleAll(): void;
  filterBySubject(id: number): void;
}

interface ListState {
  canScroll: boolean;
  scrollArea: React.RefObject<any>;
}

const MobileTheme = React.lazy(() => import('./themes/SubjectFilterMobileTheme'));
const TabletTheme = React.lazy(() => import('./themes/SubjectFilterTabletTheme'));
const DesktopTheme = React.lazy(() => import('./themes/SubjectFilterDesktopTheme'));

class SubjectsListV3 extends Component<PublishedSubjectsProps, ListState> {
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
    const { canScroll } = this.state;
    const { current } = this.state.scrollArea;
    if (current) {
      if (current.scrollHeight > current.clientHeight) {
        if (!canScroll) {
          this.setState({ canScroll: true });
        }
      } else {
        if (canScroll) {
          this.setState({ canScroll: false });
        }
      }
    }
  }

  scrollUp() {
    const { current } = this.state.scrollArea;
    if (current) {
      current.scrollBy(0, -window.screen.height / 30);
    }
  }

  scrollDown() {
    const { current } = this.state.scrollArea;
    if (current) {
      current.scrollBy(0, window.screen.height / 30);
    }
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
              <RadioButton checked={subject.checked} name={subject.name} color={subject.color} />
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
      <React.Suspense fallback={<></>}>
        {isIPad13 || isTablet ? <TabletTheme /> : isMobile ? <MobileTheme /> : <DesktopTheme />}
        <div className="scroll-buttons">
          <FormControlLabel
            className="radio-container"
            checked={this.props.isAll}
            control={<Radio onClick={this.props.toggleAll} />}
            label="All" />
          <SpriteIcon name="arrow-up" className={`${!this.state.canScroll ? 'disabled' : ''}`} onClick={this.scrollUp.bind(this)} />
          <SpriteIcon name="arrow-down" className={`${!this.state.canScroll ? 'disabled' : ''}`} onClick={this.scrollDown.bind(this)} />
          {this.props.isSelected &&
            <button
              className="btn-transparent filter-icon arrow-cancel"
              onClick={this.props.toggleAll}
            ></button>}
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
      </React.Suspense>
    );
  }
}

export default SubjectsListV3;
