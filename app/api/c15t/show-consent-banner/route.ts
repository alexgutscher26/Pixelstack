import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const headers = new Headers(request.headers);
  const language = headers.get("accept-language")?.split(",")[0] || "en";
  const countryCode = headers.get("x-c15t-country") || undefined;
  const regionCode = headers.get("x-c15t-region") || undefined;

  return NextResponse.json({
    showConsentBanner: true,
    branding: "c15t",
    jurisdiction: {
      message: "We use cookies to improve your experience",
      code: "GDPR",
    },
    location: {
      countryCode,
      regionCode,
    },
    translations: {
      language,
      translations: {
        common: {
          acceptAll: "Accept All",
          rejectAll: "Reject All",
          customize: "Customize",
          save: "Save",
        },
        cookieBanner: {
          title: "Cookie Preferences",
          description: "Manage your cookie preferences",
        },
        consentManagerDialog: {
          title: "Manage Cookie Preferences",
          description: "Customize your cookie preferences",
        },
        consentTypes: {
          necessary: {
            title: "Necessary",
            description: "Required for the website to function",
          },
          marketing: {
            title: "Marketing",
            description: "Help us improve our marketing",
          },
        },
      },
    },
  });
}

