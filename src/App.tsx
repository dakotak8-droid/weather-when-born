/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, CloudSun, Share2, RefreshCw, Gift, Sparkles, Baby, Loader2, AlertCircle } from "lucide-react";

/**
 * Weather labels and moods mapping from Open-Meteo codes.
 */
const WEATHER_LABELS: Record<number, { label: string; emoji: string; mood: string }> = {
  0: { label: "Clear sky", emoji: "☀️", mood: "sunny" },
  1: { label: "Mainly clear", emoji: "🌤️", mood: "sunny" },
  2: { label: "Partly cloudy", emoji: "⛅", mood: "cloudy" },
  3: { label: "Overcast", emoji: "☁️", mood: "cloudy" },
  45: { label: "Fog", emoji: "🌫️", mood: "fog" },
  48: { label: "Depositing rime fog", emoji: "🌫️", mood: "fog" },
  51: { label: "Light drizzle", emoji: "🌦️", mood: "rain" },
  53: { label: "Moderate drizzle", emoji: "🌦️", mood: "rain" },
  55: { label: "Dense drizzle", emoji: "🌧️", mood: "rain" },
  56: { label: "Light freezing drizzle", emoji: "🌧️", mood: "rain" },
  57: { label: "Dense freezing drizzle", emoji: "🌧️", mood: "rain" },
  61: { label: "Slight rain", emoji: "🌧️", mood: "rain" },
  63: { label: "Moderate rain", emoji: "🌧️", mood: "rain" },
  65: { label: "Heavy rain", emoji: "🌧️", mood: "rain" },
  66: { label: "Light freezing rain", emoji: "🌧️", mood: "rain" },
  67: { label: "Heavy freezing rain", emoji: "🌧️", mood: "rain" },
  71: { label: "Slight snow fall", emoji: "❄️", mood: "snow" },
  73: { label: "Moderate snow fall", emoji: "❄️", mood: "snow" },
  75: { label: "Heavy snow fall", emoji: "❄️", mood: "snow" },
  77: { label: "Snow grains", emoji: "❄️", mood: "snow" },
  80: { label: "Slight rain showers", emoji: "🌦️", mood: "rain" },
  81: { label: "Moderate rain showers", emoji: "🌧️", mood: "rain" },
  82: { label: "Violent rain showers", emoji: "⛈️", mood: "storm" },
  85: { label: "Slight snow showers", emoji: "🌨️", mood: "snow" },
  86: { label: "Heavy snow showers", emoji: "🌨️", mood: "snow" },
  95: { label: "Thunderstorm", emoji: "⛈️", mood: "storm" },
  96: { label: "Thunderstorm with hail", emoji: "⛈️", mood: "storm" },
  99: { label: "Thunderstorm with heavy hail", emoji: "⛈️", mood: "storm" },
};

const RESULT_COPY: Record<string, { title: string; story: string; twist: string }> = {
  sunny: {
    title: "A bright little entrance",
    story: "The sky showed up in a good mood that day. Sunshine, soft drama, and the kind of light that feels suspiciously like a main-character arrival.",
    twist: "Basically: your baby did not arrive quietly. They arrived like a tiny celebrity.",
  },
  cloudy: {
    title: "A soft and thoughtful kind of day",
    story: "The weather kept things calm, cozy, and just a little mysterious. The sky was clearly setting the stage for a baby with depth, opinions, and excellent future side-eye.",
    twist: "Not flashy. Just iconic in a low-key way.",
  },
  rain: {
    title: "A rainy-day legend was born",
    story: "A little rain outside, a lot of emotion inside. The world may have been damp, but your family’s story got a brand-new center of gravity that day.",
    twist: "Tiny human. Big entrance. Slight chance of lifelong chaos.",
  },
  snow: {
    title: "Cold outside, unforgettable inside",
    story: "The weather brought the drama in fluffy form. It was the kind of day that feels frozen in time — which is perfect, because this is exactly the sort of moment families replay forever.",
    twist: "Snow on the street. Warmth in the heart. Snacks probably required.",
  },
  storm: {
    title: "The dramatic one has entered the chat",
    story: "Thunder, energy, weather with opinions — honestly, the sky understood the assignment. Some babies are born. Others make an entrance worthy of a full soundtrack.",
    twist: "This was not a subtle arrival. And frankly, why start now?",
  },
  fog: {
    title: "A mysterious little arrival",
    story: "The day came wrapped in haze and softness, like the weather itself knew something special was happening but wanted to keep the reveal cinematic.",
    twist: "Low visibility. Maximum emotional impact.",
  },
};

