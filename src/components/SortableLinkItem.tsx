import React from "react";
import { Menu, Edit2, Trash2 } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import { Link } from "../types";
import { ICON_MAP } from "./constant";

interface SortableLinkItemProps {
    link: Link;
    onEdit: (link: Link) => void;
    onDelete: (id: number) => void | Promise<void>;
    key?: React.Key;
}

export function SortableLinkItem({
    link,
    onEdit,
    onDelete
}: SortableLinkItemProps) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={link}
            id={link.id.toString()}
            dragListener={false}
            dragControls={controls}
            className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center gap-4 shadow-sm select-none"
        >
            <div
                onPointerDown={(e) => controls.start(e)}
                className="cursor-grab active:cursor-grabbing p-2 text-stone-300 hover:text-stone-600 transition-colors"
            >
                <Menu className="w-5 h-5" />
            </div>
            <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600">
                {ICON_MAP[link.icon?.toLowerCase()] || ICON_MAP.default}
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-lg">{link.title}</h3>
                <p className="text-sm text-stone-500 truncate max-w-[150px] md:max-w-md">{link.url}</p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onEdit(link)}
                    className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                >
                    <Edit2 className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onDelete(link.id)}
                    className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </Reorder.Item>
    );
}
