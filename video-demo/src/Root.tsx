import { Composition } from 'remotion';
import { MiniFlowDemo } from './MiniFlowDemo';

export const Root: React.FC = () => {
    return (
        <>
            <Composition
                id="MiniFlowDemo"
                component={MiniFlowDemo}
                durationInFrames={900}
                fps={30}
                width={1280}
                height={720}
            />
        </>
    );
};
