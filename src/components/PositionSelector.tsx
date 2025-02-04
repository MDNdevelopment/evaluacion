import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NumberDomain } from "recharts/types/util/types";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";

export function PositionSelector({
  departmentId,
  companyId,
  setSelectedPosition,
}: {
  departmentId: string;
  companyId: string;
  setSelectedPosition: any;
}) {
  const [positions, setPositions] = useState<any[]>([]);

  const getPositions = async () => {
    const { data, error } = await supabase
      .from("positions")
      .select("name, id")
      .eq("company_id", companyId)
      .eq("department_id", departmentId);

    if (error) {
      console.log(error.message);
      return;
    }

    if (data) {
      setPositions(data);
    }
  };

  useEffect(() => {
    getPositions();
  }, [departmentId]);
  return (
    <Select
      onValueChange={(e) => {
        setSelectedPosition(e);
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Seleccionar" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {positions.length > 0 ? (
            positions.map((position) => {
              return (
                <SelectItem
                  className="cursor-pointer"
                  key={position.id}
                  value={position.id}
                >
                  {position.name}
                </SelectItem>
              );
            })
          ) : (
            <SelectLabel>No hay cargos disponibles</SelectLabel>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
