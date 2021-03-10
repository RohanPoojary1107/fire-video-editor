import MediaManager from "./mediaManager";
import { useEffect, useRef, useState } from "react";

export default function ProjectManager() {
    const [projectId, setProjectId] = useState<string[]>([]);
    
    return (
        <MediaManager />
    );
}
