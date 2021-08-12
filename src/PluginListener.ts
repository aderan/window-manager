import { Displayer, Event } from "white-web-sdk";
import { TeleBox, TeleBoxState } from "telebox-insider";
import { BoxManager } from "./BoxManager";
import { Events } from "./constants";
import { WindowManager } from "./index";

export class PluginListeners {

    constructor(
        private displayer: Displayer,
        private boxManager: BoxManager,
        private manager: WindowManager) {
    }

    public addListeners() {
        this.displayer.addMagixEventListener(Events.PluginMove, this.pluginMoveListener);
        this.displayer.addMagixEventListener(Events.PluginResize, this.pluginResizeListener);
        this.displayer.addMagixEventListener(Events.PluginFocus, this.pluginFocusListener);
        this.displayer.addMagixEventListener(Events.PluginBlur, this.pluginBlurListener);
        this.displayer.addMagixEventListener(Events.PluginBoxStateChange, this.pluginBoxStateListener);
        this.displayer.addMagixEventListener(Events.PluginSnapshot, this.pluginSnapShotListener);
    }

    public removeListeners() {
        this.displayer.removeMagixEventListener(Events.PluginMove, this.pluginMoveListener);
        this.displayer.removeMagixEventListener(Events.PluginResize, this.pluginResizeListener);
        this.displayer.removeMagixEventListener(Events.PluginFocus, this.pluginFocusListener);
        this.displayer.removeMagixEventListener(Events.PluginBlur, this.pluginBlurListener);
        this.displayer.removeMagixEventListener(Events.PluginBoxStateChange, this.pluginBoxStateListener);
        this.displayer.removeMagixEventListener(Events.PluginSnapshot, this.pluginSnapShotListener)
    }

    private pluginMoveListener = (event: Event) => {
        if (event.authorId !== this.displayer.observerId) {
            this.boxManager.moveBox(event.payload);
        }
    }

    private pluginFocusListener = (event: Event) => {
        if (event.authorId !== this.displayer.observerId) {
            this.boxManager.focusBox(event.payload);
        }
    }
    
    private pluginResizeListener = (event: Event) => {
        if (event.authorId !== this.displayer.observerId) {
            this.boxManager.resizeBox(event.payload);
        }
    }

    private pluginBlurListener =  (event: Event) => {
        if (event.authorId !== this.displayer.observerId) {
            const proxy = this.manager.pluginProxies.get(event.payload.pluginId);
            if (proxy) {
                proxy.pluginEmitter.emit("writableChange", false);
            }
            WindowManager.viewManager.switchViewToFreedom(event.payload.pluginId);
        }
    }

    private pluginBoxStateListener = (event: Event) => {
        if (event.authorId !== this.displayer.observerId) {
            this.boxManager.setBoxState(event.payload.state);
            if (event.payload === TeleBoxState.Minimized) {
                WindowManager.viewManager.switchMainViewToWriter();
            }
        }
    }

    private pluginSnapShotListener = (event: Event) => {
        if (event.authorId !== this.displayer.observerId) {
            const box = this.boxManager.getBox(event.payload.pluginId) as TeleBox;
            if (box) {
                box.setSnapshot(event.payload.rect);
            }
        }
    }
}
