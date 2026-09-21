import { BrandIndexPage, brandMetadata } from "@/components/BrandIndexPage";

export const metadata = brandMetadata("asian-paints");

export default function AsianPaintsPage() {
  return <BrandIndexPage brand="asian-paints" />;
}
