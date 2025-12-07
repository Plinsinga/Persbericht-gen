export enum Step {
  Intro = 0,
  What = 1,
  Who = 2,
  When = 3,
  Where = 4,
  WhyHow = 5,
  Review = 6,
  Result = 7
}

export interface UploadedImage {
  mimeType: string;
  data: string; // base64 string
}

export interface PressReleaseData {
  what: string;
  who: string;
  when: string;
  where: string;
  whyHow: string;
  fileContent: string; // Content of uploaded playlist/bio text
  uploadedImages: UploadedImage[]; // Array of uploaded images
}

export interface QuestionConfig {
  step: Step;
  title: string;
  description: string;
  field: keyof PressReleaseData;
  placeholder: string;
  aiPromptContext: string;
}

export const QUESTIONS: QuestionConfig[] = [
  {
    step: Step.What,
    title: "Wat is het nieuws?",
    description: "Beschrijf de kern van het nieuws. Is het een nieuwe single, een album release, een festival of een concert?",
    field: "what",
    placeholder: "Bijv: Release van de nieuwe single 'Night Sky'...",
    aiPromptContext: "Focus op de nieuwswaarde. Wat wordt er gelanceerd of aangekondigd?"
  },
  {
    step: Step.Who,
    title: "Wie zijn de betrokkenen?",
    description: "Om welke artiest, band of organisatie gaat het? Voeg eventueel een korte bio toe.",
    field: "who",
    placeholder: "Bijv: DJ X, een opkomende techno producer uit Amsterdam...",
    aiPromptContext: "Wie is de afzender? Wat is hun achtergrond?"
  },
  {
    step: Step.When,
    title: "Wanneer vindt het plaats?",
    description: "Datum en tijd van de release of het event.",
    field: "when",
    placeholder: "Bijv: Vrijdag 24 november 2023, deuren open om 20:00...",
    aiPromptContext: "Tijdsgebonden details."
  },
  {
    step: Step.Where,
    title: "Waar vindt het plaats?",
    description: "Locatie, platform (Spotify/Apple Music) of fysiek adres.",
    field: "where",
    placeholder: "Bijv: Paradiso, Amsterdam of wereldwijd op alle streamingdiensten...",
    aiPromptContext: "Locatiegegevens."
  },
  {
    step: Step.WhyHow,
    title: "Hoe & Waarom?",
    description: "Wat is de achtergrond? Waarom nu? Hoe is het tot stand gekomen? Wat maakt dit uniek?",
    field: "whyHow",
    placeholder: "Bijv: Geïnspireerd door de underground scene van Berlijn...",
    aiPromptContext: "Achtergrondverhaal, inspiratie en 'human interest' hoek."
  }
];