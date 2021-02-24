import React, { Component } from "react";

import { Subject } from "model/brick";

import { SubjectAssignments } from "../service/model";
import LibrarySubject from "./LibrarySubject";
import { getPhoneSubjectWidth } from "../service/css";

interface LibrarySubjectsProps {
  userId: number;
  pageSize: number;
  sortedIndex: number;
  subjects: Subject[];
  subjectAssignments: SubjectAssignments[];
  history: any;
}

interface State {
  page: number;
}

class LibraryPhoneSubjects extends Component<LibrarySubjectsProps, State> {
  constructor(props: LibrarySubjectsProps) {
    super(props);

    this.state = {
      page: 0
    };
  }

  componentDidUpdate() {
  }

  countPages() {
    this.props.subjectAssignments.forEach(s => {

    });
  }

  renderSubjectAssignments(item: SubjectAssignments, key: number) {
    const width = getPhoneSubjectWidth(item);
    return <div key={key} className="libary-container-1" style={{width: width + 'vw', display: 'inline-flex'}}>
      <LibrarySubject userId={this.props.userId} subjectAssignment={item} history={this.props.history} />
    </div>
  }

  render() {
    return (
      <div className="my-library-list">
        {this.props.subjectAssignments.map(this.renderSubjectAssignments.bind(this))}
      </div>
    );
  }
}

export default LibraryPhoneSubjects;