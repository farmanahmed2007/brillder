import React from "react";
import Grow from "@material-ui/core/Grow";
import { Box } from "@material-ui/core";

import { Brick, BrickStatus } from "model/brick";
import { User, UserType } from "model/user";

import ShortBrickDecsiption from "components/baseComponents/ShortBrickDescription";
import ExpandedBrickDecsiption from "components/baseComponents/ExpandedBrickDescription";

interface BrickBlockProps {
  brick: Brick;
  user: User;
  index: number;
  row: number;
  shown: boolean;
  history: any;
  isPlay?: boolean;
  handleDeleteOpen(brickId: number): void;
  handleMouseHover(e: any): void;
  handleMouseLeave(e: any): void;
}

const BrickBlockComponent: React.FC<BrickBlockProps> = ({ brick, index, row = 0, ...props }) => {
  let color = "";
  if (brick.status === BrickStatus.Draft) {
    color = "color1";
  } else if (brick.status === BrickStatus.Review) {
    color = "color2";
  } else if (brick.status === BrickStatus.Build) {
    color = "color3";
  } else if (brick.status === BrickStatus.Publish) {
    color = "color4";
  }

  if (props.isPlay) {
    if (!brick.subject) {
      color = "#B0B0AD";
    } else {
      color = brick.subject.color;
    }
  }

  const isAdmin = props.user.roles.some(role => role.roleId === UserType.Admin);

  const move = () => {
    if (props.isPlay) {
      props.history.push(`/play/brick/${brick.id}/intro`);
    } else {
      props.history.push(`/build/brick/${brick.id}/build/investigation/question`);
    }
  }

  if (!brick.id) {
    return (
      <div className="main-brick-container">
      </div>
    );
  }

  return (
    <Grow
      in={props.shown}
      style={{ transformOrigin: "0 0 0" }}
      timeout={index * 150}
    >
      <div className="main-brick-container">
        <Box className={`brick-container ${color}`}>
          <div
            className={`absolute-container brick-row-${row} ${
              brick.expanded ? "brick-hover" : ""}`}
            onMouseEnter={props.handleMouseHover}
            onMouseLeave={props.handleMouseLeave}
          >
            {brick.expanded ? (
              <ExpandedBrickDecsiption
                userId={props.user.id}
                isAdmin={isAdmin}
                color={color}
                brick={brick}
                move={move}
                onDelete={(brickId) => props.handleDeleteOpen(brickId)}
              />
            ) : (
              <ShortBrickDecsiption color={color} brick={brick} />
            )}
          </div>
        </Box>
      </div>
    </Grow>
  );
}

export default BrickBlockComponent;