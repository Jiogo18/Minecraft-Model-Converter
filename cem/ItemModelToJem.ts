import { ItemGroup, ItemModel, loadItemModel } from '../includes/ItemModel';
import { JemEntityModel, JemModel, JemModelBox, saveJem } from '../includes/JemCem';
import { addPoints, isNullPoint, minusPoint, minusPoints, moveBox, rotateAroundAxis, UV } from '../includes/Point';
import { createInteractiveMain } from '../includes/execWithParameters';

// Convert the item model to a JEM model
// In an ItemModel, the rotation is defined for each element
// In a JEM model, the rotation is defined for the whole model (group)
// We have to group the elements by rotation
// Every elements in a JEM model have the same rotation and were in the same ItemModel group

export default function main(inputName: string, outputName: string) {

	const itemModel: ItemModel = loadItemModel(inputName);

	const textureOutput = "bateau.png";
	const textureSize: [number, number] = [966, 1000];
	const texturesUVs = {
		"#2": [32, 0, 32, 32], // fer_bateau
		"#3": [64, 0, 32, 32], // fer_moteur
		"#4": [0, 32, 966, 968], // tete_de_tigre
		"#5": [128, 0, 32, 32], // loupiotte
		"#6": [0, 0, 32, 32], // green_wool
		"#7": [96, 0, 32, 32], // orange_wool
		"#8": [160, 0, 32, 32], // transparent
	}
	function getTextureUV(textureData: {
		uv: UV;
		texture: string;
		rotation?: number | undefined;
	}): UV {
		const textureUV = Object.entries(texturesUVs).find(([texture, uv]) => texture === textureData.texture)?.[1];
		if (textureUV === undefined) {
			throw new Error(`Unknown texture ${textureData.texture}`);
		}

		if (textureData.uv[2] < textureData.uv[0]) {
			const temp = textureData.uv[0];
			textureData.uv[0] = textureData.uv[2];
			textureData.uv[2] = temp;
		}
		if (textureData.uv[3] < textureData.uv[1]) {
			const temp = textureData.uv[1];
			textureData.uv[1] = textureData.uv[3];
			textureData.uv[3] = temp;
		}

		const xMin = textureUV[0] + textureUV[2] * textureData.uv[0] / 16;
		const yMin = textureUV[1] + textureUV[3] * textureData.uv[1] / 16;
		const widthMax = textureUV[2] * textureData.uv[2] / 16;
		const heightMax = textureUV[3] * textureData.uv[3] / 16;
		const xMax = Math.min(xMin + widthMax, textureUV[0] + textureUV[2]);
		const yMax = Math.min(yMin + heightMax, textureUV[1] + textureUV[3]);

		const uv: UV = [
			xMin,
			yMin,
			xMax,
			yMax,
		];
		return uv;
	}

	// Create a group for each ItemElement
	const jemParts: JemModel[] = itemModel.elements.map((element, index) => {
		const jemPart: JemModel = {
			id: `part${index}`,
			invertAxis: "xy",
			translate: [0, 0, 0],
		};
		if (element.rotation && element.rotation.angle !== 0) {
			jemPart.rotate = [0, 0, 0];
			switch (element.rotation.axis) {
				case "x":
					jemPart.rotate[0] = element.rotation.angle;
					break;
				case "y":
					jemPart.rotate[1] = element.rotation.angle;
					break;
				case "z":
					jemPart.rotate[2] = element.rotation.angle;
					break;
			}
			jemPart.translate = minusPoint(element.rotation.origin);
		}
		jemPart.boxes = [{
			coordinates: [
				...element.from,
				...minusPoints(element.to, element.from),
			],
			uvNorth: getTextureUV(element.faces.north),
			uvEast: getTextureUV(element.faces.east),
			uvSouth: getTextureUV(element.faces.south),
			uvWest: getTextureUV(element.faces.west),
			uvUp: getTextureUV(element.faces.up),
			uvDown: getTextureUV(element.faces.down),
		}];

		return jemPart;
	});

	function getItemPart(itemIndex: number, parents: ItemGroup[], translateWithParent: boolean): JemModel {
		const jemPart = jemParts[itemIndex];
		if (parents.length === 0) {
			return jemPart;
		}
		const previousParent = parents[parents.length - 1];
		if (translateWithParent) {
			// If in a sub model/group
			jemPart.boxes?.forEach(box => box.coordinates = moveBox(box.coordinates, previousParent.origin));
		}

		// Apply the rotation

		const origin = jemPart.translate;
		jemPart.translate = [0, 0, 0]; // It's only used for the origin of the rotation
		if (jemPart.rotate && !isNullPoint(jemPart.rotate)) {
			parents.splice(0, 1); // Remove the first parent
			let originBefore = addPoints(
				minusPoint(origin),
				...parents.map(parent => minusPoint(parent.origin)));

			const axisIndex = jemPart.rotate.findIndex(v => v !== 0);
			const axis = "xyz"[axisIndex] as "x" | "y" | "z";
			const angle = jemPart.rotate[axisIndex];

			let originAfter = rotateAroundAxis(axis, originBefore, angle);
			let delta = minusPoints(originBefore, originAfter);

			jemPart.translate = delta;
		}

		return jemPart;
	}

	function createJemModelGroup(itemGroup: number | ItemGroup, id: string, parents: ItemGroup[]): JemModel {
		if (typeof itemGroup === "number") {
			return getItemPart(itemGroup, parents, parents.length > 1);
		}

		const childsCanBeSimplified = itemGroup.children.every(child => {
			if (typeof child === "number") {
				const jemPart = jemParts[child];
				return isNullPoint(jemPart.rotate) && isNullPoint(jemPart.translate)
					&& jemPart.boxes !== undefined;
			}
			else {
				return false;
			}
		});

		let model: JemModel;
		if (id.includes('_')) {
			model = {
				id,
				invertAxis: "xy",
				translate: itemGroup.origin,
			};
		}
		else {
			model = {
				part: id,
				id,
				invertAxis: "xy",
				translate: itemGroup.origin,
			};
		}
		let childrens: (number | ItemGroup)[] = [];
		if (childsCanBeSimplified) {
			const boxes = (itemGroup.children
				.filter(child => typeof child === "number") as number[])
				.map(index => {
					const jemPart = getItemPart(index, [...parents, itemGroup], parents.length > 0);
					return jemPart.boxes;
				}).flat().filter(box => box !== undefined) as JemModelBox[];
			if (boxes.length > 0) {
				model.boxes = boxes;
			}

			childrens = (itemGroup.children
				.filter(child => typeof child === "object") as ItemGroup[])
				.map((child, i) => child.children)
				.flat();
		}
		else {
			childrens = itemGroup.children;
		}

		const submodels = childrens.map((child, i) => createJemModelGroup(child, `${id}_${i}`, [...parents, itemGroup]));
		if (submodels.length > 0) {
			model.submodels = submodels;
		}

		return model;
	}

	const jemEntityModel: JemEntityModel = {
		credit: itemModel.credit,
		texture: textureOutput,
		textureSize,
		models: itemModel.groups.map((group, index) => {
			const jemModel: JemModel = createJemModelGroup(group, `group${index}`, []);
			jemModel.translate = minusPoint(jemModel.translate);
			return jemModel;
		})
	};

	saveJem(jemEntityModel, outputName);
}

createInteractiveMain(module, [
	{ name: "inputName", validator: (value: string) => !!value, errorMessage: "No input file" },
	{ name: "outputName", validator: (value: string) => !!value, errorMessage: "No output file" },
], main);

// Example :
// ts-node ./cem/ItemModelToJem.ts "./data/bateauFB/0_input/bateau.json" "./data/bateauFB/1_convert/bateau.jem"