const PRODUCT_MATCH: Record<string, { title: string; description: string; cta: string; href: string }[]> = {
  sunny: [
    {
      title: "Funny Baby Tee for Little Sunshine Energy",
      description: "Perfect for babies who enter the world like they already own the room.",
      cta: "Shop sunny little legend styles",
      href: "#shop",
    },
    {
      title: "Funny Mug for Sleep-Deprived Parents",
      description: "Because sunshine babies still wake people up at 4:52 a.m.",
      cta: "See parent survival mugs",
      href: "#shop",
    },
  ],
  cloudy: [
    {
      title: "Cozy Baby Tee with Big Personality",
      description: "For tiny humans with calm faces and suspiciously strong opinions.",
      cta: "Browse cozy classics",
      href: "#shop",
    },
    {
      title: "Funny Fridge Magnet",
      description: "A small daily reminder that your child was born iconic, not average.",
      cta: "See funny magnets",
      href: "#shop",
    },
  ],
  rain: [
    {
      title: "Superhero Baby Tee",
      description: "For babies whose birth weather already hinted at dramatic plot development.",
      cta: "Explore superhero picks",
      href: "#shop",
    },
    {
      title: "Funny Parent Mug",
      description: "Pairs well with rain, memories, and reheated coffee.",
      cta: "See funny mugs",
      href: "#shop",
    },
  ],
  snow: [
    {
      title: "Funny Baby Tee for Cool Little Legends",
      description: "Cold forecast. Warm family chaos. Great outfit potential.",
      cta: "See winter-born favorites",
      href: "#shop",
    },
    {
      title: "Nursery Decor Gift",
      description: "For the kind of memory that deserves wall-worthy storytelling.",
      cta: "Browse decor ideas",
      href: "#shop",
    },
  ],
  storm: [
    {
      title: "Born-to-be-a-Legend Style",
      description: "For babies who arrived with thunder and have not lowered the volume since.",
      cta: "Shop dramatic arrivals",
      href: "#shop",
    },
    {
      title: "Funny Magnet or Mug",
      description: "Because some birth stories deserve to live on the fridge forever.",
      cta: "See giftable keepsakes",
      href: "#shop",
    },
  ],
  fog: [
    {
      title: "Soft, Playful Baby Tee",
      description: "For little ones who arrived quietly and then built a full personality empire.",
      cta: "Browse soft-story styles",
      href: "#shop",
    },
    {
      title: "Funny Keepsake Gift",
      description: "A sweet reminder of a beautifully mysterious day.",
      cta: "See keepsake ideas",
      href: "#shop",
    },
  ],
};

/**
 * Validates and parses a date string strictly in MM/DD/YYYY format.
 * Returns a YYYY-MM-DD string or null.
 */
