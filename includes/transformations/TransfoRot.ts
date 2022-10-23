import { JemEntityModel, JemModel } from "../JemCem";
import { addPoints } from "../Point";
import { Transformation, TransformationType } from "./Transformation";

export class TransfoRot extends Transformation {
	yaw: number;
	pitch: number;
	roll: number;

	constructor(yaw: number, pitch: number, roll: number) {
		super(TransformationType.Rotate);
		this.yaw = yaw;
		this.pitch = pitch;
		this.roll = roll;
	}

	applyToJem(model: JemEntityModel): JemEntityModel {
		const newModel = { ...model };
		if (model.models) {
			newModel.models = model.models.map(sm => this.applyToJemModel(sm));
		}
		return newModel;
	}

	applyToJemModel(model: JemModel): JemModel {
		return {
			...model,
			rotate: model.rotate ? addPoints([this.yaw, this.pitch, this.roll], model.rotate) : [this.yaw, this.pitch, this.roll]
		};
	}
}