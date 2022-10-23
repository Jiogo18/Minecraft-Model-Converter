import { JemEntityModel } from "../JemCem";

// enum for the different types of transformations
export enum TransformationType {
	Scale,
	Rotate,
	Translate
}

export abstract class Transformation {
	// the type of the transformation
	type: TransformationType;

	constructor(type: TransformationType) {
		this.type = type;
	}

	// applies the transformation to the given model
	abstract applyToJem(model: JemEntityModel): JemEntityModel;
}
