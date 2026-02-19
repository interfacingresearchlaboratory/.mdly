import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mdly",
    short_name: "Mdly",
    description:
      "Open-source rich text editor built on Lexical and shadcn/ui. Distraction-free writing with typography control, slash commands, tables, images, and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
  };
}
