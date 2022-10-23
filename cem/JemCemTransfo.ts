import { loadJem, saveJem } from '../includes/JemCem';
import { Transformation } from '../includes/transformations/Transformation';
import { askForTransformation, parseTransformation } from '../includes/transformations/TransformationsParser';
import { createInteractiveMain } from '../includes/execWithParameters';

export default function main(inputName: string, outputName: string, ...next: string[]) {
	// Récupérer les transformations données en paramètres ou en demander à l'utilisateur
	let transfos: Transformation[] = [];
	for (let indexArgs = 0; indexArgs < next.length; indexArgs++) {
		transfos.push(parseTransformation(next[indexArgs], () => next[++indexArgs]));
	}
	if (transfos.length === 0) {
		let transfo: Transformation | null;
		do {
			transfo = askForTransformation(true);
			if (transfo) {
				transfos.push(transfo);
			}
		}
		while (transfo);
	}

	let jem = loadJem(inputName);
	transfos.forEach(transfo => jem = transfo.applyToJem(jem));
	saveJem(jem, outputName);
}

createInteractiveMain(module, [
	{ name: "inputName", validator: (value: string) => !!value, errorMessage: "Missing input file name" },
	{ name: "outputName", validator: (value: string) => !!value, errorMessage: "Missing output file name" },
], main);

// Example :
// ts-node ./cem/JemCemTransfo.ts "./data/bateauFB/2_sous_bone/bateau_sous_bone.jem" "./data/bateauFB/3_transfo/bateau_transformed.jem" scale 0.3
// ts-node ./cem/JemCemTransfo.ts "./data/bateauFB/2_sous_bone/bateau_sous_bone.jem" "./data/bateauFB/3_transfo/bateau_transformed.jem" translate -8 0 -6 scale 0.3
// ts-node ./cem/JemCemTransfo.ts "./data/bateauFB/2_sous_bone/bateau_sous_bone.jem" "./data/bateauFB/3_transfo/bateau_transformed.jem" translate -8 0 -6 rotation 0 90 0
