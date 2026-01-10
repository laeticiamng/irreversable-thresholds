import TerritoryPage from '@/components/TerritoryPage';

export default function Nulla() {
  return (
    <TerritoryPage
      territory="NULLA"
      symbol="∅"
      manifesto="Ce qui n'existe pas structure ce qui existe."
      definition="NULLA est le territoire des absences. Non pas ce qui manque à combler, mais ce qui, par son absence même, donne forme au reste. Ici, on n'ajoute rien — on observe les effets de ce qui n'est pas là. Le vide n'est pas un problème à résoudre, c'est une force structurante."
      notThis={[
        "Une liste de souhaits ou de désirs à satisfaire",
        "Un outil de suivi des objectifs non atteints",
        "Un système de rappels pour ce qu'on a oublié",
        "Une application de gestion du manque"
      ]}
      digitalObject={{
        title: "L'Absence déclarée",
        description: "On ne crée pas ce qui manque — on déclare son absence et on observe ses effets. Chaque absence inscrite génère des conséquences visibles : ce qu'elle empêche, ce qu'elle permet, ce qu'elle force, ce qu'elle préserve."
      }}
      example={{
        title: "« L'absence de validation »",
        description: "Je n'ai jamais reçu de validation de la part de X. Cette absence n'est pas à combler. Elle structure : elle empêche certaines certitudes, elle force une autonomie, elle préserve une distance. L'observer suffit."
      }}
      operationalLink={{
        path: "/nulla/space",
        label: "Espace opérationnel →"
      }}
    />
  );
}
