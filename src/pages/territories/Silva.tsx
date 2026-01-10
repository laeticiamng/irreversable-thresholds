import TerritoryPage from '@/components/TerritoryPage';

export default function Silva() {
  return (
    <TerritoryPage
      territory="SILVA"
      symbol="◯"
      manifesto="L'espace qui ne fait rien."
      definition="SILVA est le territoire du milieu. Un espace numérique qui n'a aucune fonctionnalité productive. Il ne mesure rien, ne propose rien, n'optimise rien. Sa seule fonction est d'exister — et par cette existence, de modifier les comportements de celui qui y entre."
      notThis={[
        "Un espace de méditation guidée",
        "Un outil de relaxation avec exercices",
        "Une application de pause productive",
        "Un environnement gamifié de bien-être"
      ]}
      digitalObject={{
        title: "La Présence",
        description: "SILVA impose des contraintes temporelles. Un délai minimal avant toute action. Un espacement obligatoire entre les gestes. Non pas pour ralentir en vue d'un objectif, mais pour que la lenteur elle-même devienne l'expérience."
      }}
      example={{
        title: "« Entrer dans SILVA »",
        description: "J'entre. Rien ne se passe. Le temps passe. Je ne peux rien faire pendant 30 secondes. Puis je peux poser un geste. Puis j'attends encore. SILVA ne m'aide pas. SILVA me confronte à la durée."
      }}
      operationalLink={{
        path: "/silva/space",
        label: "Entrer dans SILVA →"
      }}
    />
  );
}
