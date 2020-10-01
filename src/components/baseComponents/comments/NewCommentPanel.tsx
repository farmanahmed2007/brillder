import React from 'react';
import { Grid, Button } from '@material-ui/core';
import './NewCommentPanel.scss';

import { Brick } from 'model/brick';

interface NewCommentPanelProps {
  currentBrick: Brick;
  currentQuestionId?: number;
  createComment(comment: any): void;
}

const NewCommentPanel: React.FC<NewCommentPanelProps> = props => {
  const [text, setText] = React.useState("");

  const handlePostComment = () => {
    props.createComment({
      text,
      brickId: props.currentBrick.id,
      questionId: props.currentQuestionId
    });
    setText("");
  }

  return (
    <Grid container direction="column" alignItems="stretch">
      <Grid item>
        <form className="comment-text-form" onSubmit={e => { e.preventDefault(); }}>
          <textarea
            className="comment-text-entry" placeholder="Add Suggestion..." value={text}
            onChange={(evt) => setText(evt.target.value)}
          />
        </form>
      </Grid>
      <Grid item container direction="row" justify="space-evenly">
        <Button className="comment-action-button post" onClick={() => handlePostComment()} disabled={text === ""}>POST</Button>
        <Button className="comment-action-button cancel" onClick={() => setText("")} disabled={text === ""}>CLEAR</Button>
      </Grid>
    </Grid>
  );
};

export default NewCommentPanel;
