import { createInteractiveMain } from '../includes/execWithParameters';
import { loadJem, saveJem } from '../includes/JemCem';
import { EntityType, getBody, loadEntityModel, parseEntityType } from './EmptyEntity/Entities';

export default function main(inputName: string, outputName: string, entityType: EntityType) {
	const jemEntity = loadEntityModel(entityType);
	const body = getBody(jemEntity, entityType);

	const jem = loadJem(inputName);
	const modelsToPush = jem.models;

	jem.models = jemEntity.models;

	body.submodels = [
		...(body.submodels || []),
		...modelsToPush,
	];

	saveJem(jem, outputName);
}

createInteractiveMain(module, [
	{ name: 'Input file name', validator: (value: string) => !!value, errorMessage: 'No input file name' },
	{ name: 'Output file name', validator: (value: string) => !!value, errorMessage: 'No output file name' },
	{ name: 'Entity name', validator: (value: string) => !!parseEntityType(value), errorMessage: 'Invalid entity name' },
], (inputName, outputName, entityName) => main(inputName, outputName, parseEntityType(entityName)));

// Example :
// ts-node ./cem/PushToEntity.ts "./data/bateauFB/3_transfo/bateau_transformed_boat.jem" "./data/bateauFB/4_entity/boat.jem" boat
