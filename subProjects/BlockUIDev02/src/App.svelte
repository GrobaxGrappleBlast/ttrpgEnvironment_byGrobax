<script context="module" lang="ts">
    export const ANIMATION_DELAY = 220;
    export const ANIMATION_TIME = 100;

    class DragHandlerController {
        public data: Writable<SheetData>;
        public state: State;
        public layerActive: Writable<boolean>;
        public constructor(data: Writable<SheetData>, state: State) {
            this.data = data;
            this.state = state;
            this.layerActive = state.editLayout_01;
        }

        public isDragging = false;
        public pauseDragg = false;
        public dragID: string;
        public targetID: string;

        public moveRow() {
            if (!this.isDragging) {
                return;
            }

            if (
                !this.dragID ||
                !this.targetID ||
                this.targetID == this.dragID
            ) {
                return;
            }

            this.data.update((list) => {
                let a = this.findIndexOfID(this.dragID);
                let b = this.findIndexOfID(this.targetID);

                const temp = list.data[a];
                this.pauseDragg = true;
                setTimeout(() => {
                    this.pauseDragg = false;
                }, ANIMATION_DELAY);
                list.data[a] = list.data[b];
                list.data[b] = temp;

                return list;
            });
        }

        onDragStart(e, id) {
            if (!get(this.layerActive)) {
                //
                return;
            }

            const target = e.target;
            if (!target.classList.contains("Row")) {
                return;
            }

            this.isDragging = true;
            this.dragID = id;
            target.setAttribute("data-dragging", "true");
        }
        onDragOver(e, id) {
            if (!get(this.layerActive)) {
                //
                return;
            }

            if (!this.isDragging || this.pauseDragg) {
                return;
            }
            this.targetID = id;
            this.moveRow();
        }
        onDragEnd(e, id) {
            if (!get(this.layerActive)) {
                //
                return;
            }

            this.isDragging = false;
            this.dragID = null;
            this.targetID = null;
            const target = e.target;
            target.setAttribute("data-dragging", "false");
        }

        findIndexOfID(id) {
            return get(this.data).data.findIndex((p) => p.id == id);
        }
    }

    class DragItemHandlerController2 {
        public data: Writable<SheetData>;
        public state: State;
        public layerActive: Writable<boolean>;
        public constructor(data: Writable<SheetData>, state: State) {
            this.data = data;
            this.state = state;
            this.layerActive = state.editLayout_02;
        }

        public isDragging = false;
        public pauseDragg = false;
        public dragTargetElement: HTMLElement;

        public dragID: string;
        public targetID: string;

        public lastDragId: string;
        public lasttargId: string;

        public innerMoveItem(list, fromId, toID) {
            let row_a;
            let a;
            let row_b;
            let b;
            [row_a, a] = this.findRowIndexOfID(fromId);
            [row_b, b] = this.findRowIndexOfID(toID);

            if (row_a == -1 || row_b == -1) {
                return;
            }
            const oa = list.data[row_a].data[a];
            const ob = list.data[row_b].data[b];
            list.data[row_a].data[a] = ob;
            list.data[row_b].data[b] = oa;
        }
        public moveRowItem() {
            if (!this.isDragging) {
                return;
            }

            if (!this.dragID || this.targetID == this.dragID) {
                return;
            }

            this.data.update((list) => {
                // in case we try to place it back into the original space
                if (
                    this.dragID == this.lastDragId &&
                    this.targetID == this.lasttargId
                ) {
                    this.innerMoveItem(list, this.lasttargId, this.lastDragId);
                    return list;
                }

                // move last items back
                if (this.lastDragId && this.lasttargId) {
                    this.innerMoveItem(list, this.lastDragId, this.lasttargId);
                }
                // move next item set forward
                if (this.targetID) {
                    this.innerMoveItem(list, this.dragID, this.targetID);
                }

                this.lastDragId = this.dragID;
                this.lasttargId = this.targetID;
                this.pauseDragg = true;
                setTimeout(() => {
                    this.pauseDragg = false;
                }, ANIMATION_DELAY);
                return list;
            });
        }

        onDragStart(e, id) {
            if (!get(this.layerActive)) {
                return;
            }

            const target = e.target;
            if (!target.classList.contains("Column")) {
                return;
            }
            this.dragTargetElement = target;
            this.isDragging = true;
            this.dragID = id;
            this.lastDragId = null;
            this.lasttargId = null;
            target.setAttribute("data-dragging", "true");
        }
        onDragOver(e, id) {
            if (!get(this.layerActive)) {
                return;
            }

            if (!this.isDragging || this.pauseDragg) {
                return;
            }
            this.targetID = id;
            this.moveRowItem();
            this.dragTargetElement?.setAttribute("data-dragging", "true");
        }
        onDragEnd(e, id) {
            if (!get(this.layerActive)) {
                return;
            }

            this.isDragging = false;
            this.dragID = null;
            this.targetID = null;

            e.target.setAttribute("data-dragging", "false");
            this.dragTargetElement?.setAttribute("data-dragging", "false");
        }
        onLeave(e, id) {
            this.targetID = null;
        }

        findRowIndexOfID(id) {
            let itemId = -1;
            let rowId = get(this.data).data.findIndex((p) => {
                let i = p.data.findIndex((j) => j.id == id);
                if (i != -1) {
                    itemId = i;
                    return true;
                }
                return false;
            });
            return [rowId, itemId];
        }

        isBeingDragged(id) {
            return this.dragID == id;
        }
    }

    class DragItemHandlerController3 {
        public data: Writable<SheetData>;
        public state: State;
        public layerActive: Writable<boolean>;
        public constructor(data: Writable<SheetData>, state: State) {
            this.data = data;
            this.state = state;
            this.layerActive = state.editLayout_03;
        }

        public isDragging = false;
        public pauseDragg = false;
        public dragTargetElement: HTMLElement;

        public dragID: string;
        public targetID: string;
        public targetRowId: string;

        public lastDragId: string;
        public lasttargId: string;
        public lasttargRowId: string;

        public innerSwitchItem(list, fromId, toID) {
            let row_a;
            let col_a;
            let a;
            let row_b;
            let col_b;
            let b;
            [row_a, col_a, a] = this.findIndexsOfID(fromId);
            [row_b, col_b, b] = this.findIndexsOfID(toID);

            if (
                row_a == -1 ||
                row_b == -1 ||
                col_a == -1 ||
                col_b == -1 ||
                a == -1 ||
                b == -1
            ) {
                return;
            }
            const oa = list.data[row_a].data[col_a].data[a];
            const ob = list.data[row_b].data[col_b].data[b];
            list.data[row_a].data[col_a].data[a] = ob;
            list.data[row_b].data[col_b].data[b] = oa;
        }
        public innerMoveItem(list, fromId, toID) {
            let row_a;
            let col_a;
            let a;
            let row_b;
            let col_b;
            [row_a, col_a, a] = this.findIndexsOfID(fromId);
            [row_b, col_b] = this.findColumnIndexsOfID(toID);

            if (
                row_a == -1 ||
                row_b == -1 ||
                col_a == -1 ||
                col_b == -1 ||
                a == -1
            ) {
                return;
            }
            if (row_a == row_b && col_a == col_b) {
                return;
            }

            // get item from original column. AND REMOVE
            let item = list.data[row_a].data[col_a].data.splice(a, 1)[0];

            // add to new Column
            list.data[row_b].data[col_b].data.push(item);
        }
        public moveRowItem() {
            if (!this.isDragging) {
                return;
            }

            if (!this.dragID || this.targetID == this.dragID) {
                return;
            }

            // add item to another Column
            if (this.targetRowId) {
                this.data.update((list) => {
                    // move next item set forward
                    if (this.targetRowId) {
                        this.innerMoveItem(list, this.dragID, this.targetRowId);
                    }

                    this.lastDragId = this.dragID;
                    this.lasttargId = this.targetID;
                    this.lasttargRowId = null;

                    this.pauseDragg = true;
                    setTimeout(() => {
                        this.pauseDragg = false;
                    }, ANIMATION_DELAY);

                    return list;
                });
            }
        }

        public requestMoveItemUpDown(direction, id) {
            this.data.update((list) => {
                let row;
                let col;
                let a;
                [row, col, a] = this.findIndexsOfID(id);

                let newID = a + direction;
                if (newID < 0) {
                    return;
                }

                // out of Bounds
                if (list.data[row].data[col].data.length - 1 < newID) {
                    console.error("Out of Bounds move, so did not attempt");
                    return list;
                }

                const item = list.data[row].data[col].data.splice(a, 1)[0];
                list.data[row].data[col].data.splice(newID, 0, item);

                this.pauseDragg = true;
                setTimeout(() => {
                    this.pauseDragg = false;
                }, ANIMATION_DELAY);
                return list;
            });
        }

        onDragStart(e, id) {
            if (!get(this.layerActive)) {
                return;
            }

            const target = e.target;
            if (!target.classList.contains("Item")) {
                return;
            }
            this.dragTargetElement = target;
            this.isDragging = true;
            this.dragID = id;
            this.lastDragId = null;
            this.lasttargId = null;
            target.setAttribute("data-dragging", "true");
        }

        onDragOverColumn(e, id) {
            if (!get(this.layerActive)) {
                return;
            }

            if (!this.isDragging || this.pauseDragg) {
                return;
            }
            this.targetID = null;
            this.targetRowId = id;
            this.moveRowItem();
            this.dragTargetElement?.setAttribute("data-dragging", "true");
        }
        onDragEnd(e, id) {
            if (!get(this.layerActive)) {
                return;
            }

            this.isDragging = false;
            this.dragID = null;
            this.targetID = null;
            e.target.setAttribute("data-dragging", "false");
            this.dragTargetElement?.setAttribute("data-dragging", "false");
        }
        onLeave(e, id) {
            this.targetID = null;
        }

        findIndexsOfID(id) {
            let itemId = -1;
            let columnId = -1;
            let rowId = -1;

            let obj = get(this.data);

            rowId = obj.data.findIndex((p) => {
                let resb = p.data.findIndex((q) => {
                    let resc = q.data.findIndex((j) => j.id == id);
                    if (resc != -1) {
                        itemId = resc;
                        return true;
                    }
                    return false;
                });
                if (resb != -1) {
                    columnId = resb;
                    return true;
                }
                return false;
            });

            return [rowId, columnId, itemId];
        }
        findColumnIndexsOfID(id) {
            let columnId = -1;
            let rowId = -1;

            let obj = get(this.data);

            rowId = obj.data.findIndex((p) => {
                let resb = p.data.findIndex((q) => q.id == id);
                if (resb != -1) {
                    columnId = resb;
                    return true;
                }
                return false;
            });
            return [rowId, columnId];
        }

        isBeingDragged(id) {
            return this.dragID == id;
        }
    }

    class State {
        editMode: Writable<boolean> = writable(false);
        editLayout_01: Writable<boolean> = writable(false);
        editLayout_02: Writable<boolean> = writable(false);
        editLayout_03: Writable<boolean> = writable(false);

        constructor() {
            this.editMode.subscribe((p) => {
                if (p) {
                    this.editLayout_01.set(false);
                    this.editLayout_02.set(false);
                    this.editLayout_03.set(false);
                }
            });
            this.editLayout_01.subscribe((p) => {
                if (p) {
                    this.editLayout_02.set(false);
                    this.editLayout_03.set(false);
                    this.editMode.set(false);
                }
            });
            this.editLayout_02.subscribe((p) => {
                if (p) {
                    this.editLayout_01.set(false);
                    this.editLayout_03.set(false);
                    this.editMode.set(false);
                }
            });
            this.editLayout_03.subscribe((p) => {
                if (p) {
                    this.editLayout_01.set(false);
                    this.editLayout_02.set(false);
                    this.editMode.set(false);
                }
            });
        }
    }
