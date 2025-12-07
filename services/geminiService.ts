import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PressReleaseData } from "../types";

// Initialize the API client
// Note: process.env.API_KEY is expected to be available in the environment
const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const MODEL_TEXT = 'gemini-2.5-flash';
const MODEL_IMAGE = 'gemini-2.5-flash-image';

/**
 * Helper to construct content parts with optional images
 * PLACES IMAGES FIRST (Best practice)
 */
const constructParts = (textPrompt: string, data?: PressReleaseData) => {
    const parts: any[] = [];
    
    // Images first
    if (data && data.uploadedImages && data.uploadedImages.length > 0) {
        data.uploadedImages.forEach(img => {
            if (img.data && img.mimeType) {
                parts.push({
                    inlineData: {
                        mimeType: img.mimeType,
                        data: img.data
                    }
                });
            }
        });
    }

    // Text last
    parts.push({ text: textPrompt });
    
    return parts;
};

/**
 * Generates suggestions for a specific question in the wizard.
 */
export const getSuggestions = async (
  field: string,
  currentValue: string,
  fullContext: PressReleaseData
): Promise<string> => {
  try {
    const ai = getAIClient();
    
    let contextString = "";
    if (fullContext.fileContent) {
        contextString += `CONTEXT DOCUMENT (Bio/Info): \n${fullContext.fileContent}\n\n`;
    }
    
    // Add already answered questions to context
    contextString += `HUIDIGE ANTWOORDEN:\n`;
    if (fullContext.what) contextString += `- Wat: ${fullContext.what}\n`;
    if (fullContext.who) contextString += `- Wie: ${fullContext.who}\n`;
    if (fullContext.when) contextString += `- Wanneer: ${fullContext.when}\n`;
    if (fullContext.where) contextString += `- Waar: ${fullContext.where}\n`;

    const prompt = `
      ${contextString}
      
      TAAK:
      De gebruiker is een persbericht aan het schrijven voor een muziekevent of release.
      De gebruiker zit vast bij de vraag over: "${field}".
      Het huidige (incomplete) antwoord is: "${currentValue}".
      
      (Indien er afbeeldingen zijn geüpload, gebruik de visuele informatie hieruit ook als context, bijvoorbeeld voor een playlist of sfeer impressie).

      Geef 3 korte, puntsgewijze suggesties of inspiratiepunten die de gebruiker kan gebruiken om deze vraag te beantwoorden. 
      Baseer je op de context (indien aanwezig) of verzin plausibele suggesties voor een muziek-persbericht.
      Schrijf direct tegen de gebruiker. Houd het kort.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: { parts: constructParts(prompt, fullContext) },
    });

    return response.text || "Geen suggesties beschikbaar.";
  } catch (error: any) {
    console.error("Error getting suggestions:", error);
    return `Kan geen suggesties ophalen: ${error.message || 'Onbekende fout'}`;
  }
};

/**
 * Generates the full press release based on collected data.
 */
export const generatePressReleaseText = async (data: PressReleaseData): Promise<string> => {
  try {
    const ai = getAIClient();

    const prompt = `
      Je bent een senior copywriter gespecialiseerd in de muziekindustrie en events.
      
      OPDRACHT:
      Maak een strak opgemaakt Markdown-document (Persbericht) voor: ${data.what}.

      ONDERDELEN:
      1. KOP (Creatieve titel)
      2. LEAD (De 5 W's in het kort, vetgedrukt of cursief)
      3. HET VERHAAL (Achtergrond, waarom nu, sfeer, quotes)
      4. PRAKTISCHE DETAILS (Gebruik een tabel of lijst voor Datum, Tijd, Locatie, Tickets)
      5. OVER DE ARTIEST/ORGANISATIE (Boilerplate)
      6. CONTACT (Placeholder)

      INFORMATIE VAN GEBRUIKER:
      - WAT: ${data.what}
      - WIE: ${data.who}
      - WANNEER: ${data.when}
      - WAAR: ${data.where}
      - HOE & WAAROM: ${data.whyHow}
      
      EXTRA CONTEXT (tekst): ${data.fileContent || "Geen"}
      EXTRA CONTEXT (beeld): Zie bijlagen (gebruik sfeer/inhoud indien aanwezig).

      STIJLRICHTLIJNEN VOOR MARKDOWN:
      - Gebruik duidelijke headings (# voor Titel, ## voor secties, ### voor subsecties).
      - Voeg overzichtelijke bullet points toe waar logisch (bijv. voor features, setlist, of redenen).
      - Gebruik geneste lijstjes voor details.
      - Gebruik **vette tekst** voor belangrijke namen, data, locaties en kernwoorden.
      - Voeg blokquotes (>) toe voor quotes of de belangrijkste 'hook'.
      - Houd de layout luchtig en goed scanbaar (gebruik witregels).
      - Voeg waar passend een Markdown-tabel toe (bijvoorbeeld voor tourdata of ticketprijzen).
      - Gebruik geen overbodige tekst: kort, UX-gericht en helder.
      - Taal: Nederlands.
      
      Output als pure Markdown zonder extra uitleg. Sluit af met "EINDE PERSBERICHT".
    `;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: { parts: constructParts(prompt, data) },
    });

    return response.text || "Kon geen persbericht genereren.";
  } catch (error: any) {
    console.error("Error generating press release:", error);
    return `Fout bij het genereren van het persbericht.\n\nFoutmelding: ${error.message || JSON.stringify(error)}\n\nProbeer het opnieuw of controleer je uploads.`;
  }
};

/**
 * Refines the existing press release text based on user instructions.
 */
export const refinePressReleaseText = async (currentText: string, instruction: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      Je bent een senior copywriter / editor.
      
      HUIDIGE TEKST (Markdown):
      ${currentText}
      
      INSTRUCTIE VAN DE GEBRUIKER:
      ${instruction}
      
      OPDRACHT:
      Herschrijf de tekst (of delen ervan) om te voldoen aan de instructie.
      
      STIJLRICHTLIJNEN:
      - Behoud de strakke Markdown opmaak (Headings, Bullets, **Vet**, > Quotes).
      - Zorg dat tabellen behouden blijven of toegevoegd worden waar relevant.
      - Houd de layout luchtig.
      - Sluit af met "EINDE PERSBERICHT".
      
      Output alleen de volledige, aangepaste Markdown tekst.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: { parts: [{ text: prompt }] },
    });

    return response.text || currentText;
  } catch (error: any) {
    console.error("Error refining text:", error);
    return `${currentText}\n\n[Fout bij aanpassen: ${error.message}]`;
  }
};

/**
 * Generates an image based on the press release context (Poster style).
 */
export const generatePressImage = async (data: PressReleaseData): Promise<string | null> => {
  try {
    const ai = getAIClient();

    // Context for the image prompt
    const context = `
      Artist: ${data.who}
      Event/Release: ${data.what}
      Date/Time: ${data.when}
      Location: ${data.where}
      Vibe/Backstory: ${data.whyHow}
      Files/Playlist content: ${data.fileContent ? data.fileContent : "No specific text info"}
      
      Reference Images provided: ${data.uploadedImages.length > 0 ? "Yes, see attached." : "No."}
    `;

    const promptRefinementPrompt = `
        Create a detailed image generation prompt for a music concert/release POSTER based on the provided info and attached images (if any).
        
        CONTEXT INFO:
        ${context}
        
        REQUIREMENTS:
        - Type: Professional Music Poster / Flyer.
        - VISUAL STYLE: Festival atmosphere, live music stage, pop venue, energetic lighting, concert photography style or high-end graphic design.
        - MUST INCLUDE VISIBLE TEXT ELEMENTS: 
            1. Artist Name: "${data.who}"
            2. Date & Time: "${data.when}"
            3. Location: "${data.where}"
        - Include a visual element that clearly looks like a QR code (scannable look).
        - Include a text list or graphic element representing a 'playlist' or 'setlist'. If the attached images contain a playlist, extract 2-3 song titles to feature on the poster.
        - Artistic style: Matches the vibe described but emphasized towards a LIVE EVENT / FESTIVAL / POP STAGE setting.
        - Composition: Vertical poster format, bold typography, high contrast for text readability.
        - Output: JUST the English prompt for the image generator.
    `;

    const promptRefinement = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: { parts: constructParts(promptRefinementPrompt, data) }
    });
    
    const imagePrompt = promptRefinement.text || `A music poster for ${data.who}, ${data.what}, at ${data.where} on ${data.when}. distinctive typography, festival style, live stage, qr code element, setlist, text info`;

    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [{ text: imagePrompt }]
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

/**
 * Generates a single-page promotional website code (HTML/CSS).
 */
export const generateEventWebsite = async (data: PressReleaseData): Promise<string> => {
  try {
    const ai = getAIClient();

    const prompt = `
      Je bent een expert frontend developer.
      
      CONTEXT:
      Maak een moderne, responsieve 'single-page' promotie website voor een muziekevent of release.
      Het design moet 'dark mode', strak en professioneel zijn (denk aan Resident Advisor of Spotify landingspagina's).
      
      DATA:
      - Titel: ${data.what}
      - Artiest/Organisatie: ${data.who}
      - Datum: ${data.when}
      - Locatie: ${data.where}
      - Info: ${data.whyHow}
      
      TECHNISCHE EISEN:
      1. Gebruik HTML5.
      2. Gebruik Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
      3. Gebruik Google Fonts (Inter of Roboto).
      4. Zorg voor een 'Hero' sectie met een placeholder voor een achtergrondafbeelding (gebruik een donkere placeholder color).
      5. Zorg voor een duidelijke sectie met de datum, tijd en locatie.
      6. Voeg een placeholder toe voor een 'Ticket' of 'Pre-save' knop.
      7. Voeg een footer toe.
      8. Geef ALLEEN de rauwe HTML code terug. Geen markdown blocks (\`\`\`), geen uitleg. Begin direct met <!DOCTYPE html>.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: { parts: [{ text: prompt }] },
    });

    let code = response.text || "";
    // Clean up potential markdown formatting if the model disregards instructions
    code = code.replace(/```html/g, '').replace(/```/g, '');
    return code;
  } catch (error) {
    console.error("Error generating website:", error);
    return "<!-- Fout bij het genereren van de website -->";
  }
};
