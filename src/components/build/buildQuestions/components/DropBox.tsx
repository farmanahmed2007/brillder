import React from 'react'
import { ReactSortable } from 'react-sortablejs';


export interface DropBoxProps {
  locked: boolean;
  onDrop(type: number): void;
}

const DropBox: React.FC<DropBoxProps> = ({ locked, onDrop }) => {
  const [components] = React.useState([]);

  return (
    <div style={{ position: 'relative' }}>
      <div className="dropzone" style={{ minHeight: '15vh' }}>Drag Component Here</div>
      <ReactSortable
        list={components}
        style={{ height: '100%', width: '100%', position: 'absolute', top: 0 }}
        group={{ name: "cloning-group-name", pull: "clone" }}
        onAdd={() => { }}
        setList={(comp: any[], d) => {
          if (locked) { return; }
          if (comp.length > 0) {
            onDrop(comp[0].type);
          }
        }} sort={false}>
      </ReactSortable>
    </div>
  );
}

export default DropBox