</script>

<script lang="ts">
    import "./app.scss"; 
    import { onMount } from "svelte";
    import {  SheetData } from "./Structure/ComponentNode";

    import { get, type Writable, writable } from "svelte/store";
    import { fade, fly } from "svelte/transition"; 
    import ItemDestributor from "./Structure/ItemDestributor.svelte";
    import { system } from "../declaration";
    import { customFlip } from "./Svelte/CustomFlip";
    import RowColumnOptions from "./Structure/RowColumnOptions.svelte";//;"./Structure/RowColumnOptions.svelte";

    let state: State = new State();
    let editMode: Writable<boolean> = state.editMode;
    let editLayout_01: Writable<boolean> = state.editLayout_01;
    let editLayout_02: Writable<boolean> = state.editLayout_02;
    let editLayout_03: Writable<boolean> = state.editLayout_03;

    export let textData: string;
    export let sys: system; 

    let json = JSON.parse(textData);
    let DATA = new SheetData(json); 
    let OBJ: Writable<SheetData> = writable(DATA);
 

    function repeat(x, str, sep = " ") {
        let _ = str;
        for (let i = 0; i < x - 1; i++) {
            _ += sep;
            _ += str;
        }
        return _;
    }

    function itemRequestMove(direction, id) {
        DragItemHandler.requestMoveItemUpDown(direction, id);
    }
    onMount(() => {
        //debugger;
    })

    let DragRowHandler = new DragHandlerController(OBJ, state);
    let DragColumnHandler = new DragItemHandlerController2(OBJ, state);
    let DragItemHandler = new DragItemHandlerController3(OBJ, state);

