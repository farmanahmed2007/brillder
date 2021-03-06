import React, { useEffect } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import { FormControlLabel, Radio } from "@material-ui/core";

import './ImageDialog.scss';
import SpriteIcon from "components/baseComponents/SpriteIcon";
import BaseDialogWrapper from "components/baseComponents/dialogs/BaseDialogWrapper";
import DropImage from "./DropImage";
import { ImageAlign, ImageComponentData } from "./model";
import Slider from '@material-ui/core/Slider';
import ImageDesktopPreview from "./ImageDesktopPreview";
import { fileUrl } from "components/services/uploadFile";

interface DialogProps {
  open: boolean;
  initFile: File | null;
  initData: ImageComponentData;
  upload(file: File, source: string, caption: string, align: ImageAlign, height: number): void;
  updateData(source: string, caption: string, align: ImageAlign, height: number): void;
  setDialog(open: boolean): void;
}

const ImageDialog: React.FC<DialogProps> = ({ open, initFile, initData, upload, updateData, setDialog }) => {
  const [source, setSource] = React.useState(initData.imageSource || '');
  const [caption, setCaption] = React.useState(initData.imageCaption || '');
  const [permision, setPermision] = React.useState(initData.imagePermision ? true : false);
  const [validationRequired, setValidation] = React.useState(false);
  const [file, setFile] = React.useState(initFile as File | null);
  const [cropedFile, setCroped] = React.useState(file as File | null);
  const [align, setAlign] = React.useState(initData.imageAlign ? initData.imageAlign : ImageAlign.left);
  const [height, setHeight] = React.useState(initData.imageHeight ? initData.imageAlign : 30);
  const [removed, setRemoved] = React.useState(null as boolean | null);

  useEffect(() => {
    if (!file) {
      if (initFile) {
        setFile(initFile);
        setCroped(initFile);
      } else if (initData.value) {
        // get image by url
      }
    }
  }, [initFile, initData.value]);

  useEffect(() => {
    setHeight(initData.imageHeight);
  }, [initData.imageHeight]);

  let canUpload = false;
  if (permision && source && !removed) {
    canUpload = true;
  }

  let className = "add-image-button"
  if (!removed) {
    className += " remove-image"
  }

  const handleClick= () => {
    if (!removed) {
      setFile(null);
      setCroped(null);
      setRemoved(true);
    } else {
      let el = document.createElement("input");
      el.setAttribute("type", "file");
      el.setAttribute("accept", ".jpg, .jpeg, .png");
      el.click();

      el.onchange = (files: any) => {
        if (el.files && el.files.length >= 0) {
          setFile(el.files[0]);
          setCroped(el.files[0]);
          setRemoved(false);
        }
      };
    }
  }

  const marks = [{
      value: 20,
      label: '-',
    },
    {
      value: 50,
      label: '+',
    },
  ];

  return (
    <BaseDialogWrapper open={open} className="image-dialog-container" close={() => setDialog(false)} submit={() => {}}>
      <div className="dialog-header image-dialog">
        <div className={`cropping ${removed ? 'empty' : ''}`}>
          <div className="switch-image">
            <div className={"svgOnHover " + className} onClick={handleClick}>
              <SpriteIcon name="plus" className="svg-plus active text-white" />
            </div>
          </div>
          <div className="centered">
            {removed
              ? <SpriteIcon name="image" className="icon-image" />
              : <DropImage initFileName={initData.value} locked={false} file={file} setFile={setCroped} />
            }
          </div>
        </div>
        <div className="bold">
          Where did you get this image?
          <span className="text-theme-orange">*</span>
        </div>
        <input
          value={source}
          className={validationRequired && !source ? 'invalid' : ''}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Add link to source or name of owner..."
        />
        <div onClick={() => setPermision(!permision)}>
          <Checkbox checked={permision} className={validationRequired ? 'required' : ''} />
          I have permision to distribute this image
          <span className="text-theme-orange">*</span>
        </div>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add caption..."
        />
        <div>Align</div>
        <div>
          <FormControlLabel
            checked={align === ImageAlign.left}
            control={<Radio onClick={() => setAlign(ImageAlign.left)} />}
            label="Left" />
          <FormControlLabel
            checked={align === ImageAlign.center}
            control={<Radio onClick={() => setAlign(ImageAlign.center)} />}
            label="Center" />
        </div>
        <div>Image size</div>
        <Slider
          defaultValue={height}
          aria-labelledby="discrete-slider"
          step={1}
          marks={marks}
          min={20}
          max={50}
          onChange={(e:any, v:any) => setHeight(v)}
        />
        <div className="absolute">
          {!removed &&
            <ImageDesktopPreview src={fileUrl(initData.value)} height={height} align={align} file={cropedFile} />
          }
        </div>
      </div>
      <div className="centered last-button">
        <SpriteIcon name="upload" className={`upload-button ${canUpload ? 'active' : 'disabled'}`} onClick={() => {
          if (cropedFile && canUpload) {
            upload(cropedFile, source, caption, align, height);
          } else if (canUpload) {
            updateData(source, caption, align, height);
          } else {
            setValidation(true);
          }
         }} />
      </div>
    </BaseDialogWrapper>
  );
}

export default ImageDialog;
