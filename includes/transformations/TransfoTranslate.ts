import { JemEntityModel, JemModel } from "../JemCem";
import { addPoints } from "../Point";
import { Transformation, TransformationType } from "./Transformation";

export class TransfoTranslate extends Transformation {
	x: number;
	y: number;
	z: number;

	constructor(x: number, y: number, z: number) {
		super(TransformationType.Translate);
		this.x = x;
		this.y = y;
		this.z = z;
	}

	applyToJem(model: JemEntityModel): JemEntityModel {
		return {
			...model,
			models: model.models.map(m => {
				const newModel = { ...m };
				if (m.submodels) {
					newModel.submodels = m.submodels.map(sm => this.applyToJemModel(sm));
				}
				return newModel;
			})
		};
	}

	applyToJemModel(model: JemModel): JemModel {
		return {
			...model,
			translate: addPoints(model.translate, [this.x, this.y, this.z])
		};
	}
}