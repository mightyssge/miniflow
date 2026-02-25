import { HttpRequestParametersForm } from "./HttpRequestParametersForm";
import { HttpResponseMappingForm } from "./HttpResponseMappingForm";

interface Props {
    config: Record<string, any>;
    isReadOnly: boolean;
    patchConfig: (key: string, value: string | number) => void;
    patchMap: (key: string, value: string) => void;
}

export function HttpRequestForm({ config, isReadOnly, patchConfig, patchMap }: Props) {
    return (
        <>
            <HttpRequestParametersForm
                config={config}
                isReadOnly={isReadOnly}
                patchConfig={patchConfig}
            />

            <HttpResponseMappingForm
                configMap={config.map}
                isReadOnly={isReadOnly}
                patchMap={patchMap}
            />
        </>
    );
}