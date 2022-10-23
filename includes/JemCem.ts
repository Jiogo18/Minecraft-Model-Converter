// CEM : Custom Entity Model
// JEM : Json Entity Model
// (c'est la même chose)

import fs from "fs";
import path from "path";
import { Box, Point, UV } from "./Point";

export interface JemModelBox {
	coordinates: Box;
	uvNorth: UV;
	uvEast: UV;
	uvSouth: UV;
	uvWest: UV;
	uvUp: UV;
	uvDown: UV;
}
export interface JemModel {
	part?: string;
	id: string;
	invertAxis: string
	translate: Point;
	rotate?: Point;
	boxes?: JemModelBox[];
	submodels?: JemModel[];
}
export interface JemEntityModel {
	credit: string;
	texture: string;
	textureSize: [number, number];
	models: JemModel[];
}

export function loadJem(path: string): JemEntityModel {
	return JSON.parse(fs.readFileSync(path, "utf8"));
}

export function saveJem(model: JemEntityModel, filePath: string) {
	const json = JSON.stringify(model, null, "\t");
	// Create directory if it doesn't exist
	const outputDir = path.dirname(filePath);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}
	fs.writeFileSync(filePath, json, "utf8");
}