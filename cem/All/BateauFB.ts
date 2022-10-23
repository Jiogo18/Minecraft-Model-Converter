// Ce script re-calcul tout pour le bâteau de FB

const recalculer = {
	boat: true,
	slime: true,
	magma_cube: true,
}

import itemModelToJem from '../ItemModelToJem';
import moveToSubModel from '../MoveToSubModel';
import cemTransfo from "../JemCemTransfo";
import cemPushToEntity from "../PushToEntity";
import { EntityType } from "../EmptyEntity/Entities";

itemModelToJem("./data/bateauFB/0_input/bateau.json", "./data/bateauFB/1_convert/bateau.jem");
console.log(`Conversion de ItemModel à Jem terminée !`);

moveToSubModel("./data/bateauFB/1_convert/bateau.jem", "./data/bateauFB/2_sous_bone/bateau_sous_bone.jem");
console.log(`MoveTosub terminé !`);

if (recalculer.slime || recalculer.magma_cube) {
	cemTransfo("./data/bateauFB/2_sous_bone/bateau_sous_bone.jem", "./data/bateauFB/3_transfo/bateau_transformed_slime.jem", "translate", "-8", "0", "-6", "scale", "0.4");
	console.log(`Transformations pour slime/magma_cube terminées !`);

	if (recalculer.slime) {
		cemPushToEntity("./data/bateauFB/3_transfo/bateau_transformed_slime.jem", "./data/bateauFB/4_entity/slime.jem", EntityType.SLIME);
		console.log(`PushToEntity slime terminé !`);
	}

	if (recalculer.magma_cube) {
		cemPushToEntity("./data/bateauFB/3_transfo/bateau_transformed_slime.jem", "./data/bateauFB/4_entity/magma_cube.jem", EntityType.MAGMA_CUBE);
		console.log(`PushToEntity magma_cube terminé !`);
	}
}

if (recalculer.boat) {
	cemTransfo("./data/bateauFB/2_sous_bone/bateau_sous_bone.jem", "./data/bateauFB/3_transfo/bateau_transformed_boat.jem", "translate", "-12", "0", "-6", "rotate", "-90", "180", "90");
	console.log(`Transformations pour boat terminées !`);

	cemPushToEntity("./data/bateauFB/3_transfo/bateau_transformed_boat.jem", "./data/bateauFB/4_entity/boat.jem", EntityType.BOAT);
	console.log(`PushToEntity boat terminé !`);
}
