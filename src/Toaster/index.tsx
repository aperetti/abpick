import { Position, Toaster } from "@blueprintjs/core";
 
/** Singleton toaster instance. Create separate instances for different options. */
const AppToaster = Toaster.create({
    position: Position.TOP,
});

export default AppToaster