</script>

<div class="theme-light obsidianBody">
    <div class="Sheet">
        <div class="SheetEditorMenuContainer">
            <div
                class="SheetEditorMenu"
                data-isOpen={$editMode ||
                    $editLayout_01 ||
                    $editLayout_02 ||
                    $editLayout_03}
            >
                <button
                    data-active={$editMode}
                    on:click={() => editMode.set(!$editMode)}
                    >{"Stop Edit	"}</button
                >
                <button
                    data-active={$editLayout_01}
                    on:click={() => editLayout_01.set(!get(editLayout_01))}
                    >{"Layout Row	"}</button
                >
                <button
                    data-active={$editLayout_02}
                    on:click={() => editLayout_02.set(!get(editLayout_02))}
                    >{"Layout Col	"}</button
                >
                <button
                    data-active={$editLayout_03}
                    on:click={() => editLayout_03.set(!get(editLayout_03))}
                    >{"Layout Items"}</button
                >
            </div>
        </div>

        {#each $OBJ.data as row, i (row.id)}
            <div
                class="Row"
                data-edit={$editLayout_01}
                data-edit-active={$editLayout_01}
                data-editpreview={$editLayout_02}
                role="none"
                style={`grid-template-columns:${repeat(row.data.length, "1fr")}`}
                data-rowId={row.id}
                on:dragstart={(e) => DragRowHandler.onDragStart(e, row.id)}
                on:dragenter={(e) => DragRowHandler.onDragOver(e, row.id)}
                on:dragend={(e) => DragRowHandler.onDragEnd(e, row.id)}
                on:dragover={(e) => {
                    DragRowHandler.onDragOver(e, row.id);
                    e.preventDefault();
                }}
                transition:fly={{ duration: ANIMATION_TIME, y: 100 }}
                animate:customFlip={{ duration: ANIMATION_TIME }}
                draggable={$editLayout_01}
            >
                <!-- LINE LEVEL EDITOR -->
                <RowColumnOptions
                    active={$editLayout_02}
                    onAdd={() => {
                        row.addColumn();
                        OBJ.update((obj) => {
                            return obj;
                        });
                    }}
                    addText={`add Column`}
                />
                <RowColumnOptions
                    active={$editLayout_01}
                    onRemove={() => {
                        OBJ.update((o) => {
                            o.remRow(row.id);
                            return o;
                        });
                    }}
                    remText={`remove this line`}
                />

                {#each row.data as column, j (column.id)}
                    <div
                        class="Column"
                        data-edit={$editLayout_02 || $editLayout_01}
                        data-editpreview={$editLayout_03}
                        data-itemId={column.id}
                        data-edit-active={$editLayout_02}
                        data-dragging={DragColumnHandler.isBeingDragged(
                            column.id,
                        )}
                        role="none"
                        style={`
						${$editLayout_02 || $editLayout_01 ? "margin-bottom:60px" : ""}
					`}
                        transition:fade={{ duration: ANIMATION_TIME }}
                        animate:customFlip={{ duration: ANIMATION_TIME }}
                        on:dragstart={(e) => {
                            DragColumnHandler.onDragStart(e, column.id);
                        }}
                        on:dragenter={(e) => {
                            DragColumnHandler.onDragOver(e, column.id);
                            DragItemHandler.onDragOverColumn(e, column.id);
                        }}
                        on:dragend={(e) => {
                            DragColumnHandler.onDragEnd(e, column.id);
                        }}
                        on:drop={(e) => {
                            DragColumnHandler.onDragEnd(e, column.id);
                        }}
                        on:dragleave={(e) => {
                            DragColumnHandler.onLeave(e, column.id);
                        }}
                        on:dragover={(e) => {
                            DragColumnHandler.onDragOver(e, column.id);
                            DragItemHandler.onDragOverColumn(e, column.id);
                            e.preventDefault();
                        }}
                        draggable={$editLayout_02}
                    >
                        <!-- EDIT FOR COLUMN LEVEL -->
                        {#if row.data.length > 1}
                            <RowColumnOptions
                                offset={15}
                                active={$editLayout_02}
                                remText={"remove this column"}
                                onRemove={() => {
                                    row.remColumn(column.id);
                                    OBJ.update((o) => o);
                                }}
                            />
                        {/if}
                        <RowColumnOptions
                            offset={15}
                            active={$editLayout_03}
                            addText={"add a new Item"}
                            onAdd={() => {
                                column.addItem();
                                OBJ.update((o) => o);
                            }}
                        />
                        {#if $editLayout_03 || $editLayout_02}
                            <div style="height:50px"></div>
                        {/if}

                        {#each column.data as item, k (item.id)}
                            <div
                                class="Item"
                                data-edit={$editMode ||
                                    $editLayout_03 ||
                                    $editLayout_02}
                                data-itemId={item.id}
                                data-edit-active={$editLayout_03}
                                data-dragging={DragItemHandler.isBeingDragged(
                                    item.id,
                                )}
                                role="none"
                                transition:fade={{ duration: ANIMATION_TIME }}
                                animate:customFlip={{
                                    duration: ANIMATION_TIME,
                                }}
                                on:dragstart={(e) => {
                                    DragItemHandler.onDragStart(e, item.id);
                                }}
                                on:dragend={(e) => {
                                    DragItemHandler.onDragEnd(e, item.id);
                                }}
                                on:drop={(e) => {
                                    DragItemHandler.onDragEnd(e, item.id);
                                }}
                                on:dragleave={(e) => {
                                    DragItemHandler.onLeave(e, item.id);
                                }}
                                on:dragover={(e) => {
                                    e.preventDefault();
                                }}
                                draggable={$editLayout_03}
                            >
                                <RowColumnOptions
                                    offset={15}
                                    active={$editLayout_03}
                                    addText={"remove"}
                                    onRemove={() => {
                                        column.remItem(item.id);
                                        OBJ.update((o) => o);
                                    }}
                                />
                                <ItemDestributor
                                    data={item}
                                    editMode={$editMode}
                                    layoutMode={$editLayout_03}
                                    {sys}
                                    length={column.data.length}
                                    index={k}
                                    on:moveUp={(e) => {
                                        itemRequestMove(-1, e.detail);
                                    }}
                                    on:moveDown={(e) => {
                                        itemRequestMove(1, e.detail);
                                    }}
                                />
                            </div>
                        {/each}
                    </div>
                {/each}
            </div>
        {/each}

        {#if $editLayout_01}
            <div class="Row" style="height:100px">
                <RowColumnOptions
                    active={$editLayout_01}
                    onAdd={() => {
                        OBJ.update((obj) => {
                            obj.addRow();
                            obj.data[$OBJ.data.length - 1].addColumn();
                            return obj;
                        });
                    }}
                    offset={15}
                    addText={`add Line`}
                />
            </div>
        {/if}
    </div>
</div>

<!--
	<div class="CornerItem" > 
		<button class="addButton"  on:click={() => addRowItem(i)}>+</button>
	</div>
	
-->
