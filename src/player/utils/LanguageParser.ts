// Define a type for the specialCases object to ensure each key and value conforms to the expected structure
interface SpecialCases {
  [key: string]: string;
}

// Language parser utility to convert language codes to human-readable names
export function LanguageParser(
  locale: string,
  userLanguage: string = "en",
): string | undefined {
  const specialCases: SpecialCases = {
    mul: "Multiple Languages",
    und: "Default",
    zxx: "Not applicable",
    mis: "Miscellaneous", // Typo corrected in previous example, should only declare once
    art: "Constructed", // Artificially created languages
    "qaa-qtz": "Reserved for local use", // Private use range
    sgn: "Sign Languages",
    cpe: "English-based Creoles and Pidgins",
    cpf: "French-based Creoles and Pidgins",
    cpp: "Portuguese-based Creoles and Pidgins",
  };

  // Handle special language codes
  if (locale in specialCases) {
    return specialCases[locale];
  }

  // Use Intl.DisplayNames API if available for up-to-date language translations
  try {
    const languageNames = getLanguageNames(locale);
    const language = languageNames.of(locale);
    if (language) {
      return capitalizeFirstLetter(language);
    }
  } catch (error) {
    console.error(`Error translating language code: ${error}`);
    return `Unrecognized (${locale})`; // Fallback to unrecognized language
  }
}

// Helper to get Intl.DisplayNames instance with caching for performance
const displayNameCache: Record<string, Intl.DisplayNames> = {};
function getLanguageNames(userLanguage: string): Intl.DisplayNames {
  if (!displayNameCache[userLanguage]) {
    displayNameCache[userLanguage] = new Intl.DisplayNames([userLanguage], {
      type: "language",
    });
  }
  return displayNameCache[userLanguage];
}

// Helper to capitalize the first letter of a string
function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
