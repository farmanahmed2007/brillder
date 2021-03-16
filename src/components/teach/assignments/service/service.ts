import { Assignment, TeachClassroom } from "model/classroom";
import { TeachListItem } from "../components/ClassroomsList";

const isArchived = (assignment: Assignment) => {
  return assignment.studentStatus && assignment.studentStatus.length > 0 && assignment.studentStatus[0].status == 3;
}

export const convertClassAssignments = (items: any[], classroom: TeachClassroom, isArchive: boolean) => {
  for (let assignment of classroom.assignments) {
    let item: TeachListItem = {
      classroom,
      assignment
    };

    if (isArchived(assignment)) {
      if (isArchive) {
        items.push(item);
      }
    } else {
      if (!isArchive) {
        items.push(item);
      }
    }
  }
}