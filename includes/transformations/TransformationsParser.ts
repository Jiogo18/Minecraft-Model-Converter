import { Transformation, TransformationType } from "./Transformation";
import { TransfoRot } from "./TransfoRot";
import { TransfoScale } from "./TransfoScale";
import { TransfoTranslate } from "./TransfoTranslate";

import promptSync from 'prompt-sync';

let prompt: promptSync.Prompt = promptSync();

export const Transfos = {
	Scale: TransfoScale,
	Rotation: TransfoRot,
	Translation: TransfoTranslate,
}

export function parseTransformation(transfoName: string, nextArg: (argName: string) => string): Transformation {
	switch (transfoName.toLowerCase()) {
		case "scale":
			const scaleFactor = parseFloat(nextArg('scale factor'));
			if (isNaN(scaleFactor)) {
				console.error("scale must be a number");
				process.exit(1);
			}
			return new Transfos.Scale(scaleFactor);
		case "rot":
		case "rotate":
		case "rotation":
			const yaw = parseFloat(nextArg('axis X (pitch)'));
			const pitch = parseFloat(nextArg('axis Y (yaw)'));
			const roll = parseFloat(nextArg('axis Z (roll)'));
			if (isNaN(yaw) || isNaN(pitch) || isNaN(roll)) {
				console.error("rotate must be a number");
				process.exit(1);
			}
			return new Transfos.Rotation(yaw, pitch, roll);
		case "translate":
		case "translation":
			const x = parseFloat(nextArg('x'));
			const y = parseFloat(nextArg('y'));
			const z = parseFloat(nextArg('z'));
			if (isNaN(x) || isNaN(y) || isNaN(z)) {
				console.error("translate must be a number");
				process.exit(1);
			}
			return new Transfos.Translation(x, y, z);
		default:
			console.error("Unknown transformation: " + transfoName);
			process.exit(1);
	}
}

export function askForTransformation(loopIfUnkown: boolean): Transformation | null {
	// Ask for transformations
	console.log('Quelle transformation voulez-vous appliquer ?');
	// List de TransformationType
	console.log('  0. Fin');
	const transformationTypes = Object.keys(TransformationType).filter(key => isNaN(Number(key)));
	transformationTypes.forEach((key, index) => {
		console.log(`  ${index + 1}. ${key}`);
	});

	// Read the answer
	const answer = prompt('> ');
	const answerNumber = Number(answer);
	let transformationType: string;
	if (answerNumber === 0) {
		return null;
	}
	else if (!isNaN(answerNumber) && answerNumber > 0 && answerNumber <= Object.keys(TransformationType).length) {
		// Ask for parameters
		transformationType = transformationTypes[answerNumber - 1];
	}
	else if (typeof answer === 'string' && transformationTypes.includes(answer)) {
		transformationType = answer;
	}
	else {
		console.log('Transformation inconnue');
		return loopIfUnkown ? askForTransformation(loopIfUnkown) : null;
	}

	return parseTransformation(transformationType.toString(), (paramInfos) => {
		return prompt(`  Paramètre ${paramInfos} : `) || '';
	});
}