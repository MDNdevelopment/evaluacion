export interface Department {
  department_id: number;
  department_name: string;
}

export interface Position {
  position_id: number;
  position_name: string;
  department_id: number;
}

//Positions grouped by department id
export interface GroupedPositions {
  [key: number]: Position[];
}
