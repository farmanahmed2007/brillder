import React from "react";
import { Grid, Hidden } from "@material-ui/core";

import './prep.scss';
import { ProposalStep, PlayButtonStatus } from "../../model";
import map from 'components/map';

import NavigationButtons from '../../components/navigationButtons/NavigationButtons';
import DocumentWirisCKEditor from 'components/baseComponents/ckeditor/DocumentWirisEditor';
import ProposalPhonePreview from "components/build/baseComponents/phonePreview/proposalPhonePreview/ProposalPhonePreview";
import Navigation from 'components/proposal/components/navigation/Navigation';
import YoutubeAndMath from 'components/play/baseComponents/YoutubeAndMath';
import SpriteIcon from "components/baseComponents/SpriteIcon";


interface PrepProps {
  parentPrep: string;
  canEdit: boolean;
  playStatus: PlayButtonStatus;
  savePrep(prep: string): void;
  saveBrick(prep: string): void;
}

const PrepPreviewComponent: React.FC<any> = ({ data }) => {
  return (
    <Grid container justify="center" alignContent="flex-start" className="phone-preview-component">
      <SpriteIcon name="file-text" className={data ? "" : "big"} />
      <div className="typing-text">
        <YoutubeAndMath value={data} />
      </div>
    </Grid>
  );
}

const PrepComponent: React.FC<PrepProps> = ({ parentPrep, canEdit, playStatus, savePrep, saveBrick }) => {
  return (
    <div className="tutorial-page prep-page">
      <Navigation step={ProposalStep.Prep} playStatus={playStatus} onMove={() => savePrep(parentPrep)} />
      <Grid container direction="row" alignItems="flex-start">
        <Grid className="left-block">
          <div className="mobile-view-image">
            <img className="size2" alt="titles" src="/images/new-brick/prep.png" />
          </div>
          <h1>Add engaging and relevant <br /> preparatory material.</h1>
          <DocumentWirisCKEditor
            disabled={!canEdit}
            data={parentPrep}
            placeholder="Enter Instructions, Links to Videos and Webpages Here…"
            mediaEmbed={true}
            link={true}
            toolbar={[
              'bold', 'italic', 'fontColor', 'mathType', 'chemType', 'bulletedList', 'numberedList'
            ]}
            onBlur={() => { }}
            onChange={savePrep}
          />
          <NavigationButtons
            step={ProposalStep.Prep}
            canSubmit={true}
            data={parentPrep}
            onSubmit={saveBrick}
            backLink={map.ProposalBrief}
          />
          <h2 className="pagination-text">4 of 4</h2>
        </Grid>
        <ProposalPhonePreview Component={PrepPreviewComponent} data={parentPrep} />
        <Hidden only={['xs', 'sm']}>
          <div className="red-right-block"></div>
        </Hidden>
      </Grid>
    </div>
  );
}

export default PrepComponent
