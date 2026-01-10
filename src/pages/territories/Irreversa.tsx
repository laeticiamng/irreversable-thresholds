import TerritoryPage from '@/components/TerritoryPage';

export default function Irreversa() {
  return (
    <TerritoryPage
      territory="IRREVERSA"
      symbol="◼"
      manifesto="Ce qui est fait ne peut être défait."
      definition="IRREVERSA est le territoire des seuils franchis. Un espace où le temps ne revient jamais en arrière. Chaque inscription est définitive. Chaque acte posé devient irrévocable. Le système refuse la plasticité du numérique — ici, tout a des conséquences permanentes."
      notThis={[
        "Un outil de suivi d'habitudes avec possibilité de modifier l'historique",
        "Un journal intime effaçable ou éditable",
        "Un système de to-do où l'on peut supprimer ses tâches",
        "Une application qui pardonne les erreurs"
      ]}
      digitalObject={{
        title: "Le Sceau",
        description: "Un acte numérique irréversible. Une fois scellé, un seuil ne peut être modifié, supprimé ou altéré. Le sceau marque la transition entre le possible et l'advenu. Il transforme l'intention en fait accompli."
      }}
      example={{
        title: "« J'ai dit oui »",
        description: "Un engagement prononcé. Non pas une promesse (modifiable), mais un fait attesté. La date est inscrite. Les mots sont fixés. Aucune réécriture possible. Le seuil existe désormais dans le temps, immuable."
      }}
    />
  );
}
