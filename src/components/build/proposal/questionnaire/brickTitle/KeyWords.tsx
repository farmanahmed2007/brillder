import React, { Component } from "react";

import './KeyWords.scss';
import { enterPressed, spaceKeyPressed } from "components/services/key";
import SpriteIcon from "components/baseComponents/SpriteIcon";
import { KeyWord } from "model/brick";

interface KeyWordsProps {
  disabled: boolean;
  keyWords: KeyWord[];
  onChange(keyWords: KeyWord[]): void;
}

interface KeyWordsState {
  keyWords: KeyWord[];
  keyWord: string;
}

class KeyWordsComponent extends Component<KeyWordsProps, KeyWordsState> {
  constructor(props: any) {
    super(props);

    let keyWords = [];
    if (props.keyWords) {
      keyWords = props.keyWords;
    }

    this.state = {
      keyWords,
      keyWord: ''
    }
  }

  addKeyWord() {
    if (!this.props.disabled) {
      const {keyWords} = this.state;
      keyWords.push({ name: this.state.keyWord });
      this.setState({ keyWord: '', keyWords });
      this.props.onChange(keyWords);
    }
  }

  checkKeyword(e: React.KeyboardEvent<HTMLInputElement>) {
    let pressed = enterPressed(e) || spaceKeyPressed(e);
    if (pressed) {
      this.addKeyWord();
    }
  }

  removeKeyWord(i: number) {
    if (i > -1 && !this.props.disabled) {
      const { keyWords } = this.state;
      keyWords.splice(i, 1);
      this.setState({ keyWords });
      this.props.onChange(keyWords);
    }
  }

  renderKeyWord(k: KeyWord, i: number) {
    return (
      <div key={i} className='key-word'>
        {k.name}
        <SpriteIcon name="cancel-custom" onClick={() => this.removeKeyWord(i)} />
      </div>
    )
  }

  render() {
    return (
      <div className="key-words">
        {this.state.keyWords.map(this.renderKeyWord.bind(this))}
        <input disabled={this.props.disabled} value={this.state.keyWord} placeholder="Enter Key Word..." onKeyDown={this.checkKeyword.bind(this)} onChange={e => this.setState({ keyWord: e.target.value })} />
      </div>
    );
  }
}

export default KeyWordsComponent;