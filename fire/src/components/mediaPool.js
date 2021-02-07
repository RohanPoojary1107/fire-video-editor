import React, { useState } from 'react';

function MediaPool() {
    const [files, getFiles] = useState([]);
    const listItems = files.map((item) =>
    <div key={item}>
        {item}
    </div>
  );

  const handleChange = file_list => getFiles(files.concat(file_list));
    return(
        <div>
            <Button value='click here to select files' onChange={handleChange}/>
            {listItems}
        </div>
    )
}
const onClick = async (onChange) => {
    const Handle = await window.showOpenFilePicker({multiple: true});
    let file_list = [];
    for await (const entry of Handle.values()){
        file_list.push(entry.name);
    }
    onChange(file_list);
}

const onDrag = async (e, onChange) => {
    e.preventDefault();
    let file_list = [];
    for (const item of e.dataTransfer.items) {
        if (item.kind === 'file') {
            const entry = await item.getAsFileSystemHandle();
            console.log(entry.name);
            file_list.push(entry.name);
        }
    }
    onChange(file_list);
}

const Button = (props) => {  
    return(
        <button 
        onClick={() => onClick(props.onChange)} 
        onDragOver={(e) => {e.preventDefault()}} 
        onDrop={(e) => onDrag(e, props.onChange)}> 
        {props.value}
        </button>
        );
    }

export default MediaPool;
