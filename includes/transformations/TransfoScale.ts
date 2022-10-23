import { JemEntityModel, JemModel, JemModelBox } from "../JemCem";
import { Transformation, TransformationType } from "./Transformation";

export class TransfoScale extends Transformation {
	scaleFactor: number;

	constructor(scaleFactor: number) {
		super(TransformationType.Scale);
		this.scaleFactor = scaleFactor;
	}

	applyToJem(model: Readonly<JemEntityModel>): JemEntityModel {
		// Rot : ne pas toucher
		// Transalte : multiplier
		// coordinates : mutliplier
		// uv : ne pas toucher
		// translate ou coordinates sous des rotate : ne pas toucher (pour l'instant)

		return {
			credit: model.credit,
			texture: model.texture,
			textureSize: model.textureSize,
			models: model.models.map((model) => this.applyToJemModel(model)),
		};
	}

	applyToJemBox(box: Readonly<JemModelBox>): JemModelBox {
		return {
			coordinates: [
				box.coordinates[0] * this.scaleFactor,
				box.coordinates[1] * this.scaleFactor,
				box.coordinates[2] * this.scaleFactor,
				box.coordinates[3] * this.scaleFactor,
				box.coordinates[4] * this.scaleFactor,
				box.coordinates[5] * this.scaleFactor,
			],
			uvNorth: box.uvNorth,
			uvEast: box.uvEast,
			uvSouth: box.uvSouth,
			uvWest: box.uvWest,
			uvUp: box.uvUp,
			uvDown: box.uvDown,
		}
	}

	applyToJemModel(model: Readonly<JemModel>): JemModel {
		const newModel: JemModel = {
			part: model.part,
			id: model.id,
			invertAxis: model.invertAxis,
			translate: [
				model.translate[0] * this.scaleFactor,
				model.translate[1] * this.scaleFactor,
				model.translate[2] * this.scaleFactor,
			]
		};

		if (model.rotate !== undefined) {
			newModel.rotate = model.rotate;

			// TODO: rotate the boxes
			// if (model.boxes !== undefined) {
			// 	newModel.boxes = model.boxes;
			// }
			// if (model.submodels !== undefined) {
			// 	newModel.submodels = model.submodels;
			// }
			// return newModel;
		}

		if (model.boxes !== undefined) {
			newModel.boxes = model.boxes.map(box => this.applyToJemBox(box));
		}

		if (model.submodels !== undefined) {
			newModel.submodels = model.submodels.map(submodel => this.applyToJemModel(submodel));
		}

		return newModel;
	}
}

