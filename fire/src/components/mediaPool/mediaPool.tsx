import styles from "./mediaPool.module.css";
import React, { useState } from 'react';
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

export default function MediaPool(props: any) {
    const [status, setStatus] = useState<string>('');
    const [draggedOn, setDraggedOn] = useState<String>("");

    const listItems = props.mediaList.map((item: Media, index: number) => {
        return (
            <Draggable key={item.file.name} draggableId={item.file.name} index={index}>
                {(provided) => (
                    <li className={`${styles.card}`}
                        key={item.file.name}
                        ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                    >
                        <img className={styles.img} src={item.thumbnail} alt={item.file.name} />
                        <p className={styles.cardCaption}>{item.file.name}</p>
                        <button className={styles.button} onClick={() => props.deleteVideo(item)}>
                            <span className="material-icons">delete</span>
                        </button>
                    </li>
                )}
            </Draggable>
        );
    });

    const onClick = async () => {
        try {
            const files: File[] = [];
            const load = document.getElementById("lo") as HTMLElement;
            //@ts-ignore
            const Handle = await window.showOpenFilePicker(options);
            setStatus('Loading...');
            for (const entry of Handle) {
                let file = await entry.getFile();
                files.push(file);
            }
            await props.addVideo(files);
            setStatus('');
        } catch (error) {
            console.log(error);
        }
    }

    const onDrag = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggedOn("");
        if (!e.dataTransfer) return;
        const files: File[] = [];
        
        for (const item of Object.values(e.dataTransfer.items)) {
            const file = item.getAsFile();

            if(file !== null && (file.type.includes('video/') || file.type.includes('image/'))) files.push(file);
            else alert(`Could not upload file: ${file?.name}. Only upload videos or images.`);
        }
        await props.addVideo(files);
        setStatus('');
    }

    //@ts-ignore
    function handleOnDragEnd(result) {
        if (result.destination) {
            const items = props.mediaList.slice();
            const [reorderedItem] = items.splice(result.source.index, 1);
            items.splice(result.destination.index, 0, reorderedItem);
            props.setMediaList(items);
        }
        else {
            props.dragAndDrop(props.projectDuration, props.mediaList[result.source.index], 0);  // currently only adding to track 0. 
        }
    }

    return (
        <div
            onDragOver={(e) => { e.stopPropagation(); e.preventDefault(); setDraggedOn('draggedOn'); }}
            onDragEnter={(e) => { e.stopPropagation(); e.preventDefault(); setDraggedOn('draggedOn'); }}
            onDragLeave={(e) => { e.stopPropagation(); e.preventDefault(); setDraggedOn(""); }}
            onDrop={onDrag}
            className={`${styles.container} ${draggedOn}`}
        >
            <div className={styles.hbox}>
                <h2 className={styles.title}>Project Files</h2>
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