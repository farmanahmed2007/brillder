import React from "react";
import Checkbox from "@material-ui/core/Checkbox";

import './ChooseOneAnswer.scss';
import DocumentWirisCKEditor from 'components/baseComponents/ckeditor/DocumentWirisEditor';
import QuestionImageDropzone from "components/build/baseComponents/questionImageDropzone/QuestionImageDropzone";
import { QuestionValueType } from "../types";
import { ChooseOneAnswer } from './types';
import RemoveItemButton from "../components/RemoveItemButton";


export interface ChooseOneAnswerProps {
  locked: boolean;
  editOnly: boolean;
  index: number;
  length: number;
  answer: ChooseOneAnswer;
  validationRequired: boolean;
  checkBoxValid: boolean;
  save(): void;
  removeFromList(index: number): void;
  onChecked(event: any, checked: boolean): void;
  update(): void;
  onBlur(): void;
}

const ChooseOneAnswerComponent: React.FC<ChooseOneAnswerProps> = ({
  locked, editOnly, index, length, answer, validationRequired, checkBoxValid,
  removeFromList, update, save, onChecked, onBlur
}) => {
  const setImage = (fileName: string) => {
    if (locked) { return; }
    answer.value = "";
    answer.valueFile = fileName;
    answer.answerType = QuestionValueType.Image;
    update();
    save();
  }

  const onTextChanged = (answer: ChooseOneAnswer, value: string) => {
    if (locked) { return; }
    answer.value = value;
    answer.valueFile = "";
    answer.answerType = QuestionValueType.String;
    update();
  }

  let containerClass = "";
  let className = 'choose-one-box unique-component';
  if (answer.answerType === QuestionValueType.Image) {
    className += ' big-answer';
    containerClass = 'big-box';
  }

  let checkboxClass = "left-ckeckbox";
  if (validationRequired) {
    if (!checkBoxValid) {
      checkboxClass += " checkbox-invalid";
    }
  }

  return (
    <div className={className}>
      <RemoveItemButton index={index} length={length} onClick={removeFromList} />
      <div className={"checkbox-container " + containerClass}>
        <Checkbox
          className={checkboxClass}
          disabled={locked}
          checked={answer.checked}
          onChange={onChecked}
          value={index}
        />
      </div>
      <QuestionImageDropzone
        answer={answer as any}
        type={answer.answerType || QuestionValueType.None}
        locked={locked}
        fileName={answer.valueFile}
        update={setImage}
      />
      <DocumentWirisCKEditor
        disabled={locked}
        editOnly={editOnly}
        data={answer.value}
        toolbar={['latex', 'chemType']}
        placeholder="Enter Answer..."
        validationRequired={answer.answerType !== QuestionValueType.Image ? validationRequired : false}
        onBlur={() => {
          onBlur();
          save();
        }}
        onChange={value => onTextChanged(answer, value)}
      />
    </div>
  );
};

export default ChooseOneAnswerComponent;