function parseDate(input: string): string | null {
  const cleanInput = input.trim();
  const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = cleanInput.match(regex);
  
  if (!match) return null;

  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (isNaN(month) || isNaN(day) || isNaN(year)) return null;

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) return null;

  // Final check for valid date components (e.g. February 30th)
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  // Check if future
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) return null;

  const yyyy = year.toString();
  const mm = month.toString().padStart(2, '0');
  const dd = day.toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function average(numbers: number[]) {
  if (!numbers?.length) return null;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function pickMoodFromCode(code: number) {
  return WEATHER_LABELS[code]?.mood || "cloudy";
}

function resolveWeatherDescriptor(code: number) {
  return WEATHER_LABELS[code] || { label: "Unknown weather", emoji: "🌤️", mood: "cloudy" };
}

export default function App() {
  const [dateInput, setDateInput] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");
  const [result, setResult] = useState<any>(null);
  
  const resultRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to result when it appears
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  // Live validation for the date field (validated at block length)
  useEffect(() => {
    if (dateInput.length === 10) {
      const parsed = parseDate(dateInput);
      if (!parsed) {
        setDateError("Please enter a valid birth date in MM/DD/YYYY format.");
      } else {
        setDateError("");
      }
    } else {
      setDateError("");
    }
  }, [dateInput]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, "").slice(0, 8);
    
    let formatted = "";
    if (digits.length > 0) {
      const mm = digits.slice(0, 2);
      formatted += mm;
      
      if (digits.length > 2) {
        const dd = digits.slice(2, 4);
        formatted += "/" + dd;
        
        if (digits.length > 4) {
          const yyyy = digits.slice(4, 8);
          formatted += "/" + yyyy;
        }
      }
    }
    setDateInput(formatted);
  };

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDateError("");
    
    const normalizedDate = parseDate(dateInput);

    if (!normalizedDate) {
      setDateError("Please enter a valid birth date in MM/DD/YYYY format (e.g., 11/04/1988).");
      return;
    }

    if (!city.trim()) {
      setError("Please enter a city.");
      return;
    }

    setLoading(true);
    // Clear previous result to show loading state in the correct spot
    setResult(null);

    try {
      // Step 1: Geocoding with international and fallback supporting logic
      const trimmedCity = city.trim();
      const lowerCity = trimmedCity.toLowerCase();
      
      const searchTerms: string[] = [trimmedCity];
      
      // Known translated/native names of key international cities for fast local compatibility
      const translations: Record<string, string> = {
        "warszawa": "Warsaw",
        "warszawy": "Warsaw",
        "köln": "Cologne",
        "koeln": "Cologne",
        "praha": "Prague",
        "prag": "Prague",
        "wien": "Vienna",
        "roma": "Rome",
        "rom": "Rome",
        "milano": "Milan",
        "milan": "Milan",
        "firenze": "Florence",
        "florence": "Florence",
        "venezia": "Venice",
        "venedig": "Venice",
        "napoli": "Naples",
        "lisboa": "Lisbon",
        "lisbon": "Lisbon",
        "brussel": "Brussels",
        "bruxelles": "Brussels",
        "münchen": "Munich",
        "munchen": "Munich",
        "nürnberg": "Nuremberg",
        "nurmberg": "Nuremberg",
        "hannover": "Hanover",
        "københavn": "Copenhagen",
        "kopenhagen": "Copenhagen",
        "moskva": "Moscow",
        "kijev": "Kyiv",
        "kyiv": "Kyiv",
        "bukarest": "Bucharest",
        "bucurești": "Bucharest",
        "bucuresti": "Bucharest",
        "beograd": "Belgrade",
        "belgrad": "Belgrade",
        "sofia": "Sofia",
        "zagreb": "Zagreb",
        "budapest": "Budapest",
        "kraków": "Krakow",
        "krakow": "Krakow",
        "wrocław": "Wroclaw",
        "wroclaw": "Wroclaw",
        "gdańsk": "Gdansk",
        "gdansk": "Gdansk",
        "poznań": "Poznan",
        "poznan": "Poznan",
        "zürich": "Zurich",
        "zurich": "Zurich",
        "genève": "Geneva",
        "geneve": "Geneva",
        "göteborg": "Gothenburg",
        "goteborg": "Gothenburg",
        "tokio": "Tokyo",
        "tokyo": "Tokyo",
        "peking": "Beijing",
        "beijing": "Beijing",
        "seoul": "Seoul",
        "mumbai": "Mumbai",
        "bombay": "Mumbai",
        "kolkata": "Kolkata",
        "calcutta": "Kolkata",
        "krung thep": "Bangkok",
        "bangkok": "Bangkok",
        "saigon": "Ho Chi Minh City",
        "ho chi minh": "Ho Chi Minh City",
        "hanoi": "Hanoi",
        "cairo": "Cairo",
        "al-qahirah": "Cairo",
        "cape town": "Cape Town",
        "kaapstad": "Cape Town",
        "casablanca": "Casablanca",
        "dar el beida": "Casablanca",
        "algiers": "Algiers",
        "alger": "Algiers",
        "istanbul": "Istanbul",
        "athen": "Athens",
        "athena": "Athens",
        "athina": "Athens",
        "athens": "Athens",
        "yerushalayim": "Jerusalem",
        "al-quds": "Jerusalem",
        "jerusalem": "Jerusalem",
        "tel aviv": "Tel Aviv",
        "riyadh": "Riyadh",
        "ar-riyad": "Riyadh",
        "dubai": "Dubai",
        "ciudad de mexico": "Mexico City",
        "mexico city": "Mexico City",
        "bogotá": "Bogota",
        "bogota": "Bogota",
        "são paulo": "Sao Paulo",
        "sao paulo": "Sao Paulo",
        "rio de janeiro": "Rio de Janeiro",
        "brasília": "Brasilia",
        "brasilia": "Brasilia",
        "reykjavík": "Reykjavik",
        "reykjavik": "Reykjavik",
        "dublin": "Dublin",
        "baile atha cliath": "Dublin",
        "montréal": "Montreal",
        "montreal": "Montreal",
        "québec": "Quebec",
        "quebec": "Quebec",
      };

      if (translations[lowerCity]) {
        searchTerms.push(translations[lowerCity]);
      }

      // Convert German/European special chars
      const umlautCleaned = lowerCity
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss");
      if (umlautCleaned !== lowerCity && !searchTerms.includes(umlautCleaned)) {
        searchTerms.push(umlautCleaned);
      }

      const diacriticNormalized = trimmedCity
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (diacriticNormalized && diacriticNormalized !== trimmedCity && !searchTerms.includes(diacriticNormalized)) {
        searchTerms.push(diacriticNormalized);
      }

      // Extract raw city name if user searched via "City, Country"
      if (trimmedCity.includes(",")) {
        const firstPart = trimmedCity.split(",")[0].trim();
        if (firstPart && !searchTerms.includes(firstPart)) {
          searchTerms.push(firstPart);
          const firstPartLower = firstPart.toLowerCase();
          if (translations[firstPartLower]) {
            searchTerms.push(translations[firstPartLower]);
          }
        }
      }

      const uniqueSearchTerms = Array.from(new Set(searchTerms));
      let location = null;

      for (const term of uniqueSearchTerms) {
        try {
          const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=1&language=en&format=json`;
          const geoRes = await fetch(geoUrl);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData?.results?.[0]) {
              location = geoData.results[0];
              break;
            }
          }
        } catch {
          // Fall through to next term
        }

        try {
          const geoUrlFallback = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=1&format=json`;
          const geoResFallback = await fetch(geoUrlFallback);
          if (geoResFallback.ok) {
            const geoDataFallback = await geoResFallback.json();
            if (geoDataFallback?.results?.[0]) {
              location = geoDataFallback.results[0];
              break;
            }
          }
        } catch {
          // Fall through to next term
        }
      }

      if (!location) {
        throw new Error("Try the English city name, for example ‘Warsaw, Poland’.");
      }

      // Step 2: Historical Weather
      const weatherUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${location.latitude}&longitude=${location.longitude}&start_date=${normalizedDate}&end_date=${normalizedDate}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) throw new Error("Historical weather could not be loaded.");
      const weatherData = await weatherRes.json();

      const code = weatherData?.daily?.weather_code?.[0];
      const maxTemp = weatherData?.daily?.temperature_2m_max?.[0];
      const minTemp = weatherData?.daily?.temperature_2m_min?.[0];
      const precipitation = weatherData?.daily?.precipitation_sum?.[0];
      const meanTemp = average([minTemp, maxTemp].filter((v) => typeof v === "number"));

      const descriptor = resolveWeatherDescriptor(code);
      const mood = pickMoodFromCode(code);
      const copy = RESULT_COPY[mood];
      const products = PRODUCT_MATCH[mood] || PRODUCT_MATCH.cloudy;

      setResult({
        cityInput: city.trim(),
        date: normalizedDate,
        locationName: [location.name, location.admin1, location.country].filter(Boolean).join(", "),
        weatherLabel: descriptor.label,
        weatherEmoji: descriptor.emoji,
        mood,
        title: copy.title,
        story: copy.story,
        twist: copy.twist,
        tempC: typeof meanTemp === "number" ? Math.round(meanTemp) : null,
        tempMax: typeof maxTemp === "number" ? Math.round(maxTemp) : null,
        tempMin: typeof minTemp === "number" ? Math.round(minTemp) : null,
        precipitation: typeof precipitation === "number" ? precipitation : null,
        products,
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!result) return;
    const text = `${result.weatherEmoji} ${result.locationName} — ${formatDisplayDate(result.date)}. ${result.weatherLabel}. ${result.title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Baby Birth Weather Story",
          text,
          url: window.location.href,
        });
        return;
      } catch {
        // user cancelled share
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard.");
    } catch {
      alert(text);
    }
  }

  function resetForm() {
    setResult(null);
    setError("");
    setDateInput("");
    setCity("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const ExampleCard = ({ context = "intro" }: { context?: string; key?: any }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <Card className="overflow-hidden rounded-[3rem] border-0 bg-slate-900 text-white shadow-2xl relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="h-32 w-32" />
        </div>
        <CardContent className="p-10 sm:p-14 relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="rounded-2xl bg-amber-400/20 border border-amber-400/30 p-4">
              <Baby className="h-8 w-8 text-amber-400" />
            </div>
            <div>
              <Badge className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-black mb-1 px-4 py-1">EXAMPLE REVEAL</Badge>
              <p className="text-[10px] text-white/50 tracking-[0.3em] uppercase font-black">How it feels</p>
            </div>
          </div>

          <div className="space-y-8">
            <p className="text-xs font-mono text-white/60 tracking-[0.2em] uppercase font-bold">LONDON, ONTARIO • MAY 14, 2024</p>
            <div className="text-8xl">🌧️</div>
            <h2 className="text-4xl sm:text-5xl font-black leading-tight">A rainy-day legend was born</h2>
            <p className="text-xl sm:text-2xl leading-relaxed text-white/80 font-serif italic border-l-4 border-amber-400/30 pl-6">
              "A little rain outside, a lot of emotion inside. The world was damp, but your family’s story got a brand-new center of gravity that day."
            </p>
            <p className="text-xl font-black text-amber-300">
              "Tiny human. Big entrance. Slight chance of lifelong chaos."
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50 text-slate-900 font-sans">
      <header className="mx-auto max-w-6xl px-4 pt-10 pb-12 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm font-medium">Tiny date. Big memory.</Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-slate-900">
                What was the weather when your baby was born?
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600 sm:text-xl font-medium">
                Enter a birth date and city to reveal the weather from that day — then turn it into a sweet, funny little story worth sharing.
              </p>
            </div>

            <form onSubmit={handleLookup} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-amber-500" />
                    Birth date
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/DD/YYYY"
                      value={dateInput}
                      onChange={handleDateChange}
                      className={`h-12 rounded-2xl text-base transition-colors ${dateError ? 'border-rose-300 bg-rose-50/30' : 'focus:border-amber-400'}`}
                    />
                    {dateError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {dateError}
                      </motion.p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    Birth city & country
                  </label>
                  <Input
                    type="text"
                    placeholder="Toronto, Canada"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-12 rounded-2xl text-base focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center pt-2">
                <Button type="submit" disabled={loading} className="h-14 rounded-2xl px-10 text-lg font-bold bg-slate-900 hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5 text-amber-400" />}
                  Reveal the weather story
                </Button>
              </div>

              {error ? <p className="text-sm font-semibold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p> : null}
            </form>
          </div>

          <div className="w-full">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full animate-pulse-slow"
                >
                  <Card className="rounded-[3.0rem] border-0 bg-slate-900 text-white shadow-2xl overflow-hidden min-h-[450px] flex flex-col items-center justify-center text-center p-12">
                    <div className="relative mb-8">
                      <Loader2 className="h-16 w-16 animate-spin text-amber-400" />
                      <CloudSun className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white opacity-50" />
                    </div>
                    <h3 className="text-3xl font-bold">Checking the skies…</h3>
                    <p className="mt-4 max-w-sm text-lg text-white/70 leading-relaxed font-medium">
                      Rewinding time to find the exact moment your tiny legend arrived.
                    </p>
                  </Card>
                </motion.div>
              )}

              {!loading && result && (
                <motion.div
                  key="real"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <Card className="overflow-hidden rounded-[3rem] border-0 bg-slate-900 text-white shadow-2xl relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Sparkles className="h-32 w-32" />
                    </div>
                    <CardContent className="p-10 sm:p-14 relative z-10">
                      <div className="flex items-center gap-4 mb-10">
                        <div className="rounded-2xl bg-amber-400/20 border border-amber-400/30 p-4 animate-bounce-slow">
                          <Baby className="h-8 w-8 text-amber-400" />
                        </div>
                        <div>
                          <Badge className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-black mb-1 px-4 py-1">THE REVEAL</Badge>
                          <p className="text-[10px] text-white/50 tracking-[0.3em] uppercase font-black">How it feels</p>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <p className="text-xs font-mono text-white/60 tracking-[0.2em] uppercase font-bold">
                          {result.locationName.toUpperCase()} • {formatDisplayDate(result.date).toUpperCase()}
                        </p>
                        <div className="text-8xl">{result.weatherEmoji}</div>
                        
                        <div className="space-y-2">
                          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                            {result.weatherLabel} {result.tempC !== null ? `• ${result.tempC}°C` : ""}
                          </span>
                          <h2 className="text-4xl sm:text-5xl font-black leading-tight">{result.title}</h2>
                        </div>

                        <p className="text-xl sm:text-2xl leading-relaxed text-white/80 font-serif italic border-l-4 border-amber-400/30 pl-6">
                          "{result.story}"
                        </p>
                        <p className="text-xl font-black text-amber-300">
                          {result.twist}
                        </p>

                        <div className="pt-6 flex flex-col sm:flex-row gap-4">
                          <Button onClick={handleShare} className="h-14 rounded-2xl px-6 flex-1 text-base font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 border-none transition-all shadow-lg active:scale-95">
                            <Share2 className="mr-2 h-5 w-5" />
                            Share result
                          </Button>
                          <Button onClick={resetForm} variant="outline" className="h-14 rounded-2xl px-6 flex-1 text-base font-bold bg-white/10 text-white border-none hover:bg-white/20 transition-all active:scale-95">
                            <RefreshCw className="mr-2 h-5 w-5" />
                            Check another
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {!loading && !result && (
                <ExampleCard key="example" />
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-24">
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="shop"
              ref={resultRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              {/* SECTION 3 — SHOP THE STORY */}
              <section id="shop" className="space-y-12 pt-24 border-t border-slate-100/60 transition-all">
                <div className="text-center space-y-4">
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none px-6 py-2 rounded-full font-black text-xs tracking-widest uppercase">SHOP THE STORY</Badge>
                  <h3 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900">Entrance-worthy outfits.</h3>
                  <p className="max-w-2xl mx-auto text-2xl leading-relaxed text-slate-600 font-medium font-serif italic">
                    "Your baby didn’t just arrive — they made a statement."
                  </p>
                </div>

                <div className="grid gap-10 md:grid-cols-2 max-w-5xl mx-auto px-4">
                  {result.products.map((product: any) => (
                    <Card key={product.title} className="rounded-[3rem] border-slate-100 shadow-xl hover:shadow-2xl transition-all group overflow-hidden bg-white/50 backdrop-blur-sm">
                      <CardHeader className="pb-6 pt-12 px-10">
                        <CardTitle className="text-3xl font-black group-hover:text-amber-600 transition-colors leading-tight">{product.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="px-10 pb-12">
                        <p className="text-xl leading-relaxed text-slate-600 mb-10 font-medium">{product.description}</p>
                        <Button asChild className="h-16 rounded-2xl text-lg font-black px-10 bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all">
                          <a href={product.href}>{product.cta}</a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-slate-100 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-6xl px-4 py-20 flex flex-col items-center text-center gap-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 font-black text-slate-400 text-sm tracking-[0.4em] uppercase">
             <Baby className="h-5 w-5" /> Baby Birth Weather Story
          </div>
          <div className="max-w-xl space-y-8">
             <p className="text-[11px] font-black text-slate-300 leading-relaxed uppercase tracking-widest">
               Weather data provided by <a className="underline underline-offset-4 hover:text-slate-500 transition-colors" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo.com</a>
             </p>
             <p className="text-[11px] font-black text-slate-200 max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
               This app is a creative storytelling experience. Please verify critical birth data with official records.
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
