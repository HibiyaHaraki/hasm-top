// Sample .hasm model datasets for live 3D visualization
export const SAMPLE_HASM_MODELS = [
  {
    fileName: "AdaLovelaceResearch.hasm",
    title: "Ada Lovelace Research Model",
    model: {
      people: [
        { person_id: "p1", person_name: "Ada Lovelace", birthday: "1815-12-10" }
      ],
      experiences: [
        { experience_id: "e1", experience_name: "Life Stream", parent_experience_ids: [] },
        { experience_id: "e2", experience_name: "Analytical Engine Research", parent_experience_ids: ["e1"] },
        { experience_id: "e3", experience_name: "Algorithm Writing & Publication", parent_experience_ids: ["e1", "e2"] }
      ],
      facts: [
        { fact_id: "f1", fact_name: "Meeting Charles Babbage", occurred_at: "1833-06-05", experience_ids: ["e1"] },
        { fact_id: "f2", fact_name: "Translating Menabrea Paper", occurred_at: "1842-10-01", experience_ids: ["e2"] },
        { fact_id: "f3", fact_name: "Note G: Bernoulli Numbers Algorithm", occurred_at: "1843-07-10", experience_ids: ["e3"] },
        { fact_id: "f4", fact_name: "First Computer Program Publication", occurred_at: "1843-09-01", experience_ids: ["e3"] }
      ],
      links: [
        { link_id: "l1", link_name: "Influenced By Babbage", link_type: "relationship" },
        { link_id: "l2", link_name: "Published Algorithm", link_type: "achievement" }
      ]
    }
  },
  {
    fileName: "AlanTuringEnigma.hasm",
    title: "Alan Turing Cryptanalysis Model",
    model: {
      people: [
        { person_id: "pt1", person_name: "Alan Turing", birthday: "1912-06-23" },
        { person_id: "pt2", person_name: "Joan Clarke", birthday: "1917-06-24" }
      ],
      experiences: [
        { experience_id: "et1", experience_name: "Bletchley Park Station X", parent_experience_ids: [] },
        { experience_id: "et2", experience_name: "Hut 8 Enigma Decryption", parent_experience_ids: ["et1"] },
        { experience_id: "et3", experience_name: "Bombe Electromechanical Machine", parent_experience_ids: ["et1", "et2"] },
        { experience_id: "et4", experience_name: "ACE Computer Design", parent_experience_ids: ["et1"] }
      ],
      facts: [
        { fact_id: "ft1", fact_name: "Joining Government Code School", occurred_at: "1939-09-04", experience_ids: ["et1"] },
        { fact_id: "ft2", fact_name: "Bombe Initial Blueprint", occurred_at: "1939-12-15", experience_ids: ["et3"] },
        { fact_id: "ft3", fact_name: "First Victory Machine Installed", occurred_at: "1940-03-18", experience_ids: ["et3"] },
        { fact_id: "ft4", fact_name: "Naval Enigma Banburismus Method", occurred_at: "1941-05-10", experience_ids: ["et2"] },
        { fact_id: "ft5", fact_name: "Automatic Computing Engine Proposal", occurred_at: "1945-02-19", experience_ids: ["et4"] }
      ],
      links: [
        { link_id: "lt1", link_name: "Led Hut 8 Team", link_type: "collaboration" },
        { link_id: "lt2", link_name: "Designed Bombe", link_type: "breakthrough" }
      ]
    }
  }
];
