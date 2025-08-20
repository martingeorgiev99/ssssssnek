export interface SnakeSkin {
  head: string;
  body: string;
  name: string;
}

export const SNAKE_SKINS: Record<string, SnakeSkin> = {
  default: {
    name: "Classic",
    head: "#9ae6b4",
    body: "#68d391",
  },
  blue: {
    name: "Blue Ice",
    head: "#63b3ed",
    body: "#4299e1",
  },
  purple: {
    name: "Royal Python",
    head: "#b794f4",
    body: "#9f7aea",
  },
  fire: {
    name: "Fire Snake",
    head: "#fc8181",
    body: "#f56565",
  },
  gold: {
    name: "Golden Snake",
    head: "#fbd38d",
    body: "#f6ad55",
  },
  platinum: {
    name: "Platinum Prince",
    head: "#cbd5e0",
    body: "#a0aec0",
  },
  rainbow: {
    name: "Rainbow Serpent",
    head: "#f687b3",
    body: "#38b2ac",
  },
  toxic: {
    name: "Toxic Viper",
    head: "#48bb78",
    body: "#805ad5",
  },
  sunset: {
    name: "Sunset Python",
    head: "#ed8936",
    body: "#dd6b20",
  },
  cosmic: {
    name: "Cosmic Snake",
    head: "#667eea",
    body: "#764ba2",
  },
};
