import styles from "./mediaPool.module.css";
import React, { useState } from 'react';
import model from "../../model/model";
import { Media } from "../../model/types";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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

export default function MediaPool() {
    const [files, setFiles] = useState<Media[]>([]);
    const [status, setStatus] = useState<string>('');

    const listItems = files.map((item, index) => {
        return (
            <Draggable key={item.file.name} draggableId={item.file.name} index={index}>
                {(provided) => (
                    <li className={styles.card} key={item.file.name} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <img className={styles.img} src={item.thumbnail} alt={item.file.name} />
                        <p className={styles.cardCaption}>{item.file.name}</p>
                        <button className={styles.button} onClick={() => deleteVideo(item)}>
                            <span className="material-icons">close</span>
                        </button>
                    </li>
                )}
            </Draggable>
        );
    });

    const deleteVideo = (media: Media) => {
        model.deleteVideo(media);
        setFiles([...model.project.media]);
    }

    const onClick = async () => {
        try {
            const load = document.getElementById("lo") as HTMLElement;
            //@ts-ignore
            const Handle = await window.showOpenFilePicker(options);
            setStatus('Loading...');
            for (const entry of Handle) {
                let file = await entry.getFile();

                let found = false;
                for (let i = 0; i < model.project.media.length; i++) {
                    if (model.project.media[i].file.name === file.name) {
                        found = true;
                        break;
                    }
                }

                if (found) continue;

                await model.addVideo(file);
                setFiles([...model.project.media]);
            }
            setStatus('');
        } catch (error) {
            console.log(error);
        }
    }

    const onDrag = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!e.dataTransfer) return;

        for (const item of Object.values(e.dataTransfer.items)) {
            if (item.kind === 'file' && (item.type.includes('video'))) {
                //@ts-ignore
                const entry = await item.getAsFileSystemHandle();
                await model.addVideo(await entry.getFile());
                setFiles([...model.project.media]);
            }
        }
    }

    //@ts-ignore
    function handleOnDragEnd(result) {
        if (!result.destination) return;

        const items = Array.from(files);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setFiles(items);
    }

    return (
        <div className={styles.container}
            onDragOver={(e) => { e.stopPropagation(); e.preventDefault() }}
            onDragEnter={(e) => { e.stopPropagation(); e.preventDefault() }}
            onDrop={onDrag}>
            <div className={styles.hbox}>
                <h2 className={styles.title}>Media:</h2>
                <button
                    className={styles.addFiles}
                    onClick={onClick}>
                    <span className="material-icons md-36">add</span>
                </button>
            </div>
            <div className={styles.mediaList}>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="card">
                        {
                            (provided) => (
                                <ul className="card" {...provided.droppableProps} ref={provided.innerRef}>
                                    {listItems}
                                    {provided.placeholder}
                                </ul>
                            )
                        }
                    </Droppable>
                </DragDropContext>
            </div>


            <p className={styles.loader}>{status}</p>
        </div>
    )
}