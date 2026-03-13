import React from "react";
import {
  Instagram,
  Twitter,
  Youtube,
  Send,
  Globe,
  Github,
  ExternalLink
} from "lucide-react";

export const ICON_MAP: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-5 h-5" />,
  twitter: <Twitter className="w-5 h-5" />,
  youtube: <Youtube className="w-5 h-5" />,
  telegram: <Send className="w-5 h-5" />,
  github: <Github className="w-5 h-5" />,
  web: <Globe className="w-5 h-5" />,
  default: <ExternalLink className="w-5 h-5" />
};
