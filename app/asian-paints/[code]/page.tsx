import { ShadePage, shadeMetadata, shadeStaticParams } from "@/components/ShadePage";
import type { Metadata } from "next";

export function generateStaticParams() {
  return shadeStaticParams("asian-paints");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return shadeMetadata("asian-paints", code);
}

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <ShadePage brand="asian-paints" code={code} />;
}
