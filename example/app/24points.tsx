import React, { useEffect, useState } from "react";
import ReactDom from "react-dom";
import type { AppContext, NetlessApp } from "../../dist";
import "./24points.css";

interface GameState {
    round: number;
    nums: number[];
    hostroy: {
        round: number;
        user: string;
        nums: [];
        expr: string;
    }[];
}

interface Node {
    num: number;
    left: Node | undefined;
    right: Node | undefined;
    op: string;
    leaf: boolean | undefined;
}

interface LocalState {
    nodes: Node[];
    left: undefined;
    op: string | undefined;
    right: undefined;
    gameState: GameState | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function canMake24(nums) {
    return true;
}

function genGameNums(): number[] {
    // return [6, 6, 6, 6];
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10) + 1);
}

export const Points: NetlessApp = {
    kind: "24Points",
    setup: context => {
        const storage = context.storage;
        const gameState: GameState = {
            round: 0,
            nums: genGameNums(),
            hostroy: [],
        };
        storage.ensureState({ points: JSON.stringify(gameState) });

        const box = context.getBox();
        ReactDom.render(<PointsApp context={context} />, box.$content);
        context.emitter.on("destroy", () => onDestory(context));
        context.emitter.on("containerRectUpdate", () => {
            console.log("containerRectUpdate");
        });
    },
};

const onDestory = (context: AppContext) => {
    context;
    console.log("[24Points]: destory");
};

const PointsApp = ({ context }: { context: AppContext }) => {
    const [state, setState] = useState<LocalState>({
        nodes: [],
        left: undefined,
        op: undefined,
        right: undefined,
        gameState: undefined,
    });

    const ops = ["+", "-", "*", "/"];

    const handleClickNum = event => {
        const index = event.target.getAttribute("index");
        if (!state.nodes[index]) return;
        if (state.left) {
            if (state.op && state.left != index) {
                merge({
                    left: state.left,
                    op: state.op,
                    right: index,
                });
            } else {
                update({ left: index });
            }
        } else {
            update({ left: index });
        }
        return;
    };

    const merge = p => {
        const nodes = state.nodes;
        const leftNote = nodes[p.left];
        const rightNote = nodes[p.right];

        nodes[p.left] = undefined;
        nodes[p.right] = {
            num: calculateNum(leftNote.num, rightNote.num, p.op),
            left: leftNote,
            right: rightNote,
            op: p.op,
        };
        update({ nodes: nodes, left: undefined, op: undefined, right: undefined });
    };

    const calculateNum = (left, right, op) => {
        switch (op) {
            case "+":
                return left + right;
            case "-":
                return left - right;
            case "*":
                return left * right;
            case "/":
                return left / right;
            default:
                return NaN;
        }
    };

    const handleClickOp = event => {
        const index = event.target.getAttribute("index");
        if (state.left) {
            update({ op: ops[index] });
        }
        return;
    };

    const handleReset = () => {
        const gameState = JSON.parse(context.storage.state["points"]) as GameState;
        const nodes = gameState.nums.map(item => ({ num: item, leaf: true } as Node));
        update({
            nodes: nodes,
            left: undefined,
            op: undefined,
            right: undefined,
            gameState: gameState,
        });
    };

    const handleClear = () => {
        update({ left: undefined, op: undefined, right: undefined });
    };

    const handlePass = () => {
        nextRound();
    };

    useEffect(() => {
        console.log("[24Points]: game state:", context.storage.state);
        const gameState = JSON.parse(context.storage.state["points"]) as GameState;
        if (gameState.round != state.gameState?.round) {
            handleReset();
        }
        return context.storage.addStateChangedListener(_ => {
            console.log("[24Points]: game state update:", context.storage.state);
            handleReset();
        });
    }, []);

    useEffect(() => {
        const count = state.nodes.filter(item => item !== undefined).length;
        const node = state.nodes.find(item => item?.num == 24);
        if (count == 1 && node) {
            console.log("[24Points] 24 fit :", genExpr(node));
            nextRound(node);
        }
    });

    const genExpr = node => {
        if (node.leaf) {
            return node.num;
        } else {
            return `(${genExpr(node.left)} ${node.op} ${genExpr(node.right)})`;
        }
    };

    const nextRound = (node = undefined) => {
        const gameState = JSON.parse(context.storage.state["points"]) as GameState;
        gameState.round += 1;
        gameState.hostroy.push(
            node
                ? {
                      user: getUser(),
                      round: state.gameState.round,
                      nums: state.gameState.nums,
                      expr: genExpr(node),
                  }
                : undefined
        );
        gameState.nums = genGameNums();
        context.storage.setState({ points: JSON.stringify(gameState) });
    };

    function getUser(): string {
        const room = context.getRoom();
        const memeber = room.state.roomMembers.find(item => item.memberId === room.observerId);
        return memeber.payload?.nickName || memeber.payload?.userId || memeber.memberId;
    }

    const update = (stateUpdate: Partial<LocalState>) => {
        setState(prevState => ({
            ...prevState,
            ...stateUpdate,
        }));
        console.log("current state:", JSON.stringify(state));
    };

    return (
        <div className="points">
            <div className="points-main-layout">
                <div className="context-layout">
                    <div className="num-layout">
                        {state.nodes.map((item, index) => (
                            <div
                                key={index}
                                className="num-item"
                                loading={
                                    Number(state.left) == index || Number(state.right) == index
                                        ? "true"
                                        : "false"
                                }
                                index={index}
                                onClick={handleClickNum}
                            >
                                {item ? item.num : "-"}
                            </div>
                        ))}
                    </div>

                    <div className="op-layout">
                        {ops.map((item, index) => (
                            <div
                                key={index}
                                className="op-item"
                                loading={state.op == item ? "true" : "false"}
                                index={index}
                                onClick={handleClickOp}
                            >
                                {item}
                            </div>
                        ))}
                        <div className="op-item" onClick={handleReset}>
                            Reset
                        </div>
                    </div>
                </div>

                <div className="function-layout">
                    <div className="pass-layout" onClick={handlePass}>
                        Pass
                    </div>

                    <div className="clear-layout" onClick={handleClear}>
                        Clear
                    </div>
                </div>
            </div>

            <div className="history-layout">
                {state.gameState?.hostroy.map(
                    (item, index) =>
                        item && (
                            <div key={index} className="history-item">
                                <div className="history-item-round">{`Round: ${item?.round}`}</div>
                                <div className="wspace_2"></div>
                                <div className="history-item-user">{`User: ${item?.user}`}</div>
                                <div className="wspace_2"></div>
                                <div className="history-item-nums">
                                    {`Nums: ${item?.nums.join(",")}`}
                                </div>
                                <div className="wspace_2"></div>
                                <div className="history-item-expr">{`Expr: ${item?.expr}`}</div>
                            </div>
                        )
                )}
            </div>
        </div>
    );
};
