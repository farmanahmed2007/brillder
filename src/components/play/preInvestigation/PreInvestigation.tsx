import React from "react";

import { AcademicLevelLabels, Brick } from "model/brick";

import { useEffect } from "react";
import { rightKeyPressed } from "components/services/key";
import { isPhone } from "services/phone";
import SpriteIcon from "components/baseComponents/SpriteIcon";
import DummyProgressbarCountdown from "../baseComponents/timeProgressbar/DummyTimeProgressbar";
import { getSynthesisTime } from "../services/playTimes";

interface Props {
  brick: Brick;
  moveNext(): void;
}

const PreInvestigationPage: React.FC<Props> = ({ brick, ...props }) => {
  useEffect(() => {
    function handleMove(e: any) {
      if (rightKeyPressed(e)) {
        props.moveNext();
      }
    }

    document.addEventListener("keydown", handleMove, false);

    return function cleanup() {
      document.removeEventListener("keydown", handleMove, false);
    };
  });

  if (isPhone()) {
    return <div />;
  }

  const minutes = getSynthesisTime(brick.brickLength);

  return (
    <div className="brick-row-container live-container">
      <div className="brick-container play-preview-panel live-page after-cover-page">
        <div className="introduction-page">
          <div className="after-cover-main-content">
            <div className="title">
              Time for some questions.
            </div>
            <div className="like-buttons-container">
              <div className="x-center">
                <div className="like-button">Preparation</div>
              </div>
              <div className="x-center">
                <div className="like-button orange">Investigation</div><div className="like-button">Synthesis</div>
              </div>
              <div className="x-center">
                <div className="like-button">Review</div>
              </div>
            </div>
            <div className="footer">
              You have<span className="underline-border"> {minutes} minutes </span>to complete the investigation. Once time is up, you will get a provisional score.
            </div>
          </div>
          <div className="new-layout-footer" style={{ display: 'none' }}>
            <div className="time-container">
              <DummyProgressbarCountdown value={100} deadline={true} />
            </div>
            <div className="minutes">{minutes}:00</div>
            <div className="footer-space"/>
            <div className="new-navigation-buttons">
              <div className="n-btn next" onClick={props.moveNext}>
                Play Brick
                <SpriteIcon name="arrow-right" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreInvestigationPage;
