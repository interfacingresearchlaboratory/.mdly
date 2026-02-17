import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
	const pages = source.getPages();
	
	const pageUrls = pages.map((page) => ({
		url: `${siteConfig.url}${page.url}`,
		lastModified: new Date(),
		changeFrequency: "weekly" as const,
		priority: page.url === "/" ? 1 : 0.8,
	}));

	return [
		{
			url: siteConfig.url,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		...pageUrls,
	];
}
