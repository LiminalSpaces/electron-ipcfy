import { ipcRenderer } from "electron";
import { getCurrentIpcContext } from "electron-ipcfy";
import { rendererConfigs } from "./config";
import { renderer1Service, renderer2Service, TestServiceImpl, conflictService } from "./Services";
import { setupRenderer } from "./utils";

const { readyChannel, patchArgs } = rendererConfigs.renderer1;

export default setupRenderer(readyChannel, {
    smoke: async () => {
        await renderer1Service.__attachImpl(new class extends TestServiceImpl {
            async call(callerChain: string[], n: number, s: string, o: { b: boolean }, ...additional: any[]) {
                // patch some args, then pass message to renderer2
                const { topic } = getCurrentIpcContext();
                var { n, s, o } = patchArgs({ n, s, o });
                await renderer2Service.call(callerChain.concat([topic]), n, s, o);
            }
        });
    },

    attachNullImpl: async () => {
        await renderer1Service.__attachImpl(null);
    },

    attachDuplicateImpl: async () => {
        await renderer1Service.__attachImpl(TestServiceImpl.CALLBACKLESS_INSTANCE);
        await renderer1Service.__attachImpl(TestServiceImpl.CALLBACKLESS_INSTANCE);
    },

    attachConflictImpl: async () => {
        await conflictService.__attachImpl(TestServiceImpl.CALLBACKLESS_INSTANCE);
    }
});
