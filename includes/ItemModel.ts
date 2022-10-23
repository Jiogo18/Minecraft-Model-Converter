// Item Model / Block Model

import fs from "fs";
import path from "path";
import { Face, Point, UV } from "./Point";

export interface ItemElement {
	from: Point;
	to: Point;
	rotation: {
		angle: number;
		axis: "x" | "y" | "z";
		origin: Point;
	}
	faces: {
		[face in Face]: {
			uv: UV;
			texture: string;
			rotation?: number;
		}
	}
}
export type ItemDisplayPosition =
	"thirdperson_righthand" |
	"thirdperson_lefthand" |
	"firstperson_righthand" |
	"firstperson_lefthand" |
	"ground" |
	"gui" |
	"head" |
	"fixed";
export interface ItemDisplay {
	translation: Point;
	scale: Point;
}
export interface ItemGroup {
	name: string;
	origin: Point;
	color: number;
	children: (number | ItemGroup)[];
}
export interface ItemModel {
	credit: string;
	textures: {
		[texture: string]: string;
	}
	elements: ItemElement[];
	display: {
		[displayPosition in ItemDisplayPosition]?: ItemDisplay;
	}
	groups: ItemGroup[];
}

export function loadItemModel(path: string): ItemModel {
	return JSON.parse(fs.readFileSync(path, "utf8"));
}

export function saveItemModel(filePath: string, model: ItemModel) {
	const json = JSON.stringify(model);
	// Create directory if it doesn't exist
	const outputDir = path.dirname(filePath);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}
	fs.writeFileSync(filePath, json, "utf8");
}