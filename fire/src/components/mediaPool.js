import React, { useState } from 'react';

function MediaPool() {
    const [files, getFiles] = useState([]);
    const listItems = files.map((item) =>{
        if(item[0].type.includes('video')){
            return (
                <div class="video">
                <video width="100" src={URL.createObjectURL(item[0])}></video>
                <small>{item[1].name}</small>
                </div>
                );
        }
        else if(item[0].type.includes('image')){
            return (
                <div class="image">
                <img width="100" src={URL.createObjectURL(item[0])}/>
                <small>{item[1].name}</small>
                </div>
                );
        }
    
  });

    const handleChange = file_list => getFiles(files.concat(file_list));
    return(
        <div class="MediaPool">
            <h2>Project Files</h2>
            {listItems}
            <Button value='click here to select files' onChange={handleChange}/>
        </div>
    )
}

const options = {
    types: [
      {
        accept: {
          'videos/*': ['.mp4', '.mov', '.wmv', '.avi', '.flv'],
          'images/*': ['.jpg', '.png', '.gif', '.jpeg']
        }
      },
    ],
    multiple: true,
    excludeAcceptAllOption: true
  };

const onClick = async (onChange) => {
    const Handle = await window.showOpenFilePicker(options);
    let file_list = [];
    for await (const entry of Handle.values()){
        let file = await entry.getFile();
        file_list.push([file,entry]);
    }
    onChange(file_list);
}

const onDrag = async (e, onChange) => {
    e.preventDefault();
    e.stopPropagation();
    let file_list = [];
    for (const item of e.dataTransfer.items) {
        if (item.kind === 'file' && (item.type.includes('video') || item.type.includes('image'))) {
            const entry = await item.getAsFileSystemHandle();
            let file = await entry.getFile();
            file_list.push([file,entry]);
        }
    }
    onChange(file_list);
}

const Button = (props) => {  
    return(
        <button 
        onClick={() => onClick(props.onChange)} 
        onDragOver={(e) => {e.stopPropagation(); e.preventDefault()}} 
        onDragEnter={(e) => {e.stopPropagation(); e.preventDefault()}} 
        onDrop={(e) => onDrag(e, props.onChange)}> 
        {props.value}
        </button>
        );
    }

export default MediaPool;