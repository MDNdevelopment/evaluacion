import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";

export function CategorySelector({
  setSelectedCategory,
  selectedPosition,
}: {
  departmentId: string;
  companyId: string;
  setSelectedCategory: any;
  selectedPosition: string | null;
}) {
  const [categories, setCategories] = useState<any[]>([]);

  const getCategories = async () => {
    const { data, error } = await supabase
      .from("positions_categories")
      .select("categories(*)")
      .eq("position_id", selectedPosition);

    if (error) {
      console.log(error.message);
      return;
    }
    console.log(data);
    setCategories(data);
    // const { data, error } = await supabase
    //   .from("categories")
    //   .select("name, id")
    //   .eq("company_id", companyId)
    //   .eq("department_id", departmentId);

    // if (error) {
    //   console.log(error.message);
    //   return;
    // }

    // if (data) {
    //   setCategories(data);
    // }
  };

  useEffect(() => {
    getCategories();
  }, [selectedPosition]);
  return (
    <Select
      disabled={selectedPosition === null}
      onValueChange={(e) => {
        console.log(e);
        setSelectedCategory(e);
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Seleccionar" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {categories.length > 0 ? (
            categories.map((category) => {
              console.log({ category });
              return (
                <SelectItem
                  className="cursor-pointer"
                  key={category.categories.id}
                  value={category.categories.id}
                >
                  {category.categories.name}
                </SelectItem>
              );
            })
          ) : (
            <SelectLabel>No hay categorías disponibles</SelectLabel>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
