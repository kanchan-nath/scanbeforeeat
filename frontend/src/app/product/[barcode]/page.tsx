import { ProductClient } from "./ProductClient";

export async function generateStaticParams() {
  return [
    { barcode: "8901058852331" },
    { barcode: "7321461144417" },
    { barcode: "0855238004128" },
    { barcode: "028400064088" },
  ];
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ barcode: string }>;
}) {
  const { barcode } = await params;
  return <ProductClient barcode={barcode} />;
}
