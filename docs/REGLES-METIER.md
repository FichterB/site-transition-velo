# Règles métier — vélo de fonction en LLD

> Synthèse établie en octobre 2026 à partir des textes officiels. Ce n'est pas un avis juridique : toute nouvelle promesse fiscale affichée sur le site doit être validée par un expert-comptable.

## Vélos éligibles

| Type | Statut légal | Avantages fiscaux |
|---|---|---|
| Vélo classique | cycle | Oui |
| VAE (assistance coupée à **25 km/h**, moteur **250 W** max) — ville, VTC, gravel, VTT, cargo | cycle à pédalage assisté (code de la route, art. R311-1, 6.10 et 6.11) | Oui |
| **Speedbike / speed pedelec (45 km/h)** | **cyclomoteur** L1e-B : immatriculation, assurance cyclomoteur, casque homologué, permis AM, interdit sur pistes cyclables | **Non** — ni exonération BOSS, ni réduction d'IS |

Un speedbike peut être loué en LLD, mais il est traité comme un véhicule de fonction (avantage en nature à déclarer).

## Les deux avantages

### Côté salarié : pas de cotisations sur l'usage du vélo
- **BOSS, Avantages en nature, § 945** (mise à jour du 7 mai 2026, opposable à l'URSSAF depuis le 1er juin 2026).
- La mise à disposition permanente d'un vélo par l'employeur n'est pas réintégrée dans l'assiette des cotisations.
- Vélo acheté **ou loué**, sans condition de participation du salarié, cumulable avec le forfait mobilités durables.

### Côté entreprise : réduction d'impôt sur les sociétés
- **Art. 220 undecies A du CGI**, doctrine BOI-IS-RICI-20-30.
- Entreprises **soumises à l'IS** uniquement.
- Réduction égale aux frais de mise à disposition **gratuite** d'une flotte de vélos pour les trajets domicile-travail, **dans la limite de 25 % du prix d'achat ou de location** (TTC admis).
- Location : contrat d'**au moins 3 ans**.
- Applicable aux frais engagés jusqu'au **31 décembre 2027** (prolongation à 2030 proposée par amendement, à surveiller).
- S'ajoute à la déduction du loyer comme charge.

## Les deux formules commerciales

1. **Avec participation du salarié** : l'employeur paie la majorité du loyer (70 % dans le simulateur), le salarié le reste (30 %), soit par retenue sur salaire net, soit par renonciation à une partie du brut (conversion de salaire, qui doit respecter le SMIC et les minima conventionnels).
2. **100 % entreprise** : mise à disposition gratuite → ouvre droit à la réduction d'IS.

⚠ **Zone grise** : cumuler une participation du salarié et la réduction d'IS. La loi exige une mise à disposition *gratuite*. Avec une conversion de salaire, c'est très discutable ; avec une retenue sur le net, certains acteurs l'appliquent mais aucun texte ne le confirme. **Le simulateur actuel additionne les deux** : à faire valider.

## Formule du simulateur

```
loyer mensuel HT   = prix HT × tauxLoyer (0,0335) × coeffDuree (36 mois : 1 ; 24 : 1,25 ; 12 : 1,7)
prix HT           = prix d'un vélo, ou somme des vélos suggérés ajoutés (le même modèle peut compter plusieurs fois) (8 000 € HT max, config.js > prixMax)
fin de contrat     = rachat à la valeur résiduelle sur le prix TTC (CGV : 50 % à 12 mois, 25 % à 24 mois, 10 % à 36 mois)
                     puis revente estimée à 30 % du prix neuf TTC (config.js > finDeContrat)
  reste à charge salarié = montant payé + rachat TTC − revente TTC
  montant payé = coût net salarié × durée (rachat et revente sur le prix TTC : le salarié achète et revend comme un particulier)
  (bloc masqué quand la revente vaut moins que le rachat, ex. 12 mois)
part salarié       = X % du loyer HT, sans TVA ajoutée (montant net pour le salarié ; 30 % par défaut — config.js > partSalarie)
  économie cotisations = 23 % de la part salarié
  économie IR          = (part salarié − économie cotisations) × TMI × 0,9
part employeur     = loyer HT − part salarié
  réduction IS         = 25 % de la part employeur
  déductibilité        = 25 % × 25 % de la part employeur
```
`tauxLoyer` et `coeffDuree` se règlent dans `site/config.js`. Les autres taux sont dans le code des deux pages (fonction `calc`).

## Sources

- BOFiP BOI-IS-RICI-20-30 : https://bofip.impots.gouv.fr/bofip/10630-PGP.html/identifiant=BOI-IS-RICI-20-30-20240214
- BOSS § 945 (via Weblex) : https://www.weblex.fr/weblex-actualite/avantages-en-nature-du-nouveau-pour-les-velos-et-vehicules-electriques
- Fiche impots.gouv 2079-VLO-FC-SD : https://www.impots.gouv.fr/sites/default/files/formulaires/2079-vlo-fc-sd/2023/2079-vlo-fc-sd_4213.pdf
