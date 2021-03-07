import { KeyFrame, Segment } from "../model/types";

const lerp = (start: number, end: number, t: number) => {
    return (end - start) * t + start;
}

const inverseLerp = (value: number, start: number, end: number) => {
    if(end === start) return 1;
    return Math.min(Math.max((value - start) / (end - start), 0), 1);
}

export const calculateProperties = (segment: Segment, timestamp: number): KeyFrame => {
    timestamp -= segment.start;

    const PROPERTY_NAMES = ['x', 'y', 'scaleX', 'scaleY', 'trimLeft', 'trimRight', 'trimBottom', 'trimTop'];
    let properties = [];
    for (const property of PROPERTY_NAMES) {
        properties.push(
            {
                //@ts-ignore
                start: segment.keyframes[0][property] ?? 0,
                startTime: 0,
                //@ts-ignore
                end: segment.keyframes[0][property] ?? 0,
                endTime: 0
            }
        )
    }

    for (let i = 0; i < segment.keyframes.length; i++) {
        const frame = segment.keyframes[i];

        for (let j = 0; j < PROPERTY_NAMES.length; j++) {
            //@ts-ignore
            // this.updateProperty(properties[j], frame[PROPERTY_NAMES[j]], frame.start);
            if (frame[PROPERTY_NAMES[j]] !== undefined) {
                properties[j].start = properties[j].end;
                properties[j].startTime = properties[j].endTime;
                //@ts-ignore
                properties[j].end = frame[PROPERTY_NAMES[j]];
                properties[j].endTime = frame.start;
            }

        }
        if (frame.start > timestamp) break;
    }

    let output = {
        start: 0,
    }
    for (let i = 0; i < PROPERTY_NAMES.length; i++) {
        //@ts-ignore
        output[PROPERTY_NAMES[i]] = lerp(properties[i].start, properties[i].end, inverseLerp(timestamp, properties[i].startTime, 
            properties[i].endTime));

    }

    return output;
}