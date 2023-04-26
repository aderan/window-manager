import type { AppContext, NetlessApp } from "../../dist";
import React from "react";
import { useEffect, useState } from "react";
import ReactDom from "react-dom";
import "./goboard.css";

export const GoBoard: NetlessApp = {
    kind: "GoBoard",
    setup: context => {
        const box = context.getBox();
        // context.mountView(box.$content);
        ReactDom.render(<GoboardApp context={context} />, box.$content);
        context.emitter.on("destroy", () => onDestory(context));
        context.emitter.on("containerRectUpdate", () => {
            console.log("containerRectUpdate");
        });
    },
};

const onDestory = (context: AppContext) => {
    context;
    console.log("[GoBoard]: destory");
};

const GoboardApp = ({ context }: { context: AppContext }) => {
    const [state, setState] = useState({ player: 1, index: 2 });

    const inc = () =>
        context.storage.setState({
            player: state.player + 1,
        });

    const dec = () =>
        context.storage.setState({
            player: state.player - 1,
        });

    useEffect(() => {
        console.log("[GoBoard]: useEffect", context.storage.state);
        setState(context.storage.state);
        return context.storage.addStateChangedListener(diff => {
            console.log(diff);
            console.log(context.storage.state);
            update(context.storage.state);
        });
    }, []);

    const update = state => {
        setState({
            ...state,
        });
        console.log("call set state", state);
    };

    return (
        <div className="goboard-app">
            <button className="goboard-item" onClick={inc}>
                添加
            </button>
            <button className="goboard-item" onClick={dec}>
                减少
            </button>
            {state.player} / {state.index}
            <button className="goboard-item" onClick={inc}>
                添加
            </button>
            <button className="goboard-item" onClick={dec}>
                减少
            </button>
        </div>
    );
};
