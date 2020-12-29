/*eslint no-useless-escape: "off"*/
import React from "react";
import { Grid, Hidden } from "@material-ui/core";

import './brief.scss';
import NavigationButtons from '../../components/navigationButtons/NavigationButtons';
import ProposalPhonePreview from "components/build/baseComponents/phonePreview/proposalPhonePreview/ProposalPhonePreview";
import Navigation from 'components/build/proposal/components/navigation/Navigation';
import { ProposalStep, PlayButtonStatus, BrickLengthRoutePart } from "../../model";
import DocumentWirisCKEditor from 'components/baseComponents/ckeditor/DocumentWirisEditor';
import MathInHtml from 'components/play/baseComponents/MathInHtml';
import SpriteIcon from "components/baseComponents/SpriteIcon";


interface BriefProps {
  baseUrl: string;
  parentBrief: string;
  playStatus: PlayButtonStatus;
  canEdit: boolean;
  saveBrief(brief: string): void;
  saveAndPreview(): void;
}

const BriefPreviewComponent: React.FC<any> = ({ data }) => {
  return (
    <Grid container justify="center" alignContent="flex-start" className="phone-preview-component">
      <SpriteIcon name="crosshair" className={data ? "" : "big"} />
      <div className="typing-text">
        <MathInHtml value={data} />
      </div>
    </Grid>
  );
}

const BriefComponent: React.FC<BriefProps> = ({ parentBrief, canEdit, saveBrief, ...props }) => {
  return (
    <div className="tutorial-page brief-page">
      <Navigation
        baseUrl={props.baseUrl}
        step={ProposalStep.Brief}
        playStatus={props.playStatus}
        saveAndPreview={props.saveAndPreview}
        onMove={() => saveBrief(parentBrief)}
      />
      <Grid container direction="row" style={{ height: '100%' }} alignItems="center">
        <Grid className="left-block">
          <div className="mobile-view-image">
            <SpriteIcon name="crosshair" />
          </div>
          <h1>Outline the purpose of this brick.</h1>
          <DocumentWirisCKEditor
            disabled={!canEdit}
            data={parentBrief}
            link={true}
            placeholder="Enter Brief Here..."
            toolbar={[
              'bold', 'italic', 'fontColor', 'latex', 'chemType', 'bulletedList', 'numberedList'
            ]}
            onBlur={() => { }}
            onChange={saveBrief}
          />
          <NavigationButtons
            step={ProposalStep.Brief}
            canSubmit={true}
            data={parentBrief}
            onSubmit={saveBrief}
            baseUrl={props.baseUrl}
            backLink={props.baseUrl + BrickLengthRoutePart}
          />
          <h2 className="pagination-text m-0">3 of 4</h2>
        </Grid>
        <ProposalPhonePreview Component={BriefPreviewComponent} data={parentBrief} />
        <Hidden only={['xs', 'sm']}>
          <div className="red-right-block"></div>
        </Hidden>
      </Grid>
    </div>
  );
}

export default BriefComponent