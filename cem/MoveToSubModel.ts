import { JemEntityModel, JemModel, JemModelBox, loadJem, saveJem } from '../includes/JemCem';
import { addPoints, minusPoint } from '../includes/Point';
import { createInteractiveMain } from '../includes/execWithParameters';

export default function main(inputName: string, outputName: string) {
	const jem = loadJem(inputName);

	// Créer un JemModel "bone" qui contient tous les submodels de jem

	const newJem: JemEntityModel = {
		...jem,
		models: [{
			part: 'bone',
			id: 'bone',
			invertAxis: "xy",
			translate: [0, 0, 0],
			submodels: jem.models.map((model, index) => {
				const newModel: JemModel = {
					id: model.id,
					invertAxis: model.invertAxis,
					translate: minusPoint(model.translate),
				};
				if (model.rotate) {
					newModel.rotate = model.rotate;
				}
				if (model.submodels) {
					newModel.submodels = model.submodels.map((submodel) => {
						const newSubmodel: JemModel = {
							id: submodel.id,
							invertAxis: submodel.invertAxis,
							translate: addPoints(model.translate, submodel.translate),
						};
						if (submodel.rotate) {
							newSubmodel.rotate = submodel.rotate;
						}
						if (submodel.submodels) {
							newSubmodel.submodels = submodel.submodels;
						}
						if (submodel.boxes) {
							newSubmodel.boxes = submodel.boxes;
						}
						return newSubmodel;
					});
				}
				if (model.boxes) {
					newModel.boxes = model.boxes.map((box) => {
						const newBox: JemModelBox = {
							coordinates: [
								model.translate[0] + box.coordinates[0],
								model.translate[1] + box.coordinates[1],
								model.translate[2] + box.coordinates[2],
								box.coordinates[3],
								box.coordinates[4],
								box.coordinates[5],
							],
							uvNorth: box.uvNorth,
							uvEast: box.uvEast,
							uvSouth: box.uvSouth,
							uvWest: box.uvWest,
							uvUp: box.uvUp,
							uvDown: box.uvDown,
						};
						return newBox;
					});
				}
				return newModel;
			})
		}]
	};

	saveJem(newJem, outputName);
}

createInteractiveMain(module, [
	{ name: 'inputName', validator: (value) => !!value, errorMessage: 'No input file name' },
	{ name: 'outputName', validator: (value) => !!value, errorMessage: 'No output file name' },
], main);

// Example :
// ts-node ./cem/MoveToSubModel.ts "./data/bateauFB/1_convert/bateau.jem" "./data/bateauFB/2_sous_bone/bateau_sous_bone.jem"
