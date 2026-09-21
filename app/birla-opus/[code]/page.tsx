import { ShadePage, shadeMetadata, shadeStaticParams } from "@/components/ShadePage";
import type { Metadata } from "next";

export function generateStaticParams() {
  return shadeStaticParams("birla-opus");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return shadeMetadata("birla-opus", code);
}

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <ShadePage brand="birla-opus" code={code} />;
}
