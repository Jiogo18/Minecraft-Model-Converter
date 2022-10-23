import { JemEntityModel, JemModel, loadJem } from "../../includes/JemCem";


export enum EntityType {
	BOAT = "boat",
	MAGMA_CUBE = "magma_cube",
	SLIME = "slime",
	Rabbit = "rabbit",
}

export function parseEntityType(entityType: string): EntityType {
	switch (entityType.toLowerCase()) {
		case "boat":
			return EntityType.BOAT;
		case "magma_cube":
		case "magmacube":
			return EntityType.MAGMA_CUBE;
		case "slime":
			return EntityType.SLIME;
		case "rabbit":
			return EntityType.Rabbit;
		default:
			throw new Error(`Unknown entity type: ${entityType}`);
	}
}

export function loadEntityModel(entityType: EntityType) {
	return loadJem(`./cem/EmptyEntity/${entityType}.jem`);
}

export function getBodyId(entityType: EntityType) {
	switch (entityType) {
		case EntityType.BOAT:
			return 'bottom';
		case EntityType.MAGMA_CUBE:
			return 'segment8';
		case EntityType.SLIME:
			return 'body';
		case EntityType.Rabbit:
			return 'body';
	}
}

function getBodyInModel(model: JemModel, id: string): JemModel | undefined {
	if (model.id === id || model.part === id) {
		return model;
	}
	return model.submodels?.find(submodel => getBodyInModel(submodel, id));
}

export function getBody(jem: JemEntityModel, entityType: EntityType) {
	const bodyId = getBodyId(entityType);
	const body = jem.models.find(model => getBodyInModel(model, bodyId));
	if (!body) {
		throw new Error(`Could not find body ${bodyId} in entity model: ${entityType}`);
	}
	return body;
}
