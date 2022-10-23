# Transformations ItemModel et Jem/Cem

[BlockBench](https://web.blockbench.net/)

## ItemModel

Un modèle 3D pour les items et les blocs.

Plusieurs textures.

## Jem/Cem

Json Entity Model (l'extension .jem des modèles dans le dossier /optifine/cem).<br/>
Custom Entity Model (le dossier dans /assets/minecraft/optifine/cem).<br/>
(c'est la même chose)

Une unique texture.

### Outils de conversion

#### ItemModelToJem

Lien : [ItemModelToJem](./cem/ItemModelToJem/ItemModelToJem.ts)

exemple : `ts-node ./cem/ItemModelToJem.ts "./data/bateauFB/0_input/bateau.json" "./data/bateauFB/1_convert/bateau.jem"`

BlockBench permet de convertir un ItemModel vers un Jem mais il prend en charge ni la rotation ni la texture.

1) Préparer le modèle à convertir
2) Créer une unique texture à partir des textures du modèle
3) Paramétrer la texture dans le script
4) Éxécuter le script

#### Jem MoveToSubModel

Lien : [Jem MoveToSubModel](./cem/MoveToSub/MoveToSubModel.ts)

exemple : `ts-node ./cem/MoveToSubModel.ts "./data/bateauFB/1_convert/bateau.jem" "./data/bateauFB/2_sous_bone/bateau_sous_bone.jem"`

Intérêt : permet de créer un groupe qui contient tous les sous-modèles.
Cette opération peut être faite avec BlockBench mais il faut déplacer chaque sous-modèle dans le nouveau groupe.
Impossible de le faire à la main car il y a quelques modifs quand on déplace un sous-modèle (translate).

#### JemCem Transformation

Lien : [JemCem Transformation](./cem/Transfo/JemCemTransfo.ts)

exemple : `ts-node ./cem/JemCemTransfo.ts "./data/bateauFB/2_sous_bone/bateau_sous_bone.jem" "./data/bateauFB/3_transfo/bateau_transformed.jem" translate -8 0 -6 scale 0.3`

Intérêt : permet de changer l'échelle d'un modèle.
Cette opération n'est pas faisable avec BlockBench.

#### JemCem PushToEntity

Lien : [JemCem PushToEntity](./cem/PushToEntity/PushToEntity.ts)

exemple : `ts-node ./cem/PushToEntity.ts "./data/bateauFB/3_transfo/bateau_transformed_boat.jem" "./data/bateauFB/4_entity/boat.jem" boat`

Intérêt : permet de créer un modèle pour un entité existante (Il faut que les models soient exactement pareils).
BlockBench permet de le faire, mais c'est long...

#### Résumé (le bâteau de FB)

```bash
ts-node ./cem/ItemModelToJem.ts "./data/bateauFB/0_input/bateau.json" "./data/bateauFB/1_convert/bateau.jem"
ts-node ./cem/MoveToSubModel.ts "./data/bateauFB/1_convert/bateau.jem" "./data/bateauFB/2_sous_bone/bateau_sous_bone.jem"
ts-node ./cem/JemCemTransfo.ts "./data/bateauFB/2_sous_bone/bateau_sous_bone.jem" "./data/bateauFB/3_transfo/bateau_transformed_boat.jem" translate -8 0 -6 scale 0.3
ts-node ./cem/PushToEntity.ts "./data/bateauFB/3_transfo/bateau_transformed_boat.jem" "./data/bateauFB/4_entity/boat.jem" boat
```

Ou (beaucoup plus rapide) : `ts-node ./cem/All/BateauFB.ts`
