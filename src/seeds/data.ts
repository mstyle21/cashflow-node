export const USER_ROLES: { name: string }[] = [{ name: "user" }, { name: "admin" }];

export const USERS: { email: string; password: string; role: string }[] = [
  { email: "admin@cashflow.com", password: "cashflow", role: "admin" },
  { email: "user@cashflow.com", password: "cashflow", role: "user" },
];

export const BASE_CATEGORIES: { name: string; keywords: string; childs: { name: string; keywords: string }[] }[] = [
  {
    name: "Cheltuieli cu locuinta",
    keywords: "",
    childs: [
      { name: "Telefon / Cablu TV / Internet", keywords: "telefon, tv, cablu, internet, net" },
      { name: "Electricitate", keywords: "curent, electric, electricitate" },
      { name: "Gaze", keywords: "gaz, gaze" },
      { name: "Chirie", keywords: "chirie" },
      { name: "Apa si canalizare", keywords: "apa, canalizare" },
      { name: "Asociatie", keywords: "asociatie" },
      { name: "Produse gospodaresti", keywords: "produse gospodaresti, gospodarie" },
      { name: "Intretinere si reparatii", keywords: "interetinere, reparatii" },
      { name: "Ridicare gunoi", keywords: "gunoi, ridicare gunoi" },
      { name: "Altele", keywords: "" },
    ],
  },

  {
    name: "Transport",
    keywords: "",
    childs: [
      { name: "Tramvai / Autobuz / Taxi", keywords: "tramvai, autobuz, taxi, bilet" },
      { name: "Carburant", keywords: "carburant, benzina, motorina, gaz" },
      { name: "Intretinere", keywords: "intretinere, reparatii" },
      { name: "Altele", keywords: "" },
    ],
  },
  {
    name: "Alimente",
    keywords: "",
    childs: [
      { name: "Bauturi", keywords: "bauturi, suc, apa" },
      { name: "Fructe & legume", keywords: "fructe, legume" },
      { name: "Carne & mezeluri", keywords: "carne, mezeluri" },
      { name: "Panificatie", keywords: "panificatie" },
      { name: "Lactate", keywords: "lactate" },
      { name: "Dulciuri", keywords: "dulciuri" },
      { name: "Snacks", keywords: "snacks, chips" },
      { name: "Alimente pentru casa", keywords: "alimente, casa" },
      { name: "Mese in oras", keywords: "fastfood, oras, bautura, mancare" },
      { name: "Altele", keywords: "" },
    ],
  },
  {
    name: "Ingrijire personala",
    keywords: "",
    childs: [
      { name: "Medicate", keywords: "medical, medicamente" },
      { name: "Salon", keywords: "tuns, vopsit, machiaj, manichiura, pedichiura" },
      { name: "Imbracaminte", keywords: "imbracaminte, haine, caciula, ciorapi, bluza, pantaloni, rochie" },
      { name: "Incaltaminte", keywords: "incaltaminte, adidasi, cizme, slapi" },
      { name: "Club fitness", keywords: "club, fitness, sala" },
      { name: "Accesorii", keywords: "accesorii, cercei, inel" },
      { name: "Altele", keywords: "" },
    ],
  },
  {
    name: "Taxe",
    keywords: "",
    childs: [
      { name: "Impozite", keywords: "impozit" },
      { name: "Altele", keywords: "" },
    ],
  },
  {
    name: "Divertisment",
    keywords: "",
    childs: [
      { name: "Carti", keywords: "carti" },
      { name: "Hobby", keywords: "hobby" },
      { name: "Biliard / Bowling", keywords: "biliard, bowling" },
      { name: "Teatru / Cinema", keywords: "cinema, teatru" },
      { name: "Altele", keywords: "" },
    ],
  },
  {
    name: "Cadouri / donatii",
    keywords: "",
    childs: [
      { name: "Cadou", keywords: "cadou" },
      { name: "Donatie", keywords: "donatie" },
      { name: "Altele", keywords: "" },
    ],
  },
  {
    name: "Economii / investitii",
    keywords: "",
    childs: [
      { name: "Cont de pensii", keywords: "pensie" },
      { name: "Cont de investitii", keywords: "investitii" },
      { name: "Discount / Voucher", keywords: "discount, voucher" },
      { name: "Altele", keywords: "" },
    ],
  },
  {
    name: "Imprumuturi / rate",
    keywords: "",
    childs: [
      { name: "Rate", keywords: "rata" },
      { name: "Imprumuturi", keywords: "imprumut" },
      { name: "Altele", keywords: "" },
    ],
  },
];
