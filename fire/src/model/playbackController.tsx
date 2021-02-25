import styles from "./mediaPlayer.module.css";
import Editor from "../routes/editor";
import { Media, Segment } from "./types";
import { useState } from "react";

export default function PlaybackController(props: {
    mediaList: Media[],
    setMediaList: (mediaList: Media[]) => void,
    segmentList: Segment[],
    setSegmentList: (segments: Segment[]) => void
}) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [playbackTimeout, setPlaybackTimeout] = useState<number>(0);

    const play = () => {
        if (props.mediaList.length === 0) return;

        setIsPlaying(true);
        clearTimeout(playbackTimeout);
        // setPlaybackTimeout(
        //     setTimeout(() => {
        //         props.renderFrame();
        //     },
        //         1 / this.project.framerate) as unknown as number);

        // this.currentSegment[0].media.element.play();
    }

    const pause = () => {
        setIsPlaying(false);
        clearTimeout(playbackTimeout);

        // for (const media of this.project.media) {
        //     media.element.pause();
        // }
    }

    // private renderFrame(segment: Segment[]) {
    //     //this.renderer.drawMedia(this.project.segments);
    //     this.renderer.drawMedia(segment);
    //     this.timeout = setTimeout(() => { this.renderFrame(segment); }, 1 / this.project.framerate) as unknown as number;
    // }


    // public previewVideo(media: Media){
    //     for(let i=0; i<this.project.segments.length; i++){
    //         if(this.project.segments[i].media === media){
    //             this.currentSegment=[this.project.segments[i]];
    //             break;
    //         }
    //     }
    // }

    return (
        <Editor {...props} />
    );
}
