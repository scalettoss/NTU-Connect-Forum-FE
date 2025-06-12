import CategoryPage from "@/components/category/CategoryPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Danh mục | NTU Connect",
    description: "Danh mục các chủ đề trên NTU Connect",
};

export default function Categories() {
    return <CategoryPage />;
}
