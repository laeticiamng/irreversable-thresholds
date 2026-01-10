import TerritoryPage from '@/components/TerritoryPage';

export default function Thresh() {
  return (
    <TerritoryPage
      territory="THRESH"
      symbol="≈"
      manifesto="Le seuil ressenti, jamais mesuré."
      definition="THRESH est le territoire des seuils invisibles. Ces moments où l'on sait que quelque chose a changé — sans pouvoir dire quand, comment, ni pourquoi. Pas de métrique, pas de déclencheur identifiable. Juste la certitude somatique que c'est trop, ou pas assez, ou autre."
      notThis={[
        "Un outil de mesure quantitative du stress ou de l'énergie",
        "Un tracker d'humeur avec courbes et statistiques",
        "Un système d'alertes basé sur des seuils numériques",
        "Une application qui prédit ou anticipe"
      ]}
      digitalObject={{
        title: "Le Ressenti",
        description: "Un seuil invisible inscrit sans mesure. On ne dit pas combien — on dit que. Le système n'essaie pas de quantifier, d'analyser ou de prédire. Il atteste simplement qu'un seuil a été ressenti, à un moment donné."
      }}
      example={{
        title: "« Seuil de saturation »",
        description: "Je sais que c'est trop. Je ne sais pas combien de réunions, combien d'emails, combien de demandes. Mais je sais. Le corps le sait. C'est inscrit ici non comme donnée, mais comme témoignage."
      }}
      operationalLink={{
        path: "/thresh/space",
        label: "Espace opérationnel →"
      }}
    />
  );
}
