import {
  FaLinkedin,
  FaTiktok,
  FaInstagram,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Socials() {
  return (
    <>
      {siteConfig.links.x && (
        <Link href={siteConfig.links.x} target="_blank">
          <FaXTwitter className="w-6 h-6 md:w-5 md:h-5" />
        </Link>
      )}
      {siteConfig.links.linkedin && (
        <Link href={siteConfig.links.linkedin} target="_blank">
          <FaLinkedin className="w-6 h-6 md:w-5 md:h-5" />
        </Link>
      )}
      {siteConfig.links.tiktok && (
        <Link href={siteConfig.links.tiktok} target="_blank">
          <FaTiktok className="w-6 h-6 md:w-5 md:h-5" />
        </Link>
      )}
      {siteConfig.links.instagram && (
        <Link href={siteConfig.links.instagram} target="_blank">
          <FaInstagram className="w-6 h-6 md:w-5 md:h-5" />
        </Link>
      )}
    </>
  );
}
