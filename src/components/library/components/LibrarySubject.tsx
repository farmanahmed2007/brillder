import React, { Component } from "react";

import './LibrarySubjects.scss';
import { SubjectAssignments } from "../service/model";
import { LibraryAssignmentBrick } from "model/assignment";
import { SubjectAssignment } from "./SubjectAssignment";

interface LibrarySubjectsProps {
  userId: number;
  history: any;
  subjectAssignment: SubjectAssignments;
}

interface LibrarySubjectState {
  hoveredBrickName: string;
  hovered: boolean;
}


class LibrarySubjects extends Component<LibrarySubjectsProps, LibrarySubjectState> {
  renderAssignment(assignment: LibraryAssignmentBrick, key: number) {
    return <div key={key}>
      <SubjectAssignment
        userId={this.props.userId}
        subject={this.props.subjectAssignment.subject}
        history={this.props.history} assignment={assignment}
      />
    </div>
  }

  findStudent(a: LibraryAssignmentBrick) {
    if (a.brick.assignments && a.brick.assignments.length > 0) {
      const {assignments} = a.brick;
      for (let a2 of assignments) {
        if (a2.student) {
          if (a2.student.id === this.props.userId) {
            return true;
          }
        }
      }
    }
    return false;
  }

  render() {
    const {assignments} = this.props.subjectAssignment;

    assignments.sort((a, b) => {
      let foundA = this.findStudent(a);
      if (a.lastAttemptScore) {
        return -1;
      }
      if (foundA && !a.lastAttemptScore && b.lastAttemptScore) {
        return 1;
      }
      if (foundA) {
        return -1;
      }
      return 1;
    });

    return (
      <div className="libary-container">
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {assignments.map(this.renderAssignment.bind(this))}
        </div>
      </div>
    );
  }
}

export default LibrarySubjects;