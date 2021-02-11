import styles from "./mediaPool.module.css";
import React, { useState } from 'react';
import model from "../../model/model";
import { Media } from "../../model/types";

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
    const listItems = files.map((item) => {
        return (
            <div className={styles.card} key={item.file.name}>
                <img className={styles.img} src={item.thumbnail} alt={item.file.name} />
                <p className={styles.cardCaption}>{item.file.name}</p>
            </div>
        );
    });

    const onClick = async () => {
        try {
            //@ts-ignore
            const Handle = await window.showOpenFilePicker(options);

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

    return (
        <div className={styles.container}>
            <div className={styles.hbox}>
                <h2 className={styles.title}>Media:</h2>
                <button
                    className={styles.addFiles}
                    onClick={onClick}>
                    <span className="material-icons md-36">add</span>
                </button>
            </div>
            <div className={styles.mediaList}
                onDragOver={(e) => { e.stopPropagation(); e.preventDefault() }}
                onDragEnter={(e) => { e.stopPropagation(); e.preventDefault() }}
                onDrop={onDrag}>

                {listItems}
            </div>
        </div>
    )
}